import React, { useState, useEffect } from 'react';
import { View, Text, Button, ScrollView, StyleSheet } from 'react-native';
import supabase from '../supabaseConfig';
import { getUserFromLocalStorage } from './services/userService';

interface DebugResult {
  title: string;
  data: string;
  timestamp: string;
}

interface DebugUser {
  id: number;
  nickname: string;
  xp_progress?: number;
  [key: string]: any;
}

export default function DebugDB() {
  const [user, setUser] = useState<DebugUser | null>(null);
  const [tables, setTables] = useState<string[]>([]);
  const [results, setResults] = useState<DebugResult[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadUserData();
    loadTables();
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
      if (userData) {
        // Map userData to DebugUser interface
        setUser({
          id: userData.user_id,
          nickname: userData.nickname || '',
          ...userData
        });
        addResult('User Data', userData);
      } else {
        setUser(null);
        addResult('User Data', null);
      }
    } catch (error) {
      addResult('Error loading user', error);
    }
  };

  const loadTables = async () => {
    setLoading(true);
    try {
      // This query gets all tables in the public schema
      const { data, error } = await supabase
        .from('_metadata')
        .select('*')
        .limit(20);

      if (error) {
        addResult('Error loading tables', error);
        // Fallback - try some known tables
        setTables(['users', 'mood_entries', 'chatbot_sessions', 'chatbot_messages', 'chatbot_ratings']);
      } else {
        addResult('Tables metadata', data);
        if (data && data.length > 0) {
          const tableNames = data.map((item: any) => item.name || item.table);
          setTables(tableNames);
        } else {
          // Fallback - try some known tables
          setTables(['users', 'mood_entries', 'chatbot_sessions', 'chatbot_messages', 'chatbot_ratings']);
        }
      }
    } catch (error) {
      addResult('Exception loading tables', error);
      // Fallback - try some known tables
      setTables(['users', 'mood_entries', 'chatbot_sessions', 'chatbot_messages', 'chatbot_ratings']);
    } finally {
      setLoading(false);
    }
  };

  const checkTable = async (tableName: string) => {
    setLoading(true);
    try {
      // Get direct table data
      const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .limit(10);

      if (error) {
        addResult(`Error checking ${tableName}`, error);
      } else {
        addResult(`${tableName} data (${data.length} rows)`, data);
      }
    } catch (error) {
      addResult(`Exception checking ${tableName}`, error);
    } finally {
      setLoading(false);
    }
  };

  const checkTableColumns = async (tableName: string) => {
    setLoading(true);
    try {
      // Try to query information_schema for column information
      const { data, error } = await supabase.rpc('get_table_columns', { 
        table_name: tableName 
      });

      if (error || !data) {
        addResult(`Error getting ${tableName} columns`, error || 'No data returned');
        // Fallback - try to infer from a single row
        try {
          const { data: sampleData, error: sampleError } = await supabase
            .from(tableName)
            .select('*')
            .limit(1);
          if (sampleError || !sampleData || sampleData.length === 0) {
            addResult(`Error getting ${tableName} sample`, sampleError || 'No sample data');
          } else {
            // Get columns from the sample data
            const columns = Object.keys(sampleData[0]).map(col => ({
              column_name: col,
              data_type: typeof sampleData[0][col]
            }));
            addResult(`${tableName} inferred columns`, columns);
          }
        } catch (e) {
          addResult(`Exception getting ${tableName} sample`, e);
        }
      } else {
        addResult(`${tableName} columns`, data);
      }
    } catch (error) {
      addResult(`Exception getting ${tableName} columns`, error);
    } finally {
      setLoading(false);
    }
  };

  const testInsertMoodEntry = async () => {
    if (!user || !user.id) {
      addResult('Error', 'No user ID available');
      return;
    }
    setLoading(true);
    try {
      // Create a test mood entry with minimal data
      const testEntry = {
        user_id: user.id,
        mood: 'good',
        emotions: [],  // Empty array to avoid format issues
        journal: 'Test entry from debug tool',
        logged_date: new Date().toISOString()
      };
      addResult('Test mood entry data', testEntry);
      const { data, error } = await supabase
        .from('mood_entries')
        .insert([testEntry])
        .select();
      if (error) {
        addResult('Error inserting test mood entry', error);
      } else {
        addResult('Successfully inserted test mood entry', data);
      }
    } catch (error) {
      addResult('Exception inserting test mood entry', error);
    } finally {
      setLoading(false);
    }
  };

  const clearResults = () => {
    setResults([]);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Database Debug</Text>
      <View style={styles.userInfo}>
        <Text style={styles.userLabel}>
          User: {user ? `${user.nickname} (${user.id})` : 'Not loaded'}
        </Text>
        <Text style={styles.userLabel}>
          XP: {user ? user.xp_progress : 'N/A'}
        </Text>
        <Button title="Reload User" onPress={loadUserData} disabled={loading} />
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={true} style={styles.tableList}>
        {tables.map((table, index) => (
          <View key={index} style={styles.tableItem}>
            <Text style={styles.tableName}>{table}</Text>
            <View style={styles.tableButtons}>
              <Button 
                title="View Data" 
                onPress={() => checkTable(table)} 
                disabled={loading}
              />
              <Button 
                title="Columns" 
                onPress={() => checkTableColumns(table)} 
                disabled={loading}
              />
            </View>
          </View>
        ))}
      </ScrollView>
      <View style={styles.actionButtons}>
        <Button 
          title="Test Mood Insert" 
          onPress={testInsertMoodEntry} 
          disabled={loading || !user} 
        />
        <Button 
          title="Clear Results" 
          onPress={clearResults} 
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
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  userInfo: {
    backgroundColor: 'white',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  userLabel: {
    fontSize: 16,
    marginBottom: 8,
  },
  tableList: {
    maxHeight: 100,
    marginBottom: 16,
  },
  tableItem: {
    backgroundColor: 'white',
    padding: 12,
    borderRadius: 8,
    marginRight: 12,
    minWidth: 150,
  },
  tableName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  tableButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButtons: {
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