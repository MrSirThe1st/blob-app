// src/services/api/openai.ts
/**
 * OpenAI API service for AI conversations and schedule generation
 * Handles natural language processing and schedule optimization
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
}

export interface ScheduleResponse {
  tasks: GeneratedTask[];
  totalScheduledHours: number;
  suggestions: string[];
  optimizationNotes: string;
}

class OpenAIService {
  private apiKey: string;
  private baseUrl = "https://api.openai.com/v1";

  constructor() {
    // In production, store this securely (environment variables, secure storage)
    // For MVP, you can hardcode temporarily but NEVER commit the actual key
    this.apiKey = process.env.EXPO_PUBLIC_OPENAI_API_KEY || "";

    if (!this.apiKey) {
      console.warn(
        "⚠️ OpenAI API key not found. Add EXPO_PUBLIC_OPENAI_API_KEY to your environment variables"
      );
    }
  }

  /**
   * Make a request to OpenAI Chat Completions API
   */
  public async makeRequest(
    messages: ChatMessage[],
    functions?: any[]
  ): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "gpt-3.5-turbo",
          messages,
          temperature: 0.7,
          max_tokens: 1500,
          ...(functions && { functions, function_call: "auto" }),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          `OpenAI API Error: ${errorData.error?.message || response.statusText}`
        );
      }

      return await response.json();
    } catch (error) {
      console.error("OpenAI request error:", error);
      throw error;
    }
  }

  /**
   * Generic method to generate responses from OpenAI
   * This method is used by TaskGenerationService and other services
   */
  async generateResponse(options: {
    messages: ChatMessage[];
    functions?: any[];
    function_call?: any;
    temperature?: number;
    max_tokens?: number;
  }): Promise<any> {
    try {
      if (!this.isConfigured()) {
        console.warn("OpenAI not configured, using mock response");
        return this.getMockResponse(options);
      }

      const requestBody = {
        model: "gpt-3.5-turbo",
        messages: options.messages,
        temperature: options.temperature || 0.7,
        max_tokens: options.max_tokens || 2000,
      };

      // Add function calling if provided
      if (options.functions) {
        requestBody.functions = options.functions;
      }
      if (options.function_call) {
        requestBody.function_call = options.function_call;
      }

      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          `OpenAI API Error: ${errorData.error?.message || response.statusText}`
        );
      }

      const data = await response.json();

      if (!data.choices || data.choices.length === 0) {
        throw new Error("No response from OpenAI");
      }

      // Return the first choice, with function_call if it exists
      const choice = data.choices[0];
      return {
        message: choice.message,
        function_call: choice.message?.function_call,
        content: choice.message?.content,
      };
    } catch (error) {
      console.error("Error in generateResponse:", error);
      return this.getMockResponse(options);
    }
  }

  /**
   * Mock response for when OpenAI is not configured or fails
   */
  private getMockResponse(options: {
    functions?: any[];
    function_call?: any;
  }): any {
    console.log("🔧 Using mock response for OpenAI (API key not configured)");

    // If this is a function call for task generation
    if (options.function_call?.name === "generate_daily_tasks") {
      return {
        function_call: {
          name: "generate_daily_tasks",
          arguments: JSON.stringify({
            tasks: [
              {
                title: "Morning Bible Reading & Prayer",
                description:
                  "Start the day with 15 minutes of scripture reading and prayer for spiritual grounding",
                type: "daily_habit",
                priority: "high",
                estimated_duration: 15,
                suggested_time_slot: "morning",
                energy_level_required: "medium",
                difficulty_level: 3,
                context_requirements:
                  "Quiet space with Bible or devotional app",
                success_criteria:
                  "Complete 15 minutes of reading and prayer time",
              },
              {
                title: "Computer Science Study Session",
                description:
                  "Focused study session for coursework - review materials and complete assignments",
                type: "weekly_task",
                priority: "high",
                estimated_duration: 90,
                suggested_time_slot: "morning",
                energy_level_required: "high",
                difficulty_level: 7,
                context_requirements:
                  "Focused workspace with computer, textbooks, and notes",
                success_criteria:
                  "Complete daily study goals and review assigned materials",
              },
              {
                title: "German Language Practice",
                description:
                  "Work on German course lessons and vocabulary practice",
                type: "daily_habit",
                priority: "medium",
                estimated_duration: 20,
                suggested_time_slot: "afternoon",
                energy_level_required: "medium",
                difficulty_level: 5,
                context_requirements:
                  "Language learning app or course materials",
                success_criteria:
                  "Complete one lesson or 20 minutes of practice",
              },
              {
                title: "Personal Development Reading",
                description:
                  "Read from your stack of books - novels or personal development",
                type: "daily_habit",
                priority: "medium",
                estimated_duration: 30,
                suggested_time_slot: "evening",
                energy_level_required: "low",
                difficulty_level: 3,
                context_requirements: "Comfortable reading space",
                success_criteria:
                  "Read for 30 minutes without phone distractions",
              },
              {
                title: "Meal Prep Planning",
                description:
                  "Plan meals for the next few days and prep ingredients",
                type: "weekly_task",
                priority: "medium",
                estimated_duration: 45,
                suggested_time_slot: "evening",
                energy_level_required: "medium",
                difficulty_level: 4,
                context_requirements: "Kitchen with cooking supplies",
                success_criteria:
                  "Plan meals and prep ingredients for next 2-3 days",
              },
            ],
          }),
        },
      };
    }

    // Default text response for other requests
    return {
      message: {
        content:
          "I'm currently in demo mode. Full AI features will be available once OpenAI API key is configured.",
      },
      content: "Demo response - OpenAI not configured",
    };
  }

  /**
   * Extract specific goals from onboarding conversation for automatic goal creation
   * This is the key method that converts conversation into actual Goal database records
   */
  async extractGoalsForCreation(
    conversationText: string,
    basicProfile: {
      energyPattern?: string;
      workStyle?: string;
      stressResponse?: string;
    }
  ): Promise<
    {
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
    }[]
  > {
    try {
      const systemPrompt: ChatMessage = {
        role: "system",
        content: `You are an expert goal-setting AI that extracts specific, actionable goals from user conversations.

CRITICAL: The user just completed onboarding and expects to see GOALS automatically created from their conversation. You must extract 2-4 concrete, achievable goals.

Your job is to:
1. Identify specific goals the user mentioned or implied
2. Convert vague aspirations into concrete, actionable goals
3. Assign appropriate categories and priorities
4. Provide context for why each goal matters to the user

Categories available: fitness, career, learning, personal, finance, relationships
Priorities: low, medium, high

Return ONLY a JSON array in this exact format:
[
  {
    "title": "Specific, actionable goal title",
    "description": "Clear description of what this goal involves",
    "category": "appropriate category",
    "priority": "high/medium/low based on user emphasis",
    "userContext": "Why this goal matters to the user based on their conversation"
  }
]

Extract goals that the user actually mentioned wanting to do, not generic productivity goals.`,
      };

      const userPrompt: ChatMessage = {
        role: "user",
        content: `Extract specific goals from this onboarding conversation:

User Profile:
- Energy Pattern: ${basicProfile.energyPattern || "Not specified"}
- Work Style: ${basicProfile.workStyle || "Not specified"}
- Stress Response: ${basicProfile.stressResponse || "Not specified"}

User's Conversation:
"${conversationText}"

What specific goals did this user mention wanting to achieve? Focus on concrete things they said they want to do or improve.`,
      };

      const response = await this.makeRequest([systemPrompt, userPrompt]);

      if (response.choices?.[0]?.message?.content) {
        try {
          const extractedGoals = JSON.parse(
            response.choices[0].message.content
          );
          return Array.isArray(extractedGoals) ? extractedGoals : [];
        } catch (parseError) {
          console.error("Failed to parse extracted goals:", parseError);
          return this.getDefaultGoals(conversationText);
        }
      }

      return this.getDefaultGoals(conversationText);
    } catch (error) {
      console.error("Error extracting goals:", error);
      return this.getDefaultGoals(conversationText);
    }
  }

  /**
   * Get default goals based on conversation keywords
   */
  private getDefaultGoals(conversationText: string): any[] {
    const text = conversationText.toLowerCase();
    const goals = [];

    if (
      text.includes("study") ||
      text.includes("school") ||
      text.includes("learn")
    ) {
      goals.push({
        title: "Establish Consistent Study Routine",
        description:
          "Create a daily study schedule to stay on top of coursework",
        category: "learning",
        priority: "high",
        userContext:
          "User mentioned struggling with studies and wanting consistency",
      });
    }

    if (
      text.includes("bible") ||
      text.includes("pray") ||
      text.includes("spiritual")
    ) {
      goals.push({
        title: "Daily Morning Spiritual Routine",
        description: "Establish morning Bible reading and prayer practice",
        category: "personal",
        priority: "high",
        userContext: "User wants to start day with spiritual practices",
      });
    }

    if (text.includes("german") || text.includes("language")) {
      goals.push({
        title: "Learn German Consistently",
        description: "Complete German course and build language skills",
        category: "learning",
        priority: "medium",
        userContext: "User bought a German course but hasn't been using it",
      });
    }

    if (text.includes("read") && text.includes("book")) {
      goals.push({
        title: "Read More Books Regularly",
        description:
          "Develop a reading habit for personal growth and enjoyment",
        category: "personal",
        priority: "medium",
        userContext:
          "User has books they want to read but keeps procrastinating",
      });
    }

    // Ensure we have at least one goal
    if (goals.length === 0) {
      goals.push({
        title: "Improve Time Management",
        description:
          "Develop better organizational skills and reduce procrastination",
        category: "personal",
        priority: "high",
        userContext: "User wants to be more organized and productive",
      });
    }

    return goals;
  }

  /**
   * Process onboarding conversation and extract insights (legacy method for compatibility)
   */
  async processOnboardingConversation(
    conversation: ChatMessage[]
  ): Promise<OnboardingConversationData> {
    try {
      const systemPrompt: ChatMessage = {
        role: "system",
        content: `You are an AI assistant helping analyze a user's onboarding conversation to extract key insights for personalized task scheduling. 

Analyze the conversation and extract:
1. Primary goals (what they want to achieve)
2. Current challenges (what's blocking them)
3. Lifestyle constraints (work, family, health, etc.)
4. Motivation type (progress tracking, rewards, accountability, etc.)
5. Availability patterns (when they prefer to work)
6. Personality traits that affect productivity

Return your analysis in this exact JSON format:
{
  "primaryGoals": ["goal1", "goal2"],
  "challenges": ["challenge1", "challenge2"],
  "lifestyle": "brief description of lifestyle constraints",
  "motivationType": "brief description of what motivates them",
  "availabilityPattern": "when they prefer to work/are available",
  "personalityTraits": ["trait1", "trait2"]
}

Be specific and actionable in your analysis.`,
      };

      const analysisPrompt: ChatMessage = {
        role: "user",
        content: `Please analyze this onboarding conversation and extract insights: ${JSON.stringify(conversation)}`,
      };

      const response = await this.makeRequest([systemPrompt, analysisPrompt]);

      if (response.choices?.[0]?.message?.content) {
        try {
          const aiInsights = JSON.parse(response.choices[0].message.content);
          return {
            fullTranscript: conversation,
            aiInsights,
          };
        } catch (parseError) {
          console.error("Failed to parse AI insights:", parseError);
          // Return default structure if parsing fails
          return {
            fullTranscript: conversation,
            aiInsights: {
              primaryGoals: ["General productivity"],
              challenges: ["Time management"],
              lifestyle: "Busy lifestyle",
              motivationType: "Progress tracking",
              availabilityPattern: "Flexible hours",
              personalityTraits: ["Goal-oriented"],
            },
          };
        }
      }

      throw new Error("No valid response from OpenAI");
    } catch (error) {
      console.error("Error processing onboarding conversation:", error);
      throw error;
    }
  }

  /**
   * Generate a daily schedule based on user profile and goals
   */
  async generateDailySchedule(
    request: ScheduleRequest
  ): Promise<ScheduleResponse> {
    try {
      const systemPrompt: ChatMessage = {
        role: "system",
        content: `You are an AI scheduling assistant that creates optimized daily schedules based on user preferences and goals.

Create a realistic daily schedule that:
1. Respects the user's chronotype and work hours
2. Includes appropriate breaks
3. Balances different types of tasks
4. Considers the user's work style
5. Fits within available time slots

Return your response in this exact JSON format:
{
  "tasks": [
    {
      "id": "unique_id",
      "title": "Task Title",
      "description": "Brief description",
      "estimatedDuration": 60,
      "priority": "high|medium|low",
      "category": "work|personal|health|learning",
      "startTime": "2024-01-15T09:00:00",
      "endTime": "2024-01-15T10:00:00",
      "isFlexible": true
    }
  ],
  "totalScheduledHours": 6.5,
  "suggestions": ["suggestion1", "suggestion2"],
  "optimizationNotes": "Brief note about the schedule optimization"
}

Make tasks specific and actionable. Include realistic time estimates.`,
      };

      const schedulePrompt: ChatMessage = {
        role: "user",
        content: `Generate a daily schedule for today with this information:
        
User Profile:
- Chronotype: ${request.userProfile.chronotype || "flexible"}
- Work Style: ${request.userProfile.workStyle || "balanced"}
- Work Hours: ${request.userProfile.workStartTime || "9:00"} - ${request.userProfile.workEndTime || "17:00"}
- Break Duration: ${request.userProfile.breakDuration || 60} minutes

Goals: ${request.goals.join(", ")}
Available Hours: ${request.availableHours}

${request.existingCommitments ? `Existing Commitments: ${JSON.stringify(request.existingCommitments)}` : ""}

Please create an optimized schedule for today.`,
      };

      const response = await this.makeRequest([systemPrompt, schedulePrompt]);

      if (response.choices?.[0]?.message?.content) {
        try {
          const schedule = JSON.parse(response.choices[0].message.content);
          return schedule;
        } catch (parseError) {
          console.error("Failed to parse schedule:", parseError);
          // Return default schedule if parsing fails
          return this.getDefaultSchedule();
        }
      }

      throw new Error("No valid response from OpenAI");
    } catch (error) {
      console.error("Error generating schedule:", error);
      // Return fallback schedule on error
      return this.getDefaultSchedule();
    }
  }

  /**
   * Process detailed onboarding input from user
   * Takes a comprehensive free-form text input and extracts insights
   */
  async processDetailedOnboardingInput(
    userInput: string,
    basicProfile: {
      chronotype?: string;
      workStyle?: string;
      stressResponse?: string;
    }
  ): Promise<OnboardingConversationData> {
    try {
      const systemPrompt: ChatMessage = {
        role: "system",
        content: `You are an AI assistant analyzing a user's comprehensive onboarding input to extract key insights for personalized task scheduling.

The user has provided detailed information about their goals, challenges, lifestyle, constraints, and preferences. Combined with their basic profile data, extract actionable insights.

Analyze the input and extract:
1. Primary goals (what they want to achieve) - be specific
2. Current challenges (what's blocking them) - identify root causes  
3. Lifestyle constraints (work, family, health, time, etc.) - practical limitations
4. Motivation type (what drives them) - internal/external motivators
5. Availability patterns (when they can work) - specific times/patterns
6. Personality traits that affect productivity - work preferences

Return your analysis in this exact JSON format:
{
  "primaryGoals": ["specific goal 1", "specific goal 2", "specific goal 3"],
  "challenges": ["specific challenge 1", "specific challenge 2"],
  "lifestyle": "comprehensive description of lifestyle constraints and context",
  "motivationType": "detailed description of what motivates them and how",
  "availabilityPattern": "specific times, days, and patterns when they're available",
  "personalityTraits": ["trait1", "trait2", "trait3"]
}

Be specific, actionable, and extract insights that will help create personalized schedules.`,
      };

      const analysisPrompt: ChatMessage = {
        role: "user",
        content: `Please analyze this user's detailed onboarding information:

Basic Profile:
- Energy Pattern: ${basicProfile.chronotype || "Not specified"}
- Work Style: ${basicProfile.workStyle || "Not specified"}  
- Stress Response: ${basicProfile.stressResponse || "Not specified"}

User's Detailed Input:
"${userInput}"

Extract comprehensive insights that will help create a personalized productivity system for this user.`,
      };

      const response = await this.makeRequest([systemPrompt, analysisPrompt]);

      if (response.choices?.[0]?.message?.content) {
        try {
          const aiInsights = JSON.parse(response.choices[0].message.content);
          return {
            fullTranscript: [{ role: "user", content: userInput }],
            aiInsights,
          };
        } catch (parseError) {
          console.error("Failed to parse AI insights:", parseError);
          return this.getDefaultInsights(userInput);
        }
      }

      throw new Error("No valid response from OpenAI");
    } catch (error) {
      console.error("Error processing detailed onboarding input:", error);
      return this.getDefaultInsights(userInput);
    }
  }

  /**
   * Get default insights for fallback scenarios
   */
  private getDefaultInsights(userInput: string): OnboardingConversationData {
    // Extract basic insights from user input using simple keyword matching
    const input = userInput.toLowerCase();

    const goals = [];
    if (
      input.includes("fit") ||
      input.includes("exercise") ||
      input.includes("health")
    ) {
      goals.push("Improve fitness and health");
    }
    if (
      input.includes("code") ||
      input.includes("program") ||
      input.includes("develop")
    ) {
      goals.push("Develop programming skills");
    }
    if (
      input.includes("work") ||
      input.includes("career") ||
      input.includes("job")
    ) {
      goals.push("Advance career");
    }
    if (
      input.includes("learn") ||
      input.includes("study") ||
      input.includes("skill")
    ) {
      goals.push("Learn new skills");
    }
    if (goals.length === 0) {
      goals.push("General productivity improvement");
    }

    const challenges = [];
    if (input.includes("time") || input.includes("busy")) {
      challenges.push("Time management");
    }
    if (input.includes("focus") || input.includes("distract")) {
      challenges.push("Maintaining focus");
    }
    if (input.includes("motivat") || input.includes("consistent")) {
      challenges.push("Staying motivated");
    }
    if (challenges.length === 0) {
      challenges.push("General productivity challenges");
    }

    return {
      fullTranscript: [{ role: "user", content: userInput }],
      aiInsights: {
        primaryGoals: goals,
        challenges: challenges,
        lifestyle:
          input.includes("family") ||
          input.includes("kids") ||
          input.includes("parent")
            ? "Busy family life with multiple responsibilities"
            : "Active lifestyle with various commitments",
        motivationType:
          input.includes("progress") || input.includes("track")
            ? "Progress tracking and visible improvement"
            : "Achievement and goal completion",
        availabilityPattern: input.includes("morning")
          ? "Prefers morning hours for focused work"
          : input.includes("evening") || input.includes("night")
            ? "Prefers evening hours for focused work"
            : "Flexible availability throughout the day",
        personalityTraits: [
          "Goal-oriented",
          input.includes("detail") ? "Detail-oriented" : "Big-picture focused",
          input.includes("social") || input.includes("team")
            ? "Collaborative"
            : "Independent worker",
        ],
      },
    };
  }

  /**
   * Get default schedule for fallback scenarios
   */
  private getDefaultSchedule(): ScheduleResponse {
    const now = new Date();
    const today = now.toISOString().split("T")[0];

    return {
      tasks: [
        {
          id: "morning_routine",
          title: "Morning Routine",
          description: "Start your day with a productive morning routine",
          estimatedDuration: 30,
          priority: "high",
          category: "personal",
          startTime: `${today}T08:00:00`,
          endTime: `${today}T08:30:00`,
          isFlexible: false,
        },
        {
          id: "deep_work",
          title: "Deep Work Session",
          description: "Focus on your most important task",
          estimatedDuration: 90,
          priority: "high",
          category: "work",
          startTime: `${today}T09:00:00`,
          endTime: `${today}T10:30:00`,
          isFlexible: true,
        },
        {
          id: "break_stretch",
          title: "Break & Stretch",
          description: "Take a refreshing break",
          estimatedDuration: 15,
          priority: "medium",
          category: "health",
          startTime: `${today}T10:30:00`,
          endTime: `${today}T10:45:00`,
          isFlexible: false,
        },
      ],
      totalScheduledHours: 2.25,
      suggestions: [
        "Start with your most challenging task when energy is high",
        "Take regular breaks to maintain focus",
        "Review and adjust your schedule as needed",
      ],
      optimizationNotes: "Default schedule optimized for morning productivity",
    };
  }

  /**
   * Check if API key is configured
   */
  isConfigured(): boolean {
    return !!this.apiKey;
  }
}

// Export singleton instance
export const openAIService = new OpenAIService();
export default openAIService;
