import { useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
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
  validateSignUpForm,
} from "../../src/services/api/auth-utils";

const SignupScreen = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const router = useRouter();

  const handleSignup = async () => {
    setError("");
    setSuccess("");
    const { isValid, errors } = validateSignUpForm({
      email,
      password,
      confirmPassword,
      fullName,
    });
    if (!isValid) {
      setError(errors[0]);
      return;
    }
    setLoading(true);
    const { error: authError } = await authService.signUp({
      email,
      password,
      fullName,
    });
    setLoading(false);
    if (authError) {
      setError(getAuthErrorMessage(authError));
    } else {
      setSuccess("Check your email to confirm your account!");
    }
  };

  const handleLogin = () => {
    router.push("../auth/login");
  };

  // Social signup (Google example)
  const handleSocialSignup = async (provider: "google") => {
    setLoading(true);
    try {
      await authService.signInWithOAuth?.(provider);
    } catch {
      setError("Social signup failed.");
    }
    setLoading(false);
  };

  return (
    <ScrollView
      contentContainerStyle={{
        flexGrow: 1,
        justifyContent: "center",
        backgroundColor: Colors.background.primary,
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
        Create Account
      </Text>
      <Text
        style={{
          fontFamily: FontFamily.primary.regular,
          fontSize: FontSize.body.medium,
          color: Colors.text.secondary,
          marginBottom: Spacing.xl,
        }}
      >
        Sign up to get started
      </Text>
      <TextInput
        placeholder="Full Name"
        value={fullName}
        onChangeText={setFullName}
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
      <TextInput
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
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
      <TextInput
        placeholder="Confirm Password"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        secureTextEntry
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
        onPress={handleSignup}
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
            Sign Up
          </Text>
        )}
      </TouchableOpacity>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          marginBottom: Spacing.lg,
        }}
      >
        <View
          style={{ flex: 1, height: 1, backgroundColor: Colors.border.light }}
        />
        <Text
          style={{ marginHorizontal: Spacing.md, color: Colors.text.tertiary }}
        >
          or
        </Text>
        <View
          style={{ flex: 1, height: 1, backgroundColor: Colors.border.light }}
        />
      </View>
      <TouchableOpacity
        onPress={() => handleSocialSignup("google")}
        style={{
          backgroundColor: Colors.secondary[500],
          borderRadius: 8,
          paddingVertical: Spacing.md,
          alignItems: "center",
          marginBottom: Spacing.md,
        }}
      >
        <Text
          style={{
            color: Colors.text.inverse,
            fontFamily: FontFamily.primary.bold,
            fontSize: FontSize.button.medium,
          }}
        >
          Sign up with Google
        </Text>
      </TouchableOpacity>
      <View
        style={{
          flexDirection: "row",
          justifyContent: "center",
          marginTop: Spacing.lg,
        }}
      >
        <Text
          style={{
            color: Colors.text.secondary,
            fontFamily: FontFamily.primary.regular,
          }}
        >
          Already have an account?{" "}
        </Text>
        <TouchableOpacity onPress={handleLogin}>
          <Text
            style={{
              color: Colors.primary[500],
              fontFamily: FontFamily.primary.bold,
            }}
          >
            Sign in
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

export default SignupScreen;
