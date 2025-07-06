// app/(tabs)/index.tsx
import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { useAuth } from "@/hooks/useAuth";

const DEMO_USERS = [
  {
    email: "demo@blob.com",
    password: "demo123!",
    fullName: "Demo User",
    description: "Basic demo user for testing",
  },
  {
    email: "morning@blob.com",
    password: "morning123!",
    fullName: "Morning Person",
    description: "Early bird chronotype user",
  },
  {
    email: "evening@blob.com",
    password: "evening123!",
    fullName: "Evening Person",
    description: "Night owl chronotype user",
  },
  {
    email: "test@blob.com",
    password: "test123!",
    fullName: "Test User",
    description: "General testing account",
  },
];

export default function HomeScreen() {
  const {
    user,
    userProfile,
    isLoading,
    isAuthenticated,
    signUp,
    signIn,
    signOut,
  } = useAuth();

  const [isCreatingUsers, setIsCreatingUsers] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [manualEmail, setManualEmail] = useState("");
  const [manualPassword, setManualPassword] = useState("");
  const [creationStatus, setCreationStatus] = useState<{
    [key: string]: string;
  }>({});

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    const logEntry = `${timestamp}: ${message}`;
    setLogs((prev) => [...prev, logEntry]);
    console.log(message);
  };

  const createSingleDemoUser = async (userData: (typeof DEMO_USERS)[0]) => {
    try {
      addLog(`Creating user: ${userData.email}`);
      setCreationStatus((prev) => ({ ...prev, [userData.email]: "creating" }));

      const { error } = await signUp(
        userData.email,
        userData.password,
        userData.fullName
      );

      if (error) {
        addLog(`❌ Failed: ${userData.email} - ${error.message}`);
        setCreationStatus((prev) => ({ ...prev, [userData.email]: "error" }));
        return { success: false, error };
      } else {
        addLog(`✅ Success: ${userData.email}`);
        setCreationStatus((prev) => ({ ...prev, [userData.email]: "success" }));
        return { success: true };
      }
    } catch (err: any) {
      addLog(`❌ Exception: ${userData.email} - ${err.message}`);
      setCreationStatus((prev) => ({ ...prev, [userData.email]: "error" }));
      return { success: false, error: err };
    }
  };
  const createAllDemoUsers = async () => {
    setIsCreatingUsers(true);
    setLogs([]);
    setCreationStatus({});

    addLog("🚀 Starting demo user creation...");
    addLog("⚠️ Note: 45 second delay between users due to rate limits");

    for (const userData of DEMO_USERS) {
      await createSingleDemoUser(userData);

      // Longer delay to respect Supabase rate limits (40+ seconds)
      if (userData !== DEMO_USERS[DEMO_USERS.length - 1]) {
        addLog("⏳ Waiting 45 seconds for rate limit...");
        await new Promise((resolve) => setTimeout(resolve, 45000));
      }
    }

    addLog("✅ Demo user creation complete!");
    setIsCreatingUsers(false);
  };

  const signInAsUser = async (email: string, password: string) => {
    try {
      addLog(`Signing in as: ${email}`);
      const { error } = await signIn(email, password);

      if (error) {
        addLog(`❌ Sign in failed: ${error.message}`);
        Alert.alert("Sign In Failed", error.message);
      } else {
        addLog(`✅ Successfully signed in as: ${email}`);
        Alert.alert("Success!", `Signed in as ${email}`);
      }
    } catch (err: any) {
      addLog(`❌ Sign in exception: ${err.message}`);
      Alert.alert("Error", err.message);
    }
  };

  const handleSignOut = async () => {
    try {
      const { error } = await signOut();
      if (error) {
        addLog(`❌ Sign out failed: ${error.message}`);
      } else {
        addLog("✅ Successfully signed out");
        Alert.alert("Signed Out", "Successfully signed out");
      }
    } catch (err: any) {
      addLog(`❌ Sign out exception: ${err.message}`);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading authentication...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>🧪 Auth Test Center</Text>

      {/* Current Status */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Current Status</Text>
        <Text style={styles.statusText}>
          Authenticated: {isAuthenticated ? "✅ Yes" : "❌ No"}
        </Text>
        {user && (
          <>
            <Text style={styles.statusText}>Email: {user.email}</Text>
            <Text style={styles.statusText}>
              User ID: {user.id.substring(0, 8)}...
            </Text>
          </>
        )}
        {userProfile && (
          <>
            <Text style={styles.statusText}>
              Full Name: {userProfile.fullName}
            </Text>
            <Text style={styles.statusText}>
              Onboarding:{" "}
              {userProfile.onboardingCompleted ? "Complete" : "Incomplete"}
            </Text>
            <Text style={styles.statusText}>XP: {userProfile.xpTotal}</Text>
            <Text style={styles.statusText}>
              Level: {userProfile.currentLevel}
            </Text>
          </>
        )}
      </View>

      {!isAuthenticated ? (
        <>
          {/* Individual User Creation Buttons */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>1a. Create Individual Users</Text>
            <Text style={styles.description}>
              Create one user at a time to avoid rate limits
            </Text>

            {DEMO_USERS.map((userData) => (
              <TouchableOpacity
                key={`create-${userData.email}`}
                onPress={() => createSingleDemoUser(userData)}
                disabled={creationStatus[userData.email] === "creating"}
                style={[
                  styles.userButton,
                  creationStatus[userData.email] === "success" && {
                    backgroundColor: "#e8f5e8",
                  },
                  creationStatus[userData.email] === "error" && {
                    backgroundColor: "#ffeaea",
                  },
                  creationStatus[userData.email] === "creating" && {
                    backgroundColor: "#fff3cd",
                  },
                ]}
              >
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <View
                    style={[
                      styles.statusDot,
                      {
                        backgroundColor:
                          creationStatus[userData.email] === "success"
                            ? "#4CAF50"
                            : creationStatus[userData.email] === "error"
                              ? "#F44336"
                              : creationStatus[userData.email] === "creating"
                                ? "#FF9800"
                                : "#9E9E9E",
                      },
                    ]}
                  />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.userButtonTitle}>
                      {creationStatus[userData.email] === "creating"
                        ? "⏳ Creating..."
                        : creationStatus[userData.email] === "success"
                          ? "✅ Created"
                          : creationStatus[userData.email] === "error"
                            ? "❌ Failed"
                            : `Create ${userData.fullName}`}
                    </Text>
                    <Text style={styles.userButtonEmail}>{userData.email}</Text>
                    <Text style={styles.userButtonDescription}>
                      {userData.description}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>

          {/* Bulk Creation */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>1b. Create All Users (Slow)</Text>
            <Text style={styles.description}>
              Create all users with 45 second delays (takes ~3 minutes)
            </Text>

            <TouchableOpacity
              onPress={createAllDemoUsers}
              disabled={isCreatingUsers}
              style={[
                styles.primaryButton,
                isCreatingUsers && styles.disabledButton,
              ]}
            >
              <Text style={styles.buttonText}>
                {isCreatingUsers
                  ? "⏳ Creating Users... (~3 min)"
                  : "🚀 Create All Demo Users"}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Quick Sign In */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>2. Quick Sign In</Text>
            <Text style={styles.description}>
              Sign in as different demo users to test various scenarios
            </Text>

            {DEMO_USERS.map((userData) => (
              <TouchableOpacity
                key={userData.email}
                onPress={() => signInAsUser(userData.email, userData.password)}
                style={styles.userButton}
              >
                <Text style={styles.userButtonTitle}>{userData.fullName}</Text>
                <Text style={styles.userButtonEmail}>{userData.email}</Text>
                <Text style={styles.userButtonDescription}>
                  {userData.description}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Manual Sign In */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>3. Manual Sign In</Text>
            <TextInput
              placeholder="Email"
              value={manualEmail}
              onChangeText={setManualEmail}
              style={styles.input}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <TextInput
              placeholder="Password"
              value={manualPassword}
              onChangeText={setManualPassword}
              secureTextEntry
              style={styles.input}
            />
            <TouchableOpacity
              onPress={() => signInAsUser(manualEmail, manualPassword)}
              disabled={!manualEmail || !manualPassword}
              style={[
                styles.primaryButton,
                (!manualEmail || !manualPassword) && styles.disabledButton,
              ]}
            >
              <Text style={styles.buttonText}>Sign In</Text>
            </TouchableOpacity>
          </View>
        </>
      ) : (
        <View style={styles.card}>
          <Text style={[styles.cardTitle, { color: "#4CAF50" }]}>
            ✅ Successfully Authenticated!
          </Text>
          <Text style={styles.description}>Signed in as: {user?.email}</Text>
          <TouchableOpacity
            onPress={handleSignOut}
            style={[styles.primaryButton, { backgroundColor: "#F44336" }]}
          >
            <Text style={styles.buttonText}>🚪 Sign Out</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Logs */}
      {logs.length > 0 && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>📋 Activity Logs</Text>
          <ScrollView style={styles.logsContainer}>
            {logs.map((log, index) => (
              <Text key={index} style={styles.logText}>
                {log}
              </Text>
            ))}
          </ScrollView>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f5f5f5",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#666",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
    color: "#333",
  },
  card: {
    backgroundColor: "white",
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 10,
    color: "#333",
  },
  description: {
    fontSize: 14,
    color: "#666",
    marginBottom: 15,
  },
  statusText: {
    fontSize: 14,
    marginBottom: 4,
    color: "#333",
  },
  primaryButton: {
    backgroundColor: "#007AFF",
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
  },
  disabledButton: {
    backgroundColor: "#ccc",
  },
  buttonText: {
    color: "white",
    textAlign: "center",
    fontWeight: "600",
    fontSize: 16,
  },
  userButton: {
    borderWidth: 1,
    borderColor: "#ddd",
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  userButtonTitle: {
    fontWeight: "600",
    fontSize: 16,
    color: "#333",
  },
  userButtonEmail: {
    color: "#666",
    fontSize: 14,
    marginTop: 2,
  },
  userButtonDescription: {
    color: "#888",
    fontSize: 12,
    marginTop: 2,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
    fontSize: 16,
    backgroundColor: "#fafafa",
  },
  statusContainer: {
    marginTop: 15,
  },
  statusTitle: {
    fontWeight: "600",
    marginBottom: 8,
    color: "#333",
  },
  statusItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  statusItemText: {
    fontSize: 12,
    color: "#666",
    flex: 1,
  },
  logsContainer: {
    backgroundColor: "#f8f8f8",
    padding: 10,
    borderRadius: 5,
    maxHeight: 200,
  },
  logText: {
    fontSize: 12,
    fontFamily: "monospace",
    marginBottom: 2,
    color: "#333",
  },
});
