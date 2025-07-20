// src/screens/main/SettingsScreen.tsx
import FloatingAIAssistant from "@/components/ai/FloatingAIAssistant";
import { BorderRadius, Colors, Spacing, Typography } from "@/constants";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import {
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const SettingsScreen = () => {
  // Planning timeframe state (in days)
  const [planningTimeframe, setPlanningTimeframe] = useState(7); // Default 1 week

  // Calendar sync state
  const [calendarConnected, setCalendarConnected] = useState(false);
  const [calendarType, setCalendarType] = useState<string | null>(null);

  // AI assistant preferences
  const [aiAssistantEnabled, setAiAssistantEnabled] = useState(true);
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [smartNotifications, setSmartNotifications] = useState(true);

  const timeframeOptions = [
    { label: "2 Days", value: 2, description: "Immediate focus" },
    { label: "3 Days", value: 3, description: "Short-term planning" },
    { label: "1 Week", value: 7, description: "Balanced approach" },
    { label: "2 Weeks", value: 14, description: "Comprehensive planning" },
  ];

  const handleTimeframeChange = (value: number) => {
    setPlanningTimeframe(value);
    // TODO: Update user preferences in backend
  };

  const handleCalendarSync = () => {
    if (calendarConnected) {
      Alert.alert(
        "Disconnect Calendar",
        "Are you sure you want to disconnect your calendar?",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Disconnect",
            style: "destructive",
            onPress: () => {
              setCalendarConnected(false);
              setCalendarType(null);
              // TODO: Disconnect calendar integration
            },
          },
        ]
      );
    } else {
      Alert.alert("Connect Calendar", "Choose your calendar provider:", [
        { text: "Cancel", style: "cancel" },
        {
          text: "Google Calendar",
          onPress: () => {
            setCalendarConnected(true);
            setCalendarType("Google");
            // TODO: Implement Google Calendar integration
          },
        },
        {
          text: "Outlook",
          onPress: () => {
            setCalendarConnected(true);
            setCalendarType("Outlook");
            // TODO: Implement Outlook integration
          },
        },
        {
          text: "Apple Calendar",
          onPress: () => {
            setCalendarConnected(true);
            setCalendarType("Apple");
            // TODO: Implement Apple Calendar integration
          },
        },
      ]);
    }
  };

  const handleSignOut = () => {
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign Out",
        style: "destructive",
        onPress: () => {
          // TODO: Implement sign out functionality
        },
      },
    ]);
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      "Delete Account",
      "This action cannot be undone. All your data will be permanently deleted.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            Alert.alert(
              "Confirm Deletion",
              "Type 'DELETE' to confirm account deletion",
              [
                { text: "Cancel", style: "cancel" },
                {
                  text: "Delete Forever",
                  style: "destructive",
                  onPress: () => {
                    // TODO: Implement account deletion
                  },
                },
              ]
            );
          },
        },
      ]
    );
  };

  const handleAIMessage = (message: string) => {
    // TODO: Implement AI message handling for settings
    Alert.alert(
      "AI Assistant",
      `You said: "${message}"\n\nAI integration for settings coming soon!`
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
            <Text style={styles.title}>Settings</Text>
            <Text style={styles.subtitle}>Customize your Blob experience</Text>
          </View>

          {/* Planning Timeframe Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Planning Timeframe</Text>
            <Text style={styles.sectionDescription}>
              Choose how far ahead Blob should plan your tasks and goals
            </Text>

            <View style={styles.optionsContainer}>
              {timeframeOptions.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.optionItem,
                    planningTimeframe === option.value &&
                      styles.optionItemSelected,
                  ]}
                  onPress={() => handleTimeframeChange(option.value)}
                >
                  <View style={styles.optionContent}>
                    <Text
                      style={[
                        styles.optionLabel,
                        planningTimeframe === option.value &&
                          styles.optionLabelSelected,
                      ]}
                    >
                      {option.label}
                    </Text>
                    <Text
                      style={[
                        styles.optionDescription,
                        planningTimeframe === option.value &&
                          styles.optionDescriptionSelected,
                      ]}
                    >
                      {option.description}
                    </Text>
                  </View>
                  {planningTimeframe === option.value && (
                    <Ionicons
                      name="checkmark-circle"
                      size={20}
                      color={Colors.primary.main}
                    />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Calendar Sync Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Calendar Integration</Text>
            <Text style={styles.sectionDescription}>
              Sync with your existing calendar for better planning
            </Text>

            <TouchableOpacity
              style={styles.settingItem}
              onPress={handleCalendarSync}
            >
              <View style={styles.settingContent}>
                <View style={styles.settingIcon}>
                  <Ionicons
                    name={calendarConnected ? "calendar" : "calendar-outline"}
                    size={20}
                    color={
                      calendarConnected
                        ? Colors.success.main
                        : Colors.text.secondary
                    }
                  />
                </View>
                <View style={styles.settingText}>
                  <Text style={styles.settingLabel}>
                    {calendarConnected
                      ? `${calendarType} Calendar`
                      : "Connect Calendar"}
                  </Text>
                  <Text style={styles.settingDescription}>
                    {calendarConnected
                      ? "Calendar sync is active"
                      : "Connect to sync your existing events"}
                  </Text>
                </View>
              </View>
              <Ionicons
                name="chevron-forward"
                size={16}
                color={Colors.text.muted}
              />
            </TouchableOpacity>
          </View>

          {/* AI Assistant Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>AI Assistant</Text>
            <Text style={styles.sectionDescription}>
              Configure how the AI assistant helps you
            </Text>

            <View style={styles.settingItem}>
              <View style={styles.settingContent}>
                <View style={styles.settingIcon}>
                  <Ionicons
                    name="chatbubble-ellipses"
                    size={20}
                    color={
                      aiAssistantEnabled
                        ? Colors.primary.main
                        : Colors.text.secondary
                    }
                  />
                </View>
                <View style={styles.settingText}>
                  <Text style={styles.settingLabel}>Enable AI Assistant</Text>
                  <Text style={styles.settingDescription}>
                    Get intelligent suggestions and help
                  </Text>
                </View>
              </View>
              <Switch
                value={aiAssistantEnabled}
                onValueChange={setAiAssistantEnabled}
                trackColor={{
                  false: Colors.background.tertiary,
                  true: Colors.primary.light,
                }}
                thumbColor={
                  aiAssistantEnabled ? Colors.primary.main : Colors.text.muted
                }
              />
            </View>

            <View style={styles.settingItem}>
              <View style={styles.settingContent}>
                <View style={styles.settingIcon}>
                  <Ionicons
                    name="mic"
                    size={20}
                    color={
                      voiceEnabled ? Colors.primary.main : Colors.text.secondary
                    }
                  />
                </View>
                <View style={styles.settingText}>
                  <Text style={styles.settingLabel}>Voice Commands</Text>
                  <Text style={styles.settingDescription}>
                    Use voice to interact with the AI
                  </Text>
                </View>
              </View>
              <Switch
                value={voiceEnabled}
                onValueChange={setVoiceEnabled}
                disabled={!aiAssistantEnabled}
                trackColor={{
                  false: Colors.background.tertiary,
                  true: Colors.primary.light,
                }}
                thumbColor={
                  voiceEnabled ? Colors.primary.main : Colors.text.muted
                }
              />
            </View>

            <View style={styles.settingItem}>
              <View style={styles.settingContent}>
                <View style={styles.settingIcon}>
                  <Ionicons
                    name="notifications"
                    size={20}
                    color={
                      smartNotifications
                        ? Colors.primary.main
                        : Colors.text.secondary
                    }
                  />
                </View>
                <View style={styles.settingText}>
                  <Text style={styles.settingLabel}>Smart Notifications</Text>
                  <Text style={styles.settingDescription}>
                    AI-powered notification timing
                  </Text>
                </View>
              </View>
              <Switch
                value={smartNotifications}
                onValueChange={setSmartNotifications}
                disabled={!aiAssistantEnabled}
                trackColor={{
                  false: Colors.background.tertiary,
                  true: Colors.primary.light,
                }}
                thumbColor={
                  smartNotifications ? Colors.primary.main : Colors.text.muted
                }
              />
            </View>
          </View>

          {/* Account Management Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Account</Text>
            <Text style={styles.sectionDescription}>
              Manage your account and data
            </Text>

            <TouchableOpacity
              style={styles.settingItem}
              onPress={handleSignOut}
            >
              <View style={styles.settingContent}>
                <View style={styles.settingIcon}>
                  <Ionicons
                    name="log-out-outline"
                    size={20}
                    color={Colors.text.secondary}
                  />
                </View>
                <View style={styles.settingText}>
                  <Text style={styles.settingLabel}>Sign Out</Text>
                  <Text style={styles.settingDescription}>
                    Sign out of your account
                  </Text>
                </View>
              </View>
              <Ionicons
                name="chevron-forward"
                size={16}
                color={Colors.text.muted}
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.settingItem}
              onPress={handleDeleteAccount}
            >
              <View style={styles.settingContent}>
                <View style={styles.settingIcon}>
                  <Ionicons
                    name="trash-outline"
                    size={20}
                    color={Colors.error.main}
                  />
                </View>
                <View style={styles.settingText}>
                  <Text
                    style={[styles.settingLabel, { color: Colors.error.main }]}
                  >
                    Delete Account
                  </Text>
                  <Text style={styles.settingDescription}>
                    Permanently delete your account and data
                  </Text>
                </View>
              </View>
              <Ionicons
                name="chevron-forward"
                size={16}
                color={Colors.text.muted}
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
    paddingBottom: Spacing["2xl"],
  },
  header: {
    marginBottom: Spacing.xl,
  },
  title: {
    ...Typography.h1,
    color: Colors.text.primary,
    marginBottom: Spacing.xs,
    fontWeight: "700",
  },
  subtitle: {
    ...Typography.bodyMedium,
    color: Colors.text.secondary,
    lineHeight: 20,
  },
  section: {
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    ...Typography.h3,
    color: Colors.text.primary,
    marginBottom: Spacing.xs,
    fontWeight: "600",
  },
  sectionDescription: {
    ...Typography.bodySmall,
    color: Colors.text.secondary,
    marginBottom: Spacing.lg,
    lineHeight: 18,
  },
  optionsContainer: {
    gap: Spacing.sm,
  },
  optionItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: Spacing.md,
    backgroundColor: Colors.background.card,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border.light,
  },
  optionItemSelected: {
    backgroundColor: Colors.background.accent,
    borderColor: Colors.primary.main,
  },
  optionContent: {
    flex: 1,
  },
  optionLabel: {
    ...Typography.bodyMedium,
    color: Colors.text.primary,
    fontWeight: "600",
    marginBottom: Spacing.xs,
  },
  optionLabelSelected: {
    color: Colors.primary.main,
  },
  optionDescription: {
    ...Typography.captionMedium,
    color: Colors.text.secondary,
  },
  optionDescriptionSelected: {
    color: Colors.primary.dark,
  },
  settingItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: Spacing.md,
    backgroundColor: Colors.background.card,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.sm,
  },
  settingContent: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  settingIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.background.secondary,
    alignItems: "center",
    justifyContent: "center",
    marginRight: Spacing.md,
  },
  settingText: {
    flex: 1,
  },
  settingLabel: {
    ...Typography.bodyMedium,
    color: Colors.text.primary,
    fontWeight: "600",
    marginBottom: Spacing.xs,
  },
  settingDescription: {
    ...Typography.captionMedium,
    color: Colors.text.secondary,
  },
});

export default SettingsScreen;
