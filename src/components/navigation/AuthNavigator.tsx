import { Colors, Typography } from "@/constants";
import { useAuth } from "@/hooks/useAuth";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { ActivityIndicator, Text, View } from "react-native";

// Import screens
import LoginScreen from "@/screens/auth/LoginScreen";
import SignupScreen from "@/screens/auth/SignupScreen";
import WelcomeScreen from "@/screens/auth/WelcomeScreen";
import BuddyScreen from "@/screens/main/BuddyScreen";
import GoalsScreen from "@/screens/main/GoalsScreen";
import HomeScreen from "@/screens/main/HomeScreen";
import InsightsScreen from "@/screens/main/InsightsScreen";
import TodayScreen from "@/screens/main/TodayScreen";
import OnboardingScreen from "@/screens/onboarding/OnboardingScreen";

const AuthStack = createNativeStackNavigator();
const MainTabs = createBottomTabNavigator();
const OnboardingStack = createNativeStackNavigator();

// Loading Component
const LoadingScreen = () => (
  <View
    style={{
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: Colors.background.primary,
    }}
  >
    <ActivityIndicator size="large" color={Colors.primary.main} />
    <Text
      style={{
        marginTop: 16,
        fontSize: Typography.bodyMedium.fontSize,
        color: Colors.text.secondary,
      }}
    >
      Loading...
    </Text>
  </View>
);

// Auth Stack Navigator
const AuthStackNavigator = () => (
  <AuthStack.Navigator screenOptions={{ headerShown: false }}>
    <AuthStack.Screen name="Welcome" component={WelcomeScreen} />
    <AuthStack.Screen name="Login" component={LoginScreen} />
    <AuthStack.Screen name="Signup" component={SignupScreen} />
  </AuthStack.Navigator>
);

// Onboarding Stack Navigator
const OnboardingStackNavigator = () => (
  <OnboardingStack.Navigator screenOptions={{ headerShown: false }}>
    <OnboardingStack.Screen name="Onboarding" component={OnboardingScreen} />
  </OnboardingStack.Navigator>
);

// Main App Tabs
const MainTabsNavigator = () => (
  <MainTabs.Navigator
    screenOptions={{
      headerShown: false,
      tabBarActiveTintColor: Colors.primary.main,
      tabBarInactiveTintColor: Colors.text.muted,
      tabBarStyle: {
        backgroundColor: Colors.background.card,
        borderTopColor: Colors.border.subtle,
      },
    }}
  >
    <MainTabs.Screen
      name="Home"
      component={HomeScreen}
      options={{
        tabBarIcon: ({ color }) => <Text style={{ color }}>🏠</Text>,
        title: "Home",
      }}
    />
    <MainTabs.Screen
      name="Today"
      component={TodayScreen}
      options={{
        tabBarIcon: ({ color }) => <Text style={{ color }}>📅</Text>,
        title: "Today",
      }}
    />
    <MainTabs.Screen
      name="Goals"
      component={GoalsScreen}
      options={{
        tabBarIcon: ({ color }) => <Text style={{ color }}>🎯</Text>,
        title: "Goals",
      }}
    />
    <MainTabs.Screen
      name="Buddy"
      component={BuddyScreen}
      options={{
        tabBarIcon: ({ color }) => <Text style={{ color }}>🤝</Text>,
        title: "Buddy",
      }}
    />
    <MainTabs.Screen
      name="Insights"
      component={InsightsScreen}
      options={{
        tabBarIcon: ({ color }) => <Text style={{ color }}>📊</Text>,
        title: "Insights",
      }}
    />
  </MainTabs.Navigator>
);

// Main Auth Navigator Component
const AuthNavigator = () => {
  const { isLoading, isAuthenticated, userProfile } = useAuth();

  // Show loading screen while checking auth status
  if (isLoading) {
    return <LoadingScreen />;
  }

  // Determine which navigator to show based on auth state and onboarding status
  const getNavigator = () => {
    if (!isAuthenticated) {
      // User not authenticated -> Show auth flow
      return <AuthStackNavigator />;
    } else if (userProfile && !userProfile.onboardingCompleted) {
      // User authenticated but onboarding not complete -> Show onboarding
      return <OnboardingStackNavigator />;
    } else {
      // User authenticated and onboarding complete -> Show main app
      return <MainTabsNavigator />;
    }
  };

  return getNavigator();
};

export default AuthNavigator;
