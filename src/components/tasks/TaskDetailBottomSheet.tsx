// src/components/tasks/TaskDetailBottomSheet.tsx
import { BorderRadius, Colors, Spacing, Typography } from "@/constants";
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useRef, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import RBSheet from "react-native-raw-bottom-sheet";

interface TaskDetailBottomSheetProps {
  visible: boolean;
  onClose: () => void;
  task: any;
  onMarkCompleted?: () => void;
}

const TaskDetailBottomSheet: React.FC<TaskDetailBottomSheetProps> = ({
  visible,
  onClose,
  task,
}) => {
  const refRBSheet = useRef<any>(null);

  useEffect(() => {
    if (visible) {
      refRBSheet.current?.open();
    } else {
      refRBSheet.current?.close();
    }
  }, [visible]);

  if (!task) return null;

  const renderWorkoutDetails = () => {
    if (!task.workoutData) return null;

    const { workoutData } = task;

    return (
      <View style={styles.workoutSection}>
        <Text style={styles.sectionTitle}>Workout Details</Text>

        {/* Workout Overview */}
        <View style={styles.workoutOverview}>
          <View style={styles.overviewItem}>
            <Ionicons name="fitness" size={16} color={Colors.primary.main} />
            <Text style={styles.overviewText}>
              {workoutData.type} • {workoutData.category}
            </Text>
          </View>
          <View style={styles.overviewItem}>
            <Ionicons name="time" size={16} color={Colors.primary.main} />
            <Text style={styles.overviewText}>
              {workoutData.totalDuration} minutes
            </Text>
          </View>
          <View style={styles.overviewItem}>
            <Ionicons name="flame" size={16} color={Colors.primary.main} />
            <Text style={styles.overviewText}>
              ~{workoutData.estimatedCalories} calories
            </Text>
          </View>
          <View style={styles.overviewItem}>
            <Ionicons
              name="trending-up"
              size={16}
              color={Colors.primary.main}
            />
            <Text style={styles.overviewText}>{workoutData.difficulty}</Text>
          </View>
        </View>

        {/* Target Muscles */}
        <View style={styles.muscleSection}>
          <Text style={styles.subSectionTitle}>Target Muscles</Text>
          <View style={styles.muscleList}>
            {workoutData.targetMuscles.map((muscle: string, index: number) => (
              <View key={index} style={styles.muscleTag}>
                <Text style={styles.muscleText}>{muscle}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Equipment */}
        <View style={styles.equipmentSection}>
          <Text style={styles.subSectionTitle}>Equipment Needed</Text>
          <View style={styles.equipmentList}>
            {workoutData.equipment.map((item: string, index: number) => (
              <View key={index} style={styles.equipmentItem}>
                <Ionicons
                  name="hardware-chip"
                  size={14}
                  color={Colors.text.secondary}
                />
                <Text style={styles.equipmentText}>{item}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Warmup */}
        <View style={styles.routineSection}>
          <Text style={styles.subSectionTitle}>
            Warmup ({workoutData.warmup.duration} min)
          </Text>
          {workoutData.warmup.exercises.map(
            (exercise: string, index: number) => (
              <Text key={index} style={styles.routineItem}>
                • {exercise}
              </Text>
            )
          )}
        </View>

        {/* Exercises */}
        <View style={styles.exercisesSection}>
          <Text style={styles.subSectionTitle}>Exercises</Text>
          {workoutData.exercises.map((exercise: any, index: number) => (
            <View key={exercise.id} style={styles.exerciseCard}>
              <View style={styles.exerciseHeader}>
                <Text style={styles.exerciseName}>{exercise.name}</Text>
                <View style={styles.exerciseProgress}>
                  <Text style={styles.progressText}>
                    {exercise.setsCompleted}/{exercise.sets}
                  </Text>
                </View>
              </View>
              <View style={styles.exerciseDetails}>
                <Text style={styles.exerciseInfo}>
                  {exercise.sets} sets × {exercise.reps} reps
                </Text>
                <Text style={styles.exerciseInfo}>
                  Weight: {exercise.weight}
                </Text>
                <Text style={styles.exerciseInfo}>
                  Rest: {exercise.restTime}
                </Text>
              </View>
              {exercise.notes && (
                <Text style={styles.exerciseNotes}>Note: {exercise.notes}</Text>
              )}
            </View>
          ))}
        </View>

        {/* Cooldown */}
        <View style={styles.routineSection}>
          <Text style={styles.subSectionTitle}>
            Cooldown ({workoutData.cooldown.duration} min)
          </Text>
          {workoutData.cooldown.exercises.map(
            (exercise: string, index: number) => (
              <Text key={index} style={styles.routineItem}>
                • {exercise}
              </Text>
            )
          )}
        </View>
      </View>
    );
  };

  const renderBasicTaskDetails = () => {
    return (
      <View style={styles.basicSection}>
        <Text style={styles.sectionTitle}>Task Details</Text>

        <View style={styles.detailRow}>
          <Ionicons
            name="time-outline"
            size={18}
            color={Colors.text.secondary}
          />
          <Text style={styles.detailLabel}>Scheduled Time:</Text>
          <Text style={styles.detailValue}>{task.suggested_time_slot}</Text>
        </View>

        <View style={styles.detailRow}>
          <Ionicons
            name="hourglass-outline"
            size={18}
            color={Colors.text.secondary}
          />
          <Text style={styles.detailLabel}>Duration:</Text>
          <Text style={styles.detailValue}>
            {task.estimated_duration} minutes
          </Text>
        </View>

        <View style={styles.detailRow}>
          <Ionicons
            name="flag-outline"
            size={18}
            color={Colors.text.secondary}
          />
          <Text style={styles.detailLabel}>Type:</Text>
          <Text style={styles.detailValue}>{task.type}</Text>
        </View>

        <View style={styles.detailRow}>
          <Ionicons
            name="checkmark-circle-outline"
            size={18}
            color={Colors.text.secondary}
          />
          <Text style={styles.detailLabel}>Status:</Text>
          <Text
            style={[styles.detailValue, { color: getStatusColor(task.status) }]}
          >
            {task.status}
          </Text>
        </View>
      </View>
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return Colors.success.main;
      case "in_progress":
        return Colors.warning.main;
      case "pending":
        return Colors.text.secondary;
      default:
        return Colors.text.secondary;
    }
  };

  return (
    <RBSheet
      ref={refRBSheet}
      closeOnPressMask={true}
      onClose={onClose}
      customStyles={{
        wrapper: {
          backgroundColor: "rgba(0, 0, 0, 0.5)",
        },
        container: {
          backgroundColor: Colors.background.card,
          borderTopLeftRadius: BorderRadius.xl,
          borderTopRightRadius: BorderRadius.xl,
          paddingBottom: Spacing.xl,
        },
        draggableIcon: {
          backgroundColor: Colors.neutral[300],
          width: 36,
          height: 4,
        },
      }}
      height={600}
    >
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.taskTitle} numberOfLines={2}>
            {task.title}
          </Text>
        </View>

        {/* Basic Task Details */}
        {renderBasicTaskDetails()}

        {/* Workout Details (if it's a workout task) */}
        {renderWorkoutDetails()}

        {/* Action Button */}
        <TouchableOpacity style={styles.actionButton} onPress={onClose}>
          <Text style={styles.actionButtonText}>Close</Text>
        </TouchableOpacity>
      </ScrollView>
    </RBSheet>
  );
};

const styles = StyleSheet.create({
  content: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
  },
  header: {
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral[200],
    marginBottom: Spacing.lg,
  },
  taskTitle: {
    ...Typography.h2,
    color: Colors.text.primary,
    fontWeight: "600",
    textAlign: "center",
  },
  basicSection: {
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    ...Typography.h3,
    color: Colors.text.primary,
    fontWeight: "600",
    marginBottom: Spacing.md,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral[100],
  },
  detailLabel: {
    ...Typography.bodyMedium,
    color: Colors.text.secondary,
    marginLeft: Spacing.sm,
    flex: 1,
  },
  detailValue: {
    ...Typography.bodyMedium,
    color: Colors.text.primary,
    fontWeight: "500",
  },
  workoutSection: {
    marginBottom: Spacing.xl,
  },
  workoutOverview: {
    backgroundColor: Colors.background.secondary,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.lg,
  },
  overviewItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.sm,
  },
  overviewText: {
    ...Typography.bodyMedium,
    color: Colors.text.primary,
    marginLeft: Spacing.sm,
    fontWeight: "500",
  },
  subSectionTitle: {
    ...Typography.bodyLarge,
    color: Colors.text.primary,
    fontWeight: "600",
    marginBottom: Spacing.sm,
  },
  muscleSection: {
    marginBottom: Spacing.lg,
  },
  muscleList: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
  },
  muscleTag: {
    backgroundColor: Colors.primary.main + "20",
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.md,
  },
  muscleText: {
    ...Typography.captionMedium,
    color: Colors.primary.main,
    fontWeight: "500",
  },
  equipmentSection: {
    marginBottom: Spacing.lg,
  },
  equipmentList: {
    gap: Spacing.xs,
  },
  equipmentItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  equipmentText: {
    ...Typography.bodyMedium,
    color: Colors.text.secondary,
    marginLeft: Spacing.sm,
  },
  routineSection: {
    marginBottom: Spacing.lg,
  },
  routineItem: {
    ...Typography.bodyMedium,
    color: Colors.text.secondary,
    marginBottom: Spacing.xs,
    marginLeft: Spacing.sm,
  },
  exercisesSection: {
    marginBottom: Spacing.lg,
  },
  exerciseCard: {
    backgroundColor: Colors.background.secondary,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    borderLeftWidth: 3,
    borderLeftColor: Colors.primary.main,
  },
  exerciseHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.sm,
  },
  exerciseName: {
    ...Typography.bodyLarge,
    color: Colors.text.primary,
    fontWeight: "600",
    flex: 1,
  },
  exerciseProgress: {
    backgroundColor: Colors.primary.main + "20",
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.sm,
  },
  progressText: {
    ...Typography.captionMedium,
    color: Colors.primary.main,
    fontWeight: "600",
  },
  exerciseDetails: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: Spacing.sm,
  },
  exerciseInfo: {
    ...Typography.captionMedium,
    color: Colors.text.secondary,
  },
  exerciseNotes: {
    ...Typography.captionMedium,
    color: Colors.text.muted,
    fontStyle: "italic",
  },
  actionButton: {
    backgroundColor: Colors.primary.main,
    borderRadius: BorderRadius.lg,
    paddingVertical: Spacing.md,
    alignItems: "center",
    marginTop: Spacing.lg,
  },
  actionButtonText: {
    ...Typography.bodyLarge,
    color: Colors.text.onPrimary,
    fontWeight: "600",
  },
});

export default TaskDetailBottomSheet;
