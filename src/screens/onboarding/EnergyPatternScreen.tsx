// src/screens/onboarding/EnergyPatternScreen.tsx
import React, { useState, useEffect } from "react";
import { StyleSheet, Text, TouchableOpacity, View, Alert } from "react-native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useNavigation } from "@react-navigation/native";
import { Colors, Typography, Spacing, BorderRadius } from "@/constants";
import { OnboardingStackParamList } from "@/components/navigation/OnboardingNavigator";
import OnboardingPageLayout from "@/components/onboarding/OnboardingPageLayout";
import { useOnboarding } from "@/hooks/useOnboarding";

type NavigationProp = NativeStackNavigationProp<
  OnboardingStackParamList,
  "EnergyPattern"
>;

interface EnergyOption {
  id: "morning" | "evening" | "afternoon";
  icon: string;
  title: string;
  description: string;
}

const energyOptions: EnergyOption[] = [
  {
    id: "morning",
    icon: "🌅",
    title: "Morning person",
    description: "I naturally feel most energetic and focused",
  },
  {
    id: "evening",
    icon: "🌙",
    title: "Evening person",
    description: "I naturally feel most energetic and focused",
  },
  {
    id: "afternoon",
    icon: "☀️",
    title: "Afternoon person",
    description: "I naturally feel most energetic and focused",
  },
];

const EnergyPatternScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const { saveStepAndContinue, isLoading, hasError, errorMessage, clearError } =
    useOnboarding();

  const [selectedOption, setSelectedOption] = useState<string>("");

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

  const handleOptionSelect = (optionId: string) => {
    setSelectedOption(optionId);
    // Clear errors when user makes a selection
    if (hasError) {
      clearError();
    }
  };

  const handleContinue = async (additionalInput?: string) => {
    // Prepare step data
    const stepData = {
      energyPattern:
        (selectedOption as "morning" | "afternoon" | "evening") || undefined,
    };

    // Save step and continue
    const success = await saveStepAndContinue(stepData, additionalInput);

    if (success) {
      // Navigate to next screen - WorkStyle
      navigation.navigate("WorkStyle");
    }
    // If not successful, error handling is done in the hook
  };

  return (
    <OnboardingPageLayout
      title="Energy Pattern"
      subtitle="When do you naturally feel most energetic and focused?"
      onContinue={handleContinue}
      // No onBack prop - this is the first screen
      canContinue={!!selectedOption}
      inputPlaceholder="energy pattern/ anything more that you'd like to share"
      isLoading={isLoading}
      validationMessage="Please either select an energy pattern or provide at least 10 characters describing your energy pattern."
    >
      <View style={styles.optionsContainer}>
        {energyOptions.map((option) => (
          <TouchableOpacity
            key={option.id}
            style={[
              styles.optionButton,
              selectedOption === option.id && styles.optionButtonSelected,
              isLoading && styles.optionButtonDisabled,
            ]}
            onPress={() => handleOptionSelect(option.id)}
            activeOpacity={0.7}
            disabled={isLoading}
          >
            <Text
              style={[
                styles.optionIcon,
                isLoading && styles.optionIconDisabled,
              ]}
            >
              {option.icon}
            </Text>
            <View style={styles.optionContent}>
              <Text
                style={[
                  styles.optionTitle,
                  isLoading && styles.optionTextDisabled,
                ]}
              >
                {option.title}
              </Text>
              <Text
                style={[
                  styles.optionDescription,
                  isLoading && styles.optionTextDisabled,
                ]}
              >
                {option.description}
              </Text>
            </View>
            <View
              style={[
                styles.selectionIndicator,
                selectedOption === option.id && styles.selectionIndicatorActive,
                isLoading && styles.selectionIndicatorDisabled,
              ]}
            >
              {selectedOption === option.id && (
                <View
                  style={[
                    styles.selectionDot,
                    isLoading && styles.selectionDotDisabled,
                  ]}
                />
              )}
            </View>
          </TouchableOpacity>
        ))}
      </View>

      {/* Show additional help text */}
      <View style={styles.helpContainer}>
        <Text style={styles.helpText}>
          💡 This helps Blob schedule your most important tasks when you have
          the most energy
        </Text>
      </View>
    </OnboardingPageLayout>
  );
};

const styles = StyleSheet.create({
  optionsContainer: {
    gap: Spacing.md,
    paddingHorizontal: Spacing.md,
  },
  optionButton: {
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
  optionButtonSelected: {
    borderColor: Colors.primary.main,
    backgroundColor: Colors.background.accent,
  },
  optionButtonDisabled: {
    opacity: 0.6,
    shadowOpacity: 0,
    elevation: 0,
  },
  optionIcon: {
    fontSize: 32,
    marginRight: Spacing.md,
  },
  optionIconDisabled: {
    opacity: 0.5,
  },
  optionContent: {
    flex: 1,
  },
  optionTitle: {
    ...Typography.h3,
    color: Colors.text.primary,
    marginBottom: Spacing.xs,
  },
  optionDescription: {
    ...Typography.bodyMedium,
    color: Colors.text.secondary,
    lineHeight: 20,
  },
  optionTextDisabled: {
    color: Colors.text.muted,
  },
  selectionIndicator: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.border.medium,
    backgroundColor: Colors.background.secondary,
    alignItems: "center",
    justifyContent: "center",
  },
  selectionIndicatorActive: {
    borderColor: Colors.primary.main,
    backgroundColor: Colors.primary.main,
  },
  selectionIndicatorDisabled: {
    borderColor: Colors.border.subtle,
    backgroundColor: Colors.background.muted,
  },
  selectionDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.text.onPrimary,
  },
  selectionDotDisabled: {
    backgroundColor: Colors.text.muted,
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

export default EnergyPatternScreen;
