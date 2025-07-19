// src/components/ai/FloatingAIAssistant.tsx
import { BorderRadius, Colors, Spacing, Typography } from "@/constants";
import { Ionicons } from "@expo/vector-icons";
import { useRef, useState } from "react";
import {
  Dimensions,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

interface FloatingAIAssistantProps {
  onSendMessage?: (message: string) => void;
  isLoading?: boolean;
  disabled?: boolean;
}

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

// Size constants
const COLLAPSED_SIZE = 56;
const EXPANDED_HEIGHT = 160;
const EXPANDED_WIDTH = screenWidth - 32; // 16px margin on each side

const FloatingAIAssistant: React.FC<FloatingAIAssistantProps> = ({
  onSendMessage,
  isLoading = false,
  disabled = false,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [message, setMessage] = useState("");
  const [position] = useState({
    x: screenWidth - COLLAPSED_SIZE - 16, // Start at bottom right
    y: screenHeight - COLLAPSED_SIZE - 100, // Account for tab bar
  });
  const textInputRef = useRef<TextInput>(null);

  const handleToggle = () => {
    if (disabled) return;
    setIsExpanded(!isExpanded);
    if (!isExpanded && textInputRef.current) {
      // Small delay to allow expansion before focusing
      setTimeout(() => {
        textInputRef.current?.focus();
      }, 100);
    }
  };

  const handleSend = () => {
    if (message.trim() && onSendMessage && !isLoading) {
      onSendMessage(message.trim());
      setMessage("");
      setIsExpanded(false);
    }
  };

  const handleClose = () => {
    setMessage("");
    setIsExpanded(false);
  };

  return (
    <View
      style={{
        position: "absolute",
        left: isExpanded ? (screenWidth - EXPANDED_WIDTH) / 2 : position.x,
        top: position.y,
        width: isExpanded ? EXPANDED_WIDTH : COLLAPSED_SIZE,
        height: isExpanded ? EXPANDED_HEIGHT : COLLAPSED_SIZE,
        backgroundColor: Colors.primary.main,
        borderRadius: isExpanded ? BorderRadius.lg : COLLAPSED_SIZE / 2,
        shadowColor: Colors.primary.main,
        shadowOffset: {
          width: 0,
          height: 4,
        },
        shadowOpacity: 0.3,
        shadowRadius: 12,
        elevation: 8,
      }}
    >
      {!isExpanded ? (
        // Collapsed State - Floating Button
        <TouchableOpacity
          onPress={handleToggle}
          disabled={disabled}
          style={{
            width: COLLAPSED_SIZE,
            height: COLLAPSED_SIZE,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Ionicons
            name={isLoading ? "sync" : "chatbubble-ellipses"}
            size={24}
            color={Colors.text.onPrimary}
          />
        </TouchableOpacity>
      ) : (
        // Expanded State - Chat Interface
        <View
          style={{
            flex: 1,
            padding: Spacing.md,
          }}
        >
          {/* Header */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: Spacing.sm,
            }}
          >
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Ionicons
                name="sparkles"
                size={16}
                color={Colors.text.onPrimary}
                style={{ marginRight: Spacing.xs }}
              />
              <Text
                style={{
                  ...Typography.captionMedium,
                  color: Colors.text.onPrimary,
                  fontWeight: "600",
                }}
              >
                Ask Blob AI
              </Text>
            </View>
            <TouchableOpacity onPress={handleClose}>
              <Ionicons name="close" size={16} color={Colors.text.onPrimary} />
            </TouchableOpacity>
          </View>

          {/* Input Area */}
          <View
            style={{
              flex: 1,
              backgroundColor: "rgba(255, 255, 255, 0.15)",
              borderRadius: BorderRadius.md,
              padding: Spacing.sm,
              marginBottom: Spacing.sm,
            }}
          >
            <TextInput
              ref={textInputRef}
              style={{
                ...Typography.bodyMedium,
                color: Colors.text.onPrimary,
                flex: 1,
                textAlignVertical: "top",
              }}
              placeholder="Ask me anything..."
              placeholderTextColor="rgba(255, 255, 255, 0.7)"
              value={message}
              onChangeText={setMessage}
              multiline
              maxLength={500}
              editable={!isLoading}
            />
          </View>

          {/* Action Row */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Text
              style={{
                ...Typography.captionSmall,
                color: "rgba(255, 255, 255, 0.7)",
              }}
            >
              {message.length}/500
            </Text>

            <TouchableOpacity
              onPress={handleSend}
              disabled={!message.trim() || isLoading}
              style={{
                backgroundColor:
                  message.trim() && !isLoading
                    ? "rgba(255, 255, 255, 0.2)"
                    : "rgba(255, 255, 255, 0.1)",
                paddingHorizontal: Spacing.md,
                paddingVertical: Spacing.xs,
                borderRadius: BorderRadius.sm,
                flexDirection: "row",
                alignItems: "center",
              }}
            >
              {isLoading ? (
                <Ionicons name="sync" size={14} color={Colors.text.onPrimary} />
              ) : (
                <Ionicons name="send" size={14} color={Colors.text.onPrimary} />
              )}
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
};

export default FloatingAIAssistant;
