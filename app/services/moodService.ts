import { format } from 'date-fns';
import supabase from '@/supabaseConfig';
import { getUserFromLocalStorage } from './userService';

// Define types for mood entries
export interface MoodEntry {
  id?: string;
  user_id: string;
  mood: string;
  emotions: string[] | string;
  journal?: string;
  logged_date: string;
  created_at?: string;
  timestamp?: number;
  formattedDate?: string;
}

/**
 * Get all mood entries for the current user
 */
export const getAllMoodEntries = async (): Promise<MoodEntry[]> => {
  try {
    const user = await getUserFromLocalStorage();
    if (!user) {
      console.error('No user found in local storage');
      return [];
    }

    console.log("Getting mood entries for user:", user.user_id);
    const { data, error } = await supabase
      .from('mood_entries')
      .select('*')
      .eq('user_id', user.user_id)
      .order('logged_date', { ascending: false });

    if (error) {
      console.error('Error fetching mood entries:', error);
      return [];
    }

    console.log("Raw mood entries from DB:", data);

    // Format the entries with timestamp and formattedDate for compatibility
    return data.map(entry => ({
      ...entry,
      // Convert emotions back to array if it's a string
      emotions: typeof entry.emotions === 'string' ? JSON.parse(entry.emotions) : entry.emotions,
      timestamp: new Date(entry.logged_date).getTime(),
      formattedDate: format(new Date(entry.logged_date), 'yyyy-MM-dd')
    }));
  } catch (error) {
    console.error('Error in getAllMoodEntries:', error);
    return [];
  }
};

/**
 * Add a new mood entry
 */
export const addMoodEntry = async (
  mood: string,
  emotions: string[],
  journal: string = '',
  date: Date = new Date()
): Promise<MoodEntry | null> => {
  try {
    console.log("addMoodEntry called with params:", { mood, emotions, journal, date });
    
    const user = await getUserFromLocalStorage();
    console.log("Retrieved user from localStorage:", user);
    
    if (!user) {
      console.error('No user found in local storage');
      return null;
    }

    // FIX: Send emotions as a real array, not a string
    const entry = {
      user_id: user.user_id,
      mood: mood.toLowerCase(),
      emotions: Array.isArray(emotions) ? emotions : (typeof emotions === 'string' ? [emotions] : []),
      journal,
      logged_date: date.toISOString(),
    };
    
    console.log("Constructed entry for Supabase:", entry);
    const { data, error } = await supabase.auth.getSession();
    console.log("DB Connection Status:", data?.session ? "Authenticated" : "Not authenticated");

    // Insert with real array for emotions
    const { data: supabaseData, error: supabaseError } = await supabase
      .from('mood_entries')
      .insert([entry])
      .select()
      .single();

    console.log("Supabase response:", { data: supabaseData, error: supabaseError });

    if (supabaseError) {
      console.error('Error adding mood entry:', supabaseError);
      return null;
    }

    // Return the entry with additional fields and parse emotions back to array if needed
    const resultEntry = {
      ...supabaseData,
      emotions: Array.isArray(supabaseData.emotions)
        ? supabaseData.emotions
        : typeof supabaseData.emotions === 'string'
          ? JSON.parse(supabaseData.emotions)
          : [],
      timestamp: new Date(supabaseData.logged_date).getTime(),
      formattedDate: format(new Date(supabaseData.logged_date), 'yyyy-MM-dd')
    };
    return resultEntry;
  } catch (error) {
    console.error('Error adding mood entry:', error);
    return null;
  }
};

/**
 * Update an existing mood entry
 */
export const updateMoodEntry = async (
  entryId: string,
  updates: Partial<MoodEntry>
): Promise<MoodEntry | null> => {
  try {
    const user = await getUserFromLocalStorage();
    if (!user) {
      console.error('No user found in local storage');
      return null;
    }

    const { data, error } = await supabase
      .from('mood_entries')
      .update(updates)
      .eq('id', entryId)
      .eq('user_id', user.user_id) // Ensure the user can only update their own entries
      .select()
      .single();

    if (error) {
      console.error('Error updating mood entry:', error);
      return null;
    }

    // Return the entry with additional fields
    return {
      ...data,
      timestamp: new Date(data.logged_date).getTime(),
      formattedDate: format(new Date(data.logged_date), 'yyyy-MM-dd')
    };
  } catch (error) {
    console.error('Error in updateMoodEntry:', error);
    return null;
  }
};

/**
 * Delete a mood entry
 */
export const deleteMoodEntry = async (entryId: string): Promise<boolean> => {
  try {
    const user = await getUserFromLocalStorage();
    if (!user) {
      console.error('No user found in local storage');
      return false;
    }

    const { error } = await supabase
      .from('mood_entries')
      .delete()
      .eq('id', entryId)
      .eq('user_id', user.user_id); // Ensure the user can only delete their own entries

    if (error) {
      console.error('Error deleting mood entry:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in deleteMoodEntry:', error);
    return false;
  }
};

/**
 * Get mood entry by date
 */
export const getMoodEntryByDate = async (date: Date): Promise<MoodEntry | null> => {
  try {
    const user = await getUserFromLocalStorage();
    if (!user) {
      console.error('No user found in local storage');
      return null;
    }

    // Format date to start and end of day for query
    const startDate = new Date(date);
    startDate.setHours(0, 0, 0, 0);
    
    const endDate = new Date(date);
    endDate.setHours(23, 59, 59, 999);

    console.log("Searching for entry between", startDate.toISOString(), "and", endDate.toISOString());

    const { data, error } = await supabase
      .from('mood_entries')
      .select('*')
      .eq('user_id', user.user_id)
      .gte('logged_date', startDate.toISOString())
      .lte('logged_date', endDate.toISOString())
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // No results found, not an error
        console.log("No entry found for date", date);
        return null;
      }
      console.error('Error fetching mood entry by date:', error);
      return null;
    }

    console.log("Found entry for date", date, ":", data);

    // Return the entry with additional fields
    return {
      ...data,
      timestamp: new Date(data.logged_date).getTime(),
      formattedDate: format(new Date(data.logged_date), 'yyyy-MM-dd')
    };
  } catch (error) {
    console.error('Error in getMoodEntryByDate:', error);
    return null;
  }
}; 