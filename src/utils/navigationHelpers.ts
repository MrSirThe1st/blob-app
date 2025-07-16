import { CommonActions } from "@react-navigation/native";

export const navigateToTabAfterOnboarding = (
  navigation: any,
  targetTab: "Home" | "Today" | "Goals" | "Buddy" | "Insights",
  hasGeneratedContent: boolean = false
) => {
  // Reset navigation stack and go to specific tab
  navigation.dispatch(
    CommonActions.reset({
      index: 0,
      routes: [
        {
          name: "MainTabs",
          params: { initialTab: targetTab },
        },
      ],
    })
  );
};
