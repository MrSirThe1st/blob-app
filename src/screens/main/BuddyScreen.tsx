import FloatingAIAssistant from "@/components/ai/FloatingAIAssistant";
import { BorderRadius, Colors, Spacing, Typography } from "@/constants";
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
const mockBuddy = {
  name: "Alex Johnson",
  avatar: "👤",
  streak: 7,
  todayProgress: 75,
  sharedGoals: ["Gym 4x/week", "Read 30min daily", "Complete work projects"],
  recentActivity: [
    { action: "Completed workout", time: "2 hours ago", type: "gym" },
    {
      action: "Finished reading session",
      time: "5 hours ago",
      type: "reading",
    },
    {
      action: "Completed task: Review presentations",
      time: "Yesterday",
      type: "work",
    },
  ],
  weeklyStats: {
    tasksCompleted: 28,
    goalsAchieved: 5,
    consistency: 85,
  },
};

const BuddyScreen = () => {
  const handleAIMessage = (message: string) => {
    // TODO: Implement AI message handling for buddy system
    Alert.alert(
      "AI Assistant",
      `You said: "${message}"\n\nAI integration for buddy system coming soon!`
    );
  };

  const handleSendNudge = () => {
    Alert.alert(
      "Nudge Sent",
      "Your encouragement has been sent to your buddy!"
    );
  };

  const handleFindNewBuddy = () => {
    Alert.alert("Find Buddy", "AI-powered buddy matching coming soon!");
  };

  const handleViewBuddyProfile = () => {
    Alert.alert("Buddy Profile", "Detailed buddy profile coming soon!");
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.title}>Goal Buddy</Text>
            <Text style={styles.subtitle}>Your accountability partner</Text>
          </View>

          {/* Current Buddy Card */}
          <View style={styles.buddyCard}>
            <View style={styles.buddyHeader}>
              <View style={styles.buddyInfo}>
                <Text style={styles.buddyAvatar}>{mockBuddy.avatar}</Text>
                <View style={styles.buddyDetails}>
                  <Text style={styles.buddyName}>{mockBuddy.name}</Text>
                  <View style={styles.streakContainer}>
                    <Ionicons
                      name="flame"
                      size={16}
                      color={Colors.primary.main}
                    />
                    <Text style={styles.streakText}>
                      {mockBuddy.streak} day streak
                    </Text>
                  </View>
                </View>
              </View>
              <TouchableOpacity
                style={styles.profileButton}
                onPress={handleViewBuddyProfile}
              >
                <Ionicons
                  name="person-outline"
                  size={20}
                  color={Colors.text.primary}
                />
              </TouchableOpacity>
            </View>

            {/* Today's Progress */}
            <View style={styles.progressSection}>
              <Text style={styles.sectionTitle}>Today&apos;s Progress</Text>
              <View style={styles.progressBar}>
                <View
                  style={[
                    styles.progressFill,
                    { width: `${mockBuddy.todayProgress}%` },
                  ]}
                />
              </View>
              <Text style={styles.progressText}>
                {mockBuddy.todayProgress}% completed
              </Text>
            </View>

            {/* Action Buttons */}
            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={styles.nudgeButton}
                onPress={handleSendNudge}
              >
                <Ionicons
                  name="notifications-outline"
                  size={20}
                  color={Colors.text.onPrimary}
                />
                <Text style={styles.nudgeButtonText}>Send Nudge</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.encourageButton}
                onPress={() =>
                  Alert.alert("Encouragement", "Great job message sent!")
                }
              >
                <Ionicons
                  name="heart-outline"
                  size={20}
                  color={Colors.primary.main}
                />
                <Text style={styles.encourageButtonText}>Encourage</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Shared Goals */}
          <View style={styles.sharedGoalsCard}>
            <Text style={styles.cardTitle}>🎯 Shared Goals</Text>
            {mockBuddy.sharedGoals.map((goal, index) => (
              <View key={index} style={styles.goalItem}>
                <View style={styles.goalDot} />
                <Text style={styles.goalText}>{goal}</Text>
              </View>
            ))}
          </View>

          {/* Recent Activity */}
          <View style={styles.activityCard}>
            <Text style={styles.cardTitle}>📊 Recent Activity</Text>
            {mockBuddy.recentActivity.map((activity, index) => (
              <View key={index} style={styles.activityItem}>
                <View style={styles.activityIcon}>
                  <Ionicons
                    name={
                      activity.type === "gym"
                        ? "fitness-outline"
                        : activity.type === "reading"
                          ? "book-outline"
                          : "briefcase-outline"
                    }
                    size={16}
                    color={Colors.text.secondary}
                  />
                </View>
                <View style={styles.activityContent}>
                  <Text style={styles.activityAction}>{activity.action}</Text>
                  <Text style={styles.activityTime}>{activity.time}</Text>
                </View>
              </View>
            ))}
          </View>

          {/* Weekly Stats */}
          <View style={styles.statsCard}>
            <Text style={styles.cardTitle}>📈 This Week</Text>
            <View style={styles.statsGrid}>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>
                  {mockBuddy.weeklyStats.tasksCompleted}
                </Text>
                <Text style={styles.statLabel}>Tasks Done</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>
                  {mockBuddy.weeklyStats.goalsAchieved}
                </Text>
                <Text style={styles.statLabel}>Goals Hit</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>
                  {mockBuddy.weeklyStats.consistency}%
                </Text>
                <Text style={styles.statLabel}>Consistency</Text>
              </View>
            </View>
          </View>

          {/* Find New Buddy */}
          <TouchableOpacity
            style={styles.findBuddyCard}
            onPress={handleFindNewBuddy}
          >
            <View style={styles.findBuddyContent}>
              <Ionicons
                name="people-outline"
                size={24}
                color={Colors.primary.main}
              />
              <Text style={styles.findBuddyText}>Find New Buddy</Text>
              <Text style={styles.findBuddySubtext}>AI-powered matching</Text>
            </View>
            <Ionicons
              name="chevron-forward"
              size={20}
              color={Colors.text.secondary}
            />
          </TouchableOpacity>
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
  subtitle: {
    ...Typography.bodyMedium,
    color: Colors.text.secondary,
  },

  // Buddy Card Styles
  buddyCard: {
    backgroundColor: Colors.background.card,
    padding: Spacing.lg,
    borderRadius: BorderRadius.blob.medium,
    marginBottom: Spacing.lg,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  buddyHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.lg,
  },
  buddyInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  buddyAvatar: {
    fontSize: 32,
    marginRight: Spacing.md,
  },
  buddyDetails: {
    flex: 1,
  },
  buddyName: {
    ...Typography.h3,
    color: Colors.text.primary,
    marginBottom: Spacing.xs / 2,
  },
  streakContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  streakText: {
    ...Typography.captionMedium,
    color: Colors.primary.main,
    marginLeft: Spacing.xs / 2,
    fontWeight: "600",
  },
  profileButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.background.secondary,
    alignItems: "center",
    justifyContent: "center",
  },

  // Progress Section
  progressSection: {
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    ...Typography.bodyLarge,
    color: Colors.text.primary,
    fontWeight: "600",
    marginBottom: Spacing.sm,
  },
  progressBar: {
    height: 8,
    backgroundColor: Colors.background.secondary,
    borderRadius: 4,
    marginBottom: Spacing.sm,
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

  // Action Buttons
  actionButtons: {
    flexDirection: "row",
    gap: Spacing.md,
  },
  nudgeButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.primary.main,
    padding: Spacing.sm,
    borderRadius: BorderRadius.lg,
    gap: Spacing.xs,
  },
  nudgeButtonText: {
    ...Typography.bodyMedium,
    color: Colors.text.onPrimary,
    fontWeight: "600",
  },
  encourageButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.background.secondary,
    padding: Spacing.sm,
    borderRadius: BorderRadius.lg,
    gap: Spacing.xs,
    borderWidth: 1,
    borderColor: Colors.primary.main,
  },
  encourageButtonText: {
    ...Typography.bodyMedium,
    color: Colors.primary.main,
    fontWeight: "600",
  },

  // Shared Goals Card
  sharedGoalsCard: {
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
  goalItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.sm,
  },
  goalDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.primary.main,
    marginRight: Spacing.sm,
  },
  goalText: {
    ...Typography.bodyMedium,
    color: Colors.text.primary,
    flex: 1,
  },

  // Activity Card
  activityCard: {
    backgroundColor: Colors.background.card,
    padding: Spacing.lg,
    borderRadius: BorderRadius.blob.medium,
    marginBottom: Spacing.lg,
  },
  activityItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: Spacing.md,
  },
  activityIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.background.secondary,
    alignItems: "center",
    justifyContent: "center",
    marginRight: Spacing.sm,
  },
  activityContent: {
    flex: 1,
  },
  activityAction: {
    ...Typography.bodyMedium,
    color: Colors.text.primary,
    marginBottom: Spacing.xs / 2,
  },
  activityTime: {
    ...Typography.captionMedium,
    color: Colors.text.secondary,
  },

  // Stats Card
  statsCard: {
    backgroundColor: Colors.background.card,
    padding: Spacing.lg,
    borderRadius: BorderRadius.blob.medium,
    marginBottom: Spacing.lg,
  },
  statsGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  statItem: {
    alignItems: "center",
    flex: 1,
  },
  statNumber: {
    ...Typography.h2,
    color: Colors.primary.main,
    fontWeight: "700",
    marginBottom: Spacing.xs / 2,
  },
  statLabel: {
    ...Typography.captionMedium,
    color: Colors.text.secondary,
    textAlign: "center",
  },

  // Find Buddy Card
  findBuddyCard: {
    backgroundColor: Colors.background.card,
    padding: Spacing.lg,
    borderRadius: BorderRadius.blob.medium,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 2,
    borderColor: Colors.primary.light,
    borderStyle: "dashed",
  },
  findBuddyContent: {
    alignItems: "center",
    flex: 1,
  },
  findBuddyText: {
    ...Typography.bodyLarge,
    color: Colors.primary.main,
    fontWeight: "600",
    marginTop: Spacing.xs,
  },
  findBuddySubtext: {
    ...Typography.captionMedium,
    color: Colors.text.secondary,
    marginTop: Spacing.xs / 2,
  },
});

export default BuddyScreen;
