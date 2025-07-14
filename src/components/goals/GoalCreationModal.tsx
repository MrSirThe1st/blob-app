// Helper to resolve color value to string
// src/components/goals/GoalCreationModal.tsx
import {
  BorderRadius,
  Colors,
  Padding,
  Spacing,
  Typography,
} from "@/constants";
import { CreateGoalRequest, Goal } from "@/services/goals/GoalsService";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
function resolveColor(color: any): string {
  if (typeof color === "string") return color;
  if (color && typeof color === "object" && "main" in color) return color.main;
  return "#000"; // fallback
}

interface GoalCreationModalProps {
  visible: boolean;
  onClose: () => void;
  onGoalCreated: (goal: Goal) => void;
  userId: string;
}

const CATEGORIES = [
  { key: "health", label: "Health & Fitness", emoji: "💪" },
  { key: "career", label: "Career & Work", emoji: "💼" },
  { key: "personal", label: "Personal Growth", emoji: "🌱" },
  { key: "learning", label: "Learning & Skills", emoji: "📚" },
  { key: "relationships", label: "Relationships", emoji: "❤️" },
  { key: "finance", label: "Finance & Money", emoji: "💰" },
] as const;

const PRIORITIES = [
  { key: "high", label: "High Priority", color: Colors.error, emoji: "🔥" },
  {
    key: "medium",
    label: "Medium Priority",
    color: Colors.warning,
    emoji: "⚡",
  },
  { key: "low", label: "Low Priority", color: Colors.success, emoji: "🌟" },
] as const;

const GoalCreationModal: React.FC<GoalCreationModalProps> = ({
  visible,
  onClose,
  onGoalCreated,
  userId,
}) => {
  const [step, setStep] = useState(1);
  const [isCreating, setIsCreating] = useState(false);

  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] =
    useState<CreateGoalRequest["category"]>("personal");
  const [priority, setPriority] =
    useState<CreateGoalRequest["priority"]>("medium");
  const [targetDate, setTargetDate] = useState("");
  const [userContext, setUserContext] = useState("");

  const resetForm = () => {
    setStep(1);
    setTitle("");
    setDescription("");
    setCategory("personal");
    setPriority("medium");
    setTargetDate("");
    setUserContext("");
    setIsCreating(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleNext = () => {
    if (step === 1 && (!title.trim() || !description.trim())) {
      Alert.alert(
        "Missing Information",
        "Please fill in both title and description"
      );
      return;
    }
    setStep(step + 1);
  };

  const handlePrevious = () => {
    setStep(step - 1);
  };

  const handleCreateGoal = async () => {
    if (!title.trim() || !description.trim()) {
      Alert.alert("Missing Information", "Please fill in all required fields");
      return;
    }

    setIsCreating(true);

    try {
      const { goalsService } = await import("@/services/goals/GoalsService");

      const request: CreateGoalRequest = {
        title: title.trim(),
        description: description.trim(),
        category,
        priority,
        targetDate: targetDate || undefined,
        userContext: userContext.trim() || undefined,
      };

      const goal = await goalsService.createGoal(userId, request);

      if (goal) {
        onGoalCreated(goal);
        Alert.alert(
          "Goal Created! 🎉",
          `"${goal.title}" has been created with AI-powered breakdown. You'll see it in your goals list.`,
          [{ text: "Awesome!", onPress: handleClose }]
        );
      } else {
        Alert.alert("Error", "Failed to create goal. Please try again.");
      }
    } catch (error) {
      console.error("Error creating goal:", error);
      Alert.alert("Error", "Failed to create goal. Please try again.");
    } finally {
      setIsCreating(false);
    }
  };

  const getCategoryEmoji = (cat: CreateGoalRequest["category"]) => {
    return CATEGORIES.find((c) => c.key === cat)?.emoji || "🎯";
  };

  const getPriorityColor = (pri: CreateGoalRequest["priority"]) => {
    return PRIORITIES.find((p) => p.key === pri)?.color || Colors.primary.main;
  };

  const renderStepIndicator = () => (
    <View style={styles.stepIndicator}>
      {[1, 2, 3].map((stepNumber) => (
        <View
          key={stepNumber}
          style={[styles.stepDot, stepNumber <= step && styles.stepDotActive]}
        />
      ))}
    </View>
  );

  const renderStep1 = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>What&apos;s your goal?</Text>
      <Text style={styles.stepSubtitle}>
        Let&apos;s start with the basics. What do you want to achieve?
      </Text>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Goal Title *</Text>
        <TextInput
          style={styles.input}
          value={title}
          onChangeText={setTitle}
          placeholder="e.g., Run a marathon, Learn Spanish, Start a business"
          placeholderTextColor={Colors.text.muted}
          maxLength={100}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Description *</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={description}
          onChangeText={setDescription}
          placeholder="Describe your goal in more detail. What exactly do you want to achieve and why is it important to you?"
          placeholderTextColor={Colors.text.muted}
          multiline
          numberOfLines={4}
          maxLength={500}
        />
      </View>
    </View>
  );

  const renderStep2 = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Categorize & Prioritize</Text>
      <Text style={styles.stepSubtitle}>
        Help us understand what type of goal this is and how important it is to
        you.
      </Text>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Category</Text>
        <View style={styles.optionsGrid}>
          {CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat.key}
              style={[
                styles.optionCard,
                category === cat.key && styles.optionCardSelected,
              ]}
              onPress={() => setCategory(cat.key)}
            >
              <Text style={styles.optionEmoji}>{cat.emoji}</Text>
              <Text style={styles.optionLabel}>{cat.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Priority Level</Text>
        <View style={styles.priorityContainer}>
          {PRIORITIES.map((pri) => (
            <TouchableOpacity
              key={pri.key}
              style={[
                styles.priorityCard,
                priority === pri.key && [
                  styles.priorityCardSelected,
                  { borderColor: resolveColor(pri.color) },
                ],
              ]}
              onPress={() => setPriority(pri.key)}
            >
              <Text style={styles.priorityEmoji}>{pri.emoji}</Text>
              <Text style={styles.priorityLabel}>{pri.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>
  );

  const renderStep3 = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Additional Details</Text>
      <Text style={styles.stepSubtitle}>
        Help our AI create a better plan for you (optional but recommended).
      </Text>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Target Date (Optional)</Text>
        <TextInput
          style={styles.input}
          value={targetDate}
          onChangeText={setTargetDate}
          placeholder="YYYY-MM-DD (e.g., 2024-06-15)"
          placeholderTextColor={Colors.text.muted}
        />
        <Text style={styles.hint}>
          When would you like to achieve this goal? Leave blank if you&apos;re
          not sure.
        </Text>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Context & Constraints (Optional)</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={userContext}
          onChangeText={setUserContext}
          placeholder="Tell us about your current situation, available time, resources, or any constraints that might affect this goal..."
          placeholderTextColor={Colors.text.muted}
          multiline
          numberOfLines={4}
          maxLength={500}
        />
        <Text style={styles.hint}>
          This helps our AI create a more personalized plan for you.
        </Text>
      </View>

      {/* Goal Preview */}
      <View style={styles.previewCard}>
        <Text style={styles.previewTitle}>Goal Preview</Text>
        <View style={styles.previewRow}>
          <Text style={styles.previewEmoji}>{getCategoryEmoji(category)}</Text>
          <View style={styles.previewContent}>
            <Text style={styles.previewGoalTitle}>
              {title || "Your goal title"}
            </Text>
            <Text style={styles.previewDescription}>
              {description || "Your goal description"}
            </Text>
            <View style={styles.previewMeta}>
              <View
                style={[
                  styles.priorityBadge,
                  { backgroundColor: resolveColor(getPriorityColor(priority)) },
                ]}
              >
                <Text style={styles.priorityBadgeText}>
                  {priority.toUpperCase()}
                </Text>
              </View>
              {targetDate && (
                <Text style={styles.previewDate}>Target: {targetDate}</Text>
              )}
            </View>
          </View>
        </View>
      </View>
    </View>
  );

  const renderStepContent = () => {
    switch (step) {
      case 1:
        return renderStep1();
      case 2:
        return renderStep2();
      case 3:
        return renderStep3();
      default:
        return renderStep1();
    }
  };

const renderButtons = () => (
  <View style={styles.buttonContainer}>
    {step > 1 && (
      <TouchableOpacity
        style={[styles.button, styles.secondaryButton]}
        onPress={handlePrevious}
      >
        <Text style={styles.secondaryButtonText}>Previous</Text>
      </TouchableOpacity>
    )}

    {step < 3 ? (
      <TouchableOpacity
        style={[styles.button, styles.primaryButton]}
        onPress={handleNext}
      >
        <Text style={styles.primaryButtonText}>Next</Text>
      </TouchableOpacity>
    ) : (
      <TouchableOpacity
        style={[
          styles.button,
          styles.primaryButton,
          isCreating && styles.buttonDisabled,
        ]}
        onPress={handleCreateGoal}
        disabled={isCreating}
      >
        {isCreating ? (
          <ActivityIndicator color={Colors.text.onPrimary} />
        ) : (
          <Text style={styles.primaryButtonText}>Create Goal 🎯</Text>
        )}
      </TouchableOpacity>
    )}
  </View>
);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Create New Goal</Text>
          <View style={styles.placeholder} />
        </View>

        {renderStepIndicator()}

        <ScrollView
          style={styles.content}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {renderStepContent()}
        </ScrollView>

        {renderButtons()}
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.primary,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.subtle,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.background.secondary,
    alignItems: "center",
    justifyContent: "center",
  },
  closeButtonText: {
    ...Typography.bodyMedium,
    color: Colors.text.secondary,
    fontSize: 18,
  },
  headerTitle: {
    ...Typography.h2,
    color: Colors.text.primary,
  },
  placeholder: {
    width: 32,
  },
  stepIndicator: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: Spacing.lg,
    gap: Spacing.sm,
  },
  stepDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.background.secondary,
  },
  stepDotActive: {
    backgroundColor: Colors.primary.main,
    width: 24,
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
  },
  stepContent: {
    paddingBottom: Spacing.xl,
  },
  stepTitle: {
    ...Typography.h1,
    color: Colors.text.primary,
    marginBottom: Spacing.sm,
    textAlign: "center",
  },
  stepSubtitle: {
    ...Typography.bodyLarge,
    color: Colors.text.secondary,
    textAlign: "center",
    marginBottom: Spacing.xl,
    lineHeight: 24,
  },
  inputGroup: {
    marginBottom: Spacing.lg,
  },
  label: {
    ...Typography.h4,
    color: Colors.text.primary,
    marginBottom: Spacing.sm,
  },
  input: {
    backgroundColor: Colors.background.card,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    ...Typography.bodyMedium,
    color: Colors.text.primary,
    borderWidth: 1,
    borderColor: Colors.border.subtle,
  },
  textArea: {
    height: 100,
    textAlignVertical: "top",
  },
  hint: {
    ...Typography.captionMedium,
    color: Colors.text.muted,
    marginTop: Spacing.xs,
  },
  optionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
  },
  optionCard: {
    flex: 1,
    minWidth: "30%",
    backgroundColor: Colors.background.card,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    alignItems: "center",
    borderWidth: 2,
    borderColor: Colors.border.subtle,
  },
  optionCardSelected: {
    borderColor: Colors.primary.main,
    backgroundColor: Colors.primary.light,
  },
  optionEmoji: {
    fontSize: 24,
    marginBottom: Spacing.xs,
  },
  optionLabel: {
    ...Typography.captionMedium,
    color: Colors.text.primary,
    textAlign: "center",
  },
  priorityContainer: {
    gap: Spacing.sm,
  },
  priorityCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.background.card,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    borderWidth: 2,
    borderColor: Colors.border.subtle,
  },
  priorityCardSelected: {
    backgroundColor: Colors.background.secondary,
  },
  priorityEmoji: {
    fontSize: 20,
    marginRight: Spacing.md,
  },
  priorityLabel: {
    ...Typography.bodyMedium,
    color: Colors.text.primary,
  },
  previewCard: {
    backgroundColor: Colors.background.card,
    borderRadius: BorderRadius.blob.medium,
    padding: Spacing.lg,
    marginTop: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border.subtle,
  },
  previewTitle: {
    ...Typography.h4,
    color: Colors.text.primary,
    marginBottom: Spacing.md,
  },
  previewRow: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  previewEmoji: {
    fontSize: 32,
    marginRight: Spacing.md,
  },
  previewContent: {
    flex: 1,
  },
  previewGoalTitle: {
    ...Typography.h3,
    color: Colors.text.primary,
    marginBottom: Spacing.xs,
  },
  previewDescription: {
    ...Typography.bodyMedium,
    color: Colors.text.secondary,
    marginBottom: Spacing.sm,
    lineHeight: 20,
  },
  previewMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  priorityBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.sm,
  },
  priorityBadgeText: {
    ...Typography.captionSmall,
    color: Colors.text.onPrimary,
    fontWeight: "600",
  },
  previewDate: {
    ...Typography.captionMedium,
    color: Colors.text.muted,
  },
  buttonContainer: {
    flexDirection: "row",
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.lg,
    gap: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.border.subtle,
  },
  button: {
    flex: 1,
    paddingVertical: Padding.button.large.vertical,
    paddingHorizontal: Padding.button.large.horizontal,
    borderRadius: BorderRadius.lg,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryButton: {
    backgroundColor: Colors.primary.main,
  },
  secondaryButton: {
    backgroundColor: Colors.background.secondary,
    borderWidth: 1,
    borderColor: Colors.border.subtle,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  primaryButtonText: {
    ...Typography.buttonLarge,
    color: Colors.text.onPrimary,
  },
  secondaryButtonText: {
    ...Typography.buttonLarge,
    color: Colors.text.primary,
  },
});

export default GoalCreationModal;
