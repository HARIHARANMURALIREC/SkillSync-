import React from 'react';
import { View, Text } from 'react-native';
import { NavigationContainer, DarkTheme, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { useProgress } from '../context/ProgressContext';
import { useTheme } from '../context/ThemeContext';

import { SplashScreen } from '../screens/SplashScreen';
import { LoginScreen } from '../screens/LoginScreen';
import { SignupScreen } from '../screens/SignupScreen';
import { DashboardScreen } from '../screens/DashboardScreen';
import { AssessmentsScreen } from '../screens/AssessmentsScreen';
import { MCQTestScreen } from '../screens/MCQTestScreen';
import { AssessmentResultScreen } from '../screens/AssessmentResultScreen';
import { LearningPathScreen } from '../screens/LearningPathScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { CoachChatScreen } from '../screens/CoachChatScreen';
import { LoadingScreen } from '../components/LoadingScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function DashboardStreakChip() {
  const { streakDays } = useProgress();
  const { theme } = useTheme();
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', marginRight: 16, gap: 4 }}>
      <Ionicons name="flame" size={16} color={theme.colors.rose} />
      <Text style={{ color: theme.colors.rose, fontWeight: '600' }}>{streakDays}</Text>
    </View>
  );
}

function MainTabs() {
  const { theme, isDark } = useTheme();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap = 'home';

          if (route.name === 'Dashboard') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Assessments') {
            iconName = focused ? 'clipboard' : 'clipboard-outline';
          } else if (route.name === 'LearningPath') {
            iconName = focused ? 'library' : 'library-outline';
          } else if (route.name === 'Coach') {
            iconName = focused ? 'chatbubbles' : 'chatbubbles-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: theme.colors.accent,
        tabBarInactiveTintColor: theme.colors.muted,
        tabBarStyle: {
          backgroundColor: theme.colors.background,
          borderTopColor: theme.colors.border,
          borderTopWidth: 1,
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
        headerStyle: {
          backgroundColor: theme.colors.background,
        },
        headerShadowVisible: false,
        headerTintColor: theme.colors.cream,
        headerTitleStyle: {
          ...theme.typography.h4,
          color: theme.colors.cream,
        },
        sceneContainerStyle: {
          backgroundColor: theme.colors.background,
        },
      })}
    >
      <Tab.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{
          title: 'Dashboard',
          headerRight: () => <DashboardStreakChip />,
        }}
      />
      <Tab.Screen name="Assessments" component={AssessmentsScreen} options={{ title: 'Assessments' }} />
      <Tab.Screen name="LearningPath" component={LearningPathScreen} options={{ title: 'Learning Path' }} />
      <Tab.Screen name="Coach" component={CoachChatScreen} options={{ title: 'Coach' }} />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ title: 'Profile' }} />
    </Tab.Navigator>
  );
}

function AuthStack() {
  const { theme } = useTheme();
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: theme.colors.background },
      }}
    >
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Signup" component={SignupScreen} />
    </Stack.Navigator>
  );
}

function MainStack() {
  const { theme } = useTheme();
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: theme.colors.background,
        },
        headerShadowVisible: false,
        headerTintColor: theme.colors.cream,
        headerTitleStyle: {
          ...theme.typography.h4,
          color: theme.colors.cream,
        },
        contentStyle: { backgroundColor: theme.colors.background },
      }}
    >
      <Stack.Screen name="MainTabs" component={MainTabs} options={{ headerShown: false }} />
      <Stack.Screen
        name="MCQTest"
        component={MCQTestScreen}
        options={({ route }) => ({
          title: `${(route.params as any)?.skillName || 'Assessment'}`,
        })}
      />
      <Stack.Screen name="AssessmentResult" component={AssessmentResultScreen} options={{ title: 'Assessment Result' }} />
    </Stack.Navigator>
  );
}

export function AppNavigator() {
  const { user, loading } = useAuth();
  const { theme, isDark } = useTheme();

  if (loading) {
    return <LoadingScreen />;
  }

  const navTheme = isDark
    ? {
        ...DarkTheme,
        colors: {
          ...DarkTheme.colors,
          primary: theme.colors.accent,
          background: theme.colors.background,
          card: theme.colors.surface,
          text: theme.colors.cream,
          border: theme.colors.border,
        },
      }
    : {
        ...DefaultTheme,
        colors: {
          ...DefaultTheme.colors,
          primary: theme.colors.accent,
          background: theme.colors.background,
          card: theme.colors.surface,
          text: theme.colors.cream,
          border: theme.colors.border,
        },
      };

  return (
    <NavigationContainer theme={navTheme}>
      <Stack.Navigator
        initialRouteName={user ? 'MainStack' : 'Auth'}
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: theme.colors.background },
        }}
      >
        <Stack.Screen name="Splash" component={SplashScreen} />
        <Stack.Screen name="Auth" component={AuthStack} />
        <Stack.Screen name="MainStack" component={MainStack} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
