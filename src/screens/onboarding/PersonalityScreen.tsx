// src/screens/onboarding/PersonalityScreen.tsx
import {
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import {
  Colors,
  Typography,
  Spacing,
  BorderRadius,
  Padding,
} from "@/constants";
import { OnboardingStackParamList } from "@/components/navigation/OnboardingNavigator";

type NavigationProp = NativeStackNavigationProp<
  OnboardingStackParamList,
  "Personality"
>;

const PersonalityScreen = () => {
  const navigation = useNavigation<NavigationProp>();

  const handleContinue = () => {
    navigation.navigate("WorkStyle");
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Personality</Text>
          <Text style={styles.subtitle}>
            What do you naturally feel most energetic and focused?
          </Text>
        </View>

        <View style={styles.placeholder}>
          <Text style={styles.placeholderText}>
            🧠 Personality Assessment Coming Soon
          </Text>
        </View>

        <TouchableOpacity
          style={styles.continueButton}
          onPress={handleContinue}
        >
          <Text style={styles.continueButtonText}>Continue</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

// src/screens/onboarding/WorkStyleScreen.tsx
export const WorkStyleScreen = () => {
  const navigation =
    useNavigation<
      NativeStackNavigationProp<OnboardingStackParamList, "WorkStyle">
    >();

  const handleContinue = () => {
    navigation.navigate("CalendarConnection");
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Work Style</Text>
          <Text style={styles.subtitle}>
            How do you work best when you have important tasks to complete?
          </Text>
        </View>

        <View style={styles.placeholder}>
          <Text style={styles.placeholderText}>
            ⚡ Work Style Assessment Coming Soon
          </Text>
        </View>

        <TouchableOpacity
          style={styles.continueButton}
          onPress={handleContinue}
        >
          <Text style={styles.continueButtonText}>Continue</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

// src/screens/onboarding/CalendarConnectionScreen.tsx
export const CalendarConnectionScreen = () => {
  const navigation =
    useNavigation<
      NativeStackNavigationProp<OnboardingStackParamList, "CalendarConnection">
    >();

  const handleContinue = () => {
    navigation.navigate("OpenConversation");
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Calendar Connection</Text>
          <Text style={styles.subtitle}>
            Connect your calendar so I know when you're busy and can work around
            your schedule
          </Text>
        </View>

        <View style={styles.placeholder}>
          <Text style={styles.placeholderText}>
            📅 Calendar Integration Coming Soon
          </Text>
        </View>

        <TouchableOpacity
          style={styles.continueButton}
          onPress={handleContinue}
        >
          <Text style={styles.continueButtonText}>Continue</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

// src/screens/onboarding/OpenConversationScreen.tsx
export const OpenConversationScreen = () => {
  const navigation =
    useNavigation<
      NativeStackNavigationProp<OnboardingStackParamList, "OpenConversation">
    >();

  const handleComplete = () => {
    // TODO: Mark onboarding as complete and navigate to main app
    console.log("Onboarding completed!");
    // This would typically update the user profile and trigger navigation
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Open Conversation</Text>
          <Text style={styles.subtitle}>
            Tell me everything about yourself, your goals, what you're working
            on in the long-run or anything that's going on in your life. Take as
            much time as you need!
          </Text>
        </View>

        <View style={styles.placeholder}>
          <Text style={styles.placeholderText}>
            💬 AI Conversation Interface Coming Soon
          </Text>
        </View>

        <TouchableOpacity
          style={styles.continueButton}
          onPress={handleComplete}
        >
          <Text style={styles.continueButtonText}>Complete Onboarding</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.primary,
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing["2xl"],
    paddingBottom: Spacing.xl,
    justifyContent: "space-between",
  },
  header: {
    alignItems: "center",
    marginBottom: Spacing["3xl"],
  },
  title: {
    ...Typography.h1,
    color: Colors.text.primary,
    textAlign: "center",
    marginBottom: Spacing.md,
  },
  subtitle: {
    ...Typography.bodyLarge,
    color: Colors.text.secondary,
    textAlign: "center",
    lineHeight: 24,
    paddingHorizontal: Spacing.md,
  },
  placeholder: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.background.secondary,
    borderRadius: BorderRadius.blob.large,
    margin: Spacing.lg,
    padding: Spacing["2xl"],
  },
  placeholderText: {
    ...Typography.h3,
    color: Colors.text.secondary,
    textAlign: "center",
  },
  continueButton: {
    backgroundColor: Colors.primary.main,
    paddingHorizontal: Padding.button.large.horizontal,
    paddingVertical: Padding.button.large.vertical,
    borderRadius: BorderRadius.lg,
    alignItems: "center",
    shadowColor: Colors.primary.main,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  continueButtonText: {
    ...Typography.buttonLarge,
    color: Colors.text.onPrimary,
  },
});

export default PersonalityScreen;
