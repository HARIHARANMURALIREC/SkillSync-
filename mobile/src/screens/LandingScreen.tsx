import React from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
} from 'react-native';
import { AppTheme } from '../theme';
import { useStyles } from '../theme/useStyles';
import { Card } from '../components/Card';
import { Button } from '../components/Button';

interface LandingScreenProps {
  navigation: any;
}

const createStyles = (theme: AppTheme) => ({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    backgroundColor: theme.colors.elev,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.md,
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
  },
  headerContent: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
  },
  headerLogo: {
    width: 48,
    height: 48,
    marginRight: theme.spacing.sm,
  },
  headerTitle: {
    ...theme.typography.h4,
    color: theme.colors.cream,
    fontWeight: '800' as const,
  },
  headerButtons: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: theme.spacing.sm,
  },
  loginButton: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
  },
  loginButtonText: {
    ...theme.typography.body,
    color: theme.colors.cream,
    fontWeight: '700' as const,
  },
  signupButton: {
    backgroundColor: theme.colors.accent,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    shadowColor: theme.colors.neon,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3,
  },
  signupButtonText: {
    ...theme.typography.body,
    color: theme.colors.ink,
    fontWeight: '700' as const,
  },
  heroSection: {
    padding: theme.spacing.xl,
    alignItems: 'center' as const,
    backgroundColor: theme.colors.background,
  },
  heroLogo: {
    width: 200,
    height: 200,
    marginBottom: theme.spacing.lg,
  },
  heroTitle: {
    ...theme.typography.h1,
    color: theme.colors.cream,
    textAlign: 'center' as const,
    marginBottom: theme.spacing.md,
    fontWeight: '800' as const,
  },
  heroTitleAccent: {
    color: theme.colors.accent,
  },
  heroDescription: {
    ...theme.typography.body,
    color: theme.colors.muted,
    textAlign: 'center' as const,
    marginBottom: theme.spacing.xl,
    lineHeight: 22,
  },
  heroButtons: {
    width: '100%' as const,
    gap: theme.spacing.md,
  },
  primaryButton: {
    width: '100%' as const,
  },
  secondaryButton: {
    width: '100%' as const,
  },
  section: {
    padding: theme.spacing.xl,
  },
  sectionTitle: {
    ...theme.typography.h2,
    color: theme.colors.cream,
    textAlign: 'center' as const,
    marginBottom: theme.spacing.lg,
    fontWeight: '800' as const,
  },
  featureCard: {
    marginBottom: theme.spacing.md,
    alignItems: 'center' as const,
    padding: theme.spacing.lg,
    borderWidth: 1,
    borderColor: `${theme.colors.accent}25`,
  },
  featureEmoji: {
    fontSize: 40,
    marginBottom: theme.spacing.md,
  },
  featureTitle: {
    ...theme.typography.h4,
    color: theme.colors.cream,
    marginBottom: theme.spacing.sm,
    fontWeight: '700' as const,
  },
  featureDescription: {
    ...theme.typography.body,
    color: theme.colors.muted,
    textAlign: 'center' as const,
    lineHeight: 20,
  },
  advantagesSection: {
    backgroundColor: theme.colors.surface,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: `${theme.colors.violet}40`,
  },
  advantagesTitle: {
    color: theme.colors.violet,
  },
  advantageItem: {
    flexDirection: 'row' as const,
    marginBottom: theme.spacing.md,
    paddingHorizontal: theme.spacing.sm,
  },
  advantageBullet: {
    fontSize: 20,
    color: theme.colors.accent,
    marginRight: theme.spacing.sm,
  },
  advantageText: {
    ...theme.typography.body,
    color: theme.colors.muted,
    flex: 1,
    lineHeight: 22,
  },
  stepsContainer: {
    gap: theme.spacing.lg,
  },
  stepItem: {
    alignItems: 'center' as const,
    marginBottom: theme.spacing.lg,
  },
  stepNumber: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: theme.colors.accent,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    marginBottom: theme.spacing.md,
    shadowColor: theme.colors.neon,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 4,
  },
  stepNumberText: {
    ...theme.typography.h3,
    color: theme.colors.ink,
    fontWeight: '800' as const,
  },
  stepTitle: {
    ...theme.typography.h4,
    color: theme.colors.cream,
    marginBottom: theme.spacing.xs,
    fontWeight: '700' as const,
  },
  stepDesc: {
    ...theme.typography.body,
    color: theme.colors.muted,
    textAlign: 'center' as const,
  },
  ctaSection: {
    backgroundColor: theme.colors.elev,
    alignItems: 'center' as const,
    borderTopWidth: 1,
    borderColor: `${theme.colors.rose}30`,
  },
  ctaTitle: {
    ...theme.typography.h2,
    color: theme.colors.cream,
    textAlign: 'center' as const,
    marginBottom: theme.spacing.md,
    fontWeight: '800' as const,
  },
  ctaDescription: {
    ...theme.typography.body,
    color: theme.colors.muted,
    textAlign: 'center' as const,
    marginBottom: theme.spacing.xl,
    lineHeight: 22,
  },
  ctaButton: {
    width: '100%' as const,
  },
  footer: {
    backgroundColor: theme.colors.ink,
    padding: theme.spacing.xl,
    alignItems: 'center' as const,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  footerContent: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    marginBottom: theme.spacing.md,
  },
  footerLogo: {
    width: 40,
    height: 40,
    marginRight: theme.spacing.sm,
  },
  footerTitle: {
    ...theme.typography.h4,
    color: theme.colors.cream,
    fontWeight: '800' as const,
  },
  footerText: {
    ...theme.typography.body,
    color: theme.colors.muted,
    textAlign: 'center' as const,
    marginBottom: theme.spacing.sm,
  },
  footerCopyright: {
    ...theme.typography.caption,
    color: theme.colors.faint,
    fontSize: 12,
  },
});

export const LandingScreen: React.FC<LandingScreenProps> = ({ navigation }) => {
  const styles = useStyles(createStyles);

  const features = [
    {
      emoji: '🎯',
      title: 'Smart Skill Assessment',
      description: 'MCQ-based assessments with weighted scoring to accurately evaluate your skill levels.',
    },
    {
      emoji: '📊',
      title: 'Skill Gap Analysis',
      description: 'Compare your current skills against career requirements with prioritized gap analysis.',
    },
    {
      emoji: '🗺️',
      title: 'Personalized Learning Paths',
      description: 'Graph-based algorithm generates optimized weekly learning schedules.',
    },
    {
      emoji: '🔄',
      title: 'Adaptive Learning',
      description: 'Learning paths automatically adapt based on your progress.',
    },
    {
      emoji: '💡',
      title: 'Explainable AI',
      description: 'Understand why recommendations were made with clear explanations.',
    },
    {
      emoji: '📈',
      title: 'Career Readiness Score',
      description: 'Track your progress toward your target career with a clear readiness score.',
    },
  ];

  const advantages = [
    'Custom AI Engine - Built with custom algorithms, no external APIs',
    'Real-Time Adaptation - Learning paths evolve with you',
    'Curated Resources - Access to real, open-source learning materials',
    'Career-Focused - Tailored to specific career roles',
    'Cross-Platform - Seamless experience across web and mobile',
    'Privacy First - All processing happens locally',
  ];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Image
            source={require('../../assets/icon.png')}
            style={styles.headerLogo}
            resizeMode="contain"
          />
          <Text style={styles.headerTitle}>SkillSync</Text>
        </View>
        <View style={styles.headerButtons}>
          <TouchableOpacity
            onPress={() => navigation.navigate('Login')}
            style={styles.loginButton}
          >
            <Text style={styles.loginButtonText}>Login</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => navigation.navigate('Signup')}
            style={styles.signupButton}
          >
            <Text style={styles.signupButtonText}>Sign Up</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.heroSection}>
        <Image
          source={require('../../assets/splash-icon.png')}
          style={styles.heroLogo}
          resizeMode="contain"
        />
        <Text style={styles.heroTitle}>
          AI-Powered Personalized{'\n'}
          <Text style={styles.heroTitleAccent}>Learning Path Generator</Text>
        </Text>
        <Text style={styles.heroDescription}>
          Transform your career with intelligent skill assessment, personalized learning paths,
          and adaptive AI that evolves with your progress.
        </Text>
        <View style={styles.heroButtons}>
          <Button
            title="Get Started Free"
            onPress={() => navigation.navigate('Signup')}
            style={styles.primaryButton}
          />
          <Button
            title="Sign In"
            onPress={() => navigation.navigate('Login')}
            variant="secondary"
            style={styles.secondaryButton}
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Powerful Features</Text>
        {features.map((feature, index) => (
          <Card key={index} style={styles.featureCard}>
            <Text style={styles.featureEmoji}>{feature.emoji}</Text>
            <Text style={styles.featureTitle}>{feature.title}</Text>
            <Text style={styles.featureDescription}>{feature.description}</Text>
          </Card>
        ))}
      </View>

      <View style={[styles.section, styles.advantagesSection]}>
        <Text style={[styles.sectionTitle, styles.advantagesTitle]}>
          Why Choose SkillSync?
        </Text>
        {advantages.map((advantage, index) => (
          <View key={index} style={styles.advantageItem}>
            <Text style={styles.advantageBullet}>•</Text>
            <Text style={styles.advantageText}>{advantage}</Text>
          </View>
        ))}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>How It Works</Text>
        <View style={styles.stepsContainer}>
          {[
            { number: '1', title: 'Set Your Goal', desc: 'Choose your target career role' },
            { number: '2', title: 'Assess Skills', desc: 'Take MCQ-based assessments' },
            { number: '3', title: 'Get Your Path', desc: 'Receive personalized learning path' },
            { number: '4', title: 'Learn & Adapt', desc: 'Follow path, track progress' },
          ].map((step, index) => (
            <View key={index} style={styles.stepItem}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>{step.number}</Text>
              </View>
              <Text style={styles.stepTitle}>{step.title}</Text>
              <Text style={styles.stepDesc}>{step.desc}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={[styles.section, styles.ctaSection]}>
        <Text style={styles.ctaTitle}>Ready to Transform Your Career?</Text>
        <Text style={styles.ctaDescription}>
          Join thousands of learners using SkillSync to accelerate their tech career journey.
        </Text>
        <Button
          title="Start Learning Free"
          onPress={() => navigation.navigate('Signup')}
          style={styles.ctaButton}
        />
      </View>

      <View style={styles.footer}>
        <View style={styles.footerContent}>
          <Image
            source={require('../../assets/icon.png')}
            style={styles.footerLogo}
            resizeMode="contain"
          />
          <Text style={styles.footerTitle}>SkillSync</Text>
        </View>
        <Text style={styles.footerText}>
          AI-Powered Personalized Learning Path Generator
        </Text>
        <Text style={styles.footerCopyright}>
          © 2024 SkillSync. All rights reserved.
        </Text>
      </View>
    </ScrollView>
  );
};
