// src/screens/onboarding/StressResponseScreen.tsx
import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { Colors, Typography, Spacing, BorderRadius } from "@/constants";
import OnboardingPageLayout from "@/components/onboarding/OnboardingPageLayout";
import { OnboardingStackParamList } from "@/components/navigation/OnboardingNavigator";
import { useOnboarding } from "@/hooks/useOnboarding";

type NavigationProp = NativeStackNavigationProp<
  OnboardingStackParamList,
  "StressResponse"
>;

interface StressResponseOption {
  id: string;
  emoji: string;
  title: string;
  subtitle: string;
  description: string;
  value: "reduce" | "structure" | "support";
}

const stressResponseOptions: StressResponseOption[] = [
  {
    id: "reduce",
    emoji: "🧘",
    title: "Less & Slower",
    subtitle: "When overwhelmed, I need to scale back",
    description: "Reduce tasks, extend deadlines, add more breaks",
    value: "reduce",
  },
  {
    id: "structure",
    emoji: "📝",
    title: "Structure & Clarity",
    subtitle: "When stressed, I need clear direction",
    description: "Detailed plans, clear priorities, step-by-step guidance",
    value: "structure",
  },
  {
    id: "support",
    emoji: "👥",
    title: "Support & Connection",
    subtitle: "When struggling, I need encouragement",
    description: "Check-ins, encouragement, buddy assistance",
    value: "support",
  },
];

const StressResponseScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const {
    saveStepAndContinue,
    isLoading,
    hasError,
    errorMessage,
    clearError,
    goBackStep,
  } = useOnboarding();

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

  const handleContinue = async (additionalInput?: string) => {
    // Prepare step data
    const stepData = {
      stressResponse:
        (selectedOption as "reduce" | "structure" | "support") || undefined,
    };

    // Save step and continue
    const success = await saveStepAndContinue(stepData, additionalInput);

    if (success) {
      // Navigate to next screen - CalendarConnection
      navigation.navigate("CalendarConnection");
    }
    // If not successful, error handling is done in the hook
  };

  const handleBack = () => {
    goBackStep();
    navigation.goBack();
  };

  const handleOptionSelect = (optionValue: string) => {
    setSelectedOption(optionValue);
    // Clear errors when user makes a selection
    if (hasError) {
      clearError();
    }
  };

  return (
    <OnboardingPageLayout
      title="Stress Response"
      subtitle="When you're overwhelmed, what helps you most? This helps Blob adapt when you need support."
      onBack={handleBack}
      onContinue={handleContinue}
      canContinue={!!selectedOption}
      inputPlaceholder="stress response/ anything more that you'd like to share"
      isLoading={isLoading}
      validationMessage="Please either select a stress response or provide at least 10 characters describing how you handle stress."
    >
      <View style={styles.optionsContainer}>
        {stressResponseOptions.map((option) => (
          <StressResponseCard
            key={option.id}
            option={option}
            isSelected={selectedOption === option.value}
            onSelect={() => handleOptionSelect(option.value)}
            isLoading={isLoading}
          />
        ))}
      </View>

      {/* Show additional help text */}
      <View style={styles.helpContainer}>
        <Text style={styles.helpText}>
          💡 This helps Blob adjust your schedule and provide the right type of
          support during stressful times
        </Text>
      </View>
    </OnboardingPageLayout>
  );
};

interface StressResponseCardProps {
  option: StressResponseOption;
  isSelected: boolean;
  onSelect: () => void;
  isLoading: boolean;
}

const StressResponseCard: React.FC<StressResponseCardProps> = ({
  option,
  isSelected,
  onSelect,
  isLoading,
}) => {
  return (
    <View style={styles.cardContainer}>
      <TouchableOpacity
        style={[
          styles.optionCard,
          isSelected && styles.selectedCard,
          isLoading && styles.cardDisabled,
        ]}
        onPress={onSelect}
        activeOpacity={0.8}
        disabled={isLoading}
      >
        <View style={styles.cardHeader}>
          <View
            style={[
              styles.emojiContainer,
              isLoading && styles.emojiContainerDisabled,
            ]}
          >
            <Text style={[styles.emoji, isLoading && styles.emojiDisabled]}>
              {option.emoji}
            </Text>
          </View>
          <View
            style={[
              styles.selectionIndicator,
              isSelected && styles.selectionIndicatorSelected,
              isLoading && styles.selectionIndicatorDisabled,
            ]}
          >
            {isSelected && (
              <Ionicons
                name="checkmark"
                size={16}
                color={isLoading ? Colors.text.muted : Colors.text.onPrimary}
              />
            )}
          </View>
        </View>

        <View style={styles.cardContent}>
          <Text style={[styles.optionTitle, isLoading && styles.textDisabled]}>
            {option.title}
          </Text>
          <Text
            style={[styles.optionSubtitle, isLoading && styles.textDisabled]}
          >
            {option.subtitle}
          </Text>
          <Text
            style={[styles.optionDescription, isLoading && styles.textDisabled]}
          >
            {option.description}
          </Text>
        </View>

        {isSelected && !isLoading && <View style={styles.glassOverlay} />}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  optionsContainer: {
    flex: 1,
    gap: Spacing.lg,
    marginBottom: Spacing.xl,
  },

  cardContainer: {
    width: "100%",
  },

  optionCard: {
    backgroundColor: Colors.background.card,
    borderRadius: BorderRadius.blob.medium,
    padding: Spacing.lg,
    borderWidth: 2,
    borderColor: Colors.border.light,
    shadowColor: Colors.neutral[200],
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
    position: "relative",
    overflow: "hidden",
  },

  selectedCard: {
    borderColor: Colors.primary.main,
    backgroundColor: Colors.background.accent,
    shadowColor: Colors.primary.main,
    shadowOpacity: 0.2,
    elevation: 8,
  },

  cardDisabled: {
    opacity: 0.6,
    shadowOpacity: 0,
    elevation: 0,
  },

  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: Spacing.md,
  },

  emojiContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.background.primary,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: Colors.neutral[300],
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },

  emojiContainerDisabled: {
    backgroundColor: Colors.background.muted,
    shadowOpacity: 0,
    elevation: 0,
  },

  emoji: {
    fontSize: 32,
  },

  emojiDisabled: {
    opacity: 0.5,
  },

  selectionIndicator: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.border.medium,
    backgroundColor: Colors.background.secondary,
    justifyContent: "center",
    alignItems: "center",
  },

  selectionIndicatorSelected: {
    backgroundColor: Colors.primary.main,
    borderColor: Colors.primary.main,
  },

  selectionIndicatorDisabled: {
    backgroundColor: Colors.background.muted,
    borderColor: Colors.border.subtle,
  },

  cardContent: {
    flex: 1,
  },

  optionTitle: {
    ...Typography.h3,
    color: Colors.text.primary,
    marginBottom: Spacing.xs,
    fontWeight: "700",
  },

  optionSubtitle: {
    ...Typography.bodyMedium,
    color: Colors.text.secondary,
    marginBottom: Spacing.sm,
    lineHeight: 22,
  },

  optionDescription: {
    ...Typography.bodySmall,
    color: Colors.text.tertiary,
    lineHeight: 20,
    fontStyle: "italic",
  },

  textDisabled: {
    color: Colors.text.muted,
  },

  glassOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(235, 100, 35, 0.05)",
    borderRadius: BorderRadius.blob.medium,
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

export default StressResponseScreen;
