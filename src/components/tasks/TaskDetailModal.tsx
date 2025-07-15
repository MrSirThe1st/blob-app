// src/components/tasks/TaskDetailModal.tsx
import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Modal,
  TextInput,
  Alert,
} from "react-native";
import {
  Colors,
  Typography,
  Spacing,
  BorderRadius,
  Padding,
} from "@/constants";
import { Task, TaskStatus } from "@/types/tasks";

interface TaskDetailModalProps {
  task: Task | null;
  visible: boolean;
  onClose: () => void;
  onUpdate: (taskId: string, updates: Partial<Task>) => Promise<void>;
}

const TaskDetailModal: React.FC<TaskDetailModalProps> = ({
  task,
  visible,
  onClose,
  onUpdate,
}) => {
  const [taskStatus, setTaskStatus] = useState(
    task?.status || TaskStatus.PENDING
  );
  const [notes, setNotes] = useState("");

  if (!visible || !task) return null;

  const handleStatusUpdate = async (newStatus: string) => {
    try {
      setTaskStatus(newStatus);
      await onUpdate(task.id, { status: newStatus as any });
      Alert.alert("Success", "Task status updated!");
    } catch (error) {
      Alert.alert("Error", "Failed to update task status");
      setTaskStatus(task.status); // Revert on error
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <View style={styles.modalContainer}>
        {/* Modal Header */}
        <View style={styles.modalHeader}>
          <TouchableOpacity onPress={onClose}>
            <Text style={styles.modalCloseButton}>Close</Text>
          </TouchableOpacity>
          <Text style={styles.modalTitle}>Task Details</Text>
          <View style={{ width: 50 }} />
        </View>

        <ScrollView style={styles.modalContent}>
          {/* Task Title & Description */}
          <View style={styles.taskDetailSection}>
            <Text style={styles.taskDetailTitle}>{task.title}</Text>
            {task.description && (
              <Text style={styles.taskDetailDescription}>
                {task.description}
              </Text>
            )}
          </View>

          {/* AI Insights */}
          {task.context_requirements && (
            <View style={styles.aiInsightSection}>
              <Text style={styles.sectionTitle}>💡 AI Insights</Text>
              <View style={styles.insightCard}>
                <Text style={styles.insightText}>
                  {task.context_requirements}
                </Text>
              </View>
            </View>
          )}

          {/* Success Criteria */}
          {task.success_criteria && (
            <View style={styles.taskDetailSection}>
              <Text style={styles.sectionTitle}>🎯 Success Criteria</Text>
              <Text style={styles.successCriteria}>
                {task.success_criteria}
              </Text>
            </View>
          )}

          {/* Task Meta Information */}
          <View style={styles.taskDetailSection}>
            <Text style={styles.sectionTitle}>📊 Task Info</Text>
            <View style={styles.metaGrid}>
              <View style={styles.metaGridItem}>
                <Text style={styles.metaLabel}>Duration</Text>
                <Text style={styles.metaValue}>
                  {task.estimated_duration || "Not set"} min
                </Text>
              </View>
              <View style={styles.metaGridItem}>
                <Text style={styles.metaLabel}>Energy Level</Text>
                <Text style={styles.metaValue}>
                  {task.energy_level_required || "Any"}
                </Text>
              </View>
              <View style={styles.metaGridItem}>
                <Text style={styles.metaLabel}>Difficulty</Text>
                <Text style={styles.metaValue}>
                  {task.difficulty_level || 1}/5
                </Text>
              </View>
              <View style={styles.metaGridItem}>
                <Text style={styles.metaLabel}>Priority</Text>
                <Text style={styles.metaValue}>{task.priority}</Text>
              </View>
            </View>
          </View>

          {/* Status Update Buttons */}
          <View style={styles.taskDetailSection}>
            <Text style={styles.sectionTitle}>Status</Text>
            <View style={styles.statusButtons}>
              <TouchableOpacity
                style={[
                  styles.statusButton,
                  taskStatus === TaskStatus.PENDING &&
                    styles.activeStatusButton,
                ]}
                onPress={() => handleStatusUpdate(TaskStatus.PENDING)}
              >
                <Text
                  style={[
                    styles.statusButtonText,
                    taskStatus === TaskStatus.PENDING &&
                      styles.activeStatusButtonText,
                  ]}
                >
                  Pending
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.statusButton,
                  taskStatus === TaskStatus.IN_PROGRESS &&
                    styles.activeStatusButton,
                ]}
                onPress={() => handleStatusUpdate(TaskStatus.IN_PROGRESS)}
              >
                <Text
                  style={[
                    styles.statusButtonText,
                    taskStatus === TaskStatus.IN_PROGRESS &&
                      styles.activeStatusButtonText,
                  ]}
                >
                  In Progress
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.statusButton,
                  taskStatus === TaskStatus.COMPLETED &&
                    styles.activeStatusButton,
                ]}
                onPress={() => handleStatusUpdate(TaskStatus.COMPLETED)}
              >
                <Text
                  style={[
                    styles.statusButtonText,
                    taskStatus === TaskStatus.COMPLETED &&
                      styles.activeStatusButtonText,
                  ]}
                >
                  Completed
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Notes Section */}
          <View style={styles.taskDetailSection}>
            <Text style={styles.sectionTitle}>Notes</Text>
            <TextInput
              style={styles.notesInput}
              placeholder="Add notes about this task..."
              multiline
              value={notes}
              onChangeText={setNotes}
              placeholderTextColor={Colors.text.muted}
            />
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: Colors.background.primary,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.background.secondary,
  },
  modalCloseButton: {
    ...Typography.bodyMedium,
    color: Colors.primary.main,
  },
  modalTitle: {
    ...Typography.h3,
    color: Colors.text.primary,
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
  },
  taskDetailSection: {
    marginVertical: Spacing.lg,
  },
  taskDetailTitle: {
    ...Typography.h2,
    color: Colors.text.primary,
    marginBottom: Spacing.sm,
  },
  taskDetailDescription: {
    ...Typography.bodyMedium,
    color: Colors.text.secondary,
  },
  sectionTitle: {
    ...Typography.h4,
    color: Colors.text.primary,
    marginBottom: Spacing.md,
  },
  aiInsightSection: {
    marginVertical: Spacing.lg,
  },
  insightCard: {
    backgroundColor: Colors.background.card,
    padding: Padding.card.medium,
    borderRadius: BorderRadius.blob.medium,
    borderLeftWidth: 4,
    borderLeftColor: Colors.primary.main,
  },
  insightText: {
    ...Typography.bodyMedium,
    color: Colors.text.secondary,
    fontStyle: "italic",
  },
  successCriteria: {
    ...Typography.bodyMedium,
    color: Colors.text.secondary,
    backgroundColor: Colors.background.card,
    padding: Padding.card.medium,
    borderRadius: BorderRadius.md,
  },
  metaGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.md,
  },
  metaGridItem: {
    flex: 1,
    minWidth: "45%",
    backgroundColor: Colors.background.card,
    padding: Padding.card.small,
    borderRadius: BorderRadius.md,
  },
  metaLabel: {
    ...Typography.captionSmall,
    color: Colors.text.muted,
    marginBottom: Spacing.xs,
  },
  metaValue: {
    ...Typography.bodyMedium,
    color: Colors.text.primary,
    fontWeight: "bold",
  },
  statusButtons: {
    flexDirection: "row",
    gap: Spacing.sm,
  },
  statusButton: {
    flex: 1,
    paddingVertical: Padding.button.small.vertical,
    paddingHorizontal: Padding.button.small.horizontal,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.background.secondary,
    alignItems: "center",
  },
  activeStatusButton: {
    backgroundColor: Colors.primary.main,
  },
  statusButtonText: {
    ...Typography.bodySmall,
    color: Colors.text.muted,
  },
  activeStatusButtonText: {
    color: Colors.text.onPrimary,
  },
  notesInput: {
    backgroundColor: Colors.background.card,
    padding: Padding.card.medium,
    borderRadius: BorderRadius.md,
    minHeight: 100,
    textAlignVertical: "top",
    ...Typography.bodyMedium,
    color: Colors.text.primary,
  },
});

export default TaskDetailModal;
