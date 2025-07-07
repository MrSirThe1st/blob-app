import { BorderRadius, Colors, Spacing, Typography } from "@/constants";
import { SafeAreaView, ScrollView, StyleSheet, Text, View } from "react-native";

const InsightsScreen = () => {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.title}>Insights</Text>
            <Text style={styles.subtitle}>
              Understand your productivity patterns
            </Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>📊 Analytics Coming Soon</Text>
            <Text style={styles.placeholder}>
              Your personal insights dashboard will show:
              {"\n\n"}• Productivity patterns
              {"\n"}• Energy level trends
              {"\n"}• Goal completion rates
              {"\n"}• Weekly/monthly summaries
              {"\n"}• AI recommendations
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

export default InsightsScreen;
