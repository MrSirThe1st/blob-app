// src/components/tasks/TaskDetailBottomSheet.tsx
import { BorderRadius, Colors, Spacing, Typography } from "@/constants";
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useRef, useState } from "react";
import {
  Modal,
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
  onMarkCompleted,
}) => {
  const refRBSheet = useRef<any>(null);
  const [selectedTimer, setSelectedTimer] = useState<
    "recommended" | "custom" | null
  >(null);
  const [showTimerInterface, setShowTimerInterface] = useState(false);
  const [timerState, setTimerState] = useState<{
    isRunning: boolean;
    currentPhase: "work" | "break";
    timeRemaining: number;
    sessionCount: number;
    totalSessions: number;
  }>({
    isRunning: false,
    currentPhase: "work",
    timeRemaining: 0,
    sessionCount: 0,
    totalSessions: 4,
  });
  const [customSettings, setCustomSettings] = useState({
    workDuration: 25,
    breakDuration: 5,
    longBreakDuration: 15,
    sessionsUntilLongBreak: 4,
  });
  const [showCustomSettings, setShowCustomSettings] = useState(false);

  // Timer interval ref
  const timerInterval = useRef<number | null>(null);

  useEffect(() => {
    if (visible) {
      refRBSheet.current?.open();
    } else {
      refRBSheet.current?.close();
      // Clean up timer when closing
      if (timerInterval.current) {
        clearInterval(timerInterval.current);
        timerInterval.current = null;
      }
      setShowTimerInterface(false);
      setTimerState({
        isRunning: false,
        currentPhase: "work",
        timeRemaining: 0,
        sessionCount: 0,
        totalSessions: 4,
      });
    }
  }, [visible]);

  // Timer effect
  useEffect(() => {
    if (timerState.isRunning && timerState.timeRemaining > 0) {
      timerInterval.current = setInterval(() => {
        setTimerState((prev) => {
          if (prev.timeRemaining <= 1) {
            // Phase completed
            if (prev.currentPhase === "work") {
              // Switch to break
              const isLongBreak =
                (prev.sessionCount + 1) %
                  customSettings.sessionsUntilLongBreak ===
                0;
              const breakDuration = isLongBreak
                ? customSettings.longBreakDuration
                : customSettings.breakDuration;
              return {
                ...prev,
                currentPhase: "break",
                timeRemaining: breakDuration * 60,
                sessionCount: prev.sessionCount + 1,
              };
            } else {
              // Switch to work (new session)
              if (prev.sessionCount >= prev.totalSessions) {
                // All sessions completed
                return {
                  ...prev,
                  isRunning: false,
                  timeRemaining: 0,
                };
              }
              return {
                ...prev,
                currentPhase: "work",
                timeRemaining: customSettings.workDuration * 60,
              };
            }
          }
          return {
            ...prev,
            timeRemaining: prev.timeRemaining - 1,
          };
        });
      }, 1000);
    } else if (timerInterval.current) {
      clearInterval(timerInterval.current);
      timerInterval.current = null;
    }

    return () => {
      if (timerInterval.current) {
        clearInterval(timerInterval.current);
        timerInterval.current = null;
      }
    };
  }, [timerState.isRunning, timerState.timeRemaining, customSettings]);

  if (!task) return null;

  const handleTimerSelect = (timerType: "recommended" | "custom") => {
    setSelectedTimer(timerType);

    if (timerType === "recommended") {
      // Start recommended timer immediately with AI-suggested intervals
      const recommendedSettings = getRecommendedTimerSettings(task.type);
      setTimerState({
        isRunning: true,
        currentPhase: "work",
        timeRemaining: recommendedSettings.workDuration * 60,
        sessionCount: 0,
        totalSessions: recommendedSettings.totalSessions,
      });
      setCustomSettings(recommendedSettings);
      setShowTimerInterface(true);
    } else {
      // Show custom settings first
      setShowCustomSettings(true);
    }
  };

  const getRecommendedTimerSettings = (taskType: string) => {
    switch (taskType) {
      case "daily_habit":
        return {
          workDuration: 25,
          breakDuration: 10,
          longBreakDuration: 25,
          sessionsUntilLongBreak: 3,
          totalSessions: 6, // 2.5 hours total
        };
      case "weekly_task":
        return {
          workDuration: 45,
          breakDuration: 15,
          longBreakDuration: 30,
          sessionsUntilLongBreak: 2,
          totalSessions: 4,
        };
      default:
        return {
          workDuration: 25,
          breakDuration: 5,
          longBreakDuration: 15,
          sessionsUntilLongBreak: 4,
          totalSessions: 4,
        };
    }
  };

  const startCustomTimer = () => {
    setTimerState({
      isRunning: true,
      currentPhase: "work",
      timeRemaining: customSettings.workDuration * 60,
      sessionCount: 0,
      totalSessions: customSettings.sessionsUntilLongBreak * 2, // Approximate
    });
    setShowCustomSettings(false);
    setShowTimerInterface(true);
  };

  const toggleTimer = () => {
    setTimerState((prev) => ({
      ...prev,
      isRunning: !prev.isRunning,
    }));
  };

  const resetTimer = () => {
    setTimerState({
      isRunning: false,
      currentPhase: "work",
      timeRemaining:
        selectedTimer === "recommended"
          ? getRecommendedTimerSettings(task.type).workDuration * 60
          : customSettings.workDuration * 60,
      sessionCount: 0,
      totalSessions:
        selectedTimer === "recommended"
          ? getRecommendedTimerSettings(task.type).totalSessions
          : customSettings.sessionsUntilLongBreak * 2,
    });
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleMarkCompleted = () => {
    onMarkCompleted?.();
    onClose();
  };

  const renderTaskHeader = () => (
    <View style={styles.taskHeader}>
      <Text style={styles.taskTitle}>{task.title}</Text>
      <Text style={styles.taskDescription}>
        {task.description || getTaskDescription(task.type)}
      </Text>
    </View>
  );

  const getTaskDescription = (taskType: string) => {
    switch (taskType) {
      case "daily_habit":
        return "This is a focused work, this session will take you 2h30, we suggest you a 25-minute pomodoro with 5 to 10 minutes breaks";
      case "weekly_task":
        return "Improve the design of the app and create a better dashboard page";
      case "one_time":
        return "This is a one-time task that needs to be completed";
      default:
        return "Complete this task according to your schedule";
    }
  };

  const renderTimerOptions = () => (
    <View style={styles.timerSection}>
      <View style={styles.timerButtons}>
        <TouchableOpacity
          style={[
            styles.timerButton,
            selectedTimer === "recommended" && styles.timerButtonSelected,
          ]}
          onPress={() => handleTimerSelect("recommended")}
        >
          <Ionicons
            name="bulb"
            size={20}
            color={
              selectedTimer === "recommended"
                ? Colors.text.onPrimary
                : Colors.text.primary
            }
          />
          <Text
            style={[
              styles.timerButtonText,
              selectedTimer === "recommended" && styles.timerButtonTextSelected,
            ]}
          >
            Recommended
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.timerButton,
            selectedTimer === "custom" && styles.timerButtonSelected,
          ]}
          onPress={() => handleTimerSelect("custom")}
        >
          <Ionicons
            name="timer"
            size={20}
            color={
              selectedTimer === "custom"
                ? Colors.text.onPrimary
                : Colors.text.primary
            }
          />
          <Text
            style={[
              styles.timerButtonText,
              selectedTimer === "custom" && styles.timerButtonTextSelected,
            ]}
          >
            Custom
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderMiniCalendar = () => {
    // Generate calendar data (simplified version)
    const currentDate = new Date();
    const daysInMonth = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() + 1,
      0
    ).getDate();
    const firstDayOfMonth = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      1
    ).getDay();

    const calendarDays = [];
    const weekDays = ["S", "M", "T", "W", "T", "F", "S"];

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDayOfMonth; i++) {
      calendarDays.push(null);
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      calendarDays.push(day);
    }

    return (
      <View style={styles.calendarSection}>
        <View style={styles.calendarHeader}>
          <Text style={styles.calendarTitle}>July</Text>
          <Text style={styles.calendarTitle}>Elena(buddy)</Text>
          <Text style={styles.calendarTitle}>July</Text>
        </View>

        <View style={styles.calendarsContainer}>
          {/* User's Calendar */}
          <View style={styles.miniCalendar}>
            <View style={styles.weekDaysRow}>
              {weekDays.map((day, index) => (
                <Text key={index} style={styles.weekDayText}>
                  {day}
                </Text>
              ))}
            </View>
            <View style={styles.calendarGrid}>
              {calendarDays.map((day, index) => (
                <View key={index} style={styles.calendarDay}>
                  {day && (
                    <>
                      <Text style={styles.dayNumber}>{day}</Text>
                      {/* Show completion dots for some days */}
                      {day <= currentDate.getDate() && Math.random() > 0.3 && (
                        <View style={styles.completionDot} />
                      )}
                    </>
                  )}
                </View>
              ))}
            </View>
          </View>

          {/* Buddy's Calendar */}
          <View style={styles.miniCalendar}>
            <View style={styles.weekDaysRow}>
              {weekDays.map((day, index) => (
                <Text key={index} style={styles.weekDayText}>
                  {day}
                </Text>
              ))}
            </View>
            <View style={styles.calendarGrid}>
              {calendarDays.map((day, index) => (
                <View key={index} style={styles.calendarDay}>
                  {day && (
                    <>
                      <Text style={styles.dayNumber}>{day}</Text>
                      {/* Show completion dots for some days */}
                      {day <= currentDate.getDate() && Math.random() > 0.4 && (
                        <View
                          style={[
                            styles.completionDot,
                            { backgroundColor: Colors.success.main },
                          ]}
                        />
                      )}
                    </>
                  )}
                </View>
              ))}
            </View>
          </View>
        </View>
      </View>
    );
  };

  const renderTips = () => (
    <View style={styles.tipsSection}>
      <View style={styles.tipItem}>
        <View style={styles.tipIcon}>
          <Ionicons name="bulb-outline" size={20} color="#FFA500" />
        </View>
        <Text style={styles.tipText}>
          You should be in a quiet place for you to complete this task properly.
          Follow a plan
        </Text>
      </View>

      <View style={styles.tipItem}>
        <View style={styles.tipIcon}>
          <Ionicons name="bulb-outline" size={20} color="#FFA500" />
        </View>
        <Text style={styles.tipText}>
          You should be in a quiet place for you to complete this task properly.
          Follow a plan
        </Text>
      </View>
    </View>
  );

  const renderTimerInterface = () => (
    <View style={styles.timerInterface}>
      <View style={styles.timerHeader}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => setShowTimerInterface(false)}
        >
          <Ionicons name="arrow-back" size={24} color={Colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.timerTitle}>
          {selectedTimer === "recommended"
            ? "AI Recommended Timer"
            : "Custom Timer"}
        </Text>
      </View>

      <View style={styles.timerDisplay}>
        <View style={styles.timerCircle}>
          <Text style={styles.timerTime}>
            {formatTime(timerState.timeRemaining)}
          </Text>
          <Text style={styles.timerPhase}>
            {timerState.currentPhase === "work" ? "Focus Time" : "Break Time"}
          </Text>
        </View>
      </View>

      <View style={styles.timerProgress}>
        <Text style={styles.progressText}>
          Session {timerState.sessionCount + 1} of {timerState.totalSessions}
        </Text>
        <View style={styles.progressBar}>
          <View
            style={[
              styles.progressFill,
              {
                width: `${(timerState.sessionCount / timerState.totalSessions) * 100}%`,
              },
            ]}
          />
        </View>
      </View>

      <View style={styles.timerControls}>
        <TouchableOpacity
          style={[styles.controlButton, styles.resetButton]}
          onPress={resetTimer}
        >
          <Ionicons name="refresh" size={24} color={Colors.text.secondary} />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.controlButton, styles.playPauseButton]}
          onPress={toggleTimer}
        >
          <Ionicons
            name={timerState.isRunning ? "pause" : "play"}
            size={32}
            color={Colors.text.onPrimary}
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.controlButton, styles.settingsButton]}
          onPress={() => setShowCustomSettings(true)}
        >
          <Ionicons name="settings" size={24} color={Colors.text.secondary} />
        </TouchableOpacity>
      </View>

      {timerState.sessionCount >= timerState.totalSessions &&
        !timerState.isRunning && (
          <TouchableOpacity
            style={styles.completeTaskButton}
            onPress={handleMarkCompleted}
          >
            <Text style={styles.completeTaskButtonText}>
              Task Completed! 🎉
            </Text>
          </TouchableOpacity>
        )}
    </View>
  );

  const renderCustomSettings = () => (
    <Modal
      visible={showCustomSettings}
      transparent
      animationType="slide"
      onRequestClose={() => setShowCustomSettings(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.customSettingsModal}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Custom Timer Settings</Text>
            <TouchableOpacity
              onPress={() => setShowCustomSettings(false)}
              style={styles.closeButton}
            >
              <Ionicons name="close" size={24} color={Colors.text.primary} />
            </TouchableOpacity>
          </View>

          <View style={styles.settingsForm}>
            <View style={styles.settingItem}>
              <Text style={styles.settingLabel}>Work Duration (minutes)</Text>
              <View style={styles.inputContainer}>
                <TouchableOpacity
                  onPress={() =>
                    setCustomSettings((prev) => ({
                      ...prev,
                      workDuration: Math.max(1, prev.workDuration - 5),
                    }))
                  }
                  style={styles.adjustButton}
                >
                  <Ionicons
                    name="remove"
                    size={20}
                    color={Colors.text.primary}
                  />
                </TouchableOpacity>
                <Text style={styles.inputValue}>
                  {customSettings.workDuration}
                </Text>
                <TouchableOpacity
                  onPress={() =>
                    setCustomSettings((prev) => ({
                      ...prev,
                      workDuration: prev.workDuration + 5,
                    }))
                  }
                  style={styles.adjustButton}
                >
                  <Ionicons name="add" size={20} color={Colors.text.primary} />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.settingItem}>
              <Text style={styles.settingLabel}>Break Duration (minutes)</Text>
              <View style={styles.inputContainer}>
                <TouchableOpacity
                  onPress={() =>
                    setCustomSettings((prev) => ({
                      ...prev,
                      breakDuration: Math.max(1, prev.breakDuration - 1),
                    }))
                  }
                  style={styles.adjustButton}
                >
                  <Ionicons
                    name="remove"
                    size={20}
                    color={Colors.text.primary}
                  />
                </TouchableOpacity>
                <Text style={styles.inputValue}>
                  {customSettings.breakDuration}
                </Text>
                <TouchableOpacity
                  onPress={() =>
                    setCustomSettings((prev) => ({
                      ...prev,
                      breakDuration: prev.breakDuration + 1,
                    }))
                  }
                  style={styles.adjustButton}
                >
                  <Ionicons name="add" size={20} color={Colors.text.primary} />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.settingItem}>
              <Text style={styles.settingLabel}>
                Long Break Duration (minutes)
              </Text>
              <View style={styles.inputContainer}>
                <TouchableOpacity
                  onPress={() =>
                    setCustomSettings((prev) => ({
                      ...prev,
                      longBreakDuration: Math.max(
                        5,
                        prev.longBreakDuration - 5
                      ),
                    }))
                  }
                  style={styles.adjustButton}
                >
                  <Ionicons
                    name="remove"
                    size={20}
                    color={Colors.text.primary}
                  />
                </TouchableOpacity>
                <Text style={styles.inputValue}>
                  {customSettings.longBreakDuration}
                </Text>
                <TouchableOpacity
                  onPress={() =>
                    setCustomSettings((prev) => ({
                      ...prev,
                      longBreakDuration: prev.longBreakDuration + 5,
                    }))
                  }
                  style={styles.adjustButton}
                >
                  <Ionicons name="add" size={20} color={Colors.text.primary} />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.settingItem}>
              <Text style={styles.settingLabel}>Sessions until Long Break</Text>
              <View style={styles.inputContainer}>
                <TouchableOpacity
                  onPress={() =>
                    setCustomSettings((prev) => ({
                      ...prev,
                      sessionsUntilLongBreak: Math.max(
                        2,
                        prev.sessionsUntilLongBreak - 1
                      ),
                    }))
                  }
                  style={styles.adjustButton}
                >
                  <Ionicons
                    name="remove"
                    size={20}
                    color={Colors.text.primary}
                  />
                </TouchableOpacity>
                <Text style={styles.inputValue}>
                  {customSettings.sessionsUntilLongBreak}
                </Text>
                <TouchableOpacity
                  onPress={() =>
                    setCustomSettings((prev) => ({
                      ...prev,
                      sessionsUntilLongBreak: prev.sessionsUntilLongBreak + 1,
                    }))
                  }
                  style={styles.adjustButton}
                >
                  <Ionicons name="add" size={20} color={Colors.text.primary} />
                </TouchableOpacity>
              </View>
            </View>
          </View>

          <TouchableOpacity
            style={styles.startTimerButton}
            onPress={startCustomTimer}
          >
            <Text style={styles.startTimerButtonText}>Start Timer</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  return (
    <>
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
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {showTimerInterface ? (
            renderTimerInterface()
          ) : (
            <>
              {/* Task Header */}
              {renderTaskHeader()}

              {/* Timer Options */}
              {renderTimerOptions()}

              {/* Mini Calendar */}
              {renderMiniCalendar()}

              {/* Tips */}
              {renderTips()}

              {/* Mark as Completed Button */}
              <TouchableOpacity
                style={styles.completeButton}
                onPress={handleMarkCompleted}
              >
                <Text style={styles.completeButtonText}>Mark as completed</Text>
              </TouchableOpacity>
            </>
          )}
        </ScrollView>
      </RBSheet>

      {/* Custom Settings Modal */}
      {renderCustomSettings()}
    </>
  );
};

const styles = StyleSheet.create({
  content: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
  },
  taskHeader: {
    paddingVertical: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral[200],
    marginBottom: Spacing.lg,
  },
  taskTitle: {
    ...Typography.h2,
    color: Colors.text.primary,
    fontWeight: "700",
    marginBottom: Spacing.sm,
  },
  taskDescription: {
    ...Typography.bodyMedium,
    color: Colors.text.secondary,
    lineHeight: 22,
  },
  timerSection: {
    marginBottom: Spacing.xl,
  },
  timerButtons: {
    flexDirection: "row",
    gap: Spacing.md,
  },
  timerButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.lg,
    borderWidth: 2,
    borderColor: Colors.neutral[300],
    backgroundColor: Colors.background.card,
    gap: Spacing.sm,
  },
  timerButtonSelected: {
    backgroundColor: Colors.text.primary,
    borderColor: Colors.text.primary,
  },
  timerButtonText: {
    ...Typography.bodyMedium,
    color: Colors.text.primary,
    fontWeight: "600",
  },
  timerButtonTextSelected: {
    color: Colors.text.onPrimary,
  },
  calendarSection: {
    marginBottom: Spacing.xl,
  },
  calendarHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.md,
  },
  calendarTitle: {
    ...Typography.bodyMedium,
    color: Colors.text.primary,
    fontWeight: "600",
  },
  calendarsContainer: {
    flexDirection: "row",
    gap: Spacing.md,
  },
  miniCalendar: {
    flex: 1,
    backgroundColor: Colors.background.secondary,
    borderRadius: BorderRadius.lg,
    padding: Spacing.sm,
  },
  weekDaysRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: Spacing.xs,
  },
  weekDayText: {
    ...Typography.captionSmall,
    color: Colors.text.secondary,
    textAlign: "center",
    width: 24,
    fontWeight: "500",
  },
  calendarGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  calendarDay: {
    width: 24,
    height: 24,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    marginBottom: Spacing.xs,
  },
  dayNumber: {
    ...Typography.captionSmall,
    color: Colors.text.primary,
    fontSize: 10,
  },
  completionDot: {
    position: "absolute",
    bottom: 2,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.primary.main,
  },
  tipsSection: {
    marginBottom: Spacing.xl,
  },
  tipItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#FFF8E1",
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    borderLeftWidth: 4,
    borderLeftColor: "#FFA500",
  },
  tipIcon: {
    marginRight: Spacing.sm,
    marginTop: 2,
  },
  tipText: {
    ...Typography.bodyMedium,
    color: Colors.text.primary,
    flex: 1,
    lineHeight: 20,
  },
  completeButton: {
    backgroundColor: "#E0E0E0",
    borderRadius: BorderRadius.lg,
    paddingVertical: Spacing.lg,
    alignItems: "center",
    marginTop: Spacing.md,
  },
  completeButtonText: {
    ...Typography.bodyLarge,
    color: Colors.text.secondary,
    fontWeight: "600",
  },
  // Timer Interface Styles
  timerInterface: {
    flex: 1,
    paddingVertical: Spacing.lg,
  },
  timerHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.xl,
    paddingHorizontal: Spacing.md,
  },
  backButton: {
    padding: Spacing.sm,
    marginRight: Spacing.md,
  },
  timerTitle: {
    ...Typography.h3,
    color: Colors.text.primary,
    fontWeight: "600",
  },
  timerDisplay: {
    alignItems: "center",
    marginBottom: Spacing.xl,
  },
  timerCircle: {
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: Colors.primary.main,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: Colors.primary.main,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  timerTime: {
    ...Typography.h1,
    color: Colors.text.onPrimary,
    fontWeight: "700",
    fontSize: 32,
  },
  timerPhase: {
    ...Typography.bodyMedium,
    color: Colors.text.onPrimary,
    marginTop: Spacing.xs,
    opacity: 0.9,
  },
  timerProgress: {
    paddingHorizontal: Spacing.xl,
    marginBottom: Spacing.xl,
  },
  progressText: {
    ...Typography.bodyMedium,
    color: Colors.text.primary,
    textAlign: "center",
    marginBottom: Spacing.md,
    fontWeight: "500",
  },
  progressBar: {
    height: 6,
    backgroundColor: Colors.neutral[200],
    borderRadius: 3,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: Colors.primary.main,
    borderRadius: 3,
  },
  timerControls: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.xl,
    paddingHorizontal: Spacing.xl,
  },
  controlButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.background.secondary,
    borderWidth: 2,
    borderColor: Colors.neutral[300],
  },
  playPauseButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: Colors.primary.main,
    borderColor: Colors.primary.main,
  },
  resetButton: {
    backgroundColor: Colors.background.card,
  },
  settingsButton: {
    backgroundColor: Colors.background.card,
  },
  completeTaskButton: {
    backgroundColor: Colors.success.main,
    borderRadius: BorderRadius.lg,
    paddingVertical: Spacing.lg,
    alignItems: "center",
    marginTop: Spacing.xl,
    marginHorizontal: Spacing.xl,
  },
  completeTaskButtonText: {
    ...Typography.bodyLarge,
    color: Colors.text.onPrimary,
    fontWeight: "700",
  },
  // Custom Settings Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: Spacing.lg,
  },
  customSettingsModal: {
    backgroundColor: Colors.background.card,
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    width: "100%",
    maxHeight: "80%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.xl,
  },
  modalTitle: {
    ...Typography.h3,
    color: Colors.text.primary,
    fontWeight: "600",
  },
  closeButton: {
    padding: Spacing.sm,
  },
  settingsForm: {
    marginBottom: Spacing.xl,
  },
  settingItem: {
    marginBottom: Spacing.lg,
  },
  settingLabel: {
    ...Typography.bodyMedium,
    color: Colors.text.primary,
    fontWeight: "500",
    marginBottom: Spacing.sm,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.background.secondary,
    borderRadius: BorderRadius.lg,
    padding: Spacing.sm,
  },
  adjustButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.background.card,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: Colors.neutral[300],
  },
  inputValue: {
    ...Typography.h3,
    color: Colors.text.primary,
    fontWeight: "600",
    marginHorizontal: Spacing.lg,
    minWidth: 40,
    textAlign: "center",
  },
  startTimerButton: {
    backgroundColor: Colors.primary.main,
    borderRadius: BorderRadius.lg,
    paddingVertical: Spacing.lg,
    alignItems: "center",
  },
  startTimerButtonText: {
    ...Typography.bodyLarge,
    color: Colors.text.onPrimary,
    fontWeight: "600",
  },
});

export default TaskDetailBottomSheet;
