import React from "react";
import { View, Text, TouchableOpacity, Modal, TextInput, ScrollView, useWindowDimensions, KeyboardAvoidingView, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Ionicons from "@expo/vector-icons/Ionicons";

/**
 * @typedef {Object} Theme
 * @property {string} background - Background color
 * @property {string} text - Text color
 * @property {string} buttonBg - Button background color
 * @property {string} calendarBg - Calendar background color
 * @property {string} dimmedText - Dimmed text color
 * @property {string} accent1 - First accent color
 * @property {string} accent2 - Second accent color
 * @property {string} accent3 - Third accent color
 * @property {string} accent4 - Fourth accent color
 */

/**
 * Emotion Journal Modal Component
 * @param {Object} props
 * @param {boolean} props.visible - Whether the modal is visible
 * @param {Function} props.onBack - Function to call when going back
 * @param {string[]} props.selectedEmotions - Array of selected emotion names
 * @param {Function} props.setSelectedEmotions - Function to update selected emotions
 * @param {string} props.journalEntry - Current journal entry text
 * @param {Function} props.setJournalEntry - Function to update journal entry
 * @param {Function} props.onContinue - Function to call when continuing
 * @param {Theme} props.theme - Theme object for styling
 */

// Map emotion names to theme color properties
const emotionToThemeMap = {
  "energetic": "buttonBg",
  "excited": "buttonBg",
  "confident": "buttonBg",
  "happy": "accent1",
  "calm": "accent1",
  "grateful": "accent1",
  "hopeful": "accent1",
  "bored": "accent2",
  "nervous": "accent2",
  "confused": "accent2",
  "anxious": "accent2",
  "sad": "accent3",
  "fearful": "accent3",
  "stressed": "accent3",
  "irritated": "accent4",
  "angry": "accent4",
};

const EmotionJournalModal = ({
  visible,
  onBack,
  selectedEmotions,
  setSelectedEmotions,
  journalEntry,
  setJournalEntry,
  onContinue,
  theme,
}) => {
  const { width, height } = useWindowDimensions();
  const modalPadding = width < 350 ? 12 : 24;
  const iconSize = width < 350 ? 22 : 28;

  // Toggle emotion selection
  const toggleEmotion = (emotion) => {
    setSelectedEmotions(prev => {
      if (prev.includes(emotion)) {
        return prev.filter(e => e !== emotion);
      } else {
        return [...prev, emotion];
      }
    });
  };

  // Base emotions with default colors
  const baseEmotions = [
    { name: "energetic", defaultColor: "#FF6B35" },
    { name: "excited", defaultColor: "#FF6B35" },
    { name: "confident", defaultColor: "#FF6B35" },
    { name: "happy", defaultColor: "#31AC54" },
    { name: "calm", defaultColor: "#31AC54" },
    { name: "grateful", defaultColor: "#31AC54" },
    { name: "hopeful", defaultColor: "#31AC54" },
    { name: "bored", defaultColor: "#828282" },
    { name: "nervous", defaultColor: "#828282" },
    { name: "confused", defaultColor: "#828282" },
    { name: "anxious", defaultColor: "#828282" },
    { name: "sad", defaultColor: "#507EE3" },
    { name: "fearful", defaultColor: "#507EE3" },
    { name: "stressed", defaultColor: "#507EE3" },
    { name: "irritated", defaultColor: "#C22222" },
    { name: "angry", defaultColor: "#C22222" },
  ];

  // Get emotion color from theme
  const getEmotionThemeColor = (emotion) => {
    const themeProperty = emotionToThemeMap[emotion];
    
    if (themeProperty && theme[themeProperty]) {
      return theme[themeProperty];
    }
    
    // Fallback to default color if not found in theme
    const baseEmotion = baseEmotions.find(e => e.name === emotion);
    return baseEmotion ? baseEmotion.defaultColor : "#828282";
  };

  // Map emotions with theme colors
  const emotions = baseEmotions.map(emotion => ({
    ...emotion,
    color: getEmotionThemeColor(emotion.name)
  }));

  return (
    <Modal visible={visible} transparent animationType="slide">
      <SafeAreaView edges={['top', 'left', 'right', 'bottom']} style={{ flex: 1, backgroundColor: theme.background }}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1 }}
        >
          <ScrollView
            style={{ flex: 1, backgroundColor: theme.background, paddingTop: 40 }}
            contentContainerStyle={{
              paddingHorizontal: modalPadding,
              paddingTop: height * 0.05,
              justifyContent: 'center',
              alignItems: 'center'
            }}
            keyboardShouldPersistTaps="handled"
          >
            <View style={{ alignItems: 'center', width: '100%', position: 'relative' }}>
              <TouchableOpacity
                onPress={onBack}
                style={{
                  position: 'absolute',
                  top: height * -0.045,
                  left: width * -0.016,
                  zIndex: 10,
                  padding: 8
                }}
              >
                <Ionicons name="arrow-back" size={iconSize} color={theme.text} />
              </TouchableOpacity>

              <Text
                style={{ 
                  color: theme.text, 
                  fontFamily: "LeagueSpartan-Bold", 
                  marginTop: 24, 
                  marginBottom: 16, 
                  textAlign: 'center',
                  fontSize: width < 350 ? 24 : 30 
                }}
              >
                Select at least 3 emotions that describe how you're feeling
              </Text>

              <Text
                style={{ 
                  color: theme.dimmedText, 
                  fontFamily: "LeagueSpartan", 
                  marginBottom: 40, 
                  textAlign: 'center',
                  fontSize: width < 350 ? 16 : 18 
                }}
              >
                Selected: {selectedEmotions.length}/3
              </Text>

              <View style={{ 
                flexDirection: 'row', 
                flexWrap: 'wrap', 
                justifyContent: 'space-between', 
                width: '100%', 
                gap: 8, 
                marginBottom: 32 
              }}>
                {emotions.map((emotion) => (
                  <TouchableOpacity
                    key={emotion.name}
                    style={{
                      backgroundColor: emotion.color,
                      padding: width < 350 ? 12 : 16,
                      borderRadius: 16,
                      width: "48%",
                      alignItems: "center",
                      borderWidth: selectedEmotions.includes(emotion.name) ? 3 : 0,
                      borderColor: theme.text,
                      marginBottom: 8,
                      opacity: selectedEmotions.includes(emotion.name) ? 1 : 0.7,
                      transform: [{ scale: selectedEmotions.includes(emotion.name) ? 1.05 : 1 }]
                    }}
                    onPress={() => toggleEmotion(emotion.name)}
                  >
                    <Text
                      style={{
                        color: theme.text,
                        fontSize: width < 350 ? 16 : 20,
                        fontFamily: "LeagueSpartan-Bold",
                        textShadowColor: 'rgba(0, 0, 0, 0.25)',
                        textShadowOffset: { width: 1, height: 1 },
                        textShadowRadius: 2
                      }}
                    >
                      {emotion.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <TextInput
                style={{
                  backgroundColor: theme.calendarBg,
                  color: theme.text,
                  padding: 20,
                  borderRadius: 16,
                  width: '100%',
                  minHeight: 180,
                  fontSize: width < 350 ? 16 : 18,
                  fontFamily: "LeagueSpartan-Regular"
                }}
                placeholder="Add notes here..."
                placeholderTextColor={theme.dimmedText}
                multiline
                value={journalEntry}
                onChangeText={setJournalEntry}
              />

              <View style={{ width: '100%', alignItems: 'flex-end', marginTop: 32 }}>
                <TouchableOpacity
                  onPress={onContinue}
                  disabled={selectedEmotions.length < 3}
                  style={{
                    backgroundColor: theme.buttonBg,
                    padding: 16,
                    borderRadius: 40,
                    opacity: selectedEmotions.length < 3 ? 0.5 : 1
                  }}
                >
                  <Ionicons name="arrow-forward" size={iconSize} color={theme.background} />
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );
};

export default EmotionJournalModal;