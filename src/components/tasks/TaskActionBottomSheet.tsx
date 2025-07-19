// src/components/tasks/TaskActionBottomSheet.tsx
import { BorderRadius, Colors, Spacing, Typography } from "@/constants";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";

interface TaskActionOption {
  id: string;
  label: string;
  icon: string;
  color?: string;
  destructive?: boolean;
}

interface TaskActionBottomSheetProps {
  visible: boolean;
  onClose: () => void;
  onAction: (actionId: string) => void;
  taskTitle?: string;
}

const TaskActionBottomSheet: React.FC<TaskActionBottomSheetProps> = ({
  visible,
  onClose,
  onAction,
  taskTitle,
}) => {
  const actions: TaskActionOption[] = [
    {
      id: "edit_manually",
      label: "Edit manually",
      icon: "create-outline",
      color: Colors.text.primary,
    },
    {
      id: "connect",
      label: "connect",
      icon: "link-outline",
      color: Colors.text.primary,
    },
    {
      id: "delete",
      label: "Delete",
      icon: "trash-outline",
      color: Colors.text.primary,
    },
    {
      id: "edit_with_ai",
      label: "Edit with AI",
      icon: "sparkles",
      color: Colors.primary.main,
    },
    {
      id: "reschedule",
      label: "Reschedule",
      icon: "calendar-outline",
      color: Colors.primary.main,
    },
    {
      id: "cancel",
      label: "Cancel",
      icon: "close-outline",
      color: Colors.error.main,
    },
  ];

  const handleAction = (actionId: string) => {
    onAction(actionId);
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={styles.bottomSheet}>
              {/* Handle bar */}
              <View style={styles.handleBar} />

              {/* Task title if provided */}
              {taskTitle && (
                <View style={styles.titleSection}>
                  <Text style={styles.taskTitle} numberOfLines={2}>
                    {taskTitle}
                  </Text>
                </View>
              )}

              {/* Action options */}
              <View style={styles.actionsContainer}>
                {actions.map((action, index) => (
                  <TouchableOpacity
                    key={action.id}
                    style={[
                      styles.actionItem,
                      index === actions.length - 1 && styles.lastActionItem,
                    ]}
                    onPress={() => handleAction(action.id)}
                  >
                    <View style={styles.actionLeft}>
                      <View
                        style={[
                          styles.actionIcon,
                          { backgroundColor: action.color + "15" }, // 15% opacity
                        ]}
                      >
                        <Ionicons
                          name={action.icon as any}
                          size={18}
                          color={action.color}
                        />
                      </View>
                      <Text
                        style={[
                          styles.actionLabel,
                          { color: action.color },
                          action.destructive && styles.destructiveText,
                        ]}
                      >
                        {action.label}
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  bottomSheet: {
    backgroundColor: Colors.background.card,
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    paddingBottom: Spacing.xl,
    maxHeight: "80%",
  },
  handleBar: {
    width: 36,
    height: 4,
    backgroundColor: Colors.neutral[300],
    borderRadius: 2,
    alignSelf: "center",
    marginTop: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  titleSection: {
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral[200],
    paddingBottom: Spacing.md,
  },
  taskTitle: {
    ...Typography.h3,
    color: Colors.text.primary,
    fontWeight: "600",
    textAlign: "center",
  },
  actionsContainer: {
    paddingHorizontal: Spacing.lg,
  },
  actionItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral[200],
  },
  lastActionItem: {
    borderBottomWidth: 0,
  },
  actionLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  actionIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    marginRight: Spacing.md,
  },
  actionLabel: {
    ...Typography.bodyLarge,
    fontWeight: "500",
  },
  destructiveText: {
    color: Colors.error.main,
  },
});

export default TaskActionBottomSheet;
