import React, { useState } from 'react';
import { View, Text, Button, TextInput, StyleSheet, ScrollView } from 'react-native';
import supabase from './supabaseConfig';
import { getUserFromLocalStorage } from './app/services/userService';

export default function DebugMoodService() {
  const [userId, setUserId] = useState('');
  const [emotion1, setEmotion1] = useState('Happy');
  const [emotion2, setEmotion2] = useState('Calm');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  // Add a log entry to the results
  const addLog = (title, data) => {
    const timestamp = new Date().toISOString();
    setResults(prev => [{ title, data: JSON.stringify(data), timestamp }, ...prev]);
  };

  // Load user from AsyncStorage
  const loadUser = async () => {
    setLoading(true);
    try {
      const user = await getUserFromLocalStorage();
      addLog('User loaded', user);
      if (user && user.id) {
        setUserId(user.id);
      } else {
        addLog('Warning', 'No user ID found in AsyncStorage');
      }
    } catch (error) {
      addLog('Error loading user', error);
    } finally {
      setLoading(false);
    }
  };

  // Test direct SQL insert for mood entry
  const testDirectInsert = async () => {
    if (!userId) {
      addLog('Error', 'No user ID available');
      return;
    }

    setLoading(true);
    try {
      // Basic test data
      const moodData = {
        user_id: userId,
        mood: 'good',
        emotions: [emotion1, emotion2],
        journal: 'Test entry from direct SQL debug tool',
        logged_date: new Date().toISOString()
      };

      addLog('Attempting direct insert', moodData);

      // Direct insert to database
      const { data, error } = await supabase
        .from('mood_entries')
        .insert([moodData])
        .select();

      if (error) {
        addLog('Insert error', error);
        // Try with stringified emotions as fallback
        addLog('Trying fallback with stringified emotions', null);
        
        const { data: fallbackData, error: fallbackError } = await supabase
          .from('mood_entries')
          .insert([{
            ...moodData,
            emotions: JSON.stringify(moodData.emotions) // Try as JSON string
          }])
          .select();
          
        if (fallbackError) {
          addLog('Fallback insert error', fallbackError);
        } else {
          addLog('Fallback insert success', fallbackData);
        }
      } else {
        addLog('Insert success', data);
      }
    } catch (exception) {
      addLog('Exception during insert', exception);
    } finally {
      setLoading(false);
    }
  };

  // Get schema info for mood_entries table
  const checkTableSchema = async () => {
    setLoading(true);
    try {
      // This query gets column information for the mood_entries table
      const { data, error } = await supabase.rpc('get_table_info', { 
        table_name: 'mood_entries' 
      });

      if (error) {
        addLog('Schema query error', error);
        
        // Fallback: Try to get data from the table to infer schema
        const { data: sampleData, error: sampleError } = await supabase
          .from('mood_entries')
          .select('*')
          .limit(1);
          
        if (sampleError) {
          addLog('Sample data error', sampleError);
        } else {
          addLog('Table sample data', sampleData);
        }
      } else {
        addLog('Table schema', data);
      }
    } catch (exception) {
      addLog('Exception during schema check', exception);
    } finally {
      setLoading(false);
    }
  };

  // Test raw SQL query
  const testRawQuery = async () => {
    setLoading(true);
    try {
      addLog('Testing raw SQL query capability', null);
      
      const { data, error } = await supabase.rpc('execute_sql', {
        sql_query: "SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'mood_entries'"
      });
      
      if (error) {
        addLog('Raw SQL error', error);
      } else {
        addLog('Raw SQL result', data);
      }
    } catch (exception) {
      addLog('Exception during raw SQL', exception);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Mood Service Debug</Text>
      
      <View style={styles.userSection}>
        <Text style={styles.label}>User ID: {userId || 'Not loaded'}</Text>
        <Button title="Load User" onPress={loadUser} disabled={loading} />
      </View>
      
      <View style={styles.inputSection}>
        <Text style={styles.label}>Test Emotions:</Text>
        <TextInput
          style={styles.input}
          value={emotion1}
          onChangeText={setEmotion1}
          placeholder="Emotion 1"
        />
        <TextInput
          style={styles.input}
          value={emotion2}
          onChangeText={setEmotion2}
          placeholder="Emotion 2"
        />
      </View>
      
      <View style={styles.buttonSection}>
        <Button 
          title="Test Direct Insert" 
          onPress={testDirectInsert} 
          disabled={loading || !userId} 
        />
        <Button 
          title="Check Table Schema" 
          onPress={checkTableSchema} 
          disabled={loading} 
        />
        <Button 
          title="Test Raw SQL" 
          onPress={testRawQuery} 
          disabled={loading} 
        />
      </View>
      
      <Text style={styles.resultsTitle}>Results:</Text>
      <ScrollView style={styles.results}>
        {results.map((item, index) => (
          <View key={index} style={styles.logItem}>
            <Text style={styles.logTitle}>{item.title}</Text>
            <Text style={styles.logTime}>{item.timestamp}</Text>
            <Text style={styles.logData}>{item.data}</Text>
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
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  userSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    padding: 8,
    backgroundColor: '#fff',
    borderRadius: 8,
  },
  label: {
    fontSize: 16,
    marginRight: 8,
  },
  inputSection: {
    marginBottom: 16,
    padding: 8,
    backgroundColor: '#fff',
    borderRadius: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 4,
    padding: 8,
    marginVertical: 4,
  },
  buttonSection: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  resultsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginVertical: 8,
  },
  results: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 8,
  },
  logItem: {
    padding: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    marginBottom: 8,
  },
  logTitle: {
    fontWeight: 'bold',
    fontSize: 14,
  },
  logTime: {
    fontSize: 12,
    color: '#999',
    marginBottom: 4,
  },
  logData: {
    fontSize: 12,
    fontFamily: 'monospace',
  },
}); 