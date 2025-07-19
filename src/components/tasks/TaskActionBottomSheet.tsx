// src/components/tasks/TaskActionBottomSheet.tsx
import { BorderRadius, Colors, Spacing, Typography } from "@/constants";
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useRef } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import RBSheet from "react-native-raw-bottom-sheet";

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
  const refRBSheet = useRef<any>(null);

  useEffect(() => {
    if (visible) {
      refRBSheet.current?.open();
    } else {
      refRBSheet.current?.close();
    }
  }, [visible]);

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
      height={400}
    >
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
    </RBSheet>
  );
};

const styles = StyleSheet.create({
  titleSection: {
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral[200],
    paddingBottom: Spacing.md,
    marginTop: Spacing.sm,
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
