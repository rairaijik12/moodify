import AsyncStorage from '@react-native-async-storage/async-storage';
import { format } from 'date-fns';

// Storage key for mood entries
const MOOD_ENTRIES_KEY = 'mood_entries';

/**
 * @typedef {Object} MoodEntry
 * @property {string} id - Unique identifier for the entry
 * @property {string} user_id - User identifier
 * @property {string} mood - The mood value (lowercase)
 * @property {string[]} emotions - Array of emotion strings
 * @property {string} journal - Journal entry text
 * @property {string} logged_date - ISO string of when the mood was logged
 * @property {number} timestamp - Unix timestamp of the entry
 * @property {string} formattedDate - Date in yyyy-MM-dd format
 * @property {string} created_at - ISO string of entry creation time
 */

/**
 * Get all mood entries from AsyncStorage
 * @returns {Promise<MoodEntry[]>} Array of mood entries
 */
export const getLocalMoodEntries = async () => {
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
 * @param {string} mood - The mood to record
 * @param {string[]} emotions - Array of emotions
 * @param {string} [journal=''] - Optional journal entry
 * @param {Date} [date=new Date()] - Date of the entry
 * @param {string} [userId='local_user'] - User identifier
 * @returns {Promise<MoodEntry|null>} The created entry or null if failed
 */
export const addLocalMoodEntry = async (
  mood,
  emotions,
  journal = '',
  date = new Date(),
  userId = 'local_user'
) => {
  try {
    // Create entry object
    const entry = {
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
 * @param {string} dateStr - Date string in yyyy-MM-dd format
 * @returns {Promise<MoodEntry|null>} The found entry or null if not found
 */
export const getLocalMoodEntryByDate = async (dateStr) => {
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
 * @param {string} entryId - ID of the entry to delete
 * @returns {Promise<boolean>} True if deleted successfully
 */
export const deleteLocalMoodEntry = async (entryId) => {
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
 * @param {string} entryId - ID of the entry to update
 * @param {Partial<MoodEntry>} updates - Partial entry with fields to update
 * @returns {Promise<MoodEntry|null>} Updated entry or null if failed
 */
export const updateLocalMoodEntry = async (entryId, updates) => {
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
 * @returns {Promise<Array<{mood: string, date: string}>>} Formatted entries for calendar
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