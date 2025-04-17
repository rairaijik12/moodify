import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, Modal, Image, useWindowDimensions, ScrollView, TextInput } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { format } from "date-fns";
import { useTheme } from "@/app/(root)/properties/themecontext";

// Import mood icons
import MoodRad from "@/assets/icons/MoodRad.png";
import MoodGood from "@/assets/icons/MoodGood.png";
import MoodMeh from "@/assets/icons/MoodMeh.png";
import MoodBad from "@/assets/icons/MoodBad.png";
import MoodAwful from "@/assets/icons/MoodAwful.png";

// Define MoodEntry interface to fix 'never' type errors
interface MoodEntry {
  id?: string;
  user_id: string;
  mood: string;
  emotions: string[];
  journal?: string;
  logged_date: string;
  created_at?: string;
  timestamp?: number;
  formattedDate?: string;
}

// Map mood types to theme color properties
const moodToThemeMap: Record<string, string> = {
  "rad": "buttonBg",
  "good": "accent1",
  "meh": "accent2",
  "bad": "accent3",
  "awful": "accent4",
  "Rad": "buttonBg",
  "Good": "accent1",
  "Meh": "accent2",
  "Bad": "accent3",
  "Awful": "accent4"
};

// Define mood icons type
interface MoodIcons {
  [key: string]: any;
}

// Define mood emotions type
interface MoodEmotions {
  [key: string]: string[];
}

const moodIcons: Record<string, any> = {
  Rad: MoodRad,
  Good: MoodGood,
  Meh: MoodMeh,
  Bad: MoodBad,
  Awful: MoodAwful,
  rad: MoodRad,
  good: MoodGood,
  meh: MoodMeh,
  bad: MoodBad,
  awful: MoodAwful,
};

const moodEmotions: Record<string, string[]> = {
  rad: ["Happy", "Excited", "Energetic", "Peaceful", "Confident", "Grateful", "Proud"],
  good: ["Content", "Calm", "Hopeful", "Relaxed", "Satisfied", "Comfortable", "Optimistic"],
  meh: ["Neutral", "Okay", "Bored", "Indifferent", "Tired", "Uncertain", "Distracted"],
  bad: ["Sad", "Anxious", "Stressed", "Frustrated", "Disappointed", "Worried", "Lonely"],
  awful: ["Depressed", "Angry", "Fearful", "Hopeless", "Overwhelmed", "Exhausted", "Hurt"]
};

// Define props interface
interface CalendarMoodModalProps {
  visible: boolean;
  date: Date;
  onClose: () => void;
  onSubmit: (mood: string, emotions: string[], journal: string | undefined) => void;
  existingEntry: MoodEntry | null;
}

/**
 * Calendar Mood Modal Component
 * Displays detailed information about a mood entry when a calendar day is clicked
 * Also allows creating new mood entries
 */
const CalendarMoodModal = ({
  visible,
  date,
  onClose,
  onSubmit,
  existingEntry = null
}: CalendarMoodModalProps) => {
  const { theme } = useTheme();
  const { width, height } = useWindowDimensions();
  const iconSize = width < 350 ? 18 : 24;
  
  // States for form inputs
  const [selectedMood, setSelectedMood] = useState("");
  const [selectedEmotions, setSelectedEmotions] = useState<string[]>([]);
  const [journalEntry, setJournalEntry] = useState("");
  const [viewMode, setViewMode] = useState<"view" | "edit">("view");

  // Reset form when modal opens
  useEffect(() => {
    if (visible) {
      if (existingEntry) {
        setSelectedMood(existingEntry.mood || "");
        setSelectedEmotions(existingEntry.emotions || []);
        setJournalEntry(existingEntry.journal || "");
        setViewMode("view");
      } else {
        setSelectedMood("");
        setSelectedEmotions([]);
        setJournalEntry("");
        setViewMode("edit");
      }
    }
  }, [visible, existingEntry]);

  if (!visible) return null;
  
  // Get the appropriate color from theme based on mood
  const getMoodThemeColor = (mood: string): string => {
    if (!mood) return theme.buttonBg;
    
    const normalizedMood = mood.toLowerCase();
    const themeProperty = moodToThemeMap[mood] || moodToThemeMap[normalizedMood];
    
    if (themeProperty && theme[themeProperty as keyof typeof theme]) {
      return theme[themeProperty as keyof typeof theme];
    }
    
    return theme.buttonBg; // Fallback
  };

  const moodColor = getMoodThemeColor(selectedMood || (existingEntry?.mood || ""));
  
  // Toggle an emotion in the selected emotions array
  const toggleEmotion = (emotion: string) => {
    if (selectedEmotions.includes(emotion)) {
      setSelectedEmotions(selectedEmotions.filter(e => e !== emotion));
    } else {
      setSelectedEmotions([...selectedEmotions, emotion]);
    }
  };
  
  // Handle form submission
  const handleSubmit = () => {
    if (!selectedMood) {
      alert("Please select a mood");
      return;
    }
    
    onSubmit(selectedMood, selectedEmotions, journalEntry);
    onClose();
  };

  const dateString = date ? format(date, "EEEE, MMMM d, yyyy") : "";
  
  // VIEW MODE - Display existing entry
  if (viewMode === "view" && existingEntry) {
    return (
      <Modal
        visible={visible}
        transparent={true}
        animationType="fade"
        onRequestClose={onClose}
      >
        <View style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "rgba(0, 0, 0, 0.5)",
          padding: width < 350 ? 12 : 20
        }}>
          <View style={{
            width: "90%",
            backgroundColor: "white",
            borderRadius: 20,
            padding: 16,
            maxHeight: height * 0.7,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.25,
            shadowRadius: 3.84,
            elevation: 5
          }}>
            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Header with Date */}
              <View style={{
                flexDirection: "row",
                alignItems: "center",
                marginBottom: 16,
                paddingTop: 8,
                paddingBottom: 16,
                borderBottomWidth: 1,
                borderBottomColor: "#EEEEEE"
              }}>
                <Ionicons 
                  name="calendar-outline" 
                  size={iconSize} 
                  color="#000746" 
                  style={{ marginRight: 8 }}
                />
                <Text style={{
                  fontFamily: "LaoSansPro-Regular",
                  fontSize: width < 350 ? 14 : 16,
                  fontWeight: "600",
                  color: "#000746"
                }}>
                  {dateString}
                </Text>
              </View>
              
              {/* Mood Details */}
              <View style={{ 
                flexDirection: "row", 
                alignItems: "center", 
                marginBottom: 16,
                paddingRight: 24
              }}>
                <Image
                  source={moodIcons[existingEntry.mood] || moodIcons[existingEntry.mood.toLowerCase()]}
                  style={{
                    width: width < 350 ? 40 : 50,
                    height: width < 350 ? 40 : 50,
                    marginRight: width < 350 ? 12 : 16,
                    resizeMode: "contain"
                  }}
                />
                
                <Text style={{
                  fontFamily: "LeagueSpartan-Bold",
                  fontSize: width < 350 ? 26 : 32,
                  fontWeight: "600",
                  color: moodColor,
                  marginRight: 8
                }}>
                  {existingEntry.mood.charAt(0).toUpperCase() + existingEntry.mood.slice(1)}
                </Text>
              </View>
              
              {/* Emotions Section */}
              <View style={{
                marginBottom: 16,
                paddingBottom: 16,
                borderBottomWidth: 1,
                borderBottomColor: "#EEEEEE"
              }}>
                <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 8 }}>
                  <Ionicons 
                    name="heart-outline" 
                    size={iconSize} 
                    color={moodColor} 
                    style={{ marginRight: 8 }} 
                  />
                  <Text style={{
                    fontFamily: "LeagueSpartan-Bold",
                    fontSize: width < 350 ? 14 : 16,
                    color: "#000746"
                  }}>
                    Emotions
                  </Text>
                </View>
                
                <View style={{ flexDirection: "row", flexWrap: "wrap", paddingLeft: iconSize + 8 }}>
                  {existingEntry.emotions && existingEntry.emotions.length > 0 ? (
                    existingEntry.emotions.map((emotion, index) => (
                      <View 
                        key={index}
                        style={{
                          backgroundColor: moodColor,
                          paddingHorizontal: 12,
                          paddingVertical: 6,
                          borderRadius: 16,
                          margin: 4
                        }}
                      >
                        <Text style={{ color: "white", fontFamily: "LeagueSpartan" }}>
                          {emotion}
                        </Text>
                      </View>
                    ))
                  ) : (
                    <Text style={{
                      fontFamily: "LeagueSpartan",
                      fontSize: width < 350 ? 16 : 18,
                      color: "#999",
                      fontStyle: "italic"
                    }}>
                      No emotions recorded
                    </Text>
                  )}
                </View>
              </View>
              
              {/* Journal Section */}
              <View style={{
                marginBottom: 16
              }}>
                <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 8 }}>
                  <Ionicons 
                    name="journal-outline" 
                    size={iconSize} 
                    color={moodColor} 
                    style={{ marginRight: 8 }} 
                  />
                  <Text style={{
                    fontFamily: "LeagueSpartan-Bold",
                    fontSize: width < 350 ? 14 : 16,
                    color: "#000746"
                  }}>
                    Journal Entry
                  </Text>
                </View>
                
                {existingEntry.journal && existingEntry.journal.trim() ? (
                  <View style={{
                    padding: 12,
                    backgroundColor: "#F5F5F5",
                    borderRadius: 12
                  }}>
                    <Text style={{
                      color: "#000746",
                      fontFamily: "LeagueSpartan",
                      fontSize: width < 350 ? 14 : 16,
                      lineHeight: width < 350 ? 20 : 24
                    }}>
                      {existingEntry.journal}
                    </Text>
                  </View>
                ) : (
                  <Text style={{
                    fontFamily: "LeagueSpartan",
                    fontSize: width < 350 ? 16 : 18,
                    color: "#999",
                    fontStyle: "italic",
                    paddingLeft: iconSize + 8
                  }}>
                    No journal entry
                  </Text>
                )}
              </View>
              
              {/* Actions */}
              <View style={{
                marginTop: 8,
                flexDirection: "row",
                justifyContent: "center",
                gap: 16
              }}>
                <TouchableOpacity
                  onPress={() => setViewMode("edit")}
                  style={{
                    paddingHorizontal: 28,
                    paddingVertical: 12,
                    borderRadius: 100,
                    backgroundColor: "#999"
                  }}
                >
                  <Text style={{
                    color: "white",
                    fontFamily: "LeagueSpartan-Bold",
                    fontSize: 16
                  }}>
                    Edit
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  onPress={onClose}
                  style={{
                    paddingHorizontal: 28,
                    paddingVertical: 12,
                    borderRadius: 100,
                    backgroundColor: moodColor
                  }}
                >
                  <Text style={{
                    color: "white",
                    fontFamily: "LeagueSpartan-Bold",
                    fontSize: 16
                  }}>
                    Close
                  </Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    );
  }
  
  // EDIT MODE - Create or update an entry
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        padding: width < 350 ? 12 : 20
      }}>
        <View style={{
          width: "90%",
          backgroundColor: "white",
          borderRadius: 20,
          padding: 16,
          maxHeight: height * 0.8,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.25,
          shadowRadius: 3.84,
          elevation: 5
        }}>
          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Close Button */}
            <TouchableOpacity
              onPress={onClose}
              style={{
                position: "absolute",
                top: 12,
                right: 12,
                zIndex: 1
              }}
            >
              <Ionicons name="close" size={24} color="#000746" />
            </TouchableOpacity>
            
            {/* Header with Date */}
            <View style={{
              marginBottom: 20,
              paddingTop: 12,
              paddingBottom: 16,
              borderBottomWidth: 1,
              borderBottomColor: "#EEEEEE"
            }}>
              <Text style={{
                fontFamily: "LeagueSpartan-Bold",
                fontSize: 22,
                color: "#000746",
                textAlign: "center"
              }}>
                {existingEntry ? "Edit Mood Entry" : "New Mood Entry"}
              </Text>
              <Text style={{
                fontFamily: "LaoSansPro-Regular",
                fontSize: 16,
                color: "#666",
                textAlign: "center",
                marginTop: 4
              }}>
                {dateString}
              </Text>
            </View>
            
            {/* Mood Selection */}
            <View style={{ marginBottom: 20 }}>
              <Text style={{
                fontFamily: "LeagueSpartan-Bold",
                fontSize: 18,
                color: "#000746",
                marginBottom: 12
              }}>
                How are you feeling?
              </Text>
              
              <View style={{ flexDirection: "row", justifyContent: "space-around", flexWrap: "wrap" }}>
                {["Rad", "Good", "Meh", "Bad", "Awful"].map((mood) => (
                  <TouchableOpacity
                    key={mood}
                    onPress={() => setSelectedMood(mood.toLowerCase())}
                    style={{
                      alignItems: "center",
                      padding: 8,
                      borderRadius: 12,
                      backgroundColor: selectedMood === mood.toLowerCase() ? getMoodThemeColor(mood.toLowerCase()) + "20" : "transparent",
                      borderWidth: selectedMood === mood.toLowerCase() ? 2 : 0,
                      borderColor: getMoodThemeColor(mood.toLowerCase()),
                      margin: 4,
                      width: width / 5 - 16
                    }}
                  >
                    <Image
                      source={moodIcons[mood]}
                      style={{
                        width: 36,
                        height: 36,
                        resizeMode: "contain"
                      }}
                    />
                    <Text style={{
                      fontFamily: "LeagueSpartan",
                      fontSize: 14,
                      color: "#000746",
                      marginTop: 4
                    }}>
                      {mood}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            
            {/* Emotions Selection - only show if mood is selected */}
            {selectedMood && (
              <View style={{ marginBottom: 20 }}>
                <Text style={{
                  fontFamily: "LeagueSpartan-Bold",
                  fontSize: 18,
                  color: "#000746",
                  marginBottom: 12
                }}>
                  Select emotions (optional)
                </Text>
                
                <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
                  {moodEmotions[selectedMood]?.map((emotion: string) => (
                    <TouchableOpacity
                      key={emotion}
                      onPress={() => toggleEmotion(emotion)}
                      style={{
                        backgroundColor: selectedEmotions.includes(emotion) 
                          ? getMoodThemeColor(selectedMood) 
                          : "#F0F0F0",
                        paddingHorizontal: 12,
                        paddingVertical: 6,
                        borderRadius: 16,
                        margin: 4
                      }}
                    >
                      <Text style={{
                        color: selectedEmotions.includes(emotion) ? "white" : "#000746",
                        fontFamily: "LeagueSpartan"
                      }}>
                        {emotion}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}
            
            {/* Journal Entry */}
            <View style={{ marginBottom: 24 }}>
              <Text style={{
                fontFamily: "LeagueSpartan-Bold",
                fontSize: 18,
                color: "#000746",
                marginBottom: 12
              }}>
                Journal Entry (optional)
              </Text>
              
              <TextInput
                style={{
                  backgroundColor: "#F5F5F5",
                  borderRadius: 12,
                  padding: 12,
                  fontFamily: "LeagueSpartan",
                  fontSize: 16,
                  color: "#000746",
                  minHeight: 120,
                  textAlignVertical: "top"
                }}
                placeholder="Write your thoughts here..."
                placeholderTextColor="#999"
                multiline
                value={journalEntry}
                onChangeText={setJournalEntry}
              />
            </View>
            
            {/* Submit Button */}
            <View style={{ flexDirection: "row", justifyContent: "center", marginTop: 8 }}>
              <TouchableOpacity
                onPress={handleSubmit}
                disabled={!selectedMood}
                style={{
                  paddingHorizontal: 40,
                  paddingVertical: 14,
                  borderRadius: 100,
                  backgroundColor: selectedMood ? getMoodThemeColor(selectedMood) : "#CCCCCC"
                }}
              >
                <Text style={{
                  color: "white",
                  fontFamily: "LeagueSpartan-Bold",
                  fontSize: 18
                }}>
                  Save
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

export default CalendarMoodModal;
    