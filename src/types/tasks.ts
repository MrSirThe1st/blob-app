// src/types/tasks.ts
export const TaskStatus = {
  PENDING: "pending",
  IN_PROGRESS: "in_progress",
  COMPLETED: "completed",
  SKIPPED: "skipped",
  RESCHEDULED: "rescheduled",
} as const;

export const TaskType = {
  DAILY_HABIT: "daily_habit",
  WEEKLY_TASK: "weekly_task",
  MILESTONE: "milestone",
  ONE_TIME: "one_time",
  RECURRING: "recurring",
} as const;

export const TaskPriority = {
  HIGH: "high",
  MEDIUM: "medium",
  LOW: "low",
} as const;

export type TaskStatusType = (typeof TaskStatus)[keyof typeof TaskStatus];
export type TaskTypeType = (typeof TaskType)[keyof typeof TaskType];
export type TaskPriorityType = (typeof TaskPriority)[keyof typeof TaskPriority];

export interface Task {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  type: TaskTypeType;
  priority: TaskPriorityType;
  status: TaskStatusType;
  estimated_duration?: number; // in minutes
  suggested_time_slot?: string;
  related_goal_id?: string;
  energy_level_required?: "low" | "medium" | "high";
  difficulty_level?: number;
  context_requirements?: string;
  success_criteria?: string;
  scheduled_date: string; // YYYY-MM-DD format
  completed_at?: string;
  created_at: string;
  updated_at: string;
}

export interface TaskStats {
  total: number;
  completed: number;
  pending: number;
  in_progress: number;
  completion_rate: number;
}
