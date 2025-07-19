// src/screens/workout/WorkoutExecutionScreen.tsx
import { BorderRadius, Colors, Spacing, Typography } from "@/constants";
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface WorkoutExecutionScreenProps {
  visible: boolean;
  onClose: () => void;
  task: any;
}

interface ExerciseSet {
  id: string;
  reps: string;
  weight: string;
  completed: boolean;
  restTime: string;
}

const WorkoutExecutionScreen: React.FC<WorkoutExecutionScreenProps> = ({
  visible,
  onClose,
  task,
}) => {
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [exercises, setExercises] = useState<any[]>([]);
  const [currentSet, setCurrentSet] = useState(0);
  const [restTimer, setRestTimer] = useState(0);
  const [isResting, setIsResting] = useState(false);
  const [timerActive, setTimerActive] = useState(false);

  useEffect(() => {
    if (task?.workoutData?.exercises) {
      // Initialize exercises with set tracking
      const initializedExercises = task.workoutData.exercises.map(
        (exercise: any) => ({
          ...exercise,
          sets: Array.from({ length: exercise.sets }, (_, index) => ({
            id: `${exercise.id}-set-${index + 1}`,
            reps: exercise.reps,
            weight: exercise.weight,
            completed: false,
            restTime: exercise.restTime,
          })),
        })
      );
      setExercises(initializedExercises);
    }
  }, [task]);

  const currentExercise = exercises[currentExerciseIndex];

  // Rest timer countdown
  useEffect(() => {
    let interval: any;
    if (timerActive && restTimer > 0) {
      interval = setInterval(() => {
        setRestTimer((prev) => {
          if (prev <= 1) {
            setTimerActive(false);
            setIsResting(false);
            // Auto-advance to next set
            const nextIncompleteSet = currentExercise?.sets.findIndex(
              (set: any, index: number) => !set.completed && index > currentSet
            );

            if (nextIncompleteSet !== -1) {
              setCurrentSet(nextIncompleteSet);
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timerActive, restTimer, currentExercise, currentSet]);

  const parseRestTime = (restTimeStr: string): number => {
    // Parse rest time like "2-3 min", "90 sec", etc.
    const match = restTimeStr.match(/(\d+)/);
    if (!match) return 90; // default 90 seconds

    const time = parseInt(match[1]);
    if (restTimeStr.includes("min")) {
      return time * 60;
    }
    return time;
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleSetComplete = (setIndex: number) => {
    if (!currentExercise) return;

    const updatedExercises = [...exercises];
    updatedExercises[currentExerciseIndex].sets[setIndex].completed = true;
    setExercises(updatedExercises);

    // Start rest timer if not the last set
    const isLastSet = setIndex === currentExercise.sets.length - 1;
    if (!isLastSet) {
      const restTimeSeconds = parseRestTime(currentExercise.restTime);
      setRestTimer(restTimeSeconds);
      setIsResting(true);
      setTimerActive(true);
    } else {
      // Move to next exercise
      handleNextExercise();
    }
  };

  const handleNextExercise = () => {
    if (currentExerciseIndex < exercises.length - 1) {
      setCurrentExerciseIndex((prev) => prev + 1);
      setCurrentSet(0);
      setIsResting(false);
      setTimerActive(false);
      setRestTimer(0);
    } else {
      // Workout complete
      onClose();
    }
  };

  const handlePreviousExercise = () => {
    if (currentExerciseIndex > 0) {
      setCurrentExerciseIndex((prev) => prev - 1);
      setCurrentSet(0);
      setIsResting(false);
      setTimerActive(false);
      setRestTimer(0);
    }
  };

  if (!visible || !currentExercise) return null;

  return (
    <SafeAreaView style={styles.container}>
      {/* Header with navigation */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.navButton}
          onPress={handlePreviousExercise}
          disabled={currentExerciseIndex === 0}
        >
          <Ionicons
            name="chevron-back"
            size={24}
            color={
              currentExerciseIndex === 0
                ? Colors.neutral[300]
                : Colors.primary.main
            }
          />
        </TouchableOpacity>

        <View style={styles.exerciseTitle}>
          <Text style={styles.exerciseName}>{currentExercise.name}</Text>
          <Text style={styles.exerciseCounter}>
            {currentExerciseIndex + 1} of {exercises.length}
          </Text>
        </View>

        <TouchableOpacity
          style={styles.navButton}
          onPress={handleNextExercise}
          disabled={currentExerciseIndex === exercises.length - 1}
        >
          <Ionicons
            name="chevron-forward"
            size={24}
            color={
              currentExerciseIndex === exercises.length - 1
                ? Colors.neutral[300]
                : Colors.primary.main
            }
          />
        </TouchableOpacity>
      </View>

      {/* Close button */}
      <TouchableOpacity style={styles.closeButton} onPress={onClose}>
        <Ionicons name="close" size={24} color={Colors.text.secondary} />
      </TouchableOpacity>

      {/* Rest Timer (when active) */}
      {isResting && (
        <View style={styles.restTimerContainer}>
          <Text style={styles.restLabel}>Rest</Text>
          <Text style={styles.restTimer}>{formatTime(restTimer)}</Text>
        </View>
      )}

      {/* Sets List */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.setsList}>
          {currentExercise.sets.map((set: any, index: number) => {
            const isCompleted = set.completed;
            const isNext = !isCompleted && index === currentSet;

            return (
              <TouchableOpacity
                key={set.id}
                style={[
                  styles.setItem,
                  isCompleted && styles.completedSet,
                  isNext && styles.nextSet,
                ]}
                onPress={() => !isCompleted && handleSetComplete(index)}
                disabled={isCompleted}
              >
                <View style={styles.setLeft}>
                  <View style={styles.setNumber}>
                    {isCompleted ? (
                      <Ionicons
                        name="checkmark"
                        size={16}
                        color={Colors.success.main}
                      />
                    ) : (
                      <Text style={styles.setNumberText}>{index + 1}</Text>
                    )}
                  </View>
                  <Text
                    style={[
                      styles.setDetails,
                      isCompleted && styles.completedText,
                    ]}
                  >
                    {set.reps} Reps/{currentExercise.name}
                  </Text>
                </View>

                <View style={styles.setRight}>
                  {!isCompleted && index !== currentSet ? (
                    <View style={styles.pendingIndicator}>
                      <Ionicons
                        name="time-outline"
                        size={16}
                        color={Colors.text.secondary}
                      />
                    </View>
                  ) : !isCompleted ? (
                    <Text style={styles.restTime}>
                      Rest / {formatTime(parseRestTime(set.restTime))}
                    </Text>
                  ) : (
                    <Text style={styles.restTime}>
                      Rest / {formatTime(parseRestTime(set.restTime))}
                    </Text>
                  )}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Exercise Notes */}
        {currentExercise.notes && (
          <View style={styles.notesContainer}>
            <Text style={styles.notesTitle}>Notes</Text>
            <Text style={styles.notesText}>{currentExercise.notes}</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.primary,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral[200],
  },
  navButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  exerciseTitle: {
    flex: 1,
    alignItems: "center",
  },
  exerciseName: {
    ...Typography.h2,
    color: "#FF6B35", // Orange color from screenshot
    fontWeight: "600",
    textAlign: "center",
  },
  exerciseCounter: {
    ...Typography.captionMedium,
    color: Colors.text.secondary,
    marginTop: Spacing.xs,
  },
  closeButton: {
    position: "absolute",
    top: 60,
    right: Spacing.lg,
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.background.secondary,
    borderRadius: 20,
    zIndex: 1,
  },
  restTimerContainer: {
    alignItems: "center",
    paddingVertical: Spacing.xl,
    backgroundColor: Colors.warning.main + "10",
    marginHorizontal: Spacing.lg,
    marginTop: Spacing.md,
    borderRadius: BorderRadius.lg,
  },
  restLabel: {
    ...Typography.bodyLarge,
    color: Colors.warning.main,
    fontWeight: "600",
  },
  restTimer: {
    ...Typography.h1,
    color: Colors.warning.main,
    fontWeight: "700",
    marginTop: Spacing.xs,
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
  },
  setsList: {
    paddingVertical: Spacing.lg,
  },
  setItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#FFFFFA",
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: "#E4E4E4",
  },
  completedSet: {
    backgroundColor: Colors.success.main + "10",
    borderColor: Colors.success.main + "30",
  },
  nextSet: {
    borderColor: Colors.primary.main,
    borderWidth: 2,
  },
  setLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  setNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.neutral[100],
    marginRight: Spacing.md,
  },
  setNumberText: {
    ...Typography.bodyMedium,
    color: Colors.text.primary,
    fontWeight: "600",
  },
  setDetails: {
    ...Typography.bodyLarge,
    color: Colors.text.primary,
    fontWeight: "500",
  },
  completedText: {
    color: Colors.success.main,
    textDecorationLine: "line-through",
  },
  setRight: {
    alignItems: "flex-end",
  },
  restTime: {
    ...Typography.bodyMedium,
    color: Colors.text.secondary,
  },
  pendingIndicator: {
    opacity: 0.5,
  },
  notesContainer: {
    backgroundColor: Colors.background.secondary,
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    marginTop: Spacing.md,
    marginBottom: Spacing.xl,
  },
  notesTitle: {
    ...Typography.bodyLarge,
    color: Colors.text.primary,
    fontWeight: "600",
    marginBottom: Spacing.sm,
  },
  notesText: {
    ...Typography.bodyMedium,
    color: Colors.text.secondary,
    lineHeight: 20,
  },
});

export default WorkoutExecutionScreen;
