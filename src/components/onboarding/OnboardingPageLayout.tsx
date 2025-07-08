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
} from "react-native";
import { Colors, Typography, Spacing, BorderRadius } from "@/constants";

interface OnboardingPageLayoutProps {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  onContinue: (additionalInput?: string) => void;
  onBack?: () => void;
  canContinue?: boolean;
  inputPlaceholder: string; // e.g., "energy pattern/ anything more that you'd like to share"
}

const OnboardingPageLayout: React.FC<OnboardingPageLayoutProps> = ({
  title,
  subtitle,
  children,
  onContinue,
  onBack,
  canContinue = true,
  inputPlaceholder,
}) => {
  const [additionalInput, setAdditionalInput] = useState("");

  const hasInput = additionalInput.trim().length > 0;

  const handleContinue = () => {
    onContinue(additionalInput.trim() || undefined);
  };

  const handleBack = () => {
    if (onBack) {
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
          {/* Back Button - only show if onBack is provided */}
          {onBack && (
            <TouchableOpacity
              style={styles.backButton}
              onPress={handleBack}
              activeOpacity={0.7}
            >
              <Text style={styles.backIcon}>←</Text>
            </TouchableOpacity>
          )}

          {/* Combined Input + Navigation Component */}
          <View style={styles.inputNavContainer}>
            <TextInput
              style={styles.textInput}
              placeholder={inputPlaceholder}
              placeholderTextColor={Colors.text.muted}
              value={additionalInput}
              onChangeText={setAdditionalInput}
              multiline={false}
              returnKeyType="done"
              onSubmitEditing={handleContinue}
            />

            {/* Arrow/Checkmark Button Inside Input */}
            <TouchableOpacity
              style={[
                styles.navButtonInside,
                hasInput && styles.submitButtonInside,
              ]}
              onPress={handleContinue}
              activeOpacity={0.7}
            >
              <Text style={styles.navIcon}>{hasInput ? "✓" : "→"}</Text>
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
    marginBottom: Spacing["2xl"],
  },
  title: {
    ...Typography.h1,
    color: Colors.text.primary,
    marginBottom: Spacing.md,
  },
  subtitle: {
    ...Typography.bodyLarge,
    color: Colors.text.secondary,
    lineHeight: 24,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    minHeight: 400,
  },

  // Bottom Bar with Combined Input + Navigation
  bottomBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    paddingBottom: Platform.OS === "ios" ? Spacing.xl : Spacing.md,
    backgroundColor: Colors.background.primary,
    gap: Spacing.sm,
  },

  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.primary.main,
    alignItems: "center",
    justifyContent: "center",
  },

  backIcon: {
    fontSize: 18,
    color: Colors.text.onPrimary,
    fontWeight: "600",
  },

  // Combined Input + Navigation Component
  inputNavContainer: {
    flex: 1,
    height: 44,
    backgroundColor: Colors.background.secondary,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: Colors.border.light,
    flexDirection: "row",
    alignItems: "center",
    paddingLeft: Spacing.lg,
    paddingRight: Spacing.xs,
  },

  textInput: {
    ...Typography.bodyMedium,
    color: Colors.text.primary,
    flex: 1,
    height: "100%",
    paddingVertical: 0,
    textAlignVertical: "center",
  },

  // Arrow/Checkmark Button INSIDE the input
  navButtonInside: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.primary.main,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: Spacing.xs,
  },

  submitButtonInside: {
    backgroundColor: Colors.success || Colors.primary.main,
  },

  navIcon: {
    fontSize: 16,
    color: Colors.text.onPrimary,
    fontWeight: "600",
  },
});

export default OnboardingPageLayout;
