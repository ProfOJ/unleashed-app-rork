import { colors } from '@/constants/colors';
import { useWitness } from '@/contexts/WitnessContext';
import { useRouter } from 'expo-router';
import { ChevronDown, Maximize2, Plus, X } from 'lucide-react-native';
import React, { useState } from 'react';
import {
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const ONLINE_OPTIONS = [
  'Social Media',
  'WhatsApp',
  'Facebook',
  'Instagram',
  'Twitter/X',
  'TikTok',
  'YouTube',
];

const IN_PERSON_BASE_OPTIONS = [
  'My Workplace',
  'My School',
  'My Neighborhood',
  'At Church',
  'Family Gatherings',
];

export default function WizardStep2() {
  const router = useRouter();
  const { userProfile, updateTestimony } = useWitness();
  const [showGuide, setShowGuide] = useState(false);
  const [selectedOnline, setSelectedOnline] = useState<string[]>([]);
  const [selectedInPerson, setSelectedInPerson] = useState<string[]>([]);
  const [customInPerson, setCustomInPerson] = useState<string[]>([]);
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [customText, setCustomText] = useState('');
  const [onlineExpanded, setOnlineExpanded] = useState(false);
  const [inPersonExpanded, setInPersonExpanded] = useState(false);

  const handleOnlineToggle = (option: string) => {
    if (selectedOnline.includes(option)) {
      setSelectedOnline(selectedOnline.filter((item) => item !== option));
    } else {
      setSelectedOnline([...selectedOnline, option]);
    }
  };

  const handleInPersonToggle = (option: string) => {
    if (selectedInPerson.includes(option)) {
      setSelectedInPerson(selectedInPerson.filter((item) => item !== option));
    } else {
      setSelectedInPerson([...selectedInPerson, option]);
    }
  };

  const handleAddCustom = () => {
    if (customText.trim()) {
      setCustomInPerson([...customInPerson, customText.trim()]);
      setCustomText('');
      setShowCustomInput(false);
    }
  };

  const handleRemoveCustom = (item: string) => {
    setCustomInPerson(customInPerson.filter((i) => i !== item));
  };

  const handleContinue = () => {
    updateTestimony({
      tellOnline: selectedOnline.length > 0,
      tellInPerson: selectedInPerson.length > 0 || customInPerson.length > 0,
    });
    router.push('/wizard-step3' as any);
  };

  const handleSkip = () => {
    router.push('/wizard-step3' as any);
  };

  const allInPersonOptions = [...IN_PERSON_BASE_OPTIONS, ...customInPerson];

  return (
    <View style={styles.background}>
      <SafeAreaView style={styles.container} edges={['top']}>
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
            <Text style={styles.greeting}>
              Evangelist <Text style={styles.userName}>{userProfile?.name || 'Friend'}</Text>,
            </Text>
            <Text style={styles.title}>
              You've got to GO.
            </Text>
            <Text style={styles.title}>
              How do you want to go?
            </Text>
          </View>

          {/* <TouchableOpacity
            style={styles.guideCard}
            onPress={() => setShowGuide(true)}
            activeOpacity={0.7}
          >
            <View style={styles.guideHeader}>
              <Text style={styles.guideTitle}>What does it mean to &quot;GO&quot;?</Text>
              <Maximize2 size={18} color={colors.secondary} />
            </View>
            <Text style={styles.guidePreview}>
              Going means stepping out of your comfort zone...
            </Text>
          </TouchableOpacity> */}
           

          <TouchableOpacity
            style={styles.accordionHeader}
            onPress={() => setOnlineExpanded(!onlineExpanded)}
            activeOpacity={0.7}
          >
            <Text style={styles.accordionTitle}>Go Online</Text>
            <ChevronDown
              size={24}
              color={colors.primary}
              style={[
                styles.chevron,
                onlineExpanded && styles.chevronExpanded,
              ]}
            />
          </TouchableOpacity>

          {onlineExpanded && (
          <View style={styles.section}>
            <View style={styles.pillContainer}>
              {ONLINE_OPTIONS.map((option) => (
                <TouchableOpacity
                  key={option}
                  style={[
                    styles.pill,
                    selectedOnline.includes(option) && styles.pillSelected,
                  ]}
                  onPress={() => handleOnlineToggle(option)}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.pillText,
                      selectedOnline.includes(option) && styles.pillTextSelected,
                    ]}
                  >
                    {option}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          )}

          <TouchableOpacity
            style={styles.accordionHeader}
            onPress={() => setInPersonExpanded(!inPersonExpanded)}
            activeOpacity={0.7}
          >
            <Text style={styles.accordionTitle}>Go In-Person</Text>
            <ChevronDown
              size={24}
              color={colors.primary}
              style={[
                styles.chevron,
                inPersonExpanded && styles.chevronExpanded,
              ]}
            />
          </TouchableOpacity>

          {inPersonExpanded && (
          <View style={styles.section}>
            <Text style={styles.sectionSubtitle}>
              Select or add your own places
            </Text>
            <View style={styles.pillContainer}>
              {allInPersonOptions.map((option) => {
                const isCustom = customInPerson.includes(option);
                const isSelected = selectedInPerson.includes(option);
                return (
                  <TouchableOpacity
                    key={option}
                    style={[
                      styles.pill,
                      isSelected && styles.pillSelected,
                      isCustom && styles.pillCustom,
                    ]}
                    onPress={() => handleInPersonToggle(option)}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.pillText,
                        isSelected && styles.pillTextSelected,
                      ]}
                    >
                      {option}
                    </Text>
                    {isCustom && (
                      <TouchableOpacity
                        onPress={() => handleRemoveCustom(option)}
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                      >
                        <X size={16} color={isSelected ? colors.white : colors.primary} />
                      </TouchableOpacity>
                    )}
                  </TouchableOpacity>
                );
              })}

              {showCustomInput ? (
                <View style={styles.customInputContainer}>
                  <TextInput
                    style={styles.customInput}
                    placeholder="e.g., In the trotro"
                    placeholderTextColor="#94A3B8"
                    value={customText}
                    onChangeText={setCustomText}
                    autoFocus
                    onSubmitEditing={handleAddCustom}
                  />
                  <TouchableOpacity
                    style={styles.customAddButton}
                    onPress={handleAddCustom}
                  >
                    <Text style={styles.customAddText}>Add</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity
                  style={styles.addButton}
                  onPress={() => setShowCustomInput(true)}
                  activeOpacity={0.7}
                >
                  <Plus size={20} color={colors.secondary} />
                  <Text style={styles.addButtonText}>Add your own</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
          )}

          <TouchableOpacity
            style={styles.button}
            onPress={handleContinue}
            activeOpacity={0.8}
          >
            <Text style={styles.buttonText}>Continue</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.skipButton}
            onPress={handleSkip}
            activeOpacity={0.7}
          >
            <Text style={styles.skipText}>Skip for now</Text>
          </TouchableOpacity>

          <View style={styles.progressContainer}>
            <View style={styles.progressDot} />
            <View style={[styles.progressDot, styles.progressDotActive]} />
            <View style={styles.progressDot} />
          </View>

          <View style={styles.bottomSpacer} />
        </ScrollView>
      </SafeAreaView>

      <Modal
        visible={showGuide}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowGuide(false)}
      >
        <SafeAreaView style={styles.modalContainer} edges={['top', 'bottom']}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>What does it mean to &quot;GO&quot;?</Text>
            <TouchableOpacity
              onPress={() => setShowGuide(false)}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <X size={28} color={colors.primary} />
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.modalContent}>
            <Text style={styles.guideText}>
              <Text style={styles.guideBold}>Going</Text> means stepping out of your comfort zone and intentionally moving toward people who need to hear about Jesus.
            </Text>
            <Text style={styles.guideText}>
              Jesus said, <Text style={styles.guideItalic}>&quot;Go into all the world and preach the gospel&quot;</Text> (Mark 16:15).
            </Text>
            <Text style={styles.guideSubheading}>Examples:</Text>
            <Text style={styles.guideText}>
              • <Text style={styles.guideBold}>Online:</Text> Share your testimony on social media, send encouraging messages, create faith-based content
            </Text>
            <Text style={styles.guideText}>
              • <Text style={styles.guideBold}>In-Person:</Text> Talk to colleagues at work, share at your school, minister to neighbors, witness in public transport
            </Text>
            <Text style={styles.guideText}>
              Remember: Every place you go is an opportunity to be a light for Christ!
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
  greeting: {
    fontSize: 17,
    color: colors.text.secondary,
    marginBottom: 4,
    textAlign: 'center',
  },
  userName: {
    fontWeight: '700' as const,
    color: colors.primary,
  },
  title: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: colors.primary,
    lineHeight: 28,
    textAlign: 'center',
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
  accordionTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: colors.primary,
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
  sectionSubtitle: {
    fontSize: 13,
    color: colors.text.secondary,
    marginBottom: 12,
  },
  pillContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  pill: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: colors.white,
    borderWidth: 2,
    borderColor: '#E2E8F0',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  pillSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  pillCustom: {
    borderColor: colors.accent,
  },
  pillText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: colors.primary,
  },
  pillTextSelected: {
    color: colors.white,
  },
  addButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 24,
    backgroundColor: colors.white,
    borderWidth: 2,
    borderColor: colors.secondary,
    borderStyle: 'dashed',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  addButtonText: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: colors.secondary,
  },
  customInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  customInput: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 24,
    backgroundColor: colors.white,
    borderWidth: 2,
    borderColor: colors.secondary,
    fontSize: 15,
    color: colors.primary,
  },
  customAddButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 24,
    backgroundColor: colors.secondary,
  },
  customAddText: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: colors.white,
  },
  button: {
    backgroundColor: colors.secondary,
    borderRadius: 20,
    padding: 18,
    alignItems: 'center',
    shadowColor: colors.secondary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
    marginTop: 8,
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
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: 24,
    paddingVertical: 24,
  },
  guideText: {
    fontSize: 16,
    color: colors.text.primary,
    lineHeight: 16,
    marginBottom: 16,
  },
  guideBold: {
    fontWeight: '700' as const,
  },
  guideItalic: {
    fontStyle: 'italic',
    color: colors.text.secondary,
  },
  guideSubheading: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: colors.primary,
    marginTop: 8,
    marginBottom: 12,
  },
});
