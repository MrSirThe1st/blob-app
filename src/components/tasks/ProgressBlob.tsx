// src/components/tasks/ProgressBlob.tsx
import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Colors, Typography, Spacing, BorderRadius } from "@/constants";

interface ProgressBlobProps {
  completed: number;
  total: number;
}

const ProgressBlob: React.FC<ProgressBlobProps> = ({ completed, total }) => {
  const progress = total > 0 ? (completed / total) * 100 : 0;

  return (
    <View style={styles.progressBlob}>
      <View style={styles.progressBlobContainer}>
        <View
          style={[
            styles.progressBlobFill,
            { width: `${Math.min(progress, 100)}%` },
          ]}
        />
      </View>
      <Text style={styles.progressText}>
        {completed}/{total} tasks
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  progressBlob: {
    alignItems: "center",
  },
  progressBlobContainer: {
    width: 80,
    height: 24,
    backgroundColor: Colors.background.secondary,
    borderRadius: BorderRadius.blob.medium,
    overflow: "hidden",
  },
  progressBlobFill: {
    height: "100%",
    backgroundColor: Colors.primary.main,
    borderRadius: BorderRadius.blob.medium,
  },
  progressText: {
    ...Typography.captionSmall,
    color: Colors.text.muted,
    marginTop: Spacing.xs,
  },
});

export default ProgressBlob;
