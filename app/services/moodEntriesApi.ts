import { format } from 'date-fns';
import type { moodEntry } from './type';

// Initial seed data that will be shown in both Calendar and Home screens
const initialEntries: moodEntry[] = [
  {
    mood: "rad",
    emotion: "Excited",
    day: "Tuesday",
    date: "April 15, 2025",
    time: "9:30 AM",
    journal: "Feeling great today! Started a new project.",
    timestamp: new Date("2025-02-15").getTime(),
    formattedDate: "2025-04-15" // For calendar screen lookup
  },
  {
    mood: "bad",
    emotion: "Frustrated",
    day: "Monday",
    date: "April 14, 2025",
    time: "8:45 PM",
    journal: "Had an argument that ruined Valentine's Day.",
    timestamp: new Date("2025-02-14").getTime(),
    formattedDate: "2025-04-14"
  },
  {
    mood: "rad",
    emotion: "Energetic",
    day: "Sunday",
    date: "April 13, 2025",
    time: "10:15 AM",
    journal: "Got a promotion at work! So happy!",
    timestamp: new Date("2025-02-13").getTime(),
    formattedDate: "2025-04-13"
  },
  {
    mood: "bad",
    emotion: "Anxious",
    day: "Saturday",
    date: "April 12, 2025",
    time: "3:20 PM",
    journal: "Big presentation tomorrow and I don't feel ready.",
    timestamp: new Date("2025-02-12").getTime(),
    formattedDate: "2025-04-12"
  },
  {
    mood: "good",
    emotion: "Content",
    day: "Friday",
    date: "April 11, 2025",
    time: "7:00 PM",
    journal: "Relaxing evening with a good book.",
    timestamp: new Date("2025-02-11").getTime(),
    formattedDate: "2025-04-11"
  },
  {
    mood: "awful",
    emotion: "Depressed",
    day: "Thursday",
    date: "April 10, 2025",
    time: "11:45 AM",
    journal: "Got some bad news and everything feels overwhelming.",
    timestamp: new Date("2025-02-10").getTime(),
    formattedDate: "2025-04-10"
  },
  {
    mood: "good",
    emotion: "Peaceful",
    day: "Wednesday",
    date: "April 9, 2025",
    time: "4:30 PM",
    journal: "Spent time in nature and felt very calm.",
    timestamp: new Date("2025-02-9").getTime(),
    formattedDate: "2025-04-09"
  },
  {
    mood: "meh",
    emotion: "Bored",
    day: "Tuesday",
    date: "April 8, 2025",
    time: "2:15 PM",
    journal: "Nothing interesting happened today.",
    timestamp: new Date("2025-02-8").getTime(),
    formattedDate: "2025-04-08"
  }
];

// Our in-memory database of mood entries
let moodEntries: moodEntry[] = [...initialEntries];

// For handling changes to data
const listeners: Array<() => void> = [];

/**
 * Subscribe to data changes
 * @param listener Function to call when data changes
 * @returns Unsubscribe function
 */
export const subscribeToChanges = (listener: () => void): (() => void) => {
  listeners.push(listener);
  return () => {
    const index = listeners.indexOf(listener);
    if (index !== -1) {
      listeners.splice(index, 1);
    }
  };
};

/**
 * Notify all listeners of a data change
 */
const notifyChanges = (): void => {
  listeners.forEach(listener => listener());
};

/**
 * Get all mood entries
 * @returns Array of mood entries
 */
export const getAllMoodEntries = (): moodEntry[] => {
  return [...moodEntries];
};

/**
 * Get a mood entry by its timestamp
 * @param timestamp The timestamp to look up
 * @returns The mood entry or undefined if not found
 */
export const getMoodEntryByTimestamp = (timestamp: number): moodEntry | undefined => {
  return moodEntries.find(entry => entry.timestamp === timestamp);
};

/**
 * Get a mood entry by its date
 * @param dateString Date string in "YYYY-MM-DD" format
 * @returns The mood entry or undefined if not found
 */
export const getMoodEntryByDate = (dateString: string): moodEntry | undefined => {
  return moodEntries.find(entry => entry.formattedDate === dateString);
};

/**
 * Add a new mood entry
 * @param entry The mood entry to add
 * @returns The added entry
 */
export const addMoodEntry = (entry: moodEntry): moodEntry => {
  // Make sure we have the formatted date for calendar lookup
  if (!entry.formattedDate && entry.timestamp) {
    entry.formattedDate = format(new Date(entry.timestamp), "yyyy-MM-dd");
  }
  
  // Check if we're updating an existing entry
  const existingEntryIndex = moodEntries.findIndex(
    e => e.formattedDate === entry.formattedDate
  );
  
  if (existingEntryIndex >= 0) {
    // Update existing entry
    moodEntries[existingEntryIndex] = entry;
  } else {
    // Add new entry
    moodEntries.push(entry);
  }
  
  // Sort entries by timestamp, newest first
  moodEntries.sort((a, b) => (b.timestamp ?? 0) - (a.timestamp ?? 0));
  
  notifyChanges();
  return entry;
};

/**
 * Update an existing mood entry
 * @param updatedEntry The updated mood entry
 * @returns The updated entry or undefined if not found
 */
export const updateMoodEntry = (updatedEntry: moodEntry): moodEntry | undefined => {
  const index = moodEntries.findIndex(entry => entry.timestamp === updatedEntry.timestamp);
  
  if (index === -1) {
    return undefined;
  }
  
  moodEntries[index] = updatedEntry;
  notifyChanges();
  return updatedEntry;
};

/**
 * Delete a mood entry
 * @param timestamp The timestamp of the entry to delete
 * @returns True if deleted, false if not found
 */
export const deleteMoodEntry = (timestamp: number): boolean => {
  const index = moodEntries.findIndex(entry => entry.timestamp === timestamp);
  
  if (index === -1) {
    return false;
  }
  
  moodEntries.splice(index, 1);
  notifyChanges();
  return true;
};

/**
 * Get mood entries formatted for calendar display
 * @returns Array of entries with format { mood: string, date: string }
 */
export const getMoodEntriesForCalendar = (): { mood: string; date: string }[] => {
  return moodEntries.map(entry => ({
    mood: entry.mood.charAt(0).toUpperCase() + entry.mood.slice(1), // Capitalize for calendar
    date: entry.formattedDate as string
  }));
};

/**
 * Reset to initial data (for testing)
 */
export const resetToInitialData = (): void => {
  moodEntries = [...initialEntries];
  notifyChanges();
};