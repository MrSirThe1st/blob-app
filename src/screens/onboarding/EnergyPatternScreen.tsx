// src/screens/onboarding/EnergyPatternScreen.tsx
import React, { useState } from "react";
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Animated,
} from "react-native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useNavigation } from "@react-navigation/native";
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
  "EnergyPattern"
>;

interface EnergyOption {
  id: "morning" | "evening" | "afternoon";
  icon: string;
  title: string;
  description: string;
}

const energyOptions: EnergyOption[] = [
  {
    id: "morning",
    icon: "🌅",
    title: "Morning person",
    description: "I naturally feel most energetic and focused",
  },
  {
    id: "evening",
    icon: "🌙",
    title: "Evening person",
    description: "I naturally feel most energetic and focused",
  },
  {
    id: "afternoon",
    icon: "☀️",
    title: "Afternoon person",
    description: "I naturally feel most energetic and focused",
  },
];

const EnergyPatternScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const [selectedOption, setSelectedOption] = useState<string>("");
  const [buttonScale] = useState(new Animated.Value(1));

  const handleOptionSelect = (optionId: string) => {
    setSelectedOption(optionId);
  };

  const handleContinue = () => {
    if (!selectedOption) return;

    // Animate button press
    Animated.sequence([
      Animated.timing(buttonScale, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(buttonScale, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    // TODO: Save energy pattern to user profile
    console.log("Selected energy pattern:", selectedOption);

    // Navigate to next screen
    setTimeout(() => {
      navigation.navigate("Personality");
    }, 200);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Energy Pattern</Text>
          <Text style={styles.subtitle}>
            What do you naturally feel most energetic and focused?
          </Text>
        </View>

        {/* Options */}
        <View style={styles.optionsContainer}>
          {energyOptions.map((option) => (
            <TouchableOpacity
              key={option.id}
              style={[
                styles.optionCard,
                selectedOption === option.id && styles.optionCardSelected,
              ]}
              onPress={() => handleOptionSelect(option.id)}
              activeOpacity={0.7}
            >
              <Text style={styles.optionIcon}>{option.icon}</Text>
              <View style={styles.optionContent}>
                <Text style={styles.optionTitle}>{option.title}</Text>
                <Text style={styles.optionDescription}>
                  {option.description}
                </Text>
              </View>

              {/* Selection indicator */}
              <View
                style={[
                  styles.selectionIndicator,
                  selectedOption === option.id &&
                    styles.selectionIndicatorActive,
                ]}
              >
                {selectedOption === option.id && (
                  <View style={styles.selectionDot} />
                )}
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Continue Button */}
        <View style={styles.buttonContainer}>
          <Animated.View style={[{ transform: [{ scale: buttonScale }] }]}>
            <TouchableOpacity
              style={[
                styles.continueButton,
                !selectedOption && styles.continueButtonDisabled,
              ]}
              onPress={handleContinue}
              disabled={!selectedOption}
              activeOpacity={0.8}
            >
              <Text style={styles.continueButtonText}>Continue</Text>
            </TouchableOpacity>
          </Animated.View>
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
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing["2xl"],
    paddingBottom: Spacing.xl,
  },
  header: {
    marginBottom: Spacing["3xl"],
    alignItems: "center",
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
  optionsContainer: {
    flex: 1,
    gap: Spacing.md,
  },
  optionCard: {
    backgroundColor: Colors.background.secondary,
    borderRadius: BorderRadius.blob.medium,
    padding: Spacing.lg,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "transparent",
    shadowColor: Colors.glass.shadow,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  optionCardSelected: {
    borderColor: Colors.primary.main,
    backgroundColor: Colors.background.accent,
  },
  optionIcon: {
    fontSize: 32,
    marginRight: Spacing.md,
  },
  optionContent: {
    flex: 1,
  },
  optionTitle: {
    ...Typography.h3,
    color: Colors.text.primary,
    marginBottom: Spacing.xs,
  },
  optionDescription: {
    ...Typography.bodyMedium,
    color: Colors.text.secondary,
    lineHeight: 20,
  },
  selectionIndicator: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.border.medium,
    backgroundColor: Colors.background.secondary,
    alignItems: "center",
    justifyContent: "center",
  },
  selectionIndicatorActive: {
    borderColor: Colors.primary.main,
    backgroundColor: Colors.primary.main,
  },
  selectionDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.text.onPrimary,
  },
  buttonContainer: {
    marginTop: Spacing["2xl"],
    alignItems: "center",
  },
  continueButton: {
    backgroundColor: Colors.primary.main,
    paddingHorizontal: Padding.button.large.horizontal,
    paddingVertical: Padding.button.large.vertical,
    borderRadius: BorderRadius.lg,
    minWidth: 200,
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
  continueButtonDisabled: {
    backgroundColor: Colors.neutral.light,
    shadowOpacity: 0,
    elevation: 0,
  },
  continueButtonText: {
    ...Typography.buttonLarge,
    color: Colors.text.onPrimary,
  },
});

export default EnergyPatternScreen;
