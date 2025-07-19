// src/components/productivity/ProductivityToolbar.tsx
import { BorderRadius, Colors, Spacing, Typography } from "@/constants";
import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";

interface ProductivityToolbarProps {
  completedTasks?: number;
  totalTasks?: number;
}

const ProductivityToolbar: React.FC<ProductivityToolbarProps> = ({
  completedTasks = 3,
  totalTasks = 8,
}) => {
  return (
    <View style={styles.wrapper}>
      <View style={styles.container}>
        {/* Task completion status */}
        <View style={styles.statusSection}>
          <View style={styles.completionIndicator}>
            <Ionicons
              name="checkmark-circle"
              size={16}
              color={Colors.success.main}
            />
            <Text style={styles.completionText}>
              {completedTasks} / {totalTasks} Tasks completed
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    alignItems: "flex-end", // Align to the right
    marginBottom: Spacing.lg,
  },
  container: {
    backgroundColor: Colors.background.card,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    alignSelf: "flex-start", // Fit content width
  },
  statusSection: {
    marginBottom: 0, // Remove bottom margin since no tools section
  },
  completionIndicator: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
  },
  completionText: {
    ...Typography.bodySmall,
    color: Colors.text.secondary,
    fontWeight: "500",
  },
  toolsSection: {
    flexDirection: "row",
    gap: Spacing.sm,
  },
  toolButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.background.secondary,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  toolButtonActive: {
    backgroundColor: Colors.primary.main,
  },
  toolContent: {
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  badge: {
    position: "absolute",
    top: -8,
    right: -8,
    backgroundColor: Colors.error.main,
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4,
  },
  badgeText: {
    ...Typography.captionSmall,
    color: Colors.text.onPrimary,
    fontSize: 10,
    fontWeight: "bold",
  },
});

export default ProductivityToolbar;
