# Onboarding Task Generation System

This implementation connects your onboarding AI insights to automatically generate personalized tasks for users.

## How It Works

1. **After Onboarding Completion**: When a user completes onboarding with AI, the system automatically generates initial tasks based on:
   - Their conversation about goals and challenges
   - AI-extracted insights about their lifestyle and preferences
   - Their work style, energy patterns, and stress factors

2. **Task Generation Process**:
   - Uses existing `openAIService.generateTasksFromGoal()` method
   - Creates a mix of daily habits, weekly tasks, and one-time setup tasks
   - Schedules tasks appropriately across the selected timeframe
   - Stores tasks in your existing task database

## Files Added/Modified

### New Files:

- `src/services/onboarding/OnboardingTaskGenerationService.ts` - Main service for task generation
- `src/hooks/useOnboardingTaskGeneration.ts` - React hook for UI components
- `src/components/ai/TaskGenerationTestComponent.tsx` - Test component

### Modified Files:

- `src/services/onboarding/OnboardingCompletionService.ts` - Integrated task generation

## Integration Steps

### 1. Automatic Task Generation (Already Integrated)

Tasks are automatically generated when users complete onboarding with AI. No additional code needed.

### 2. Manual Task Generation (Optional)

Add the test component to any screen to allow users to manually generate tasks:

```tsx
// In any screen (e.g., SettingsScreen.tsx or HomeScreen.tsx)
import TaskGenerationTestComponent from "@/components/ai/TaskGenerationTestComponent";

// Add to your screen's JSX:
<TaskGenerationTestComponent />;
```

### 3. Using the Hook Directly

```tsx
import { useOnboardingTaskGeneration } from "@/hooks/useOnboardingTaskGeneration";

const MyComponent = () => {
  const { generateInitialTasks, loading, error } =
    useOnboardingTaskGeneration();

  const handleGenerateTasks = async () => {
    const result = await generateInitialTasks("1_week");
    if (result) {
      console.log(`Generated ${result.tasksGenerated} tasks!`);
    }
  };

  return (
    <TouchableOpacity onPress={handleGenerateTasks} disabled={loading}>
      <Text>{loading ? "Generating..." : "Generate Tasks"}</Text>
    </TouchableOpacity>
  );
};
```

## Testing

1. **Complete Onboarding**: Go through the onboarding flow with meaningful conversation text
2. **Check Tasks**: After onboarding completion, check the "Today" screen for generated tasks
3. **Manual Generation**: Add the test component to test manual task generation

## Generated Task Types

- **Daily Habits** (20%): Regular activities like "Review daily priorities"
- **Weekly Tasks** (60%): Goal-oriented tasks like "Research productivity tools"
- **One-Time Setup** (20%): Initial setup tasks like "Configure workspace"

## Task Properties

Each generated task includes:

- Title and description
- Appropriate task type (daily_habit, weekly_task, one_time)
- Priority level (high, medium, low)
- Estimated duration
- Suggested time slot (morning, afternoon, evening)
- Energy level requirement
- Difficulty rating (1-5)
- Success criteria

## Customization

### Timeframes

- `2_days`: Quick start with immediate tasks
- `1_week`: Default balanced approach
- `2_weeks`: Comprehensive planning

### Task Categories

Tasks are automatically categorized as:

- Personal productivity
- Health and wellness
- Work and career
- Learning and development

## Error Handling

The system gracefully handles:

- AI service unavailability
- Missing onboarding data
- Task creation failures
- Network issues

Users can always retry task generation or create tasks manually if the AI system is unavailable.

## Next Steps

1. **Test the Integration**: Add the test component to a screen and try generating tasks
2. **Monitor Performance**: Check logs for task generation success rates
3. **User Feedback**: Gather feedback on task relevance and usefulness
4. **Iterate**: Adjust the task generation prompts based on user feedback

## Notes

- Tasks are generated only once per onboarding completion
- Users can generate additional tasks manually using the retry functionality
- The system integrates with your existing task management and scheduling systems
- AI-generated tasks respect user preferences and constraints from onboarding
