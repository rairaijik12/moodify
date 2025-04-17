import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Your Supabase project configuration
const supabaseUrl = 'https://rdwkzvozfcbcmooulxpg.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJkd2t6dm96ZmNiY21vb3VseHBnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ4NTE1MzQsImV4cCI6MjA2MDQyNzUzNH0.kUvphYJFjb0YlxRTobNBvGXtvZ2yl73HSZFQ5g0xSKI';

const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

export default supabase;

export async function logoutUser() {
  const userId = await AsyncStorage.getItem('user_id');
  if (userId) {
    await AsyncStorage.removeItem(`user_xp_${userId}`);
    await AsyncStorage.removeItem(`user_streak_${userId}`);
  }
  await AsyncStorage.removeItem('user_id');
  await AsyncStorage.removeItem('nickname');
  // ...remove any other user-specific keys if needed
}
