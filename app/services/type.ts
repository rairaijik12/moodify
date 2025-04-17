// Types for the mood entry
export interface moodEntry {
    mood: string;        // e.g., "rad", "good", "meh", "bad", "awful" (lowercase)
    emotion: string;     // e.g., "Excited", "Content", "Anxious"
    day: string;         // e.g., "Monday", "Tuesday"
    date: string;        // e.g., "February 15, 2025" (full format for display)
    time: string;        // e.g., "9:30 AM" 
    journal: string;     // Journal entry text
    timestamp?: number;  // Unix timestamp for sorting and date identification
    formattedDate?: string; // e.g., "2025-02-15" (yyyy-MM-dd) for calendar lookups
  }
  
  // Types for mood colors - maintaining your existing color scheme
  export const moodColors = {
    // Original lowercase versions for HomeScreen
    rad: "#FF6B35", // orange
    good: "#31AC54", // green
    meh: "#828282", // gray
    bad: "#507EE3", // blue
    awful: "#C22222", // red
    
    // Capitalized versions for CalendarScreen
    Rad: "#FF6B35", // orange
    Good: "#31AC54", // green
    Meh: "#828282", // gray
    Bad: "#507EE3", // blue
    Awful: "#C22222", // red
  };
  
  // Interface for XP history tracking
  export interface xpHistory {
    lastMoodEntryDate: string | null;
    lastChatbotRatingDate: string | null;
  }