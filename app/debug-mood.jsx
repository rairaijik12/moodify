import React from 'react';
import { SafeAreaView } from 'react-native';
import DebugMoodService from '../debug-mood-service';

export default function DebugMoodPage() {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <DebugMoodService />
    </SafeAreaView>
  );
} 