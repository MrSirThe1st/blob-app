import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
} from "react-native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { Colors, Typography, Spacing, BorderRadius } from "@/constants";
import OnboardingPageLayout from "@/components/onboarding/OnboardingPageLayout";
import { OnboardingStackParamList } from "@/components/navigation/OnboardingNavigator";

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
  const [selectedOption, setSelectedOption] = useState<string | null>(null);

  const handleContinue = (additionalInput?: string) => {
    if (!selectedOption) {
      return; // OnboardingPageLayout will handle validation
    }

    // Store the stress response preference
    console.log("Selected stress response:", selectedOption);
    if (additionalInput) {
      console.log("Additional stress response input:", additionalInput);
    }

    // Navigate to next step
    navigation.navigate("CalendarConnection");
  };

  const handleBack = () => {
    navigation.goBack();
  };

  const handleOptionSelect = (optionId: string) => {
    setSelectedOption(optionId);
  };

  return (
    <OnboardingPageLayout
      title="Stress Response"
      subtitle="When you're overwhelmed, what helps you most? This helps Blob adapt when you need support."
      onBack={handleBack}
      onContinue={handleContinue}
      canContinue={!!selectedOption}
      inputPlaceholder="stress response/ anything more that you'd like to share"
    >
      <View style={styles.optionsContainer}>
        {stressResponseOptions.map((option) => (
          <StressResponseCard
            key={option.id}
            option={option}
            isSelected={selectedOption === option.id}
            onSelect={() => handleOptionSelect(option.id)}
          />
        ))}
      </View>

      {selectedOption && (
        <View style={styles.selectionFeedback}>
          <View style={styles.feedbackCard}>
            <Text style={styles.feedbackTitle}>
              Perfect! Here's how Blob will help you:
            </Text>
            <Text style={styles.feedbackText}>
              {getFeedbackText(selectedOption)}
            </Text>
          </View>
        </View>
      )}
    </OnboardingPageLayout>
  );
};

interface StressResponseCardProps {
  option: StressResponseOption;
  isSelected: boolean;
  onSelect: () => void;
}

const StressResponseCard: React.FC<StressResponseCardProps> = ({
  option,
  isSelected,
  onSelect,
}) => {
  return (
    <View style={styles.cardContainer}>
      <TouchableOpacity
        style={[styles.optionCard, isSelected && styles.selectedCard]}
        onPress={onSelect}
        activeOpacity={0.8}
      >
        {/* Selection Indicator */}
        <View style={styles.cardHeader}>
          <View style={styles.emojiContainer}>
            <Text style={styles.emoji}>{option.emoji}</Text>
          </View>
          <View
            style={[
              styles.selectionIndicator,
              isSelected && styles.selectionIndicatorSelected,
            ]}
          >
            {isSelected && (
              <Ionicons
                name="checkmark"
                size={16}
                color={Colors.text.onPrimary}
              />
            )}
          </View>
        </View>

        {/* Card Content */}
        <View style={styles.cardContent}>
          <Text style={styles.optionTitle}>{option.title}</Text>
          <Text style={styles.optionSubtitle}>{option.subtitle}</Text>
          <Text style={styles.optionDescription}>{option.description}</Text>
        </View>

        {/* Glass Effect Overlay */}
        {isSelected && <View style={styles.glassOverlay} />}
      </TouchableOpacity>
    </View>
  );
};

const getFeedbackText = (option: string): string => {
  switch (option) {
    case "reduce":
      return "When Blob detects you're overwhelmed, it will automatically reduce your task load, suggest longer breaks, and extend deadlines to give you breathing room.";
    case "structure":
      return "When you're stressed, Blob will break down complex tasks into smaller steps, provide detailed schedules, and offer clear priorities to help you focus.";
    case "support":
      return "During tough times, Blob will check in on you more frequently, connect you with your buddy, and provide extra encouragement to keep you motivated.";
    default:
      return "";
  }
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

  emoji: {
    fontSize: 32,
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

  glassOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(235, 100, 35, 0.05)",
    borderRadius: BorderRadius.blob.medium,
  },

  selectionFeedback: {
    marginTop: Spacing.lg,
    marginBottom: Spacing.xl,
  },

  feedbackCard: {
    backgroundColor: Colors.glass.background,
    borderRadius: BorderRadius.blob.small,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.glass.border,
    backdropFilter: "blur(10px)",
  },

  feedbackTitle: {
    ...Typography.h4,
    color: Colors.text.primary,
    marginBottom: Spacing.sm,
    fontWeight: "600",
  },

  feedbackText: {
    ...Typography.bodyMedium,
    color: Colors.text.secondary,
    lineHeight: 24,
  },
});

export default StressResponseScreen;
