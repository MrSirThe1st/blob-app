// src/components/ai/TaskGenerationTestComponent.tsx
/**
 * Test component for onboarding task generation
 * Add this to any screen to test the task generation system
 */

import { useOnboardingTaskGeneration } from "@/hooks/useOnboardingTaskGeneration";
import React from "react";
import { Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export const TaskGenerationTestComponent: React.FC = () => {
  const {
    loading,
    error,
    lastResult,
    generateInitialTasks,
    canGenerateTasks,
    clearError,
    tasksGenerated,
    recommendations,
  } = useOnboardingTaskGeneration();

  const handleGenerateTasks = async () => {
    const canGenerate = await canGenerateTasks();

    if (!canGenerate) {
      Alert.alert(
        "No Onboarding Data",
        "Complete onboarding first to generate personalized tasks.",
        [{ text: "OK" }]
      );
      return;
    }

    const result = await generateInitialTasks("1_week");

    if (result) {
      Alert.alert(
        "Tasks Generated!",
        `Successfully generated ${result.tasksGenerated} personalized tasks. Check your Today screen to see them.`,
        [{ text: "Great!" }]
      );
    } else if (error) {
      Alert.alert("Error", error, [{ text: "OK", onPress: clearError }]);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🤖 AI Task Generation</Text>
      <Text style={styles.subtitle}>
        Generate personalized tasks from your onboarding data
      </Text>

      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity onPress={clearError} style={styles.clearButton}>
            <Text style={styles.clearButtonText}>Clear</Text>
          </TouchableOpacity>
        </View>
      )}

      {lastResult && (
        <View style={styles.resultContainer}>
          <Text style={styles.resultTitle}>✅ Last Generation Result:</Text>
          <Text style={styles.resultText}>
            Tasks Generated: {tasksGenerated}
          </Text>
          {recommendations.length > 0 && (
            <>
              <Text style={styles.recommendationsTitle}>
                💡 Recommendations:
              </Text>
              {recommendations.map((rec: string, index: number) => (
                <Text key={index} style={styles.recommendationText}>
                  • {rec}
                </Text>
              ))}
            </>
          )}
        </View>
      )}

      <TouchableOpacity
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={handleGenerateTasks}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading ? "Generating Tasks..." : "Generate Initial Tasks"}
        </Text>
      </TouchableOpacity>

      <Text style={styles.helpText}>
        This will analyze your onboarding conversation and create personalized
        tasks
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#FAF8F4",
    padding: 16,
    margin: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E4E4E4",
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#171717",
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 14,
    color: "#737373",
    textAlign: "center",
    marginBottom: 16,
  },
  button: {
    backgroundColor: "#EB6423",
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 12,
  },
  buttonDisabled: {
    backgroundColor: "#A1A1A1",
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  helpText: {
    fontSize: 12,
    color: "#737373",
    textAlign: "center",
  },
  errorContainer: {
    backgroundColor: "#ffebee",
    padding: 12,
    borderRadius: 6,
    marginBottom: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  errorText: {
    fontSize: 12,
    color: "#c62828",
    flex: 1,
  },
  clearButton: {
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  clearButtonText: {
    fontSize: 12,
    color: "#c62828",
    fontWeight: "bold",
  },
  resultContainer: {
    backgroundColor: "#e8f5e8",
    padding: 12,
    borderRadius: 6,
    marginBottom: 16,
  },
  resultTitle: {
    fontSize: 12,
    color: "#2e7d32",
    fontWeight: "bold",
    marginBottom: 4,
  },
  resultText: {
    fontSize: 12,
    color: "#2e7d32",
    marginBottom: 4,
  },
  recommendationsTitle: {
    fontSize: 12,
    color: "#2e7d32",
    fontWeight: "bold",
    marginTop: 4,
    marginBottom: 4,
  },
  recommendationText: {
    fontSize: 12,
    color: "#2e7d32",
    marginLeft: 12,
  },
});

export default TaskGenerationTestComponent;
