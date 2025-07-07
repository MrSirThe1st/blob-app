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
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const LoginScreen = () => {
  const navigation = useNavigation();
  const { signIn } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await signIn(email.trim(), password);

      if (error) {
        Alert.alert("Login Failed", error.message || "Failed to sign in");
      }
      // Navigation will be handled automatically by AuthNavigator
    } catch (err) {
      Alert.alert("Error", "An unexpected error occurred");
      console.error("Login error:", err);
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
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Text style={styles.backButtonText}>← Back</Text>
            </TouchableOpacity>
            <Text style={styles.title}>Welcome Back</Text>
            <Text style={styles.subtitle}>
              Sign in to continue your journey
            </Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
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
                placeholder="Enter your password"
                placeholderTextColor={Colors.text.muted}
                secureTextEntry
                autoCapitalize="none"
              />
            </View>

            <TouchableOpacity
              style={[styles.loginButton, isLoading && styles.buttonDisabled]}
              onPress={handleLogin}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color={Colors.text.onPrimary} />
              ) : (
                <Text style={styles.loginButtonText}>Sign In</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.linkButton}
              onPress={() => navigation.navigate("Signup")}
            >
              <Text style={styles.linkText}>
                Don't have an account?{" "}
                <Text style={styles.linkTextBold}>Sign Up</Text>
              </Text>
            </TouchableOpacity>
          </View>
        </View>
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
  content: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
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
    flex: 1,
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
  loginButton: {
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
  loginButtonText: {
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

export default LoginScreen;
