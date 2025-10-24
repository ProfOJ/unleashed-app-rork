import { colors } from '@/constants/colors';
import { useWitness } from '@/contexts/WitnessContext';
import { useRouter } from 'expo-router';
import { ArrowLeft, Plus, X } from 'lucide-react-native';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function GuidesScreen() {
  const router = useRouter();
  const { testimony, updateTestimony } = useWitness();

  const [tellOnline, setTellOnline] = useState(testimony.tellOnline);
  const [tellInPerson, setTellInPerson] = useState(testimony.tellInPerson);
  const [goWorkplace, setGoWorkplace] = useState(testimony.goWorkplace);
  const [goSchool, setGoSchool] = useState(testimony.goSchool);
  const [goNeighborhood, setGoNeighborhood] = useState(testimony.goNeighborhood);

  const [heard, setHeard] = useState<string[]>(testimony.heard.length > 0 ? testimony.heard : ['']);
  const [seen, setSeen] = useState<string[]>(testimony.seen.length > 0 ? testimony.seen : ['']);
  const [experienced, setExperienced] = useState<string[]>(
    testimony.experienced.length > 0 ? testimony.experienced : ['']
  );

  const [loading, setLoading] = useState(false);

  const updateHeard = (index: number, value: string) => {
    const updated = [...heard];
    updated[index] = value;
    setHeard(updated);
  };

  const addHeard = () => {
    setHeard([...heard, '']);
  };

  const removeHeard = (index: number) => {
    if (heard.length > 1) {
      setHeard(heard.filter((_, i) => i !== index));
    }
  };

  const updateSeen = (index: number, value: string) => {
    const updated = [...seen];
    updated[index] = value;
    setSeen(updated);
  };

  const addSeen = () => {
    setSeen([...seen, '']);
  };

  const removeSeen = (index: number) => {
    if (seen.length > 1) {
      setSeen(seen.filter((_, i) => i !== index));
    }
  };

  const updateExperienced = (index: number, value: string) => {
    const updated = [...experienced];
    updated[index] = value;
    setExperienced(updated);
  };

  const addExperienced = () => {
    setExperienced([...experienced, '']);
  };

  const removeExperienced = (index: number) => {
    if (experienced.length > 1) {
      setExperienced(experienced.filter((_, i) => i !== index));
    }
  };

  const handleContinue = () => {
    const heardFiltered = heard.filter((item) => item.trim() !== '');
    const seenFiltered = seen.filter((item) => item.trim() !== '');
    const experiencedFiltered = experienced.filter((item) => item.trim() !== '');

    if (
      heardFiltered.length === 0 ||
      seenFiltered.length === 0 ||
      experiencedFiltered.length === 0
    ) {
      return;
    }

    setLoading(true);
    updateTestimony({
      tellOnline,
      tellInPerson,
      goWorkplace,
      goSchool,
      goNeighborhood,
      heard: heardFiltered,
      seen: seenFiltered,
      experienced: experiencedFiltered,
    });

    setTimeout(() => {
      setLoading(false);
      router.push('/summary' as any);
    }, 600);
  };

  const isValid =
    heard.some((h) => h.trim()) && seen.some((s) => s.trim()) && experienced.some((e) => e.trim());

  return (
    <View style={styles.background}>
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.topBar}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
            activeOpacity={0.7}
          >
            <ArrowLeft size={24} color={colors.primary} />
          </TouchableOpacity>
          <Text style={styles.topBarTitle}>Go & Tell Guides</Text>
          <View style={styles.backButton} />
        </View>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <Text style={styles.subtitle}>
              Prepare your testimony by reflecting{'\n'}on what you want to share
            </Text>
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionNumber}>1</Text>
              <View style={styles.sectionTitleContainer}>
                <Text style={styles.sectionTitle}>How will you Tell?</Text>
                <Text style={styles.sectionDesc}>Where do you want to share your story?</Text>
              </View>
            </View>
            <View style={styles.optionsRow}>
              <TouchableOpacity
                style={[styles.optionButton, tellOnline && styles.optionButtonSelected]}
                onPress={() => setTellOnline(!tellOnline)}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.optionButtonText,
                    tellOnline && styles.optionButtonTextSelected,
                  ]}
                >
                  Online
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.optionButton, tellInPerson && styles.optionButtonSelected]}
                onPress={() => setTellInPerson(!tellInPerson)}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.optionButtonText,
                    tellInPerson && styles.optionButtonTextSelected,
                  ]}
                >
                  In-Person
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionNumber}>2</Text>
              <View style={styles.sectionTitleContainer}>
                <Text style={styles.sectionTitle}>Where will you Go?</Text>
                <Text style={styles.sectionDesc}>Select the places you&apos;ll share</Text>
              </View>
            </View>
            <View style={styles.optionsGrid}>
              <TouchableOpacity
                style={[styles.optionButton, goWorkplace && styles.optionButtonSelected]}
                onPress={() => setGoWorkplace(!goWorkplace)}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.optionButtonText,
                    goWorkplace && styles.optionButtonTextSelected,
                  ]}
                >
                  Workplace
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.optionButton, goSchool && styles.optionButtonSelected]}
                onPress={() => setGoSchool(!goSchool)}
                activeOpacity={0.7}
              >
                <Text
                  style={[styles.optionButtonText, goSchool && styles.optionButtonTextSelected]}
                >
                  School
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.optionButton, goNeighborhood && styles.optionButtonSelected]}
                onPress={() => setGoNeighborhood(!goNeighborhood)}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.optionButtonText,
                    goNeighborhood && styles.optionButtonTextSelected,
                  ]}
                >
                  Neighborhood
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionNumber}>3</Text>
              <View style={styles.sectionTitleContainer}>
                <Text style={styles.sectionTitle}>What have you Heard?</Text>
                <Text style={styles.sectionDesc}>Scripture, sermons, teachings about Jesus</Text>
              </View>
            </View>
            {heard.map((item, index) => (
              <View key={index} style={styles.inputRow}>
                <TextInput
                  style={styles.testimonyInput}
                  placeholder="e.g., John 3:16 - For God so loved the world..."
                  placeholderTextColor={colors.text.light}
                  value={item}
                  onChangeText={(value) => updateHeard(index, value)}
                  multiline
                />
                {heard.length > 1 && (
                  <TouchableOpacity
                    style={styles.removeButton}
                    onPress={() => removeHeard(index)}
                  >
                    <X size={20} color={colors.secondary} />
                  </TouchableOpacity>
                )}
              </View>
            ))}
            <TouchableOpacity style={styles.addButton} onPress={addHeard} activeOpacity={0.7}>
              <Plus size={20} color={colors.primary} />
              <Text style={styles.addButtonText}>Add Another</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionNumber}>4</Text>
              <View style={styles.sectionTitleContainer}>
                <Text style={styles.sectionTitle}>What have you Seen?</Text>
                <Text style={styles.sectionDesc}>Miracles, answered prayers, transformations</Text>
              </View>
            </View>
            {seen.map((item, index) => (
              <View key={index} style={styles.inputRow}>
                <TextInput
                  style={styles.testimonyInput}
                  placeholder="e.g., I saw my friend healed from addiction..."
                  placeholderTextColor={colors.text.light}
                  value={item}
                  onChangeText={(value) => updateSeen(index, value)}
                  multiline
                />
                {seen.length > 1 && (
                  <TouchableOpacity
                    style={styles.removeButton}
                    onPress={() => removeSeen(index)}
                  >
                    <X size={20} color={colors.secondary} />
                  </TouchableOpacity>
                )}
              </View>
            ))}
            <TouchableOpacity style={styles.addButton} onPress={addSeen} activeOpacity={0.7}>
              <Plus size={20} color={colors.primary} />
              <Text style={styles.addButtonText}>Add Another</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionNumber}>5</Text>
              <View style={styles.sectionTitleContainer}>
                <Text style={styles.sectionTitle}>What have you Experienced?</Text>
                <Text style={styles.sectionDesc}>Your personal encounters with God</Text>
              </View>
            </View>
            {experienced.map((item, index) => (
              <View key={index} style={styles.inputRow}>
                <TextInput
                  style={styles.testimonyInput}
                  placeholder="e.g., God provided for me when I lost my job..."
                  placeholderTextColor={colors.text.light}
                  value={item}
                  onChangeText={(value) => updateExperienced(index, value)}
                  multiline
                />
                {experienced.length > 1 && (
                  <TouchableOpacity
                    style={styles.removeButton}
                    onPress={() => removeExperienced(index)}
                  >
                    <X size={20} color={colors.secondary} />
                  </TouchableOpacity>
                )}
              </View>
            ))}
            <TouchableOpacity
              style={styles.addButton}
              onPress={addExperienced}
              activeOpacity={0.7}
            >
              <Plus size={20} color={colors.primary} />
              <Text style={styles.addButtonText}>Add Another</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[styles.button, !isValid && styles.buttonDisabled]}
            onPress={handleContinue}
            disabled={!isValid || loading}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator color={colors.white} />
            ) : (
              <Text style={styles.buttonText}>Continue</Text>
            )}
          </TouchableOpacity>

          <View style={styles.bottomSpacer} />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
  },
  header: {
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 32,
  },
  subtitle: {
    fontSize: 16,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  section: {
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
    gap: 12,
  },
  sectionNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.accent,
    color: colors.primary,
    fontSize: 16,
    fontWeight: '700' as const,
    textAlign: 'center',
    lineHeight: 32,
  },
  sectionTitleContainer: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: colors.primary,
    marginBottom: 4,
  },
  sectionDesc: {
    fontSize: 14,
    color: colors.text.secondary,
  },
  optionsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  optionButton: {
    backgroundColor: colors.white,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderWidth: 2,
    borderColor: colors.border,
  },
  optionButtonSelected: {
    backgroundColor: `${colors.accent}15`,
    borderColor: colors.accent,
  },
  optionButtonText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: colors.text.secondary,
  },
  optionButtonTextSelected: {
    color: colors.primary,
  },
  inputRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
    alignItems: 'flex-start',
  },
  testimonyInput: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    fontSize: 15,
    color: colors.text.primary,
    borderWidth: 1,
    borderColor: colors.border,
    minHeight: 60,
    textAlignVertical: 'top',
  },
  removeButton: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: `${colors.secondary}15`,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 14,
    borderWidth: 2,
    borderColor: colors.primary,
    borderStyle: 'dashed',
  },
  addButtonText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: colors.primary,
  },
  button: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    padding: 18,
    alignItems: 'center',
    marginTop: 16,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonDisabled: {
    backgroundColor: colors.text.light,
    shadowOpacity: 0,
    elevation: 0,
  },
  buttonText: {
    color: colors.white,
    fontSize: 18,
    fontWeight: '700' as const,
  },
  bottomSpacer: {
    height: 40,
  },
});
