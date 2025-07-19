// src/components/tasks/FreeTimeBlock.tsx
import { BorderRadius, Colors, Spacing, Typography } from "@/constants";
import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface FreeTimeBlockProps {
  startTime: string;
  endTime: string;
  onAddTask?: () => void;
  isActive?: boolean;
}

const FreeTimeBlock: React.FC<FreeTimeBlockProps> = ({
  startTime,
  endTime,
  onAddTask,
  isActive = false,
}) => {
  return (
    <TouchableOpacity
      style={[styles.container, isActive && styles.activeContainer]}
      onPress={onAddTask}
    >
      <View style={styles.content}>
        <View style={styles.leftSection}>
          <View style={styles.iconContainer}>
            <Ionicons name="time-outline" size={16} color={Colors.text.muted} />
          </View>

          <View style={styles.textSection}>
            <Text style={styles.title}>Free Time</Text>
            <Text style={styles.timeText}>
              {startTime}, {endTime}
            </Text>
          </View>
        </View>

        <View style={styles.rightSection}>
          {isActive && (
            <View style={styles.activeIndicator}>
              <View style={styles.activeDot} />
            </View>
          )}

          <TouchableOpacity style={styles.addButton} onPress={onAddTask}>
            <Ionicons name="add" size={16} color={Colors.text.muted} />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.background.tertiary,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border.light,
    borderStyle: "dashed",
  },
  activeContainer: {
    backgroundColor: Colors.background.accent,
    borderColor: Colors.primary.light,
    borderStyle: "solid",
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: Spacing.md,
  },
  leftSection: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.background.secondary,
    alignItems: "center",
    justifyContent: "center",
    marginRight: Spacing.md,
  },
  textSection: {
    flex: 1,
  },
  title: {
    ...Typography.bodyMedium,
    color: Colors.text.secondary,
    fontWeight: "500",
    marginBottom: Spacing.xs,
  },
  timeText: {
    ...Typography.captionMedium,
    color: Colors.text.muted,
  },
  rightSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  activeIndicator: {
    alignItems: "center",
    justifyContent: "center",
  },
  activeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.success.main,
  },
  addButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.background.secondary,
    alignItems: "center",
    justifyContent: "center",
  },
});

export default FreeTimeBlock;
