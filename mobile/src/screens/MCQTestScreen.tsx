import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { LoadingScreen } from '../components/LoadingScreen';
import api from '../services/api';
import { theme } from '../theme';

interface MCQTestScreenProps {
  navigation: any;
  route: {
    params: {
      skillName: string;
    };
  };
}

interface Question {
  id: number;
  question_text: string;
  options: Array<{ id: number; text: string }>;
  difficulty: number;
}

export const MCQTestScreen: React.FC<MCQTestScreenProps> = ({ navigation, route }) => {
  const { skillName } = route.params;
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    try {
      const response = await api.get(`/api/assessment/questions/${skillName}`);
      setQuestions(response.data);
    } catch (error) {
      console.error('Failed to fetch questions:', error);
      Alert.alert('Error', 'Failed to load questions');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const handleAnswer = (questionId: number, optionId: number) => {
    setAnswers({ ...answers, [questionId]: optionId });
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleSubmit = async () => {
    const unansweredQuestions = questions.filter(
      (q) => !answers[q.id] && answers[q.id] !== 0
    );

    if (unansweredQuestions.length > 0) {
      Alert.alert(
        'Unanswered Questions',
        `You have ${unansweredQuestions.length} unanswered question(s). Are you sure you want to submit?`,
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Submit', onPress: submitAnswers },
        ]
      );
    } else {
      submitAnswers();
    }
  };

  const submitAnswers = async () => {
    setSubmitting(true);
    try {
      const response = await api.post('/api/assessment/submit', {
        skill_name: skillName,
        answers: Object.keys(answers).reduce((acc, questionId) => {
          acc[parseInt(questionId)] = answers[parseInt(questionId)];
          return acc;
        }, {} as Record<number, number>),
      });

      navigation.replace('AssessmentResult', {
        result: response.data,
        skillName,
      });
    } catch (error: any) {
      console.error('Failed to submit assessment:', error);
      Alert.alert('Error', error.response?.data?.detail || 'Failed to submit assessment');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <LoadingScreen />;
  }

  if (questions.length === 0) {
    return (
      <View style={styles.container}>
        <Card>
          <Text style={styles.noQuestionsText}>No questions available for this skill.</Text>
        </Card>
      </View>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const selectedAnswer = answers[currentQuestion.id];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

  return (
    <View style={styles.container}>
      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={[styles.progressBar, { width: `${progress}%` }]} />
      </View>
      <Text style={styles.progressText}>
        Question {currentQuestionIndex + 1} of {questions.length}
      </Text>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <Card style={styles.questionCard}>
          <Text style={styles.questionText}>{currentQuestion.question_text}</Text>
          <View style={styles.optionsContainer}>
            {currentQuestion.options.map((option) => (
              <TouchableOpacity
                key={option.id}
                style={[
                  styles.option,
                  selectedAnswer === option.id && styles.optionSelected,
                ]}
                onPress={() => handleAnswer(currentQuestion.id, option.id)}
              >
                <Text
                  style={[
                    styles.optionText,
                    selectedAnswer === option.id && styles.optionTextSelected,
                  ]}
                >
                  {option.text}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </Card>
      </ScrollView>

      {/* Navigation Buttons */}
      <View style={styles.navigationContainer}>
        <Button
          title="Previous"
          onPress={handlePrevious}
          variant="secondary"
          disabled={currentQuestionIndex === 0}
          style={styles.navButton}
        />
        {currentQuestionIndex === questions.length - 1 ? (
          <Button
            title="Submit"
            onPress={handleSubmit}
            loading={submitting}
            style={styles.navButton}
          />
        ) : (
          <Button
            title="Next"
            onPress={handleNext}
            disabled={!selectedAnswer && selectedAnswer !== 0}
            style={styles.navButton}
          />
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  progressContainer: {
    height: 4,
    backgroundColor: theme.colors.gray[200],
    width: '100%',
  },
  progressBar: {
    height: '100%',
    backgroundColor: theme.colors.primary[800],
  },
  progressText: {
    ...theme.typography.bodySmall,
    color: theme.colors.text.secondary,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: theme.spacing.lg,
  },
  questionCard: {
    marginBottom: theme.spacing.lg,
  },
  questionText: {
    ...theme.typography.h4,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xl,
  },
  optionsContainer: {
    gap: theme.spacing.md,
  },
  option: {
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    borderWidth: 2,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.cardBackground,
  },
  optionSelected: {
    borderColor: theme.colors.primary[800],
    backgroundColor: theme.colors.primary[50],
  },
  optionText: {
    ...theme.typography.body,
    color: theme.colors.text.primary,
  },
  optionTextSelected: {
    color: theme.colors.primary[800],
    fontWeight: '600',
  },
  navigationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.cardBackground,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    gap: theme.spacing.md,
  },
  navButton: {
    flex: 1,
  },
  noQuestionsText: {
    ...theme.typography.body,
    color: theme.colors.text.secondary,
    textAlign: 'center',
  },
});

