// src/screens/onboarding/WorkStyleScreen.tsx
import React, { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useNavigation } from "@react-navigation/native";
import { Colors, Typography, Spacing, BorderRadius } from "@/constants";
import { OnboardingStackParamList } from "@/components/navigation/OnboardingNavigator";
import OnboardingPageLayout from "@/components/onboarding/OnboardingPageLayout";

type NavigationProp = NativeStackNavigationProp<
  OnboardingStackParamList,
  "WorkStyle"
>;

interface WorkStyleOption {
  id: "deep_focus" | "quick_sprints" | "flexible_mix";
  icon: string;
  title: string;
  description: string;
}

const workStyleOptions: WorkStyleOption[] = [
  {
    id: "deep_focus",
    icon: "🎯",
    title: "Long focus sessions",
    description:
      "I prefer working on tasks for extended periods without interruption",
  },
  {
    id: "quick_sprints",
    icon: "⚡",
    title: "Short Task Bursts",
    description: "I work best with variety and frequent breaks between tasks",
  },
  {
    id: "flexible_mix",
    icon: "🔄",
    title: "Mix It Up",
    description: "I adapt my work style based on the task and my energy level",
  },
];

export const WorkStyleScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const [selectedOption, setSelectedOption] = useState<string>("");

  const handleOptionSelect = (optionId: string) => {
    setSelectedOption(optionId);
  };

  const handleContinue = (additionalInput?: string) => {
    // Save work style and additional input to user profile
    console.log("Selected work style:", selectedOption);
    if (additionalInput) {
      console.log("Additional user input:", additionalInput);
    }

    // Navigate to next screen
    navigation.navigate("CalendarConnection");
  };

  const handleBack = () => {
    navigation.goBack();
  };

  return (
    <OnboardingPageLayout
      title="Work Style"
      subtitle="How do you work best when you have important tasks to complete?"
      onContinue={handleContinue}
      onBack={handleBack}
      canContinue={!!selectedOption}
      inputPlaceholder="work style/ anything more that you'd like to share"
    >
      <View style={styles.optionsContainer}>
        {workStyleOptions.map((option) => (
          <TouchableOpacity
            key={option.id}
            style={[
              styles.optionButton,
              selectedOption === option.id && styles.optionButtonSelected,
            ]}
            onPress={() => handleOptionSelect(option.id)}
            activeOpacity={0.7}
          >
            <Text style={styles.optionIcon}>{option.icon}</Text>
            <View style={styles.optionContent}>
              <Text style={styles.optionTitle}>{option.title}</Text>
              <Text style={styles.optionDescription}>{option.description}</Text>
            </View>
            <View
              style={[
                styles.selectionIndicator,
                selectedOption === option.id && styles.selectionIndicatorActive,
              ]}
            >
              {selectedOption === option.id && (
                <View style={styles.selectionDot} />
              )}
            </View>
          </TouchableOpacity>
        ))}
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
  optionIcon: {
    fontSize: 32,
    marginRight: Spacing.md,
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
  selectionDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.text.onPrimary,
  },
});

export default WorkStyleScreen;
