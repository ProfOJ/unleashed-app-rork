import { colors } from '@/constants/colors';
import { useWitness } from '@/contexts/WitnessContext';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api } from '@/lib/api-client';
import { ChevronDown, Plus, Trash2, X } from 'lucide-react-native';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function WizardStep3() {
  const router = useRouter();
  const { updateTestimony } = useWitness();
  const [showGuide, setShowGuide] = useState(false);
  const [seen, setSeen] = useState<string[]>(['']);
  const [heard, setHeard] = useState<string[]>(['']);
  const [experienced, setExperienced] = useState<string[]>(['']);
  const [seenExpanded, setSeenExpanded] = useState(false);
  const [heardExpanded, setHeardExpanded] = useState(false);
  const [experiencedExpanded, setExperiencedExpanded] = useState(false);
  const [isEnhancing, setIsEnhancing] = useState(false);

  const WITNESS_CARD_KEY = '@unleashed_witness_card';

  const handleAddMore = (type: 'seen' | 'heard' | 'experienced') => {
    if (type === 'seen') setSeen([...seen, '']);
    if (type === 'heard') setHeard([...heard, '']);
    if (type === 'experienced') setExperienced([...experienced, '']);
  };

  const handleRemove = (type: 'seen' | 'heard' | 'experienced', index: number) => {
    if (type === 'seen') setSeen(seen.filter((_, i) => i !== index));
    if (type === 'heard') setHeard(heard.filter((_, i) => i !== index));
    if (type === 'experienced') setExperienced(experienced.filter((_, i) => i !== index));
  };

  const handleUpdate = (type: 'seen' | 'heard' | 'experienced', index: number, value: string) => {
    if (type === 'seen') {
      const updated = [...seen];
      updated[index] = value;
      setSeen(updated);
    }
    if (type === 'heard') {
      const updated = [...heard];
      updated[index] = value;
      setHeard(updated);
    }
    if (type === 'experienced') {
      const updated = [...experienced];
      updated[index] = value;
      setExperienced(updated);
    }
  };

  const handleGenerate = async () => {
    const filteredSeen = seen.filter(s => s.trim());
    const filteredHeard = heard.filter(h => h.trim());
    const filteredExperienced = experienced.filter(e => e.trim());

    updateTestimony({
      seen: filteredSeen,
      heard: filteredHeard,
      experienced: filteredExperienced,
    });

    try {
      setIsEnhancing(true);
      console.log('Enhancing witness card...');

      const result = await api.witness.enhanceWitnessCard({
        seen: filteredSeen,
        heard: filteredHeard,
        experienced: filteredExperienced,
      });

      console.log('Witness card enhanced:', result);

      const witnessCard = {
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
        enhancedMessage: result.enhancedMessage,
        originalContent: {
          seen: filteredSeen,
          heard: filteredHeard,
          experienced: filteredExperienced,
        },
      };

      await AsyncStorage.setItem(WITNESS_CARD_KEY, JSON.stringify(witnessCard));
      console.log('Witness card saved to localStorage');

      setIsEnhancing(false);
      router.push('/summary' as any);
    } catch (error: any) {
      console.error('Error enhancing witness card:', error);
      console.error('Full error details:', {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        url: error.config?.url,
        method: error.config?.method,
        data: error.response?.data,
        headers: error.config?.headers,
      });
      
      setIsEnhancing(false);
      
      const errorDetails = `
URL: ${error.config?.url || 'N/A'}
Status: ${error.response?.status || 'N/A'}
Message: ${error.message}
Response: ${JSON.stringify(error.response?.data, null, 2) || 'N/A'}`;
      
      Alert.alert(
        'Enhancement Failed',
        `Could not enhance your witness card.${errorDetails}\n\nWould you like to continue without enhancement?`,
        [
          {
            text: 'Try Again',
            style: 'cancel',
          },
          {
            text: 'Continue',
            onPress: () => router.push('/summary' as any),
          },
        ]
      );
    }
  };

  const handleSkip = () => {
    router.push('/dashboard' as any);
  };

  const hasContent = 
    seen.some(s => s.trim()) || 
    heard.some(h => h.trim()) || 
    experienced.some(e => e.trim());

  return (
    <View style={styles.background}>
      <SafeAreaView style={styles.container} edges={['top']}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.topBar}>
              <Image
                source={{ uri: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRYpt5LpKnQd6tOq30nWtcdTvb8zmJ-VthfNQ&s' }}
                style={styles.logo}
                resizeMode="cover"
              />
              <Text style={styles.appName}>Unleashed</Text>
            </View>

            <View style={styles.header}>
              <Text style={styles.title}>
                It&apos;s time to TELL them.
              </Text>
              <Text style={styles.subtitle}>Let&apos;s know your story</Text>
            </View>
 
            {/* <TouchableOpacity
              style={styles.guideCard}
              onPress={() => setShowGuide(true)}
              activeOpacity={0.7}
            >
              <View style={styles.guideHeader}>
                <Text style={styles.guideTitle}>
                  What does it mean to See, Hear &amp; Experience?
                </Text>
                <Maximize2 size={18} color={colors.secondary} />
              </View>
              <Text style={styles.guidePreview}>
                Your testimony is built on three pillars...
              </Text>
            </TouchableOpacity> */}

            <TouchableOpacity
              style={styles.accordionHeader}
              onPress={() => setSeenExpanded(!seenExpanded)}
              activeOpacity={0.7}
            >
              <View style={styles.accordionTitleContainer}>
                <Text style={styles.accordionTitle}>What have you seen?</Text>
                <Text style={styles.accordionSubtitle}>
                  Miracles, answered prayers, transformations
                </Text>
              </View>
              <ChevronDown
                size={24}
                color={colors.primary}
                style={[
                  styles.chevron,
                  seenExpanded && styles.chevronExpanded,
                ]}
              />
            </TouchableOpacity>

            {seenExpanded && (
            <View style={styles.section}>
              {seen.map((item, index) => (
                <View key={index} style={styles.inputRow}>
                  <TextInput
                    style={styles.textArea}
                    placeholder="e.g., I saw my mother healed from cancer..."
                    placeholderTextColor="#94A3B8"
                    value={item}
                    onChangeText={(value) => handleUpdate('seen', index, value)}
                    multiline
                    numberOfLines={3}
                    textAlignVertical="top"
                  />
                  {seen.length > 1 && (
                    <TouchableOpacity
                      style={styles.removeButton}
                      onPress={() => handleRemove('seen', index)}
                    >
                      <Trash2 size={20} color={colors.secondary} />
                    </TouchableOpacity>
                  )}
                </View>
              ))}
              <TouchableOpacity
                style={styles.addMoreButton}
                onPress={() => handleAddMore('seen')}
                activeOpacity={0.7}
              >
                <Plus size={20} color={colors.secondary} />
                <Text style={styles.addMoreText}>Add More</Text>
              </TouchableOpacity>
            </View>
            )}

            <TouchableOpacity
              style={styles.accordionHeader}
              onPress={() => setHeardExpanded(!heardExpanded)}
              activeOpacity={0.7}
            >
              <View style={styles.accordionTitleContainer}>
                <Text style={styles.accordionTitle}>What have you heard?</Text>
                <Text style={styles.accordionSubtitle}>
                  Teachings, prophecies, words that changed you
                </Text>
              </View>
              <ChevronDown
                size={24}
                color={colors.primary}
                style={[
                  styles.chevron,
                  heardExpanded && styles.chevronExpanded,
                ]}
              />
            </TouchableOpacity>

            {heardExpanded && (
            <View style={styles.section}>
              {heard.map((item, index) => (
                <View key={index} style={styles.inputRow}>
                  <TextInput
                    style={styles.textArea}
                    placeholder="e.g., I heard a sermon about grace that changed my life..."
                    placeholderTextColor="#94A3B8"
                    value={item}
                    onChangeText={(value) => handleUpdate('heard', index, value)}
                    multiline
                    numberOfLines={3}
                    textAlignVertical="top"
                  />
                  {heard.length > 1 && (
                    <TouchableOpacity
                      style={styles.removeButton}
                      onPress={() => handleRemove('heard', index)}
                    >
                      <Trash2 size={20} color={colors.secondary} />
                    </TouchableOpacity>
                  )}
                </View>
              ))}
              <TouchableOpacity
                style={styles.addMoreButton}
                onPress={() => handleAddMore('heard')}
                activeOpacity={0.7}
              >
                <Plus size={20} color={colors.secondary} />
                <Text style={styles.addMoreText}>Add More</Text>
              </TouchableOpacity>
            </View>
            )}

            <TouchableOpacity
              style={styles.accordionHeader}
              onPress={() => setExperiencedExpanded(!experiencedExpanded)}
              activeOpacity={0.7}
            >
              <View style={styles.accordionTitleContainer}>
                <Text style={styles.accordionTitle}>What have you experienced?</Text>
                <Text style={styles.accordionSubtitle}>
                  Your personal encounters with God
                </Text>
              </View>
              <ChevronDown
                size={24}
                color={colors.primary}
                style={[
                  styles.chevron,
                  experiencedExpanded && styles.chevronExpanded,
                ]}
              />
            </TouchableOpacity>

            {experiencedExpanded && (
            <View style={styles.section}>
              {experienced.map((item, index) => (
                <View key={index} style={styles.inputRow}>
                  <TextInput
                    style={styles.textArea}
                    placeholder="e.g., I experienced God's peace during my darkest moment..."
                    placeholderTextColor="#94A3B8"
                    value={item}
                    onChangeText={(value) => handleUpdate('experienced', index, value)}
                    multiline
                    numberOfLines={3}
                    textAlignVertical="top"
                  />
                  {experienced.length > 1 && (
                    <TouchableOpacity
                      style={styles.removeButton}
                      onPress={() => handleRemove('experienced', index)}
                    >
                      <Trash2 size={20} color={colors.secondary} />
                    </TouchableOpacity>
                  )}
                </View>
              ))}
              <TouchableOpacity
                style={styles.addMoreButton}
                onPress={() => handleAddMore('experienced')}
                activeOpacity={0.7}
              >
                <Plus size={20} color={colors.secondary} />
                <Text style={styles.addMoreText}>Add More</Text>
              </TouchableOpacity>
            </View>
            )}

            <TouchableOpacity
              style={[styles.button, (!hasContent || isEnhancing) && styles.buttonDisabled]}
              onPress={handleGenerate}
              disabled={!hasContent || isEnhancing}
              activeOpacity={0.8}
            >
              {isEnhancing ? (
                <>
                  <ActivityIndicator color={colors.white} />
                  <Text style={styles.buttonText}>Generating...</Text>
                </>
              ) : (
                <Text style={styles.buttonText}>Generate Witness Profile</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.skipButton}
              onPress={handleSkip}
              activeOpacity={0.7}
            >
              <Text style={styles.skipText}>Skip to Dashboard</Text>
            </TouchableOpacity>

            <View style={styles.progressContainer}>
              <View style={styles.progressDot} />
              <View style={styles.progressDot} />
              <View style={[styles.progressDot, styles.progressDotActive]} />
            </View>

            <View style={styles.bottomSpacer} />
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>

      <Modal
        visible={showGuide}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowGuide(false)}
      >
        <SafeAreaView style={styles.modalContainer} edges={['top', 'bottom']}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              See, Hear &amp; Experience
            </Text>
            <TouchableOpacity
              onPress={() => setShowGuide(false)}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <X size={28} color={colors.primary} />
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.modalContent}>
            <Text style={styles.guideText}>
              Your testimony is built on three powerful pillars:
            </Text>

            <Text style={styles.guideSubheading}>1. What You&apos;ve SEEN</Text>
            <Text style={styles.guideText}>
              The tangible works of God you&apos;ve witnessed. This could be healings, miracles, changed lives, or answered prayers you&apos;ve observed in others.
            </Text>
            <Text style={styles.guideExample}>
              Example: &quot;I saw my father delivered from alcoholism after 20 years of addiction.&quot;
            </Text>

            <Text style={styles.guideSubheading}>2. What You&apos;ve HEARD</Text>
            <Text style={styles.guideText}>
              The words, teachings, prophecies, or messages that impacted you. This includes sermons, biblical truths, or divine revelations that transformed your thinking.
            </Text>
            <Text style={styles.guideExample}>
              Example: &quot;I heard a message about God&apos;s unconditional love that broke years of shame in my life.&quot;
            </Text>

            <Text style={styles.guideSubheading}>3. What You&apos;ve EXPERIENCED</Text>
            <Text style={styles.guideText}>
              Your personal encounters with God. This is your story—how Jesus changed you, saved you, healed you, or met you in your moment of need.
            </Text>
            <Text style={styles.guideExample}>
              Example: &quot;I experienced God&apos;s peace when I lost my job, and He provided for me in miraculous ways.&quot;
            </Text>

            <Text style={styles.guideText}>
              Remember: Your testimony is powerful! What God has done in your life can inspire faith in others.
            </Text>
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    backgroundColor: '#F5E8E4',
  },
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    marginBottom: 16,
    gap: 12,
  },
  logo: {
    width: 52,
    height: 52,
    borderRadius: 26,
  },
  appName: {
    fontSize: 28,
    fontWeight: '700' as const,
    color: colors.primary,
  },
  header: {
    marginBottom: 16,
    alignItems: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: '700' as const,
    color: colors.primary,
    lineHeight: 30,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '500' as const,
    color: colors.text.secondary,
    textAlign: 'center',
    marginTop: 4,
  },
  guideCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 14,
    marginBottom: 20,
    borderLeftWidth: 3,
    borderLeftColor: colors.secondary,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  guideHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  guideTitle: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: colors.primary,
    flex: 1,
    marginRight: 8,
  },
  guidePreview: {
    fontSize: 13,
    color: colors.text.secondary,
    lineHeight: 18,
  },
  accordionHeader: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  accordionTitleContainer: {
    flex: 1,
    marginRight: 8,
  },
  accordionTitle: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: colors.primary,
    marginBottom: 2,
  },
  accordionSubtitle: {
    fontSize: 12,
    color: colors.text.secondary,
  },
  chevron: {
    transform: [{ rotate: '0deg' }],
  },
  chevronExpanded: {
    transform: [{ rotate: '180deg' }],
  },
  section: {
    marginBottom: 20,
    paddingHorizontal: 4,
  },
  inputRow: {
    marginBottom: 10,
  },
  textArea: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 14,
    fontSize: 14,
    color: colors.primary,
    minHeight: 90,
    borderWidth: 2,
    borderColor: '#E2E8F0',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  removeButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FEE2E2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    backgroundColor: colors.white,
    borderWidth: 2,
    borderColor: colors.secondary,
    borderStyle: 'dashed',
  },
  addMoreText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: colors.secondary,
  },
  button: {
    backgroundColor: colors.secondary,
    borderRadius: 20,
    padding: 18,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
    shadowColor: colors.secondary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
    marginTop: 8,
  },
  buttonDisabled: {
    backgroundColor: '#CBD5E1',
    shadowOpacity: 0,
    elevation: 0,
  },
  buttonText: {
    color: colors.white,
    fontSize: 17,
    fontWeight: '700' as const,
  },
  skipButton: {
    alignItems: 'center',
    marginTop: 12,
  },
  skipText: {
    fontSize: 15,
    color: colors.text.secondary,
    textDecorationLine: 'underline',
  },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginTop: 20,
  },
  progressDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#E2E8F0',
  },
  progressDotActive: {
    backgroundColor: '#F59E0B',
  },
  bottomSpacer: {
    height: 20,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: colors.white,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '700' as const,
    color: colors.primary,
    flex: 1,
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: 24,
    paddingVertical: 24,
  },
  guideText: {
    fontSize: 16,
    color: colors.text.primary,
    lineHeight: 26,
    marginBottom: 16,
  },
  guideSubheading: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: colors.primary,
    marginTop: 8,
    marginBottom: 12,
  },
  guideExample: {
    fontSize: 15,
    color: colors.text.secondary,
    fontStyle: 'italic',
    paddingLeft: 16,
    borderLeftWidth: 3,
    borderLeftColor: colors.accent,
    marginBottom: 20,
    lineHeight: 24,
  },
});
