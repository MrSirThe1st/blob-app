import {
  BorderRadius,
  Colors,
  Padding,
  Spacing,
  Typography,
} from "@/constants";
import { useNavigation } from "@react-navigation/native";
import {
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const WelcomeScreen = () => {
  const navigation = useNavigation();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Header Section */}
        <View style={styles.header}>
          <Text style={styles.logo}>🌊</Text>
          <Text style={styles.title}>Welcome to Blob AI</Text>
          <Text style={styles.subtitle}>
            Your adaptive productivity companion that learns and grows with you
          </Text>
        </View>

        {/* Benefits Section */}
        <View style={styles.benefits}>
          <View style={styles.benefit}>
            <Text style={styles.benefitIcon}>🎯</Text>
            <Text style={styles.benefitText}>AI-powered task scheduling</Text>
          </View>
          <View style={styles.benefit}>
            <Text style={styles.benefitIcon}>🤝</Text>
            <Text style={styles.benefitText}>Accountability partnerships</Text>
          </View>
          <View style={styles.benefit}>
            <Text style={styles.benefitIcon}>📈</Text>
            <Text style={styles.benefitText}>Smart progress tracking</Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => navigation.navigate("Signup")}
          >
            <Text style={styles.primaryButtonText}>Create Account</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => navigation.navigate("Login")}
          >
            <Text style={styles.secondaryButtonText}>Sign In</Text>
          </TouchableOpacity>
        </View>
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
    paddingTop: Spacing.xl,
    justifyContent: "space-between",
  },
  header: {
    alignItems: "center",
    paddingTop: Spacing.xl,
  },
  logo: {
    fontSize: 64,
    marginBottom: Spacing.lg,
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
  },
  benefits: {
    paddingVertical: Spacing.xl,
  },
  benefit: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.lg,
    paddingHorizontal: Spacing.md,
  },
  benefitIcon: {
    fontSize: 24,
    marginRight: Spacing.md,
  },
  benefitText: {
    ...Typography.bodyMedium,
    color: Colors.text.primary,
    flex: 1,
  },
  actions: {
    paddingBottom: Spacing.xl,
    gap: Spacing.md,
  },
  primaryButton: {
    backgroundColor: Colors.primary.main,
    paddingHorizontal: Padding.button.large.horizontal,
    paddingVertical: Padding.button.large.vertical,
    borderRadius: BorderRadius.lg,
    alignItems: "center",
  },
  primaryButtonText: {
    ...Typography.buttonLarge,
    color: Colors.text.onPrimary,
  },
  secondaryButton: {
    backgroundColor: "transparent",
    paddingHorizontal: Padding.button.large.horizontal,
    paddingVertical: Padding.button.large.vertical,
    borderRadius: BorderRadius.lg,
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.border.default,
  },
  secondaryButtonText: {
    ...Typography.buttonLarge,
    color: Colors.text.primary,
  },
});

export default WelcomeScreen;
