import { useState, useEffect, useCallback } from "react";
import { View, Text, TouchableOpacity, ScrollView, Image, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import Ionicons from "@expo/vector-icons/Ionicons";
import { format, subMonths, addMonths, startOfMonth, endOfMonth, eachDayOfInterval, getDay, subDays, addDays } from "date-fns";
import { useWindowDimensions } from "react-native";
import { useTheme } from "@/app/(root)/properties/themecontext"; // Import the theme hook
import AsyncStorage from "@react-native-async-storage/async-storage"; // Add AsyncStorage import
import CalendarMoodModal from "./calendar-mood-modal"; // Import the modal component
import { getLocalMoodEntries, getLocalMoodEntryByDate, addLocalMoodEntry } from "@/app/services/localMoodStorage";
import { getUserFromLocalStorage, saveUserToLocalStorage, updateUserXP, fetchUserXP } from "@/app/services/userService";
import { useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';

import MoodRad from "@/assets/icons/MoodRad.png";
import MoodGood from "@/assets/icons/MoodGood.png";
import MoodMeh from "@/assets/icons/MoodMeh.png";
import MoodBad from "@/assets/icons/MoodBad.png";
import MoodAwful from "@/assets/icons/MoodAwful.png";

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

// Array of daily affirmations
const affirmations = [
  "Today I choose joy and positivity",
  "I am worthy of all good things",
  "Every day is a fresh start",
  "I am getting stronger each day",
  "My feelings are valid and important",
  "Small steps lead to big changes",
  "I celebrate my progress today",
  "I deserve peace and happiness",
];

// Theme storage key for AsyncStorage
const THEME_STORAGE_KEY = "app_selected_theme";

// Manila time zone offset in milliseconds (UTC+8)
const MANILA_TIMEZONE_OFFSET = 8 * 60 * 60 * 1000;

// Define types for mood entries
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
  streak?: number;
}

interface MoodMap {
  [key: string]: MoodEntry;
}

export interface ThemeColors {
  [key: string]: string;
  buttonBg: string;
  accent1: string;
  accent2: string;
  accent3: string;
  accent4: string;
  text: string;
  textDark: string;
  bgLight: string;
  dimmedText: string;
  // ...add any other keys you use
}

export default function CalendarScreen() {
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const { width, height } = useWindowDimensions();
  const [view, setView] = useState("Calendar");
  const [selectedReward, setSelectedReward] = useState<string | null>(null);
  const [todayAffirmation, setTodayAffirmation] = useState("");
  const [calendarEntries, setCalendarEntries] = useState<MoodEntry[]>([]);
  const [moodMap, setMoodMap] = useState<MoodMap>({});
  const [userXP, setUserXP] = useState(0);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  
  // State for viewing mood entry details
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [moodModalVisible, setMoodModalVisible] = useState(false);
  
  // Use the theme context with multiple themes
  const { theme, setThemeName, availableThemes } = useTheme();

  // The available theme palettes - Autumn now first (default) theme
  const palettes = [
    {
      title: "🍂 Autumn Theme",
      themeName: "autumn",
      icon: "flame-outline",
      description: "Warm orange & red tones",
      color: "#FF6B35",
      requiredXP: 0, // Starting theme
      unlocked: true
    },
    {
      title: "🌱 Spring Theme",
      themeName: "spring",
      icon: "leaf-outline",
      description: "Fresh green & yellow tones",
      color: "#5fa55a",
      requiredXP: 25, // Unlock at 25 XP
      unlocked: userXP >= 25
    },
    {
      title: "☀️ Summer Theme",
      themeName: "summer",
      icon: "sunny-outline",
      description: "Vibrant pink & purple",
      color: "#c266a7",
      requiredXP: 50, // Unlock at 50 XP
      unlocked: userXP >= 50
    },
    {
      title: "❄️ Winter Theme",
      themeName: "winter",
      icon: "snow-outline",
      description: "Cool blue & ice tones",
      color: "#4deeea",
      requiredXP: 75, // Unlock at 75 XP
      unlocked: userXP >= 75
    },
  ];

  // Load user data every time the page is focused or when userId changes
  useFocusEffect(
    useCallback(() => {
      const loadUserData = async () => {
        const user = await getUserFromLocalStorage();
        if (user) {
          setUserId(user.user_id.toString());
          const xpData = await fetchUserXP(user.user_id);
          setUserXP(xpData.current_xp || 0);
        } else {
          setUserId(null);
          setUserXP(0);
        }
      };
      loadUserData();
    }, [])
  );

  // Load saved theme from AsyncStorage on component mount
  useEffect(() => {
    const loadSavedTheme = async () => {
      try {
        const savedTheme = await AsyncStorage.getItem(THEME_STORAGE_KEY);
        if (savedTheme) {
          setThemeName(savedTheme);
          // Set the selected reward based on the saved theme
          const matchingPalette = palettes.find(p => p.themeName.toLowerCase() === savedTheme.toLowerCase());
          if (matchingPalette) {
            setSelectedReward(matchingPalette.title);
          }
        }
      } catch (error) {
        console.error("Error loading saved theme:", error);
      }
    };
    
    loadSavedTheme();
  }, []);

  useEffect(() => {
    // Get a random affirmation for the day
    const randomIndex = Math.floor(Math.random() * affirmations.length);
    setTodayAffirmation(affirmations[randomIndex]);
  }, []);

  // Load mood entries from API
  useEffect(() => {
    const loadEntries = async () => {
      try {
        setLoading(true);
        
        // Fetch entries from API
        const entries = await getLocalMoodEntries();
        const normalizedEntries = entries.map((entry: any) => ({
          ...entry,
          emotions: Array.isArray(entry.emotions)
            ? entry.emotions
            : typeof entry.emotions === "string"
              ? entry.emotions.split(",").map((e: string) => e.trim()).filter(Boolean)
              : [],
        }));
        
        // Create a mood map for easy lookup by date
        const newMoodMap: MoodMap = {};
        normalizedEntries.forEach((entry: MoodEntry) => {
          if (entry.logged_date) {
            // Use the date part only as key (YYYY-MM-DD)
            const dateKey = new Date(entry.logged_date).toISOString().split('T')[0];
            newMoodMap[dateKey] = entry;
          }
        });
        
        setMoodMap(newMoodMap);
        setCalendarEntries(normalizedEntries);
        console.log("Loaded entries:", normalizedEntries.length);
        
      } catch (error) {
        console.error("Error loading entries:", error);
      } finally {
        setLoading(false);
      }
    };
    
    loadEntries();
  }, []);

  // Navigation for the month
  const goToPreviousMonth = () => setSelectedMonth(subMonths(selectedMonth, 1));
  const goToNextMonth = () => setSelectedMonth(addMonths(selectedMonth, 1));

  // Toggle between Calendar and Rewards view
  const toggleView = () => {
    setView(view === "Calendar" ? "Rewards" : "Calendar");
  };

  // Function to check if a day has a mood entry
  const getDayMood = (day: Date) => {
    const dateKey = day.toISOString().split('T')[0];
    return moodMap[dateKey]?.mood || null;
  };

  // Handle day selection (view only)
  const handleDaySelect = (day: Date) => {
    setSelectedDate(day);
    setMoodModalVisible(true);
  };

  // Handle reward selection
  const handleRewardSelect = async (palette: any) => {
    if (palette.unlocked) {
      setSelectedReward(palette.title);
      setThemeName(palette.themeName);
      
      // Save the selected theme to AsyncStorage
      try {
        await AsyncStorage.setItem(THEME_STORAGE_KEY, palette.themeName);
        console.log("Theme saved:", palette.themeName);
      } catch (error) {
        console.error("Error saving theme:", error);
      }
    }
  };

  // Generate the calendar days for the selected month
  const daysInMonth = () => {
    const monthStart = startOfMonth(selectedMonth);
    const monthEnd = endOfMonth(selectedMonth);
    
    // Get all days in the month
    const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
    
    // Calculate the first day of the month (0 = Sunday, 1 = Monday, etc.)
    const startDay = getDay(monthStart);
    
    // Add empty spaces for days before the 1st of the month
    const paddingDays = Array(startDay).fill(null);
    
    return [...paddingDays, ...days];
  };

  return (
    <SafeAreaView className="flex-1 bg-bg-medium">
      <StatusBar backgroundColor="transparent" style="dark" translucent />
      
      {/* Top Bar with Settings, Pagination, and Toggle Button */}
      <View className="items-center w-full pt-6 px-4">
        <View className="flex-row justify-between items-center w-full mb-4">
          <TouchableOpacity>
            <Ionicons name="settings-outline" size={28} color={theme.textDark} />
          </TouchableOpacity>
          
          {view === "Calendar" ? (
            <>
              <TouchableOpacity onPress={goToPreviousMonth}>
                <Ionicons name="chevron-back-outline" size={28} color={theme.textDark} />
              </TouchableOpacity>
              <Text className="text-xl font-semibold text-txt-darkblue">{format(selectedMonth, "MMMM yyyy")}</Text>
              <TouchableOpacity onPress={goToNextMonth}>
                <Ionicons name="chevron-forward-outline" size={28} color={theme.textDark} />
              </TouchableOpacity>
            </>
          ) : (
            <Text className="text-xl font-semibold text-txt-darkblue">Theme Rewards</Text>
          )}
          
          <TouchableOpacity onPress={toggleView}>
            <Ionicons name={view === "Calendar" ? "trophy-outline" : "calendar-outline"} size={28} color={theme.textDark} />
          </TouchableOpacity>
        </View>
      </View>
      
      <ScrollView className="flex-1 px-4 py-2">
        {/* Daily Affirmation Card */}
        <View style={{ marginBottom: 28 }}>
          <BlurView intensity={60} tint="light" style={{ borderRadius: 24, overflow: 'hidden', padding: 0 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', padding: 20, gap: 12 }}>
              <Text style={{ fontSize: 32, marginRight: 10 }}>🌞</Text>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 13, color: theme.textDark, opacity: 0.7, fontWeight: '600', marginBottom: 2, letterSpacing: 1.2, textTransform: 'uppercase' }}>Today's Affirmation</Text>
                <Text style={{ fontSize: 22, color: theme.textDark, fontWeight: 'bold', letterSpacing: 0.2, lineHeight: 28 }}>{todayAffirmation}</Text>
              </View>
            </View>
          </BlurView>
        </View>
        
        {/* Loading State */}
        {loading ? (
          <View className="items-center justify-center py-10">
            <ActivityIndicator size="large" color={theme.buttonBg} />
            <Text className="text-txt-darkblue mt-4">Loading your mood data...</Text>
          </View>
        ) : view === "Calendar" ? (
          /* Calendar View */
          <View>
            {/* Weekday Labels */}
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
              {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map((day) => (
                <View key={day} style={{ flex: 1, alignItems: 'center' }}>
                  <Text style={{ color: theme.textDark, fontWeight: '700', fontSize: 13, opacity: 0.7, letterSpacing: 2 }}>{day}</Text>
                </View>
              ))}
            </View>
            
            {/* Calendar Grid */}
            <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
              {daysInMonth().map((day, i) => {
                if (day === null) {
                  return <View key={`empty-${i}`} style={{ width: '14.28%', aspectRatio: 1, backgroundColor: 'transparent' }} />;
                }
                const dayMood = getDayMood(day);
                const isToday = day.toDateString() === new Date().toDateString();
                return (
                  <TouchableOpacity
                    key={day.toString()}
                    onPress={() => handleDaySelect(day)}
                    style={{ width: '14.28%', aspectRatio: 1, alignItems: 'center', justifyContent: 'center', padding: 2 }}
                    activeOpacity={0.85}
                  >
                    <View style={{
                      width: '92%',
                      height: '92%',
                      borderRadius: 18,
                      backgroundColor: '#fff',
                      alignItems: 'center',
                      justifyContent: 'center',
                      shadowColor: isToday ? theme.buttonBg : '#000',
                      shadowOpacity: isToday ? 0.18 : 0.06,
                      shadowRadius: isToday ? 8 : 2,
                      elevation: isToday ? 4 : 1,
                      borderWidth: isToday ? 2 : 0,
                      borderColor: isToday ? theme.buttonBg : 'transparent',
                      position: 'relative',
                    }}>
                      {dayMood && (
                        <View style={{ marginBottom: 2, backgroundColor: theme[moodToThemeMap[dayMood]], borderRadius: 12, padding: 3, shadowColor: '#000', shadowOpacity: 0.10, shadowRadius: 2, elevation: 2 }}>
                          <Image source={moodIcons[dayMood] || moodIcons[dayMood?.toLowerCase?.() || "meh"]} style={{ width: 18, height: 18, tintColor: '#fff' }} />
                        </View>
                      )}
                      <Text style={{ color: dayMood ? theme[moodToThemeMap[dayMood]] : theme.textDark, fontWeight: 'bold', fontSize: 16, marginTop: dayMood ? 2 : 12 }}>{format(day, 'd')}</Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
            
            {/* Mood Legend */}
            <View style={{ marginTop: 32, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'nowrap', gap: 1 }}>
              {Object.entries(moodToThemeMap).slice(0, 5).map(([mood, colorKey]) => (
                <View key={mood} style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: theme[colorKey], borderRadius: 14, paddingHorizontal: 5, paddingVertical: 3, marginRight: 1, gap: 2, shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 1, elevation: 1, flexShrink: 1, minWidth: 0, maxWidth: '20%' }}>
                  <Image source={moodIcons[mood]} style={{ width: 11, height: 11, tintColor: '#fff', marginRight: 1 }} />
                  <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 10, flexShrink: 1, minWidth: 0 }}>{mood.charAt(0).toUpperCase() + mood.slice(1)}</Text>
                </View>
              ))}
            </View>
          </View>
        ) : (
          /* Rewards View */
          <View>
            <Text style={{ color: theme.textDark, marginBottom: 16, fontSize: 15, fontWeight: '500' }}>
              Unlock new app themes by completing your mood entries consistently.
            </Text>
            
            {palettes.map((palette) => (
              <TouchableOpacity
                key={palette.title}
                onPress={() => handleRewardSelect(palette)}
                activeOpacity={palette.unlocked ? 0.85 : 1}
                style={{
                  marginBottom: 18,
                  borderRadius: 20,
                  overflow: 'hidden',
                  shadowColor: palette.unlocked ? palette.color : '#000',
                  shadowOpacity: palette.unlocked ? 0.18 : 0.06,
                  shadowRadius: palette.unlocked ? 8 : 2,
                  elevation: palette.unlocked ? 4 : 1,
                  borderWidth: selectedReward === palette.title ? 2 : 0,
                  borderColor: selectedReward === palette.title ? palette.color : 'transparent',
                  opacity: palette.unlocked ? 1 : 0.7,
                  backgroundColor: palette.unlocked ? '#fff' : '#f0f0f0',
                }}
                disabled={!palette.unlocked}
              >
                <LinearGradient
                  colors={palette.unlocked ? [palette.color + 'ee', theme.bgLight] : ['#e0e0e0', '#f0f0f0']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={{ padding: 18, flexDirection: 'row', alignItems: 'center', borderRadius: 20 }}
                >
                  <View style={{ width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center', backgroundColor: palette.color, shadowColor: palette.unlocked ? palette.color : '#000', shadowOpacity: palette.unlocked ? 0.18 : 0.06, shadowRadius: palette.unlocked ? 8 : 2, elevation: palette.unlocked ? 4 : 1 }}>
                    <Ionicons name={palette.icon as any} size={28} color="#fff" />
                  </View>
                  <View style={{ marginLeft: 16, flex: 1 }}>
                    <Text style={{ color: theme.textDark, fontWeight: 'bold', fontSize: 17 }}>{palette.title}</Text>
                    <Text style={{ color: theme.textDark, opacity: 0.7, fontSize: 14 }}>{palette.description}</Text>
                  </View>
                  {!palette.unlocked && (
                    <View style={{ position: 'absolute', left: 0, top: 0, right: 0, bottom: 0, backgroundColor: '#fff8', borderRadius: 20, alignItems: 'center', justifyContent: 'center', zIndex: 2 }}>
                      <Ionicons name="lock-closed-outline" size={32} color={palette.color} style={{ marginBottom: 4 }} />
                      <Text style={{ color: palette.color, fontWeight: 'bold', fontSize: 15 }}>{palette.requiredXP} XP</Text>
                    </View>
                  )}
                </LinearGradient>
                {selectedReward === palette.title && (
                  <View style={{ position: 'absolute', top: -8, right: -8, backgroundColor: palette.color, borderRadius: 16, paddingHorizontal: 10, paddingVertical: 4, shadowColor: palette.color, shadowOpacity: 0.18, shadowRadius: 8, elevation: 4 }}>
                    <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 13 }}>Selected</Text>
                  </View>
                )}
              </TouchableOpacity>
            ))}
            
            {/* XP Progress Bar */}
            <View style={{ marginTop: 8, marginBottom: 32 }}>
              <Text style={{ color: theme.textDark, marginBottom: 8, fontWeight: 'bold', fontSize: 15 }}>Your progress: {userXP} XP</Text>
              <View style={{ width: '100%', height: 18, backgroundColor: theme.bgLight, borderRadius: 12, overflow: 'hidden', flexDirection: 'row', alignItems: 'center', position: 'relative' }}>
                <LinearGradient
                  colors={[theme.buttonBg, theme.accent1]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={{ height: 18, borderRadius: 12, width: `${Math.min(userXP, 100)}%`, justifyContent: 'flex-end', alignItems: 'center', flexDirection: 'row', position: 'absolute', left: 0, top: 0, bottom: 0, zIndex: 2 }}
                >
                  {/* Floating XP badge, always at the end of the filled bar, but never outside the bar */}
                  <View style={{ position: 'absolute', right: Math.min(2, (100 - Math.min(userXP, 100)) * 2), top: -22, backgroundColor: theme.buttonBg, borderRadius: 16, paddingHorizontal: 10, paddingVertical: 4, shadowColor: theme.buttonBg, shadowOpacity: 0.18, shadowRadius: 8, elevation: 4, maxWidth: 80, alignItems: 'center' }}>
                    <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 13, textAlign: 'center' }}>{userXP} XP</Text>
                  </View>
                </LinearGradient>
              </View>
            </View>
          </View>
        )}
      </ScrollView>
      
      {/* Mood Entry Modal */}
      {selectedDate && (
        <CalendarMoodModal
          visible={moodModalVisible}
          date={selectedDate}
          onClose={() => setMoodModalVisible(false)}
          onSubmit={() => {}} // Disabled, view only
          existingEntry={selectedDate ? moodMap[selectedDate.toISOString().split('T')[0]] : null}
        />
      )}
    </SafeAreaView>
  );
}