import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import api, {
  clearCoachHistory,
  getApiErrorMessage,
  getCoachHistory,
  getWeeklyPlan,
} from '../services/api';
import { AppTheme } from '../theme';
import { useStyles } from '../theme/useStyles';
import { useTheme } from '../context/ThemeContext';
import { ChatMessage, WeeklyPlanData } from '../types';
import { useProgress } from '../context/ProgressContext';

const STARTER_PROMPTS = [
  'What should I focus on this week?',
  'Explain my biggest skill gap',
  'How do I prepare for a reassessment?',
];

const createStyles = (theme: AppTheme) => ({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    padding: theme.spacing.xl,
  },
  emptyTitle: {
    ...theme.typography.h2,
    color: theme.colors.cream,
    fontWeight: '800' as const,
    marginBottom: theme.spacing.sm,
  },
  emptySubtitle: {
    ...theme.typography.body,
    color: theme.colors.muted,
    textAlign: 'center' as const,
    marginBottom: theme.spacing.xl,
  },
  prompts: {
    width: '100%' as const,
    gap: theme.spacing.sm,
  },
  promptButton: {
    padding: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: `${theme.colors.accent}55`,
    shadowColor: theme.colors.neon,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },
  promptText: {
    ...theme.typography.bodySmall,
    color: theme.colors.accent,
    fontWeight: '600' as const,
    textAlign: 'center' as const,
  },
  messageList: {
    padding: theme.spacing.lg,
    gap: theme.spacing.md,
  },
  messageBubble: {
    maxWidth: '85%' as const,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    marginBottom: theme.spacing.sm,
  },
  userBubble: {
    alignSelf: 'flex-end' as const,
    backgroundColor: theme.colors.accent,
    shadowColor: theme.colors.neon,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 4,
  },
  coachBubble: {
    alignSelf: 'flex-start' as const,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  messageText: {
    ...theme.typography.body,
    lineHeight: 22,
  },
  userText: {
    color: theme.colors.ink,
    fontWeight: '600' as const,
  },
  coachText: {
    color: theme.colors.cream,
  },
  errorText: {
    ...theme.typography.bodySmall,
    color: theme.colors.error,
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.sm,
  },
  inputRow: {
    flexDirection: 'row' as const,
    padding: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    backgroundColor: theme.colors.ink,
    gap: theme.spacing.sm,
  },
  input: {
    flex: 1,
    ...theme.typography.body,
    color: theme.colors.cream,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    minHeight: 44,
  },
  sendButton: {
    backgroundColor: theme.colors.accent,
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.lg,
    justifyContent: 'center' as const,
    shadowColor: theme.colors.neon,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3,
  },
  sendDisabled: {
    opacity: 0.5,
  },
  sendText: {
    ...theme.typography.button,
    color: theme.colors.ink,
  },
  planBanner: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    backgroundColor: `${theme.colors.violet}10`,
  },
  planBannerText: {
    ...theme.typography.bodySmall,
    color: theme.colors.muted,
  },
  planBannerFocus: {
    color: theme.colors.violet,
    fontWeight: '700' as const,
  },
  headerRow: {
    flexDirection: 'row' as const,
    justifyContent: 'flex-end' as const,
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.sm,
  },
  clearButton: {
    paddingVertical: theme.spacing.xs,
    paddingHorizontal: theme.spacing.sm,
  },
  clearText: {
    ...theme.typography.caption,
    color: theme.colors.rose,
    fontWeight: '600' as const,
  },
});

export const CoachChatScreen: React.FC<{ route?: { params?: { starter?: string } } }> = ({
  route,
}) => {
  const { refreshProgress } = useProgress();
  const { theme } = useTheme();
  const styles = useStyles(createStyles);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [weeklyPlan, setWeeklyPlan] = useState<WeeklyPlanData | null>(null);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [booting, setBooting] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const listRef = useRef<FlatList>(null);
  const starterSent = useRef(false);

  useEffect(() => {
    const load = async () => {
      try {
        const [history, plan] = await Promise.all([
          getCoachHistory().catch(() => ({ messages: [] })),
          getWeeklyPlan().catch(() => null),
        ]);
        setMessages(history.messages || []);
        setWeeklyPlan(plan);
      } finally {
        setBooting(false);
      }
    };
    load();
  }, []);

  useEffect(() => {
    if (messages.length > 0) {
      listRef.current?.scrollToEnd({ animated: true });
    }
  }, [messages, loading]);

  const sendMessage = async (text?: string) => {
    const content = (text || input).trim();
    if (!content || loading) return;

    const userMessage: ChatMessage = { role: 'user', content };
    const nextMessages = [...messages, userMessage];
    setMessages(nextMessages);
    setInput('');
    setLoading(true);
    setError(null);

    try {
      const response = await api.post(
        '/api/chat',
        { messages: nextMessages },
        { timeout: 90000 }
      );
      setMessages([...nextMessages, { role: 'assistant', content: response.data.reply }]);
      refreshProgress().catch(() => {});
    } catch (err) {
      setError(getApiErrorMessage(err, 'Failed to get a response from the coach.'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const starter = route?.params?.starter;
    if (starter && !booting && !starterSent.current && messages.length === 0) {
      starterSent.current = true;
      sendMessage(starter);
    }
  }, [booting, route?.params?.starter, messages.length]);

  const handleClear = () => {
    Alert.alert('Clear conversation', 'Remove your coach chat history?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Clear',
        style: 'destructive',
        onPress: async () => {
          try {
            await clearCoachHistory();
            setMessages([]);
          } catch (err) {
            setError(getApiErrorMessage(err, 'Could not clear history.'));
          }
        },
      },
    ]);
  };

  const renderMessage = ({ item }: { item: ChatMessage }) => (
    <View
      style={[
        styles.messageBubble,
        item.role === 'user' ? styles.userBubble : styles.coachBubble,
      ]}
    >
      <Text
        style={[
          styles.messageText,
          item.role === 'user' ? styles.userText : styles.coachText,
        ]}
      >
        {item.content}
      </Text>
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={90}
    >
      {messages.length > 0 && (
        <View style={styles.headerRow}>
          <TouchableOpacity style={styles.clearButton} onPress={handleClear}>
            <Text style={styles.clearText}>Clear conversation</Text>
          </TouchableOpacity>
        </View>
      )}
      {weeklyPlan?.focus ? (
        <View style={styles.planBanner}>
          <Text style={styles.planBannerText}>
            <Text style={styles.planBannerFocus}>This week: </Text>
            {weeklyPlan.focus}
          </Text>
        </View>
      ) : null}
      {booting ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptySubtitle}>Loading coach…</Text>
        </View>
      ) : messages.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>Career Coach</Text>
          <Text style={styles.emptySubtitle}>
            Ask about your gaps, learning path, and next steps.
          </Text>
          <View style={styles.prompts}>
            {STARTER_PROMPTS.map((prompt) => (
              <TouchableOpacity
                key={prompt}
                style={styles.promptButton}
                onPress={() => sendMessage(prompt)}
              >
                <Text style={styles.promptText}>{prompt}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      ) : (
        <FlatList
          ref={listRef}
          data={messages}
          keyExtractor={(_, index) => String(index)}
          renderItem={renderMessage}
          contentContainerStyle={styles.messageList}
          ListFooterComponent={
            loading ? (
              <View style={[styles.messageBubble, styles.coachBubble]}>
                <Text style={[styles.messageText, styles.coachText]}>Thinking…</Text>
              </View>
            ) : null
          }
        />
      )}

      {error && <Text style={styles.errorText}>{error}</Text>}

      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          value={input}
          onChangeText={setInput}
          placeholder="Ask your coach…"
          placeholderTextColor={theme.colors.text.secondary}
          editable={!loading}
          onSubmitEditing={() => sendMessage()}
          returnKeyType="send"
        />
        <TouchableOpacity
          style={[styles.sendButton, (!input.trim() || loading) && styles.sendDisabled]}
          onPress={() => sendMessage()}
          disabled={!input.trim() || loading}
        >
          <Text style={styles.sendText}>Send</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};
