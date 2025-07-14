import { StyleSheet, Text, View } from "react-native";

export const OpenConversationScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Open Conversation</Text>
      <Text style={styles.placeholder}>
        Placeholder: Open conversation feature coming soon.
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
  },
  placeholder: {
    fontSize: 16,
    color: "#888",
  },
});
