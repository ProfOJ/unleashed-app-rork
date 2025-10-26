import { colors } from '@/constants/colors';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft, Plus, CheckSquare, Square } from 'lucide-react-native';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { api } from '@/lib/api-client';

export default function AddTestimony() {
  const router = useRouter();
  const params = useLocalSearchParams<{ editId?: string; message?: string; category?: string }>();
  const [message, setMessage] = useState(params.message || '');
  const [category, setCategory] = useState<'seen' | 'heard' | 'experienced' | null>(
    (params.category as 'seen' | 'heard' | 'experienced') || null
  );
  const [enhanceStory, setEnhanceStory] = useState(true);
  const [isEnhancing, setIsEnhancing] = useState(false);
  const isEditing = !!params.editId;

  const handleContinue = async () => {
    if (!message.trim() || !category) {
      alert('Please add your message and select a category');
      return;
    }

    setIsEnhancing(true);

    try {
      let enhancedMessage = message.trim();

      if (enhanceStory) {
        console.log('Enhancing testimony...');
        console.log('Category:', category);
        console.log('Original message:', message.trim());

        const result = await api.witness.enhanceTestimony({
          testimony: message.trim(),
          category,
        });

        console.log('Enhanced testimony received:', result.enhancedTestimony);
        enhancedMessage = result.enhancedTestimony;
      } else {
        console.log('Skipping enhancement as per user preference');
      }

      router.push({
        pathname: '/preview-testimony',
        params: {
          message: enhancedMessage,
          originalMessage: message.trim(),
          category,
          editId: params.editId,
        },
      });
    } catch (error: any) {
      console.error('Error enhancing testimony:', error);
      console.error('Full error details:', {
        message: error.message,
        stack: error.stack,
      });
      
      console.log('Enhancement failed, continuing with original testimony...');
      router.push({
        pathname: '/preview-testimony',
        params: {
          message: message.trim(),
          originalMessage: message.trim(),
          category,
          editId: params.editId,
        },
      });
    } finally {
      setIsEnhancing(false);
    }
  };

  const categories = [
    { id: 'seen' as const, label: "What I've Seen", icon: '👁️' },
    { id: 'heard' as const, label: "What I've Heard", icon: '👂' },
    { id: 'experienced' as const, label: "What I've Experienced", icon: '✨' },
  ];

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={styles.topBar}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
            activeOpacity={0.7}
          >
            <ArrowLeft size={24} color={colors.primary} />
          </TouchableOpacity>
          <Text style={styles.topBarTitle}>{isEditing ? 'Edit Testimony' : 'Share Your Testimony'}</Text>
          <View style={styles.backButton} />
        </View>
      </SafeAreaView>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Share your message with us</Text>
            <Text style={styles.sectionSubtitle}>
              Tell us about your testimony. What has God done in your life?
            </Text>

            <View style={styles.inputContainer}>
              <TextInput
                style={styles.textInput}
                placeholder="Type your testimony here..."
                placeholderTextColor={colors.text.secondary}
                value={message}
                onChangeText={setMessage}
                multiline
                numberOfLines={8}
                textAlignVertical="top"
              />
              <TouchableOpacity
                style={styles.addMoreButton}
                activeOpacity={0.7}
                onPress={() => {}}
              >
                <Plus size={20} color={colors.secondary} />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.section}>
            <TouchableOpacity
              style={styles.checkboxContainer}
              onPress={() => setEnhanceStory(!enhanceStory)}
              activeOpacity={0.7}
            >
              <View style={styles.checkboxRow}>
                {enhanceStory ? (
                  <CheckSquare size={24} color={colors.secondary} strokeWidth={2.5} />
                ) : (
                  <Square size={24} color={colors.text.secondary} strokeWidth={2} />
                )}
                <Text style={styles.checkboxLabel}>Enhance my story</Text>
              </View>
              <Text style={styles.checkboxDescription}>
                Let AI enhance your testimony with better storytelling
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Categorize your testimony</Text>
            <Text style={styles.sectionSubtitle}>
              Choose the category that best describes your testimony
            </Text>

            <View style={styles.categoriesContainer}>
              {categories.map((cat) => (
                <TouchableOpacity
                  key={cat.id}
                  style={[
                    styles.categoryCard,
                    category === cat.id && styles.categoryCardActive,
                  ]}
                  activeOpacity={0.7}
                  onPress={() => setCategory(cat.id)}
                >
                  <View style={styles.categoryContent}>
                    <View style={styles.categoryMain}>
                      <Text style={styles.categoryIcon}>{cat.icon}</Text>
                      <Text
                        style={[
                          styles.categoryLabel,
                          category === cat.id && styles.categoryLabelActive,
                        ]}
                      >
                        {cat.label}
                      </Text>
                    </View>
                    {category === cat.id && (
                      <View style={styles.checkmark}>
                        <Text style={styles.checkmarkText}>✓</Text>
                      </View>
                    )}
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </ScrollView>

        <SafeAreaView style={styles.bottomArea} edges={['bottom']}>
          {isEnhancing && (
            <View style={styles.enhancingInfo}>
              <ActivityIndicator size="small" color={colors.secondary} />
              <Text style={styles.enhancingText}>Enhancing your testimony with AI...</Text>
            </View>
          )}
          <TouchableOpacity
            style={[
              styles.continueButton,
              (!message.trim() || !category || isEnhancing) && styles.continueButtonDisabled,
            ]}
            onPress={handleContinue}
            activeOpacity={0.8}
            disabled={!message.trim() || !category || isEnhancing}
          >
            {isEnhancing ? (
              <ActivityIndicator size="small" color={colors.white} />
            ) : (
              <Text style={styles.continueButtonText}>Continue</Text>
            )}
          </TouchableOpacity>
        </SafeAreaView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F1F5F9',
  },
  safeArea: {
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  topBarTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: colors.primary,
  },
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
    gap: 32,
    paddingBottom: 20,
  },
  section: {
    gap: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: colors.primary,
  },
  sectionSubtitle: {
    fontSize: 15,
    color: colors.text.secondary,
    lineHeight: 22,
  },
  inputContainer: {
    position: 'relative' as const,
  },
  textInput: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 16,
    fontSize: 16,
    color: colors.text.primary,
    borderWidth: 2,
    borderColor: '#E2E8F0',
    minHeight: 180,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  addMoreButton: {
    position: 'absolute' as const,
    bottom: 12,
    right: 12,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.secondary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  categoriesContainer: {
    gap: 12,
  },
  categoryCard: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 20,
    borderWidth: 2,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  categoryCardActive: {
    borderColor: colors.secondary,
    backgroundColor: colors.white,
  },
  categoryContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  categoryMain: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  categoryIcon: {
    fontSize: 32,
  },
  checkmark: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkmarkText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '700' as const,
  },
  categoryLabel: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: colors.primary,
  },
  categoryLabelActive: {
    color: colors.secondary,
  },
  bottomArea: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  continueButton: {
    backgroundColor: colors.secondary,
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: colors.secondary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  continueButtonDisabled: {
    backgroundColor: colors.text.secondary,
    opacity: 0.4,
  },
  continueButtonText: {
    color: colors.white,
    fontSize: 18,
    fontWeight: '700' as const,
  },
  enhancingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: `${colors.secondary}10`,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: `${colors.secondary}30`,
  },
  enhancingText: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '600' as const,
  },
  checkboxContainer: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 16,
    borderWidth: 2,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  checkboxLabel: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: colors.primary,
  },
  checkboxDescription: {
    fontSize: 14,
    color: colors.text.secondary,
    lineHeight: 20,
    paddingLeft: 36,
  },
});
