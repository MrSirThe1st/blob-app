import FloatingAIAssistant from "@/components/ai/FloatingAIAssistant";
import { BorderRadius, Colors, Spacing, Typography } from "@/constants";
import {
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

const BuddyScreen = () => {
  const handleAIMessage = (message: string) => {
    // TODO: Implement AI message handling for buddy system
    Alert.alert(
      "AI Assistant",
      `You said: "${message}"\n\nAI integration for buddy system coming soon!`
    );
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

          <View style={styles.card}>
            <Text style={styles.cardTitle}>🤝 Buddy System Coming Soon</Text>
            <Text style={styles.placeholder}>
              The accountability buddy feature will include:
              {"\n\n"}• Smart buddy matching
              {"\n"}• Daily check-ins
              {"\n"}• Progress sharing
              {"\n"}• Mutual encouragement
              {"\n"}• Challenge creation
            </Text>
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

export default BuddyScreen;
