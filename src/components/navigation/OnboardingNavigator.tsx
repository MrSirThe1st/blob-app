// src/components/navigation/OnboardingNavigator.tsx
import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

// Import onboarding screens
import EnergyPatternScreen from "@/screens/onboarding/EnergyPatternScreen";
import PersonalityScreen from "@/screens/onboarding/PersonalityScreen";
import { WorkStyleScreen } from "@/screens/onboarding/WorkStyleScreen";
import { CalendarConnectionScreen } from "@/screens/onboarding/CalendarConnectionScreen";
import { OpenConversationScreen } from "@/screens/onboarding/OpenConversationScreen";

export type OnboardingStackParamList = {
  EnergyPattern: undefined;
  Personality: undefined;
  WorkStyle: undefined;
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
