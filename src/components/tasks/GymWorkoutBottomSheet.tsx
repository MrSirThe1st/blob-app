// src/components/tasks/GymWorkoutBottomSheet.tsx
import { BorderRadius, Colors, Spacing, Typography } from "@/constants";
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import RBSheet from "react-native-raw-bottom-sheet";

interface GymWorkoutBottomSheetProps {
  visible: boolean;
  onClose: () => void;
  task: any;
  onStartWorkout: (task: any) => void;
}

const GymWorkoutBottomSheet: React.FC<GymWorkoutBottomSheetProps> = ({
  visible,
  onClose,
  task,
  onStartWorkout,
}) => {
  const refRBSheet = useRef<any>(null);
  const scrollViewRef = useRef<ScrollView>(null);
  const [showScrollIndicator, setShowScrollIndicator] = useState(true);
  const [isScrolledToBottom, setIsScrolledToBottom] = useState(false);
  const scrollIndicatorOpacity = useRef(new Animated.Value(1)).current;

  // Workout execution state
  const [isExecuting, setIsExecuting] = useState(false);
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [exercises, setExercises] = useState<any[]>([]);
  const [currentSet, setCurrentSet] = useState(0);
  const [restTimer, setRestTimer] = useState(0);
  const [isResting, setIsResting] = useState(false);
  const [timerActive, setTimerActive] = useState(false);

  useEffect(() => {
    if (visible) {
      refRBSheet.current?.open();
      // Reset scroll indicator when modal opens
      setShowScrollIndicator(true);
      setIsScrolledToBottom(false);
      scrollIndicatorOpacity.setValue(1);
      // Reset workout execution state
      setIsExecuting(false);
      setCurrentExerciseIndex(0);
      setCurrentSet(0);
      setRestTimer(0);
      setIsResting(false);
      setTimerActive(false);
    } else {
      refRBSheet.current?.close();
    }
  }, [visible, scrollIndicatorOpacity]);

  // Initialize exercises when task changes
  useEffect(() => {
    if (task?.workoutData?.exercises) {
      const initializedExercises = task.workoutData.exercises.map(
        (exercise: any) => {
          // Create workout steps: Set 1, Rest 1, Set 2, Rest 2, Set 3, Rest 3, Set 4, Rest 4
          const workoutSteps = [];
          for (let i = 0; i < exercise.sets; i++) {
            // Add set
            workoutSteps.push({
              id: `${exercise.id}-set-${i + 1}`,
              type: "set",
              setNumber: i + 1,
              reps: exercise.reps,
              weight: exercise.weight,
              completed: false,
            });

            // Add rest period after every set (including the last one)
            workoutSteps.push({
              id: `${exercise.id}-rest-${i + 1}`,
              type: "rest",
              restTime: exercise.restTime,
              completed: false,
            });
          }

          return {
            ...exercise,
            workoutSteps,
          };
        }
      );
      setExercises(initializedExercises);
    }
  }, [task]);

  // Rest timer countdown
  useEffect(() => {
    let interval: any;
    if (timerActive && restTimer > 0) {
      interval = setInterval(() => {
        setRestTimer((prev) => {
          if (prev <= 1) {
            setTimerActive(false);
            setIsResting(false);

            // Mark current rest step as completed and move to next step
            const updatedExercises = [...exercises];
            const currentExerciseData = updatedExercises[currentExerciseIndex];
            if (currentExerciseData?.workoutSteps[currentSet]) {
              currentExerciseData.workoutSteps[currentSet].completed = true;
            }
            setExercises(updatedExercises);

            // Move to next step (should be a set or end of exercise)
            const nextStepIndex = currentSet + 1;
            if (nextStepIndex < currentExerciseData?.workoutSteps.length) {
              setCurrentSet(nextStepIndex);
            } else {
              // Exercise completed, move to next exercise
              const nextExerciseIndex = currentExerciseIndex + 1;
              if (nextExerciseIndex < exercises.length) {
                setCurrentExerciseIndex(nextExerciseIndex);
                setCurrentSet(0);
              } else {
                // Workout completed
                setIsExecuting(false);
                onClose();
              }
            }

            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [
    timerActive,
    restTimer,
    exercises,
    currentExerciseIndex,
    currentSet,
    onClose,
  ]);

  if (!task || !task.workoutData) return null;

  const { workoutData } = task;
  const currentExercise = exercises[currentExerciseIndex];

  const parseRestTime = (restTimeStr: string): number => {
    const match = restTimeStr.match(/(\d+)/);
    if (!match) return 90;

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

  const handleSetComplete = () => {
    if (!currentExercise) return;

    const updatedExercises = [...exercises];
    const currentExerciseData = updatedExercises[currentExerciseIndex];
    const currentStep = currentExerciseData.workoutSteps[currentSet];

    if (currentStep?.type === "set") {
      // Mark current set as completed
      currentStep.completed = true;

      // Check if there's a next step (rest or next set)
      const nextStepIndex = currentSet + 1;

      if (nextStepIndex < currentExerciseData.workoutSteps.length) {
        const nextStep = currentExerciseData.workoutSteps[nextStepIndex];

        if (nextStep.type === "rest") {
          // Start rest period
          setCurrentSet(nextStepIndex);
          const restTimeSeconds = parseRestTime(nextStep.restTime);
          setRestTimer(restTimeSeconds);
          setIsResting(true);
          setTimerActive(true);

          // Mark rest as current (not completed yet, timer will handle that)
        } else {
          // Next step is a set (shouldn't happen in normal flow)
          setCurrentSet(nextStepIndex);
        }
      } else {
        // Exercise completed, move to next exercise
        const nextExerciseIndex = currentExerciseIndex + 1;
        if (nextExerciseIndex < exercises.length) {
          setCurrentExerciseIndex(nextExerciseIndex);
          setCurrentSet(0);
          setIsResting(false);
          setTimerActive(false);
          setRestTimer(0);
        } else {
          // Workout completed
          setIsExecuting(false);
          onClose();
        }
      }
    }

    setExercises(updatedExercises);
  };

  const handlePreviousExercise = () => {
    if (currentExerciseIndex > 0) {
      setCurrentExerciseIndex(currentExerciseIndex - 1);
      setCurrentSet(0);
      setIsResting(false);
      setTimerActive(false);
      setRestTimer(0);
    }
  };

  const handleNextExercise = () => {
    if (currentExerciseIndex < exercises.length - 1) {
      setCurrentExerciseIndex(currentExerciseIndex + 1);
      setCurrentSet(0);
      setIsResting(false);
      setTimerActive(false);
      setRestTimer(0);
    }
  };

  const handleStartWorkout = () => {
    setIsExecuting(true);
    setCurrentExerciseIndex(0);
    setCurrentSet(0);
  };

  const handleBackToOverview = () => {
    setIsExecuting(false);
    setCurrentExerciseIndex(0);
    setCurrentSet(0);
    setRestTimer(0);
    setIsResting(false);
    setTimerActive(false);
  };

  const handleScroll = (event: any) => {
    const { contentOffset, contentSize, layoutMeasurement } = event.nativeEvent;
    const scrollPosition = contentOffset.y;
    const scrollViewHeight = layoutMeasurement.height;
    const contentHeight = contentSize.height;

    // Check if scrolled near bottom (within 50px)
    const isNearBottom =
      scrollPosition + scrollViewHeight >= contentHeight - 50;

    if (isNearBottom && !isScrolledToBottom) {
      setIsScrolledToBottom(true);
      // Fade out the scroll indicator
      Animated.timing(scrollIndicatorOpacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else if (!isNearBottom && isScrolledToBottom) {
      setIsScrolledToBottom(false);
      // Fade in the scroll indicator
      Animated.timing(scrollIndicatorOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
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
      height={700}
    >
      <ScrollView
        ref={scrollViewRef}
        style={styles.content}
        showsVerticalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        {!isExecuting ? (
          // Workout Overview
          <>
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.workoutTitle} numberOfLines={2}>
                {task.title}
              </Text>
              <View style={styles.workoutMeta}>
                <View style={styles.metaItem}>
                  <Ionicons
                    name="time-outline"
                    size={16}
                    color={Colors.text.secondary}
                  />
                  <Text style={styles.metaText}>
                    {workoutData.totalDuration} min
                  </Text>
                </View>
                <View style={styles.metaItem}>
                  <Ionicons
                    name="flame-outline"
                    size={16}
                    color={Colors.text.secondary}
                  />
                  <Text style={styles.metaText}>
                    ~{workoutData.estimatedCalories} cal
                  </Text>
                </View>
                <View style={styles.metaItem}>
                  <Ionicons
                    name="trending-up-outline"
                    size={16}
                    color={Colors.text.secondary}
                  />
                  <Text style={styles.metaText}>{workoutData.difficulty}</Text>
                </View>
              </View>
            </View>

            {/* Exercise List */}
            <View style={styles.exercisesList}>
              {workoutData.exercises.map((exercise: any, index: number) => (
                <View key={exercise.id} style={styles.exerciseCard}>
                  <View style={styles.exerciseHeader}>
                    <Text style={styles.exerciseName}>{exercise.name}</Text>
                    <View style={styles.setsIndicator}>
                      <Text style={styles.setsText}>
                        {exercise.setsCompleted}/{exercise.sets}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.exerciseDetails}>
                    <View style={styles.detailItem}>
                      <Text style={styles.detailValue}>{exercise.sets}</Text>
                      <Text style={styles.detailLabel}>X</Text>
                      <Text style={styles.detailValue}>{exercise.reps}</Text>
                      {exercise.weight !== "bodyweight" && (
                        <>
                          <Text style={styles.detailSeparator}>, </Text>
                          <Text style={styles.detailValue}>
                            {exercise.weight}
                          </Text>
                        </>
                      )}
                    </View>
                  </View>

                  {/* Progress indicator for completed sets */}
                  <View style={styles.progressBar}>
                    <View
                      style={[
                        styles.progressFill,
                        {
                          width: `${(exercise.setsCompleted / exercise.sets) * 100}%`,
                        },
                      ]}
                    />
                  </View>
                </View>
              ))}
            </View>

            {/* Additional Workout Info */}
            <View style={styles.additionalInfo}>
              {/* Warmup */}
              <View style={styles.infoSection}>
                <Text style={styles.infoTitle}>
                  Warmup ({workoutData.warmup.duration} min)
                </Text>
                <Text style={styles.infoText}>
                  {workoutData.warmup.exercises.join(", ")}
                </Text>
              </View>

              {/* Equipment */}
              <View style={styles.infoSection}>
                <Text style={styles.infoTitle}>Equipment Needed</Text>
                <View style={styles.equipmentTags}>
                  {workoutData.equipment.map((item: string, index: number) => (
                    <View key={index} style={styles.equipmentTag}>
                      <Text style={styles.equipmentText}>{item}</Text>
                    </View>
                  ))}
                </View>
              </View>

              {/* Cooldown */}
              <View style={styles.infoSection}>
                <Text style={styles.infoTitle}>
                  Cooldown ({workoutData.cooldown.duration} min)
                </Text>
                <Text style={styles.infoText}>
                  {workoutData.cooldown.exercises.join(", ")}
                </Text>
              </View>
            </View>

            {/* Start Workout Button */}
            <TouchableOpacity
              style={styles.startButton}
              onPress={handleStartWorkout}
            >
              <Ionicons name="play" size={24} color={Colors.text.onPrimary} />
              <Text style={styles.startButtonText}>Start Workout</Text>
            </TouchableOpacity>
          </>
        ) : (
          // Workout Execution Interface
          <>
            {/* Execution Header */}
            <View style={styles.executionHeader}>
              <TouchableOpacity
                onPress={handleBackToOverview}
                style={styles.backButton}
              >
                <Ionicons
                  name="arrow-back"
                  size={24}
                  color={Colors.text.primary}
                />
              </TouchableOpacity>
              <View style={styles.exerciseProgress}>
                <Text style={styles.exerciseCounter}>
                  Exercise {currentExerciseIndex + 1} of {exercises.length}
                </Text>
                <Text style={styles.currentExerciseName}>
                  {currentExercise?.name}
                </Text>
              </View>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <Ionicons name="close" size={24} color={Colors.text.primary} />
              </TouchableOpacity>
            </View>

            {/* Exercise Navigation */}
            <View style={styles.exerciseNavigation}>
              <TouchableOpacity
                onPress={handlePreviousExercise}
                style={[
                  styles.navButton,
                  currentExerciseIndex === 0 && styles.navButtonDisabled,
                ]}
                disabled={currentExerciseIndex === 0}
              >
                <Ionicons
                  name="chevron-back"
                  size={24}
                  color={
                    currentExerciseIndex === 0
                      ? Colors.neutral[400]
                      : Colors.text.primary
                  }
                />
              </TouchableOpacity>

              <View style={styles.exerciseInfo}>
                <Text style={styles.exerciseNameLarge}>
                  {currentExercise?.name}
                </Text>
                <Text style={styles.exerciseDetails}>
                  {currentExercise?.sets} sets × {currentExercise?.reps}{" "}
                  {currentExercise?.weight !== "bodyweight" &&
                    `× ${currentExercise?.weight}`}
                </Text>
              </View>

              <TouchableOpacity
                onPress={handleNextExercise}
                style={[
                  styles.navButton,
                  currentExerciseIndex === exercises.length - 1 &&
                    styles.navButtonDisabled,
                ]}
                disabled={currentExerciseIndex === exercises.length - 1}
              >
                <Ionicons
                  name="chevron-forward"
                  size={24}
                  color={
                    currentExerciseIndex === exercises.length - 1
                      ? Colors.neutral[400]
                      : Colors.text.primary
                  }
                />
              </TouchableOpacity>
            </View>

            {/* Sets Display */}
            <View style={styles.setsContainer}>
              <Text style={styles.setsTitle}>Workout Progress</Text>
              <View style={styles.setsGrid}>
                {currentExercise?.workoutSteps.map(
                  (step: any, index: number) => (
                    <View
                      key={step.id}
                      style={[
                        step.type === "set" ? styles.setItem : styles.restItem,
                        step.completed && styles.stepCompleted,
                        index === currentSet &&
                          !step.completed &&
                          styles.stepActive,
                      ]}
                    >
                      {step.type === "set" ? (
                        <Text
                          style={[
                            styles.setNumber,
                            step.completed && styles.stepNumberCompleted,
                            index === currentSet &&
                              !step.completed &&
                              styles.stepNumberActive,
                          ]}
                        >
                          {step.setNumber}
                        </Text>
                      ) : (
                        <Ionicons
                          name="timer-outline"
                          size={16}
                          color={
                            step.completed
                              ? Colors.text.onPrimary
                              : index === currentSet
                                ? Colors.primary.main
                                : Colors.text.secondary
                          }
                        />
                      )}
                    </View>
                  )
                )}
              </View>

              {/* Current step info */}
              <View style={styles.currentStepInfo}>
                {currentExercise?.workoutSteps[currentSet]?.type === "set" ? (
                  <Text style={styles.currentStepText}>
                    Set {currentExercise?.workoutSteps[currentSet]?.setNumber}{" "}
                    of {currentExercise?.sets}
                  </Text>
                ) : (
                  <Text style={styles.currentStepText}>Rest Period</Text>
                )}
              </View>
            </View>

            {/* Rest Timer */}
            {isResting && (
              <View style={styles.restTimerContainer}>
                <Text style={styles.restTimerLabel}>Rest Time</Text>
                <Text style={styles.restTimerText}>
                  {formatTime(restTimer)}
                </Text>
              </View>
            )}

            {/* Complete Set Button */}
            {currentExercise?.workoutSteps[currentSet]?.type === "set" && (
              <TouchableOpacity
                style={styles.completeSetButton}
                onPress={handleSetComplete}
              >
                <Text style={styles.completeSetButtonText}>
                  Complete Set{" "}
                  {currentExercise?.workoutSteps[currentSet]?.setNumber}
                </Text>
              </TouchableOpacity>
            )}
          </>
        )}
      </ScrollView>

      {/* Scroll Indicator - Only show in overview mode */}
      {!isExecuting && showScrollIndicator && (
        <Animated.View
          style={[styles.scrollIndicator, { opacity: scrollIndicatorOpacity }]}
        >
          <View style={styles.scrollIndicatorContent}>
            <Text style={styles.scrollIndicatorText}>Scroll down for more</Text>
            <Ionicons
              name="chevron-down"
              size={16}
              color={Colors.text.secondary}
            />
          </View>
          <View style={styles.fadeGradient} />
        </Animated.View>
      )}
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
  workoutTitle: {
    ...Typography.h2,
    color: Colors.text.primary,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: Spacing.sm,
  },
  workoutMeta: {
    flexDirection: "row",
    justifyContent: "center",
    gap: Spacing.lg,
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
  },
  metaText: {
    ...Typography.captionMedium,
    color: Colors.text.secondary,
    fontWeight: "500",
  },
  exercisesList: {
    marginBottom: Spacing.xl,
  },
  exerciseCard: {
    backgroundColor: "#FFFFFA",
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: "#E4E4E4",
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
  setsIndicator: {
    backgroundColor: Colors.primary.main + "20",
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.sm,
  },
  setsText: {
    ...Typography.captionMedium,
    color: Colors.primary.main,
    fontWeight: "600",
  },
  exerciseDetails: {
    marginBottom: Spacing.sm,
  },
  detailItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  detailValue: {
    ...Typography.bodyMedium,
    color: "#FF6B35", // Orange color from screenshot
    fontWeight: "600",
  },
  detailLabel: {
    ...Typography.bodyMedium,
    color: Colors.text.primary,
    fontWeight: "600",
    marginHorizontal: Spacing.xs,
  },
  detailSeparator: {
    ...Typography.bodyMedium,
    color: Colors.text.secondary,
  },
  progressBar: {
    height: 4,
    backgroundColor: Colors.neutral[200],
    borderRadius: 2,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: Colors.success.main,
    borderRadius: 2,
  },
  additionalInfo: {
    marginBottom: Spacing.xl,
  },
  infoSection: {
    marginBottom: Spacing.md,
  },
  infoTitle: {
    ...Typography.bodyMedium,
    color: Colors.text.primary,
    fontWeight: "600",
    marginBottom: Spacing.xs,
  },
  infoText: {
    ...Typography.bodyMedium,
    color: Colors.text.secondary,
    lineHeight: 20,
  },
  equipmentTags: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.xs,
  },
  equipmentTag: {
    backgroundColor: Colors.neutral[100],
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.sm,
  },
  equipmentText: {
    ...Typography.captionMedium,
    color: Colors.text.secondary,
  },
  startButton: {
    backgroundColor: Colors.primary.main,
    borderRadius: BorderRadius.lg,
    paddingVertical: Spacing.lg,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
    marginTop: Spacing.md,
  },
  startButtonText: {
    ...Typography.h3,
    color: Colors.text.onPrimary,
    fontWeight: "600",
  },
  scrollIndicator: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 80,
    justifyContent: "flex-end",
    alignItems: "center",
    pointerEvents: "none",
  },
  scrollIndicatorContent: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.background.card + "F0", // 94% opacity
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.neutral[200],
  },
  scrollIndicatorText: {
    ...Typography.captionMedium,
    color: Colors.text.secondary,
    marginRight: Spacing.xs,
    fontWeight: "500",
  },
  fadeGradient: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 40,
    backgroundColor: `linear-gradient(transparent, ${Colors.background.card})`,
    pointerEvents: "none",
  },
  // Workout Execution Styles
  executionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral[200],
    marginBottom: Spacing.lg,
  },
  backButton: {
    padding: Spacing.xs,
  },
  closeButton: {
    padding: Spacing.xs,
  },
  exerciseProgress: {
    flex: 1,
    alignItems: "center",
  },
  exerciseCounter: {
    ...Typography.captionMedium,
    color: Colors.text.secondary,
    fontWeight: "500",
  },
  currentExerciseName: {
    ...Typography.bodyLarge,
    color: Colors.text.primary,
    fontWeight: "600",
    textAlign: "center",
  },
  exerciseNavigation: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.xl,
    backgroundColor: "#FFFFFA",
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: "#E4E4E4",
  },
  navButton: {
    padding: Spacing.sm,
    borderRadius: BorderRadius.md,
  },
  navButtonDisabled: {
    opacity: 0.3,
  },
  exerciseInfo: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: Spacing.md,
  },
  exerciseNameLarge: {
    ...Typography.h3,
    color: Colors.text.primary,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: Spacing.xs,
  },
  setsContainer: {
    marginBottom: Spacing.xl,
  },
  setsTitle: {
    ...Typography.bodyLarge,
    color: Colors.text.primary,
    fontWeight: "600",
    marginBottom: Spacing.md,
    textAlign: "center",
  },
  setsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: Spacing.sm,
  },
  setItem: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: Colors.neutral[200],
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "transparent",
  },
  setCompleted: {
    backgroundColor: Colors.success.main,
  },
  setActive: {
    borderColor: Colors.primary.main,
    backgroundColor: Colors.primary.main + "20",
  },
  restItem: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.neutral[200],
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "transparent",
  },
  stepCompleted: {
    backgroundColor: Colors.success.main,
  },
  stepActive: {
    borderColor: Colors.primary.main,
    backgroundColor: Colors.primary.main + "20",
  },
  setNumber: {
    ...Typography.bodyMedium,
    color: Colors.text.secondary,
    fontWeight: "600",
  },
  setNumberCompleted: {
    color: Colors.text.onPrimary,
  },
  setNumberActive: {
    color: Colors.primary.main,
  },
  stepNumberCompleted: {
    color: Colors.text.onPrimary,
  },
  stepNumberActive: {
    color: Colors.primary.main,
  },
  currentStepInfo: {
    alignItems: "center",
    marginTop: Spacing.md,
  },
  currentStepText: {
    ...Typography.bodyMedium,
    color: Colors.text.secondary,
    fontWeight: "500",
  },
  restTimerContainer: {
    backgroundColor: "#FFF3CD",
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    alignItems: "center",
    marginBottom: Spacing.lg,
    borderWidth: 1,
    borderColor: "#FFE69C",
  },
  restTimerLabel: {
    ...Typography.bodyMedium,
    color: "#856404",
    fontWeight: "500",
    marginBottom: Spacing.xs,
  },
  restTimerText: {
    ...Typography.h1,
    color: "#856404",
    fontWeight: "700",
  },
  completeSetButton: {
    backgroundColor: Colors.primary.main,
    borderRadius: BorderRadius.lg,
    paddingVertical: Spacing.lg,
    alignItems: "center",
    justifyContent: "center",
    marginTop: Spacing.md,
  },
  completeSetButtonDisabled: {
    backgroundColor: Colors.neutral[300],
  },
  completeSetButtonText: {
    ...Typography.h3,
    color: Colors.text.onPrimary,
    fontWeight: "600",
  },
});

export default GymWorkoutBottomSheet;
