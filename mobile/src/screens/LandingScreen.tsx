import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
} from 'react-native';
import { theme } from '../theme';
import { Card } from '../components/Card';
import { Button } from '../components/Button';

interface LandingScreenProps {
  navigation: any;
}

export const LandingScreen: React.FC<LandingScreenProps> = ({ navigation }) => {

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
      {/* Header */}
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

      {/* Hero Section */}
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

      {/* Features Section */}
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

      {/* Advantages Section */}
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

      {/* How It Works */}
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

      {/* CTA Section */}
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

      {/* Footer */}
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    backgroundColor: theme.colors.cardBackground,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerLogo: {
    width: 48,
    height: 48,
    marginRight: theme.spacing.sm,
  },
  headerTitle: {
    ...theme.typography.h4,
    color: theme.colors.text.primary,
    fontWeight: 'bold',
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  loginButton: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
  },
  loginButtonText: {
    ...theme.typography.body,
    color: theme.colors.text.primary,
    fontWeight: '600',
  },
  signupButton: {
    backgroundColor: theme.colors.primary[800],
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
  },
  signupButtonText: {
    ...theme.typography.body,
    color: theme.colors.text.inverse,
    fontWeight: '600',
  },
  heroSection: {
    padding: theme.spacing.xl,
    alignItems: 'center',
    backgroundColor: theme.colors.background,
  },
  heroLogo: {
    width: 200,
    height: 200,
    marginBottom: theme.spacing.lg,
  },
  heroTitle: {
    ...theme.typography.h1,
    color: theme.colors.text.primary,
    textAlign: 'center',
    marginBottom: theme.spacing.md,
    fontWeight: 'bold',
  },
  heroTitleAccent: {
    color: theme.colors.primary[800],
  },
  heroDescription: {
    ...theme.typography.body,
    color: theme.colors.text.secondary,
    textAlign: 'center',
    marginBottom: theme.spacing.xl,
    lineHeight: 22,
  },
  heroButtons: {
    width: '100%',
    gap: theme.spacing.md,
  },
  primaryButton: {
    width: '100%',
  },
  secondaryButton: {
    width: '100%',
  },
  section: {
    padding: theme.spacing.xl,
  },
  sectionTitle: {
    ...theme.typography.h2,
    color: theme.colors.text.primary,
    textAlign: 'center',
    marginBottom: theme.spacing.lg,
    fontWeight: 'bold',
  },
  featureCard: {
    marginBottom: theme.spacing.md,
    alignItems: 'center',
    padding: theme.spacing.lg,
  },
  featureEmoji: {
    fontSize: 40,
    marginBottom: theme.spacing.md,
  },
  featureTitle: {
    ...theme.typography.h4,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.sm,
    fontWeight: '600',
  },
  featureDescription: {
    ...theme.typography.body,
    color: theme.colors.text.secondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  advantagesSection: {
    backgroundColor: theme.colors.primary[800],
  },
  advantagesTitle: {
    color: theme.colors.text.inverse,
  },
  advantageItem: {
    flexDirection: 'row',
    marginBottom: theme.spacing.md,
    paddingHorizontal: theme.spacing.sm,
  },
  advantageBullet: {
    fontSize: 20,
    color: theme.colors.text.inverse,
    marginRight: theme.spacing.sm,
  },
  advantageText: {
    ...theme.typography.body,
    color: theme.colors.primary[100],
    flex: 1,
    lineHeight: 22,
  },
  stepsContainer: {
    gap: theme.spacing.lg,
  },
  stepItem: {
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  stepNumber: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: theme.colors.primary[800],
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  stepNumberText: {
    ...theme.typography.h3,
    color: theme.colors.text.inverse,
    fontWeight: 'bold',
  },
  stepTitle: {
    ...theme.typography.h4,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs,
    fontWeight: '600',
  },
  stepDesc: {
    ...theme.typography.body,
    color: theme.colors.text.secondary,
    textAlign: 'center',
  },
  ctaSection: {
    backgroundColor: theme.colors.cardBackground,
    alignItems: 'center',
  },
  ctaTitle: {
    ...theme.typography.h2,
    color: theme.colors.text.primary,
    textAlign: 'center',
    marginBottom: theme.spacing.md,
    fontWeight: 'bold',
  },
  ctaDescription: {
    ...theme.typography.body,
    color: theme.colors.text.secondary,
    textAlign: 'center',
    marginBottom: theme.spacing.xl,
    lineHeight: 22,
  },
  ctaButton: {
    width: '100%',
  },
  footer: {
    backgroundColor: '#1a1a1a',
    padding: theme.spacing.xl,
    alignItems: 'center',
  },
  footerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  footerLogo: {
    width: 40,
    height: 40,
    marginRight: theme.spacing.sm,
  },
  footerTitle: {
    ...theme.typography.h4,
    color: '#ffffff',
    fontWeight: 'bold',
  },
  footerText: {
    ...theme.typography.body,
    color: '#888888',
    textAlign: 'center',
    marginBottom: theme.spacing.sm,
  },
  footerCopyright: {
    ...theme.typography.caption,
    color: '#666666',
    fontSize: 12,
  },
});

