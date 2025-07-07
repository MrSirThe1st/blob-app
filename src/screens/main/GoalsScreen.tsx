import { BorderRadius, Colors, Spacing, Typography } from "@/constants";
import { SafeAreaView, ScrollView, StyleSheet, Text, View } from "react-native";

const GoalsScreen = () => {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.title}>Your Goals</Text>
            <Text style={styles.subtitle}>
              Track your progress and achievements
            </Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>🎯 Goal Setting Coming Soon</Text>
            <Text style={styles.placeholder}>
              Your goal management system will include:
              {"\n\n"}• AI-assisted goal creation
              {"\n"}• Automatic task breakdown
              {"\n"}• Progress visualization
              {"\n"}• Achievement celebrations
              {"\n"}• Goal buddy sharing
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
  title: {
    ...Typography.h1,
    color: Colors.text.primary,
    marginBottom: Spacing.xs,
  },
  subtitle: {
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
});

export default GoalsScreen;
