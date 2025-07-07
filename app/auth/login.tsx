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
  validateSignInForm,
} from "../../src/services/api/auth-utils";

const LoginScreen = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleLogin = async () => {
    setError("");
    const { isValid, errors } = validateSignInForm({ email, password });
    if (!isValid) {
      setError(errors[0]);
      return;
    }
    setLoading(true);
    const { error: authError } = await authService.signIn({ email, password });
    setLoading(false);
    if (authError) {
      setError(getAuthErrorMessage(authError));
    } else {
      router.replace("/"); // Go to home or dashboard
    }
  };

  const handleForgotPassword = () => {
    router.push("../auth/forgot-password");
  };

  const handleSignup = () => {
    router.push("../auth/signup");
  };

  // Social login (Google example)
  const handleSocialLogin = async (provider: "google") => {
    setLoading(true);
    try {
      // Use Supabase's signInWithOAuth for social login
      await authService.signInWithOAuth?.(provider);
    } catch {
      setError("Social login failed.");
    }
    setLoading(false);
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
        Welcome Back
      </Text>
      <Text
        style={{
          fontFamily: FontFamily.primary.regular,
          fontSize: FontSize.body.medium,
          color: Colors.text.secondary,
          marginBottom: Spacing.xl,
        }}
      >
        Sign in to your account
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
      {error ? (
        <Text style={{ color: Colors.error.main, marginBottom: Spacing.sm }}>
          {error}
        </Text>
      ) : null}
      <TouchableOpacity
        onPress={handleLogin}
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
            Sign In
          </Text>
        )}
      </TouchableOpacity>
      <TouchableOpacity
        onPress={handleForgotPassword}
        style={{ marginBottom: Spacing.lg }}
      >
        <Text
          style={{
            color: Colors.primary[500],
            fontFamily: FontFamily.primary.medium,
            fontSize: FontSize.body.small,
          }}
        >
          Forgot password?
        </Text>
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
        onPress={() => handleSocialLogin("google")}
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
          Continue with Google
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
          Don&apos;t have an account?{" "}
        </Text>
        <TouchableOpacity onPress={handleSignup}>
          <Text
            style={{
              color: Colors.primary[500],
              fontFamily: FontFamily.primary.bold,
            }}
          >
            Sign up
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default LoginScreen;

// Add signInWithOAuth to authService if not present
