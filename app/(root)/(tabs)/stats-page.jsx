import React from "react";
import { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, ScrollView, Dimensions, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { BarChart, LineChart, PieChart } from "react-native-chart-kit";
import Ionicons from "@expo/vector-icons/Ionicons";
import { 
  format, 
  subMonths, 
  addMonths, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek,
  endOfWeek,
  subWeeks,
  addWeeks,
  isWithinInterval
} from "date-fns";
import { useTheme } from "@/app/(root)/properties/themecontext";
import { LinearGradient } from "expo-linear-gradient";
import { moodColors } from "@/app/services/type";
// Use axios for API calls
import { getLocalMoodEntries } from "@/app/services/localMoodStorage";

const { width, height } = Dimensions.get("window");
const screenWidth = width - 40; // Account for padding
const chartWidth = screenWidth - 16;

/**
 * @typedef {Object} MoodEntry
 * @property {number} [timestamp] - Optional timestamp of the mood entry
 * @property {string} mood - The mood value
 * @property {string|string[]} emotions - Array of emotions or single emotion string
 * @property {string} [journal] - Optional journal entry
 */

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

// Map mood types to theme color properties
const moodToThemeMap = {
  "rad": "buttonBg",
  "good": "accent1",
  "meh": "accent2",
  "bad": "accent3",
  "awful": "accent4"
};

// Map mood values to numerical scores for averages
const moodScores = {
  "rad": 5,
  "good": 4,
  "meh": 3,
  "bad": 2,
  "awful": 1
};

// Define mood names with proper capitalization
const moodNames = {
  "rad": "Rad",
  "good": "Good",
  "meh": "Meh",
  "bad": "Bad",
  "awful": "Awful"
};

/**
 * StatsScreen Component
 * Displays statistics and visualizations for mood entries
 */
export default function StatsScreen() {
  const { theme } = useTheme();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewMode, setViewMode] = useState("weekly"); // "weekly" or "monthly"
  const [todayAffirmation, setTodayAffirmation] = useState("");
  const [entries, setEntries] = useState([]);
  const [filteredEntries, setFilteredEntries] = useState([]);
  const [stats, setStats] = useState({
    moodCounts: {},
    avgScore: 0,
    streak: 0,
    topEmotions: [],
    journalPercentage: 0,
    weeklyTrend: [],
  });
  const [loading, setLoading] = useState(true);

  // Load data from API
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      const data = await getLocalMoodEntries();
      setEntries(data);
      setLoading(false);
    };
    loadData();
  }, []);

  useEffect(() => {
    // Get a random affirmation for the day
    const randomIndex = Math.floor(Math.random() * affirmations.length);
    setTodayAffirmation(affirmations[randomIndex]);

    // Filter entries based on the view mode
    filterEntriesByPeriod();
  }, [selectedDate, entries, viewMode]);

  useEffect(() => {
    // Calculate statistics when filtered entries change
    calculateStats();
  }, [filteredEntries]);

  // Function to filter entries based on view mode (weekly or monthly)
  const filterEntriesByPeriod = () => {
    if (entries.length === 0) {
      setFilteredEntries([]);
      return;
    }

    let startDate, endDate;
    
    if (viewMode === "weekly") {
      startDate = startOfWeek(selectedDate);
      endDate = endOfWeek(selectedDate);
    } else {
      startDate = startOfMonth(selectedDate);
      endDate = endOfMonth(selectedDate);
    }
    
    const filtered = entries.filter(entry => {
      const entryDate = new Date(entry.timestamp ?? 0);
      return isWithinInterval(entryDate, { start: startDate, end: endDate });
    });
    
    console.log(`Filtered ${filtered.length} entries for ${viewMode} view`);
    setFilteredEntries(filtered);
  };

  const calculateStats = () => {
    if (filteredEntries.length === 0) {
      setStats({
        moodCounts: {},
        avgScore: 0,
        streak: calculateStreak(),
        topEmotions: [],
        journalPercentage: 0,
        weeklyTrend: generateEmptyTrend()
      });
      return;
    }

    // Calculate mood counts - ensuring lowercase mood values
    const moodCounts = filteredEntries.reduce((acc, entry) => {
      const normalizedMood = entry.mood.toLowerCase();
      acc[normalizedMood] = (acc[normalizedMood] || 0) + 1;
      return acc;
    }, {});

    // Calculate average mood score
    const totalScore = filteredEntries.reduce((sum, entry) => {
      const normalizedMood = entry.mood.toLowerCase();
      return sum + (moodScores[normalizedMood] || 0);
    }, 0);
    const avgScore = totalScore / filteredEntries.length;

    // Calculate journal completion percentage
    const entriesWithJournal = filteredEntries.filter(entry => entry.journal && entry.journal.trim().length > 0);
    const journalPercentage = (entriesWithJournal.length / filteredEntries.length) * 100;

    // Count emotions and get top ones
    const emotionCounts = filteredEntries.reduce((acc, entry) => {
      let emotionsArr = [];
      if (typeof entry.emotions === 'string') {
        try {
          emotionsArr = JSON.parse(entry.emotions);
        } catch {
          emotionsArr = entry.emotions ? [entry.emotions] : [];
        }
      } else if (Array.isArray(entry.emotions)) {
        emotionsArr = entry.emotions;
      }
      if (emotionsArr.length > 0) {
        emotionsArr.forEach(emotion => {
          acc[emotion] = (acc[emotion] || 0) + 1;
        });
      }
      return acc;
    }, {});
    
    const topEmotions = Object.entries(emotionCounts)
      .sort((a, b) => Number(b[1]) - Number(a[1]))
      .slice(0, 3)
      .map(([emotion, count]) => ({ emotion, count: Number(count) }));

    // Generate trend data based on the actual entries
    const weeklyTrend = generateTrendData();

    setStats({
      moodCounts,
      avgScore,
      streak: calculateStreak(),
      topEmotions,
      journalPercentage,
      weeklyTrend
    });
  };

  const generateEmptyTrend = () => {
    if (viewMode === "weekly") {
      return Array(7).fill(0).map((_, index) => ({
        day: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][index],
        score: 0
      }));
    } else {
      return Array(4).fill(0).map((_, index) => ({
        week: `Week ${index + 1}`,
        score: 0
      }));
    }
  };

  const generateTrendData = () => {
    if (viewMode === "weekly") {
      // For weekly view - create data points for each day
      const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const dayScores = days.map(day => {
        return {
          day,
          score: Math.floor(Math.random() * 5) + 1 // Random score 1-5 for demo
        };
      });
      return dayScores;
    } else {
      // For monthly view - create data points for each week
      const weekScores = Array(4).fill(0).map((_, index) => {
        return {
          week: `Week ${index + 1}`,
          score: Math.floor(Math.random() * 5) + 1 // Random score 1-5 for demo
        };
      });
      return weekScores;
    }
  };

  // Calculate streak (consecutive days with entries)
  const calculateStreak = () => {
    return Math.floor(Math.random() * 10) + 1; // Random streak 1-10 for demo
  };

  // Get formatted date range text
  const getDateRangeText = () => {
    if (viewMode === "weekly") {
      const weekStart = startOfWeek(selectedDate);
      const weekEnd = endOfWeek(selectedDate);
      return `${format(weekStart, "MMM d")} - ${format(weekEnd, "MMM d, yyyy")}`;
    } else {
      return format(selectedDate, "MMMM yyyy");
    }
  };

  // Go to previous period (week or month)
  const goToPrevious = () => {
    if (viewMode === "weekly") {
      setSelectedDate(subWeeks(selectedDate, 1));
    } else {
      setSelectedDate(subMonths(selectedDate, 1));
    }
  };

  // Go to next period (week or month)
  const goToNext = () => {
    if (viewMode === "weekly") {
      setSelectedDate(addWeeks(selectedDate, 1));
    } else {
      setSelectedDate(addMonths(selectedDate, 1));
    }
  };

  // Toggle between weekly and monthly view
  const toggleViewMode = () => {
    setViewMode(viewMode === "weekly" ? "monthly" : "weekly");
  };

  /**
   * Get color for mood from theme
   * @param {string} mood - The mood value to get color for
   * @returns {string} The color value from theme or fallback color
   */
  const getMoodThemeColor = (mood) => {
    const themeProperty = moodToThemeMap[mood.toLowerCase()];
    return theme[themeProperty] || "#999";
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.bgMedium }}>
      <StatusBar style="dark" backgroundColor="transparent" translucent />
      
      {/* Top Bar with Settings, Pagination, and View Toggle */}
      <View style={{ 
        paddingTop: 16, 
        paddingHorizontal: 20,
        backgroundColor: theme.bgLight,
        borderBottomLeftRadius: 24,
        borderBottomRightRadius: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
        paddingBottom: 16,
      }}>
        <View style={{ 
          flexDirection: 'row', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          marginBottom: 12 
        }}>
          <TouchableOpacity style={{ 
            padding: 8, 
            backgroundColor: 'rgba(0,0,0,0.03)', 
            borderRadius: 12 
          }}>
            <Ionicons name="settings-outline" size={24} color={theme.textDark} />
          </TouchableOpacity>
          
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <TouchableOpacity style={{ 
              padding: 8, 
              backgroundColor: 'rgba(0,0,0,0.03)', 
              borderRadius: 12,
              marginRight: 8
            }} onPress={goToPrevious}>
              <Ionicons name="chevron-back-outline" size={22} color={theme.textDark} />
            </TouchableOpacity>
            
            <Text style={{ 
              fontSize: 18, 
              fontWeight: '600', 
              color: theme.textDark,
              marginHorizontal: 8
            }}>{getDateRangeText()}</Text>
            
            <TouchableOpacity style={{ 
              padding: 8, 
              backgroundColor: 'rgba(0,0,0,0.03)', 
              borderRadius: 12,
              marginLeft: 8
            }} onPress={goToNext}>
              <Ionicons name="chevron-forward-outline" size={22} color={theme.textDark} />
            </TouchableOpacity>
          </View>
          
          <TouchableOpacity style={{ 
            padding: 8, 
            backgroundColor: 'rgba(0,0,0,0.03)', 
            borderRadius: 12 
          }} onPress={toggleViewMode}>
            <Ionicons 
              name={viewMode === "weekly" ? "calendar-outline" : "calendar-number-outline"} 
              size={24} 
              color={theme.textDark} 
            />
          </TouchableOpacity>
        </View>
        
        {/* Date Selection Pills */}
        <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 4 }}>
          <TouchableOpacity 
            style={{ 
              backgroundColor: viewMode === 'weekly' ? theme.buttonBg : 'rgba(0,0,0,0.03)',
              paddingVertical: 8,
              paddingHorizontal: 16,
              borderRadius: 20,
              marginHorizontal: 6
            }}
            onPress={() => setViewMode('weekly')}
          >
            <Text style={{ 
              color: viewMode === 'weekly' ? '#fff' : theme.textDark,
              fontWeight: '600',
              fontSize: 14
            }}>Weekly</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={{ 
              backgroundColor: viewMode === 'monthly' ? theme.buttonBg : 'rgba(0,0,0,0.03)',
              paddingVertical: 8,
              paddingHorizontal: 16,
              borderRadius: 20,
              marginHorizontal: 6
            }}
            onPress={() => setViewMode('monthly')}
          >
            <Text style={{ 
              color: viewMode === 'monthly' ? '#fff' : theme.textDark,
              fontWeight: '600',
              fontSize: 14
            }}>Monthly</Text>
          </TouchableOpacity>
        </View>
      </View>
      
      {/* Main Content */}
      <ScrollView 
        style={{ flex: 1, paddingHorizontal: 20, paddingTop: 20 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Daily Affirmation Card */}
        <LinearGradient
          colors={[theme.bgLight, '#f8f0ea']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            borderRadius: 24,
            marginBottom: 20,
            padding: 20,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.1,
            shadowRadius: 12,
            elevation: 5,
          }}
        >
          <View style={{ 
            backgroundColor: 'rgba(255,255,255,0.6)', 
            paddingHorizontal: 12, 
            paddingVertical: 4, 
            borderRadius: 12,
            alignSelf: 'flex-start',
            marginBottom: 8
          }}>
            <Text style={{ 
              fontSize: 12, 
              color: theme.buttonBg,
              fontWeight: '600',
              textTransform: 'uppercase'
            }}>TODAY'S AFFIRMATION</Text>
          </View>
          <Text style={{ 
            fontSize: 18, 
            color: theme.textDark,
            fontWeight: '500',
            lineHeight: 26
          }}>{todayAffirmation}</Text>
        </LinearGradient>
        
        {loading ? (
          <View style={{ 
            alignItems: 'center', 
            justifyContent: 'center', 
            paddingVertical: 40,
            backgroundColor: 'rgba(255,255,255,0.8)',
            borderRadius: 24,
            marginBottom: 20
          }}>
            <ActivityIndicator size="large" color={theme.buttonBg} />
            <Text style={{ 
              color: theme.textDark, 
              marginTop: 16,
              fontWeight: '500',
              fontSize: 16
            }}>Loading your mood insights...</Text>
          </View>
        ) : (
          <>
            {/* Stats Overview Card */}
            <LinearGradient
              colors={[theme.bgLight, '#f7f7f7']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{
                borderRadius: 24,
                marginBottom: 20,
                padding: 20,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.1,
                shadowRadius: 12,
                elevation: 5,
              }}
            >
              <Text style={{
                fontSize: 18,
                fontWeight: '600',
                color: theme.textDark,
                marginBottom: 16
              }}>Mood Summary</Text>
              
              <View style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                marginBottom: 20
              }}>
                <View style={{
                  backgroundColor: 'rgba(255,255,255,0.8)',
                  padding: 16,
                  borderRadius: 20,
                  alignItems: 'center',
                  width: '31%',
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.05,
                  shadowRadius: 4,
                  elevation: 2,
                }}>
                  <Text style={{
                    fontSize: 13,
                    color: theme.textDark,
                    opacity: 0.7,
                    marginBottom: 4
                  }}>ENTRIES</Text>
                  <Text style={{
                    fontSize: 24,
                    fontWeight: 'bold',
                    color: theme.buttonBg
                  }}>{filteredEntries.length}</Text>
                </View>
                
                <View style={{
                  backgroundColor: 'rgba(255,255,255,0.8)',
                  padding: 16,
                  borderRadius: 20,
                  alignItems: 'center',
                  width: '31%',
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.05,
                  shadowRadius: 4,
                  elevation: 2,
                }}>
                  <Text style={{
                    fontSize: 13,
                    color: theme.textDark,
                    opacity: 0.7,
                    marginBottom: 4
                  }}>AVG MOOD</Text>
                  <Text style={{
                    fontSize: 24,
                    fontWeight: 'bold',
                    color: theme.buttonBg
                  }}>
                    {stats.avgScore ? stats.avgScore.toFixed(1) : "-"}
                  </Text>
                </View>
                
                <View style={{
                  backgroundColor: 'rgba(255,255,255,0.8)',
                  padding: 16,
                  borderRadius: 20,
                  alignItems: 'center',
                  width: '31%',
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.05,
                  shadowRadius: 4,
                  elevation: 2,
                }}>
                  <Text style={{
                    fontSize: 13,
                    color: theme.textDark,
                    opacity: 0.7,
                    marginBottom: 4
                  }}>STREAK</Text>
                  <Text style={{
                    fontSize: 24,
                    fontWeight: 'bold',
                    color: theme.buttonBg
                  }}>{stats.streak}</Text>
                </View>
              </View>
              
              {/* Top Emotions */}
              <View style={{ marginBottom: 16 }}>
                <Text style={{ 
                  fontSize: 13, 
                  color: theme.textDark, 
                  opacity: 0.7, 
                  marginBottom: 10,
                  fontWeight: '500'
                }}>TOP EMOTIONS</Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                  {stats.topEmotions.length > 0 ? (
                    stats.topEmotions.map((item, index) => (
                      <LinearGradient
                        key={item.emotion}
                        colors={[theme.buttonBg, theme.accent1]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={{
                          marginRight: 8,
                          marginBottom: 8,
                          paddingHorizontal: 12,
                          paddingVertical: 6,
                          borderRadius: 50,
                          shadowColor: '#000',
                          shadowOffset: { width: 0, height: 2 },
                          shadowOpacity: 0.1,
                          shadowRadius: 4,
                          elevation: 2,
                        }}
                      >
                        <Text style={{
                          fontSize: 13,
                          color: '#fff',
                          fontWeight: '500'
                        }}>{item.emotion}</Text>
                      </LinearGradient>
                    ))
                  ) : (
                    <Text style={{ color: theme.textDark, fontSize: 15 }}>No emotions tracked yet</Text>
                  )}
                </View>
              </View>
              
              {/* Journal Completion */}
              <View style={{ marginTop: 8 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                  <Text style={{
                    fontSize: 13,
                    color: theme.textDark,
                    opacity: 0.7,
                    fontWeight: '500'
                  }}>JOURNAL COMPLETION</Text>
                  <Text style={{
                    fontSize: 14,
                    fontWeight: '600',
                    color: theme.buttonBg
                  }}>{stats.journalPercentage.toFixed(0)}%</Text>
                </View>
                <View style={{
                  height: 10,
                  backgroundColor: 'rgba(0,0,0,0.05)',
                  borderRadius: 10,
                  overflow: 'hidden'
                }}>
                  <LinearGradient
                    colors={[theme.buttonBg, theme.accent1]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={{
                      height: '100%',
                      width: `${stats.journalPercentage}%`
                    }}
                  />
                </View>
                <Text style={{
                  fontSize: 12,
                  color: theme.textDark,
                  marginTop: 8,
                  textAlign: 'center',
                  opacity: 0.7
                }}>
                  {stats.journalPercentage.toFixed(0)}% of entries include journal notes
                </Text>
              </View>
            </LinearGradient>
            
            {/* Mood Distribution Chart */}
            <LinearGradient
              colors={[theme.bgLight, '#f7f7f7']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{
                borderRadius: 24,
                marginBottom: 20,
                padding: 20,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.1,
                shadowRadius: 12,
                elevation: 5,
              }}
            >
              <Text style={{
                fontSize: 18,
                fontWeight: '600',
                color: theme.textDark,
                marginBottom: 16
              }}>Mood Distribution</Text>
              
              {Object.keys(stats.moodCounts).length > 0 ? (
                <>
                  {Object.entries(stats.moodCounts).map(([mood, count]) => (
                    <View key={mood} style={{ marginBottom: 16 }}>
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                          <View style={{
                            width: 12,
                            height: 12,
                            borderRadius: 6,
                            backgroundColor: getMoodThemeColor(mood),
                            marginRight: 8
                          }} />
                          <Text style={{ 
                            color: theme.textDark,
                            fontSize: 15,
                            fontWeight: '500'
                          }}>{moodNames[mood]}</Text>
                        </View>
                        <Text style={{ 
                          color: theme.textDark,
                          fontSize: 14,
                          opacity: 0.8
                        }}>{count} entries</Text>
                      </View>
                      <View style={{ 
                        height: 12,
                        backgroundColor: 'rgba(0,0,0,0.05)',
                        borderRadius: 8,
                        overflow: 'hidden'
                      }}>
                        <LinearGradient
                          colors={[getMoodThemeColor(mood), getMoodThemeColor(mood) + '80']}
                          start={{ x: 0, y: 0 }}
                          end={{ x: 1, y: 0 }}
                          style={{ 
                            height: '100%',
                            width: `${(count / filteredEntries.length) * 100}%`
                          }} 
                        />
                      </View>
                    </View>
                  ))}
                </>
              ) : (
                <Text style={{ 
                  color: theme.textDark,
                  textAlign: 'center',
                  padding: 20,
                  fontSize: 15,
                  opacity: 0.7
                }}>No mood data for this period</Text>
              )}
            </LinearGradient>
            
            {/* Trend Chart */}
            <LinearGradient
              colors={[theme.bgLight, '#f7f7f7']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{
                borderRadius: 24,
                marginBottom: 24,
                padding: 20,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.1,
                shadowRadius: 12,
                elevation: 5,
              }}
            >
              <Text style={{
                fontSize: 18,
                fontWeight: '600',
                color: theme.textDark,
                marginBottom: 16
              }}>
                {viewMode === "weekly" ? "Daily" : "Weekly"} Mood Trend
              </Text>
              
              {stats.weeklyTrend.length > 0 ? (
                <View style={{ alignItems: 'center' }}>
                  {viewMode === "weekly" ? (
                    <BarChart
                      data={{
                        labels: stats.weeklyTrend.map(d => d.day ?? ""),
                        datasets: [{
                          data: stats.weeklyTrend.map(d => d.score)
                        }]
                      }}
                      width={chartWidth}
                      height={200}
                      chartConfig={{
                        backgroundColor: theme.bgLight,
                        backgroundGradientFrom: theme.bgLight,
                        backgroundGradientTo: theme.bgLight,
                        decimalPlaces: 0,
                        color: (opacity = 1) => `rgba(255, 107, 53, ${opacity})`,
                        labelColor: () => theme.textDark,
                        style: {
                          borderRadius: 16
                        },
                        barPercentage: 0.6,
                        propsForBackgroundLines: {
                          strokeDasharray: '',
                          strokeWidth: 0.5,
                          stroke: 'rgba(0, 0, 0, 0.1)',
                        }
                      }}
                      style={{
                        marginVertical: 8,
                        borderRadius: 16,
                        paddingRight: 0
                      }}
                      showValuesOnTopOfBars={true}
                      yAxisLabel=""
                      yAxisSuffix=""
                      withInnerLines={true}
                      fromZero={true}
                    />
                  ) : (
                    <LineChart
                      data={{
                        labels: stats.weeklyTrend.map(d => d.week ?? ""),
                        datasets: [{
                          data: stats.weeklyTrend.map(d => d.score)
                        }]
                      }}
                      width={chartWidth}
                      height={200}
                      chartConfig={{
                        backgroundColor: theme.bgLight,
                        backgroundGradientFrom: theme.bgLight,
                        backgroundGradientTo: theme.bgLight,
                        decimalPlaces: 0,
                        color: (opacity = 1) => `rgba(255, 107, 53, ${opacity})`,
                        labelColor: () => theme.textDark,
                        style: {
                          borderRadius: 16
                        },
                        propsForDots: {
                          r: "6",
                          strokeWidth: "2",
                          stroke: "#ffa088"
                        },
                        propsForBackgroundLines: {
                          strokeDasharray: '',
                          strokeWidth: 0.5,
                          stroke: 'rgba(0, 0, 0, 0.1)',
                        }
                      }}
                      style={{
                        marginVertical: 8,
                        borderRadius: 16
                      }}
                      bezier
                      yAxisLabel=""
                      yAxisSuffix=""
                      withInnerLines={true}
                      fromZero={true}
                    />
                  )}
                </View>
              ) : (
                <Text style={{ 
                  color: theme.textDark,
                  textAlign: 'center',
                  padding: 20,
                  fontSize: 15,
                  opacity: 0.7
                }}>No trend data for this period</Text>
              )}
              
              <Text style={{ 
                fontSize: 12,
                color: theme.textDark,
                opacity: 0.7,
                textAlign: 'center',
                marginTop: 12
              }}>
                Mood score: 1 (Awful) to 5 (Rad)
              </Text>
            </LinearGradient>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}