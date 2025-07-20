// src/components/navigation/AuthNavigator.tsx
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
import SettingsScreen from "@/screens/main/SettingsScreen";
import TodayScreen from "@/screens/main/TodayScreen";

// Import new onboarding navigator
import { Ionicons } from "@expo/vector-icons";
import OnboardingNavigator from "./OnboardingNavigator";

const AuthStack = createNativeStackNavigator();
const MainTabs = createBottomTabNavigator();

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

// Main App Tabs - UPDATED to support initial tab selection
const MainTabsNavigator = ({ route }: any) => {
  // Extract initial tab from navigation params
  const initialTab = route?.params?.initialTab || "Home";
  return (
    <MainTabs.Navigator
      initialRouteName={initialTab}
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Colors.primary.main,
        tabBarInactiveTintColor: "#8E8E93", // iOS gray for better visibility
        tabBarStyle: {
          backgroundColor: Colors.background.primary, // Match screen background
          borderTopWidth: 0, // Remove top border
          elevation: 0, // Remove shadow on Android
          shadowOpacity: 0, // Remove shadow on iOS
          paddingBottom: 8,
          paddingTop: 8,
          height: 60,
        },
        tabBarShowLabel: false, // Remove text labels
        tabBarIconStyle: {
          marginTop: 0,
        },
      }}
    >
      <MainTabs.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "grid" : "grid"}
              size={24}
              color={color}
            />
          ),
        }}
      />
      <MainTabs.Screen
        name="Today"
        component={TodayScreen}
        options={{
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "today" : "today"}
              size={24}
              color={color}
            />
          ),
        }}
      />
      <MainTabs.Screen
        name="Goals"
        component={GoalsScreen}
        options={{
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "trophy" : "trophy"}
              size={24}
              color={color}
            />
          ),
        }}
      />
      <MainTabs.Screen
        name="Buddy"
        component={BuddyScreen}
        options={{
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "person-add" : "person-add"}
              size={24}
              color={color}
            />
          ),
        }}
      />
      <MainTabs.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "settings" : "settings"}
              size={24}
              color={color}
            />
          ),
        }}
      />
    </MainTabs.Navigator>
  );
};

// Main Auth Navigator Component
const AuthNavigator = () => {
  const { isLoading, isAuthenticated, userProfile } = useAuth();

  // Show loading screen while checking auth status
  if (isLoading) {
    console.log("🔄 AuthNavigator: Still loading...");
    return <LoadingScreen />;
  }

  // Debug logging for navigation decisions
  console.log("🧭 AuthNavigator: Making navigation decision", {
    isAuthenticated,
    hasUserProfile: !!userProfile,
    onboardingCompleted: userProfile?.onboardingCompleted,
    onboardingStep: userProfile?.onboardingStep,
    userEmail: userProfile?.email,
  });

  // Determine which navigator to show based on auth state and onboarding status
  const getNavigator = () => {
    if (!isAuthenticated) {
      // User not authenticated -> Show auth flow
      console.log("📱 AuthNavigator: Showing auth flow (not authenticated)");
      return <AuthStackNavigator />;
    }

    // User is authenticated, check profile and onboarding status
    if (!userProfile) {
      // Profile is still loading or doesn't exist
      console.log("⏳ AuthNavigator: Profile loading, showing loading screen");
      return <LoadingScreen />;
    }

    // More robust onboarding check - consider both completed flag and step
    const isOnboardingComplete = userProfile.onboardingCompleted === true;
    const onboardingStep = userProfile.onboardingStep || 0;

    // If onboarding is explicitly incomplete OR user is still in onboarding steps
    if (!isOnboardingComplete || (onboardingStep > 0 && onboardingStep <= 5)) {
      console.log("🎯 AuthNavigator: Showing onboarding", {
        onboardingCompleted: userProfile.onboardingCompleted,
        onboardingStep: userProfile.onboardingStep,
        reason: !isOnboardingComplete ? "not completed" : "in progress",
      });
      return <OnboardingNavigator />;
    }

    // User authenticated and onboarding complete -> Show main app
    console.log(
      "🏠 AuthNavigator: Showing main app (authenticated + onboarded)"
    );
    return <MainTabsNavigator />;
  };

  return getNavigator();
};

export default AuthNavigator;
