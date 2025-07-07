import { Stack } from "expo-router";

export default function OnboardingLayout() {
  return (
    <Stack>
      <Stack.Screen name="welcome" options={{ title: "Welcome" }} />
      <Stack.Screen name="step-1" options={{ title: "Energy patterns" }} />
      <Stack.Screen name="step-2" options={{ title: "Work style" }} />
      <Stack.Screen name="step-3" options={{ title: "Stress response" }} />
      <Stack.Screen name="step-4" options={{ title: "Calendar sync" }} />
      <Stack.Screen name="step-5" options={{ title: "AI conversation" }} />
    </Stack>
  );
}
