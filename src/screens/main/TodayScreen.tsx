// src/screens/main/TodayScreen.tsx (Calendar-based UI)
import FloatingAIAssistant from "@/components/ai/FloatingAIAssistant";
import WeeklyCalendar from "@/components/calendar/WeeklyCalendar";
import ProductivityToolbar from "@/components/productivity/ProductivityToolbar";
import DailyTaskCard from "@/components/tasks/DailyTaskCard";
import FreeTimeBlock from "@/components/tasks/FreeTimeBlock";
import GymWorkoutBottomSheet from "@/components/tasks/GymWorkoutBottomSheet";
import TaskActionBottomSheet from "@/components/tasks/TaskActionBottomSheet";
import TaskDetailBottomSheet from "@/components/tasks/TaskDetailBottomSheet";
import { Colors, Spacing, Typography } from "@/constants";
import { useAuth } from "@/hooks/useAuth";
import { useTasks } from "@/hooks/useTasks";
import WorkoutExecutionScreen from "@/screens/workout/WorkoutExecutionScreen";
import React, { useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const TodayScreen: React.FC = () => {
  const { userProfile } = useAuth();
  const { tasks, loadTasks, completeTask } = useTasks(userProfile?.id);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showTaskActions, setShowTaskActions] = useState(false);
  const [showTaskDetails, setShowTaskDetails] = useState(false);
  const [showGymWorkout, setShowGymWorkout] = useState(false);
  const [showWorkoutExecution, setShowWorkoutExecution] = useState(false);
  const [selectedTask, setSelectedTask] = useState<any>(null);

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

  const handleTaskLongPress = (task: any) => {
    setSelectedTask(task);
    setShowTaskActions(true);
  };

  const handleTaskPress = (task: any) => {
    setSelectedTask(task);

    // Check if it's a workout task with workout data
    if (
      task.workoutData &&
      (task.type === "milestone" || getTaskCardType(task.type) === "workout")
    ) {
      setShowGymWorkout(true);
    } else {
      setShowTaskDetails(true);
    }
  };

  const handleTaskAction = (actionId: string) => {
    if (!selectedTask) return;

    switch (actionId) {
      case "edit_manually":
        console.log("Edit manually:", selectedTask.title);
        break;
      case "connect":
        console.log("Connect:", selectedTask.title);
        break;
      case "delete":
        console.log("Delete:", selectedTask.title);
        break;
      case "edit_with_ai":
        console.log("Edit with AI:", selectedTask.title);
        break;
      case "reschedule":
        console.log("Reschedule:", selectedTask.title);
        break;
      case "cancel":
        console.log("Cancel action");
        break;
      default:
        break;
    }

    setSelectedTask(null);
  };

  const closeTaskActions = () => {
    setShowTaskActions(false);
    setSelectedTask(null);
  };

  const closeTaskDetails = () => {
    setShowTaskDetails(false);
    setSelectedTask(null);
  };

  const closeGymWorkout = () => {
    setShowGymWorkout(false);
    setSelectedTask(null);
  };

  const handleStartWorkout = (task: any) => {
    console.log("Starting workout:", task.title);
    setShowWorkoutExecution(true);
    // Keep the selected task for the workout execution screen
  };

  const closeWorkoutExecution = () => {
    setShowWorkoutExecution(false);
  };

  // Convert task type to DailyTaskCard type
  const getTaskCardType = (taskType: string) => {
    switch (taskType) {
      case "daily_habit":
        return "personal";
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
      title: "Upper Body Strength Training",
      scheduled_date: new Date().toISOString().split("T")[0],
      suggested_time_slot: "7:30 AM",
      estimated_duration: 60,
      type: "milestone",
      status: "in_progress",
      // Workout-specific data for gym module
      workoutData: {
        type: "strength",
        category: "upper_body",
        targetMuscles: ["chest", "shoulders", "triceps", "biceps"],
        exercises: [
          {
            id: "ex-1",
            name: "Bench Press",
            sets: 4,
            reps: "8-10",
            weight: "135 lbs",
            restTime: "2-3 min",
            notes: "Focus on controlled movement",
            completed: false,
            setsCompleted: 0,
          },
          {
            id: "ex-2",
            name: "Incline Dumbbell Press",
            sets: 3,
            reps: "10-12",
            weight: "40 lbs each",
            restTime: "90 sec",
            notes: "Full range of motion",
            completed: false,
            setsCompleted: 0,
          },
          {
            id: "ex-3",
            name: "Shoulder Press",
            sets: 3,
            reps: "8-10",
            weight: "30 lbs each",
            restTime: "90 sec",
            notes: "Keep core tight",
            completed: false,
            setsCompleted: 0,
          },
          {
            id: "ex-4",
            name: "Pull-ups",
            sets: 3,
            reps: "6-8",
            weight: "bodyweight",
            restTime: "2 min",
            notes: "Assisted if needed",
            completed: false,
            setsCompleted: 0,
          },
          {
            id: "ex-5",
            name: "Tricep Dips",
            sets: 3,
            reps: "10-12",
            weight: "bodyweight",
            restTime: "90 sec",
            notes: "Full extension",
            completed: false,
            setsCompleted: 0,
          },
        ],
        warmup: {
          duration: 10,
          exercises: ["Arm circles", "Light cardio", "Dynamic stretching"],
        },
        cooldown: {
          duration: 10,
          exercises: ["Static stretching", "Foam rolling"],
        },
        totalDuration: 60,
        difficulty: "intermediate",
        equipment: ["barbell", "dumbbells", "pull-up bar"],
        estimatedCalories: 250,
      },
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
      {!showWorkoutExecution ? (
        <SafeAreaView style={styles.container}>
          <ScrollView
            style={styles.content}
            showsVerticalScrollIndicator={false}
          >
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
                      onPress={() => handleTaskPress(task)}
                      onComplete={() => handleTaskToggle(task.id)}
                      onTimer={() => console.log("Start timer for", task.id)}
                      onLongPress={() => handleTaskLongPress(task)}
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
      ) : (
        <WorkoutExecutionScreen
          visible={true}
          onClose={closeWorkoutExecution}
          task={selectedTask}
        />
      )}

      <FloatingAIAssistant onSendMessage={handleAIAssistantMessage} />

      <TaskActionBottomSheet
        visible={showTaskActions}
        onClose={closeTaskActions}
        onAction={handleTaskAction}
        taskTitle={selectedTask?.title}
      />

      <TaskDetailBottomSheet
        visible={showTaskDetails}
        onClose={closeTaskDetails}
        task={selectedTask}
      />

      <GymWorkoutBottomSheet
        visible={showGymWorkout}
        onClose={closeGymWorkout}
        task={selectedTask}
        onStartWorkout={handleStartWorkout}
      />
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
