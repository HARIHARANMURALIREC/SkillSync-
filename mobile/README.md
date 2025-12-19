# SkillSync Mobile App

React Native mobile application for SkillSync - AI-Powered Personalized Learning Path Generator.

## Tech Stack

- **React Native** with **Expo** (~50.0.0)
- **TypeScript**
- **React Navigation** (Stack & Bottom Tabs)
- **Axios** for API calls
- **AsyncStorage** for token management
- **React Native Reanimated** for animations

## Features

- ✅ JWT Authentication (Login/Signup)
- ✅ Dashboard with progress tracking
- ✅ Skill Assessments (MCQ tests)
- ✅ Learning Path visualization
- ✅ Profile management
- ✅ Career Readiness Score
- ✅ Adaptive Learning Path
- ✅ Explainable AI features

## Setup

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Expo CLI (`npm install -g expo-cli`)
- iOS Simulator (for Mac) or Android Emulator

### Installation

1. Navigate to mobile directory:
```bash
cd mobile
```

2. Install dependencies:
```bash
npm install
```

3. Update API URL in `src/services/api.ts`:
```typescript
const API_BASE_URL = __DEV__ 
  ? 'http://localhost:8000'  // For local development
  : 'https://your-production-api.com';
```

**Important**: For Android emulator, use `http://10.0.2.2:8000` instead of `localhost:8000`.

4. Start the Expo development server:
```bash
npm start
# or
expo start
```

5. Run on device/simulator:
- Press `i` for iOS simulator
- Press `a` for Android emulator
- Scan QR code with Expo Go app on your phone

## Project Structure

```
mobile/
├── src/
│   ├── components/       # Reusable components
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── Input.tsx
│   │   └── LoadingScreen.tsx
│   ├── context/          # React Context
│   │   └── AuthContext.tsx
│   ├── navigation/       # Navigation setup
│   │   └── AppNavigator.tsx
│   ├── screens/          # Screen components
│   │   ├── SplashScreen.tsx
│   │   ├── LoginScreen.tsx
│   │   ├── SignupScreen.tsx
│   │   ├── DashboardScreen.tsx
│   │   ├── AssessmentsScreen.tsx
│   │   ├── MCQTestScreen.tsx
│   │   ├── AssessmentResultScreen.tsx
│   │   ├── LearningPathScreen.tsx
│   │   └── ProfileScreen.tsx
│   ├── services/         # API services
│   │   ├── api.ts
│   │   └── auth.ts
│   └── theme/            # Design system
│       ├── colors.ts
│       ├── spacing.ts
│       ├── typography.ts
│       └── index.ts
├── App.tsx               # Main app entry
├── app.json              # Expo configuration
└── package.json
```

## Design System

The app uses the same design system as the web app:

- **Primary Color**: `#6a1b9a` (Purple)
- **Background**: `#f8f5fb` (Light lavender)
- **Card Background**: `#ffffff`
- **Border Radius**: 16px for cards
- **Typography**: Modern, clean hierarchy

## Navigation Structure

```
Splash Screen
    ↓
Login/Signup
    ↓
Main Tabs (Bottom Navigation)
    ├── Dashboard
    ├── Assessments
    │   └── MCQ Test (Stack)
    │       └── Assessment Result (Stack)
    ├── Learning Path
    └── Profile
```

## API Integration

The app connects to the same FastAPI backend as the web app:

- Base URL: `http://localhost:8000` (development)
- All endpoints match the web app
- JWT tokens stored in AsyncStorage
- Automatic token refresh on 401 errors

## Development

### Running on iOS

```bash
npm run ios
```

### Running on Android

```bash
npm run android
```

### Building for Production

```bash
expo build:ios
expo build:android
```

## Notes

- Make sure the backend is running before starting the mobile app
- For Android emulator, use `10.0.2.2` instead of `localhost` for API calls
- The app requires Expo Go app on physical devices for development

## License

Same as the main SkillSync project.

