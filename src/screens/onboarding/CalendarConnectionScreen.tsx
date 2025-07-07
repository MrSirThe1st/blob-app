import { StyleSheet, Text, View } from "react-native";

export const CalendarConnectionScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Calendar Connection</Text>
      <Text style={styles.placeholder}>
        Placeholder: Calendar connection feature coming soon.
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
