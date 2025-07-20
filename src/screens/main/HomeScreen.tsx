import FloatingAIAssistant from "@/components/ai/FloatingAIAssistant";
import { BorderRadius, Colors, Spacing, Typography } from "@/constants";
import { useAuth } from "@/hooks/useAuth";
import { Ionicons } from "@expo/vector-icons";
import {
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

// Mock data - will be replaced with real data later
const mockData = {
  todayProgress: {
    tasksCompleted: 3,
    totalTasks: 8,
    percentage: 37.5,
  },
  currentTask: {
    title: "Review quarterly reports",
    timeRemaining: "45 min",
    type: "work",
  },
  energyLevel: 75,
  streak: 5,
  weeklyGoals: {
    completed: 2,
    total: 5,
  },
  upcomingTasks: [
    { title: "Gym workout", time: "2:00 PM", type: "fitness" },
    { title: "Team meeting", time: "3:30 PM", type: "work" },
    { title: "Read 30 minutes", time: "7:00 PM", type: "personal" },
  ],
  motivationalMessage: "You're making great progress! Keep up the momentum.",
  weatherImpact: null, // null means no weather-related adjustments
};

const HomeScreen = () => {
  const { userProfile } = useAuth();

  const handleAIMessage = (message: string) => {
    // TODO: Implement AI message handling
    Alert.alert(
      "AI Assistant",
      `You said: "${message}"\n\nAI integration coming soon!`
    );
  };

  const handleQuickAction = (action: string) => {
    Alert.alert("Quick Action", `${action} - Navigation coming soon!`);
  };

  const handleStartTask = () => {
    Alert.alert("Start Task", "Task timer integration coming soon!");
  };

  const getTimeOfDayGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  const getEnergyColor = (level: number) => {
    if (level >= 75) return Colors.success.main;
    if (level >= 50) return Colors.warning.main;
    return Colors.error.main;
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          {/* Header with Greeting */}
          <View style={styles.header}>
            <Text style={styles.greeting}>
              {getTimeOfDayGreeting()}, {userProfile?.fullName || "there"}! 👋
            </Text>
            <Text style={styles.motivation}>
              {mockData.motivationalMessage}
            </Text>
          </View>

          {/* Today's Progress Overview */}
          <View style={styles.progressCard}>
            <View style={styles.progressHeader}>
              <Text style={styles.cardTitle}>Today&apos;s Progress</Text>
              <View style={styles.streakContainer}>
                <Ionicons name="flame" size={16} color={Colors.primary.main} />
                <Text style={styles.streakText}>
                  {mockData.streak} day streak
                </Text>
              </View>
            </View>

            {/* Progress Bar */}
            <View style={styles.progressBarContainer}>
              <View style={styles.progressBar}>
                <View
                  style={[
                    styles.progressFill,
                    { width: `${mockData.todayProgress.percentage}%` },
                  ]}
                />
              </View>
              <Text style={styles.progressText}>
                {mockData.todayProgress.tasksCompleted} of{" "}
                {mockData.todayProgress.totalTasks} tasks completed
              </Text>
            </View>

            {/* Stats Row */}
            <View style={styles.statsRow}>
              <View style={styles.stat}>
                <Text style={styles.statNumber}>
                  {mockData.todayProgress.tasksCompleted}
                </Text>
                <Text style={styles.statLabel}>Done Today</Text>
              </View>
              <View style={styles.stat}>
                <Text style={styles.statNumber}>
                  {mockData.weeklyGoals.completed}/{mockData.weeklyGoals.total}
                </Text>
                <Text style={styles.statLabel}>Weekly Goals</Text>
              </View>
              <View style={styles.stat}>
                <Text
                  style={[
                    styles.statNumber,
                    { color: getEnergyColor(mockData.energyLevel) },
                  ]}
                >
                  {mockData.energyLevel}%
                </Text>
                <Text style={styles.statLabel}>Energy</Text>
              </View>
            </View>
          </View>

          {/* Current Active Task */}
          {mockData.currentTask && (
            <View style={styles.activeTaskCard}>
              <View style={styles.activeTaskHeader}>
                <View style={styles.activeTaskInfo}>
                  <Text style={styles.activeTaskTitle}>Current Task</Text>
                  <Text style={styles.activeTaskName}>
                    {mockData.currentTask.title}
                  </Text>
                  <Text style={styles.activeTaskTime}>
                    <Ionicons
                      name="time-outline"
                      size={14}
                      color={Colors.text.secondary}
                    />{" "}
                    {mockData.currentTask.timeRemaining} remaining
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.startButton}
                  onPress={handleStartTask}
                >
                  <Ionicons
                    name="play"
                    size={16}
                    color={Colors.text.onPrimary}
                  />
                  <Text style={styles.startButtonText}>Continue</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Energy Check-in Widget */}
          <View style={styles.energyCard}>
            <Text style={styles.cardTitle}>How are you feeling?</Text>
            <View style={styles.energyMeter}>
              <View style={styles.energyBar}>
                <View
                  style={[
                    styles.energyFill,
                    {
                      width: `${mockData.energyLevel}%`,
                      backgroundColor: getEnergyColor(mockData.energyLevel),
                    },
                  ]}
                />
              </View>
              <Text style={styles.energyText}>
                {mockData.energyLevel}% Energy
              </Text>
            </View>
            <View style={styles.energyButtons}>
              <TouchableOpacity style={styles.energyButton}>
                <Text style={styles.energyButtonText}>😴 Tired</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.energyButton}>
                <Text style={styles.energyButtonText}>😊 Good</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.energyButton}>
                <Text style={styles.energyButtonText}>⚡ Energized</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Quick Actions */}
          <View style={styles.quickActionsCard}>
            <Text style={styles.cardTitle}>Quick Actions</Text>
            <View style={styles.quickActionsGrid}>
              <TouchableOpacity
                style={styles.quickActionButton}
                onPress={() => handleQuickAction("View Today's Schedule")}
              >
                <Ionicons
                  name="calendar"
                  size={24}
                  color={Colors.primary.main}
                />
                <Text style={styles.quickActionText}>
                  Today&apos;s Schedule
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.quickActionButton}
                onPress={() => handleQuickAction("Check Goals")}
              >
                <Ionicons name="flag" size={24} color={Colors.primary.main} />
                <Text style={styles.quickActionText}>My Goals</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.quickActionButton}
                onPress={() => handleQuickAction("Buddy Check-in")}
              >
                <Ionicons name="people" size={24} color={Colors.primary.main} />
                <Text style={styles.quickActionText}>Buddy Check</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.quickActionButton}
                onPress={() => handleQuickAction("Start Timer")}
              >
                <Ionicons name="timer" size={24} color={Colors.primary.main} />
                <Text style={styles.quickActionText}>Start Timer</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Upcoming Tasks */}
          <View style={styles.upcomingCard}>
            <Text style={styles.cardTitle}>Coming Up</Text>
            {mockData.upcomingTasks.map((task, index) => (
              <View key={index} style={styles.upcomingTask}>
                <View style={styles.upcomingTaskIcon}>
                  <Ionicons
                    name={
                      task.type === "fitness"
                        ? "fitness-outline"
                        : task.type === "work"
                          ? "briefcase-outline"
                          : "book-outline"
                    }
                    size={16}
                    color={Colors.text.secondary}
                  />
                </View>
                <View style={styles.upcomingTaskContent}>
                  <Text style={styles.upcomingTaskTitle}>{task.title}</Text>
                  <Text style={styles.upcomingTaskTime}>{task.time}</Text>
                </View>
              </View>
            ))}
          </View>

          {/* AI Insights */}
          <View style={styles.insightsCard}>
            <Text style={styles.cardTitle}>💡 AI Insights</Text>
            <Text style={styles.insightText}>
              Based on your progress, you&apos;re most productive in the
              morning. Consider scheduling important tasks between 9-11 AM.
            </Text>
            <TouchableOpacity style={styles.insightButton}>
              <Text style={styles.insightButtonText}>View More Insights</Text>
              <Ionicons
                name="chevron-forward"
                size={16}
                color={Colors.primary.main}
              />
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Floating AI Assistant */}
      <FloatingAIAssistant onSendMessage={handleAIMessage} />
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
    padding: Spacing.md,
  },
  header: {
    marginBottom: Spacing.xl,
  },
  greeting: {
    ...Typography.h2,
    color: Colors.text.primary,
    marginBottom: Spacing.sm,
  },
  motivation: {
    ...Typography.bodyLarge,
    color: Colors.text.secondary,
  },
  card: {
    backgroundColor: Colors.background.card,
    padding: Spacing.lg,
    borderRadius: BorderRadius.blob.medium,
    marginBottom: Spacing.lg,
  },
  cardTitle: {
    ...Typography.h3,
    color: Colors.text.primary,
    marginBottom: Spacing.md,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  stat: {
    alignItems: "center",
  },
  statNumber: {
    ...Typography.h2,
    color: Colors.primary.main,
    marginBottom: Spacing.xs,
  },
  statLabel: {
    ...Typography.captionMedium,
    color: Colors.text.secondary,
  },
  placeholder: {
    ...Typography.bodyMedium,
    color: Colors.text.secondary,
    lineHeight: 22,
  },
  noteCard: {
    backgroundColor: Colors.background.secondary,
    borderWidth: 1,
    borderColor: Colors.border.subtle,
  },
  noteTitle: {
    ...Typography.h4,
    color: Colors.text.primary,
    marginBottom: Spacing.sm,
  },
  noteText: {
    ...Typography.captionMedium,
    color: Colors.text.muted,
    lineHeight: 18,
  },
  // Progress Card Styles
  progressCard: {
    backgroundColor: Colors.background.card,
    padding: Spacing.lg,
    borderRadius: BorderRadius.blob.medium,
    marginBottom: Spacing.lg,
  },
  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.sm,
  },
  streakContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  streakText: {
    ...Typography.captionMedium,
    color: Colors.primary.main,
    marginLeft: 4,
  },
  progressBarContainer: {
    marginBottom: Spacing.md,
  },
  progressBar: {
    height: 8,
    backgroundColor: Colors.background.secondary,
    borderRadius: 4,
    marginBottom: 8,
  },
  progressFill: {
    height: "100%",
    backgroundColor: Colors.primary.main,
    borderRadius: 4,
  },
  progressText: {
    ...Typography.captionMedium,
    color: Colors.text.secondary,
    textAlign: "center",
  },
  // Active Task Card Styles
  activeTaskCard: {
    backgroundColor: Colors.background.card,
    padding: Spacing.lg,
    borderRadius: BorderRadius.blob.medium,
    marginBottom: Spacing.lg,
    borderLeftWidth: 4,
    borderLeftColor: Colors.primary.main,
  },
  activeTaskHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  activeTaskInfo: {
    flex: 1,
  },
  activeTaskTitle: {
    ...Typography.captionMedium,
    color: Colors.text.secondary,
    marginBottom: 4,
  },
  activeTaskName: {
    ...Typography.h4,
    color: Colors.text.primary,
    marginBottom: 4,
  },
  activeTaskTime: {
    ...Typography.captionMedium,
    color: Colors.text.secondary,
    flexDirection: "row",
    alignItems: "center",
  },
  startButton: {
    backgroundColor: Colors.primary.main,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.blob.small,
    flexDirection: "row",
    alignItems: "center",
  },
  startButtonText: {
    ...Typography.buttonMedium,
    color: Colors.text.onPrimary,
    marginLeft: 4,
  },
  // Energy Card Styles
  energyCard: {
    backgroundColor: Colors.background.card,
    padding: Spacing.lg,
    borderRadius: BorderRadius.blob.medium,
    marginBottom: Spacing.lg,
  },
  energyMeter: {
    marginBottom: Spacing.md,
  },
  energyBar: {
    height: 8,
    backgroundColor: Colors.background.secondary,
    borderRadius: 4,
    marginBottom: 8,
  },
  energyFill: {
    height: "100%",
    borderRadius: 4,
  },
  energyText: {
    ...Typography.captionMedium,
    color: Colors.text.secondary,
    textAlign: "center",
  },
  energyButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  energyButton: {
    backgroundColor: Colors.background.secondary,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.blob.small,
    flex: 1,
    marginHorizontal: 4,
    alignItems: "center",
  },
  energyButtonText: {
    ...Typography.captionMedium,
    color: Colors.text.secondary,
  },
  // Quick Actions Styles
  quickActionsCard: {
    backgroundColor: Colors.background.card,
    padding: Spacing.lg,
    borderRadius: BorderRadius.blob.medium,
    marginBottom: Spacing.lg,
  },
  quickActionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  quickActionButton: {
    backgroundColor: Colors.background.secondary,
    width: "48%",
    padding: Spacing.md,
    borderRadius: BorderRadius.blob.small,
    alignItems: "center",
    marginBottom: Spacing.sm,
  },
  quickActionText: {
    ...Typography.captionMedium,
    color: Colors.text.primary,
    textAlign: "center",
    marginTop: 4,
  },
  // Upcoming Tasks Styles
  upcomingCard: {
    backgroundColor: Colors.background.card,
    padding: Spacing.lg,
    borderRadius: BorderRadius.blob.medium,
    marginBottom: Spacing.lg,
  },
  upcomingTask: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.subtle,
  },
  upcomingTaskIcon: {
    marginRight: Spacing.sm,
  },
  upcomingTaskContent: {
    flex: 1,
  },
  upcomingTaskTitle: {
    ...Typography.bodyMedium,
    color: Colors.text.primary,
  },
  upcomingTaskTime: {
    ...Typography.captionMedium,
    color: Colors.text.secondary,
    marginTop: 2,
  },
  // Insights Card Styles
  insightsCard: {
    backgroundColor: Colors.background.card,
    padding: Spacing.lg,
    borderRadius: BorderRadius.blob.medium,
    marginBottom: Spacing.lg,
  },
  insightText: {
    ...Typography.bodyMedium,
    color: Colors.text.secondary,
    lineHeight: 20,
    marginBottom: Spacing.sm,
  },
  insightButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  insightButtonText: {
    ...Typography.buttonMedium,
    color: Colors.primary.main,
  },
});

export default HomeScreen;
