import AsyncStorage from '@react-native-async-storage/async-storage';
import { format } from 'date-fns';
import { MoodEntry } from './moodService';

// Re-export the MoodEntry type for use in other files
export type { MoodEntry };

// Storage key for mood entries
const MOOD_ENTRIES_KEY = 'mood_entries';

/**
 * Get all mood entries from AsyncStorage
 */
export const getLocalMoodEntries = async (): Promise<MoodEntry[]> => {
  try {
    const entriesJson = await AsyncStorage.getItem(MOOD_ENTRIES_KEY);
    if (!entriesJson) return [];
    
    return JSON.parse(entriesJson);
  } catch (error) {
    console.error('Error getting local mood entries:', error);
    return [];
  }
};

/**
 * Add a new mood entry to AsyncStorage
 */
export const addLocalMoodEntry = async (
  mood: string,
  emotions: string[],
  journal: string = '',
  date: Date = new Date(),
  userId: string = 'local_user'
): Promise<MoodEntry | null> => {
  try {
    // Create entry object
    const entry: MoodEntry = {
      id: date.getTime().toString(), // Use timestamp as ID
      user_id: userId,
      mood: mood.toLowerCase(),
      emotions: emotions,
      journal,
      logged_date: date.toISOString(),
      timestamp: date.getTime(),
      formattedDate: format(date, 'yyyy-MM-dd'),
      created_at: new Date().toISOString()
    };
    
    // Get existing entries
    const existingEntries = await getLocalMoodEntries();
    
    // Check if entry for this date already exists
    const dateStr = format(date, 'yyyy-MM-dd');
    const entryIndex = existingEntries.findIndex(e => 
      e.formattedDate === dateStr || format(new Date(e.logged_date), 'yyyy-MM-dd') === dateStr
    );
    
    let newEntries;
    if (entryIndex >= 0) {
      // Update existing entry
      existingEntries[entryIndex] = entry;
      newEntries = existingEntries;
    } else {
      // Add new entry
      newEntries = [...existingEntries, entry];
    }
    
    // Sort by date (newest first)
    newEntries.sort((a, b) => new Date(b.logged_date).getTime() - new Date(a.logged_date).getTime());
    
    // Save to AsyncStorage
    await AsyncStorage.setItem(MOOD_ENTRIES_KEY, JSON.stringify(newEntries));
    
    return entry;
  } catch (error) {
    console.error('Error adding local mood entry:', error);
    return null;
  }
};

/**
 * Get a mood entry by date
 */
export const getLocalMoodEntryByDate = async (dateStr: string): Promise<MoodEntry | null> => {
  try {
    const entries = await getLocalMoodEntries();
    const entry = entries.find(e => 
      e.formattedDate === dateStr || format(new Date(e.logged_date), 'yyyy-MM-dd') === dateStr
    );
    
    return entry || null;
  } catch (error) {
    console.error('Error getting local mood entry by date:', error);
    return null;
  }
};

/**
 * Delete a mood entry
 */
export const deleteLocalMoodEntry = async (entryId: string): Promise<boolean> => {
  try {
    const entries = await getLocalMoodEntries();
    const filteredEntries = entries.filter(e => e.id !== entryId);
    
    if (filteredEntries.length === entries.length) {
      return false; // No entry was removed
    }
    
    await AsyncStorage.setItem(MOOD_ENTRIES_KEY, JSON.stringify(filteredEntries));
    return true;
  } catch (error) {
    console.error('Error deleting local mood entry:', error);
    return false;
  }
};

/**
 * Update a mood entry
 */
export const updateLocalMoodEntry = async (
  entryId: string,
  updates: Partial<MoodEntry>
): Promise<MoodEntry | null> => {
  try {
    const entries = await getLocalMoodEntries();
    const entryIndex = entries.findIndex(e => e.id === entryId);
    
    if (entryIndex === -1) {
      return null;
    }
    
    // Update entry
    entries[entryIndex] = {
      ...entries[entryIndex],
      ...updates
    };
    
    // Save all entries
    await AsyncStorage.setItem(MOOD_ENTRIES_KEY, JSON.stringify(entries));
    
    return entries[entryIndex];
  } catch (error) {
    console.error('Error updating local mood entry:', error);
    return null;
  }
};

/**
 * Get mood entries formatted for calendar
 */
export const getLocalMoodEntriesForCalendar = async () => {
  try {
    const entries = await getLocalMoodEntries();
    return entries.map(entry => ({
      mood: entry.mood.charAt(0).toUpperCase() + entry.mood.slice(1),
      date: entry.formattedDate
    }));
  } catch (error) {
    console.error('Error getting local mood entries for calendar:', error);
    return [];
  }
}; 