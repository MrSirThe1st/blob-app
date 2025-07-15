// src/screens/main/TodayScreen.tsx (Enhanced with AI Scheduling)
import {
  EmptyTasksState,
  ProgressBlob,
  TaskCard,
  TaskDetailModal,
} from "@/components/tasks";
import {
  BorderRadius,
  Colors,
  Padding,
  Spacing,
  Typography,
} from "@/constants";
import { useAuth } from "@/hooks/useAuth";
import { useScheduling } from "@/hooks/useScheduling";
import { useTasks } from "@/hooks/useTasks";
import { Task } from "@/types/tasks";
import { useState } from "react";
import {
  Alert,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const TodayScreen = () => {
  const { userProfile } = useAuth();
  const {
    tasks,
    taskStats,
    loading: tasksLoading,
    error: tasksError,
    loadTasks,
    completeTask,
    rescheduleTask,
    clearError: clearTasksError,
  } = useTasks(userProfile?.id);

  const {
    schedule,
    basicSchedule,
    loading: scheduleLoading,
    error: scheduleError,
    generateAISchedule,
    generateBasicSchedule,
    getBestSchedule,
    hasAISchedule,
    clearError: clearScheduleError,
  } = useScheduling(userProfile?.id);

  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [showTaskDetail, setShowTaskDetail] = useState(false);
  const [showScheduleView, setShowScheduleView] = useState(false);

  const currentSchedule = getBestSchedule();
  const loading = tasksLoading || scheduleLoading;
  const error = tasksError || scheduleError;

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

  const handleTaskPress = (task: Task) => {
    setSelectedTask(task);
    setShowTaskDetail(true);
  };

  const handleTaskUpdate = async (taskId: string, updates: Partial<Task>) => {
    try {
      setShowTaskDetail(false);
      await loadTasks();
    } catch (error) {
      Alert.alert("Error", "Failed to update task");
    }
  };

  const handleGenerateSchedule = async () => {
    try {
      await generateAISchedule();
      Alert.alert("Success", "AI-optimized schedule generated!");
    } catch (error) {
      // Fallback to basic schedule
      await generateBasicSchedule();
      Alert.alert(
        "Info",
        "Basic schedule generated. AI scheduling temporarily unavailable."
      );
    }
  };

  const handleRefresh = async () => {
    await Promise.all([
      loadTasks(),
      generateAISchedule().catch(() => generateBasicSchedule()),
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
              clearTasksError();
              clearScheduleError();
              handleRefresh();
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
          <RefreshControl refreshing={loading} onRefresh={handleRefresh} />
        }
      >
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>Today</Text>
              <Text style={styles.date}>
                {new Date().toLocaleDateString("en-US", {
                  weekday: "long",
                  month: "long",
                  day: "numeric",
                })}
              </Text>
            </View>

            {/* AI Schedule Indicator */}
            {hasAISchedule && (
              <View style={styles.aiIndicator}>
                <Text style={styles.aiIndicatorText}>AI ✨</Text>
              </View>
            )}
          </View>

          {/* Progress Overview */}
          <View style={styles.progressCard}>
            <View style={styles.progressHeader}>
              <Text style={styles.cardTitle}>Progress</Text>
              <ProgressBlob
                completed={taskStats.completed}
                total={taskStats.total}
              />
            </View>

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

          {/* Schedule Overview */}
          {currentSchedule && (
            <View style={styles.scheduleCard}>
              <View style={styles.scheduleHeader}>
                <Text style={styles.cardTitle}>
                  {hasAISchedule ? "AI-Optimized Schedule" : "Daily Schedule"}
                </Text>
                <TouchableOpacity
                  onPress={() => setShowScheduleView(!showScheduleView)}
                >
                  <Text style={styles.viewToggle}>
                    {showScheduleView ? "Hide" : "View"}
                  </Text>
                </TouchableOpacity>
              </View>

              {showScheduleView && (
                <View style={styles.scheduleContent}>
                  {/* AI Schedule */}
                  {hasAISchedule && schedule?.timeBlocks && (
                    <View style={styles.timeBlocks}>
                      {schedule.timeBlocks.slice(0, 4).map((block, index) => (
                        <View key={index} style={styles.timeBlock}>
                          <Text style={styles.timeBlockTime}>
                            {block.startTime} - {block.endTime}
                          </Text>
                          <Text style={styles.timeBlockTitle}>
                            {block.taskTitle}
                          </Text>
                          <Text style={styles.timeBlockMeta}>
                            {block.energyLevel} energy • {block.priority}{" "}
                            priority
                          </Text>
                        </View>
                      ))}
                    </View>
                  )}

                  {/* Basic Schedule Fallback */}
                  {!hasAISchedule && basicSchedule?.tasks && (
                    <View style={styles.timeBlocks}>
                      {basicSchedule.tasks
                        .slice(0, 4)
                        .map((task: any, index: number) => (
                          <View key={index} style={styles.timeBlock}>
                            <Text style={styles.timeBlockTime}>
                              {task.startTime} - {task.endTime}
                            </Text>
                            <Text style={styles.timeBlockTitle}>
                              {task.title}
                            </Text>
                            <Text style={styles.timeBlockMeta}>
                              {task.priority} priority •{" "}
                              {task.estimatedDuration}min
                            </Text>
                          </View>
                        ))}
                    </View>
                  )}

                  {/* AI Recommendations */}
                  {hasAISchedule && schedule?.recommendations && (
                    <View style={styles.recommendationsSection}>
                      <Text style={styles.recommendationsTitle}>
                        💡 AI Recommendations
                      </Text>
                      {schedule.recommendations
                        .slice(0, 2)
                        .map((rec, index) => (
                          <Text key={index} style={styles.recommendation}>
                            • {rec}
                          </Text>
                        ))}
                    </View>
                  )}
                </View>
              )}
            </View>
          )}

          {/* Schedule Actions */}
          <View style={styles.scheduleActions}>
            <TouchableOpacity
              style={styles.scheduleActionButton}
              onPress={handleGenerateSchedule}
            >
              <Text style={styles.scheduleActionText}>
                {hasAISchedule
                  ? "🔄 Regenerate AI Schedule"
                  : "✨ Generate AI Schedule"}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Task List */}
          {loading && tasks.length === 0 ? (
            <View style={styles.loadingCard}>
              <Text style={styles.loadingText}>Loading your tasks...</Text>
            </View>
          ) : tasks.length === 0 ? (
            <EmptyTasksState />
          ) : (
            <View style={styles.tasksContainer}>
              <Text style={styles.sectionTitle}>Today's Tasks</Text>
              {tasks.map((task) => (
                <TouchableOpacity
                  key={task.id}
                  onPress={() => handleTaskPress(task)}
                >
                  <TaskCard
                    task={task}
                    onComplete={() => handleTaskComplete(task.id)}
                    onReschedule={() => handleTaskReschedule(task.id)}
                  />
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Task Detail Modal */}
      <TaskDetailModal
        task={selectedTask}
        visible={showTaskDetail}
        onClose={() => {
          setShowTaskDetail(false);
          setSelectedTask(null);
        }}
        onUpdate={handleTaskUpdate}
      />
    </SafeAreaView>
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
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
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
  aiIndicator: {
    backgroundColor: Colors.primary.main,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.md,
  },
  aiIndicatorText: {
    ...Typography.captionSmall,
    color: Colors.text.onPrimary,
    fontWeight: "bold",
  },
  progressCard: {
    backgroundColor: Colors.background.card,
    padding: Padding.card.medium,
    borderRadius: BorderRadius.blob.medium,
    marginBottom: Spacing.lg,
  },
  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.md,
  },
  cardTitle: {
    ...Typography.h3,
    color: Colors.text.primary,
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
  scheduleCard: {
    backgroundColor: Colors.background.card,
    padding: Padding.card.medium,
    borderRadius: BorderRadius.blob.medium,
    marginBottom: Spacing.lg,
  },
  scheduleHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.md,
  },
  viewToggle: {
    ...Typography.bodyMedium,
    color: Colors.primary.main,
  },
  scheduleContent: {
    marginTop: Spacing.sm,
  },
  timeBlocks: {
    gap: Spacing.sm,
  },
  timeBlock: {
    backgroundColor: Colors.background.secondary,
    padding: Padding.card.small,
    borderRadius: BorderRadius.md,
  },
  timeBlockTime: {
    ...Typography.captionMedium,
    color: Colors.primary.main,
    fontWeight: "bold",
  },
  timeBlockTitle: {
    ...Typography.bodyMedium,
    color: Colors.text.primary,
    marginVertical: Spacing.xs,
  },
  timeBlockMeta: {
    ...Typography.captionSmall,
    color: Colors.text.muted,
  },
  recommendationsSection: {
    marginTop: Spacing.md,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.background.secondary,
  },
  recommendationsTitle: {
    ...Typography.bodyMedium,
    color: Colors.text.primary,
    fontWeight: "bold",
    marginBottom: Spacing.sm,
  },
  recommendation: {
    ...Typography.bodySmall,
    color: Colors.text.secondary,
    marginBottom: Spacing.xs,
    fontStyle: "italic",
  },
  scheduleActions: {
    marginBottom: Spacing.lg,
  },
  scheduleActionButton: {
    backgroundColor: Colors.primary.main,
    paddingVertical: Padding.button.medium.vertical,
    paddingHorizontal: Padding.button.medium.horizontal,
    borderRadius: BorderRadius.md,
    alignItems: "center",
  },
  scheduleActionText: {
    ...Typography.buttonMedium,
    color: Colors.text.onPrimary,
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
  tasksContainer: {
    marginTop: Spacing.md,
  },
  sectionTitle: {
    ...Typography.h3,
    color: Colors.text.primary,
    marginBottom: Spacing.md,
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
