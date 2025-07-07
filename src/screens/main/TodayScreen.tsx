import { BorderRadius, Colors, Spacing, Typography } from "@/constants";
import { SafeAreaView, ScrollView, StyleSheet, Text, View } from "react-native";

const TodayScreen = () => {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.title}>Today's Schedule</Text>
            <Text style={styles.date}>{new Date().toLocaleDateString()}</Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>🚧 Coming Soon</Text>
            <Text style={styles.placeholder}>
              Your AI-generated daily schedule will appear here. Features will
              include:
              {"\n\n"}• Smart task prioritization
              {"\n"}• Calendar integration
              {"\n"}• Real-time schedule adjustments
              {"\n"}• Task completion tracking
              {"\n"}• AI recommendations
            </Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Sample Task List</Text>
            <View style={styles.taskList}>
              <View style={styles.task}>
                <Text style={styles.taskTime}>9:00 AM</Text>
                <Text style={styles.taskTitle}>Morning Planning</Text>
              </View>
              <View style={styles.task}>
                <Text style={styles.taskTime}>10:00 AM</Text>
                <Text style={styles.taskTitle}>Focus Work Block</Text>
              </View>
              <View style={styles.task}>
                <Text style={styles.taskTime}>12:00 PM</Text>
                <Text style={styles.taskTitle}>Lunch Break</Text>
              </View>
            </View>
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
  title: {
    ...Typography.h1,
    color: Colors.text.primary,
    marginBottom: Spacing.xs,
  },
  date: {
    ...Typography.bodyMedium,
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
  placeholder: {
    ...Typography.bodyMedium,
    color: Colors.text.secondary,
    lineHeight: 22,
  },
  taskList: {
    gap: Spacing.md,
  },
  task: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.background.secondary,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
  },
  taskTime: {
    ...Typography.captionMedium,
    color: Colors.primary.main,
    width: 80,
    fontWeight: "600",
  },
  taskTitle: {
    ...Typography.bodyMedium,
    color: Colors.text.primary,
    flex: 1,
  },
});

export default TodayScreen;
