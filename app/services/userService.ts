import AsyncStorage from '@react-native-async-storage/async-storage';
import supabase from '@/supabaseConfig';

// Constants for AsyncStorage keys
export const STORAGE_KEYS = {
  USER_ID: 'user_id',
  NICKNAME: 'user_nickname',
  XP_PROGRESS: 'user_xp',
  STREAK: 'user_streak',
  DAILY_XP_CLAIM: 'daily_xp_claim',  // New key for daily claims
  HAS_COMPLETED_ONBOARDING: 'has_completed_onboarding', // Add new key
};

// User type definition
export interface User {
  user_id: number;
  nickname?: string;
  created_at?: string;
  updated_at?: string;
}

/**
 * Creates a new user in the database
 */
export const createUser = async (nickname?: string): Promise<User | null> => {
  try {
    // Create user in the database
    const { data, error } = await supabase
      .from('user_tbl')
      .insert([{ nickname }])
      .select()
      .single();

    if (error) {
      console.error('Error creating user:', error);
      return null;
    }

    if (data) {
      // Save user data to AsyncStorage
      await saveUserToLocalStorage(data);
      return data as User;
    }

    return null;
  } catch (error) {
    console.error('Error in createUser:', error);
    return null;
  }
};

/**
 * Gets a user by their nickname
 */
export const getUserByNickname = async (nickname: string): Promise<User | null> => {
  try {
    const { data, error } = await supabase
      .from('user_tbl')
      .select('*')
      .eq('nickname', nickname)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // No user found with this nickname, not an error
        return null;
      }
      console.error('Error getting user by nickname:', error);
      return null;
    }

    return data as User;
  } catch (error) {
    console.error('Error in getUserByNickname:', error);
    return null;
  }
};

/**
 * Gets a user by their ID
 */
export const getUserById = async (user_id: number): Promise<User | null> => {
  try {
    const { data, error } = await supabase
      .from('user_tbl')
      .select('*')
      .eq('user_id', user_id)
      .single();

    if (error) {
      console.error('Error getting user by ID:', error);
      return null;
    }

    return data as User;
  } catch (error) {
    console.error('Error in getUserById:', error);
    return null;
  }
};

/**
 * Updates user's XP progress and streak
 */
export const updateUserXP = async (userId: number, xp: number, nickname: string, streak?: number): Promise<{ success: boolean; alreadyClaimed: boolean }> => {
  try {
    // Check if user can claim XP today
    const canClaim = await canClaimDailyXP(userId, nickname);
    if (!canClaim) {
      return { success: false, alreadyClaimed: true };
    }

    // Validate XP
    let xpNum = Math.floor(Number(xp));
    if (!Number.isFinite(xpNum) || isNaN(xpNum)) {
      console.error('updateUserXP: Invalid XP value:', xp);
      return { success: false, alreadyClaimed: false };
    }

    // Ensure XP row exists
    await ensureXpRowExists(userId);

    // Get current XP first
    const { data: currentData } = await supabase
      .from('xp_progress_tbl')
      .select('current_xp, streak')
      .eq('user_id', userId)
      .single();

    // Calculate new XP (add to existing)
    const currentXP = currentData?.current_xp || 0;
    const newXP = currentXP + xpNum;

    // Calculate new streak
    let newStreak = streak;
    if (typeof streak === 'undefined' && currentData?.streak) {
      newStreak = currentData.streak + 1;
    }

    // Prepare update object
    const updateObj: Record<string, any> = {
      current_xp: newXP,
      last_updated: new Date().toISOString(),
    };

    if (typeof newStreak !== 'undefined') {
      updateObj.streak = newStreak;
    }

    // Update in Supabase
    const { error } = await supabase
      .from('xp_progress_tbl')
      .update(updateObj)
      .eq('user_id', userId);

    if (error) {
      console.error('Error updating XP:', error);
      return { success: false, alreadyClaimed: false };
    }

    try {
      // Update in AsyncStorage
      await AsyncStorage.setItem(STORAGE_KEYS.XP_PROGRESS, newXP.toString());
      if (typeof newStreak !== 'undefined') {
        await AsyncStorage.setItem(STORAGE_KEYS.STREAK, newStreak.toString());
      }
      
      // Mark XP as claimed for today
      await markDailyXPClaimed(userId, nickname);
    } catch (storageError) {
      console.error('AsyncStorage update failed:', storageError);
    }

    console.log(`XP updated successfully for ${nickname}`);
    return { success: true, alreadyClaimed: false };
  } catch (error) {
    console.error('Error in updateUserXP:', error);
    return { success: false, alreadyClaimed: false };
  }
};

/**
 * Updates user's last login time
 */
export const updateLastLogin = async (userId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('users')
      .update({ last_login: new Date().toISOString() })
      .eq('id', userId);

    if (error) {
      console.error('Error updating last login:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in updateLastLogin:', error);
    return false;
  }
};

/**
 * Saves user data to AsyncStorage
 */
export const saveUserToLocalStorage = async (user: User): Promise<void> => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.USER_ID, user.user_id.toString());
    if (user.nickname) await AsyncStorage.setItem(STORAGE_KEYS.NICKNAME, user.nickname);
  } catch (error) {
    console.error('Error saving user to local storage:', error);
  }
};

/**
 * Gets user data from AsyncStorage
 */
export const getUserFromLocalStorage = async (): Promise<User | null> => {
  try {
    const userIdStr = await AsyncStorage.getItem(STORAGE_KEYS.USER_ID);
    const nickname = await AsyncStorage.getItem(STORAGE_KEYS.NICKNAME);
    if (!userIdStr) return null;
    return {
      user_id: parseInt(userIdStr),
      nickname: nickname ?? undefined,
    };
  } catch (error) {
    console.error('Error getting user from local storage:', error);
    return null;
  }
};

/**
 * Clears user data from AsyncStorage
 */
export const clearUserData = async (): Promise<void> => {
  try {
    const user = await getUserFromLocalStorage();
    const nickname = await AsyncStorage.getItem(STORAGE_KEYS.NICKNAME);
    
    if (user && nickname) {
      // Clear the specific user's XP claim
      const claimKey = `${STORAGE_KEYS.DAILY_XP_CLAIM}_${user.user_id}_${nickname}`;
      await AsyncStorage.removeItem(claimKey);
    }
    
    await AsyncStorage.removeItem(STORAGE_KEYS.USER_ID);
    await AsyncStorage.removeItem(STORAGE_KEYS.NICKNAME);
    await AsyncStorage.removeItem(STORAGE_KEYS.XP_PROGRESS);
    await AsyncStorage.removeItem(STORAGE_KEYS.STREAK);

    console.log('User data and XP claim keys cleared successfully');
  } catch (error) {
    console.error('Error clearing user data and XP keys:', error);
  }
};

/**
 * Ensures a row exists in xp_progress_tbl for the given user_id. If not, inserts one.
 */
export const ensureXpRowExists = async (userId: number): Promise<void> => {
  try {
    // First check if row exists
    const { data } = await supabase
      .from('xp_progress_tbl')
      .select('user_id')
      .eq('user_id', userId)
      .single();

    if (!data) {
      // Row doesn't exist, create it with initial values
      const { error: insertError } = await supabase
        .from('xp_progress_tbl')
        .insert({
          user_id: userId,
          current_xp: 0,
          streak: 0,
          last_updated: new Date().toISOString()
        });

      if (insertError) {
        console.error('Error creating initial XP row:', insertError, 'user_id:', userId);
        throw new Error('Failed to create XP row');
      }
      
      console.log('Created new XP row for user:', userId);
      
      // Initialize AsyncStorage as well
      try {
        await AsyncStorage.setItem(STORAGE_KEYS.XP_PROGRESS, '0');
        await AsyncStorage.setItem(STORAGE_KEYS.STREAK, '0');
      } catch (storageError) {
        console.error('Failed to initialize AsyncStorage XP values:', storageError);
        // Continue anyway as database update succeeded
      }
    }
  } catch (error) {
    console.error('Error in ensureXpRowExists:', error);
    throw error; // Propagate error to be handled by caller
  }
};

// Fetch XP for a user from Supabase
export async function fetchUserXP(userId: number): Promise<{ current_xp: number; streak: number }> {
  const { data, error } = await supabase
    .from('xp_progress_tbl')
    .select('current_xp, streak')
    .eq('user_id', userId)
    .single();
  if (error) {
    // Only log if it's not the 'no rows' error
    if (error.code !== 'PGRST116') {
      console.error('Error fetching XP:', error);
    }
    return { current_xp: 0, streak: 0 };
  }
  return { 
    current_xp: data.current_xp || 0, 
    streak: data.streak || 0
  };
}

// Award XP to a user in Supabase
export async function awardUserXP(userId: number, amount: number): Promise<boolean> {
  // Fetch current XP
  const { current_xp } = await fetchUserXP(userId);
  const newXP = (current_xp || 0) + amount;
  const { error } = await supabase
    .from('xp_progress_tbl')
    .update({ current_xp: newXP, last_updated: new Date().toISOString() })
    .eq('user_id', userId);
  if (error) {
    console.error('Error updating XP:', error);
    return false;
  }
  return true;
}

// Function to check if user can claim daily XP
export const canClaimDailyXP = async (userId: number, nickname: string): Promise<boolean> => {
  try {
    const today = new Date().toISOString().split('T')[0]; // Get YYYY-MM-DD
    const claimKey = `${STORAGE_KEYS.DAILY_XP_CLAIM}_${userId}_${nickname}`;
    
    // Get last claim date for this user+nickname
    const lastClaimDate = await AsyncStorage.getItem(claimKey);
    // Quietly log without error message
    if (lastClaimDate === today) {
      console.log(`Daily XP already claimed for ${nickname}`);
    }
    
    return lastClaimDate !== today;
  } catch (error) {
    console.error('Error checking daily XP claim:', error);
    return false;
  }
};

// Function to mark daily XP as claimed
export const markDailyXPClaimed = async (userId: number, nickname: string): Promise<void> => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const claimKey = `${STORAGE_KEYS.DAILY_XP_CLAIM}_${userId}_${nickname}`;
    
    await AsyncStorage.setItem(claimKey, today);
    console.log(`Marked daily XP claimed for user ${userId} (${nickname}) on ${today}`);
  } catch (error) {
    console.error('Error marking daily XP claimed:', error);
  }
};

/**
 * Marks onboarding as completed
 */
export const markOnboardingComplete = async (): Promise<void> => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.HAS_COMPLETED_ONBOARDING, 'true');
  } catch (error) {
    console.error('Error marking onboarding as complete:', error);
  }
};

/**
 * Checks if onboarding has been completed
 */
export const hasCompletedOnboarding = async (): Promise<boolean> => {
  try {
    const completed = await AsyncStorage.getItem(STORAGE_KEYS.HAS_COMPLETED_ONBOARDING);
    return completed === 'true';
  } catch (error) {
    console.error('Error checking onboarding status:', error);
    return false;
  }
};

/**
 * Checks if there is an existing valid user session and if onboarding is completed
 */
export const checkExistingSession = async (): Promise<{ hasSession: boolean; hasCompletedOnboarding: boolean; user: User | null }> => {
  try {
    // Get user data from AsyncStorage
    const user = await getUserFromLocalStorage();
    const onboardingCompleted = await hasCompletedOnboarding();

    if (!user || !user.user_id) {
      return { hasSession: false, hasCompletedOnboarding: false, user: null };
    }

    // Verify user exists in Supabase
    const supabaseUser = await getUserById(user.user_id);
    if (!supabaseUser) {
      // User not found in Supabase, clear local storage
      await clearUserData();
      return { hasSession: false, hasCompletedOnboarding: false, user: null };
    }

    return { 
      hasSession: true, 
      hasCompletedOnboarding: onboardingCompleted,
      user: supabaseUser 
    };
  } catch (error) {
    console.error('Error checking session:', error);
    return { hasSession: false, hasCompletedOnboarding: false, user: null };
  }
}; 