import { useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import {
  Colors,
  FontFamily,
  FontSize,
  Padding,
  Spacing,
} from "../../src/constants";
import { authService } from "../../src/services/api/auth";
import {
  getAuthErrorMessage,
  validateEmail,
} from "../../src/services/api/auth-utils";

const ForgotPasswordScreen = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const router = useRouter();

  const handleReset = async () => {
    setError("");
    setSuccess("");
    const { isValid, errors } = validateEmail(email);
    if (!isValid) {
      setError(errors[0]);
      return;
    }
    setLoading(true);
    const { error: resetError } = await authService.resetPassword(email);
    setLoading(false);
    if (resetError) {
      setError(getAuthErrorMessage(resetError));
    } else {
      setSuccess("Check your email for a password reset link!");
    }
  };

  const handleBackToLogin = () => {
    router.push("../auth/login");
  };

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: Colors.background.primary,
        justifyContent: "center",
        padding: Padding.screen.horizontal,
      }}
    >
      <Text
        style={{
          fontFamily: FontFamily.primary.bold,
          fontSize: FontSize.heading.h1,
          color: Colors.text.primary,
          marginBottom: Spacing.lg,
        }}
      >
        Forgot Password
      </Text>
      <Text
        style={{
          fontFamily: FontFamily.primary.regular,
          fontSize: FontSize.body.medium,
          color: Colors.text.secondary,
          marginBottom: Spacing.xl,
        }}
      >
        Enter your email to receive a reset link
      </Text>
      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
        style={{
          backgroundColor: Colors.background.tertiary,
          borderRadius: 8,
          padding: Spacing.md,
          marginBottom: Spacing.md,
          fontFamily: FontFamily.primary.regular,
          fontSize: FontSize.body.medium,
          color: Colors.text.primary,
        }}
        placeholderTextColor={Colors.text.tertiary}
      />
      {error ? (
        <Text style={{ color: Colors.error.main, marginBottom: Spacing.sm }}>
          {error}
        </Text>
      ) : null}
      {success ? (
        <Text style={{ color: Colors.success.main, marginBottom: Spacing.sm }}>
          {success}
        </Text>
      ) : null}
      <TouchableOpacity
        onPress={handleReset}
        style={{
          backgroundColor: Colors.primary[500],
          borderRadius: 8,
          paddingVertical: Spacing.md,
          alignItems: "center",
          marginBottom: Spacing.md,
        }}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color={Colors.text.inverse} />
        ) : (
          <Text
            style={{
              color: Colors.text.inverse,
              fontFamily: FontFamily.primary.bold,
              fontSize: FontSize.button.medium,
            }}
          >
            Send Reset Link
          </Text>
        )}
      </TouchableOpacity>
      <TouchableOpacity
        onPress={handleBackToLogin}
        style={{ marginTop: Spacing.lg }}
      >
        <Text
          style={{
            color: Colors.primary[500],
            fontFamily: FontFamily.primary.medium,
            fontSize: FontSize.body.small,
          }}
        >
          Back to Login
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default ForgotPasswordScreen;
