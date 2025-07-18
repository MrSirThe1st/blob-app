// src/screens/onboarding/OpenConversationScreen.tsx
import { OnboardingStackParamList } from "@/components/navigation/OnboardingNavigator";
import { BorderRadius, Colors, Spacing, Typography } from "@/constants";
import { useOnboarding } from "@/hooks/useOnboarding";
import { navigateToTabAfterOnboarding } from "@/utils/navigationHelpers";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useEffect, useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

type NavigationProp = NativeStackNavigationProp<
  OnboardingStackParamList,
  "OpenConversation"
>;

interface QuickPrompt {
  id: string;
  label: string;
  icon: string;
  type: "important" | "example";
  prompt: string; // Added to provide actual prompt text
}

const quickPrompts: QuickPrompt[] = [
  {
    id: "goals",
    label: "My Goals",
    icon: "🎯",
    type: "important",
    prompt: "I'm currently working on achieving...",
  },
  {
    id: "challenges",
    label: "Challenges",
    icon: "💡",
    type: "example",
    prompt: "I struggle with...",
  },
  {
    id: "routine",
    label: "Daily Life",
    icon: "📅",
    type: "example",
    prompt: "My typical day looks like...",
  },
];

const OpenConversationScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const {
    completeOnboarding,
    loading,
    hasError,
    error,
    clearError,
    completionResult,
  } = useOnboarding();

  const [conversationText, setConversationText] = useState("");
  const [isCompleting, setIsCompleting] = useState(false);

  // Clear any previous errors when component mounts
  useEffect(() => {
    clearError();
  }, [clearError]);

  // Show error alert if there's an error
  useEffect(() => {
    if (hasError && error) {
      Alert.alert("Error", error, [{ text: "OK", onPress: clearError }]);
    }
  }, [hasError, error, clearError]);

  const handleBack = () => {
    navigation.goBack();
  };

  const handleQuickPrompt = (prompt: QuickPrompt) => {
    const currentText = conversationText.trim();
    const newText = currentText
      ? currentText + "\n\n" + prompt.prompt
      : prompt.prompt;
    setConversationText(newText);
  };

  useEffect(() => {
    if (isCompleting && completionResult) {
      setIsCompleting(false);
      if (completionResult.success) {
        Alert.alert(
          "🎉 Welcome to Blob!",
          completionResult.data
            ? `Your productivity system is ready! We've created ${completionResult.data.goalsCreated} personalized goals and ${completionResult.data.tasksGenerated} tasks for you.`
            : completionResult.message || "Setup complete!",
          [
            {
              text: "Let's Go!",
              onPress: () => {
                if (
                  completionResult.redirectTo === "Today" &&
                  completionResult.data?.tasksGenerated > 0
                ) {
                  navigateToTabAfterOnboarding(navigation, "Today", true);
                } else {
                  navigateToTabAfterOnboarding(navigation, "Goals", false);
                }
              },
            },
          ]
        );
      } else {
        Alert.alert(
          "Welcome to Blob!",
          completionResult?.message ||
            "Let's start by creating your first goal.",
          [
            {
              text: "Get Started",
              onPress: () => {
                navigateToTabAfterOnboarding(navigation, "Goals", false);
              },
            },
          ]
        );
      }
    }
  }, [isCompleting, completionResult, navigation]);

  const handleCompleteOnboarding = async () => {
    const text = conversationText.trim();
    if (text.length < 20) {
      Alert.alert(
        "More Information Needed",
        "Please share at least 20 characters about yourself to help Blob understand you better."
      );
      return;
    }
    setIsCompleting(true);
    try {
      await completeOnboarding({ conversationText: text });
    } catch (error) {
      setIsCompleting(false);
      console.error("Error completing onboarding:", error);
      Alert.alert(
        "Welcome to Blob!",
        "There was an issue setting up your account, but don't worry - we can get you started manually.",
        [
          {
            text: "Continue",
            onPress: () => {
              navigateToTabAfterOnboarding(navigation, "Goals", false);
            },
          },
        ]
      );
    }
  };

  const canComplete = conversationText.trim().length >= 20;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={handleBack}
          disabled={loading || isCompleting}
        >
          <Ionicons name="arrow-back" size={24} color={Colors.text.primary} />
        </TouchableOpacity>

        <View style={styles.headerContent}>
          <Text style={styles.title}>Tell Blob About You</Text>
          <Text style={styles.subtitle}>
            Share your goals, challenges, daily routine, or anything else you'd
            like Blob to know. The more you share, the better I can help you
            succeed.
          </Text>
        </View>
      </View>

      {/* Quick Prompts */}
      <View style={styles.quickPromptsContainer}>
        <Text style={styles.quickPromptsLabel}>Quick prompts:</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.quickPromptsScroll}
          contentContainerStyle={styles.quickPromptsContent}
        >
          {quickPrompts.map((prompt) => (
            <TouchableOpacity
              key={prompt.id}
              style={[
                styles.quickPrompt,
                prompt.type === "important" && styles.quickPromptImportant,
              ]}
              onPress={() => handleQuickPrompt(prompt)}
              disabled={loading || isCompleting}
            >
              <Text style={styles.quickPromptIcon}>{prompt.icon}</Text>
              <Text
                style={[
                  styles.quickPromptLabel,
                  prompt.type === "important" &&
                    styles.quickPromptLabelImportant,
                ]}
              >
                {prompt.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Main Input Area */}
      <View style={styles.inputContainer}>
        <ScrollView
          style={styles.inputScrollView}
          showsVerticalScrollIndicator={false}
        >
          <TextInput
            style={styles.conversationInput}
            placeholder="Start typing here... Tell me about your goals, challenges, daily routine, or anything else you'd like me to know."
            placeholderTextColor={Colors.text.muted}
            value={conversationText}
            onChangeText={setConversationText}
            multiline={true}
            textAlignVertical="top"
            editable={!loading && !isCompleting}
            autoFocus={true}
          />
        </ScrollView>

        {/* Character Count */}
        <View style={styles.characterCount}>
          <Text
            style={[
              styles.characterCountText,
              conversationText.length >= 20 && styles.characterCountValid,
            ]}
          >
            {conversationText.length}/20 characters minimum
          </Text>
        </View>
      </View>

      {/* Complete Button */}
      <View style={styles.completeButtonContainer}>
        <TouchableOpacity
          style={[
            styles.completeButton,
            canComplete && styles.completeButtonEnabled,
            (loading || isCompleting || !canComplete) &&
              styles.completeButtonDisabled,
          ]}
          onPress={handleCompleteOnboarding}
          disabled={loading || isCompleting || !canComplete}
        >
          {isCompleting || loading ? (
            <View style={styles.loadingContainer}>
              <Text style={styles.completeButtonText}>Setting up Blob...</Text>
            </View>
          ) : (
            <Text
              style={[
                styles.completeButtonText,
                !canComplete && styles.completeButtonTextDisabled,
              ]}
            >
              Complete Setup
            </Text>
          )}
        </TouchableOpacity>

        {!canComplete && (
          <Text style={styles.completeHelpText}>
            Share a bit more about yourself to continue
          </Text>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.primary,
  },

  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingTop: Spacing.xl,
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.lg,
  },

  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.background.secondary,
    alignItems: "center",
    justifyContent: "center",
    marginRight: Spacing.md,
  },

  headerContent: {
    flex: 1,
  },

  title: {
    ...Typography.h1,
    color: Colors.text.primary,
    marginBottom: Spacing.sm,
    fontWeight: "700",
  },

  subtitle: {
    ...Typography.bodyLarge,
    color: Colors.text.secondary,
    lineHeight: 24,
  },

  quickPromptsContainer: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.lg,
  },

  quickPromptsLabel: {
    ...Typography.captionMedium,
    color: Colors.text.secondary,
    marginBottom: Spacing.sm,
    fontWeight: "500",
  },

  quickPromptsScroll: {
    flexGrow: 0,
  },

  quickPromptsContent: {
    gap: Spacing.md,
    paddingRight: Spacing.lg, // Add padding for last item
  },

  quickPrompt: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.background.secondary,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border.subtle,
  },

  quickPromptImportant: {
    backgroundColor: Colors.background.accent,
    borderColor: Colors.primary.light,
  },

  quickPromptIcon: {
    fontSize: 16,
    marginRight: Spacing.xs,
  },

  quickPromptLabel: {
    ...Typography.captionMedium,
    color: Colors.text.secondary,
    fontWeight: "500",
  },

  quickPromptLabelImportant: {
    color: Colors.text.primary,
    fontWeight: "600",
  },

  inputContainer: {
    flex: 1,
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
    backgroundColor: Colors.background.card,
    borderRadius: BorderRadius.blob.medium,
    borderWidth: 1,
    borderColor: Colors.border.light,
    padding: Spacing.lg,
  },

  inputScrollView: {
    flex: 1,
  },

  conversationInput: {
    ...Typography.bodyMedium,
    color: Colors.text.primary,
    minHeight: 200,
    lineHeight: 24,
    fontSize: 16,
  },

  characterCount: {
    alignItems: "flex-end",
    paddingTop: Spacing.sm,
  },

  characterCountText: {
    ...Typography.captionSmall,
    color: Colors.text.muted,
  },

  characterCountValid: {
    color: Colors.success,
    fontWeight: "600",
  },

  completeButtonContainer: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xl,
    alignItems: "center",
  },

  completeButton: {
    width: "100%",
    paddingVertical: Spacing.lg,
    borderRadius: BorderRadius.lg,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.sm,
  },

  completeButtonEnabled: {
    backgroundColor: Colors.primary.main,
    shadowColor: Colors.primary.main,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },

  completeButtonDisabled: {
    backgroundColor: Colors.background.muted,
  },

  loadingContainer: {
    flexDirection: "row",
    alignItems: "center",
  },

  completeButtonText: {
    ...Typography.buttonLarge,
    color: Colors.text.onPrimary,
    fontWeight: "700",
  },

  completeButtonTextDisabled: {
    color: Colors.text.muted,
  },

  completeHelpText: {
    ...Typography.captionMedium,
    color: Colors.text.muted,
    textAlign: "center",
  },
});

export default OpenConversationScreen;
