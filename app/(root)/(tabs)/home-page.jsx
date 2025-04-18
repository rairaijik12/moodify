import { useState, useEffect, useCallback } from "react";
import { View, Text, TouchableOpacity, ScrollView, Image, useWindowDimensions, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import Ionicons from "@expo/vector-icons/Ionicons";
import { format, isSameDay, startOfWeek, endOfWeek, addWeeks, subWeeks, isWithinInterval, parseISO, subMonths, addMonths, startOfMonth, endOfMonth } from "date-fns";
import { LinearGradient } from "expo-linear-gradient";
import icons from "@/constants/icons";
import images from "@/constants/images";
import { useLocalSearchParams, useRouter } from "expo-router";
import XpStreakPopup from './streak-notif';
import { useTheme } from "@/app/(root)/properties/themecontext"; // Import the theme context
import { moodColors } from "@/app/services/type";
import AsyncStorage from '@react-native-async-storage/async-storage';
import ChatbotStartScreen from "./chatbot-start";
import { useFocusEffect } from '@react-navigation/native';

// Import local mood storage functions instead of Supabase
import { 
  getLocalMoodEntries,
  addLocalMoodEntry,
  getLocalMoodEntryByDate,
  MoodEntry 
} from "@/app/services/localMoodStorage";
import { 
  getUserFromLocalStorage, 
  saveUserToLocalStorage, 
  updateUserXP, 
  ensureXpRowExists, 
  fetchUserXP,
  STORAGE_KEYS,
  canClaimDailyXP,
  clearUserData // Add clearUserData import
} from "@/app/services/userService";
import { MoodEntry as MoodEntryType } from "@/app/services/moodService";

import MoodSelectionModal from "./mood-selection-modal";
import EmotionJournalModal from "./emotion-journal-modal";
import SummaryModal from "./summary-modal";
import WelcomeModal from "./welcome-modal";
import SettingsModal from "./settings-modal"; // Import the settings modal

const moodIcons = {
  rad: icons.MoodRad,
  good: icons.MoodGood,
  meh: icons.MoodMeh,
  bad: icons.MoodBad,
  awful: icons.MoodAwful,
};

// Map mood types to theme color properties
const moodToThemeMap = {
  "rad": "buttonBg",
  "good": "accent1",
  "meh": "accent2",
  "bad": "accent3",
  "awful": "accent4"
};

function getMoodXpDateKey(user) {
  if (!user || !user.user_id) return null;
  return `lastMoodXpClaimDate_${user.user_id}`;
}



export default function HomeScreen() {
  const router = useRouter(); // Add router
  // Use the theme context
  const { theme } = useTheme();
  
  // Toggle between weekly and monthly views
  const [viewMode, setViewMode] = useState("weekly");
  
  const [selectedDate, setSelectedDate] = useState(new Date()); // Central date for both week and month views
  const [moodModalVisible, setMoodModalVisible] = useState(false);
  const [emotionModalVisible, setEmotionModalVisible] = useState(false);
  const [summaryModalVisible, setSummaryModalVisible] = useState(false);
  const [selectedMood, setSelectedMood] = useState(null);
  const [selectedEmotions, setSelectedEmotions] = useState([]);
  const [journalEntry, setJournalEntry] = useState("");
  const { width, height } = useWindowDimensions();
  const [expandedEntries, setExpandedEntries] = useState({});
  const [isDatePickerVisible, setDatePickerVisible] = useState(false);
  const [isTimePickerVisible, setTimePickerVisible] = useState(false);
  const [entries, setEntries] = useState([]);
  const [filteredEntries, setFilteredEntries] = useState([]);
  const [xpHistory, setXpHistory] = useState({
    lastMoodEntryDate: null,
    lastChatbotRatingDate: null
  });
  const [xpAmount, setXpAmount] = useState(0);
  const [xpSource, setXpSource] = useState(null);
  const params = useLocalSearchParams();
  const [welcomeModalVisible, setWelcomeModalVisible] = useState(false);
  const nickname = params.nickname || "Friend";
  
  // Settings modal state
  const [settingsModalVisible, setSettingsModalVisible] = useState(false);
  
  // XP popup state
  const [xpPopupVisible, setXpPopupVisible] = useState(false);
  const [totalXp, setTotalXp] = useState(0); 
  const [streak, setStreak] = useState(0);

  // Fetch XP from Supabase on mount
  useEffect(() => {
    const loadUserXP = async () => {
      const user = await getUserFromLocalStorage();
      if (user) {
        const { current_xp } = await fetchUserXP(user.user_id);
        setTotalXp(current_xp || 0);
      }
    };
    loadUserXP();
  }, []);

  // Replace the useEffect for loading entries with useFocusEffect
  useFocusEffect(
    useCallback(() => {
      const loadMoodEntries = async () => {
        try {
          console.log("Loading mood entries from local storage...");
          const entriesFromStorage = await getLocalMoodEntries();
          console.log("Initial entries:", entriesFromStorage);
          setEntries(entriesFromStorage || []);
        } catch (error) {
          console.error("Error loading mood entries:", error);
          setEntries([]);
        }
      };

      loadMoodEntries();
    }, [])
  );

  // Filter entries based on selected view mode (weekly or monthly)
  useEffect(() => {
    if (entries.length > 0) {
      let filteredList = [];
      
      if (viewMode === "weekly") {
        const weekStart = startOfWeek(selectedDate, { weekStartsOn: 0 }); // Sunday
        const weekEnd = endOfWeek(selectedDate, { weekStartsOn: 0 }); // Saturday
        
        filteredList = entries.filter(entry => {
          // Parse the date from the entry
          const entryDate = entry.timestamp ? new Date(entry.timestamp) : parseISO(entry.formattedDate);
          // Check if it falls within the selected week
          return isWithinInterval(entryDate, { start: weekStart, end: weekEnd });
        });
      } else {
        // Monthly view
        const monthStart = startOfMonth(selectedDate);
        const monthEnd = endOfMonth(selectedDate);
        
        filteredList = entries.filter(entry => {
          // Parse the date from the entry
          const entryDate = entry.timestamp ? new Date(entry.timestamp) : parseISO(entry.formattedDate);
          // Check if it falls within the selected month
          return isWithinInterval(entryDate, { start: monthStart, end: monthEnd });
        });
      }
      
      setFilteredEntries(filteredList);
      // Reset expanded state when changing time periods
      setExpandedEntries({});
    }
  }, [selectedDate, entries, viewMode]);

  const toggleEntryExpansion = (index) => {
    setExpandedEntries(prev => ({ ...prev, [index]: !prev[index] }));
  };

  // Navigation functions
  const goToPrevious = () => {
    if (viewMode === "weekly") {
      setSelectedDate(subWeeks(selectedDate, 1));
    } else {
      setSelectedDate(subMonths(selectedDate, 1));
    }
  };
  
  const goToNext = () => {
    if (viewMode === "weekly") {
      setSelectedDate(addWeeks(selectedDate, 1));
    } else {
      setSelectedDate(addMonths(selectedDate, 1));
    }
  };

  // Format for displaying the date range
  const getDateRangeText = () => {
    if (viewMode === "weekly") {
      const weekStart = startOfWeek(selectedDate, { weekStartsOn: 0 });
      const weekEnd = endOfWeek(selectedDate, { weekStartsOn: 0 });
      return `${format(weekStart, "MMM d")} - ${format(weekEnd, "MMM d, yyyy")}`;
    } else {
      return format(selectedDate, "MMMM yyyy");
    }
  };

  // Toggle between weekly and monthly views
  const toggleViewMode = () => {
    setViewMode(viewMode === "weekly" ? "monthly" : "weekly");
  };

  const openMoodModal = () => {
    setSelectedDate(new Date()); // Reset to current date/time when opening modal
    setMoodModalVisible(true);
  };
  
  const closeMoodModal = () => setMoodModalVisible(false);

  // Open settings modal
  const openSettingsModal = () => {
    setSettingsModalVisible(true);
  };

  // Close settings modal
  const closeSettingsModal = () => {
    setSettingsModalVisible(false);
  };

  const selectMood = (mood) => {
    setSelectedMood(mood);
    setMoodModalVisible(false);
    setEmotionModalVisible(true);
  };

  const selectEmotion = (emotion) => {
    setSelectedEmotions(prev => [...prev, emotion]);
  };

  const handleSaveEntry = async () => {
    // Check if there's already an entry for this date
    const entryDate = new Date(
      selectedDate.getFullYear(),
      selectedDate.getMonth(),
      selectedDate.getDate()
    );
    const formattedDate = format(entryDate, "yyyy-MM-dd");
    
    try {
      const existingEntry = await getLocalMoodEntryByDate(formattedDate);
      
      if (existingEntry) {
        // Instead of showing alert, just proceed with the update
        setEmotionModalVisible(false);
        setTimeout(() => {
          setSummaryModalVisible(true);
        }, 300);
      } else {
        setEmotionModalVisible(false);
        setTimeout(() => {
          setSummaryModalVisible(true);
        }, 300);
      }
    } catch (error) {
      console.error("Error checking for existing entry:", error);
      setEmotionModalVisible(false);
      setTimeout(() => {
        setSummaryModalVisible(true);
      }, 300);
    }
  };

  const finalSaveEntry = async () => {
    console.log("Starting finalSaveEntry...");
    setSummaryModalVisible(false);
    
    try {
      // Get current user for user_id
      const user = await getUserFromLocalStorage();
      if (!user) {
        console.error("No user found - cannot proceed with XP award");
        return;
      }

      const nickname = await AsyncStorage.getItem(STORAGE_KEYS.NICKNAME);
      if (!nickname) {
        console.error("No nickname found - cannot proceed with XP award");
        return;
      }

      // Save to local storage directly
      const result = await addLocalMoodEntry(
        selectedMood || "meh",
        selectedEmotions,
        journalEntry,
        selectedDate,
        user.user_id
      );

      if (result) {
        console.log("Entry saved successfully:", result);
        
        // Update entries list
        setEntries(prev => {
          const dateStr = format(selectedDate, "yyyy-MM-dd");
          const existingIndex = prev.findIndex(e => 
            e.formattedDate === dateStr || format(new Date(e.logged_date), "yyyy-MM-dd") === dateStr
          );
          
          const enhancedEntry = {
            ...result,
            day: format(selectedDate, "EEEE"),
            date: format(selectedDate, "MMMM dd, yyyy"),
            time: format(selectedDate, "h:mm a"),
          };

          if (existingIndex >= 0) {
            const newEntries = [...prev];
            newEntries[existingIndex] = enhancedEntry;
            return newEntries;
          } else {
            return [enhancedEntry, ...prev].sort((a, b) => 
              (b.timestamp || 0) - (a.timestamp || 0)
            );
          }
        });

        try {
          console.log("Starting XP award process...");
          
          // Check if user can claim XP before showing popup
          const canClaim = await canClaimDailyXP(user.user_id, nickname);
          if (!canClaim) {
            console.log("User already claimed XP today - skipping popup");
            return;
          }
          
          // Ensure XP row exists
          await ensureXpRowExists(user.user_id);
          console.log("XP row ensured");
          
          // Get current XP
          const { current_xp, streak } = await fetchUserXP(user.user_id);
          console.log("Current XP:", current_xp, "Current streak:", streak);
          
          // Update state for XP popup
          setTotalXp(current_xp);
          setStreak((streak || 0) + 1);
          setXpAmount(5);
          setXpSource('mood_entry');
          
          console.log("Setting XP popup visible");
          // Show XP popup only if user can claim
          setXpPopupVisible(true);
          
        } catch (xpError) {
          console.error("Error in XP award process:", xpError);
        }
      } else {
        console.error("Failed to save entry");
        Alert.alert("Error", "Could not save your mood entry. Please try again.");
      }
    } catch (error) {
      console.error("Error in finalSaveEntry:", error);
      Alert.alert("Error", "Something went wrong. Please try again.");
    } finally {
      // Reset states
      setJournalEntry("");
      setSelectedMood(null);
      setSelectedEmotions([]);
    }
  };

  const redirectToChatbot = () => {
    finalSaveEntry(); // Make sure we save the entry first
    Alert.alert("Redirecting", "Navigating to chatbot screen");
    // Implement actual navigation here
  };

  // Add a new function for chatbot rating
  const handleChatbotRating = () => {
    // Check if already earned XP for chatbot rating today
    const today = new Date();
    const todayDateString = format(today, "yyyy-MM-dd");
    const alreadyEarnedToday = xpHistory.lastChatbotRatingDate === todayDateString;
    
    if (!alreadyEarnedToday) {
      // Update XP (no streak update for chatbot rating)
      setTotalXp(prev => prev + 20);
      
      // Set XP popup info
      setXpAmount(20);
      setXpSource('chatbot_rating');
      
      // Record that XP was earned today
      setXpHistory(prev => ({
        ...prev,
        lastChatbotRatingDate: todayDateString
      }));
      
      // Show XP popup
      setXpPopupVisible(true);
    }
  };

  const closeXpPopup = () => {
    setXpPopupVisible(false);
  };
  
  useEffect(() => {
    // Show welcome popup if coming from nickname page
    if (params.showWelcome === "true") {
      setWelcomeModalVisible(true);
       
      const timer = setTimeout(() => {
        setWelcomeModalVisible(false);
      }, 7000);
      return () => clearTimeout(timer);
    }
  }, [params.showWelcome]);

  // Get mood color from theme with proper type checking
  const getMoodThemeColor = (mood) => {
    if (!mood) return theme.calendarBg;
    
    // Convert to lowercase for consistency
    const normalizedMood = mood.toLowerCase();
    
    // Type-safe access to theme map properties
    const themeProperty = normalizedMood === 'rad' ? 'buttonBg' :
                          normalizedMood === 'good' ? 'accent1' :
                          normalizedMood === 'meh' ? 'accent2' :
                          normalizedMood === 'bad' ? 'accent3' :
                          normalizedMood === 'awful' ? 'accent4' : undefined;
    
    if (themeProperty && theme[themeProperty]) {
      return theme[themeProperty];
    }
    
    // Fallback to hardcoded colors if not in theme
    return normalizedMood === 'rad' ? '#FF6B35' :
           normalizedMood === 'good' ? '#1A936F' :
           normalizedMood === 'meh' ? '#FFC914' :
           normalizedMood === 'bad' ? '#4C8577' :
           normalizedMood === 'awful' ? '#FF220C' : theme.calendarBg;
  };

  // Add logout function
  // DELETE THIS AFTER PROD - Temporary logout function for testing
  const handleLogout = async () => {
    try {
      await clearUserData(); // Clear all user data from AsyncStorage
      router.replace('/'); // Navigate back to root
    } catch (error) {
      console.error('Error logging out:', error);
      Alert.alert('Error', 'Failed to logout. Please try again.');
    }
  };

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={{ flex: 1, backgroundColor: theme.background }}>

      <StatusBar style="light" hidden={false} translucent backgroundColor="transparent" />

      {/* Background Image */}
      <Image
        source={images.homepagebg}
        style={{
          position: "absolute",
          bottom: (height * -0.06) - 40,
          width: width,
          height: height * 0.86,
          resizeMode: "contain",
        }}
      />

      {/* Header Navigation with Weekly/Monthly Toggle */}
      <View style={{ zIndex: 20 }}>
        <View style={{ 
          paddingHorizontal: width < 350 ? 12 : 20, 
          flexDirection: "row", 
          justifyContent: "space-between", 
          alignItems: "center", 
          width: "100%", 
          paddingTop: 24, 
          paddingBottom: 16 
        }}>
          {/* Updated: Added onPress to open settings modal */}
          <TouchableOpacity onPress={openSettingsModal}>
            <Ionicons name="settings-outline" size={width < 350 ? 22 : 28} color={theme.text} />
          </TouchableOpacity>
          <TouchableOpacity onPress={goToPrevious}>
            <Ionicons name="chevron-back-outline" size={width < 350 ? 22 : 28} color={theme.dimmedText} />
          </TouchableOpacity>
          <Text style={{ 
            color: theme.text, 
            fontFamily: "LeagueSpartan-Bold", 
            fontSize: width < 350 ? 18 : 22,
            flex: 1,
            textAlign: "center"
          }}>
            {getDateRangeText()}
          </Text>
          <TouchableOpacity onPress={goToNext}>
            <Ionicons name="chevron-forward-outline" size={width < 350 ? 22 : 28} color={theme.dimmedText} />
          </TouchableOpacity>
          <TouchableOpacity onPress={toggleViewMode} style={{ paddingHorizontal: 5 }}>
            <Ionicons 
              name={viewMode === "weekly" ? "calendar-outline" : "calendar-number-outline"} 
              size={width < 350 ? 22 : 28} 
              color={theme.text} 
            />
          </TouchableOpacity>
        </View>
        
        {/* View Mode Indicator */}
        <View style={{ 
          alignItems: "center", 
          paddingBottom: 10 
        }}>
          <View style={{ 
            flexDirection: "row", 
            backgroundColor: theme.calendarBg, 
            borderRadius: 16, 
            padding: 4, 
          }}>
            <TouchableOpacity
              style={{
                paddingHorizontal: 16,
                paddingVertical: 6,
                borderRadius: 12,
                backgroundColor: viewMode === "weekly" ? theme.buttonBg : "transparent",
              }}
              onPress={() => setViewMode("weekly")}
            >
              <Text style={{ 
                color: viewMode === "weekly" ? 
                  (theme.background === "#000000" ? "#000000" : "#FFFFFF") : 
                  theme.text,
                fontWeight: "600",
                fontSize: 14
              }}>
                Weekly
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={{
                paddingHorizontal: 16,
                paddingVertical: 6,
                borderRadius: 12,
                backgroundColor: viewMode === "monthly" ? theme.buttonBg : "transparent",
              }}
              onPress={() => setViewMode("monthly")}
            >
              <Text style={{ 
                color: viewMode === "monthly" ? 
                  (theme.background === "#000000" ? "#000000" : "#FFFFFF") : 
                  theme.text,
                fontWeight: "600",
                fontSize: 14
              }}>
                Monthly
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Gradient Overlay */}
      <View
        pointerEvents="none"
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: height * 0.3,
          zIndex: 5,
        }}
      >
        <LinearGradient
          colors={[
            `${theme.background}E6`, // Add opacity
            `${theme.background}80`, // More transparent
            "transparent"
          ]}
          start={{ x: 0, y: 1 }}
          end={{ x: 0, y: 0 }}
          style={{ flex: 1 }}
        />
      </View>

      <ScrollView contentContainerStyle={{
          flexGrow: 1,
          alignItems: "center",
          paddingHorizontal: width < 350 ? 12 : 20,
        }}>
        <Text
          style={{ 
            color: theme.buttonBg, 
            fontFamily: "LeagueSpartan-Bold", 
            marginTop: height * 0.05,
            fontSize: width < 350 ? 40 : 55,
            textAlign: "center",
            letterSpacing: -3.5,
          }}>
          How are you feeling?
        </Text>

        {/* Add Mood Button */}
        <View style={{ 
          flex: 1, 
          justifyContent: "center", 
          alignItems: "center", 
          width: "100%", 
          paddingVertical: 40,
          marginBottom: 64
        }}>
          <TouchableOpacity
            onPress={openMoodModal}
            style={{
              width: width < 350 ? 60 : 80,
              height: width < 350 ? 60 : 80,
              backgroundColor: theme.calendarBg,
              borderRadius: 40,
              alignItems: "center",
              justifyContent: "center",
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.25,
              shadowRadius: 3.84,
              elevation: 5
            }}>
            <Text style={{ color: theme.buttonBg, fontSize: 48 }}>+</Text>
          </TouchableOpacity>
        </View>

        {/* Mood Entries List */}
        <View
          style={{ 
            width: "100%", 
            paddingBottom: 96,
            marginTop: height * 0.2 
          }}
        >
          {filteredEntries.length > 0 ? (
            filteredEntries.map((entry, index) => {
              const moodIcon = moodIcons[entry.mood];
              const hasJournal = entry.journal && entry.journal.trim().length > 0;
              const isExpanded = expandedEntries[index];
              // Use theme colors for mood
              const moodColor = getMoodThemeColor(entry.mood);

              return (
                <View
                  key={index}
                  style={{ 
                    backgroundColor: theme.calendarBg, 
                    padding: 16, 
                    borderRadius: 20, 
                    marginBottom: 16, 
                    width: "100%",
                    paddingHorizontal: width < 350 ? 12 : 20,
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 1 },
                    shadowOpacity: 0.22,
                    shadowRadius: 2.22,
                    elevation: 3
                  }}
                >
                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <Image
                      source={moodIcon}
                      style={{
                        width: width < 350 ? 35 : 45,
                        height: width < 350 ? 35 : 45,
                        marginRight: width < 350 ? 10 : 15,
                        resizeMode: "contain",
                        tintColor: moodColor
                      }}
                    />

                    <View style={{ flex: 1 }}>
                      <Text style={{
                        fontFamily: "LaoSansPro-Regular",
                        fontSize: width < 350 ? 12 : 15,
                        fontWeight: "600",
                        color: theme.text
                      }}>
                        {format(entry.timestamp ? new Date(entry.timestamp) : parseISO(entry.formattedDate), "EEEE MMMM dd, yyyy")}
                      </Text>
                      <View style={{ flex: 1, marginTop: 12 }}>
                        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                          <View style={{ flexDirection: "row", alignItems: "center" }}>
                            <Text style={{
                              fontFamily: "LeagueSpartan-Bold",
                              fontSize: width < 350 ? 24 : 30,
                              fontWeight: "600",
                              color: moodColor,
                            }}>
                              {entry.mood}{" "}
                            </Text>
                            <Text style={{
                              fontFamily: "LaoSansPro-Regular", 
                              fontSize: width < 350 ? 11 : 13,
                              color: theme.text, 
                            }}>
                              {entry.time}
                            </Text>
                          </View>

                          <TouchableOpacity 
                            onPress={() => toggleEntryExpansion(index)}
                            style={{ flexDirection: "row", alignItems: "center" }}
                          >
                            <Text style={{
                              fontFamily: "LaoSansPro-Regular", 
                              fontSize: width < 350 ? 12 : 14,
                              color: theme.dimmedText
                            }}>
                              {hasJournal ? "Journal" : "Emotion"}
                            </Text>
                            <Ionicons 
                              name={isExpanded ? "chevron-up" : "chevron-down"} 
                              size={width < 350 ? 14 : 18} 
                              color={theme.dimmedText} 
                            />
                          </TouchableOpacity>
                        </View>
                      </View>
                    </View>
                  </View>

                  {isExpanded && (
                    <View style={{ 
                      marginTop: 16, 
                      paddingTop: 12, 
                      borderTopWidth: 1, 
                      borderTopColor: `${theme.dimmedText}33` 
                    }}>
                      <Text style={{ 
                        color: theme.text, 
                        fontFamily: "LeagueSpartan", 
                        marginBottom: 8,
                        fontSize: width < 350 ? 16 : 18 
                      }}>
                        Feeling <Text style={{ color: moodColor }}>{entry.emotion}</Text>
                      </Text>
                      
                      {hasJournal && (
                        <Text style={{ 
                          color: theme.text, 
                          fontFamily: "LeagueSpartan", 
                          marginTop: 8,
                          fontSize: width < 350 ? 16 : 18 
                        }}>
                          {entry.journal}
                        </Text>
                      )}
                    </View>
                  )}
                </View>
              );
            })
          ) : (
            <View style={{ 
              backgroundColor: theme.calendarBg, 
              padding: 20, 
              borderRadius: 20, 
              marginTop: 10,
              alignItems: 'center',
              width: "100%",
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.22,
              shadowRadius: 2.22,
              elevation: 3
            }}>
              <Ionicons 
                name="calendar-outline" 
                size={width < 350 ? 32 : 42} 
                color={theme.dimmedText} 
                style={{ marginBottom: 10 }}
              />
              <Text style={{ 
                color: theme.text, 
                fontFamily: "LeagueSpartan-Bold", 
                fontSize: width < 350 ? 16 : 18,
                textAlign: "center"
              }}>
                No entries for this {viewMode === "weekly" ? "week" : "month"}
              </Text>
              <Text style={{ 
                color: theme.dimmedText, 
                fontFamily: "LaoSansPro-Regular", 
                fontSize: width < 350 ? 14 : 16,
                textAlign: "center",
                marginTop: 8
              }}>
                Tap the + button to add your first mood entry
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Modals - Pass theme to modals */}
      <WelcomeModal
        visible={welcomeModalVisible}
        onClose={() => setWelcomeModalVisible(false)}
        nickname={nickname.toString()}
        theme={theme}
      />

      <MoodSelectionModal
        visible={moodModalVisible}
        onClose={closeMoodModal}
        onSelectMood={selectMood}
        selectedDate={selectedDate}
        setSelectedDate={setSelectedDate}
        isDatePickerVisible={isDatePickerVisible}
        setDatePickerVisible={setDatePickerVisible}
        isTimePickerVisible={isTimePickerVisible}
        setTimePickerVisible={setTimePickerVisible}
        theme={theme}
      />

      <EmotionJournalModal
        visible={emotionModalVisible}
        onBack={() => {
          setEmotionModalVisible(false);
          setSelectedEmotions([]);
          setJournalEntry("");
          setMoodModalVisible(true);
        }}
        onContinue={handleSaveEntry}
        selectedEmotions={selectedEmotions}
        setSelectedEmotions={setSelectedEmotions}
        journalEntry={journalEntry}
        setJournalEntry={setJournalEntry}
        theme={theme}
      />

      <SummaryModal
        visible={summaryModalVisible}
        onClose={() => setSummaryModalVisible(false)}
        selectedMood={selectedMood}
        selectedEmotions={selectedEmotions}
        selectedDate={selectedDate}
        onSaveEntry={finalSaveEntry}
        onChatbot={redirectToChatbot}
        width={width}
        height={height}
        moodColors={moodColors}
        theme={theme}
      />

      {/* Settings Modal */}
      <SettingsModal
        visible={settingsModalVisible}
        onClose={closeSettingsModal}
        nickname={nickname.toString()}
      />

      {/* XP Streak Popup */}
      <XpStreakPopup 
        visible={xpPopupVisible}
        onClose={closeXpPopup}
        totalXp={totalXp}
        streak={streak}
        xpAmount={xpAmount}
        xpSource={xpSource}
        isPastDay={selectedDate && !isSameDay(selectedDate, new Date())}
        theme={theme}
      />
    </SafeAreaView>
  );
}
// ===== TEMP LOGOUT BUTTON COMPONENT END =====