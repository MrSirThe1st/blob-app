import { BorderRadius, Colors, Spacing, Typography } from "@/constants";
import { useAuth } from "@/hooks/useAuth";
import { SafeAreaView, ScrollView, StyleSheet, Text, View } from "react-native";

const HomeScreen = () => {
  const { userProfile } = useAuth();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.greeting}>
              Good morning, {userProfile?.fullName || "there"}! 👋
            </Text>
            <Text style={styles.motivation}>
              Ready to make today productive?
            </Text>
          </View>

          {/* Progress Overview */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Today's Progress</Text>
            <View style={styles.statsRow}>
              <View style={styles.stat}>
                <Text style={styles.statNumber}>0</Text>
                <Text style={styles.statLabel}>Tasks Complete</Text>
              </View>
              <View style={styles.stat}>
                <Text style={styles.statNumber}>
                  {userProfile?.xpTotal || 0}
                </Text>
                <Text style={styles.statLabel}>Total XP</Text>
              </View>
              <View style={styles.stat}>
                <Text style={styles.statNumber}>
                  {userProfile?.currentLevel || 1}
                </Text>
                <Text style={styles.statLabel}>Level</Text>
              </View>
            </View>
          </View>

          {/* Quick Actions */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Quick Start</Text>
            <Text style={styles.placeholder}>
              • Switch to "Today" tab to see your tasks{"\n"}• Go to "Goals" to
              set your objectives{"\n"}• Visit "Buddy" to find an accountability
              partner{"\n"}• Check "Insights" for your progress
            </Text>
          </View>

          {/* MVP Note */}
          <View style={[styles.card, styles.noteCard]}>
            <Text style={styles.noteTitle}>🚧 MVP Phase</Text>
            <Text style={styles.noteText}>
              This is the basic home screen for MVP. Future versions will
              include:
              {"\n"}• AI-powered daily insights
              {"\n"}• Dynamic motivation based on your progress
              {"\n"}• Weather and energy integration
              {"\n"}• Personalized productivity tips
            </Text>
          </View>
        </View>
      </ScrollView>
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
});

export default HomeScreen;
