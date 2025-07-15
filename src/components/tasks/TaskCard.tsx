// src/components/tasks/TaskCard.tsx
import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import {
  Colors,
  Typography,
  Spacing,
  BorderRadius,
  Padding,
} from "@/constants";
import { Task } from "@/types/tasks";

interface TaskCardProps {
  task: Task;
  onComplete: () => void;
  onReschedule: () => void;
}

const TaskCard: React.FC<TaskCardProps> = ({
  task,
  onComplete,
  onReschedule,
}) => {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return Colors.error;
      case "medium":
        return Colors.warning;
      case "low":
        return Colors.success;
      default:
        return Colors.text.muted;
    }
  };

  const isCompleted = task.status === "completed";

  return (
    <View style={styles.taskCardContainer}>
      <TouchableOpacity
        style={[styles.taskCard, isCompleted && styles.completedTaskCard]}
      >
        {/* Priority Indicator */}
        <View
          style={[
            styles.priorityIndicator,
            { backgroundColor: getPriorityColor(task.priority) },
          ]}
        />

        {/* Task Content */}
        <View style={styles.taskContent}>
          <View style={styles.taskHeader}>
            <Text
              style={[
                styles.taskTitle,
                isCompleted && styles.completedTaskTitle,
              ]}
            >
              {task.title}
            </Text>

            {task.suggested_time_slot && (
              <View style={styles.timeSlot}>
                <Text style={styles.timeSlotText}>
                  {task.suggested_time_slot}
                </Text>
              </View>
            )}
          </View>

          {task.description && (
            <Text style={styles.taskDescription}>{task.description}</Text>
          )}

          {/* Task Meta Info */}
          <View style={styles.taskMeta}>
            {task.estimated_duration && (
              <View style={styles.metaItem}>
                <Text style={styles.metaText}>
                  {task.estimated_duration} min
                </Text>
              </View>
            )}

            {task.energy_level_required && (
              <View style={styles.metaItem}>
                <Text style={styles.metaText}>
                  {task.energy_level_required} energy
                </Text>
              </View>
            )}

            <View style={styles.metaItem}>
              <Text style={styles.metaText}>{task.priority} priority</Text>
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        {!isCompleted && (
          <View style={styles.taskActions}>
            <TouchableOpacity
              style={[styles.actionButton, styles.completeButton]}
              onPress={onComplete}
            >
              <Text style={styles.completeButtonText}>✓</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, styles.rescheduleButton]}
              onPress={onReschedule}
            >
              <Text style={styles.rescheduleButtonText}>⏰</Text>
            </TouchableOpacity>
          </View>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  taskCardContainer: {
    marginBottom: Spacing.md,
  },
  taskCard: {
    backgroundColor: Colors.background.card,
    borderRadius: BorderRadius.blob.medium,
    padding: Padding.card.medium,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  completedTaskCard: {
    opacity: 0.6,
  },
  priorityIndicator: {
    width: 4,
    height: "100%",
    borderRadius: BorderRadius.sm,
    marginRight: Spacing.md,
    minHeight: 60,
  },
  taskContent: {
    flex: 1,
  },
  taskHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: Spacing.xs,
  },
  taskTitle: {
    ...Typography.bodyLarge,
    color: Colors.text.primary,
    flex: 1,
  },
  completedTaskTitle: {
    textDecorationLine: "line-through",
    color: Colors.text.muted,
  },
  timeSlot: {
    backgroundColor: Colors.background.secondary,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.sm,
    marginLeft: Spacing.sm,
  },
  timeSlotText: {
    ...Typography.captionSmall,
    color: Colors.text.muted,
  },
  taskDescription: {
    ...Typography.bodySmall,
    color: Colors.text.secondary,
    marginBottom: Spacing.sm,
  },
  taskMeta: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
  },
  metaItem: {
    backgroundColor: Colors.background.secondary,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.sm,
  },
  metaText: {
    ...Typography.captionSmall,
    color: Colors.text.muted,
  },
  taskActions: {
    flexDirection: "row",
    gap: Spacing.sm,
    marginLeft: Spacing.sm,
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.md,
    alignItems: "center",
    justifyContent: "center",
  },
  completeButton: {
    backgroundColor: Colors.success,
  },
  completeButtonText: {
    color: Colors.text.onPrimary,
    fontSize: 18,
    fontWeight: "bold",
  },
  rescheduleButton: {
    backgroundColor: Colors.background.secondary,
  },
  rescheduleButtonText: {
    fontSize: 16,
  },
});

export default TaskCard;
