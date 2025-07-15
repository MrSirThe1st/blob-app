// src/components/tasks/EmptyTasksState.tsx
import React from "react";
import { View, Text, StyleSheet } from "react-native";
import {
  Colors,
  Typography,
  Spacing,
  BorderRadius,
  Padding,
} from "@/constants";

const EmptyTasksState: React.FC = () => (
  <View style={styles.emptyState}>
    <View style={styles.emptyCard}>
      <Text style={styles.emptyStateTitle}>No tasks for today</Text>
      <Text style={styles.emptyStateSubtitle}>
        Great! You're all caught up. Add a new task or take a well-deserved
        break.
      </Text>
    </View>
  </View>
);

const styles = StyleSheet.create({
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: Spacing.xl,
    marginTop: Spacing.xl,
  },
  emptyCard: {
    backgroundColor: Colors.background.card,
    padding: Padding.card.large,
    borderRadius: BorderRadius.blob.medium,
    alignItems: "center",
    width: "100%",
  },
  emptyStateTitle: {
    ...Typography.h3,
    color: Colors.text.primary,
    textAlign: "center",
    marginBottom: Spacing.md,
  },
  emptyStateSubtitle: {
    ...Typography.bodyMedium,
    color: Colors.text.secondary,
    textAlign: "center",
    lineHeight: 22,
  },
});

export default EmptyTasksState;
