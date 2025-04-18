import React, { createContext, useContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Storage key for theme persistence
const THEME_STORAGE_KEY = "app_selected_theme";

/**
 * @typedef {Object} ThemeColors
 * @property {string} background - Background color
 * @property {string} text - Primary text color
 * @property {string} textDark - Dark text color
 * @property {string} dimmedText - Dimmed text color
 * @property {string} calendarBg - Calendar background color
 * @property {string} buttonBg - Button background color
 * @property {string} accent1 - First accent color
 * @property {string} accent2 - Second accent color
 * @property {string} accent3 - Third accent color
 * @property {string} accent4 - Fourth accent color
 * @property {string} bgLight - Light background color
 * @property {string} name - Theme name
 */

/**
 * @typedef {Object} ThemeContextType
 * @property {ThemeColors} theme - Current theme colors
 * @property {function(string): void} setThemeName - Function to set theme by name
 * @property {Object.<string, ThemeColors>} availableThemes - All available themes
 */

/** @type {Object.<string, ThemeColors>} */
const themes = {
  autumn: {
    background: "#000000",
    text: "#FFFFFF",
    textDark: "#22223B",
    dimmedText: "#545454",
    calendarBg: "#1A1A1A",
    buttonBg: "#FF6B35", // Orange shade for rad mood
    accent1: "#4CAF50", // Green for good mood
    accent2: "#A9A9A9", // Gray for meh mood
    accent3: "#4169E1", // Blue for bad mood
    accent4: "#E53935", // Red for awful mood
    bgLight: "#FFF8F0",
    name: "Autumn"
  },
  spring: {
    background: "#000000",
    text: "#FFFFFF",
    textDark: "#22223B",
    dimmedText: "#545454",
    calendarBg: "#1A1A1A",
    buttonBg: "#ffbc48", // yellow
    accent1: "#a2b973", // green
    accent2: "#ff6780", // pink
    accent3: "#b85c78", // dull pink
    accent4: "#776c8e", // purple
    bgLight: "#F6FFE0",
    name: "Spring"
  },
  winter: {
    background: "#000000",
    text: "#FFFFFF",
    textDark: "#22223B",
    dimmedText: "#545454",
    calendarBg: "#1A1A1A",
    buttonBg: "#b3e220", // light green
    accent1: "#6ad23d", // green
    accent2: "#19ad6b", // sage green
    accent3: "#197b7a", // dark teal
    accent4: "#2b57b8", // blue
    bgLight: "#E0F7FA",
    name: "Winter"
  },
  summer: {
    background: "#000000",
    text: "#FFFFFF",
    textDark: "#22223B",
    dimmedText: "#545454",
    calendarBg: "#1A1A1A",
    buttonBg: "#f6d51f", // bright yellow
    accent1: "#fa8925", // orange
    accent2: "#5fa55a", // green
    accent3: "#01b4bc", // teal
    accent4: "#fa5457", // red
    bgLight: "#FFFDE7",
    name: "Summer"
  },
  light: {
    background: "#FFFFFF",
    text: "#000000",
    textDark: "#22223B",
    dimmedText: "#A0A0A0",
    calendarBg: "#F0F0F0",
    buttonBg: "#FF6B35",
    accent1: "#F77F00",
    accent2: "#F6C49E",
    accent3: "#D62828",
    accent4: "#E0E0E0",
    bgLight: "#FFFFFF",
    name: "Light"
  }
};

// Create the context with default values
/** @type {React.Context<ThemeContextType>} */
const ThemeContext = createContext({
  theme: themes.autumn,
  setThemeName: () => {},
  availableThemes: themes
});

/**
 * Theme Provider Component
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components
 * @returns {JSX.Element} Theme provider component
 */
export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(themes.autumn);

  // Load saved theme on initial mount
  useEffect(() => {
    const loadSavedTheme = async () => {
      try {
        const savedTheme = await AsyncStorage.getItem(THEME_STORAGE_KEY);
        if (savedTheme && themes[savedTheme.toLowerCase()]) {
          setTheme(themes[savedTheme.toLowerCase()]);
          console.log(`Loaded saved theme: ${savedTheme}`);
        }
      } catch (error) {
        console.error("Error loading saved theme:", error);
      }
    };
    
    loadSavedTheme();
  }, []);

  /**
   * Set theme by name
   * @param {string} themeName - Name of the theme to set
   */
  const setThemeName = (themeName) => {
    const newTheme = themes[themeName.toLowerCase()];
    if (newTheme) {
      setTheme(newTheme);
      
      // Save theme to AsyncStorage
      AsyncStorage.setItem(THEME_STORAGE_KEY, themeName.toLowerCase())
        .then(() => console.log(`Theme ${themeName} saved to storage`))
        .catch(error => console.error("Error saving theme:", error));
    } else {
      console.warn(`Theme "${themeName}" not found`);
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, setThemeName, availableThemes: themes }}>
      {children}
    </ThemeContext.Provider>
  );
};

/**
 * Custom hook to use theme context
 * @returns {ThemeContextType} Theme context value
 */
export const useTheme = () => useContext(ThemeContext);