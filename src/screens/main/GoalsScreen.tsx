// src/screens/main/GoalsScreen.tsx
import FloatingAIAssistant from "@/components/ai/FloatingAIAssistant";
import { BorderRadius, Colors, Spacing, Typography } from "@/constants";
import { useAuth } from "@/hooks/useAuth";
import { Goal, goalsService } from "@/services/goals/GoalsService";
import { integrationHelpers } from "@/services/integration/GoalTaskIntegration";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// Import components
import GoalCard from "@/components/goals/GoalCard";
import GoalCreationModal from "@/components/goals/GoalCreationModal";
import GoalDetailModal from "@/components/goals/GoalDetailModal";

const GoalsScreen = () => {
  const { userProfile } = useAuth();
  const navigation = useNavigation();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);
  const [goalsOverview, setGoalsOverview] = useState({
    totalGoals: 0,
    completedGoals: 0,
    activeGoals: 0,
    averageProgress: 0,
    totalXPFromGoals: 0,
  });

  // Memoized loadGoals function
  const loadGoals = useCallback(async () => {
    if (!userProfile?.id) return;

    try {
      setIsLoading(true);
      const [userGoals, overview] = await Promise.all([
        goalsService.getUserGoals(userProfile.id),
        goalsService.getUserGoalsOverview(userProfile.id),
      ]);

      setGoals(userGoals);
      setGoalsOverview(overview);
    } catch (error) {
      console.error("Error loading goals:", error);
      Alert.alert("Error", "Failed to load goals. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, [userProfile?.id]);

  // Load goals when screen focuses
  useFocusEffect(
    useCallback(() => {
      loadGoals();
    }, [loadGoals])
  );

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadGoals();
    setIsRefreshing(false);
  };

  const handleGoalCreated = async (newGoal: Goal) => {
    setGoals((prev) => [newGoal, ...prev]);
    setGoalsOverview((prev) => ({
      ...prev,
      totalGoals: prev.totalGoals + 1,
      activeGoals: prev.activeGoals + 1,
    }));
    // NEW: Integrate with task system
    if (userProfile?.id) {
      try {
        await integrationHelpers.onGoalCreated(newGoal, userProfile.id);
        Alert.alert(
          "Success!",
          "Goal created and daily tasks generated! Check your Today screen to see your personalized tasks.",
          [
            { text: "View Tasks", onPress: () => navigation.navigate("Today") },
            { text: "OK" },
          ]
        );
      } catch (error) {
        Alert.alert(
          "Goal Created",
          "Goal created successfully! Task generation will happen in the background."
        );
      }
    }
    setShowCreateModal(false);
  };

  const handleGoalPress = (goal: Goal) => {
    setSelectedGoal(goal);
    setShowDetailModal(true);
  };

  const handleProgressUpdate = async (goalId: string, newProgress: number) => {
    try {
      const success = await goalsService.updateGoalProgress(
        goalId,
        newProgress
      );
      if (success) {
        // Update local state
        setGoals((prev) =>
          prev.map((goal) =>
            goal.id === goalId
              ? {
                  ...goal,
                  progress: newProgress,
                  isCompleted: newProgress >= 100,
                }
              : goal
          )
        );

        // Update selected goal if it's the one being updated
        if (selectedGoal?.id === goalId) {
          setSelectedGoal((prev) =>
            prev
              ? {
                  ...prev,
                  progress: newProgress,
                  isCompleted: newProgress >= 100,
                }
              : null
          );
        }

        // Show completion celebration
        if (newProgress >= 100) {
          const goal = goals.find((g) => g.id === goalId);
          Alert.alert(
            "🎉 Goal Completed!",
            `Congratulations on completing "${goal?.title}"! You've earned XP and unlocked new achievements.`,
            [{ text: "Awesome!", style: "default" }]
          );
        }

        // Refresh overview stats
        if (userProfile?.id) {
          const overview = await goalsService.getUserGoalsOverview(
            userProfile.id
          );
          setGoalsOverview(overview);
        }
      } else {
        Alert.alert("Error", "Failed to update progress. Please try again.");
      }
    } catch (error) {
      console.error("Error updating goal progress:", error);
      Alert.alert("Error", "Failed to update progress. Please try again.");
    }
  };

  const handleGoalDelete = async (goalId: string) => {
    try {
      const success = await goalsService.deleteGoal(goalId);
      if (success) {
        setGoals((prev) => prev.filter((goal) => goal.id !== goalId));
        setGoalsOverview((prev) => ({
          ...prev,
          totalGoals: prev.totalGoals - 1,
          activeGoals: prev.activeGoals - 1,
        }));
      } else {
        Alert.alert("Error", "Failed to delete goal. Please try again.");
      }
    } catch (error) {
      console.error("Error deleting goal:", error);
      Alert.alert("Error", "Failed to delete goal. Please try again.");
    }
  };

  const handleAIMessage = (message: string) => {
    // TODO: Implement AI message handling for goals
    Alert.alert(
      "AI Assistant",
      `You said: "${message}"\n\nAI integration for goals coming soon!`
    );
  };

  const renderOverviewStats = () => (
    <View style={styles.overviewCard}>
      <Text style={styles.overviewTitle}>Your Goals Overview</Text>
      <View style={styles.statsGrid}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{goalsOverview.totalGoals}</Text>
          <Text style={styles.statLabel}>Total Goals</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={[styles.statNumber, { color: Colors.success.main }]}>
            {goalsOverview.completedGoals}
          </Text>
          <Text style={styles.statLabel}>Completed</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={[styles.statNumber, { color: Colors.primary.main }]}>
            {goalsOverview.activeGoals}
          </Text>
          <Text style={styles.statLabel}>Active</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={[styles.statNumber, { color: Colors.warning.main }]}>
            {goalsOverview.averageProgress}%
          </Text>
          <Text style={styles.statLabel}>Avg Progress</Text>
        </View>
      </View>
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyStateEmoji}>🎯</Text>
      <Text style={styles.emptyStateTitle}>No Goals Yet</Text>
      <Text style={styles.emptyStateMessage}>
        Ready to achieve something amazing? Create your first goal and let our
        AI help you break it down into manageable steps.
      </Text>
      <TouchableOpacity
        style={styles.createFirstGoalButton}
        onPress={() => setShowCreateModal(true)}
      >
        <Text style={styles.createFirstGoalButtonText}>
          Create Your First Goal
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderGoalsList = () => {
    const activeGoals = goals.filter((goal) => !goal.isCompleted);
    const completedGoals = goals.filter((goal) => goal.isCompleted);

    return (
      <View style={styles.goalsContainer}>
        {/* Active Goals */}
        {activeGoals.length > 0 && (
          <View style={styles.goalsSection}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Active Goals</Text>
              <Text style={styles.sectionCount}>({activeGoals.length})</Text>
            </View>
            {activeGoals.map((goal) => (
              <GoalCard
                key={goal.id}
                goal={goal}
                onPress={handleGoalPress}
                onProgressUpdate={handleProgressUpdate}
              />
            ))}
          </View>
        )}

        {/* Completed Goals */}
        {completedGoals.length > 0 && (
          <View style={styles.goalsSection}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Completed Goals</Text>
              <Text style={styles.sectionCount}>({completedGoals.length})</Text>
            </View>
            {completedGoals.map((goal) => (
              <GoalCard
                key={goal.id}
                goal={goal}
                onPress={handleGoalPress}
                onProgressUpdate={handleProgressUpdate}
              />
            ))}
          </View>
        )}
      </View>
    );
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary.main} />
          <Text style={styles.loadingText}>Loading your goals...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.title}>Your Goals</Text>
          <Text style={styles.subtitle}>
            Track your progress and achievements
          </Text>
        </View>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setShowCreateModal(true)}
        >
          <Text style={styles.addButtonText}>+</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            colors={[Colors.primary.main]}
            tintColor={Colors.primary.main}
          />
        }
      >
        {goals.length > 0 ? (
          <>
            {renderOverviewStats()}
            {renderGoalsList()}
          </>
        ) : (
          renderEmptyState()
        )}

        {/* Bottom Spacing */}
        <View style={styles.bottomSpacing} />
      </ScrollView>

      {/* Modals */}
      <GoalCreationModal
        visible={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onGoalCreated={handleGoalCreated}
        userId={userProfile?.id || ""}
      />

      <GoalDetailModal
        visible={showDetailModal}
        goal={selectedGoal}
        onClose={() => {
          setShowDetailModal(false);
          setSelectedGoal(null);
        }}
        onProgressUpdate={handleProgressUpdate}
        onGoalDelete={handleGoalDelete}
      />

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
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: Spacing.md,
  },
  loadingText: {
    ...Typography.bodyMedium,
    color: Colors.text.secondary,
  },
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.lg,
  },
  headerLeft: {
    flex: 1,
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
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.primary.main,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: Spacing.md,
  },
  addButtonText: {
    ...Typography.h2,
    color: Colors.text.onPrimary,
    lineHeight: 32,
  },
  scrollView: {
    flex: 1,
  },
  overviewCard: {
    backgroundColor: Colors.background.card,
    borderRadius: BorderRadius.blob.medium,
    padding: Spacing.lg,
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  overviewTitle: {
    ...Typography.h2,
    color: Colors.text.primary,
    marginBottom: Spacing.lg,
    textAlign: "center",
  },
  statsGrid: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  statItem: {
    alignItems: "center",
  },
  statNumber: {
    ...Typography.h1,
    color: Colors.primary.main,
    marginBottom: Spacing.xs,
  },
  statLabel: {
    ...Typography.captionMedium,
    color: Colors.text.secondary,
    textAlign: "center",
  },
  goalsContainer: {
    paddingHorizontal: Spacing.md,
  },
  goalsSection: {
    marginBottom: Spacing.xl,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    ...Typography.h2,
    color: Colors.text.primary,
  },
  sectionCount: {
    ...Typography.bodyMedium,
    color: Colors.text.muted,
    marginLeft: Spacing.sm,
  },
  emptyState: {
    alignItems: "center",
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.xl * 2,
  },
  emptyStateEmoji: {
    fontSize: 64,
    marginBottom: Spacing.lg,
  },
  emptyStateTitle: {
    ...Typography.h1,
    color: Colors.text.primary,
    marginBottom: Spacing.md,
    textAlign: "center",
  },
  emptyStateMessage: {
    ...Typography.bodyLarge,
    color: Colors.text.secondary,
    textAlign: "center",
    lineHeight: 24,
    marginBottom: Spacing.xl,
  },
  createFirstGoalButton: {
    backgroundColor: Colors.primary.main,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.lg,
    borderRadius: BorderRadius.lg,
  },
  createFirstGoalButtonText: {
    ...Typography.buttonLarge,
    color: Colors.text.onPrimary,
  },
  bottomSpacing: {
    height: Spacing.xl,
  },
});

export default GoalsScreen;
