import {
  BorderRadius,
  Colors,
  Padding,
  Spacing,
  Typography,
} from "@/constants";
import { useAuth } from "@/hooks/useAuth";
import { useNavigation } from "@react-navigation/native";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const SignupScreen = () => {
  const navigation = useNavigation();
  const { signUp } = useAuth();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSignup = async () => {
    // Validation
    if (
      !fullName.trim() ||
      !email.trim() ||
      !password.trim() ||
      !confirmPassword.trim()
    ) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match");
      return;
    }

    if (password.length < 6) {
      Alert.alert("Error", "Password must be at least 6 characters");
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await signUp(email.trim(), password, fullName.trim());

      if (error) {
        Alert.alert(
          "Signup Failed",
          error.message || "Failed to create account"
        );
      }
      // Navigation will be handled automatically by AuthNavigator
    } catch (err) {
      Alert.alert("Error", "An unexpected error occurred");
      console.error("Signup error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.content}>
            {/* Header */}
            <View style={styles.header}>
              <TouchableOpacity
                style={styles.backButton}
                onPress={() => navigation.goBack()}
              >
                <Text style={styles.backButtonText}>← Back</Text>
              </TouchableOpacity>
              <Text style={styles.title}>Create Account</Text>
              <Text style={styles.subtitle}>Join the Blob AI community</Text>
            </View>

            {/* Form */}
            <View style={styles.form}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Full Name</Text>
                <TextInput
                  style={styles.input}
                  value={fullName}
                  onChangeText={setFullName}
                  placeholder="Enter your full name"
                  placeholderTextColor={Colors.text.muted}
                  autoCapitalize="words"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Email</Text>
                <TextInput
                  style={styles.input}
                  value={email}
                  onChangeText={setEmail}
                  placeholder="Enter your email"
                  placeholderTextColor={Colors.text.muted}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Password</Text>
                <TextInput
                  style={styles.input}
                  value={password}
                  onChangeText={setPassword}
                  placeholder="Create a password (min 6 characters)"
                  placeholderTextColor={Colors.text.muted}
                  secureTextEntry
                  autoCapitalize="none"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Confirm Password</Text>
                <TextInput
                  style={styles.input}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  placeholder="Confirm your password"
                  placeholderTextColor={Colors.text.muted}
                  secureTextEntry
                  autoCapitalize="none"
                />
              </View>

              <TouchableOpacity
                style={[
                  styles.signupButton,
                  isLoading && styles.buttonDisabled,
                ]}
                onPress={handleSignup}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color={Colors.text.onPrimary} />
                ) : (
                  <Text style={styles.signupButtonText}>Create Account</Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.linkButton}
                onPress={() => navigation.navigate("Login")}
              >
                <Text style={styles.linkText}>
                  Already have an account?{" "}
                  <Text style={styles.linkTextBold}>Sign In</Text>
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.primary,
  },
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xl,
  },
  header: {
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.xl,
  },
  backButton: {
    alignSelf: "flex-start",
    marginBottom: Spacing.lg,
  },
  backButtonText: {
    ...Typography.bodyMedium,
    color: Colors.primary.main,
  },
  title: {
    ...Typography.h1,
    color: Colors.text.primary,
    marginBottom: Spacing.md,
  },
  subtitle: {
    ...Typography.bodyLarge,
    color: Colors.text.secondary,
  },
  form: {
    gap: Spacing.lg,
  },
  inputGroup: {
    gap: Spacing.sm,
  },
  label: {
    ...Typography.bodyMedium,
    color: Colors.text.primary,
    fontWeight: Typography.bodyMedium.fontWeight,
  },
  input: {
    backgroundColor: Colors.background.card,
    borderWidth: 1,
    borderColor: Colors.border.default,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    fontSize: Typography.bodyMedium.fontSize,
    color: Colors.text.primary,
  },
  signupButton: {
    backgroundColor: Colors.primary.main,
    paddingHorizontal: Padding.button.large.horizontal,
    paddingVertical: Padding.button.large.vertical,
    borderRadius: BorderRadius.lg,
    alignItems: "center",
    marginTop: Spacing.md,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  signupButtonText: {
    ...Typography.buttonLarge,
    color: Colors.text.onPrimary,
  },
  linkButton: {
    alignItems: "center",
    marginTop: Spacing.md,
  },
  linkText: {
    ...Typography.bodyMedium,
    color: Colors.text.secondary,
  },
  linkTextBold: {
    color: Colors.primary.main,
    fontWeight: "600",
  },
});

export default SignupScreen;
