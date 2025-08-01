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
  const [calendarDate, setCalendarDate] = useState(new Date());

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
      <Text style={styles.sectionTitle}>Start Your Timer</Text>
      <View style={styles.timerButtons}>
        <TouchableOpacity
          style={[
            styles.timerButton,
            selectedTimer === "recommended" && styles.timerButtonSelected,
          ]}
          onPress={() => handleTimerSelect("recommended")}
          activeOpacity={0.8}
        >
          <View
            style={[
              styles.timerIconContainer,
              selectedTimer === "recommended" &&
                styles.timerIconContainerSelected,
            ]}
          >
            <Ionicons
              name="bulb"
              size={24}
              color={
                selectedTimer === "recommended"
                  ? Colors.text.onPrimary
                  : Colors.primary.main
              }
            />
          </View>
          <Text
            style={[
              styles.timerButtonText,
              selectedTimer === "recommended" && styles.timerButtonTextSelected,
            ]}
          >
            Recommended
          </Text>
          <Text
            style={[
              styles.timerButtonSubtext,
              selectedTimer === "recommended" &&
                styles.timerButtonSubtextSelected,
            ]}
          >
            ⚡ Start now
          </Text>
          {selectedTimer === "recommended" && (
            <View style={styles.selectionIndicator}>
              <Ionicons
                name="checkmark"
                size={14}
                color={Colors.text.onPrimary}
              />
            </View>
          )}
          {selectedTimer !== "recommended" && (
            <View style={styles.startIndicator}>
              <Ionicons
                name="play-circle"
                size={16}
                color={Colors.primary.main}
              />
            </View>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.timerButton,
            selectedTimer === "custom" && styles.timerButtonSelected,
          ]}
          onPress={() => handleTimerSelect("custom")}
          activeOpacity={0.8}
        >
          <View
            style={[
              styles.timerIconContainer,
              selectedTimer === "custom" && styles.timerIconContainerSelected,
            ]}
          >
            <Ionicons
              name="settings"
              size={24}
              color={
                selectedTimer === "custom"
                  ? Colors.text.onPrimary
                  : Colors.primary.main
              }
            />
          </View>
          <Text
            style={[
              styles.timerButtonText,
              selectedTimer === "custom" && styles.timerButtonTextSelected,
            ]}
          >
            Custom
          </Text>
          <Text
            style={[
              styles.timerButtonSubtext,
              selectedTimer === "custom" && styles.timerButtonSubtextSelected,
            ]}
          >
            ⚙️ Configure
          </Text>
          {selectedTimer === "custom" && (
            <View style={styles.selectionIndicator}>
              <Ionicons
                name="checkmark"
                size={14}
                color={Colors.text.onPrimary}
              />
            </View>
          )}
          {selectedTimer !== "custom" && (
            <View style={styles.startIndicator}>
              <Ionicons name="options" size={16} color={Colors.primary.main} />
            </View>
          )}
        </TouchableOpacity>
      </View>
      <Text style={styles.timerHint}>
        Tap a button above to start your productivity session
      </Text>
    </View>
  );

  const renderMiniCalendar = () => {
    const generateCalendar = () => {
      const year = calendarDate.getFullYear();
      const month = calendarDate.getMonth();

      // Get first day of the month
      const firstDay = new Date(year, month, 1);
      const lastDay = new Date(year, month + 1, 0);

      // Get the day of week for first day (0 = Sunday, 1 = Monday, etc.)
      const firstDayOfWeek = firstDay.getDay();
      const daysInMonth = lastDay.getDate();

      // Get previous month info
      const prevMonth = new Date(year, month - 1, 0);
      const daysInPrevMonth = prevMonth.getDate();

      const calendarDays = [];

      // Add days from previous month
      for (let i = firstDayOfWeek - 1; i >= 0; i--) {
        calendarDays.push({
          day: daysInPrevMonth - i,
          isCurrentMonth: false,
          isPrevMonth: true,
          isNextMonth: false,
          date: new Date(year, month - 1, daysInPrevMonth - i),
        });
      }

      // Add days of current month
      for (let day = 1; day <= daysInMonth; day++) {
        calendarDays.push({
          day: day,
          isCurrentMonth: true,
          isPrevMonth: false,
          isNextMonth: false,
          date: new Date(year, month, day),
        });
      }

      // Add days from next month to complete the grid (42 days total = 6 weeks)
      const remainingDays = 42 - calendarDays.length;
      for (let day = 1; day <= remainingDays; day++) {
        calendarDays.push({
          day: day,
          isCurrentMonth: false,
          isPrevMonth: false,
          isNextMonth: true,
          date: new Date(year, month + 1, day),
        });
      }

      return calendarDays;
    };

    const calendarDays = generateCalendar();
    const today = new Date();
    const weekDays = ["S", "M", "T", "W", "T", "F", "S"];

    const monthYear = calendarDate.toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    });

    const isToday = (dayData: any) => {
      return dayData.date.toDateString() === today.toDateString();
    };

    const isCompleted = (dayData: any) => {
      // Mock completion logic - replace with real data
      if (!dayData.isCurrentMonth) return false;
      if (dayData.date > today) return false;
      return Math.random() > 0.4; // 60% completion rate
    };

    const navigateMonth = (direction: "prev" | "next") => {
      const newDate = new Date(calendarDate);
      newDate.setMonth(
        calendarDate.getMonth() + (direction === "next" ? 1 : -1)
      );
      setCalendarDate(newDate);
    };

    return (
      <View style={styles.calendarSection}>
        <View style={styles.calendarContainer}>
          {/* Header with month navigation */}
          <View style={styles.calendarHeader}>
            <TouchableOpacity
              style={styles.calendarNavButton}
              onPress={() => navigateMonth("prev")}
            >
              <Ionicons
                name="chevron-back"
                size={20}
                color={Colors.text.primary}
              />
            </TouchableOpacity>

            <Text style={styles.calendarMonthTitle}>{monthYear}</Text>

            <TouchableOpacity
              style={styles.calendarNavButton}
              onPress={() => navigateMonth("next")}
            >
              <Ionicons
                name="chevron-forward"
                size={20}
                color={Colors.text.primary}
              />
            </TouchableOpacity>
          </View>

          {/* Calendar grid */}
          <View style={styles.calendar}>
            {/* Day names row */}
            <View style={styles.dayNamesRow}>
              {weekDays.map((dayName, index) => (
                <View key={index} style={styles.dayNameCell}>
                  <Text style={styles.dayNameText}>{dayName}</Text>
                </View>
              ))}
            </View>

            {/* Calendar rows - 6 weeks = 42 days */}
            <View style={styles.calendarGrid}>
              {Array.from({ length: 6 }, (_, rowIndex) => (
                <View key={rowIndex} style={styles.calendarRow}>
                  {calendarDays
                    .slice(rowIndex * 7, (rowIndex + 1) * 7)
                    .map((dayData, dayIndex) => {
                      const globalIndex = rowIndex * 7 + dayIndex;
                      const isTodayDate = isToday(dayData);
                      const isCompletedDate = isCompleted(dayData);

                      return (
                        <View key={globalIndex} style={styles.dateCell}>
                          {/* Today's date gets special styling */}
                          {isTodayDate ? (
                            <View style={styles.todayCircle}>
                              <Text style={styles.todayText}>
                                {dayData.day}
                              </Text>
                            </View>
                          ) : (
                            <Text
                              style={[
                                styles.dateText,
                                !dayData.isCurrentMonth &&
                                  styles.otherMonthText,
                              ]}
                            >
                              {dayData.day}
                            </Text>
                          )}
                          {/* Completion indicator */}
                          {isCompletedDate && (
                            <View style={styles.completionDot} />
                          )}
                        </View>
                      );
                    })}
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
    gap: Spacing.lg,
    paddingHorizontal: Spacing.xs,
  },
  timerButton: {
    flex: 1,
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.sm,
    borderRadius: BorderRadius.lg,
    borderWidth: 2,
    borderColor: Colors.primary.main,
    backgroundColor: Colors.background.card,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
    minHeight: 90,
    position: "relative",
  },
  timerButtonSelected: {
    backgroundColor: Colors.primary.main,
    borderColor: Colors.primary.main,
    shadowColor: Colors.primary.main,
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 8,
    transform: [{ scale: 1.02 }],
  },
  timerButtonText: {
    ...Typography.bodyMedium,
    color: Colors.text.primary,
    fontWeight: "800",
    marginTop: Spacing.xs,
    textAlign: "center",
    fontSize: 14,
  },
  timerButtonTextSelected: {
    color: Colors.text.onPrimary,
  },
  sectionTitle: {
    ...Typography.h3,
    color: Colors.text.primary,
    fontWeight: "800",
    marginBottom: Spacing.lg,
    textAlign: "center",
    fontSize: 18,
  },
  timerIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.background.secondary,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.sm,
    borderWidth: 2,
    borderColor: Colors.primary.main,
    shadowColor: Colors.primary.main,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  timerIconContainerSelected: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderColor: Colors.text.onPrimary,
    shadowColor: "#fff",
    shadowOpacity: 0.3,
  },
  timerButtonSubtext: {
    ...Typography.captionMedium,
    color: Colors.text.secondary,
    textAlign: "center",
    marginTop: Spacing.xs,
    fontWeight: "500",
  },
  timerButtonSubtextSelected: {
    color: Colors.text.onPrimary,
    opacity: 0.9,
  },
  selectionIndicator: {
    position: "absolute",
    top: Spacing.sm,
    right: Spacing.sm,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  startIndicator: {
    position: "absolute",
    bottom: Spacing.sm,
    right: Spacing.sm,
    opacity: 0.7,
  },
  timerHint: {
    ...Typography.captionMedium,
    color: Colors.text.secondary,
    textAlign: "center",
    marginTop: Spacing.md,
    fontStyle: "italic",
  },
  calendarSection: {
    marginBottom: Spacing.lg,
  },
  // Calendar styles (matching WeeklyCalendar design)
  calendarContainer: {
    backgroundColor: Colors.background.card,
    borderRadius: BorderRadius.lg,
    padding: Spacing.sm,
  },
  calendarHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.md,
  },
  calendarNavButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.background.secondary,
    alignItems: "center",
    justifyContent: "center",
  },
  calendarMonthTitle: {
    ...Typography.h3,
    color: Colors.text.primary,
    fontWeight: "600",
  },
  calendar: {
    gap: Spacing.xs,
  },
  dayNamesRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  dayNameCell: {
    width: "14.28%", // 100% / 7 days = 14.28%
    alignItems: "center",
    paddingVertical: Spacing.xs / 2,
  },
  dayNameText: {
    ...Typography.captionSmall,
    color: Colors.text.secondary,
    fontWeight: "500",
  },
  calendarGrid: {
    gap: Spacing.xs / 2,
  },
  calendarRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  dateCell: {
    width: "14.28%", // 100% / 7 days = 14.28%
    aspectRatio: 1,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: BorderRadius.sm,
    position: "relative",
  },
  todayCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.primary.main,
    alignItems: "center",
    justifyContent: "center",
  },
  dateText: {
    ...Typography.bodyMedium,
    color: Colors.text.primary,
    fontWeight: "500",
  },
  otherMonthText: {
    color: Colors.text.secondary,
    opacity: 0.4,
  },
  todayText: {
    color: Colors.text.onPrimary,
    fontWeight: "700",
  },
  completionDot: {
    position: "absolute",
    bottom: 4,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.success.main,
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
