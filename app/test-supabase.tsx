import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useRouter } from 'expo-router';
import { api } from '@/lib/api-client';
import { ArrowLeft, CheckCircle2, XCircle, AlertCircle } from 'lucide-react-native';

export default function TestSupabase() {
  const router = useRouter();
  const [testResults, setTestResults] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleRunTests = async () => {
    setTestResults(null);
    setIsLoading(true);
    try {
      const data = await api.test.runTests();
      console.log('Tests completed:', data);
      setTestResults(data);
    } catch (error: any) {
      console.error('Tests failed:', error);
      setTestResults({
        success: false,
        results: [{ test: 'Connection error', status: 'failed', error: error.message }],
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle2 size={20} color="#10b981" />;
      case 'error':
        return <XCircle size={20} color="#ef4444" />;
      case 'running':
        return <ActivityIndicator size="small" color="#3b82f6" />;
      default:
        return <AlertCircle size={20} color="#f59e0b" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return '#10b981';
      case 'error':
        return '#ef4444';
      case 'running':
        return '#3b82f6';
      default:
        return '#f59e0b';
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom']}>
      <Stack.Screen
        options={{
          title: 'Test Supabase',
          headerStyle: { backgroundColor: '#1f2937' },
          headerTintColor: '#fff',
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <ArrowLeft size={24} color="#fff" />
            </TouchableOpacity>
          ),
        }}
      />
      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
        <View style={styles.header}>
          <Text style={styles.title}>Supabase Connection Test</Text>
          <Text style={styles.subtitle}>
            This will test all database operations including profiles, testimonies, souls, witness
            cards, and points system.
          </Text>
        </View>

        <TouchableOpacity
          style={[styles.button, isLoading && styles.buttonDisabled]}
          onPress={handleRunTests}
          disabled={isLoading}
        >
          {isLoading ? (
            <View style={styles.buttonContent}>
              <ActivityIndicator size="small" color="#fff" />
              <Text style={styles.buttonText}>Running Tests...</Text>
            </View>
          ) : (
            <Text style={styles.buttonText}>Run All Tests</Text>
          )}
        </TouchableOpacity>

        {testResults && (
          <View style={styles.resultsContainer}>
            <View
              style={[
                styles.summaryCard,
                { borderLeftColor: testResults.success ? '#10b981' : '#ef4444' },
              ]}
            >
              <Text style={styles.summaryTitle}>
                {testResults.success ? '✅ All Tests Passed!' : '❌ Tests Failed'}
              </Text>
              {testResults.success && testResults.results && (
                <View style={styles.summaryDetails}>
                  {testResults.results?.length > 0 && (
                    <Text style={styles.summaryText}>
                      {testResults.results.length} tests completed
                    </Text>
                  )}
                </View>
              )}
            </View>

            <View style={styles.testsList}>
              {testResults.results?.map((result: any, index: number) => (
                <View key={index} style={styles.testItem}>
                  <View style={styles.testHeader}>
                    {getStatusIcon(result.status)}
                    <Text style={styles.testStep}>{result.test}</Text>
                  </View>
                  {result.error && (
                    <Text style={styles.errorText}>Error: {result.error}</Text>
                  )}
                  {result.data && (
                    <Text style={styles.dataText}>
                      {JSON.stringify(result.data, null, 2)}
                    </Text>
                  )}
                  <View
                    style={[
                      styles.statusBar,
                      { backgroundColor: getStatusColor(result.status) },
                    ]}
                  />
                </View>
              ))}
            </View>
          </View>
        )}

        {!testResults && !isLoading && (
          <View style={styles.infoCard}>
            <Text style={styles.infoTitle}>📋 What will be tested:</Text>
            <Text style={styles.infoItem}>• Create a witness profile</Text>
            <Text style={styles.infoItem}>• Save a testimony</Text>
            <Text style={styles.infoItem}>• Add a soul</Text>
            <Text style={styles.infoItem}>• Create a witness card</Text>
            <Text style={styles.infoItem}>• Award points for testimony</Text>
            <Text style={styles.infoItem}>• Award points for soul</Text>
            <Text style={styles.infoItem}>• Award points for share</Text>
            <Text style={styles.infoItem}>• Fetch user stats</Text>
            <Text style={styles.infoItem}>• Fetch leaderboard</Text>
            <Text style={styles.infoItem}>• Fetch testimonies</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#111827',
  },
  container: {
    flex: 1,
    backgroundColor: '#111827',
  },
  contentContainer: {
    padding: 20,
  },
  backButton: {
    padding: 8,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#9ca3af',
    lineHeight: 24,
  },
  button: {
    backgroundColor: '#3b82f6',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 24,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  resultsContainer: {
    gap: 16,
  },
  summaryCard: {
    backgroundColor: '#1f2937',
    borderRadius: 12,
    padding: 20,
    borderLeftWidth: 4,
  },
  summaryTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 12,
  },
  summaryDetails: {
    gap: 8,
  },
  summaryText: {
    fontSize: 14,
    color: '#9ca3af',
  },
  testsList: {
    gap: 12,
  },
  testItem: {
    backgroundColor: '#1f2937',
    borderRadius: 12,
    padding: 16,
    position: 'relative' as const,
    overflow: 'hidden' as const,
  },
  testHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  testStep: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    flex: 1,
  },
  errorText: {
    fontSize: 14,
    color: '#ef4444',
    marginTop: 8,
  },
  dataText: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 8,
    fontFamily: 'monospace' as any,
  },
  statusBar: {
    position: 'absolute' as const,
    bottom: 0,
    left: 0,
    right: 0,
    height: 3,
  },
  infoCard: {
    backgroundColor: '#1f2937',
    borderRadius: 12,
    padding: 20,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 16,
  },
  infoItem: {
    fontSize: 15,
    color: '#9ca3af',
    marginBottom: 8,
    paddingLeft: 8,
  },
});
