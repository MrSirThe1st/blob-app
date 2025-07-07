import {
  BorderRadius,
  Colors,
  Padding,
  Spacing,
  Typography,
} from "@/constants";
import { useAuth } from "@/hooks/useAuth";
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

const OnboardingScreen = () => {
  const { updateProfile, userProfile } = useAuth();
  const [isCompleting, setIsCompleting] = useState(false);

  const completeOnboarding = async () => {
    setIsCompleting(true);
    try {
      const { error } = await updateProfile({
        onboardingCompleted: true,
        onboardingStep: 0, // Reset to 0 since completed
      });

      if (error) {
        Alert.alert("Error", "Failed to complete onboarding");
        console.error("Onboarding completion error:", error);
      }
      // Navigation will be handled automatically by AuthNavigator
    } catch (err) {
      Alert.alert("Error", "An unexpected error occurred");
      console.error("Onboarding error:", err);
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
            onPress={completeOnboarding}
            disabled={isCompleting}
          >
            {isCompleting ? (
              <ActivityIndicator color={Colors.text.onPrimary} />
            ) : (
              <Text style={styles.continueButtonText}>Start My Journey</Text>
            )}
          </TouchableOpacity>

          <Text style={styles.note}>
            This is a simplified onboarding for MVP. The full conversational AI
            onboarding will be implemented in Phase 2.
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
