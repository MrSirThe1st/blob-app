# Quick Integration Test

To quickly test the task generation system, add this simple button to any screen:

## Option 1: Add to SettingsScreen (Recommended)

```tsx
// In src/screens/main/SettingsScreen.tsx
import TaskGenerationTestComponent from "@/components/ai/TaskGenerationTestComponent";

// Add this component anywhere in your settings JSX:
<TaskGenerationTestComponent />;
```

## Option 2: Add a Simple Test Button

```tsx
// Import the hook
import { useOnboardingTaskGeneration } from "@/hooks/useOnboardingTaskGeneration";

// In your component:
const { generateInitialTasks, loading } = useOnboardingTaskGeneration();

const handleTestTaskGeneration = async () => {
  const result = await generateInitialTasks("1_week");
  if (result) {
    Alert.alert("Success!", `Generated ${result.tasksGenerated} tasks`);
  }
};

// Add this button in your JSX:
<TouchableOpacity
  style={{
    backgroundColor: "#EB6423",
    padding: 12,
    borderRadius: 8,
    margin: 16,
    alignItems: "center",
  }}
  onPress={handleTestTaskGeneration}
  disabled={loading}
>
  <Text style={{ color: "white", fontWeight: "bold" }}>
    {loading ? "Generating Tasks..." : "🤖 Test AI Task Generation"}
  </Text>
</TouchableOpacity>;
```

## Option 3: Add to Development Menu

If you have a development/debug menu, add the test component there.

## Testing Steps

1. Complete onboarding with a meaningful conversation
2. Use one of the above methods to test manual task generation
3. Check your Today screen to see the generated tasks
4. Verify tasks appear in your task management system

The system will automatically generate tasks during onboarding completion, but these test methods let you verify it's working and generate additional tasks manually.
