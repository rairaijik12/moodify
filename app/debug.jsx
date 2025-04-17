import React from 'react';
import { SafeAreaView } from 'react-native';
import DebugServices from '../debug-services';

export default function DebugPage() {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <DebugServices />
    </SafeAreaView>
  );
} 