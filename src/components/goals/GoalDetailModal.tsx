// src/components/goals/GoalDetailModal.tsx
import {
  BorderRadius,
  Colors,
  Padding,
  Spacing,
  Typography,
} from "@/constants";
import { Goal } from "@/services/goals/GoalsService";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextStyle,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native";

interface GoalDetailModalProps {
  visible: boolean;
  goal: Goal | null;
  onClose: () => void;
  onProgressUpdate: (goalId: string, progress: number) => void;
  onGoalDelete: (goalId: string) => void;
}

const GoalDetailModal: React.FC<GoalDetailModalProps> = ({
  visible,
  goal,
  onClose,
  onProgressUpdate,
  onGoalDelete,
}) => {
  const [isUpdating, setIsUpdating] = useState(false);

  if (!goal) return null;

  const getCategoryEmoji = (category: Goal["category"]) => {
    const categoryMap = {
      health: "💪",
      career: "💼",
      personal: "🌱",
      learning: "📚",
      relationships: "❤️",
      finance: "💰",
    };
    return categoryMap[category] || "🎯";
  };

  const getPriorityColor = (priority: Goal["priority"]) => {
    const priorityMap = {
      high: Colors.error.main,
      medium: Colors.warning.main,
      low: Colors.success.main,
    };
    return priorityMap[priority] || Colors.primary.main;
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "No deadline set";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const handleProgressUpdate = async (increment: number) => {
    setIsUpdating(true);
    try {
      const newProgress = Math.min(100, Math.max(0, goal.progress + increment));
      await onProgressUpdate(goal.id, newProgress);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteGoal = () => {
    Alert.alert(
      "Delete Goal",
      `Are you sure you want to delete "${goal.title}"? This action cannot be undone.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            onGoalDelete(goal.id);
            onClose();
          },
        },
      ]
    );
  };

  const renderMilestone = (milestone: any, index: number) => (
    <View key={index} style={styles.milestoneCard}>
      <View style={styles.milestoneHeader}>
        <View
          style={[
            styles.milestoneStatus,
            milestone.isCompleted && styles.milestoneCompleted,
          ]}
        >
          <Text style={styles.milestoneStatusText}>
            {milestone.isCompleted ? "✓" : index + 1}
          </Text>
        </View>
        <View style={styles.milestoneContent}>
          <Text
            style={[
              styles.milestoneTitle,
              milestone.isCompleted && styles.milestoneTitleCompleted,
            ]}
          >
            {milestone.title}
          </Text>
          <Text style={styles.milestoneDescription}>
            {milestone.description}
          </Text>
          <Text style={styles.milestoneDate}>
            Target: {formatDate(milestone.targetDate)}
          </Text>
        </View>
      </View>
    </View>
  );

  const renderWeeklyTask = (task: string, index: number) => (
    <View key={index} style={styles.taskItem}>
      <Text style={styles.taskBullet}>•</Text>
      <Text style={styles.taskText}>{task}</Text>
    </View>
  );

  const renderDailyHabit = (habit: string, index: number) => (
    <View key={index} style={styles.habitItem}>
      <Text style={styles.habitIcon}>🔄</Text>
      <Text style={styles.habitText}>{habit}</Text>
    </View>
  );

  const renderSuccessTip = (tip: string, index: number) => (
    <View key={index} style={styles.tipItem}>
      <Text style={styles.tipIcon}>💡</Text>
      <Text style={styles.tipText}>{tip}</Text>
    </View>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Goal Details</Text>
          <TouchableOpacity
            onPress={handleDeleteGoal}
            style={styles.deleteButton}
          >
            <Text style={styles.deleteButtonText}>🗑️</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Goal Overview */}
          <View style={styles.overviewCard}>
            <View style={styles.goalHeader}>
              <Text style={styles.goalEmoji}>
                {getCategoryEmoji(goal.category)}
              </Text>
              <View style={styles.goalInfo}>
                <Text
                  style={[
                    styles.goalTitle,
                    goal.isCompleted && styles.completedTitle,
                  ]}
                >
                  {goal.title}
                </Text>
                <View style={styles.goalMeta}>
                  <View
                    style={[
                      styles.priorityBadge,
                      { backgroundColor: getPriorityColor(goal.priority) },
                    ]}
                  >
                    <Text style={styles.priorityText}>
                      {goal.priority.toUpperCase()} PRIORITY
                    </Text>
                  </View>
                  <Text style={styles.categoryText}>
                    {goal.category.toUpperCase()}
                  </Text>
                </View>
              </View>
            </View>

            <Text style={styles.goalDescription}>{goal.description}</Text>

            <View style={styles.goalStats}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>
                  {formatDate(goal.targetDate)}
                </Text>
                <Text style={styles.statLabel}>Target Date</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{goal.progress}%</Text>
                <Text style={styles.statLabel}>Progress</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>
                  {goal.aiBreakdown?.estimatedTimeframe || "Unknown"}
                </Text>
                <Text style={styles.statLabel}>Timeline</Text>
              </View>
            </View>

            {goal.isCompleted && goal.completedAt && (
              <View style={styles.completionBanner}>
                <Text style={styles.completionText}>
                  🎉 Completed on{" "}
                  {new Date(goal.completedAt).toLocaleDateString()}
                </Text>
              </View>
            )}
          </View>

          {/* Progress Controls */}
          {!goal.isCompleted && (
            <View style={styles.progressCard}>
              <Text style={styles.sectionTitle}>Update Progress</Text>
              <View style={styles.progressButtons}>
                <TouchableOpacity
                  style={[styles.progressButton, styles.decreaseButton]}
                  onPress={() => handleProgressUpdate(-10)}
                  disabled={isUpdating || goal.progress <= 0}
                >
                  <Text style={styles.decreaseButtonText}>-10%</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.progressButton, styles.increaseButton]}
                  onPress={() => handleProgressUpdate(10)}
                  disabled={isUpdating || goal.progress >= 100}
                >
                  <Text style={styles.progressButtonText}>+10%</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.progressButton, styles.completeButton]}
                  onPress={() => handleProgressUpdate(100 - goal.progress)}
                  disabled={isUpdating || goal.progress >= 100}
                >
                  {isUpdating ? (
                    <ActivityIndicator
                      color={Colors.text.onPrimary}
                      size="small"
                    />
                  ) : (
                    <Text style={styles.progressButtonText}>Complete!</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* AI Breakdown */}
          {goal.aiBreakdown && (
            <>
              {/* Milestones */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>🎯 Milestones</Text>
                <Text style={styles.sectionSubtitle}>
                  Key achievements on your path to success
                </Text>
                {goal.aiBreakdown.milestones?.map(renderMilestone)}
              </View>

              {/* Weekly Tasks */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>📋 Weekly Tasks</Text>
                <Text style={styles.sectionSubtitle}>
                  Regular actions to move you forward
                </Text>
                <View style={styles.listContainer}>
                  {goal.aiBreakdown.weeklyTasks?.map(renderWeeklyTask)}
                </View>
              </View>

              {/* Daily Habits */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>🔄 Daily Habits</Text>
                <Text style={styles.sectionSubtitle}>
                  Small daily actions that compound over time
                </Text>
                <View style={styles.listContainer}>
                  {goal.aiBreakdown.dailyHabits?.map(renderDailyHabit)}
                </View>
              </View>

              {/* Success Tips */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>💡 Success Tips</Text>
                <Text style={styles.sectionSubtitle}>
                  AI-powered insights to help you succeed
                </Text>
                <View style={styles.listContainer}>
                  {goal.aiBreakdown.successTips?.map(renderSuccessTip)}
                </View>
              </View>

              {/* Goal Metadata */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>📊 Goal Analytics</Text>
                <View style={styles.metadataGrid}>
                  <View style={styles.metadataItem}>
                    <Text style={styles.metadataLabel}>Difficulty Level</Text>
                    <Text style={styles.metadataValue}>
                      {goal.aiBreakdown.difficultyLevel
                        ?.charAt(0)
                        .toUpperCase() +
                        goal.aiBreakdown.difficultyLevel?.slice(1)}
                    </Text>
                  </View>
                  <View style={styles.metadataItem}>
                    <Text style={styles.metadataLabel}>Created</Text>
                    <Text style={styles.metadataValue}>
                      {new Date(goal.createdAt).toLocaleDateString()}
                    </Text>
                  </View>
                  <View style={styles.metadataItem}>
                    <Text style={styles.metadataLabel}>Last Updated</Text>
                    <Text style={styles.metadataValue}>
                      {new Date(goal.updatedAt).toLocaleDateString()}
                    </Text>
                  </View>
                  <View style={styles.metadataItem}>
                    <Text style={styles.metadataLabel}>Tasks Count</Text>
                    <Text style={styles.metadataValue}>
                      {goal.aiBreakdown.weeklyTasks?.length || 0} weekly
                    </Text>
                  </View>
                </View>
              </View>
            </>
          )}

          {/* Bottom Spacing */}
          <View style={styles.bottomSpacing} />
        </ScrollView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.primary,
  } as ViewStyle,
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.subtle,
  } as ViewStyle,
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.background.secondary,
    alignItems: "center",
    justifyContent: "center",
  } as ViewStyle,
  closeButtonText: {
    ...Typography.bodyMedium,
    color: Colors.text.secondary,
    fontSize: 18,
  } as TextStyle,
  deleteButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.error + "15",
    alignItems: "center",
    justifyContent: "center",
  } as ViewStyle,
  deleteButtonText: {
    fontSize: 16,
  } as TextStyle,
  headerTitle: {
    ...Typography.h2,
    color: Colors.text.primary,
  } as TextStyle,
  content: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
  } as ViewStyle,
  overviewCard: {
    backgroundColor: Colors.background.card,
    borderRadius: BorderRadius.blob.medium,
    padding: Spacing.lg,
    marginTop: Spacing.lg,
    marginBottom: Spacing.md,
  } as ViewStyle,
  goalHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: Spacing.md,
  } as ViewStyle,
  goalEmoji: {
    fontSize: 40,
    marginRight: Spacing.md,
  } as TextStyle,
  goalInfo: {
    flex: 1,
  } as ViewStyle,
  goalTitle: {
    ...Typography.h1,
    color: Colors.text.primary,
    marginBottom: Spacing.sm,
    lineHeight: 32,
  } as TextStyle,
  completedTitle: {
    textDecorationLine: "line-through",
    color: Colors.text.muted,
  } as TextStyle,
  goalMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  } as ViewStyle,
  priorityBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.sm,
  } as ViewStyle,
  priorityText: {
    ...Typography.captionSmall,
    color: Colors.text.onPrimary,
    fontWeight: "600",
  } as TextStyle,
  categoryText: {
    ...Typography.captionMedium,
    color: Colors.text.muted,
    fontWeight: "600",
  } as TextStyle,
  goalDescription: {
    ...Typography.bodyLarge,
    color: Colors.text.secondary,
    lineHeight: 24,
    marginBottom: Spacing.lg,
  } as TextStyle,
  goalStats: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.border.subtle,
  } as ViewStyle,
  statItem: {
    alignItems: "center",
  } as ViewStyle,
  statValue: {
    ...Typography.h3,
    color: Colors.primary.main,
    marginBottom: Spacing.xs,
  } as TextStyle,
  statLabel: {
    ...Typography.captionMedium,
    color: Colors.text.muted,
  } as TextStyle,
  completionBanner: {
    backgroundColor: Colors.success.main + "15",
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginTop: Spacing.md,
    alignItems: "center",
  } as ViewStyle,
  completionText: {
    ...Typography.bodyMedium,
    color: Colors.success.main,
    fontWeight: "600",
  } as TextStyle,
  progressCard: {
    backgroundColor: Colors.background.card,
    borderRadius: BorderRadius.blob.medium,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
  } as ViewStyle,
  progressButtons: {
    flexDirection: "row",
    gap: Spacing.sm,
    marginTop: Spacing.md,
  } as ViewStyle,
  progressButton: {
    flex: 1,
    paddingVertical: Padding.button.medium.vertical,
    borderRadius: BorderRadius.md,
    alignItems: "center",
    justifyContent: "center",
  } as ViewStyle,
  decreaseButton: {
    backgroundColor: Colors.background.secondary,
    borderWidth: 1,
    borderColor: Colors.border.subtle,
  } as ViewStyle,
  increaseButton: {
    backgroundColor: Colors.primary.main,
  } as ViewStyle,
  completeButton: {
    backgroundColor: Colors.success.main,
  } as ViewStyle,
  progressButtonText: {
    ...Typography.buttonMedium,
    color: Colors.text.onPrimary,
  } as TextStyle,
  decreaseButtonText: {
    ...Typography.buttonMedium,
    color: Colors.text.primary,
  } as TextStyle,
  section: {
    backgroundColor: Colors.background.card,
    borderRadius: BorderRadius.blob.medium,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
  } as ViewStyle,
  sectionTitle: {
    ...Typography.h2,
    color: Colors.text.primary,
    marginBottom: Spacing.xs,
  } as TextStyle,
  sectionSubtitle: {
    ...Typography.bodyMedium,
    color: Colors.text.secondary,
    marginBottom: Spacing.lg,
    lineHeight: 20,
  } as TextStyle,
  listContainer: {
    gap: Spacing.sm,
  } as ViewStyle,
  milestoneCard: {
    backgroundColor: Colors.background.secondary,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  } as ViewStyle,
  milestoneHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
  } as ViewStyle,
  milestoneStatus: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.background.primary,
    borderWidth: 2,
    borderColor: Colors.primary.main,
    alignItems: "center",
    justifyContent: "center",
    marginRight: Spacing.md,
  } as ViewStyle,
  milestoneCompleted: {
    backgroundColor: Colors.success.main,
    borderColor: Colors.success.main,
  } as ViewStyle,
  milestoneStatusText: {
    ...Typography.captionMedium,
    color: Colors.primary.main,
    fontWeight: "bold",
  } as TextStyle,
  milestoneContent: {
    flex: 1,
  } as ViewStyle,
  milestoneTitle: {
    ...Typography.h3,
    color: Colors.text.primary,
    marginBottom: Spacing.xs,
  } as TextStyle,
  milestoneTitleCompleted: {
    textDecorationLine: "line-through",
    color: Colors.text.muted,
  } as TextStyle,
  milestoneDescription: {
    ...Typography.bodyMedium,
    color: Colors.text.secondary,
    marginBottom: Spacing.xs,
    lineHeight: 20,
  } as TextStyle,
  milestoneDate: {
    ...Typography.captionMedium,
    color: Colors.text.muted,
  } as TextStyle,
  taskItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingVertical: Spacing.xs,
  } as ViewStyle,
  taskBullet: {
    ...Typography.bodyMedium,
    color: Colors.primary.main,
    marginRight: Spacing.sm,
    fontWeight: "bold",
  } as TextStyle,
  taskText: {
    ...Typography.bodyMedium,
    color: Colors.text.primary,
    flex: 1,
    lineHeight: 20,
  } as TextStyle,
  habitItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingVertical: Spacing.xs,
  } as ViewStyle,
  habitIcon: {
    fontSize: 16,
    marginRight: Spacing.sm,
  } as TextStyle,
  habitText: {
    ...Typography.bodyMedium,
    color: Colors.text.primary,
    flex: 1,
    lineHeight: 20,
  } as TextStyle,
  tipItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingVertical: Spacing.xs,
  } as ViewStyle,
  tipIcon: {
    fontSize: 16,
    marginRight: Spacing.sm,
  } as TextStyle,
  tipText: {
    ...Typography.bodyMedium,
    color: Colors.text.primary,
    flex: 1,
    lineHeight: 20,
  } as TextStyle,
  metadataGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.md,
  } as ViewStyle,
  metadataItem: {
    flex: 1,
    minWidth: "45%",
    backgroundColor: Colors.background.secondary,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
  } as ViewStyle,
  metadataLabel: {
    ...Typography.captionMedium,
    color: Colors.text.muted,
    marginBottom: Spacing.xs,
  } as TextStyle,
  metadataValue: {
    ...Typography.bodyMedium,
    color: Colors.text.primary,
    fontWeight: "600",
  } as TextStyle,
  bottomSpacing: {
    height: Spacing.xl,
  } as ViewStyle,
});

export default GoalDetailModal;
