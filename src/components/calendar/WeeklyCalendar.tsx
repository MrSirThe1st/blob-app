// src/components/calendar/WeeklyCalendar.tsx
import { BorderRadius, Colors, Spacing, Typography } from "@/constants";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface WeeklyCalendarProps {
  selectedDate?: Date;
  onDateSelect?: (date: Date) => void;
  completedDays?: string[]; // Array of date strings that have completed tasks
}

const WeeklyCalendar: React.FC<WeeklyCalendarProps> = ({
  selectedDate = new Date(),
  onDateSelect,
  completedDays = [],
}) => {
  const [currentWeek, setCurrentWeek] = useState(selectedDate);

  // Get start of current week (Monday)
  const getWeekStart = (date: Date) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
    return new Date(d.setDate(diff));
  };

  // Generate week days
  const getWeekDays = () => {
    const weekStart = getWeekStart(currentWeek);
    const days = [];

    for (let i = 0; i < 7; i++) {
      const day = new Date(weekStart);
      day.setDate(weekStart.getDate() + i);
      days.push(day);
    }

    return days;
  };

  const weekDays = getWeekDays();
  const today = new Date();

  // Format month/year for header
  const monthYear = currentWeek.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  const isToday = (date: Date) => {
    return date.toDateString() === today.toDateString();
  };

  const isSelected = (date: Date) => {
    return date.toDateString() === selectedDate.toDateString();
  };

  const isCompleted = (date: Date) => {
    const dateString = date.toISOString().split("T")[0];
    return completedDays.includes(dateString);
  };

  const navigateWeek = (direction: "prev" | "next") => {
    const newWeek = new Date(currentWeek);
    newWeek.setDate(currentWeek.getDate() + (direction === "next" ? 7 : -7));
    setCurrentWeek(newWeek);
  };

  const handleDatePress = (date: Date) => {
    onDateSelect?.(date);
  };

  const dayNames = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  return (
    <View style={styles.container}>
      {/* Header with month navigation */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.navButton}
          onPress={() => navigateWeek("prev")}
        >
          <Ionicons name="chevron-back" size={20} color={Colors.text.primary} />
        </TouchableOpacity>

        <Text style={styles.monthTitle}>{monthYear}</Text>

        <TouchableOpacity
          style={styles.navButton}
          onPress={() => navigateWeek("next")}
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
          {dayNames.map((dayName, index) => (
            <View key={dayName} style={styles.dayNameCell}>
              <Text style={styles.dayNameText}>{dayName}</Text>
            </View>
          ))}
        </View>

        {/* Dates row */}
        <View style={styles.datesRow}>
          {weekDays.map((date, index) => {
            const isSelectedDate = isSelected(date);
            const isTodayDate = isToday(date);
            const isCompletedDate = isCompleted(date);

            return (
              <TouchableOpacity
                key={index}
                style={styles.dateCell}
                onPress={() => handleDatePress(date)}
              >
                {/* Today's date gets special styling - simple colored circle */}
                {isTodayDate ? (
                  <>
                    <View style={styles.todayCircle}>
                      <Text style={styles.todayText}>{date.getDate()}</Text>
                    </View>
                    {/* Selection ring overlay for today when selected */}
                    {isSelectedDate && <View style={styles.selectionRing} />}
                  </>
                ) : (
                  <>
                    <Text
                      style={[
                        styles.dateText,
                        isSelectedDate && styles.selectedText,
                      ]}
                    >
                      {date.getDate()}
                    </Text>
                    {/* Selection ring overlay */}
                    {isSelectedDate && <View style={styles.selectionRing} />}
                  </>
                )}

                {/* Completion indicator */}
                {isCompletedDate && <View style={styles.completionDot} />}
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.background.card,
    borderRadius: BorderRadius.lg,
    padding: Spacing.sm, // Reduced from Spacing.md
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.md, // Reduced from Spacing.lg
  },
  navButton: {
    width: 28, // Reduced from 32
    height: 28, // Reduced from 32
    borderRadius: 14, // Adjusted for new size
    backgroundColor: Colors.background.secondary,
    alignItems: "center",
    justifyContent: "center",
  },
  monthTitle: {
    ...Typography.h3,
    color: Colors.text.primary,
    fontWeight: "600",
  },
  calendar: {
    gap: Spacing.xs, // Reduced from Spacing.sm
  },
  dayNamesRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  dayNameCell: {
    flex: 1,
    alignItems: "center",
    paddingVertical: Spacing.xs / 2, // Reduced padding
  },
  dayNameText: {
    ...Typography.captionSmall,
    color: Colors.text.secondary,
    fontWeight: "500",
  },
  datesRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  dateCell: {
    flex: 1,
    aspectRatio: 1,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: BorderRadius.sm,
    position: "relative",
  },
  todayCircle: {
    width: 28, // Reduced from 32
    height: 28, // Reduced from 32
    borderRadius: 14, // Adjusted for new size
    backgroundColor: Colors.primary.main,
    alignItems: "center",
    justifyContent: "center",
  },
  todayCell: {
    backgroundColor: Colors.primary.light,
  },
  selectionRing: {
    position: "absolute",
    width: 34, // Reduced from 40 to match smaller today circle
    height: 34, // Reduced from 40 to match smaller today circle
    borderWidth: 2,
    borderColor: Colors.primary.main,
    borderRadius: 17, // Adjusted for new size
    backgroundColor: "transparent",
    top: "50%",
    left: "50%",
    marginTop: -17, // Adjusted for new size
    marginLeft: -17, // Adjusted for new size
  },
  dateText: {
    ...Typography.bodyMedium,
    color: Colors.text.primary,
    fontWeight: "500",
  },
  todayText: {
    color: Colors.text.onPrimary, // White text on colored background
    fontWeight: "700",
  },
  selectedText: {
    color: Colors.primary.main,
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
});

export default WeeklyCalendar;
