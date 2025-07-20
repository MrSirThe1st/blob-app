export type RootStackParamList = {
  Auth: undefined;
  Onboarding: undefined;
  MainTabs:
    | { initialTab?: "Home" | "Today" | "Goals" | "Buddy" | "Settings" }
    | undefined;
};

export type MainTabParamList = {
  Home: undefined;
  Today: undefined;
  Goals: undefined;
  Buddy: undefined;
  Settings: undefined;
};
