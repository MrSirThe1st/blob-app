import { Text, View } from "react-native";

export default function GoalsScreen() {
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#f5f5f5",
      }}
    >
      <Text
        style={{
          fontSize: 28,
          fontWeight: "bold",
          color: "#333",
          marginBottom: 16,
        }}
      >
        Goals
      </Text>
      <Text style={{ color: "#666", fontSize: 16 }}>
        This is the Goals page. Content coming soon!
      </Text>
    </View>
  );
}
