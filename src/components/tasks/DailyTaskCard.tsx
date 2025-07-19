// src/components/tasks/DailyTaskCard.tsx
import { BorderRadius, Colors, Spacing, Typography } from "@/constants";
import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface DailyTask {
  id: string;
  title: string;
  time: string;
  duration?: string;
  type: "personal" | "work" | "gym" | "meal" | "break";
  isCompleted?: boolean;
  isActive?: boolean;
  icon?: string;
  intensity?: "easy" | "medium" | "hard"; // Intensity level
  streak?: number; // Streak count
}

interface DailyTaskCardProps {
  task: DailyTask;
  onPress?: (task: DailyTask) => void;
  onComplete?: (taskId: string) => void;
  onTimer?: (task: DailyTask) => void;
}

const getTaskIcon = (type: string, customIcon?: string): string => {
  if (customIcon) return customIcon;

  switch (type) {
    case "personal":
      return "person-outline";
    case "work":
      return "briefcase-outline";
    case "gym":
      return "fitness-outline";
    case "meal":
      return "restaurant-outline";
    case "break":
      return "pause-outline";
    default:
      return "checkmark-circle-outline";
  }
};

const getTaskColor = (type: string): string => {
  switch (type) {
    case "personal":
      return Colors.primary.main;
    case "work":
      return Colors.neutral[700];
    case "gym":
      return Colors.success.main;
    case "meal":
      return Colors.warning.main;
    case "break":
      return Colors.info.main;
    default:
      return Colors.text.secondary;
  }
};

const getIntensityColor = (intensity?: string): string => {
  switch (intensity) {
    case "easy":
      return Colors.success.main; // Green
    case "medium":
      return Colors.warning.main; // Orange
    case "hard":
      return Colors.error.main; // Red
    default:
      return Colors.neutral[300]; // Default gray
  }
};

const DailyTaskCard: React.FC<DailyTaskCardProps> = ({
  task,
  onPress,
  onComplete,
  onTimer,
}) => {
  const taskColor = getTaskColor(task.type);
  const taskIcon = getTaskIcon(task.type, task.icon);

  return (
    <TouchableOpacity
      style={[
        styles.container,
        task.isActive && styles.activeContainer,
        task.isCompleted && styles.completedContainer,
      ]}
      onPress={() => onPress?.(task)}
    >
      {/* Task icon and content */}
      <View style={styles.leftSection}>
        <View style={[styles.iconContainer, { backgroundColor: taskColor }]}>
          <Ionicons
            name={taskIcon as any}
            size={18} // Slightly smaller icon for reduced height
            color={Colors.text.onPrimary}
          />
        </View>

        <View style={styles.contentSection}>
          <Text
            style={[styles.title, task.isCompleted && styles.completedText]}
          >
            {task.title}
          </Text>
          <Text style={styles.timeText}>
            {task.time}
            {task.duration && `, this task will take ${task.duration}`}
          </Text>
        </View>
      </View>

      {/* Three-circle indicator system with outer container */}
      <View style={styles.rightSection}>
        <View style={styles.indicatorOuterContainer}>
          <View style={styles.indicatorContainer}>
            {/* 1. Completion Status Circle */}
            <View
              style={[
                styles.statusCircle,
                task.isCompleted
                  ? styles.completedCircle
                  : task.isActive
                    ? styles.activeCircle
                    : styles.pendingCircle,
              ]}
            >
              {task.isCompleted ? (
                <Ionicons
                  name="checkmark"
                  size={18}
                  color={Colors.background.primary}
                />
              ) : task.isActive ? (
                <Ionicons
                  name="time"
                  size={16}
                  color={Colors.background.primary}
                />
              ) : null}
            </View>

            {/* 2. Intensity Circle (smallest) */}
            <View
              style={[
                styles.intensityCircle,
                { backgroundColor: getIntensityColor(task.intensity) },
              ]}
            />

            {/* 3. Streak Circle */}
            <View style={styles.streakCircle}>
              <Text style={styles.streakText}>{task.streak || 0}</Text>
            </View>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#FFFFFA", // Custom background color
    padding: Spacing.sm, // Reduced padding for less height
    borderRadius: BorderRadius.lg, // More rounded
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: "#E4E4E4",
    // Shadow removed
  },
  activeContainer: {
    borderColor: Colors.primary.main,
    backgroundColor: "#FFFFFA", // Keep same background when active
  },
  completedContainer: {
    opacity: 0.7,
  },
  leftSection: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  iconContainer: {
    width: 36, // Slightly smaller for reduced height
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    marginRight: Spacing.md,
  },
  contentSection: {
    flex: 1,
  },
  title: {
    ...Typography.bodyMedium,
    color: Colors.text.primary,
    fontWeight: "600",
    marginBottom: Spacing.xs,
  },
  completedText: {
    textDecorationLine: "line-through",
    color: Colors.text.muted,
  },
  timeText: {
    ...Typography.captionMedium,
    color: Colors.text.secondary,
  },
  rightSection: {
    alignItems: "center",
    justifyContent: "center",
  },
  indicatorOuterContainer: {
    backgroundColor: "#FAF9F5", // Custom background color for three-circle container
    borderRadius: BorderRadius.lg, // More rounded
    borderWidth: 1,
    borderColor: "#E4E4E4",
    padding: Spacing.sm,
  },
  indicatorContainer: {
    alignItems: "center",
    gap: Spacing.xs,
  },
  // Status Circle (top) - Completion/Active indicator - Same size as streak
  statusCircle: {
    width: 28, // Slightly smaller for overall reduced height
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#E4E4E4",
  },
  completedCircle: {
    backgroundColor: Colors.success.main,
  },
  activeCircle: {
    backgroundColor: Colors.warning.main,
  },
  pendingCircle: {
    backgroundColor: "#FAF9F5", // Match the container background
  },
  // Intensity Circle (smallest) - Difficulty indicator
  intensityCircle: {
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#E4E4E4",
  },
  // Streak Circle (bottom) - Same size as status circle
  streakCircle: {
    width: 28, // Match status circle size
    height: 28,
    borderRadius: 14,
    backgroundColor: "#FAF9F5", // Match container background
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#E4E4E4",
  },
  streakText: {
    ...Typography.captionSmall,
    color: Colors.text.primary,
    fontWeight: "700",
    fontSize: 12,
  },
});

export default DailyTaskCard;
