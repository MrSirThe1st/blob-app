import {
  BorderRadius,
  Colors,
  Padding,
  Spacing,
  Typography,
} from "@/constants";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { useOnboarding } from "@/hooks/useOnboarding";
import { navigateToTabAfterOnboarding } from "@/utils/navigationHelpers";
import { useNavigation } from "@react-navigation/native";

const OnboardingScreen = () => {
  const { completeOnboarding } = useOnboarding();
  const navigation = useNavigation();
  const [isCompleting, setIsCompleting] = useState(false);

  const handleCompleteOnboarding = async () => {
    try {
      setIsCompleting(true);

      console.log("🚀 Completing onboarding with automatic goal creation...");

      // For MVP, we'll use a simple conversation text since you don't have the full conversational UI yet
      // In Phase 2, this will be replaced with actual conversation data
      const mockConversationText = `I want to be more productive and organized. I struggle with staying focused and managing my time effectively. I'd like to build better habits and achieve my goals more consistently. I'm interested in fitness and learning new skills, but I often get overwhelmed and don't follow through.`;

      // Call the enhanced completion method that will create goals automatically
      const result = await completeOnboarding(mockConversationText);

      if (result.success) {
        // Show success message with details about what was created
        Alert.alert(
          "🎉 Welcome to Blob!",
          result.data
            ? `Your productivity system is ready! We've created ${result.data.goalsCreated} personalized goals and ${result.data.tasksGenerated} tasks for you.`
            : result.message,
          [
            {
              text: "Let's Go!",
              onPress: () => {
                // Navigate based on what was created
                if (
                  result.redirectTo === "Today" &&
                  result.data?.tasksGenerated > 0
                ) {
                  // Instead of navigation.reset({...})
                  navigateToTabAfterOnboarding(navigation, "Today", true);
                } else {
                  navigateToTabAfterOnboarding(navigation, "Goals", false);
                }
              },
            },
          ]
        );
      } else {
        // Fallback to manual goal creation
        Alert.alert(
          "Welcome to Blob!",
          result.message || "Let's start by creating your first goal.",
          [
            {
              text: "Get Started",
              onPress: () => {
                // Instead of navigation.reset({...})
                navigateToTabAfterOnboarding(navigation, "Goals", false);
              },
            },
          ]
        );
      }
    } catch (error) {
      console.error("Error completing onboarding:", error);
      Alert.alert(
        "Welcome to Blob!",
        "There was an issue setting up your account, but don't worry - we can get you started manually.",
        [
          {
            text: "Continue",
            onPress: () => {
              // Instead of navigation.reset({...})
              navigateToTabAfterOnboarding(navigation, "Goals", false);
            },
          },
        ]
      );
    } finally {
      setIsCompleting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.emoji}>🌊</Text>
          <Text style={styles.title}>Welcome to Blob AI!</Text>
          <Text style={styles.subtitle}>
            Let's get you set up for productivity success
          </Text>
        </View>

        {/* Onboarding Steps */}
        <View style={styles.steps}>
          <View style={styles.step}>
            <Text style={styles.stepIcon}>🎯</Text>
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>Discover Your Goals</Text>
              <Text style={styles.stepDescription}>
                Tell us what you want to achieve and we'll help you get there
              </Text>
            </View>
          </View>

          <View style={styles.step}>
            <Text style={styles.stepIcon}>🧠</Text>
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>Learn Your Style</Text>
              <Text style={styles.stepDescription}>
                Our AI will adapt to your working patterns and preferences
              </Text>
            </View>
          </View>

          <View style={styles.step}>
            <Text style={styles.stepIcon}>📅</Text>
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>Connect Your Calendar</Text>
              <Text style={styles.stepDescription}>
                Sync with your existing calendar for seamless scheduling
              </Text>
            </View>
          </View>

          <View style={styles.step}>
            <Text style={styles.stepIcon}>🤝</Text>
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>Find Your Buddy</Text>
              <Text style={styles.stepDescription}>
                Get matched with an accountability partner for motivation
              </Text>
            </View>
          </View>
        </View>

        {/* Action Button */}
        <View style={styles.actions}>
          <TouchableOpacity
            style={[
              styles.continueButton,
              isCompleting && styles.buttonDisabled,
            ]}
            onPress={handleCompleteOnboarding}
            disabled={isCompleting}
          >
            {isCompleting ? (
              <>
                <ActivityIndicator color={Colors.text.onPrimary} />
                <Text style={[styles.continueButtonText, { marginLeft: 8 }]}>
                  Creating Your Goals...
                </Text>
              </>
            ) : (
              <Text style={styles.continueButtonText}>Start My Journey</Text>
            )}
          </TouchableOpacity>

          <Text style={styles.note}>
            We'll automatically create personalized goals and tasks based on
            your preferences.
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.primary,
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xl,
    justifyContent: "space-between",
  },
  header: {
    alignItems: "center",
    paddingTop: Spacing.xl,
  },
  emoji: {
    fontSize: 64,
    marginBottom: Spacing.lg,
  },
  title: {
    ...Typography.h1,
    color: Colors.text.primary,
    textAlign: "center",
    marginBottom: Spacing.md,
  },
  subtitle: {
    ...Typography.bodyLarge,
    color: Colors.text.secondary,
    textAlign: "center",
    lineHeight: 24,
  },
  steps: {
    paddingVertical: Spacing.xl,
    gap: Spacing.lg,
  },
  step: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: Colors.background.card,
    padding: Spacing.lg,
    borderRadius: BorderRadius.blob.medium,
  },
  stepIcon: {
    fontSize: 24,
    marginRight: Spacing.md,
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    ...Typography.h3,
    color: Colors.text.primary,
    marginBottom: Spacing.sm,
  },
  stepDescription: {
    ...Typography.bodyMedium,
    color: Colors.text.secondary,
    lineHeight: 20,
  },
  actions: {
    paddingBottom: Spacing.xl,
    alignItems: "center",
  },
  continueButton: {
    backgroundColor: Colors.primary.main,
    paddingHorizontal: Padding.button.large.horizontal,
    paddingVertical: Padding.button.large.vertical,
    borderRadius: BorderRadius.lg,
    alignItems: "center",
    width: "100%",
    marginBottom: Spacing.md,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  continueButtonText: {
    ...Typography.buttonLarge,
    color: Colors.text.onPrimary,
  },
  note: {
    ...Typography.captionSmall,
    color: Colors.text.muted,
    textAlign: "center",
    fontStyle: "italic",
  },
});

export default OnboardingScreen;
