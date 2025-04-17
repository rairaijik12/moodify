import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { addMoodEntry, getAllMoodEntries } from './app/services/moodService';
import { getUserFromLocalStorage, updateUserXP } from './app/services/userService';
import supabase from './supabaseConfig';

export default function DebugServices() {
  const [user, setUser] = useState(null);
  const [testResults, setTestResults] = useState([]);
  const [dbStatus, setDbStatus] = useState('Checking...');

  useEffect(() => {
    // Load user on component mount
    loadUser();
    // Check database connection
    checkDbConnection();
  }, []);

  const loadUser = async () => {
    const userData = await getUserFromLocalStorage();
    setUser(userData);
    addTestResult('User data', userData ? 'Loaded' : 'Not found', userData);
  };

  const checkDbConnection = async () => {
    try {
      const { data, error } = await supabase.from('users').select('count').limit(1);
      if (error) {
        setDbStatus('Error: ' + error.message);
        addTestResult('Database connection', 'Failed', error);
      } else {
        setDbStatus('Connected');
        addTestResult('Database connection', 'Success', data);
      }
    } catch (error) {
      setDbStatus('Error: ' + error.message);
      addTestResult('Database connection', 'Exception', error);
    }
  };

  const testAddMood = async () => {
    try {
      // Create test mood data
      const testMood = 'good';
      const testEmotions = ['Happy', 'Relaxed'];
      const testJournal = 'Test journal entry from debug tool';
      const testDate = new Date();

      addTestResult('Add mood - Started', 'Testing', { 
        mood: testMood, 
        emotions: testEmotions,
        journal: testJournal,
        date: testDate
      });

      // Call the service function
      const result = await addMoodEntry(
        testMood,
        testEmotions,
        testJournal,
        testDate
      );

      if (result) {
        addTestResult('Add mood', 'Success', result);
      } else {
        addTestResult('Add mood', 'Failed', 'No result returned');
      }
    } catch (error) {
      addTestResult('Add mood', 'Exception', error);
    }
  };

  const testGetMoods = async () => {
    try {
      const entries = await getAllMoodEntries();
      addTestResult('Get moods', 'Success', { count: entries.length, entries });
    } catch (error) {
      addTestResult('Get moods', 'Exception', error);
    }
  };

  const testUpdateXP = async () => {
    if (!user) {
      addTestResult('Update XP', 'Failed', 'No user loaded');
      return;
    }

    try {
      // Add 5 XP to current value
      const newXP = (user.xp_progress || 0) + 5;
      
      addTestResult('Update XP - Started', 'Testing', { 
        userId: user.id, 
        currentXP: user.xp_progress,
        newXP: newXP
      });

      console.log('updateUserXP: userId', user.id, 'xpNum', newXP);

      const result = await supabase
        .from('xp_progress_tbl')
        .update({ current_xp: newXP, last_updated: new Date().toISOString(), streak: 0 })
        .eq('user_id', user.id);
      
      if (result) {
        addTestResult('Update XP', 'Success', { newXP });
        // Reload user to verify
        await loadUser();
      } else {
        addTestResult('Update XP', 'Failed', 'Function returned false');
      }
    } catch (error) {
      addTestResult('Update XP', 'Exception', error);
    }
  };

  const addTestResult = (test, status, data) => {
    const timestamp = new Date().toISOString();
    setTestResults(prev => [
      { test, status, data: JSON.stringify(data), timestamp },
      ...prev
    ]);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Service Debug Tool</Text>
      
      <View style={styles.statusSection}>
        <Text style={styles.label}>Database: <Text style={styles.value}>{dbStatus}</Text></Text>
        <Text style={styles.label}>User: <Text style={styles.value}>{user ? user.nickname : 'Not loaded'}</Text></Text>
        <Text style={styles.label}>User ID: <Text style={styles.value}>{user ? user.id : 'N/A'}</Text></Text>
        <Text style={styles.label}>XP: <Text style={styles.value}>{user ? user.xp_progress : 'N/A'}</Text></Text>
      </View>
      
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button} onPress={loadUser}>
          <Text style={styles.buttonText}>Reload User</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.button} onPress={testAddMood}>
          <Text style={styles.buttonText}>Test Add Mood</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.button} onPress={testGetMoods}>
          <Text style={styles.buttonText}>Test Get Moods</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.button} onPress={testUpdateXP}>
          <Text style={styles.buttonText}>Test Update XP</Text>
        </TouchableOpacity>
      </View>
      
      <Text style={styles.sectionTitle}>Test Results:</Text>
      <ScrollView style={styles.resultsContainer}>
        {testResults.map((result, index) => (
          <View key={index} style={styles.resultItem}>
            <Text style={styles.resultTitle}>{result.test} - {result.status}</Text>
            <Text style={styles.timestamp}>{result.timestamp}</Text>
            <Text style={styles.resultData}>{result.data}</Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#F5F5F5',
    marginTop: 50,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  statusSection: {
    backgroundColor: '#FFF',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
    color: '#555',
  },
  value: {
    fontWeight: 'bold',
    color: '#333',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginVertical: 10,
    color: '#333',
  },
  buttonContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#FF6B35',
    padding: 10,
    borderRadius: 5,
    margin: 5,
  },
  buttonText: {
    color: '#FFF',
    fontWeight: 'bold',
  },
  resultsContainer: {
    flex: 1,
    backgroundColor: '#FFF',
    borderRadius: 10,
    padding: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  resultItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
    marginBottom: 5,
  },
  resultTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  timestamp: {
    fontSize: 12,
    color: '#999',
    marginBottom: 4,
  },
  resultData: {
    fontSize: 14,
    color: '#666',
  },
}); 