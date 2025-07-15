// src/screens/main/TodayScreen.tsx
import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  Colors,
  Typography,
  Spacing,
  BorderRadius,
  Padding,
} from "@/constants";
import { useAuth } from "@/hooks/useAuth";
import { useTasks } from "@/hooks/useTasks";
import { Task } from "@/types/tasks";

const TodayScreen = () => {
  const { userProfile } = useAuth();
  const {
    tasks,
    taskStats,
    loading,
    error,
    loadTasks,
    completeTask,
    rescheduleTask,
    clearError,
  } = useTasks(userProfile?.id);

  const handleTaskComplete = async (taskId: string) => {
    try {
      await completeTask(taskId);
      Alert.alert("Success", "Task completed! XP awarded.");
    } catch (error) {
      Alert.alert("Error", "Failed to complete task");
    }
  };

  const handleTaskReschedule = async (taskId: string) => {
    Alert.alert("Reschedule Task", "When would you like to do this task?", [
      {
        text: "Tomorrow",
        onPress: () => {
          const tomorrow = new Date();
          tomorrow.setDate(tomorrow.getDate() + 1);
          rescheduleTask(taskId, tomorrow.toISOString().split("T")[0]);
        },
      },
      {
        text: "This Weekend",
        onPress: () => {
          const weekend = new Date();
          const daysUntilSat = (6 - weekend.getDay()) % 7;
          weekend.setDate(weekend.getDate() + daysUntilSat);
          rescheduleTask(taskId, weekend.toISOString().split("T")[0]);
        },
      },
      { text: "Cancel", style: "cancel" },
    ]);
  };

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorTitle}>Something went wrong</Text>
          <Text style={styles.errorMessage}>{error}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => {
              clearError();
              loadTasks();
            }}
          >
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={loadTasks} />
        }
      >
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Today</Text>
            <Text style={styles.date}>
              {new Date().toLocaleDateString("en-US", {
                weekday: "long",
                month: "long",
                day: "numeric",
              })}
            </Text>
          </View>

          {/* Progress Overview */}
          <View style={styles.progressCard}>
            <Text style={styles.cardTitle}>Progress</Text>
            <View style={styles.progressStats}>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{taskStats.completed}</Text>
                <Text style={styles.statLabel}>Completed</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{taskStats.total}</Text>
                <Text style={styles.statLabel}>Total</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>
                  {Math.round(taskStats.completion_rate)}%
                </Text>
                <Text style={styles.statLabel}>Rate</Text>
              </View>
            </View>
          </View>

          {/* Task List */}
          {loading && tasks.length === 0 ? (
            <View style={styles.loadingCard}>
              <Text style={styles.loadingText}>Loading your tasks...</Text>
            </View>
          ) : tasks.length === 0 ? (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyTitle}>No tasks for today</Text>
              <Text style={styles.emptySubtitle}>
                Great! You're all caught up. Add a new task or take a
                well-deserved break.
              </Text>
            </View>
          ) : (
            <View style={styles.tasksContainer}>
              <Text style={styles.sectionTitle}>Today's Tasks</Text>
              {tasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onComplete={() => handleTaskComplete(task.id)}
                  onReschedule={() => handleTaskReschedule(task.id)}
                />
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

// Task Card Component
const TaskCard: React.FC<{
  task: Task;
  onComplete: () => void;
  onReschedule: () => void;
}> = ({ task, onComplete, onReschedule }) => {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return Colors.error;
      case "medium":
        return Colors.warning;
      case "low":
        return Colors.success;
      default:
        return Colors.text.muted;
    }
  };

  const isCompleted = task.status === "completed";

  return (
    <View style={[styles.taskCard, isCompleted && styles.completedTaskCard]}>
      {/* Priority Indicator */}
      <View
        style={[
          styles.priorityIndicator,
          { backgroundColor: getPriorityColor(task.priority) },
        ]}
      />

      {/* Task Content */}
      <View style={styles.taskContent}>
        <Text
          style={[styles.taskTitle, isCompleted && styles.completedTaskTitle]}
        >
          {task.title}
        </Text>

        {task.description && (
          <Text style={styles.taskDescription}>{task.description}</Text>
        )}

        <View style={styles.taskMeta}>
          {task.estimated_duration && (
            <View style={styles.metaItem}>
              <Text style={styles.metaText}>{task.estimated_duration} min</Text>
            </View>
          )}

          {task.suggested_time_slot && (
            <View style={styles.metaItem}>
              <Text style={styles.metaText}>{task.suggested_time_slot}</Text>
            </View>
          )}

          {task.energy_level_required && (
            <View style={styles.metaItem}>
              <Text style={styles.metaText}>
                {task.energy_level_required} energy
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* Action Buttons */}
      {!isCompleted && (
        <View style={styles.taskActions}>
          <TouchableOpacity
            style={[styles.actionButton, styles.completeButton]}
            onPress={onComplete}
          >
            <Text style={styles.completeButtonText}>✓</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.rescheduleButton]}
            onPress={onReschedule}
          >
            <Text style={styles.rescheduleButtonText}>⏰</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.primary,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: Spacing.lg,
  },
  header: {
    marginBottom: Spacing.xl,
  },
  title: {
    ...Typography.h1,
    color: Colors.text.primary,
    marginBottom: Spacing.xs,
  },
  date: {
    ...Typography.bodyMedium,
    color: Colors.text.secondary,
  },
  progressCard: {
    backgroundColor: Colors.background.card,
    padding: Padding.card.medium,
    borderRadius: BorderRadius.blob.medium,
    marginBottom: Spacing.lg,
  },
  cardTitle: {
    ...Typography.h3,
    color: Colors.text.primary,
    marginBottom: Spacing.md,
  },
  progressStats: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  statItem: {
    alignItems: "center",
  },
  statNumber: {
    ...Typography.h2,
    color: Colors.primary.main,
    marginBottom: Spacing.xs,
  },
  statLabel: {
    ...Typography.captionMedium,
    color: Colors.text.muted,
  },
  loadingCard: {
    backgroundColor: Colors.background.card,
    padding: Padding.card.medium,
    borderRadius: BorderRadius.blob.medium,
    alignItems: "center",
  },
  loadingText: {
    ...Typography.bodyMedium,
    color: Colors.text.muted,
  },
  emptyCard: {
    backgroundColor: Colors.background.card,
    padding: Padding.card.medium,
    borderRadius: BorderRadius.blob.medium,
    alignItems: "center",
  },
  emptyTitle: {
    ...Typography.h3,
    color: Colors.text.primary,
    marginBottom: Spacing.sm,
  },
  emptySubtitle: {
    ...Typography.bodyMedium,
    color: Colors.text.secondary,
    textAlign: "center",
  },
  tasksContainer: {
    marginTop: Spacing.md,
  },
  sectionTitle: {
    ...Typography.h3,
    color: Colors.text.primary,
    marginBottom: Spacing.md,
  },
  taskCard: {
    backgroundColor: Colors.background.card,
    borderRadius: BorderRadius.blob.medium,
    padding: Padding.card.medium,
    marginBottom: Spacing.md,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: Colors.shadow || "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  completedTaskCard: {
    opacity: 0.6,
  },
  priorityIndicator: {
    width: 4,
    height: "100%",
    borderRadius: BorderRadius.sm,
    marginRight: Spacing.md,
  },
  taskContent: {
    flex: 1,
  },
  taskTitle: {
    ...Typography.bodyLarge,
    color: Colors.text.primary,
    marginBottom: Spacing.xs,
  },
  completedTaskTitle: {
    textDecorationLine: "line-through",
    color: Colors.text.muted,
  },
  taskDescription: {
    ...Typography.bodySmall,
    color: Colors.text.secondary,
    marginBottom: Spacing.sm,
  },
  taskMeta: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
  },
  metaItem: {
    backgroundColor: Colors.background.secondary,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.sm,
  },
  metaText: {
    ...Typography.captionSmall,
    color: Colors.text.muted,
  },
  taskActions: {
    flexDirection: "row",
    gap: Spacing.sm,
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.md,
    alignItems: "center",
    justifyContent: "center",
  },
  completeButton: {
    backgroundColor: Colors.success,
  },
  completeButtonText: {
    color: Colors.text.onPrimary,
    fontSize: 18,
    fontWeight: "bold",
  },
  rescheduleButton: {
    backgroundColor: Colors.background.secondary,
  },
  rescheduleButtonText: {
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: Spacing.xl,
  },
  errorTitle: {
    ...Typography.h2,
    color: Colors.error,
    marginBottom: Spacing.md,
    textAlign: "center",
  },
  errorMessage: {
    ...Typography.bodyMedium,
    color: Colors.text.secondary,
    textAlign: "center",
    marginBottom: Spacing.lg,
  },
  retryButton: {
    backgroundColor: Colors.primary.main,
    paddingVertical: Padding.button.medium.vertical,
    paddingHorizontal: Padding.button.medium.horizontal,
    borderRadius: BorderRadius.md,
  },
  retryButtonText: {
    ...Typography.buttonMedium,
    color: Colors.text.onPrimary,
  },
});

export default TodayScreen;
