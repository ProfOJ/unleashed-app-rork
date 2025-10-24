import { colors } from '@/constants/colors';
import { useRouter } from 'expo-router';
import { useWitness } from '@/contexts/WitnessContext';
import { api } from '@/lib/api-client';
import {
  ArrowLeft,
  Calendar,
  MapPin,
  MessageSquare,
  Phone,
  Plus,
  User,
  UserCheck,
  X,
} from 'lucide-react-native';
import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
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
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import * as Location from 'expo-location';
import DateTimePicker from '@react-native-community/datetimepicker';

type Soul = {
  id: string;
  name: string;
  contact: string;
  location: string;
  notes: string;
  handedTo: string;
  date: string;
  createdAt: string;
};

export default function Souls() {
  const router = useRouter();
  const { userProfile } = useWitness();
  const [souls, setSouls] = useState<Soul[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    contact: '',
    location: '',
    notes: '',
    handedTo: '',
    date: new Date().toISOString().split('T')[0],
  });

  const SOULS_KEY = '@unleashed_souls';

  const loadSouls = async () => {
    try {
      setIsLoading(true);
      console.log('Loading souls from localStorage...');
      const stored = await AsyncStorage.getItem(SOULS_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        console.log('Loaded souls:', parsed);
        setSouls(parsed.reverse());
      } else {
        console.log('No souls found in localStorage');
        setSouls([]);
      }
    } catch (error) {
      console.error('Error loading souls:', error);
      setSouls([]);
    } finally {
      setIsLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadSouls();
    }, [])
  );

  const handleDetectLocation = async () => {
    try {
      setIsDetectingLocation(true);
      console.log('Requesting location permission...');

      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Location permission is required to detect your location');
        setIsDetectingLocation(false);
        return;
      }

      console.log('Getting current location...');
      const location = await Location.getCurrentPositionAsync({});
      console.log('Location detected:', location);

      const [result] = await Location.reverseGeocodeAsync({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });

      console.log('Reverse geocode result:', result);

      if (result) {
        const locationParts = [
          result.streetNumber,
          result.street,
          result.name,
          result.district,
          result.subregion,
          result.city,
          result.region,
          result.country,
        ].filter(Boolean);

        const locationString = locationParts.length > 0 
          ? locationParts.join(', ')
          : `${location.coords.latitude}, ${location.coords.longitude}`;

        console.log('Formatted location:', locationString);

        setFormData((prev) => ({
          ...prev,
          location: locationString,
        }));

        Alert.alert('Success', 'Location detected successfully');
      } else {
        setFormData((prev) => ({
          ...prev,
          location: `${location.coords.latitude}, ${location.coords.longitude}`,
        }));
      }
    } catch (error) {
      console.error('Error detecting location:', error);
      Alert.alert('Error', 'Failed to detect location. Please enter manually.');
    } finally {
      setIsDetectingLocation(false);
    }
  };

  const handleAddSoul = async () => {
    if (!formData.name.trim()) {
      Alert.alert('Error', 'Please enter a name');
      return;
    }

    try {
      const newSoul: Soul = {
        id: Date.now().toString(),
        name: formData.name,
        contact: formData.contact,
        location: formData.location,
        notes: formData.notes,
        handedTo: formData.handedTo,
        date: formData.date,
        createdAt: new Date().toISOString(),
      };

      console.log('Adding new soul:', newSoul);

      const updatedSouls = [newSoul, ...souls];
      await AsyncStorage.setItem(SOULS_KEY, JSON.stringify(updatedSouls));
      setSouls(updatedSouls);

      if (userProfile?.id) {
        try {
          await api.points.awardPoints({
            witnessProfileId: userProfile.id,
            actionType: 'soul_added',
            description: `Added soul: ${formData.name}`,
          });
          console.log('Points awarded for adding soul');
        } catch (error) {
          console.error('Failed to award points for soul:', error);
        }
      }

      setFormData({
        name: '',
        contact: '',
        location: '',
        notes: '',
        handedTo: '',
        date: new Date().toISOString().split('T')[0],
      });

      setModalVisible(false);
      Alert.alert('Success', 'Soul added successfully!');
    } catch (error) {
      console.error('Error adding soul:', error);
      Alert.alert('Error', 'Failed to add soul');
    }
  };

  const handleDeleteSoul = (id: string) => {
    Alert.alert('Delete Soul', 'Are you sure you want to remove this soul?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            const filtered = souls.filter((s) => s.id !== id);
            await AsyncStorage.setItem(SOULS_KEY, JSON.stringify(filtered));
            setSouls(filtered);
            Alert.alert('Success', 'Soul removed successfully');
          } catch (error) {
            console.error('Error deleting soul:', error);
            Alert.alert('Error', 'Failed to delete soul');
          }
        },
      },
    ]);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const handleDateChange = (_event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
    }
    if (selectedDate) {
      const formattedDate = selectedDate.toISOString().split('T')[0];
      setFormData((prev) => ({ ...prev, date: formattedDate }));
    }
  };

  const handleDatePickerPress = () => {
    setShowDatePicker(true);
  };

  const hideDatePicker = () => {
    setShowDatePicker(false);
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
            activeOpacity={0.7}
          >
            <ArrowLeft size={24} color={colors.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Souls</Text>
          <TouchableOpacity
            style={styles.addButtonHeader}
            onPress={() => setModalVisible(true)}
            activeOpacity={0.7}
          >
            <Plus size={24} color={colors.white} />
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        <View style={styles.statsCard}>
          <Text style={styles.statsNumber}>{souls.length}</Text>
          <Text style={styles.statsLabel}>Total Souls</Text>
        </View>

        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.secondary} />
            <Text style={styles.loadingText}>Loading souls...</Text>
          </View>
        ) : souls.length > 0 ? (
          <View style={styles.soulsList}>
            {souls.map((soul) => (
              <View key={soul.id} style={styles.soulCard}>
                <View style={styles.soulHeader}>
                  <View style={styles.soulAvatar}>
                    <User size={24} color={colors.white} />
                  </View>
                  <View style={styles.soulHeaderInfo}>
                    <Text style={styles.soulName}>{soul.name}</Text>
                    <Text style={styles.soulDate}>{formatDate(soul.date)}</Text>
                  </View>
                  <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => handleDeleteSoul(soul.id)}
                    activeOpacity={0.7}
                  >
                    <X size={20} color="#EF4444" />
                  </TouchableOpacity>
                </View>

                {soul.contact && (
                  <View style={styles.soulDetailRow}>
                    <Phone size={16} color={colors.text.secondary} />
                    <Text style={styles.soulDetailText}>{soul.contact}</Text>
                  </View>
                )}

                {soul.location && (
                  <View style={styles.soulDetailRow}>
                    <MapPin size={16} color={colors.text.secondary} />
                    <Text style={styles.soulDetailText}>{soul.location}</Text>
                  </View>
                )}

                {soul.handedTo && (
                  <View style={styles.soulDetailRow}>
                    <UserCheck size={16} color={colors.text.secondary} />
                    <Text style={styles.soulDetailText}>Handed to: {soul.handedTo}</Text>
                  </View>
                )}

                {soul.notes && (
                  <View style={styles.soulDetailRow}>
                    <MessageSquare size={16} color={colors.text.secondary} />
                    <Text style={styles.soulDetailText}>{soul.notes}</Text>
                  </View>
                )}
              </View>
            ))}
          </View>
        ) : (
          <View style={styles.emptyState}>
            <View style={styles.emptyIcon}>
              <User size={48} color={colors.text.secondary} />
            </View>
            <Text style={styles.emptyTitle}>No Souls Yet</Text>
            <Text style={styles.emptyText}>
              Start tracking souls you&apos;ve witnessed to by adding your first soul
            </Text>
            <TouchableOpacity
              style={styles.emptyButton}
              onPress={() => setModalVisible(true)}
              activeOpacity={0.7}
            >
              <Plus size={20} color={colors.white} />
              <Text style={styles.emptyButtonText}>Add Your First Soul</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <SafeAreaView style={styles.modalContent} edges={['bottom']}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Add Soul</Text>
                <TouchableOpacity
                  onPress={() => setModalVisible(false)}
                  activeOpacity={0.7}
                >
                  <X size={24} color={colors.text.secondary} />
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.modalScroll} showsVerticalScrollIndicator={false}>
                <View style={styles.form}>
                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>Name *</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="Enter name"
                      placeholderTextColor={colors.text.secondary}
                      value={formData.name}
                      onChangeText={(text) =>
                        setFormData((prev) => ({ ...prev, name: text }))
                      }
                    />
                  </View>

                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>Contact</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="Phone or email"
                      placeholderTextColor={colors.text.secondary}
                      value={formData.contact}
                      onChangeText={(text) =>
                        setFormData((prev) => ({ ...prev, contact: text }))
                      }
                      keyboardType={Platform.OS === 'ios' ? 'default' : 'email-address'}
                    />
                  </View>

                  <View style={styles.inputGroup}>
                    <View style={styles.labelRow}>
                      <Text style={styles.label}>Location</Text>
                      {Platform.OS !== 'web' && (
                        <TouchableOpacity
                          style={styles.detectButton}
                          onPress={handleDetectLocation}
                          disabled={isDetectingLocation}
                          activeOpacity={0.7}
                        >
                          {isDetectingLocation ? (
                            <ActivityIndicator size="small" color={colors.secondary} />
                          ) : (
                            <>
                              <MapPin size={16} color={colors.secondary} />
                              <Text style={styles.detectButtonText}>Detect GPS</Text>
                            </>
                          )}
                        </TouchableOpacity>
                      )}
                    </View>
                    <TextInput
                      style={styles.input}
                      placeholder="Enter location"
                      placeholderTextColor={colors.text.secondary}
                      value={formData.location}
                      onChangeText={(text) =>
                        setFormData((prev) => ({ ...prev, location: text }))
                      }
                      multiline
                    />
                  </View>

                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>Who You Handed Them To</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="Pastor, mentor, etc."
                      placeholderTextColor={colors.text.secondary}
                      value={formData.handedTo}
                      onChangeText={(text) =>
                        setFormData((prev) => ({ ...prev, handedTo: text }))
                      }
                    />
                  </View>

                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>Date</Text>
                    <TouchableOpacity
                      style={styles.dateInputContainer}
                      onPress={handleDatePickerPress}
                      activeOpacity={0.7}
                    >
                      <Calendar size={16} color={colors.text.secondary} />
                      <Text style={styles.dateInputText}>
                        {formatDate(formData.date)}
                      </Text>
                    </TouchableOpacity>
                    {showDatePicker && (
                      <View>
                        <DateTimePicker
                          value={new Date(formData.date)}
                          mode="date"
                          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                          onChange={handleDateChange}
                          maximumDate={new Date()}
                        />
                        {Platform.OS === 'ios' && (
                          <TouchableOpacity
                            style={styles.doneButton}
                            onPress={hideDatePicker}
                            activeOpacity={0.7}
                          >
                            <Text style={styles.doneButtonText}>Done</Text>
                          </TouchableOpacity>
                        )}
                      </View>
                    )}
                  </View>

                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>Notes</Text>
                    <TextInput
                      style={[styles.input, styles.textArea]}
                      placeholder="Additional notes..."
                      placeholderTextColor={colors.text.secondary}
                      value={formData.notes}
                      onChangeText={(text) =>
                        setFormData((prev) => ({ ...prev, notes: text }))
                      }
                      multiline
                      numberOfLines={4}
                      textAlignVertical="top"
                    />
                  </View>
                </View>
              </ScrollView>

              <TouchableOpacity
                style={styles.submitButton}
                onPress={handleAddSoul}
                activeOpacity={0.8}
              >
                <Text style={styles.submitButtonText}>Add Soul</Text>
              </TouchableOpacity>
            </SafeAreaView>
          </View>
        </View>
      </Modal>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: colors.primary,
  },
  addButtonHeader: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  statsCard: {
    backgroundColor: colors.secondary,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: colors.secondary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  statsNumber: {
    fontSize: 48,
    fontWeight: '800' as const,
    color: colors.white,
    marginBottom: 8,
  },
  statsLabel: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: colors.white,
    opacity: 0.9,
  },
  loadingContainer: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 40,
    alignItems: 'center',
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  loadingText: {
    fontSize: 14,
    color: colors.text.secondary,
  },
  soulsList: {
    gap: 16,
  },
  soulCard: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
    gap: 12,
  },
  soulHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  soulAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  soulHeaderInfo: {
    flex: 1,
  },
  soulName: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: colors.primary,
    marginBottom: 2,
  },
  soulDate: {
    fontSize: 13,
    color: colors.text.secondary,
    fontWeight: '500' as const,
  },
  deleteButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FEE2E2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  soulDetailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    paddingLeft: 4,
  },
  soulDetailText: {
    flex: 1,
    fontSize: 14,
    color: colors.text.secondary,
    lineHeight: 20,
  },
  emptyState: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 40,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  emptyIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: colors.primary,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 15,
    color: colors.text.secondary,
    textAlign: 'center' as const,
    lineHeight: 22,
    marginBottom: 24,
  },
  emptyButton: {
    backgroundColor: colors.secondary,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    gap: 8,
  },
  emptyButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600' as const,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
    minHeight: '60%',
  },
  modalContent: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '700' as const,
    color: colors.primary,
  },
  modalScroll: {
    flexGrow: 1,
  },
  form: {
    padding: 20,
    gap: 20,
  },
  inputGroup: {
    gap: 8,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  label: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: colors.primary,
  },
  detectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: `${colors.secondary}15`,
  },
  detectButtonText: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: colors.secondary,
  },
  input: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: colors.text.primary,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  dateInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 12,
  },
  dateInput: {
    flex: 1,
    fontSize: 15,
    color: colors.text.primary,
  },
  dateInputText: {
    flex: 1,
    fontSize: 15,
    color: colors.text.primary,
  },
  doneButton: {
    backgroundColor: colors.secondary,
    marginTop: 12,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  doneButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600' as const,
  },
  submitButton: {
    backgroundColor: colors.secondary,
    marginHorizontal: 20,
    marginVertical: 16,
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: colors.secondary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  submitButtonText: {
    color: colors.white,
    fontSize: 17,
    fontWeight: '700' as const,
  },
});
