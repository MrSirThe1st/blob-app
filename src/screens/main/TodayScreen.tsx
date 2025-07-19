// src/screens/main/TodayScreen.tsx (Calendar-based UI)
import FloatingAIAssistant from "@/components/ai/FloatingAIAssistant";
import WeeklyCalendar from "@/components/calendar/WeeklyCalendar";
import ProductivityToolbar from "@/components/productivity/ProductivityToolbar";
import DailyTaskCard from "@/components/tasks/DailyTaskCard";
import FreeTimeBlock from "@/components/tasks/FreeTimeBlock";
import { Colors, Spacing, Typography } from "@/constants";
import { useAuth } from "@/hooks/useAuth";
import { useTasks } from "@/hooks/useTasks";
import React, { useEffect, useState } from "react";
import { SafeAreaView, ScrollView, StyleSheet, Text, View } from "react-native";

const TodayScreen: React.FC = () => {
  const { userProfile } = useAuth();
  const { tasks, loadTasks, completeTask } = useTasks(userProfile?.id);
  const [selectedDate, setSelectedDate] = useState(new Date());

  useEffect(() => {
    if (userProfile?.id) {
      loadTasks();
    }
  }, [userProfile?.id, loadTasks]);

  // Filter tasks for selected date
  const selectedDateTasks = tasks.filter((task) => {
    const taskDate = new Date(task.scheduled_date);
    return taskDate.toDateString() === selectedDate.toDateString();
  });

  // Mock completion data for calendar
  const completedDays = tasks
    .filter((task) => task.status === "completed")
    .map((task) => new Date(task.scheduled_date).toDateString());

  const handleTaskToggle = async (taskId: string) => {
    try {
      await completeTask(taskId);
    } catch (error) {
      console.error("Failed to complete task:", error);
    }
  };

  const handleAIAssistantMessage = (message: string) => {
    // Handle AI assistant message
    console.log("AI message:", message);
  };

  // Convert task type to DailyTaskCard type
  const getTaskCardType = (taskType: string) => {
    switch (taskType) {
      case "daily_habit":
        return "habit";
      case "weekly_task":
      case "one_time":
        return "work";
      case "milestone":
        return "workout";
      default:
        return "work";
    }
  };

  // Mock intensity based on task type (you can replace this with real data)
  const getTaskIntensity = (task: any) => {
    if (task.type === "daily_habit") return "easy";
    if (task.type === "milestone") return "hard";
    return "medium";
  };

  // Mock streak count (you can replace this with real data)
  const getTaskStreak = (task: any) => {
    // This should come from your database
    return Math.floor(Math.random() * 20) + 1; // Mock data: 1-20
  };

  // Temporary mock tasks to demonstrate the new design (remove this later)
  const mockTasks = [
    {
      id: "mock-1",
      title: "Make your bed",
      scheduled_date: new Date().toISOString().split("T")[0],
      suggested_time_slot: "7:00 AM",
      estimated_duration: 5,
      type: "daily_habit",
      status: "completed",
    },
    {
      id: "mock-2",
      title: "Workout",
      scheduled_date: new Date().toISOString().split("T")[0],
      suggested_time_slot: "7:30 AM",
      estimated_duration: 60,
      type: "milestone",
      status: "in_progress",
    },
    {
      id: "mock-3",
      title: "Work on project",
      scheduled_date: new Date().toISOString().split("T")[0],
      suggested_time_slot: "1:00 PM",
      estimated_duration: 150,
      type: "weekly_task",
      status: "pending",
    },
  ];

  // Use mock tasks if no real tasks exist for today
  const displayTasks =
    selectedDateTasks.length > 0 ? selectedDateTasks : mockTasks;

  // Mock productivity data
  const productivityData = {
    completedTasks: displayTasks.filter((task) => task.status === "completed")
      .length,
    totalTasks: displayTasks.length,
  };

  return (
    <>
      <SafeAreaView style={styles.container}>
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Weekly Calendar */}
          <View style={styles.section}>
            <WeeklyCalendar
              selectedDate={selectedDate}
              onDateSelect={setSelectedDate}
              completedDays={completedDays}
            />
          </View>

          {/* Productivity Toolbar */}
          <ProductivityToolbar
            completedTasks={productivityData.completedTasks}
            totalTasks={productivityData.totalTasks}
          />

          {/* Tasks List */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              {selectedDate.toDateString() === new Date().toDateString()
                ? "Today's Schedule"
                : `Schedule for ${selectedDate.toLocaleDateString()}`}
            </Text>

            {displayTasks.length === 0 ? (
              <FreeTimeBlock
                startTime="9:00 AM"
                endTime="6:00 PM"
                onAddTask={() => console.log("Add task")}
                isActive={
                  selectedDate.toDateString() === new Date().toDateString()
                }
              />
            ) : (
              <>
                {displayTasks.map((task) => (
                  <DailyTaskCard
                    key={task.id}
                    task={{
                      id: task.id,
                      title: task.title,
                      time: task.suggested_time_slot || "9:00 AM",
                      duration: task.estimated_duration
                        ? `${task.estimated_duration}m`
                        : "30m",
                      type: getTaskCardType(task.type) as any,
                      isCompleted: task.status === "completed",
                      isActive: task.status === "in_progress",
                      intensity: getTaskIntensity(task),
                      streak: getTaskStreak(task),
                    }}
                    onComplete={() => handleTaskToggle(task.id)}
                    onTimer={() => console.log("Start timer for", task.id)}
                  />
                ))}

                {/* Add some free time blocks between tasks */}
                {selectedDateTasks.length > 0 && (
                  <FreeTimeBlock
                    startTime="2:00 PM"
                    endTime="3:00 PM"
                    onAddTask={() => console.log("Add task")}
                  />
                )}
              </>
            )}
          </View>
        </ScrollView>
      </SafeAreaView>

      <FloatingAIAssistant onSendMessage={handleAIAssistantMessage} />
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.primary,
  },
  header: {
    padding: Spacing.lg,
    paddingBottom: Spacing.md,
  },
  title: {
    ...Typography.h1,
    color: Colors.text.primary,
    fontWeight: "700",
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
  },
  section: {
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    ...Typography.bodyLarge,
    color: Colors.text.primary,
    fontWeight: "600",
    marginBottom: Spacing.md,
  },
});

export default TodayScreen;
