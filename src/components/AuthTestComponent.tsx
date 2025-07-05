import React, { useState } from "react";
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

export default function AuthTestComponent() {
  const {
    user,
    userProfile,
    isLoading,
    isAuthenticated,
    signUp,
    signIn,
    signOut,
  } = useAuth();

  const [creationStatus, setCreationStatus] = useState({});
  const [isCreatingUsers, setIsCreatingUsers] = useState(false);
  const [logs, setLogs] = useState([]);

  const addLog = (message, type = "info") => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs((prev) => [...prev, { message, type, timestamp }]);
  };

  const createSingleUser = async (userData) => {
    const { email, password, fullName, description } = userData;

    try {
      addLog(`Creating user: ${email}`, "info");
      setCreationStatus((prev) => ({ ...prev, [email]: "creating" }));

      const { error } = await signUp(email, password, fullName);

      if (error) {
        addLog(`❌ Failed to create ${email}: ${error.message}`, "error");
        setCreationStatus((prev) => ({ ...prev, [email]: "error" }));
        return { success: false, error };
      }

      addLog(`✅ Successfully created: ${email}`, "success");
      setCreationStatus((prev) => ({ ...prev, [email]: "success" }));
      return { success: true };
    } catch (err) {
      addLog(`❌ Exception creating ${email}: ${err.message}`, "error");
      setCreationStatus((prev) => ({ ...prev, [email]: "error" }));
      return { success: false, error: err };
    }
  };

  const createAllDemoUsers = async () => {
    setIsCreatingUsers(true);
    setLogs([]);
    setCreationStatus({});

    addLog("🚀 Starting demo user creation...", "info");

    for (const userData of DEMO_USERS) {
      await createSingleUser(userData);
      // Small delay between creations to avoid rate limiting
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    addLog("✅ Demo user creation process complete!", "success");
    setIsCreatingUsers(false);
  };

  const signInAsUser = async (email, password) => {
    try {
      addLog(`Signing in as: ${email}`, "info");
      const { error } = await signIn(email, password);

      if (error) {
        addLog(`❌ Sign in failed: ${error.message}`, "error");
        return;
      }

      addLog(`✅ Successfully signed in as: ${email}`, "success");
    } catch (err) {
      addLog(`❌ Sign in exception: ${err.message}`, "error");
    }
  };

  const handleSignOut = async () => {
    try {
      const { error } = await signOut();
      if (error) {
        addLog(`❌ Sign out failed: ${error.message}`, "error");
      } else {
        addLog("✅ Successfully signed out", "success");
      }
    } catch (err) {
      addLog(`❌ Sign out exception: ${err.message}`, "error");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading authentication...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          🧪 Authentication Test Center
        </h1>
        <p className="text-gray-600 mb-6">
          Create and test demo users for your Blob AI app
        </p>

        {/* Current Auth Status */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <h3 className="text-lg font-semibold mb-2">Current Status</h3>
          <div className="space-y-2">
            <p>
              <strong>Authenticated:</strong>
              <span
                className={`ml-2 px-2 py-1 rounded text-sm ${
                  isAuthenticated
                    ? "bg-green-100 text-green-800"
                    : "bg-red-100 text-red-800"
                }`}
              >
                {isAuthenticated ? "Yes" : "No"}
              </span>
            </p>
            {user && (
              <>
                <p>
                  <strong>User ID:</strong>{" "}
                  <code className="bg-gray-200 px-1 rounded">{user.id}</code>
                </p>
                <p>
                  <strong>Email:</strong> {user.email}
                </p>
                <p>
                  <strong>Created:</strong>{" "}
                  {new Date(user.created_at).toLocaleString()}
                </p>
              </>
            )}
            {userProfile && (
              <>
                <p>
                  <strong>Full Name:</strong> {userProfile.fullName}
                </p>
                <p>
                  <strong>Onboarding:</strong>{" "}
                  {userProfile.onboardingCompleted ? "Complete" : "Incomplete"}
                </p>
                <p>
                  <strong>XP:</strong> {userProfile.xpTotal}
                </p>
                <p>
                  <strong>Level:</strong> {userProfile.currentLevel}
                </p>
              </>
            )}
          </div>
        </div>

        {!isAuthenticated ? (
          <div className="space-y-6">
            {/* Create Demo Users Section */}
            <div className="border rounded-lg p-4">
              <h3 className="text-xl font-semibold mb-4">
                1. Create Demo Users
              </h3>
              <p className="text-gray-600 mb-4">
                Create test users with different profiles for development
                testing
              </p>

              <button
                onClick={createAllDemoUsers}
                disabled={isCreatingUsers}
                className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                  isCreatingUsers
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : "bg-blue-500 text-white hover:bg-blue-600"
                }`}
              >
                {isCreatingUsers
                  ? "⏳ Creating Users..."
                  : "🚀 Create All Demo Users"}
              </button>

              {/* User Creation Status */}
              {Object.keys(creationStatus).length > 0 && (
                <div className="mt-4 space-y-2">
                  <h4 className="font-medium">Creation Status:</h4>
                  {DEMO_USERS.map((user) => (
                    <div
                      key={user.email}
                      className="flex items-center space-x-2"
                    >
                      <span
                        className={`w-3 h-3 rounded-full ${
                          creationStatus[user.email] === "success"
                            ? "bg-green-500"
                            : creationStatus[user.email] === "error"
                              ? "bg-red-500"
                              : creationStatus[user.email] === "creating"
                                ? "bg-yellow-500"
                                : "bg-gray-300"
                        }`}
                      ></span>
                      <span className="text-sm">
                        {user.email} - {user.description}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Quick Sign In Section */}
            <div className="border rounded-lg p-4">
              <h3 className="text-xl font-semibold mb-4">2. Quick Sign In</h3>
              <p className="text-gray-600 mb-4">
                Sign in as different demo users to test various scenarios
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {DEMO_USERS.map((userData) => (
                  <button
                    key={userData.email}
                    onClick={() =>
                      signInAsUser(userData.email, userData.password)
                    }
                    className="p-3 border border-gray-300 rounded-lg hover:bg-gray-50 text-left transition-colors"
                  >
                    <div className="font-medium">{userData.fullName}</div>
                    <div className="text-sm text-gray-600">
                      {userData.email}
                    </div>
                    <div className="text-xs text-gray-500">
                      {userData.description}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Manual Sign In Section */}
            <div className="border rounded-lg p-4">
              <h3 className="text-xl font-semibold mb-4">3. Manual Sign In</h3>
              <ManualSignInForm signIn={signIn} addLog={addLog} />
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-green-800 mb-2">
                ✅ Successfully Authenticated!
              </h3>
              <p className="text-green-700">
                Signed in as: <strong>{user?.email}</strong>
              </p>
            </div>

            <button
              onClick={handleSignOut}
              className="px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
            >
              🚪 Sign Out
            </button>
          </div>
        )}

        {/* Logs Section */}
        {logs.length > 0 && (
          <div className="mt-6 border rounded-lg p-4">
            <h3 className="text-lg font-semibold mb-3">📋 Activity Logs</h3>
            <div className="bg-gray-50 rounded p-3 max-h-64 overflow-y-auto">
              {logs.map((log, index) => (
                <div key={index} className="flex items-start space-x-2 mb-1">
                  <span className="text-xs text-gray-500 font-mono">
                    {log.timestamp}
                  </span>
                  <span
                    className={`text-sm ${
                      log.type === "error"
                        ? "text-red-600"
                        : log.type === "success"
                          ? "text-green-600"
                          : "text-gray-700"
                    }`}
                  >
                    {log.message}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Manual sign in form component
function ManualSignInForm({ signIn, addLog }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSigningIn, setIsSigningIn] = useState(false);

  const handleSubmit = async () => {
    if (!email || !password) return;

    setIsSigningIn(true);
    try {
      const { error } = await signIn(email, password);
      if (error) {
        addLog(`❌ Manual sign in failed: ${error.message}`, "error");
      } else {
        addLog(`✅ Manual sign in successful: ${email}`, "success");
      }
    } catch (err) {
      addLog(`❌ Manual sign in exception: ${err.message}`, "error");
    } finally {
      setIsSigningIn(false);
    }
  };

  return (
    <div className="space-y-3">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Email
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Enter email address"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Password
        </label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Enter password"
        />
      </div>

      <button
        onClick={handleSubmit}
        disabled={isSigningIn || !email || !password}
        className={`w-full py-2 px-4 rounded-md font-medium transition-colors ${
          isSigningIn || !email || !password
            ? "bg-gray-300 text-gray-500 cursor-not-allowed"
            : "bg-blue-500 text-white hover:bg-blue-600"
        }`}
      >
        {isSigningIn ? "Signing In..." : "Sign In"}
      </button>
    </div>
  );
}
