export type RootStackParamList = {
  Auth: undefined;
  Onboarding: undefined;
  MainTabs:
    | { initialTab?: "Home" | "Today" | "Goals" | "Buddy" | "Insights" }
    | undefined;
};

export type MainTabParamList = {
  Home: undefined;
  Today: undefined;
  Goals: undefined;
  Buddy: undefined;
  Insights: undefined;
};
