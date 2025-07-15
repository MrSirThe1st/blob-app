// src/services/scheduling/AISchedulingEngine.ts
import { supabase } from "@/services/api/supabase";
import { openAIService } from "@/services/api/openai";
import { TaskType, TaskPriority } from "@/types/tasks";

// Interfaces for the AI Scheduling Engine
interface TimeBlock {
  startTime: string;
  endTime: string;
  taskId: string;
  taskTitle: string;
  type: string;
  priority: string;
  energyLevel: "low" | "medium" | "high";
  focusType: string;
  contextSwitchMinimized: boolean;
  optimizationReason: string;
}

interface BufferBlock {
  startTime: string;
  endTime: string;
  purpose: string;
}

interface EnergyOptimization {
  highEnergyTasks: string[];
  lowEnergyTasks: string[];
  energyBreaks: string[];
}

interface WorkLifeBalance {
  workTime: number;
  personalTime: number;
  breakTime: number;
  balanceScore: number;
}

interface AISchedule {
  timeBlocks: TimeBlock[];
  bufferBlocks: BufferBlock[];
  recommendations: string[];
  energyOptimization: EnergyOptimization;
  workLifeBalance: WorkLifeBalance;
  generatedAt?: string;
  optimizationScore?: number;
  adaptability?: number;
}

interface UserData {
  preferences: any;
  onboarding: any;
  xpData: any;
  behaviorHistory: any[];
  energyPattern: EnergyPattern;
  productivityWindows: ProductivityWindow[];
}

interface EnergyPattern {
  type: string;
  peak: string;
  low: string;
  secondary_peak: string;
}

interface ProductivityWindow {
  time: string;
  type: string;
  confidence: number;
}

interface CalendarConstraints {
  workHours: { start: string; end: string };
  breaks: { lunch?: string };
  blockedTimes: string[];
  preferredWorkTimes: string[];
  commuteTimes: string[];
}

interface TasksForDay {
  scheduled: any[];
  habits: any[];
  overdue: any[];
}

export class AISchedulingEngine {
  // Main scheduling function
  async generateDailySchedule(
    userId: string,
    date?: string
  ): Promise<AISchedule | null> {
    try {
      const targetDate = date || new Date().toISOString().split("T")[0];

      // 1. Gather user data
      const userData = await this.gatherUserData(userId);

      // 2. Get tasks for the day
      const tasks = await this.getTasksForDay(userId, targetDate);

      // 3. Get user's calendar constraints
      const calendarConstraints = await this.getCalendarConstraints(
        userId,
        targetDate
      );

      // 4. Generate optimized schedule using AI
      const schedule = await this.generateAIOptimizedSchedule(
        userData,
        tasks,
        calendarConstraints,
        targetDate
      );

      // 5. Save schedule to database
      const savedSchedule = await this.saveScheduleToDatabase(
        userId,
        targetDate,
        schedule
      );

      return savedSchedule;
    } catch (error) {
      console.error("Error generating daily schedule:", error);
      throw new Error("Failed to generate daily schedule");
    }
  }

  // Gather comprehensive user data for scheduling
  private async gatherUserData(userId: string): Promise<UserData> {
    const [preferences, onboarding, xpData, behaviorHistory] =
      await Promise.all([
        this.getUserPreferences(userId),
        this.getOnboardingData(userId),
        this.getUserXPData(userId),
        this.getUserBehaviorHistory(userId),
      ]);

    return {
      preferences,
      onboarding,
      xpData,
      behaviorHistory,
      energyPattern: this.analyzeEnergyPattern(behaviorHistory),
      productivityWindows: this.identifyProductivityWindows(behaviorHistory),
    };
  }

  // Get tasks that need to be scheduled for the day
  private async getTasksForDay(
    userId: string,
    date: string
  ): Promise<TasksForDay> {
    // Get tasks specifically scheduled for this day
    const { data: scheduledTasks } = await supabase
      .from("tasks")
      .select("*")
      .eq("user_id", userId)
      .eq("scheduled_date", date)
      .neq("status", "completed");

    // Get daily habits that should occur every day
    const { data: dailyHabits } = await supabase
      .from("tasks")
      .select("*")
      .eq("user_id", userId)
      .eq("type", TaskType.DAILY_HABIT)
      .neq("status", "completed");

    // Get overdue tasks from previous days
    const { data: overdueTasks } = await supabase
      .from("tasks")
      .select("*")
      .eq("user_id", userId)
      .lt("scheduled_date", date)
      .neq("status", "completed")
      .limit(3); // Limit to prevent overwhelming

    return {
      scheduled: scheduledTasks || [],
      habits: dailyHabits || [],
      overdue: overdueTasks || [],
    };
  }

  // Get calendar constraints (meetings, appointments, etc.)
  private async getCalendarConstraints(
    userId: string,
    date: string
  ): Promise<CalendarConstraints> {
    // This integrates with your existing user preferences
    const { data: preferences } = await supabase
      .from("user_preferences")
      .select("*")
      .eq("user_id", userId)
      .single();

    const workHours = preferences?.work_hours || {
      start: "09:00",
      end: "17:00",
    };
    const breaks = preferences?.break_preferences || { lunch: "12:00-13:00" };

    return {
      workHours,
      breaks,
      blockedTimes: preferences?.blocked_times || [],
      preferredWorkTimes: preferences?.preferred_work_times || [],
      commuteTimes: preferences?.commute_times || [],
    };
  }

  // Generate AI-optimized schedule
  private async generateAIOptimizedSchedule(
    userData: UserData,
    tasks: TasksForDay,
    constraints: CalendarConstraints,
    date: string
  ): Promise<AISchedule> {
    const allTasks = [...tasks.scheduled, ...tasks.habits, ...tasks.overdue];

    if (allTasks.length === 0) {
      return {
        timeBlocks: [],
        bufferBlocks: [],
        recommendations: [
          "No tasks scheduled for today. Great time for planning or self-care!",
        ],
        energyOptimization: {
          highEnergyTasks: [],
          lowEnergyTasks: [],
          energyBreaks: [],
        },
        workLifeBalance: {
          workTime: 0,
          personalTime: 8,
          breakTime: 1,
          balanceScore: 1,
        },
      };
    }

    const prompt = this.buildSchedulingPrompt(
      userData,
      allTasks,
      constraints,
      date
    );

    try {
      const response = await openAIService.makeRequest(
        [
          {
            role: "system",
            content: this.getSystemPrompt(),
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        [
          {
            name: "generate_daily_schedule",
            description:
              "Generate an optimized daily schedule with time blocks",
            parameters: {
              type: "object",
              properties: {
                timeBlocks: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      startTime: { type: "string" },
                      endTime: { type: "string" },
                      taskId: { type: "string" },
                      taskTitle: { type: "string" },
                      type: { type: "string" },
                      priority: { type: "string" },
                      energyLevel: { type: "string" },
                      focusType: { type: "string" },
                      contextSwitchMinimized: { type: "boolean" },
                      optimizationReason: { type: "string" },
                    },
                  },
                },
                bufferBlocks: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      startTime: { type: "string" },
                      endTime: { type: "string" },
                      purpose: { type: "string" },
                    },
                  },
                },
                recommendations: {
                  type: "array",
                  items: { type: "string" },
                },
                energyOptimization: {
                  type: "object",
                  properties: {
                    highEnergyTasks: {
                      type: "array",
                      items: { type: "string" },
                    },
                    lowEnergyTasks: {
                      type: "array",
                      items: { type: "string" },
                    },
                    energyBreaks: { type: "array", items: { type: "string" } },
                  },
                },
                workLifeBalance: {
                  type: "object",
                  properties: {
                    workTime: { type: "number" },
                    personalTime: { type: "number" },
                    breakTime: { type: "number" },
                    balanceScore: { type: "number" },
                  },
                },
              },
            },
          },
        ]
      );

      if (!response.function_call?.arguments) {
        throw new Error("No function call response from OpenAI");
      }

      const schedule: AISchedule = JSON.parse(response.function_call.arguments);

      // Add metadata and validation
      return {
        ...schedule,
        generatedAt: new Date().toISOString(),
        optimizationScore: this.calculateOptimizationScore(schedule, userData),
        adaptability: this.calculateAdaptabilityScore(schedule),
      };
    } catch (error) {
      console.error("Error calling OpenAI for schedule generation:", error);
      // Return a basic fallback schedule
      return this.getFallbackSchedule(allTasks);
    }
  }

  private getSystemPrompt(): string {
    return `You are an expert AI scheduling assistant that creates personalized, science-based daily schedules. Your goal is to maximize productivity, well-being, and goal achievement while respecting human energy patterns and preferences.

CORE PRINCIPLES:
1. Energy Optimization: Schedule high-energy tasks during peak energy windows, low-energy tasks during natural dips
2. Context Switching Minimization: Group similar tasks together to maintain flow states
3. Work-Life Balance: Ensure adequate time for work, personal life, and recovery
4. Habit Formation: Prioritize consistency for daily habits at optimal times
5. Flexibility: Build in buffer time for unexpected events and transitions
6. Goal Alignment: Ensure tasks contribute meaningfully to user's long-term objectives

SCHEDULING SCIENCE:
- Most people have peak cognitive performance 2-4 hours after waking
- Energy typically dips after lunch (1-3 PM) - good for routine/administrative tasks
- Creative work often benefits from either peak energy or relaxed states
- Physical activity can boost energy for subsequent mental work
- Context switching has a 15-25 minute cognitive cost
- Ultradian rhythms suggest 90-120 minute work blocks with breaks

OUTPUT REQUIREMENTS:
- Create realistic time blocks with specific start/end times
- Provide clear reasoning for scheduling decisions
- Include buffer time between different types of activities
- Suggest energy management strategies
- Balance challenge with achievability
- Consider commute, meals, and transition times`;
  }

  private buildSchedulingPrompt(
    userData: UserData,
    tasks: any[],
    constraints: CalendarConstraints,
    date: string
  ): string {
    const dayOfWeek = new Date(date).toLocaleDateString("en-US", {
      weekday: "long",
    });

    return `Create an optimized daily schedule for ${dayOfWeek}, ${date}.

USER PROFILE:
Energy Pattern: ${userData.energyPattern.type} (Peak: ${userData.energyPattern.peak}, Low: ${userData.energyPattern.low})
Work Style: ${userData.onboarding?.work_style || "Balanced"}
Experience Level: ${userData.xpData?.level || 1} (Total XP: ${userData.xpData?.total_xp || 0})

PRODUCTIVITY WINDOWS:
${userData.productivityWindows.map((window) => `${window.time}: ${window.type} (${window.confidence}% confidence)`).join("\n")}

TIME CONSTRAINTS:
Work Hours: ${constraints.workHours.start} - ${constraints.workHours.end}
Lunch Break: ${constraints.breaks.lunch || "12:00-13:00"}
Blocked Times: ${constraints.blockedTimes.length > 0 ? constraints.blockedTimes.join(", ") : "None"}

TASKS TO SCHEDULE (${tasks.length} total):
${tasks
  .map(
    (task) => `
- ${task.title} (${task.type})
  Priority: ${task.priority} | Duration: ${task.estimated_duration || 30} min
  Energy Required: ${task.energy_level_required || "Medium"}
  Difficulty: ${task.difficulty_level || 3}/5
`
  )
  .join("\n")}

SPECIAL CONSIDERATIONS:
- This is a ${dayOfWeek} - adjust energy expectations accordingly
- ${tasks.filter((t) => t.type === TaskType.DAILY_HABIT).length} daily habits need consistent timing
- ${tasks.filter((t) => t.priority === TaskPriority.HIGH).length} high-priority tasks require peak energy
- Include 15-minute buffers between different task types
- Ensure at least 3 genuine breaks throughout the day

Please create a realistic, personalized schedule that this user can actually follow and feel successful with.`;
  }

  // Calculate optimization score for the generated schedule
  private calculateOptimizationScore(
    schedule: AISchedule,
    userData: UserData
  ): number {
    let score = 0;
    const maxScore = 100;

    // Energy alignment (30 points)
    const energyAlignment = this.assessEnergyAlignment(
      schedule.timeBlocks,
      userData.energyPattern
    );
    score += energyAlignment * 30;

    // Context switching minimization (20 points)
    const contextScore = this.assessContextSwitching(schedule.timeBlocks);
    score += contextScore * 20;

    // Work-life balance (20 points)
    const balanceScore = schedule.workLifeBalance?.balanceScore || 0.7;
    score += balanceScore * 20;

    // Buffer time adequacy (15 points)
    const bufferScore = this.assessBufferTime(
      schedule.timeBlocks,
      schedule.bufferBlocks
    );
    score += bufferScore * 15;

    // Task priority alignment (15 points)
    const priorityScore = this.assessPriorityAlignment(
      schedule.timeBlocks,
      userData.energyPattern
    );
    score += priorityScore * 15;

    return Math.min(score, maxScore);
  }

  // Calculate how adaptable the schedule is to changes
  private calculateAdaptabilityScore(schedule: AISchedule): number {
    const bufferTime =
      schedule.bufferBlocks?.reduce((total, block) => {
        const duration = this.calculateBlockDuration(
          block.startTime,
          block.endTime
        );
        return total + duration;
      }, 0) || 0;

    const totalScheduledTime =
      schedule.timeBlocks?.reduce((total, block) => {
        const duration = this.calculateBlockDuration(
          block.startTime,
          block.endTime
        );
        return total + duration;
      }, 0) || 0;

    const bufferRatio =
      totalScheduledTime > 0 ? bufferTime / totalScheduledTime : 0;

    // Ideal buffer ratio is around 15-25%
    if (bufferRatio >= 0.15 && bufferRatio <= 0.25) return 1.0;
    if (bufferRatio >= 0.1 && bufferRatio < 0.35) return 0.8;
    if (bufferRatio >= 0.05 && bufferRatio < 0.45) return 0.6;
    return 0.4;
  }

  // Energy pattern analysis helper functions
  private analyzeEnergyPattern(behaviorHistory: any[]): EnergyPattern {
    // Analyze user's historical data to determine energy patterns
    const defaultPattern: EnergyPattern = {
      type: "Standard",
      peak: "09:00-11:00",
      low: "14:00-16:00",
      secondary_peak: "19:00-21:00",
    };

    if (!behaviorHistory || behaviorHistory.length === 0) {
      return defaultPattern;
    }

    // Analyze completion times and success rates to infer energy patterns
    const hourlyPerformance: Record<
      number,
      { total: number; successful: number }
    > = {};

    behaviorHistory.forEach((entry) => {
      if (entry.completed_at) {
        const hour = new Date(entry.completed_at).getHours();
        if (!hourlyPerformance[hour]) {
          hourlyPerformance[hour] = { total: 0, successful: 0 };
        }
        hourlyPerformance[hour].total++;
        if (entry.status === "completed") {
          hourlyPerformance[hour].successful++;
        }
      }
    });

    // Find peak performance hours
    const performanceScores = Object.entries(hourlyPerformance).map(
      ([hour, data]) => ({
        hour: parseInt(hour),
        score: data.total > 0 ? data.successful / data.total : 0,
      })
    );

    const sortedHours = performanceScores
      .filter((h) => h.score > 0 && h.hour >= 6 && h.hour <= 22) // Reasonable waking hours
      .sort((a, b) => b.score - a.score);

    if (sortedHours.length > 0) {
      const peakHour = sortedHours[0].hour;
      return {
        type: "Analyzed",
        peak: `${peakHour.toString().padStart(2, "0")}:00-${(peakHour + 2).toString().padStart(2, "0")}:00`,
        low: "14:00-16:00", // Common post-lunch dip
        secondary_peak: peakHour < 12 ? "19:00-21:00" : "09:00-11:00",
      };
    }

    return defaultPattern;
  }

  private identifyProductivityWindows(
    behaviorHistory: any[]
  ): ProductivityWindow[] {
    const defaultWindows: ProductivityWindow[] = [
      { time: "09:00-11:00", type: "High Focus", confidence: 75 },
      { time: "11:00-12:00", type: "Collaborative", confidence: 70 },
      { time: "14:00-16:00", type: "Administrative", confidence: 65 },
      { time: "16:00-18:00", type: "Creative", confidence: 60 },
    ];

    if (!behaviorHistory || behaviorHistory.length === 0) {
      return defaultWindows;
    }

    // Simplified for MVP - in production, this would analyze task types and completion patterns
    return defaultWindows;
  }

  // Assessment helper functions
  private assessEnergyAlignment(
    timeBlocks: TimeBlock[],
    energyPattern: EnergyPattern
  ): number {
    let alignmentScore = 0;
    let totalHighEnergyTasks = 0;

    timeBlocks.forEach((block) => {
      if (block.energyLevel === "high") {
        totalHighEnergyTasks++;
        if (this.isInPeakWindow(block.startTime, energyPattern.peak)) {
          alignmentScore++;
        }
      }
    });

    return totalHighEnergyTasks > 0 ? alignmentScore / totalHighEnergyTasks : 1;
  }

  private assessContextSwitching(timeBlocks: TimeBlock[]): number {
    let contextSwitches = 0;
    let totalTransitions = timeBlocks.length - 1;

    for (let i = 1; i < timeBlocks.length; i++) {
      const prevBlock = timeBlocks[i - 1];
      const currentBlock = timeBlocks[i];

      if (prevBlock.focusType !== currentBlock.focusType) {
        contextSwitches++;
      }
    }

    return totalTransitions > 0 ? 1 - contextSwitches / totalTransitions : 1;
  }

  private assessBufferTime(
    timeBlocks: TimeBlock[],
    bufferBlocks: BufferBlock[]
  ): number {
    const bufferTime =
      bufferBlocks?.reduce((total, block) => {
        return (
          total + this.calculateBlockDuration(block.startTime, block.endTime)
        );
      }, 0) || 0;

    const totalTime = timeBlocks.reduce((total, block) => {
      return (
        total + this.calculateBlockDuration(block.startTime, block.endTime)
      );
    }, 0);

    const bufferRatio = totalTime > 0 ? bufferTime / totalTime : 0;

    // Optimal buffer ratio is 15-20%
    if (bufferRatio >= 0.15 && bufferRatio <= 0.2) return 1;
    if (bufferRatio >= 0.1 && bufferRatio <= 0.25) return 0.8;
    return Math.max(0.3, 1 - Math.abs(bufferRatio - 0.175) * 4);
  }

  private assessPriorityAlignment(
    timeBlocks: TimeBlock[],
    energyPattern: EnergyPattern
  ): number {
    let alignmentScore = 0;
    let highPriorityTasks = 0;

    timeBlocks.forEach((block) => {
      if (block.priority === TaskPriority.HIGH) {
        highPriorityTasks++;
        if (
          this.isInPeakWindow(block.startTime, energyPattern.peak) ||
          this.isInPeakWindow(block.startTime, energyPattern.secondary_peak)
        ) {
          alignmentScore++;
        }
      }
    });

    return highPriorityTasks > 0 ? alignmentScore / highPriorityTasks : 1;
  }

  // Utility functions
  private isInPeakWindow(time: string, peakWindow: string): boolean {
    const [start, end] = peakWindow.split("-");
    const timeMinutes = this.timeToMinutes(time);
    const startMinutes = this.timeToMinutes(start);
    const endMinutes = this.timeToMinutes(end);

    return timeMinutes >= startMinutes && timeMinutes <= endMinutes;
  }

  private timeToMinutes(timeString: string): number {
    const [hours, minutes] = timeString.split(":").map(Number);
    return hours * 60 + minutes;
  }

  private calculateBlockDuration(startTime: string, endTime: string): number {
    const startMinutes = this.timeToMinutes(startTime);
    const endMinutes = this.timeToMinutes(endTime);
    return endMinutes - startMinutes;
  }

  private getFallbackSchedule(tasks: any[]): AISchedule {
    const timeBlocks: TimeBlock[] = [];
    let currentTime = "09:00";

    tasks.slice(0, 6).forEach((task, index) => {
      const duration = task.estimated_duration || 45;
      const endTime = this.addMinutesToTime(currentTime, duration);

      timeBlocks.push({
        startTime: currentTime,
        endTime: endTime,
        taskId: task.id,
        taskTitle: task.title,
        type: task.type,
        priority: task.priority,
        energyLevel: task.energy_level_required || "medium",
        focusType: "work",
        contextSwitchMinimized: false,
        optimizationReason: "Fallback scheduling",
      });

      currentTime = this.addMinutesToTime(endTime, 15); // 15 minute buffer
    });

    return {
      timeBlocks,
      bufferBlocks: [
        { startTime: "12:00", endTime: "13:00", purpose: "Lunch break" },
        { startTime: "15:30", endTime: "15:45", purpose: "Afternoon break" },
      ],
      recommendations: [
        "Schedule generated using fallback algorithm. Consider providing more user preferences for better optimization.",
      ],
      energyOptimization: {
        highEnergyTasks: timeBlocks.slice(0, 2).map((t) => t.taskTitle),
        lowEnergyTasks: timeBlocks.slice(-2).map((t) => t.taskTitle),
        energyBreaks: ["12:00", "15:30"],
      },
      workLifeBalance: {
        workTime: 6,
        personalTime: 2,
        breakTime: 1,
        balanceScore: 0.7,
      },
    };
  }

  private addMinutesToTime(time: string, minutes: number): string {
    const [hours, mins] = time.split(":").map(Number);
    const totalMinutes = hours * 60 + mins + minutes;
    const newHours = Math.floor(totalMinutes / 60);
    const newMins = totalMinutes % 60;
    return `${newHours.toString().padStart(2, "0")}:${newMins.toString().padStart(2, "0")}`;
  }

  // Database helper functions
  private async getUserPreferences(userId: string): Promise<any> {
    const { data, error } = await supabase
      .from("user_preferences")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (error && error.code !== "PGRST116") {
      console.warn("No user preferences found:", error);
    }
    return data || {};
  }

  private async getOnboardingData(userId: string): Promise<any> {
    const { data, error } = await supabase
      .from("onboarding_responses")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (error && error.code !== "PGRST116") {
      console.warn("No onboarding data found:", error);
    }
    return data || {};
  }

  private async getUserXPData(userId: string): Promise<any> {
    const { data, error } = await supabase
      .from("user_xp")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (error && error.code !== "PGRST116") {
      console.warn("No XP data found:", error);
    }
    return data || { level: 1, total_xp: 0 };
  }

  private async getUserBehaviorHistory(userId: string): Promise<any[]> {
    const { data, error } = await supabase
      .from("tasks")
      .select(
        "completed_at, status, priority, estimated_duration, difficulty_level"
      )
      .eq("user_id", userId)
      .eq("status", "completed")
      .order("completed_at", { ascending: false })
      .limit(50);

    if (error) {
      console.warn("Error fetching behavior history:", error);
    }
    return data || [];
  }

  private async saveScheduleToDatabase(
    userId: string,
    date: string,
    schedule: AISchedule
  ): Promise<AISchedule> {
    const scheduleId = `schedule_${userId}_${date}`;

    const { data, error } = await supabase
      .from("daily_schedules")
      .upsert({
        id: scheduleId,
        user_id: userId,
        date: date,
        schedule_data: schedule,
        optimization_score: schedule.optimizationScore,
        adaptability_score: schedule.adaptability,
        generated_at: new Date().toISOString(),
        is_ai_generated: true,
      })
      .select("*")
      .single();

    if (error) {
      console.error("Error saving schedule to database:", error);
      // Return the schedule anyway - saving is not critical for functionality
    }

    return schedule;
  }
}

// Export singleton instance
export const aiSchedulingEngine = new AISchedulingEngine();
