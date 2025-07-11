import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  ScrollView,
} from "react-native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { Colors, Typography, Spacing, BorderRadius } from "@/constants";
import OnboardingPageLayout from "@/components/onboarding/OnboardingPageLayout";
import { OnboardingStackParamList } from "@/components/navigation/OnboardingNavigator";

type NavigationProp = NativeStackNavigationProp<
  OnboardingStackParamList,
  "OpenConversation"
>;

interface QuickPrompt {
  id: string;
  label: string;
  icon: string;
  type: "important" | "example";
}

const quickPrompts: QuickPrompt[] = [
  {
    id: "important",
    label: "Important",
    icon: "❗",
    type: "important",
  },
  {
    id: "example",
    label: "example",
    icon: "💡",
    type: "example",
  },
];

const OpenConversationScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const [conversationText, setConversationText] = useState("");
  const [isCompleting, setIsCompleting] = useState(false);

  const handleContinue = (additionalInput?: string) => {
    // Combine main conversation text with any additional input
    const fullConversation =
      conversationText + (additionalInput ? `\n\n${additionalInput}` : "");

    if (fullConversation.trim()) {
      console.log("User conversation:", fullConversation);
    }

    // Complete onboarding
    handleCompleteOnboarding();
  };

  const handleBack = () => {
    navigation.goBack();
  };

  const handleCompleteOnboarding = async () => {
    setIsCompleting(true);

    try {
      // TODO: Save conversation data and mark onboarding as complete
      console.log("Onboarding completed!");

      // Navigate to main app
      // For now, just simulate completion
      setTimeout(() => {
        setIsCompleting(false);
        // TODO: Navigate to main app
        console.log("Navigate to main app");
      }, 2000);
    } catch (error) {
      setIsCompleting(false);
      console.error("Error completing onboarding:", error);
    }
  };

  const handleQuickPrompt = (prompt: QuickPrompt) => {
    let promptText = "";

    switch (prompt.id) {
      case "important":
        promptText = "Something important I want you to know is: ";
        break;
      case "example":
        promptText = "For example, ";
        break;
    }

    setConversationText((prev) => prev + promptText);
  };

  const canContinue = conversationText.trim().length > 0;

  return (
    <OnboardingPageLayout
      title="Open Conversation"
      subtitle="Tell me everything about yourself, your goals, what you're working on in the long run or anything else that has to do with you getting this app, you'll be able to edit these later"
      onBack={handleBack}
      onContinue={handleContinue}
      canContinue={canContinue}
      inputPlaceholder="work, career, gym, health, projects. Write in details what you would like to achieve"
    >
      <View style={styles.container}>
        {/* Main Conversation Input */}
        <View style={styles.conversationSection}>
          <TextInput
            style={styles.conversationInput}
            placeholder="Share your goals, challenges, and what you hope to achieve with Blob..."
            placeholderTextColor={Colors.text.muted}
            value={conversationText}
            onChangeText={setConversationText}
            multiline
            textAlignVertical="top"
          />
        </View>

        {/* Quick Prompts */}
        <View style={styles.quickPromptsSection}>
          <Text style={styles.quickPromptsTitle}>Quick prompts:</Text>
          <View style={styles.quickPrompts}>
            {quickPrompts.map((prompt) => (
              <TouchableOpacity
                key={prompt.id}
                style={[
                  styles.quickPromptButton,
                  prompt.type === "important" && styles.importantPrompt,
                  prompt.type === "example" && styles.examplePrompt,
                ]}
                onPress={() => handleQuickPrompt(prompt)}
                activeOpacity={0.7}
              >
                <View style={styles.promptIcon}>
                  <Text style={styles.promptIconText}>{prompt.icon}</Text>
                </View>
                <Text
                  style={[
                    styles.promptLabel,
                    prompt.type === "important" && styles.importantLabel,
                    prompt.type === "example" && styles.exampleLabel,
                  ]}
                >
                  {prompt.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Completion Status */}
        {isCompleting && (
          <View style={styles.completionStatus}>
            <View style={styles.completionCard}>
              <Ionicons
                name="checkmark-circle"
                size={32}
                color={Colors.success.main}
              />
              <Text style={styles.completionText}>
                Setting up your personalized Blob experience...
              </Text>
            </View>
          </View>
        )}

        {/* Encouragement Section */}
        {conversationText.trim().length > 0 && (
          <View style={styles.encouragementSection}>
            <View style={styles.encouragementCard}>
              <Text style={styles.encouragementTitle}>Great start! 🎉</Text>
              <Text style={styles.encouragementText}>
                The more you share, the better Blob can personalize your
                experience. Feel free to add anything else that comes to mind.
              </Text>
            </View>
          </View>
        )}
      </View>
    </OnboardingPageLayout>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    gap: Spacing.lg,
  },

  conversationSection: {
    flex: 1,
    minHeight: 200,
  },

  conversationInput: {
    flex: 1,
    backgroundColor: Colors.background.card,
    borderRadius: BorderRadius.blob.medium,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border.light,
    ...Typography.bodyMedium,
    color: Colors.text.primary,
    textAlignVertical: "top",
    shadowColor: Colors.neutral[200],
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },

  quickPromptsSection: {
    marginBottom: Spacing.md,
  },

  quickPromptsTitle: {
    ...Typography.bodyMedium,
    color: Colors.text.secondary,
    marginBottom: Spacing.sm,
    fontWeight: "500",
  },

  quickPrompts: {
    flexDirection: "row",
    gap: Spacing.md,
  },

  quickPromptButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: 20,
    borderWidth: 1,
    gap: Spacing.xs,
  },

  importantPrompt: {
    backgroundColor: Colors.background.card,
    borderColor: Colors.error.main,
  },

  examplePrompt: {
    backgroundColor: Colors.background.secondary,
    borderColor: Colors.border.medium,
  },

  promptIcon: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: Colors.text.primary,
    justifyContent: "center",
    alignItems: "center",
  },

  promptIconText: {
    fontSize: 12,
  },

  promptLabel: {
    ...Typography.captionMedium,
    fontWeight: "500",
  },

  importantLabel: {
    color: Colors.error.main,
  },

  exampleLabel: {
    color: Colors.text.primary,
  },

  encouragementSection: {
    marginTop: Spacing.lg,
  },

  encouragementCard: {
    backgroundColor: Colors.glass.background,
    borderRadius: BorderRadius.blob.small,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.glass.border,
  },

  encouragementTitle: {
    ...Typography.h4,
    color: Colors.text.primary,
    marginBottom: Spacing.sm,
    fontWeight: "600",
  },

  encouragementText: {
    ...Typography.bodyMedium,
    color: Colors.text.secondary,
    lineHeight: 22,
  },

  completionStatus: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },

  completionCard: {
    backgroundColor: Colors.background.card,
    borderRadius: BorderRadius.blob.medium,
    padding: Spacing.xl,
    alignItems: "center",
    shadowColor: Colors.neutral[400],
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 10,
    margin: Spacing.lg,
  },

  completionText: {
    ...Typography.h4,
    color: Colors.text.primary,
    textAlign: "center",
    marginTop: Spacing.md,
    fontWeight: "500",
  },
});

export default OpenConversationScreen;
