import * as React from 'react';
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";
import { useEffect } from "react";
import HomeScreen from "./home-page";
import ChatbotPageScreen from "./chatbot-page";
import CalendarScreen from "./calendar-page";
import StatsScreen from "./stats-page";
import ChatbotHistoryPage from "./chatbot-history-page";
import { useTheme } from "@/app/(root)/properties/themecontext"; // Import the theme context
import AsyncStorage from "@react-native-async-storage/async-storage";
import ChatbotStartScreen from "./chatbot-start";

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// Storage key for theme persistence (should match with other components)
const THEME_STORAGE_KEY = "app_selected_theme";

function ChatbotStack() {
  const { theme } = useTheme();
  
  return (
    <Stack.Navigator 
      screenOptions={{ 
        headerShown: false,
        contentStyle: { backgroundColor: theme.background }
      }}
    >
      <Stack.Screen name="ChatbotStart" component={ChatbotStartScreen} />
      <Stack.Screen name="ChatbotPage" component={ChatbotPageScreen} />
      <Stack.Screen name="ChatbotHistoryPage" component={ChatbotHistoryPage} />
    </Stack.Navigator>
  );
}

export default function Layout() {
  const { theme, setThemeName } = useTheme(); // Use the theme context
  
  // Load saved theme on initial mount
  useEffect(() => {
    const loadSavedTheme = async () => {
      try {
        const savedTheme = await AsyncStorage.getItem(THEME_STORAGE_KEY);
        if (savedTheme) {
          setThemeName(savedTheme);
          console.log(`Layout: Applied saved theme: ${savedTheme}`);
        }
      } catch (error) {
        console.error("Layout: Error loading saved theme:", error);
      }
    };
    
    loadSavedTheme();
  }, []);
  
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          let iconName;
          if (route.name === "Home") iconName = "home";
          else if (route.name === "Chatbot") iconName = "chatbubble-ellipses";
          else if (route.name === "Calendar") iconName = "calendar";
          else if (route.name === "Stats") iconName = "bar-chart";

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        // Use theme colors for tab bar
        tabBarActiveTintColor: theme.buttonBg, // Use the theme's button color for active tabs
        tabBarInactiveTintColor: theme.dimmedText, // Use dimmed text color for inactive tabs
        tabBarStyle: {
          backgroundColor: theme.background, // Use theme background color
          borderTopWidth: 0,
          elevation: 0, // Remove shadow on Android
          shadowOpacity: 0, // Remove shadow on iOS
        },
        // Set screen background colors
        headerStyle: {
          backgroundColor: theme.background,
        },
        headerTintColor: theme.text,
        headerShown: false,
        // Set content style to use theme background
        contentStyle: {
          backgroundColor: theme.background
        }
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Chatbot" component={ChatbotStack} />
      <Tab.Screen name="Calendar" component={CalendarScreen} />
      <Tab.Screen name="Stats" component={StatsScreen} />
    </Tab.Navigator>
  );
}