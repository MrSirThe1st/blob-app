// src/services/api/openai.ts
/**
 * Enhanced OpenAI API service with real API integration
 * Eliminates mock responses and implements proper AI-driven functionality
 */

// Types for OpenAI integration
export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface OnboardingConversationData {
  fullTranscript: ChatMessage[];
  aiInsights: {
    primaryGoals: string[];
    challenges: string[];
    lifestyle: string;
    motivationType: string;
    availabilityPattern: string;
    personalityTraits: string[];
    workPreferences?: {
      preferredHours?: string;
      energyPeaks?: string[];
      focusStyle?: string;
    };
    stressFactors?: string[];
    timeConstraints?: string[];
  };
  summarized?: {
    keyPoints: string[];
    userContext: string;
    personalizedRecommendations: string[];
  };
}

export interface ScheduleRequest {
  userProfile: {
    chronotype?: string;
    workStyle?: string;
    workStartTime?: string;
    workEndTime?: string;
    breakDuration?: number;
  };
  goals: string[];
  availableHours: number;
  userContext?: string; // From onboarding summary
  existingCommitments?: {
    title: string;
    startTime: string;
    endTime: string;
  }[];
}

export interface GeneratedTask {
  id: string;
  title: string;
  description: string;
  estimatedDuration: number; // in minutes
  priority: "high" | "medium" | "low";
  category: string;
  startTime: string;
  endTime: string;
  isFlexible: boolean;
  reasoning?: string; // Why this task was suggested
  adaptations?: string[]; // How it adapts to user's needs
}

export interface ScheduleResponse {
  tasks: GeneratedTask[];
  totalScheduledHours: number;
  suggestions: string[];
  optimizationNotes: string;
  personalizedInsights?: string[];
}

export interface GoalExtractionRequest {
  conversationText: string;
  basicProfile: {
    chronotype?: string;
    workStyle?: string;
    stressResponse?: string;
  };
  additionalContext?: {
    energyPatternNote?: string;
    workStyleNote?: string;
    stressResponseNote?: string;
  };
}

export interface ExtractedGoal {
  title: string;
  description: string;
  category:
    | "fitness"
    | "career"
    | "learning"
    | "personal"
    | "finance"
    | "relationships";
  priority: "low" | "medium" | "high";
  targetDate?: string;
  userContext: string;
  breakdown?: {
    milestones: string[];
    suggestedTasks: string[];
    timeframe: string;
  };
}

class OpenAIService {
  private apiKey: string;
  private baseUrl = "https://api.openai.com/v1";
  private defaultModel = "gpt-4"; // Use GPT-4 for better quality
  private isConfigured: boolean;

  constructor() {
    // Get API key from environment
    this.apiKey = process.env.EXPO_PUBLIC_OPENAI_API_KEY || "";
    this.isConfigured = !!this.apiKey;

    if (!this.isConfigured) {
      console.warn(
        "⚠️ OpenAI API key not found. Set EXPO_PUBLIC_OPENAI_API_KEY environment variable."
      );
    } else {
      console.log("✅ OpenAI service configured successfully");
    }
  }

  /**
   * Check if OpenAI is properly configured
   */
  public isServiceAvailable(): boolean {
    return this.isConfigured;
  }

  /**
   * Make a request to OpenAI Chat Completions API
   */
  private async makeRequest(
    messages: ChatMessage[],
    options: {
      functions?: any[];
      function_call?: any;
      temperature?: number;
      max_tokens?: number;
      model?: string;
    } = {}
  ): Promise<any> {
    if (!this.isConfigured) {
      throw new Error(
        "OpenAI API is not configured. Please check your API key."
      );
    }

    try {
      const requestBody = {
        model: options.model || this.defaultModel,
        messages,
        temperature: options.temperature ?? 0.7,
        max_tokens: options.max_tokens || 2000,
        ...(options.functions && { functions: options.functions }),
        ...(options.function_call && { function_call: options.function_call }),
      };

      console.log("🤖 Making OpenAI API request...");

      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage =
          errorData.error?.message ||
          `HTTP ${response.status}: ${response.statusText}`;
        throw new Error(`OpenAI API Error: ${errorMessage}`);
      }

      const data = await response.json();

      if (!data.choices || data.choices.length === 0) {
        throw new Error("No response choices returned from OpenAI");
      }

      console.log("✅ OpenAI API request successful");

      const choice = data.choices[0];
      return {
        message: choice.message,
        function_call: choice.message?.function_call,
        content: choice.message?.content,
        usage: data.usage,
      };
    } catch (error) {
      console.error("❌ OpenAI API request failed:", error);
      throw error;
    }
  }

  /**
   * Extract goals from onboarding conversation using real AI
   */
  async extractGoalsFromConversation(
    request: GoalExtractionRequest
  ): Promise<ExtractedGoal[]> {
    if (!this.isConfigured) {
      throw new Error(
        "AI service is not available. Please configure your API key to extract personalized goals."
      );
    }

    const systemPrompt: ChatMessage = {
      role: "system",
      content: `You are an expert AI goal extraction assistant. Analyze the user's onboarding conversation to identify their specific, actionable goals.

EXTRACTION GUIDELINES:
1. Focus on EXPLICIT goals mentioned by the user
2. Infer implicit goals from mentioned challenges and desires
3. Make goals SPECIFIC and MEASURABLE when possible
4. Consider the user's context, constraints, and preferences
5. Prioritize based on urgency and user emphasis

USER PROFILE CONTEXT:
- Chronotype: ${request.basicProfile.chronotype || "Not specified"}
- Work Style: ${request.basicProfile.workStyle || "Not specified"}  
- Stress Response: ${request.basicProfile.stressResponse || "Not specified"}

ADDITIONAL CONTEXT:
${request.additionalContext?.energyPatternNote ? `Energy Pattern: ${request.additionalContext.energyPatternNote}` : ""}
${request.additionalContext?.workStyleNote ? `Work Style Details: ${request.additionalContext.workStyleNote}` : ""}
${request.additionalContext?.stressResponseNote ? `Stress Management: ${request.additionalContext.stressResponseNote}` : ""}

Return a JSON array of goals with this exact structure:
[
  {
    "title": "Specific, actionable goal title",
    "description": "Detailed description explaining what success looks like",
    "category": "fitness|career|learning|personal|finance|relationships",
    "priority": "low|medium|high",
    "targetDate": "YYYY-MM-DD or relative like '3 months'",
    "userContext": "Why this matters to the user based on their conversation",
    "breakdown": {
      "milestones": ["milestone 1", "milestone 2"],
      "suggestedTasks": ["task 1", "task 2", "task 3"],
      "timeframe": "How long this should realistically take"
    }
  }
]

Extract 2-5 goals maximum. Focus on quality and relevance over quantity.`,
    };

    const userPrompt: ChatMessage = {
      role: "user",
      content: `Please analyze this onboarding conversation and extract the user's goals:

"${request.conversationText}"

Based on this conversation and the user's profile, what are their specific, actionable goals? Consider both explicit goals they mentioned and implicit goals based on their challenges and desires.`,
    };

    try {
      const response = await this.makeRequest([systemPrompt, userPrompt], {
        temperature: 0.3, // Lower temperature for more consistent extraction
        max_tokens: 1500,
      });

      if (response.content) {
        try {
          const goals: ExtractedGoal[] = JSON.parse(response.content);

          // Validate the extracted goals
          const validGoals = goals.filter(
            (goal) =>
              goal.title && goal.description && goal.category && goal.priority
          );

          console.log(
            `✅ Extracted ${validGoals.length} goals from conversation`
          );
          return validGoals;
        } catch (parseError) {
          console.error("Failed to parse extracted goals:", parseError);
          throw new Error("Failed to parse goal extraction response");
        }
      }

      throw new Error("No valid goal extraction response from AI");
    } catch (error) {
      console.error("Error extracting goals:", error);
      throw error;
    }
  }

  /**
   * Process onboarding conversation to extract comprehensive insights
   */
  async processOnboardingConversation(
    conversationText: string,
    basicProfile: {
      chronotype?: string;
      workStyle?: string;
      stressResponse?: string;
    },
    additionalContext?: {
      energyPatternNote?: string;
      workStyleNote?: string;
      stressResponseNote?: string;
    }
  ): Promise<OnboardingConversationData> {
    if (!this.isConfigured) {
      throw new Error(
        "AI service is not available. Please configure your API key to process onboarding data."
      );
    }

    const conversation: ChatMessage[] = [
      {
        role: "system",
        content: `You are an expert AI personality analyzer. Process this onboarding conversation to extract deep insights about the user's productivity patterns, challenges, and preferences.

USER PROFILE CONTEXT:
- Chronotype: ${basicProfile.chronotype || "Not specified"}
- Work Style: ${basicProfile.workStyle || "Not specified"}
- Stress Response: ${basicProfile.stressResponse || "Not specified"}

ADDITIONAL CONTEXT:
${additionalContext?.energyPatternNote ? `Energy Pattern Details: ${additionalContext.energyPatternNote}` : ""}
${additionalContext?.workStyleNote ? `Work Style Details: ${additionalContext.workStyleNote}` : ""}
${additionalContext?.stressResponseNote ? `Stress Management Details: ${additionalContext.stressResponseNote}` : ""}

Analyze the conversation and extract actionable insights. Return a JSON object with this exact structure:
{
  "primaryGoals": ["specific goal 1", "specific goal 2"],
  "challenges": ["specific challenge 1", "specific challenge 2"],
  "lifestyle": "Comprehensive lifestyle description",
  "motivationType": "What drives this person",
  "availabilityPattern": "When they can realistically work",
  "personalityTraits": ["trait 1", "trait 2"],
  "workPreferences": {
    "preferredHours": "When they work best",
    "energyPeaks": ["morning", "afternoon", "evening"],
    "focusStyle": "How they prefer to work"
  },
  "stressFactors": ["what causes them stress"],
  "timeConstraints": ["specific time limitations"]
}`,
      },
      {
        role: "user",
        content: `Please analyze this detailed onboarding conversation:

"${conversationText}"

Extract comprehensive insights about this person's productivity patterns, challenges, goals, and preferences. Focus on actionable information that can be used to create personalized schedules and tasks.`,
      },
    ];

    try {
      const response = await this.makeRequest(conversation, {
        temperature: 0.4,
        max_tokens: 1000,
      });

      if (response.content) {
        try {
          const aiInsights = JSON.parse(response.content);

          // Create summarized version for storage
          const summarized = {
            keyPoints: [
              `Goals: ${aiInsights.primaryGoals?.join(", ") || "General productivity"}`,
              `Challenges: ${aiInsights.challenges?.join(", ") || "Time management"}`,
              `Work Style: ${aiInsights.workPreferences?.focusStyle || basicProfile.workStyle || "Flexible"}`,
              `Availability: ${aiInsights.availabilityPattern || "Standard hours"}`,
            ],
            userContext:
              aiInsights.lifestyle ||
              "Focused on improving productivity and achieving goals",
            personalizedRecommendations: [
              "Schedule high-priority tasks during energy peaks",
              "Build in buffer time for stress management",
              "Align tasks with preferred work style",
            ],
          };

          const fullData: OnboardingConversationData = {
            fullTranscript: conversation,
            aiInsights,
            summarized,
          };

          console.log("✅ Processed onboarding conversation successfully");
          return fullData;
        } catch (parseError) {
          console.error("Failed to parse onboarding insights:", parseError);
          throw new Error("Failed to parse onboarding analysis response");
        }
      }

      throw new Error("No valid onboarding analysis response from AI");
    } catch (error) {
      console.error("Error processing onboarding conversation:", error);
      throw error;
    }
  }

  /**
   * Generate personalized daily schedule using real AI
   */
  async generateDailySchedule(
    request: ScheduleRequest
  ): Promise<ScheduleResponse> {
    if (!this.isConfigured) {
      throw new Error(
        "AI service is not available. Please configure your API key to generate personalized schedules."
      );
    }

    const systemPrompt: ChatMessage = {
      role: "system",
      content: `You are an expert AI scheduling assistant that creates highly personalized, science-based daily schedules.

CORE PRINCIPLES:
1. ENERGY OPTIMIZATION: Match task complexity to user's energy patterns
2. CONTEXT SWITCHING: Minimize transitions between different types of work
3. REALISTIC TIMING: Include buffer time and breaks
4. GOAL ALIGNMENT: Prioritize tasks that advance user's specific goals
5. STRESS MANAGEMENT: Consider user's stress response and build in recovery

PERSONALIZATION FACTORS:
- Chronotype: ${request.userProfile.chronotype || "flexible"}
- Work Style: ${request.userProfile.workStyle || "balanced"}
- Available Hours: ${request.availableHours}
- Work Window: ${request.userProfile.workStartTime || "9:00"} - ${request.userProfile.workEndTime || "17:00"}

${request.userContext ? `USER CONTEXT: ${request.userContext}` : ""}

Return a JSON object with this exact structure:
{
  "tasks": [
    {
      "id": "unique_task_id",
      "title": "Specific, actionable task title",
      "description": "Clear description of what to do",
      "estimatedDuration": 60,
      "priority": "high|medium|low",
      "category": "work|personal|health|learning|planning",
      "startTime": "2024-01-15T09:00:00",
      "endTime": "2024-01-15T10:00:00",
      "isFlexible": true,
      "reasoning": "Why this task is scheduled at this time",
      "adaptations": ["How this adapts to user's needs"]
    }
  ],
  "totalScheduledHours": 6.5,
  "suggestions": ["actionable suggestion 1", "actionable suggestion 2"],
  "optimizationNotes": "Explanation of how this schedule is optimized for the user",
  "personalizedInsights": ["insight based on user's profile"]
}

Create 4-8 tasks that are specific, realistic, and aligned with the user's goals and constraints.`,
    };

    const today = new Date().toISOString().split("T")[0];
    const userPrompt: ChatMessage = {
      role: "user",
      content: `Create a personalized daily schedule for today (${today}) with these details:

GOALS TO WORK TOWARD:
${request.goals.length > 0 ? request.goals.join("\n- ") : "General productivity and well-being"}

${
  request.existingCommitments && request.existingCommitments.length > 0
    ? `
EXISTING COMMITMENTS TO WORK AROUND:
${request.existingCommitments.map((c) => `- ${c.title}: ${c.startTime} - ${c.endTime}`).join("\n")}
`
    : ""
}

Please create a schedule that maximizes productivity while respecting energy patterns and personal constraints. Focus on actionable, specific tasks that move the user toward their goals.`,
    };

    try {
      const response = await this.makeRequest([systemPrompt, userPrompt], {
        temperature: 0.6,
        max_tokens: 2000,
      });

      if (response.content) {
        try {
          const schedule: ScheduleResponse = JSON.parse(response.content);

          // Validate the schedule
          if (!schedule.tasks || !Array.isArray(schedule.tasks)) {
            throw new Error("Invalid schedule format received");
          }

          // Add timestamps to tasks if missing
          schedule.tasks = schedule.tasks.map((task, index) => ({
            ...task,
            id: task.id || `task_${Date.now()}_${index}`,
            startTime: task.startTime || `${today}T09:00:00`,
            endTime: task.endTime || `${today}T10:00:00`,
          }));

          console.log(
            `✅ Generated personalized schedule with ${schedule.tasks.length} tasks`
          );
          return schedule;
        } catch (parseError) {
          console.error("Failed to parse schedule:", parseError);
          throw new Error("Failed to parse schedule generation response");
        }
      }

      throw new Error("No valid schedule response from AI");
    } catch (error) {
      console.error("Error generating schedule:", error);
      throw error;
    }
  }

  /**
   * Generate tasks based on specific goal breakdown
   */
  async generateTasksFromGoal(
    goalTitle: string,
    goalDescription: string,
    userProfile: {
      chronotype?: string;
      workStyle?: string;
      availableHours?: number;
    },
    userContext?: string
  ): Promise<GeneratedTask[]> {
    if (!this.isConfigured) {
      throw new Error(
        "AI service is not available. Please configure your API key to generate personalized tasks."
      );
    }

    const systemPrompt: ChatMessage = {
      role: "system",
      content: `You are an expert task breakdown specialist. Create specific, actionable tasks that will help achieve the given goal.

TASK CREATION PRINCIPLES:
1. Make tasks SPECIFIC and ACTIONABLE (clear what to do)
2. Appropriate TIME ESTIMATES (realistic durations)
3. PRIORITIZE based on impact and dependencies
4. Consider USER'S STYLE and constraints
5. Create a logical PROGRESSION of tasks

USER PROFILE:
- Chronotype: ${userProfile.chronotype || "flexible"}
- Work Style: ${userProfile.workStyle || "balanced"}
- Available Hours: ${userProfile.availableHours || "flexible"}

${userContext ? `USER CONTEXT: ${userContext}` : ""}

Return a JSON array of tasks with this structure:
[
  {
    "id": "unique_task_id",
    "title": "Specific, actionable task title",
    "description": "Clear step-by-step description",
    "estimatedDuration": 60,
    "priority": "high|medium|low",
    "category": "work|personal|health|learning|planning",
    "isFlexible": true,
    "reasoning": "Why this task is important for the goal",
    "adaptations": ["How this adapts to user's style"]
  }
]

Generate 3-6 tasks that create a clear path toward achieving the goal.`,
    };

    const userPrompt: ChatMessage = {
      role: "user",
      content: `Create specific tasks to achieve this goal:

GOAL: ${goalTitle}
DESCRIPTION: ${goalDescription}

Break this down into actionable tasks that consider the user's profile and constraints. Focus on creating a clear progression that leads to goal achievement.`,
    };

    try {
      const response = await this.makeRequest([systemPrompt, userPrompt], {
        temperature: 0.5,
        max_tokens: 1500,
      });

      if (response.content) {
        try {
          const tasks: GeneratedTask[] = JSON.parse(response.content);

          // Validate and add missing fields
          const validTasks = tasks
            .filter((task) => task.title && task.description)
            .map((task, index) => ({
              ...task,
              id: task.id || `goal_task_${Date.now()}_${index}`,
              startTime: task.startTime || "",
              endTime: task.endTime || "",
            }));

          console.log(
            `✅ Generated ${validTasks.length} tasks for goal: ${goalTitle}`
          );
          return validTasks;
        } catch (parseError) {
          console.error("Failed to parse tasks:", parseError);
          throw new Error("Failed to parse task generation response");
        }
      }

      throw new Error("No valid task response from AI");
    } catch (error) {
      console.error("Error generating tasks from goal:", error);
      throw error;
    }
  }

  /**
   * CONSOLIDATED METHOD: Generate complete onboarding setup in ONE request
   * Replaces: extractGoalsFromConversation + processOnboardingConversation + generateInitialTasks
   */
  async generateCompleteOnboardingSetup(
    request: GoalExtractionRequest & {
      timeframe?: "2_days" | "1_week" | "2_weeks";
    }
  ): Promise<{
    goals: ExtractedGoal[];
    initialTasks: GeneratedTask[];
    aiInsights: OnboardingConversationData["aiInsights"];
    summarized: OnboardingConversationData["summarized"];
  }> {
    if (!this.isConfigured) {
      throw new Error(
        "AI service is not available. Please configure your API key for onboarding setup."
      );
    }

    const timeframe = request.timeframe || "1_week";
    const systemPrompt: ChatMessage = {
      role: "system",
      content: `You are an expert AI productivity assistant. Analyze the user's onboarding conversation and create a COMPLETE productivity setup in a single response.

USER PROFILE:
- Chronotype: ${request.basicProfile.chronotype || "Not specified"}
- Work Style: ${request.basicProfile.workStyle || "Not specified"}
- Stress Response: ${request.basicProfile.stressResponse || "Not specified"}
- Timeframe: ${timeframe}

ADDITIONAL CONTEXT:
${request.additionalContext?.energyPatternNote ? `Energy Pattern: ${request.additionalContext.energyPatternNote}` : ""}
${request.additionalContext?.workStyleNote ? `Work Style Details: ${request.additionalContext.workStyleNote}` : ""}
${request.additionalContext?.stressResponseNote ? `Stress Management: ${request.additionalContext.stressResponseNote}` : ""}

Return a JSON object with this EXACT structure:
{
  "goals": [
    {
      "title": "Specific, actionable goal title",
      "description": "Detailed description explaining what success looks like",
      "category": "fitness|career|learning|personal|finance|relationships",
      "priority": "low|medium|high",
      "targetDate": "YYYY-MM-DD or relative like '3 months'",
      "userContext": "Why this matters to the user",
      "breakdown": {
        "milestones": ["milestone 1", "milestone 2"],
        "suggestedTasks": ["task 1", "task 2", "task 3"],
        "timeframe": "How long this should realistically take"
      }
    }
  ],
  "initialTasks": [
    {
      "id": "task_1",
      "title": "Specific, actionable task title",
      "description": "Clear step-by-step description",
      "estimatedDuration": 30,
      "priority": "high|medium|low",
      "category": "work|personal|health|learning|planning",
      "isFlexible": true,
      "reasoning": "Why this task is important",
      "startTime": "",
      "endTime": ""
    }
  ],
  "aiInsights": {
    "primaryGoals": ["goal 1", "goal 2"],
    "challenges": ["challenge 1", "challenge 2"],
    "lifestyle": "Comprehensive lifestyle description",
    "motivationType": "What drives this person",
    "availabilityPattern": "When they can realistically work",
    "personalityTraits": ["trait 1", "trait 2"],
    "workPreferences": {
      "preferredHours": "When they work best",
      "energyPeaks": ["morning", "afternoon", "evening"],
      "focusStyle": "How they prefer to work"
    },
    "stressFactors": ["what causes them stress"],
    "timeConstraints": ["specific time limitations"]
  },
  "summarized": {
    "keyPoints": ["key insight 1", "key insight 2"],
    "userContext": "Summary of user's situation",
    "personalizedRecommendations": ["recommendation 1", "recommendation 2"]
  }
}

REQUIREMENTS:
- Extract 3-5 specific goals from the conversation
- Create 5-8 immediate actionable tasks for ${timeframe}
- Tasks should address the identified goals and challenges
- Consider user's work style and energy patterns
- Make everything specific and measurable`,
    };

    const userPrompt: ChatMessage = {
      role: "user",
      content: `Analyze this onboarding conversation and create a complete productivity setup:

"${request.conversationText}"

Based on this conversation, create:
1. Specific goals that address what the user wants to achieve
2. Immediate actionable tasks for ${timeframe} that move toward those goals
3. Deep insights about their productivity patterns and preferences
4. Personalized recommendations for success

Focus on practical, achievable steps that fit their lifestyle and constraints.`,
    };

    try {
      const response = await this.makeRequest([systemPrompt, userPrompt], {
        temperature: 0.4,
        max_tokens: 3000, // Increased for comprehensive response
      });

      if (response.content) {
        try {
          const setup = JSON.parse(response.content);

          // Validate the response structure
          if (!setup.goals || !setup.initialTasks || !setup.aiInsights) {
            throw new Error("Invalid onboarding setup format received");
          }

          // Add missing IDs and timestamps
          setup.initialTasks = setup.initialTasks.map(
            (task: any, index: number) => ({
              ...task,
              id: task.id || `onboarding_task_${Date.now()}_${index}`,
              startTime: task.startTime || "",
              endTime: task.endTime || "",
            })
          );

          console.log(
            `✅ Generated complete onboarding setup: ${setup.goals.length} goals, ${setup.initialTasks.length} tasks`
          );
          return setup;
        } catch (parseError) {
          console.error("Failed to parse onboarding setup:", parseError);
          throw new Error("Failed to parse complete onboarding setup response");
        }
      }

      throw new Error("No valid onboarding setup response from AI");
    } catch (error) {
      console.error("Error generating complete onboarding setup:", error);
      throw error;
    }
  }

  /**
   * Test the OpenAI connection
   */
  async testConnection(): Promise<{ success: boolean; message: string }> {
    if (!this.isConfigured) {
      return {
        success: false,
        message:
          "OpenAI API key not configured. Please set EXPO_PUBLIC_OPENAI_API_KEY environment variable.",
      };
    }

    try {
      const testMessage: ChatMessage = {
        role: "user",
        content:
          "Hello! This is a test message. Please respond with 'Connection successful!'",
      };

      const response = await this.makeRequest([testMessage], {
        max_tokens: 50,
        temperature: 0,
      });

      if (response.content) {
        return {
          success: true,
          message: `OpenAI connection successful! Response: ${response.content}`,
        };
      }

      return {
        success: false,
        message: "OpenAI connection test failed: No response content",
      };
    } catch (error) {
      return {
        success: false,
        message: `OpenAI connection test failed: ${error instanceof Error ? error.message : "Unknown error"}`,
      };
    }
  }
}

// Export singleton instance
export const openAIService = new OpenAIService();
export default openAIService;
