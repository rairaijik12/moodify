import React from "react";
import { View, Text, TouchableOpacity, Modal, Image, useWindowDimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Ionicons from "@expo/vector-icons/Ionicons";
import { format } from "date-fns";
import images from "@/constants/images";
import icons from "@/constants/icons";

// Map mood types to theme color properties
const moodToThemeMap = {
  "rad": "buttonBg",
  "good": "accent1",
  "meh": "accent2",
  "bad": "accent3",
  "awful": "accent4"
};

/**
 * SummaryModal Component
 * @param {Object} props
 * @param {boolean} props.visible - Whether the modal is visible
 * @param {Function} props.onClose - Function to call when closing the modal
 * @param {string} props.selectedMood - Currently selected mood
 * @param {string[]} props.selectedEmotions - Array of selected emotions
 * @param {Date} props.selectedDate - Selected date and time
 * @param {Function} props.onSaveEntry - Function to call when saving the entry
 * @param {Function} props.onChatbot - Function to call when opening chatbot
 * @param {Object} props.theme - Theme object for styling
 * @param {number} props.width - Modal width
 * @param {number} props.height - Modal height
 * @param {Object} props.moodColors - Object mapping moods to colors
 */
const SummaryModal = ({
  visible,
  onClose,
  selectedMood,
  selectedEmotions,
  selectedDate,
  onSaveEntry,
  onChatbot,
  theme,
  width: modalWidth,
  height: modalHeight,
  moodColors
}) => {
  const modalPadding = modalWidth < 350 ? 12 : 24;
  const iconSize = modalWidth < 350 ? 22 : 28;

  /**
   * Get mood color from theme
   * @param {string} mood - The mood to get color for
   * @returns {string} The color value from theme
   */
  const getMoodThemeColor = (mood) => {
    if (!mood) return theme.calendarBg;
    
    // Convert "rad" to "Rad" if needed for mapping
    const normalizedMood = mood.toLowerCase();
    const themeProperty = moodToThemeMap[normalizedMood];
    
    if (themeProperty && theme[themeProperty]) {
      return theme[themeProperty];
    }
    
    return theme.text; // Fallback
  };

  const moodColor = getMoodThemeColor(selectedMood);

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={{ 
        flex: 1, 
        backgroundColor: 'rgba(0, 0, 0, 0.5)', 
        justifyContent: 'center', 
        alignItems: 'center',
        padding: modalPadding
      }}>
        <View style={{ 
          backgroundColor: theme.buttonBg,
          borderRadius: 24,
          width: '100%',
          maxWidth: 500,
          overflow: 'hidden'
        }}>
          <View style={{ 
            flexDirection: 'row', 
            justifyContent: 'flex-end', 
            padding: modalPadding 
          }}>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={iconSize} color={theme.calendarBg} />
            </TouchableOpacity>
          </View>

          <View
            style={{ 
              alignItems: 'center',
              justifyContent: 'center',
              padding: modalPadding 
            }}
          >
            <Text
              style={{ 
                color: theme.calendarBg,
                fontFamily: "LeagueSpartan",
                textAlign: "center",
                marginBottom: 2,
                fontSize: modalWidth < 350 ? 28 : 36
              }}
            >
              You're feeling
            </Text>

            <Text
              style={{ 
                color: theme.buttonText || theme.calendarBg,
                fontFamily: "LeagueSpartan-Bold",
                textAlign: "center",
                marginBottom: 20,
                fontSize: modalWidth < 350 ? 20 : 48
              }}
            >
              {selectedMood}
            </Text>

            <View style={{
              flexDirection: 'row',
              flexWrap: 'wrap',
              justifyContent: 'center',
              marginBottom: 40,
              gap: 8
            }}>
              {selectedEmotions.map((emotion, index) => (
                <View
                  key={index}
                  style={{
                    backgroundColor: theme.calendarBg,
                    paddingHorizontal: 16,
                    paddingVertical: 8,
                    borderRadius: 20,
                  }}
                >
                  <Text style={{
                    color: theme.buttonBg,
                    fontFamily: "LeagueSpartan-Bold",
                    fontSize: modalWidth < 350 ? 16 : 20
                  }}>
                    {emotion}
                  </Text>
                </View>
              ))}
            </View>

            <Text
              style={{ 
                color: theme.calendarBg,
                fontFamily: "LeagueSpartan",
                textAlign: "center",
                marginBottom: 24,
                fontSize: modalWidth < 350 ? 16 : 20
              }}
            >
              {format(selectedDate, "MMMM d, yyyy 'at' h:mm a")}
            </Text>

            <View style={{ flexDirection: 'row', gap: 12 }}>
              <TouchableOpacity
                onPress={onSaveEntry}
                style={{
                  backgroundColor: theme.calendarBg,
                  paddingHorizontal: 24,
                  paddingVertical: 12,
                  borderRadius: 100,
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Text style={{
                  color: theme.buttonBg,
                  fontFamily: "LeagueSpartan-Bold",
                  fontSize: modalWidth < 350 ? 16 : 20
                }}>
                  Save Entry
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={onChatbot}
                style={{
                  backgroundColor: theme.calendarBg,
                  paddingHorizontal: 24,
                  paddingVertical: 12,
                  borderRadius: 100,
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Text style={{
                  color: theme.buttonBg,
                  fontFamily: "LeagueSpartan-Bold",
                  fontSize: modalWidth < 350 ? 16 : 20
                }}>
                  Talk to Moodi
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default SummaryModal;