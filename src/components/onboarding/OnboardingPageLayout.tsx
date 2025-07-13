// src/components/onboarding/OnboardingPageLayout.tsx
import React, { useState } from "react";
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { Colors, Typography, Spacing, BorderRadius } from "@/constants";

interface OnboardingPageLayoutProps {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  onContinue: (additionalInput?: string) => void;
  onBack?: () => void;
  canContinue?: boolean;
  inputPlaceholder: string;
  isLoading?: boolean;
  validationMessage?: string;
}

const OnboardingPageLayout: React.FC<OnboardingPageLayoutProps> = ({
  title,
  subtitle,
  children,
  onContinue,
  onBack,
  canContinue = false,
  inputPlaceholder,
  isLoading = false,
  validationMessage,
}) => {
  const [additionalInput, setAdditionalInput] = useState("");

  const hasInput = additionalInput.trim().length > 0;
  const hasMeaningfulInput = additionalInput.trim().length >= 10;

  // User can proceed if they have a selection OR meaningful input
  const canActuallyProceed = canContinue || hasMeaningfulInput;

  const handleContinue = () => {
    if (!canActuallyProceed && !isLoading) {
      const message =
        validationMessage ||
        "Please make a selection or provide at least 10 characters describing your choice.";
      Alert.alert("Input Required", message);
      return;
    }

    onContinue(additionalInput.trim() || undefined);
  };

  const handleBack = () => {
    if (onBack && !isLoading) {
      onBack();
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboardAvoid}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        {/* Main Content Area */}
        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.subtitle}>{subtitle}</Text>
          </View>

          {/* Page Content */}
          <View style={styles.content}>{children}</View>
        </ScrollView>

        {/* Bottom Input Bar */}
        <View style={styles.bottomBar}>
          {/* Combined Input + Navigation Component with both buttons inside */}
          <View style={styles.inputNavContainer}>
            {/* Back Button INSIDE the input on the left */}
            {onBack && (
              <TouchableOpacity
                style={[
                  styles.backButtonInside,
                  isLoading && styles.buttonDisabled,
                ]}
                onPress={handleBack}
                activeOpacity={0.7}
                disabled={isLoading}
              >
                <MaterialIcons
                  name="arrow-back"
                  size={20}
                  color={isLoading ? "#999" : "#FFFFFF"}
                />
              </TouchableOpacity>
            )}

            <TextInput
              style={[styles.textInput, isLoading && styles.textInputDisabled]}
              placeholder={inputPlaceholder}
              placeholderTextColor={Colors.text.muted}
              value={additionalInput}
              onChangeText={setAdditionalInput}
              multiline={false}
              returnKeyType="done"
              onSubmitEditing={handleContinue}
              editable={!isLoading}
            />

            {/* Arrow/Checkmark Button INSIDE the input on the right */}
            <TouchableOpacity
              style={[
                styles.navButtonInside,
                hasMeaningfulInput && styles.submitButtonInside,
                !canActuallyProceed && styles.buttonDisabled,
                isLoading && styles.buttonLoading,
              ]}
              onPress={handleContinue}
              activeOpacity={0.7}
              disabled={isLoading}
            >
              {isLoading ? (
                <MaterialIcons
                  name="hourglass-empty"
                  size={20}
                  color="#FFFFFF"
                />
              ) : (
                <MaterialIcons
                  name={hasMeaningfulInput ? "check" : "arrow-forward"}
                  size={20}
                  color={canActuallyProceed ? "#FFFFFF" : "#999"}
                />
              )}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.primary,
  },
  keyboardAvoid: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xl,
  },
  header: {
    marginBottom: Spacing.xl,
    paddingHorizontal: Spacing.md,
  },
  title: {
    ...Typography.h1,
    color: Colors.text.primary,
    marginBottom: Spacing.md,
    textAlign: "left",
    fontWeight: "700",
  },
  subtitle: {
    ...Typography.bodyLarge,
    color: Colors.text.secondary,
    lineHeight: 26,
    textAlign: "left",
  },
  content: {
    flex: 1,
    justifyContent: "center",
    minHeight: 300,
  },

  // Bottom Bar with Combined Input + Navigation - Updated styling
  bottomBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.lg,
    paddingBottom: Platform.OS === "ios" ? Spacing["2xl"] : Spacing.lg,
    backgroundColor: Colors.background.primary,
    gap: Spacing.md,
  },

  // Combined Input + Navigation Component - Improved styling
  inputNavContainer: {
    flex: 1,
    height: 56,
    backgroundColor: "rgba(255, 255, 255, 0.9)", // Glassy effect
    borderRadius: 28,
    borderWidth: 1,
    borderColor: "rgba(228, 228, 228, 0.6)",
    flexDirection: "row",
    alignItems: "center",
    paddingLeft: Spacing.lg,
    paddingRight: Spacing.xs,
    shadowColor: "rgba(0, 0, 0, 0.1)",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    // Glassy backdrop effect
    backdropFilter: "blur(10px)",
  },

  textInput: {
    ...Typography.bodyMedium,
    color: Colors.text.primary,
    flex: 1,
    height: "100%",
    paddingVertical: 0,
    textAlignVertical: "center",
    fontSize: 16,
    paddingHorizontal: Spacing.md,
  },

  textInputDisabled: {
    color: Colors.text.muted,
  },

  // Arrow/Checkmark Button INSIDE the input - Enhanced styling
  navButtonInside: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#EB6423", // Hardcoded orange to ensure visibility
    alignItems: "center",
    justifyContent: "center",
    marginLeft: Spacing.sm,
    shadowColor: "#EB6423",
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 4,
  },
  backButtonInside: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#EB6423",
    alignItems: "center",
    justifyContent: "center",
    marginRight: Spacing.sm,
    shadowColor: "#EB6423",
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 4,
  },

  submitButtonInside: {
    backgroundColor: "#4CAF50", // Hardcoded green to ensure visibility
    shadowColor: "#4CAF50",
  },

  buttonDisabled: {
    backgroundColor: "#CCCCCC",
    shadowOpacity: 0,
    elevation: 0,
  },

  buttonLoading: {
    backgroundColor: "#999999",
  },
});

export default OnboardingPageLayout;
