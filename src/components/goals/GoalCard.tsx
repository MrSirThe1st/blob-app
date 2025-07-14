// Helper to resolve color value to string
// src/components/goals/GoalCard.tsx
import { BorderRadius, Colors, Spacing, Typography } from "@/constants";
import { Goal } from "@/services/goals/GoalsService";
import React from "react";
import { Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";
function resolveColor(color: any): string {
  if (typeof color === "string") return color;
  if (color && typeof color === "object" && "main" in color) return color.main;
  return "#000"; // fallback
}

interface GoalCardProps {
  goal: Goal;
  onPress: (goal: Goal) => void;
  onProgressUpdate?: (goalId: string, progress: number) => void;
}

const GoalCard: React.FC<GoalCardProps> = ({
  goal,
  onPress,
  onProgressUpdate,
}) => {
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
      high: Colors.error,
      medium: Colors.warning,
      low: Colors.success,
    };
    return priorityMap[priority] || Colors.primary.main;
  };

  const formatTargetDate = (dateString: string | null) => {
    if (!dateString) return "No deadline";

    const date = new Date(dateString);
    const now = new Date();
    const diffTime = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return "Overdue";
    } else if (diffDays === 0) {
      return "Due today";
    } else if (diffDays === 1) {
      return "Due tomorrow";
    } else if (diffDays <= 7) {
      return `${diffDays} days left`;
    } else if (diffDays <= 30) {
      return `${Math.ceil(diffDays / 7)} weeks left`;
    } else {
      return `${Math.ceil(diffDays / 30)} months left`;
    }
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return Colors.success;
    if (progress >= 50) return Colors.warning;
    return Colors.primary.main;
  };

  const handleQuickAction = (action: "progress") => {
    if (action === "progress" && onProgressUpdate) {
      Alert.alert("Update Progress", "How much progress have you made?", [
        { text: "Cancel", style: "cancel" },
        {
          text: "+10%",
          onPress: () =>
            onProgressUpdate(goal.id, Math.min(100, goal.progress + 10)),
        },
        {
          text: "+25%",
          onPress: () =>
            onProgressUpdate(goal.id, Math.min(100, goal.progress + 25)),
        },
        { text: "Complete!", onPress: () => onProgressUpdate(goal.id, 100) },
      ]);
    }
  };

  return (
    <TouchableOpacity
      style={[
        styles.container as any,
        goal.isCompleted && (styles.completedContainer as any),
      ]}
      onPress={() => onPress(goal)}
      activeOpacity={0.7}
    >
      {/* Header */}
      <View style={styles.header as any}>
        <View style={styles.headerLeft as any}>
          <Text style={styles.emoji as any}>
            {getCategoryEmoji(goal.category)}
          </Text>
          <View style={styles.titleContainer as any}>
            <Text
              style={[
                styles.title as any,
                goal.isCompleted && (styles.completedTitle as any),
              ]}
              numberOfLines={2}
            >
              {goal.title}
            </Text>
            <View style={styles.metaRow as any}>
              <View
                style={[
                  styles.priorityBadge as any,
                  {
                    backgroundColor: resolveColor(
                      getPriorityColor(goal.priority)
                    ),
                  },
                ]}
              >
                <Text style={styles.priorityText as any}>
                  {goal.priority.toUpperCase()}
                </Text>
              </View>
              <Text style={styles.targetDate as any}>
                {formatTargetDate(goal.targetDate)}
              </Text>
            </View>
          </View>
        </View>

        {goal.isCompleted && (
          <View style={styles.completedBadge as any}>
            <Text style={styles.completedBadgeText as any}>✓</Text>
          </View>
        )}
      </View>

      {/* Description */}
      <Text
        style={[
          styles.description as any,
          goal.isCompleted && (styles.completedDescription as any),
        ]}
        numberOfLines={2}
      >
        {goal.description}
      </Text>

      {/* Progress Section */}
      {!goal.isCompleted && (
        <View style={styles.progressSection as any}>
          <View style={styles.progressHeader as any}>
            <Text style={styles.progressLabel as any}>Progress</Text>
            <TouchableOpacity
              style={styles.quickActionButton as any}
              onPress={() => handleQuickAction("progress")}
            >
              <Text style={styles.quickActionText as any}>Update +</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.progressContainer as any}>
            <View style={styles.progressTrack as any}>
              <View
                style={[
                  styles.progressFill as any,
                  {
                    width: `${goal.progress}%`,
                    backgroundColor: resolveColor(
                      getProgressColor(goal.progress)
                    ),
                  },
                ]}
              />
            </View>
            <Text style={styles.progressText as any}>{goal.progress}%</Text>
          </View>
        </View>
      )}

      {/* AI Insights Preview */}
      {goal.aiBreakdown && (
        <View style={styles.insightsPreview as any}>
          <Text style={styles.insightsTitle as any}>AI Breakdown</Text>
          <View style={styles.insightsGrid as any}>
            <View style={styles.insightItem as any}>
              <Text style={styles.insightNumber as any}>
                {goal.aiBreakdown.weeklyTasks.length}
              </Text>
              <Text style={styles.insightLabel as any}>Weekly Tasks</Text>
            </View>
            <View style={styles.insightItem as any}>
              <Text style={styles.insightNumber as any}>
                {goal.aiBreakdown.milestones.length}
              </Text>
              <Text style={styles.insightLabel as any}>Milestones</Text>
            </View>
            <View style={styles.insightItem as any}>
              <Text style={styles.insightNumber as any}>
                {goal.aiBreakdown.estimatedTimeframe}
              </Text>
              <Text style={styles.insightLabel as any}>Timeline</Text>
            </View>
          </View>
        </View>
      )}

      {/* Completion Date */}
      {goal.isCompleted && goal.completedAt && (
        <View style={styles.completionInfo as any}>
          <Text
            style={[
              styles.completionText as any,
              { color: resolveColor(Colors.success) },
            ]}
          >
            ✨ Completed on {new Date(goal.completedAt).toLocaleDateString()}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.background.card,
    borderRadius: BorderRadius.blob.medium,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border.subtle,
  },
  completedContainer: {
    backgroundColor: Colors.background.secondary,
    opacity: 0.8,
  },
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: Spacing.md,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "flex-start",
    flex: 1,
  },
  emoji: {
    fontSize: 28,
    marginRight: Spacing.md,
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    ...Typography.h3,
    color: Colors.text.primary,
    marginBottom: Spacing.xs,
    lineHeight: 24,
  },
  completedTitle: {
    textDecorationLine: "line-through",
    color: Colors.text.muted,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  priorityBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.sm,
  },
  priorityText: {
    ...Typography.captionSmall,
    color: Colors.text.onPrimary,
    fontWeight: "600",
  },
  targetDate: {
    ...Typography.captionMedium,
    color: Colors.text.muted,
  },
  completedBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: resolveColor(Colors.success),
    alignItems: "center",
    justifyContent: "center",
  },
  completedBadgeText: {
    ...Typography.captionMedium,
    color: Colors.text.onPrimary,
    fontWeight: "bold",
  },
  description: {
    ...Typography.bodyMedium,
    color: Colors.text.secondary,
    lineHeight: 20,
    marginBottom: Spacing.md,
  },
  completedDescription: {
    color: Colors.text.muted,
  },
  progressSection: {
    marginBottom: Spacing.md,
  },
  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.sm,
  },
  progressLabel: {
    ...Typography.h4,
    color: Colors.text.primary,
  },
  quickActionButton: {
    backgroundColor: Colors.primary.light,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.sm,
  },
  quickActionText: {
    ...Typography.captionMedium,
    color: Colors.primary.main,
    fontWeight: "600",
  },
  progressContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  progressTrack: {
    flex: 1,
    height: 8,
    backgroundColor: Colors.background.secondary,
    borderRadius: 4,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 4,
  },
  progressText: {
    ...Typography.captionMedium,
    color: Colors.text.primary,
    fontWeight: "600",
    minWidth: 35,
    textAlign: "right",
  },
  insightsPreview: {
    backgroundColor: Colors.background.secondary,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  insightsTitle: {
    ...Typography.h4,
    color: Colors.text.primary,
    marginBottom: Spacing.sm,
  },
  insightsGrid: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  insightItem: {
    alignItems: "center",
  },
  insightNumber: {
    ...Typography.h3,
    color: Colors.primary.main,
    marginBottom: Spacing.xs,
  },
  insightLabel: {
    ...Typography.captionSmall,
    color: Colors.text.secondary,
    textAlign: "center",
  },
  completionInfo: {
    backgroundColor: Colors.success + "15",
    borderRadius: BorderRadius.md,
    padding: Spacing.sm,
    alignItems: "center",
  },
  completionText: {
    ...Typography.captionMedium,
    color: resolveColor(Colors.success),
    fontWeight: "600",
  },
});

export default GoalCard;
