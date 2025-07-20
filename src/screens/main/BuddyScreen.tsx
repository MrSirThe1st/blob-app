import FloatingAIAssistant from "@/components/ai/FloatingAIAssistant";
import { BorderRadius, Colors, Spacing, Typography } from "@/constants";
import { Ionicons } from "@expo/vector-icons";
import { useRef, useState } from "react";
import {
  Alert,
  Dimensions,
  FlatList,
  Modal,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const { width: screenWidth } = Dimensions.get("window");

// Mock data - will be replaced with real data later
const mockBuddies = [
  {
    id: "1",
    name: "Alex Johnson",
    avatar: "�‍💼",
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
  },
  {
    id: "2",
    name: "Sarah Chen",
    avatar: "👩‍🎓",
    streak: 12,
    todayProgress: 90,
    sharedGoals: ["Learn Spanish", "Exercise daily", "Meditate 10min"],
    recentActivity: [
      {
        action: "Completed meditation",
        time: "1 hour ago",
        type: "mindfulness",
      },
      {
        action: "Spanish lesson finished",
        time: "3 hours ago",
        type: "learning",
      },
      {
        action: "Morning run completed",
        time: "6 hours ago",
        type: "gym",
      },
    ],
    weeklyStats: {
      tasksCompleted: 35,
      goalsAchieved: 7,
      consistency: 92,
    },
  },
  {
    id: "3",
    name: "Mike Rodriguez",
    avatar: "👨‍🎨",
    streak: 5,
    todayProgress: 60,
    sharedGoals: ["Creative writing", "Build portfolio", "Network weekly"],
    recentActivity: [
      { action: "Wrote 500 words", time: "4 hours ago", type: "writing" },
      {
        action: "Updated portfolio",
        time: "Yesterday",
        type: "work",
      },
      {
        action: "Attended networking event",
        time: "2 days ago",
        type: "networking",
      },
    ],
    weeklyStats: {
      tasksCompleted: 22,
      goalsAchieved: 4,
      consistency: 78,
    },
  },
];

// Mock data for user discovery by goals
const mockGoalDiscovery = [
  {
    goalName: "Gym 4x/week",
    users: [
      {
        id: "u1",
        name: "Emma Wilson",
        avatar: "💪",
        streak: 15,
        consistency: 92,
        matchScore: 95,
      },
      {
        id: "u2",
        name: "Jake Miller",
        avatar: "🏋️",
        streak: 8,
        consistency: 88,
        matchScore: 91,
      },
      {
        id: "u3",
        name: "Sofia Chen",
        avatar: "🤸",
        streak: 22,
        consistency: 85,
        matchScore: 89,
      },
      {
        id: "u4",
        name: "Ryan Davis",
        avatar: "🏃",
        streak: 12,
        consistency: 90,
        matchScore: 87,
      },
      {
        id: "u5",
        name: "Maya Patel",
        avatar: "🧘",
        streak: 18,
        consistency: 83,
        matchScore: 85,
      },
      {
        id: "u6",
        name: "Leo Garcia",
        avatar: "⚡",
        streak: 6,
        consistency: 86,
        matchScore: 82,
      },
      {
        id: "u7",
        name: "Zoe Kim",
        avatar: "🔥",
        streak: 9,
        consistency: 81,
        matchScore: 80,
      },
      {
        id: "u8",
        name: "Alex Taylor",
        avatar: "💯",
        streak: 14,
        consistency: 79,
        matchScore: 78,
      },
    ],
  },
  {
    goalName: "Read 30min daily",
    users: [
      {
        id: "r1",
        name: "Oliver Smith",
        avatar: "📚",
        streak: 25,
        consistency: 95,
        matchScore: 96,
      },
      {
        id: "r2",
        name: "Lily Brown",
        avatar: "📖",
        streak: 19,
        consistency: 91,
        matchScore: 93,
      },
      {
        id: "r3",
        name: "Noah Johnson",
        avatar: "✍️",
        streak: 11,
        consistency: 89,
        matchScore: 90,
      },
      {
        id: "r4",
        name: "Ava Martinez",
        avatar: "🎓",
        streak: 16,
        consistency: 87,
        matchScore: 88,
      },
      {
        id: "r5",
        name: "Ethan Lee",
        avatar: "📝",
        streak: 7,
        consistency: 84,
        matchScore: 86,
      },
      {
        id: "r6",
        name: "Mia Rodriguez",
        avatar: "🧠",
        streak: 13,
        consistency: 82,
        matchScore: 84,
      },
      {
        id: "r7",
        name: "Lucas Wilson",
        avatar: "📕",
        streak: 20,
        consistency: 80,
        matchScore: 83,
      },
      {
        id: "r8",
        name: "Chloe Davis",
        avatar: "📘",
        streak: 5,
        consistency: 78,
        matchScore: 81,
      },
    ],
  },
  {
    goalName: "Complete work projects",
    users: [
      {
        id: "w1",
        name: "James Anderson",
        avatar: "💼",
        streak: 12,
        consistency: 88,
        matchScore: 94,
      },
      {
        id: "w2",
        name: "Grace Thompson",
        avatar: "🎯",
        streak: 8,
        consistency: 92,
        matchScore: 91,
      },
      {
        id: "w3",
        name: "Sam Parker",
        avatar: "⚙️",
        streak: 15,
        consistency: 85,
        matchScore: 89,
      },
      {
        id: "w4",
        name: "Ruby Clarke",
        avatar: "🚀",
        streak: 6,
        consistency: 90,
        matchScore: 87,
      },
      {
        id: "w5",
        name: "Ben Wright",
        avatar: "💻",
        streak: 10,
        consistency: 83,
        matchScore: 85,
      },
      {
        id: "w6",
        name: "Iris Hall",
        avatar: "📊",
        streak: 9,
        consistency: 86,
        matchScore: 83,
      },
      {
        id: "w7",
        name: "Max Cooper",
        avatar: "🔧",
        streak: 7,
        consistency: 81,
        matchScore: 82,
      },
      {
        id: "w8",
        name: "Luna Adams",
        avatar: "✨",
        streak: 11,
        consistency: 79,
        matchScore: 80,
      },
    ],
  },
];

const BuddyScreen = () => {
  const [currentBuddyIndex, setCurrentBuddyIndex] = useState(0);
  const [expandedCardIndex, setExpandedCardIndex] = useState<number | null>(
    null
  );
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [isProfileModalVisible, setIsProfileModalVisible] = useState(false);
  const carouselRef = useRef<FlatList>(null);

  const handleAIMessage = (message: string) => {
    // TODO: Implement AI message handling for buddy system
    Alert.alert(
      "AI Assistant",
      `You said: "${message}"\n\nAI integration for buddy system coming soon!`
    );
  };

  const handleSendNudge = (buddyName: string) => {
    Alert.alert(
      "Nudge Sent",
      `Your encouragement has been sent to ${buddyName}!`
    );
  };

  const handleSendEncouragement = (buddyName: string) => {
    Alert.alert(
      "Encouragement Sent",
      `Your motivational message has been sent to ${buddyName}!`
    );
  };

  const handleCardPress = (index: number) => {
    setExpandedCardIndex(expandedCardIndex === index ? null : index);
  };

  const handleViewUserProfile = (userId: string, userName: string) => {
    // Find the user in the discovery data
    const user = mockGoalDiscovery
      .flatMap((group) => group.users)
      .find((u) => u.id === userId);

    if (user) {
      setSelectedUser(user);
      setIsProfileModalVisible(true);
    }
  };

  const handleCloseProfileModal = () => {
    setIsProfileModalVisible(false);
    setSelectedUser(null);
  };

  const handleSendBuddyInvitation = () => {
    if (selectedUser) {
      Alert.alert(
        "Invitation Sent!",
        `Your buddy invitation has been sent to ${selectedUser.name}. They'll be notified and can accept or decline your request.`,
        [
          {
            text: "OK",
            onPress: () => {
              handleCloseProfileModal();
            },
          },
        ]
      );
    }
  };

  const onCarouselScroll = (event: any) => {
    const slideSize = screenWidth - Spacing.md * 2 + Spacing.xs * 2; // Card width + margins
    const offset = event.nativeEvent.contentOffset.x;
    const index = Math.round(offset / slideSize);
    setCurrentBuddyIndex(index);
  };

  const renderBuddyCard = ({
    item: buddy,
    index,
  }: {
    item: (typeof mockBuddies)[0];
    index: number;
  }) => {
    const isExpanded = expandedCardIndex === index;

    return (
      <TouchableOpacity
        style={[styles.buddyCard, isExpanded && styles.buddyCardExpanded]}
        onPress={() => handleCardPress(index)}
        activeOpacity={0.8}
      >
        {/* Main Card Content */}
        <View style={styles.buddyHeader}>
          <View style={styles.buddyInfo}>
            <Text style={styles.buddyAvatar}>{buddy.avatar}</Text>
            <View style={styles.buddyDetails}>
              <Text style={styles.buddyName}>{buddy.name}</Text>
              <View style={styles.streakContainer}>
                <Ionicons name="flame" size={16} color={Colors.primary.main} />
                <Text style={styles.streakText}>{buddy.streak} day streak</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Today's Progress */}
        <View style={styles.progressSection}>
          <Text style={styles.sectionTitle}>Today&apos;s Progress</Text>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                { width: `${buddy.todayProgress}%` },
              ]}
            />
          </View>
          <Text style={styles.progressText}>
            {buddy.todayProgress}% completed
          </Text>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={styles.nudgeButton}
            onPress={(e) => {
              e.stopPropagation();
              handleSendNudge(buddy.name);
            }}
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
            onPress={(e) => {
              e.stopPropagation();
              handleSendEncouragement(buddy.name);
            }}
          >
            <Ionicons
              name="heart-outline"
              size={20}
              color={Colors.primary.main}
            />
            <Text style={styles.encourageButtonText}>Encourage</Text>
          </TouchableOpacity>
        </View>

        {/* Expanded Content */}
        {isExpanded && (
          <View style={styles.expandedContent}>
            {/* Buddy Profile Section */}
            <View style={styles.expandedSection}>
              <Text style={styles.expandedSectionTitle}>👤 Profile</Text>
              <View style={styles.profileInfo}>
                <Text style={styles.profileDetail}>
                  <Text style={styles.profileLabel}>Name: </Text>
                  {buddy.name}
                </Text>
                <Text style={styles.profileDetail}>
                  <Text style={styles.profileLabel}>Streak: </Text>
                  {buddy.streak} days
                </Text>
                <Text style={styles.profileDetail}>
                  <Text style={styles.profileLabel}>Member since: </Text>
                  January 2025
                </Text>
              </View>
            </View>

            {/* Shared Goals Section */}
            <View style={styles.expandedSection}>
              <Text style={styles.expandedSectionTitle}>🎯 Shared Goals</Text>
              {buddy.sharedGoals.map((goal: string, goalIndex: number) => (
                <View key={goalIndex} style={styles.expandedGoalItem}>
                  <View style={styles.goalDot} />
                  <Text style={styles.expandedGoalText}>{goal}</Text>
                </View>
              ))}
            </View>

            {/* Recent Activity Section */}
            <View style={styles.expandedSection}>
              <Text style={styles.expandedSectionTitle}>
                📊 Recent Activity
              </Text>
              {buddy.recentActivity.map(
                (activity: any, activityIndex: number) => (
                  <View key={activityIndex} style={styles.expandedActivityItem}>
                    <View style={styles.activityIcon}>
                      <Ionicons
                        name={
                          activity.type === "gym"
                            ? "fitness-outline"
                            : activity.type === "reading"
                              ? "book-outline"
                              : activity.type === "writing"
                                ? "create-outline"
                                : activity.type === "learning"
                                  ? "school-outline"
                                  : activity.type === "mindfulness"
                                    ? "leaf-outline"
                                    : activity.type === "networking"
                                      ? "people-outline"
                                      : "briefcase-outline"
                        }
                        size={16}
                        color={Colors.text.secondary}
                      />
                    </View>
                    <View style={styles.activityContent}>
                      <Text style={styles.expandedActivityAction}>
                        {activity.action}
                      </Text>
                      <Text style={styles.expandedActivityTime}>
                        {activity.time}
                      </Text>
                    </View>
                  </View>
                )
              )}
            </View>

            {/* Weekly Stats Section */}
            <View style={styles.expandedSection}>
              <Text style={styles.expandedSectionTitle}>
                📈 This Week&apos;s Stats
              </Text>
              <View style={styles.expandedStatsGrid}>
                <View style={styles.expandedStatItem}>
                  <Text style={styles.expandedStatNumber}>
                    {buddy.weeklyStats.tasksCompleted}
                  </Text>
                  <Text style={styles.expandedStatLabel}>Tasks Done</Text>
                </View>
                <View style={styles.expandedStatItem}>
                  <Text style={styles.expandedStatNumber}>
                    {buddy.weeklyStats.goalsAchieved}
                  </Text>
                  <Text style={styles.expandedStatLabel}>Goals Hit</Text>
                </View>
                <View style={styles.expandedStatItem}>
                  <Text style={styles.expandedStatNumber}>
                    {buddy.weeklyStats.consistency}%
                  </Text>
                  <Text style={styles.expandedStatLabel}>Consistency</Text>
                </View>
              </View>
            </View>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Header with padding */}
        <View style={styles.header}>
          <Text style={styles.title}>Goal Buddy</Text>
          <Text style={styles.subtitle}>Your accountability partners</Text>
        </View>

        {/* Buddy Carousel - Full width */}
        <View style={styles.carouselContainer}>
          <FlatList
            ref={carouselRef}
            data={mockBuddies}
            renderItem={({ item, index }) => renderBuddyCard({ item, index })}
            keyExtractor={(item) => item.id}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={onCarouselScroll}
            scrollEventThrottle={16}
            snapToInterval={screenWidth - Spacing.md * 2}
            decelerationRate="fast"
            contentContainerStyle={styles.carouselContent}
          />

          {/* Pagination Dots */}
          <View style={styles.paginationContainer}>
            {mockBuddies.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.paginationDot,
                  index === currentBuddyIndex && styles.paginationDotActive,
                ]}
              />
            ))}
          </View>
        </View>

        {/* Content with padding */}
        <View style={styles.content}>
          {/* Goal-based User Discovery */}
          <View style={styles.discoverySection}>
            <Text style={styles.discoverySectionTitle}>
              🌟 Discover New Buddies
            </Text>
            <Text style={styles.discoverySectionSubtitle}>
              Find people with similar goals and start your journey together
            </Text>

            {mockGoalDiscovery.map((goalGroup, groupIndex) => (
              <View key={groupIndex} style={styles.goalGroup}>
                <Text style={styles.goalGroupTitle}>{goalGroup.goalName}</Text>
                <Text style={styles.goalGroupSubtitle}>
                  {goalGroup.users.length} potential buddies found
                </Text>

                <View style={styles.userList}>
                  {goalGroup.users.map((user, userIndex) => (
                    <TouchableOpacity
                      key={user.id}
                      style={styles.userCard}
                      onPress={() => handleViewUserProfile(user.id, user.name)}
                    >
                      <View style={styles.userRank}>
                        <Text style={styles.userRankNumber}>
                          {userIndex + 1}
                        </Text>
                      </View>

                      <View style={styles.userInfo}>
                        <Text style={styles.userAvatar}>{user.avatar}</Text>
                        <View style={styles.userDetails}>
                          <Text style={styles.userName}>{user.name}</Text>
                          <View style={styles.userStats}>
                            <View style={styles.userStatItem}>
                              <Ionicons
                                name="flame"
                                size={12}
                                color={Colors.primary.main}
                              />
                              <Text style={styles.userStatText}>
                                {user.streak}d
                              </Text>
                            </View>
                            <View style={styles.userStatItem}>
                              <Ionicons
                                name="trending-up"
                                size={12}
                                color={Colors.success.main}
                              />
                              <Text style={styles.userStatText}>
                                {user.consistency}%
                              </Text>
                            </View>
                          </View>
                        </View>
                      </View>

                      <View style={styles.userActions}>
                        <View style={styles.matchScore}>
                          <Text style={styles.matchScoreText}>
                            {user.matchScore}%
                          </Text>
                          <Text style={styles.matchScoreLabel}>match</Text>
                        </View>
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Profile Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={isProfileModalVisible}
        onRequestClose={handleCloseProfileModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {selectedUser && (
              <>
                {/* Modal Header */}
                <View style={styles.modalHeader}>
                  <View style={styles.modalHeaderLeft}>
                    <View style={styles.modalAvatar}>
                      <Text style={styles.modalAvatarText}>
                        {selectedUser.name.charAt(0).toUpperCase()}
                      </Text>
                    </View>
                    <View>
                      <Text style={styles.modalUserName}>
                        {selectedUser.name}
                      </Text>
                      <Text style={styles.modalUserMatch}>
                        {selectedUser.matchScore}% match
                      </Text>
                    </View>
                  </View>
                  <TouchableOpacity
                    style={styles.modalCloseButton}
                    onPress={handleCloseProfileModal}
                  >
                    <Text style={styles.modalCloseText}>✕</Text>
                  </TouchableOpacity>
                </View>

                {/* User Stats */}
                <View style={styles.modalStatsContainer}>
                  <View style={styles.modalStatItem}>
                    <Text style={styles.modalStatNumber}>
                      {selectedUser.rank}
                    </Text>
                    <Text style={styles.modalStatLabel}>Rank</Text>
                  </View>
                  <View style={styles.modalStatDivider} />
                  <View style={styles.modalStatItem}>
                    <Text style={styles.modalStatNumber}>
                      {selectedUser.completedTasks}
                    </Text>
                    <Text style={styles.modalStatLabel}>Tasks Done</Text>
                  </View>
                  <View style={styles.modalStatDivider} />
                  <View style={styles.modalStatItem}>
                    <Text style={styles.modalStatNumber}>
                      {selectedUser.streak}
                    </Text>
                    <Text style={styles.modalStatLabel}>Day Streak</Text>
                  </View>
                </View>

                {/* Shared Goals Section */}
                <View style={styles.modalSection}>
                  <Text style={styles.modalSectionTitle}>Shared Goals</Text>
                  <View style={styles.modalSharedGoals}>
                    {mockGoalDiscovery
                      .filter((group) =>
                        group.users.some((u) => u.id === selectedUser.id)
                      )
                      .map((group, index) => (
                        <View key={index} style={styles.modalGoalChip}>
                          <Text style={styles.modalGoalChipText}>
                            {group.goalName}
                          </Text>
                        </View>
                      ))}
                  </View>
                </View>

                {/* Action Buttons */}
                <View style={styles.modalActions}>
                  <TouchableOpacity
                    style={styles.modalViewProfileButton}
                    onPress={() =>
                      Alert.alert(
                        "Coming Soon",
                        "Full profile view coming soon!"
                      )
                    }
                  >
                    <Text style={styles.modalViewProfileText}>
                      View Full Profile
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.modalInviteButton}
                    onPress={handleSendBuddyInvitation}
                  >
                    <Text style={styles.modalInviteText}>
                      Send Buddy Invitation
                    </Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>

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
    paddingHorizontal: Spacing.lg, // Add horizontal padding to header
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
    width: screenWidth - Spacing.md * 2, // Use almost full width
    marginHorizontal: Spacing.xs, // Minimal margin between cards
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

  // Carousel Styles
  carouselContainer: {
    marginBottom: Spacing.lg,
  },
  carouselContent: {
    paddingHorizontal: Spacing.xs, // Minimal padding for edge spacing
  },
  paginationContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: Spacing.md,
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.neutral[300],
    marginHorizontal: Spacing.xs / 2,
  },
  paginationDotActive: {
    backgroundColor: Colors.primary.main,
    width: 20,
  },

  // Expanded Card Styles
  buddyCardExpanded: {
    minHeight: "auto",
  },
  expandedContent: {
    marginTop: Spacing.lg,
    paddingTop: Spacing.lg,
    borderTopWidth: 1,
    borderTopColor: Colors.neutral[200],
  },
  expandedSection: {
    marginBottom: Spacing.lg,
  },
  expandedSectionTitle: {
    ...Typography.h4,
    color: Colors.text.primary,
    fontWeight: "600",
    marginBottom: Spacing.md,
  },

  // Profile Section
  profileInfo: {
    gap: Spacing.sm,
  },
  profileDetail: {
    ...Typography.bodyMedium,
    color: Colors.text.primary,
  },
  profileLabel: {
    fontWeight: "600",
    color: Colors.text.secondary,
  },

  // Expanded Goals
  expandedGoalItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.sm,
  },
  expandedGoalText: {
    ...Typography.bodyMedium,
    color: Colors.text.primary,
    flex: 1,
  },

  // Expanded Activity
  expandedActivityItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: Spacing.md,
  },
  expandedActivityAction: {
    ...Typography.bodyMedium,
    color: Colors.text.primary,
    marginBottom: Spacing.xs / 2,
  },
  expandedActivityTime: {
    ...Typography.captionMedium,
    color: Colors.text.secondary,
  },

  // Expanded Stats
  expandedStatsGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  expandedStatItem: {
    alignItems: "center",
    flex: 1,
  },
  expandedStatNumber: {
    ...Typography.h3,
    color: Colors.primary.main,
    fontWeight: "700",
    marginBottom: Spacing.xs / 2,
  },
  expandedStatLabel: {
    ...Typography.captionMedium,
    color: Colors.text.secondary,
    textAlign: "center",
  },

  // User Discovery Styles
  discoverySection: {
    marginBottom: Spacing.xl,
  },
  discoverySectionTitle: {
    ...Typography.h2,
    color: Colors.text.primary,
    fontWeight: "700",
    marginBottom: Spacing.xs,
  },
  discoverySectionSubtitle: {
    ...Typography.bodyMedium,
    color: Colors.text.secondary,
    marginBottom: Spacing.xl,
  },
  goalGroup: {
    marginBottom: Spacing.xl,
  },
  goalGroupTitle: {
    ...Typography.h3,
    color: Colors.text.primary,
    fontWeight: "600",
    marginBottom: Spacing.xs,
  },
  goalGroupSubtitle: {
    ...Typography.captionMedium,
    color: Colors.text.secondary,
    marginBottom: Spacing.lg,
  },
  userList: {
    gap: Spacing.sm,
  },
  userCard: {
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    flexDirection: "row",
    alignItems: "center",
  },
  userRank: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.primary.light,
    alignItems: "center",
    justifyContent: "center",
    marginRight: Spacing.md,
  },
  userRankNumber: {
    ...Typography.bodyMedium,
    color: Colors.primary.main,
    fontWeight: "700",
  },
  userInfo: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  userAvatar: {
    fontSize: 24,
    marginRight: Spacing.sm,
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    ...Typography.bodyLarge,
    color: Colors.text.primary,
    fontWeight: "600",
    marginBottom: Spacing.xs / 2,
  },
  userStats: {
    flexDirection: "row",
    gap: Spacing.sm,
  },
  userStatItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs / 2,
  },
  userStatText: {
    ...Typography.captionMedium,
    color: Colors.text.secondary,
    fontWeight: "500",
  },
  userActions: {
    alignItems: "center",
  },
  matchScore: {
    alignItems: "center",
  },
  matchScoreText: {
    ...Typography.bodySmall,
    color: Colors.success.main,
    fontWeight: "700",
  },
  matchScoreLabel: {
    ...Typography.captionSmall,
    color: Colors.text.secondary,
  },

  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: Colors.background.primary,
    borderTopLeftRadius: BorderRadius.lg,
    borderTopRightRadius: BorderRadius.lg,
    padding: Spacing.lg,
    maxHeight: "80%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.lg,
  },
  modalHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  modalAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.primary.main,
    justifyContent: "center",
    alignItems: "center",
    marginRight: Spacing.md,
  },
  modalAvatarText: {
    ...Typography.h4,
    color: Colors.background.primary,
    fontWeight: "700",
  },
  modalUserName: {
    ...Typography.h4,
    color: Colors.text.primary,
    fontWeight: "600",
  },
  modalUserMatch: {
    ...Typography.bodySmall,
    color: Colors.success.main,
    fontWeight: "500",
  },
  modalCloseButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.neutral[200],
    justifyContent: "center",
    alignItems: "center",
  },
  modalCloseText: {
    ...Typography.bodyMedium,
    color: Colors.text.secondary,
    fontWeight: "600",
  },
  modalStatsContainer: {
    flexDirection: "row",
    backgroundColor: Colors.neutral[100],
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.lg,
  },
  modalStatItem: {
    flex: 1,
    alignItems: "center",
  },
  modalStatNumber: {
    ...Typography.h4,
    color: Colors.text.primary,
    fontWeight: "700",
  },
  modalStatLabel: {
    ...Typography.captionSmall,
    color: Colors.text.secondary,
    marginTop: 2,
  },
  modalStatDivider: {
    width: 1,
    backgroundColor: Colors.border.light,
    marginHorizontal: Spacing.md,
  },
  modalSection: {
    marginBottom: Spacing.lg,
  },
  modalSectionTitle: {
    ...Typography.bodyMedium,
    color: Colors.text.primary,
    fontWeight: "600",
    marginBottom: Spacing.sm,
  },
  modalSharedGoals: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
  },
  modalGoalChip: {
    backgroundColor: Colors.primary.light,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.sm,
  },
  modalGoalChipText: {
    ...Typography.captionMedium,
    color: Colors.primary.main,
    fontWeight: "500",
  },
  modalActions: {
    gap: Spacing.md,
  },
  modalViewProfileButton: {
    backgroundColor: Colors.neutral[200],
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    alignItems: "center",
  },
  modalViewProfileText: {
    ...Typography.bodyMedium,
    color: Colors.text.primary,
    fontWeight: "500",
  },
  modalInviteButton: {
    backgroundColor: Colors.primary.main,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    alignItems: "center",
  },
  modalInviteText: {
    ...Typography.bodyMedium,
    color: Colors.background.primary,
    fontWeight: "600",
  },
});

export default BuddyScreen;
