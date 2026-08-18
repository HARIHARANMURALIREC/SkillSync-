import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import api, { getApiErrorMessage } from '../services/api';
import { theme } from '../theme';
import { ChatMessage } from '../types';

const STARTER_PROMPTS = [
  'What should I focus on this week?',
  'Explain my biggest skill gap',
  'How do I prepare for a reassessment?',
];

export const CoachChatScreen: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const listRef = useRef<FlatList>(null);

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
    } catch (err) {
      setError(getApiErrorMessage(err, 'Failed to get a response from the coach.'));
    } finally {
      setLoading(false);
    }
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
      {messages.length === 0 ? (
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.xl,
  },
  emptyTitle: {
    ...theme.typography.h2,
    color: theme.colors.cream,
    marginBottom: theme.spacing.sm,
  },
  emptySubtitle: {
    ...theme.typography.body,
    color: theme.colors.muted,
    textAlign: 'center',
    marginBottom: theme.spacing.xl,
  },
  prompts: {
    width: '100%',
    gap: theme.spacing.sm,
  },
  promptButton: {
    padding: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  promptText: {
    ...theme.typography.bodySmall,
    color: theme.colors.cream,
    textAlign: 'center',
  },
  messageList: {
    padding: theme.spacing.lg,
    gap: theme.spacing.md,
  },
  messageBubble: {
    maxWidth: '85%',
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    marginBottom: theme.spacing.sm,
  },
  userBubble: {
    alignSelf: 'flex-end',
    backgroundColor: theme.colors.gold.DEFAULT,
  },
  coachBubble: {
    alignSelf: 'flex-start',
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
    flexDirection: 'row',
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
    backgroundColor: theme.colors.gold.DEFAULT,
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.lg,
    justifyContent: 'center',
  },
  sendDisabled: {
    opacity: 0.5,
  },
  sendText: {
    ...theme.typography.button,
    color: theme.colors.ink,
  },
});
