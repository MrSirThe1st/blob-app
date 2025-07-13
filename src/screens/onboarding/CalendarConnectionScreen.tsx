// src/screens/onboarding/CalendarConnectionScreen.tsx
import React, { useState, useEffect } from "react";
import { StyleSheet, Text, TouchableOpacity, View, Alert } from "react-native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { Colors, Typography, Spacing, BorderRadius } from "@/constants";
import { OnboardingStackParamList } from "@/components/navigation/OnboardingNavigator";
import OnboardingPageLayout from "@/components/onboarding/OnboardingPageLayout";
import { useOnboarding } from "@/hooks/useOnboarding";

type NavigationProp = NativeStackNavigationProp<
  OnboardingStackParamList,
  "CalendarConnection"
>;

interface CalendarOption {
  id: string;
  name: string;
  icon: string;
  color: string;
  description: string;
}

const calendarOptions: CalendarOption[] = [
  {
    id: "google",
    name: "Google Calendar",
    icon: "📅",
    color: "#4285F4",
    description: "Connect your Google Calendar",
  },
  {
    id: "microsoft",
    name: "Microsoft Calendar",
    icon: "📆",
    color: "#0078D4",
    description: "Connect your Outlook Calendar",
  },
  {
    id: "apple",
    name: "Apple Calendar",
    icon: "🗓️",
    color: "#007AFF",
    description: "Connect your Apple Calendar",
  },
];

const CalendarConnectionScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const {
    saveStepAndContinue,
    isLoading,
    hasError,
    errorMessage,
    clearError,
    goBackStep,
  } = useOnboarding();

  const [selectedCalendar, setSelectedCalendar] = useState<string>("");
  const [isConnecting, setIsConnecting] = useState(false);

  // Clear any previous errors when component mounts
  useEffect(() => {
    clearError();
  }, [clearError]);

  // Show error alert if there's an error
  useEffect(() => {
    if (hasError && errorMessage) {
      Alert.alert("Error", errorMessage, [{ text: "OK", onPress: clearError }]);
    }
  }, [hasError, errorMessage, clearError]);

  const handleCalendarSelect = (calendarId: string) => {
    setSelectedCalendar(calendarId);
    setIsConnecting(true);

    // Simulate calendar connection
    setTimeout(() => {
      setIsConnecting(false);
      Alert.alert(
        "Calendar Connected",
        `Successfully connected to ${calendarOptions.find((c) => c.id === calendarId)?.name}!`,
        [
          {
            text: "Continue",
            onPress: () => handleContinue(true),
          },
        ]
      );
    }, 2000);
  };

  const handleContinue = async (
    calendarConnected = false,
    additionalInput?: string
  ) => {
    // Prepare step data
    const stepData = {
      calendarConnected: calendarConnected || !!selectedCalendar,
    };

    // Save step and continue
    const success = await saveStepAndContinue(stepData, additionalInput);

    if (success) {
      // Navigate to next screen - OpenConversation
      navigation.navigate("OpenConversation");
    }
    // If not successful, error handling is done in the hook
  };

  const handleSkip = () => {
    Alert.alert(
      "Skip Calendar Connection?",
      "You can always connect your calendar later in settings. Blob will work better with calendar access.",
      [
        {
          text: "Go Back",
          style: "cancel",
        },
        {
          text: "Skip for Now",
          onPress: () => handleContinue(false),
        },
      ]
    );
  };

  const handleBack = () => {
    goBackStep();
    navigation.goBack();
  };

  return (
    <OnboardingPageLayout
      title="Calendar Connection"
      subtitle="Connect your calendar so Blob can schedule around your existing commitments and avoid conflicts."
      onBack={handleBack}
      onContinue={(input) => handleContinue(false, input)}
      canContinue={true} // Calendar is optional
      inputPlaceholder="calendar notes/ anything more that you'd like to share"
      isLoading={isLoading || isConnecting}
      validationMessage="Calendar connection is optional. You can skip this step or provide notes."
    >
      {/* Calendar Options */}
      <View style={styles.optionsContainer}>
        {calendarOptions.map((option) => (
          <TouchableOpacity
            key={option.id}
            style={[
              styles.calendarOption,
              selectedCalendar === option.id && styles.calendarOptionSelected,
              isConnecting && styles.calendarOptionDisabled,
            ]}
            onPress={() => handleCalendarSelect(option.id)}
            activeOpacity={0.7}
            disabled={isConnecting || isLoading}
          >
            <Text style={styles.calendarIcon}>{option.icon}</Text>
            <View style={styles.calendarContent}>
              <Text
                style={[
                  styles.calendarName,
                  isConnecting && styles.textDisabled,
                ]}
              >
                {option.name}
              </Text>
              <Text
                style={[
                  styles.calendarDescription,
                  isConnecting && styles.textDisabled,
                ]}
              >
                {option.description}
              </Text>
            </View>
            {isConnecting && selectedCalendar === option.id ? (
              <View style={styles.connectingIndicator}>
                <Text style={styles.connectingText}>Connecting...</Text>
              </View>
            ) : (
              <Ionicons
                name="chevron-forward"
                size={20}
                color={Colors.text.secondary}
              />
            )}
          </TouchableOpacity>
        ))}
      </View>

      {/* Skip Option */}
      <View style={styles.skipContainer}>
        <TouchableOpacity
          style={[styles.skipButton, isLoading && styles.skipButtonDisabled]}
          onPress={handleSkip}
          disabled={isLoading || isConnecting}
        >
          <Text
            style={[styles.skipButtonText, isLoading && styles.textDisabled]}
          >
            Skip for now
          </Text>
        </TouchableOpacity>
      </View>

      {/* Help Text */}
      <View style={styles.helpContainer}>
        <Text style={styles.helpText}>
          💡 Calendar access helps Blob create realistic schedules that work
          around your existing meetings and commitments
        </Text>
      </View>
    </OnboardingPageLayout>
  );
};

const styles = StyleSheet.create({
  optionsContainer: {
    gap: Spacing.md,
    marginBottom: Spacing.xl,
  },

  calendarOption: {
    backgroundColor: Colors.background.secondary,
    borderRadius: BorderRadius.blob.medium,
    padding: Spacing.lg,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "transparent",
    shadowColor: Colors.neutral.dark,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },

  calendarOptionSelected: {
    borderColor: Colors.primary.main,
    backgroundColor: Colors.background.accent,
  },

  calendarOptionDisabled: {
    opacity: 0.6,
    shadowOpacity: 0,
    elevation: 0,
  },

  calendarIcon: {
    fontSize: 32,
    marginRight: Spacing.md,
  },

  calendarContent: {
    flex: 1,
  },

  calendarName: {
    ...Typography.h3,
    color: Colors.text.primary,
    marginBottom: Spacing.xs,
  },

  calendarDescription: {
    ...Typography.bodyMedium,
    color: Colors.text.secondary,
    lineHeight: 20,
  },

  textDisabled: {
    color: Colors.text.muted,
  },

  connectingIndicator: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.primary.main,
    borderRadius: BorderRadius.md,
  },

  connectingText: {
    ...Typography.captionMedium,
    color: Colors.text.onPrimary,
    fontWeight: "600",
  },

  skipContainer: {
    alignItems: "center",
    marginTop: Spacing.lg,
    marginBottom: Spacing.xl,
  },

  skipButton: {
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.background.card,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border.medium,
  },

  skipButtonDisabled: {
    opacity: 0.6,
  },

  skipButtonText: {
    ...Typography.bodyMedium,
    color: Colors.text.secondary,
    fontWeight: "500",
  },

  helpContainer: {
    marginTop: Spacing.xl,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.background.accent,
    borderRadius: BorderRadius.md,
    marginHorizontal: Spacing.md,
  },

  helpText: {
    ...Typography.bodySmall,
    color: Colors.text.secondary,
    textAlign: "center",
    lineHeight: 18,
  },
});

export default CalendarConnectionScreen;
