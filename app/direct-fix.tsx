import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, ScrollView, StyleSheet } from 'react-native';
import supabase from '../supabaseConfig';
import { getUserFromLocalStorage } from './services/userService';
import AsyncStorage from '@react-native-async-storage/async-storage';

// @ts-ignore: Ignoring React import issues
// Add a tsconfig with esModuleInterop: true to fix permanently

type ResultItem = {
  title: string;
  data: string;
  timestamp: string;
};

export default function DirectFix() {
  const [user, setUser] = useState<any>(null);
  const [xpValue, setXpValue] = useState('0');
  const [moodText, setMoodText] = useState('good');
  const [results, setResults] = useState<ResultItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadUserData();
  }, []);

  const addResult = (title: string, data: any) => {
    setResults(prev => [
      { title, data: JSON.stringify(data, null, 2), timestamp: new Date().toISOString() },
      ...prev
    ]);
  };

  const loadUserData = async () => {
    try {
      const userData = await getUserFromLocalStorage();
      setUser(userData);
      // Fetch XP from xp_progress_tbl
      if (userData?.user_id) {
        const { data, error } = await supabase
          .from('xp_progress_tbl')
          .select('current_xp')
          .eq('user_ID', userData.user_id)
          .single();
        if (!error && data && typeof data.current_xp === 'number') {
          setXpValue(data.current_xp.toString());
        } else {
          // fallback: try AsyncStorage
          const xpString = await AsyncStorage.getItem('user_xp');
          if (xpString) setXpValue(xpString);
        }
      }
      addResult('User Data Loaded', userData);
    } catch (error) {
      addResult('Error loading user', error);
    }
  };

  // DIRECT XP UPDATE - bypasses service layer
  const updateXpDirect = async () => {
    if (!user?.user_ID) {
      addResult('Error', 'No user ID available');
      return;
    }

    setLoading(true);
    try {
      const numericXp = parseInt(xpValue, 10) || 0;
      // 1. Update in xp_progress_tbl
      addResult('Attempting XP update in DB', { userId: user.user_ID, xp: numericXp });
      const { data, error } = await supabase
        .from('xp_progress_tbl')
        .update({ current_xp: numericXp, last_updated: new Date().toISOString() })
        .eq('user_ID', user.user_ID)
        .select();
      if (error) {
        addResult('Error updating XP in database', error);
      } else {
        addResult('XP updated in database', data);
      }
      // 2. Update in AsyncStorage for local cache
      await AsyncStorage.setItem('user_xp', numericXp.toString());
      setXpValue(numericXp.toString());
      addResult('XP updated in AsyncStorage', { xp: numericXp });
      // 3. Show success message
      addResult('XP Update Complete', { xp: numericXp });
    } catch (error) {
      addResult('Exception in XP update', error);
    } finally {
      setLoading(false);
    }
  };

  // DIRECT MOOD ENTRY - bypasses service layer
  const addMoodEntryDirect = async () => {
    if (!user?.id) {
      addResult('Error', 'No user ID available');
      return;
    }

    setLoading(true);
    try {
      // Create a minimal mood entry
      const entry = {
        user_id: user.id,
        mood: moodText.toLowerCase(),
        emotions: [],  // Empty array for compatibility
        journal: 'Added via direct fix tool',
        logged_date: new Date().toISOString()
      };
      
      addResult('Attempting mood entry insert', entry);
      
      // Attempt direct insert
      const { data, error } = await supabase
        .from('mood_entries')
        .insert([entry])
        .select();
      
      if (error) {
        addResult('Error inserting mood entry', error);
        
        // Try alternatives
        
        // 1. Try with string emotions
        const { data: stringData, error: stringError } = await supabase
          .from('mood_entries')
          .insert([{ ...entry, emotions: '[]' }])
          .select();
          
        if (stringError) {
          addResult('String emotions attempt failed', stringError);
        } else {
          addResult('Mood entry added with string emotions', stringData);
          return;
        }
        
        // 2. Try without emotions
        const entryWithoutEmotions = { ...entry } as { [key: string]: any };
        if ('emotions' in entryWithoutEmotions) {
          delete entryWithoutEmotions.emotions;
        }
        
        const { data: noEmotionsData, error: noEmotionsError } = await supabase
          .from('mood_entries')
          .insert([entryWithoutEmotions])
          .select();
          
        if (noEmotionsError) {
          addResult('Attempt without emotions failed', noEmotionsError);
        } else {
          addResult('Mood entry added without emotions field', noEmotionsData);
          return;
        }
        
        // 3. Try with raw SQL if possible
        try {
          const { data: sqlData, error: sqlError } = await supabase.rpc('run_sql', {
            query: `INSERT INTO mood_entries (user_id, mood, journal, logged_date) 
                   VALUES ('${user.id}', '${moodText.toLowerCase()}', 'Added via SQL', '${new Date().toISOString()}')
                   RETURNING *`
          });
          
          if (sqlError) {
            addResult('SQL fallback failed', sqlError);
          } else {
            addResult('Mood entry added via SQL', sqlData);
          }
        } catch (sqlErr) {
          addResult('SQL fallback exception', sqlErr);
        }
      } else {
        addResult('Mood entry added successfully', data);
      }
    } catch (error) {
      addResult('Exception adding mood entry', error);
    } finally {
      setLoading(false);
    }
  };

  // DB status check to verify connection
  const checkDbStatus = async () => {
    setLoading(true);
    try {
      // Simple query to check if we can read from database
      const { data, error } = await supabase
        .from('users')
        .select('count')
        .limit(1);
      
      if (error) {
        addResult('DB Connection Error', error);
      } else {
        addResult('DB Connection OK', data);
        
        // Check RLS status
        const { data: rlsData, error: rlsError } = await supabase.rpc('check_rls_enabled');
        if (rlsError) {
          addResult('RLS Check Error', rlsError);
        } else {
          addResult('RLS Status', rlsData);
        }
      }
    } catch (error) {
      addResult('Exception checking DB', error);
    } finally {
      setLoading(false);
    }
  };

  // Get all keys from AsyncStorage to debug
  const checkAsyncStorage = async () => {
    setLoading(true);
    try {
      const keys = await AsyncStorage.getAllKeys();
      const entries = await Promise.all(
        keys.map(async key => {
          const value = await AsyncStorage.getItem(key);
          return { key, value };
        })
      );
      
      addResult('AsyncStorage Contents', entries);
    } catch (error) {
      addResult('AsyncStorage Error', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Direct Fix Tool</Text>
      
      <View style={styles.userSection}>
        <Text style={styles.userLabel}>
          User: {user ? `${user.nickname} (${user.user_ID})` : 'Not loaded'}
        </Text>
        <Text style={styles.userLabel}>
          Current XP: {xpValue || 'N/A'}
        </Text>
        <Button 
          title="Reload User" 
          onPress={loadUserData} 
          disabled={loading} 
        />
      </View>
      
      <View style={styles.fixSection}>
        <Text style={styles.sectionTitle}>Fix XP</Text>
        <TextInput
          style={styles.input}
          value={xpValue}
          onChangeText={setXpValue}
          keyboardType="numeric"
          placeholder="New XP value"
        />
        <Button 
          title="Update XP Directly" 
          onPress={updateXpDirect}
          disabled={loading || !user} 
        />
      </View>
      
      <View style={styles.fixSection}>
        <Text style={styles.sectionTitle}>Fix Mood Entries</Text>
        <TextInput
          style={styles.input}
          value={moodText}
          onChangeText={setMoodText}
          placeholder="Mood (e.g. good, bad, etc.)"
        />
        <Button 
          title="Add Mood Entry Directly" 
          onPress={addMoodEntryDirect}
          disabled={loading || !user} 
        />
      </View>
      
      <View style={styles.diagnosticButtons}>
        <Button 
          title="Check DB Status" 
          onPress={checkDbStatus}
          disabled={loading} 
        />
        <Button 
          title="Check AsyncStorage" 
          onPress={checkAsyncStorage}
          disabled={loading} 
        />
        <Button 
          title="Clear Results" 
          onPress={() => setResults([])}
          disabled={loading} 
        />
      </View>
      
      <Text style={styles.resultsTitle}>Results:</Text>
      <ScrollView style={styles.results}>
        {results.map((result, index) => (
          <View key={index} style={styles.resultItem}>
            <Text style={styles.resultTitle}>{result.title}</Text>
            <Text style={styles.timestamp}>{result.timestamp}</Text>
            <ScrollView horizontal>
              <Text style={styles.resultData}>{result.data}</Text>
            </ScrollView>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  userSection: {
    backgroundColor: 'white',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  userLabel: {
    fontSize: 16,
    marginBottom: 8,
  },
  fixSection: {
    backgroundColor: 'white',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 8,
    marginBottom: 12,
  },
  diagnosticButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  resultsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginVertical: 8,
  },
  results: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 8,
  },
  resultItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  resultTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  timestamp: {
    fontSize: 12,
    color: '#999',
    marginBottom: 4,
  },
  resultData: {
    fontFamily: 'monospace',
    fontSize: 12,
  }
}); 