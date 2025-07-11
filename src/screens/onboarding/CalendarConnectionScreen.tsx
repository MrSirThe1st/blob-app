import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { Colors, Typography, Spacing, BorderRadius } from "@/constants";
import OnboardingPageLayout from "@/components/onboarding/OnboardingPageLayout";
import { OnboardingStackParamList } from "@/components/navigation/OnboardingNavigator";

type NavigationProp = NativeStackNavigationProp<
  OnboardingStackParamList,
  "CalendarConnection"
>;

interface CalendarProvider {
  id: string;
  name: string;
  displayName: string;
  icon: string;
  color: string;
  description: string;
  isPopular?: boolean;
}

const calendarProviders: CalendarProvider[] = [
  {
    id: "google",
    name: "Google Calendar",
    displayName: "Google Calendar",
    icon: "🔴",
    color: "#4285F4",
    description: "Most popular choice • Easy sync",
    isPopular: true,
  },
  {
    id: "microsoft",
    name: "Microsoft Calendar",
    displayName: "Microsoft Calendar",
    icon: "🔷",
    color: "#0078D4",
    description: "Outlook • Office 365 • Teams",
  },
  {
    id: "apple",
    name: "Apple Calendar",
    displayName: "Apple Calendar",
    icon: "🍎",
    color: "#007AFF",
    description: "iCloud • Native iOS integration",
  },
];

type ConnectionStatus = "idle" | "connecting" | "connected" | "error";

const CalendarConnectionScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const [selectedProvider, setSelectedProvider] = useState<string | null>(null);
  const [connectionStatus, setConnectionStatus] =
    useState<ConnectionStatus>("idle");
  const [showSkipConfirmation, setShowSkipConfirmation] = useState(false);

  const handleConnect = async (providerId: string) => {
    setSelectedProvider(providerId);
    setConnectionStatus("connecting");

    try {
      await simulateConnection(providerId);
      setConnectionStatus("connected");

      setTimeout(() => {
        navigation.navigate("OpenConversation");
      }, 1500);
    } catch (error) {
      setConnectionStatus("error");
      Alert.alert(
        "Connection Failed",
        "Unable to connect to your calendar. Please try again.",
        [
          { text: "Try Again", onPress: () => setConnectionStatus("idle") },
          {
            text: "Skip for Now",
            onPress: () => navigation.navigate("OpenConversation"),
          },
        ]
      );
    }
  };

  const handleContinue = (additionalInput?: string) => {
    if (additionalInput) {
      console.log("Additional calendar input:", additionalInput);
    }

    if (connectionStatus === "connected" || showSkipConfirmation) {
      navigation.navigate("OpenConversation");
    } else if (selectedProvider) {
      handleConnect(selectedProvider);
    } else {
      setShowSkipConfirmation(true);
    }
  };

  const simulateConnection = (providerId: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (Math.random() > 0.1) {
          resolve();
        } else {
          reject(new Error("Connection failed"));
        }
      }, 2000);
    });
  };

  const canContinue = connectionStatus === "connected" || showSkipConfirmation;

  return (
    <OnboardingPageLayout
      title="Connect Your Calendar"
      subtitle="Blob needs to know when you're busy to create realistic schedules around your existing commitments."
      onBack={handleBack}
      onContinue={handleContinue}
      canContinue={canContinue}
      inputPlaceholder="calendar/ anything more that you'd like to share"
    >
      <View style={styles.container}>
        {!showSkipConfirmation ? (
          <>
            <View style={styles.providersContainer}>
              {calendarProviders.map((provider) => (
                <CalendarProviderCard
                  key={provider.id}
                  provider={provider}
                  isSelected={selectedProvider === provider.id}
                  connectionStatus={connectionStatus}
                  onConnect={() => handleConnect(provider.id)}
                />
              ))}
            </View>

            <View style={styles.benefitsSection}>
              <View style={styles.benefitsCard}>
                <Text style={styles.benefitsTitle}>
                  Why connect your calendar?
                </Text>
                <View style={styles.benefitsList}>
                  <BenefitItem
                    icon="🎯"
                    text="Avoid scheduling conflicts automatically"
                  />
                  <BenefitItem
                    icon="⚡"
                    text="Smart scheduling around your meetings"
                  />
                  <BenefitItem
                    icon="🧠"
                    text="Blob learns your schedule patterns"
                  />
                </View>
              </View>
            </View>

            <View style={styles.skipSection}>
              <TouchableOpacity
                style={styles.skipButton}
                onPress={() => setShowSkipConfirmation(true)}
                disabled={connectionStatus === "connecting"}
              >
                <Text style={styles.skipText}>Skip for now</Text>
                <Text style={styles.skipSubtext}>
                  You can connect later in settings
                </Text>
              </TouchableOpacity>
            </View>
          </>
        ) : (
          <SkipConfirmation
            onConfirm={() => navigation.navigate("OpenConversation")}
            onCancel={() => setShowSkipConfirmation(false)}
          />
        )}
      </View>
    </OnboardingPageLayout>
  );
};

interface CalendarProviderCardProps {
  provider: CalendarProvider;
  isSelected: boolean;
  connectionStatus: ConnectionStatus;
  onConnect: () => void;
}

const CalendarProviderCard: React.FC<CalendarProviderCardProps> = ({
  provider,
  isSelected,
  connectionStatus,
  onConnect,
}) => {
  const isConnecting = isSelected && connectionStatus === "connecting";
  const isConnected = isSelected && connectionStatus === "connected";

  return (
    <View style={styles.providerCardContainer}>
      <TouchableOpacity
        style={[
          styles.providerCard,
          isSelected && styles.selectedProviderCard,
          isConnected && styles.connectedProviderCard,
        ]}
        onPress={onConnect}
        disabled={connectionStatus === "connecting"}
        activeOpacity={0.8}
      >
        {provider.isPopular && (
          <View style={styles.popularBadge}>
            <Text style={styles.popularText}>Most Popular</Text>
          </View>
        )}

        <View style={styles.providerInfo}>
          <View style={styles.providerIconContainer}>
            <Text style={styles.providerIcon}>{provider.icon}</Text>
          </View>

          <View style={styles.providerDetails}>
            <Text style={styles.providerName}>{provider.displayName}</Text>
            <Text style={styles.providerDescription}>
              {provider.description}
            </Text>
          </View>
        </View>

        <View style={styles.statusContainer}>
          {isConnecting && (
            <View style={styles.loadingIndicator}>
              <Ionicons name="sync" size={20} color={Colors.primary.main} />
              <Text style={styles.connectingText}>Connecting...</Text>
            </View>
          )}

          {isConnected && (
            <View style={styles.connectedIndicator}>
              <Ionicons
                name="checkmark-circle"
                size={24}
                color={Colors.success.main}
              />
              <Text style={styles.connectedText}>Connected!</Text>
            </View>
          )}

          {!isSelected && (
            <View style={styles.connectButton}>
              <Text style={styles.connectButtonText}>Connect</Text>
              <Ionicons
                name="arrow-forward"
                size={16}
                color={Colors.text.onPrimary}
              />
            </View>
          )}
        </View>
      </TouchableOpacity>
    </View>
  );
};

interface BenefitItemProps {
  icon: string;
  text: string;
}

const BenefitItem: React.FC<BenefitItemProps> = ({ icon, text }) => (
  <View style={styles.benefitItem}>
    <Text style={styles.benefitIcon}>{icon}</Text>
    <Text style={styles.benefitText}>{text}</Text>
  </View>
);

interface SkipConfirmationProps {
  onConfirm: () => void;
  onCancel: () => void;
}

const SkipConfirmation: React.FC<SkipConfirmationProps> = ({
  onConfirm,
  onCancel,
}) => (
  <View style={styles.skipConfirmationContainer}>
    <View style={styles.skipConfirmationCard}>
      <Text style={styles.skipConfirmationTitle}>
        Skip calendar connection?
      </Text>
      <Text style={styles.skipConfirmationText}>
        Without your calendar, Blob might schedule tasks when you're busy. You
        can always connect later in settings.
      </Text>

      <View style={styles.skipConfirmationActions}>
        <TouchableOpacity style={styles.cancelSkipButton} onPress={onCancel}>
          <Text style={styles.cancelSkipText}>Go Back</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.confirmSkipButton} onPress={onConfirm}>
          <Text style={styles.confirmSkipText}>Skip Anyway</Text>
        </TouchableOpacity>
      </View>
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  providersContainer: {
    gap: Spacing.md,
    marginBottom: Spacing.xl,
  },

  providerCardContainer: {
    width: "100%",
  },

  providerCard: {
    backgroundColor: Colors.background.card,
    borderRadius: BorderRadius.blob.medium,
    padding: Spacing.lg,
    borderWidth: 2,
    borderColor: Colors.border.light,
    shadowColor: Colors.neutral[200],
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
    position: "relative",
  },

  selectedProviderCard: {
    borderColor: Colors.primary.main,
    backgroundColor: Colors.background.accent,
  },

  connectedProviderCard: {
    borderColor: Colors.success.main,
    backgroundColor: Colors.success.light,
  },

  popularBadge: {
    position: "absolute",
    top: -8,
    right: Spacing.md,
    backgroundColor: Colors.primary.main,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: 12,
    shadowColor: Colors.primary.main,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },

  popularText: {
    ...Typography.captionSmall,
    color: Colors.text.onPrimary,
    fontWeight: "600",
    fontSize: 10,
  },

  providerInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    marginBottom: Spacing.sm,
  },

  providerIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: Colors.background.primary,
    justifyContent: "center",
    alignItems: "center",
    marginRight: Spacing.md,
    shadowColor: Colors.neutral[300],
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },

  providerIcon: {
    fontSize: 24,
  },

  providerDetails: {
    flex: 1,
  },

  providerName: {
    ...Typography.h4,
    color: Colors.text.primary,
    marginBottom: 2,
    fontWeight: "600",
  },

  providerDescription: {
    ...Typography.bodySmall,
    color: Colors.text.secondary,
    lineHeight: 18,
  },

  statusContainer: {
    alignItems: "center",
    minHeight: 40,
    justifyContent: "center",
  },

  loadingIndicator: {
    alignItems: "center",
    gap: Spacing.xs,
  },

  connectingText: {
    ...Typography.captionMedium,
    color: Colors.primary.main,
    fontWeight: "500",
  },

  connectedIndicator: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
  },

  connectedText: {
    ...Typography.captionMedium,
    color: Colors.success.main,
    fontWeight: "600",
  },

  connectButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.primary.main,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: 20,
    gap: Spacing.xs,
  },

  connectButtonText: {
    ...Typography.captionMedium,
    color: Colors.text.onPrimary,
    fontWeight: "600",
  },

  benefitsSection: {
    marginBottom: Spacing.xl,
  },

  benefitsCard: {
    backgroundColor: Colors.glass.background,
    borderRadius: BorderRadius.blob.small,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.glass.border,
  },

  benefitsTitle: {
    ...Typography.h4,
    color: Colors.text.primary,
    marginBottom: Spacing.md,
    fontWeight: "600",
  },

  benefitsList: {
    gap: Spacing.sm,
  },

  benefitItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },

  benefitIcon: {
    fontSize: 18,
    width: 24,
    textAlign: "center",
  },

  benefitText: {
    ...Typography.bodyMedium,
    color: Colors.text.secondary,
    flex: 1,
    lineHeight: 20,
  },

  skipSection: {
    alignItems: "center",
    marginTop: Spacing.lg,
  },

  skipButton: {
    padding: Spacing.md,
    alignItems: "center",
  },

  skipText: {
    ...Typography.bodyMedium,
    color: Colors.text.tertiary,
    fontWeight: "500",
  },

  skipSubtext: {
    ...Typography.captionSmall,
    color: Colors.text.muted,
    marginTop: 2,
  },

  skipConfirmationContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  skipConfirmationCard: {
    backgroundColor: Colors.background.card,
    borderRadius: BorderRadius.blob.medium,
    padding: Spacing.xl,
    margin: Spacing.lg,
    shadowColor: Colors.neutral[400],
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 10,
  },

  skipConfirmationTitle: {
    ...Typography.h3,
    color: Colors.text.primary,
    textAlign: "center",
    marginBottom: Spacing.md,
    fontWeight: "600",
  },

  skipConfirmationText: {
    ...Typography.bodyMedium,
    color: Colors.text.secondary,
    textAlign: "center",
    lineHeight: 24,
    marginBottom: Spacing.xl,
  },

  skipConfirmationActions: {
    flexDirection: "row",
    gap: Spacing.md,
  },

  cancelSkipButton: {
    flex: 1,
    backgroundColor: Colors.background.secondary,
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border.medium,
    alignItems: "center",
  },

  cancelSkipText: {
    ...Typography.buttonMedium,
    color: Colors.text.primary,
    fontWeight: "600",
  },

  confirmSkipButton: {
    flex: 1,
    backgroundColor: Colors.primary.main,
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    alignItems: "center",
  },

  confirmSkipText: {
    ...Typography.buttonMedium,
    color: Colors.text.onPrimary,
    fontWeight: "600",
  },
});

export default CalendarConnectionScreen;
