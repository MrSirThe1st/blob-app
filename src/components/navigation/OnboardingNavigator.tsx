// src/components/navigation/OnboardingNavigator.tsx
import { createNativeStackNavigator } from "@react-navigation/native-stack";

// Import onboarding screens
import CalendarConnectionScreen from "@/screens/onboarding/CalendarConnectionScreen";
import EnergyPatternScreen from "@/screens/onboarding/EnergyPatternScreen";
import OpenConversationScreen from "@/screens/onboarding/OpenConversationScreen";
import PersonalityScreen from "@/screens/onboarding/PersonalityScreen";
import StressResponseScreen from "@/screens/onboarding/StreesResponseScreen";
import WorkStyleScreen from "@/screens/onboarding/WorkStyleScreen";

export type OnboardingStackParamList = {
  EnergyPattern: undefined;
  Personality: undefined;
  WorkStyle: undefined;
  StressResponse: undefined;
  CalendarConnection: undefined;
  OpenConversation: undefined;
};

const OnboardingStack = createNativeStackNavigator<OnboardingStackParamList>();

const OnboardingNavigator = () => {
  return (
    <OnboardingStack.Navigator
      screenOptions={{
        headerShown: false,
        gestureEnabled: false, // Prevent back swipe during onboarding
      }}
      initialRouteName="EnergyPattern"
    >
      <OnboardingStack.Screen
        name="EnergyPattern"
        component={EnergyPatternScreen}
      />
      <OnboardingStack.Screen
        name="Personality"
        component={PersonalityScreen}
      />
      <OnboardingStack.Screen name="WorkStyle" component={WorkStyleScreen} />
      <OnboardingStack.Screen
        name="StressResponse"
        component={StressResponseScreen}
      />
      <OnboardingStack.Screen
        name="CalendarConnection"
        component={CalendarConnectionScreen}
      />
      <OnboardingStack.Screen
        name="OpenConversation"
        component={OpenConversationScreen}
      />
    </OnboardingStack.Navigator>
  );
};

export default OnboardingNavigator;
