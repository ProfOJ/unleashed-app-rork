import { colors } from '@/constants/colors';
import { useWitness } from '@/contexts/WitnessContext';
import { api } from '@/lib/api-client';
import { useRouter } from 'expo-router';
import { ArrowLeft, Church as ChurchIcon, Search, Plus, Users, MapPin } from 'lucide-react-native';
import React, { useState, useEffect } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Modal,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';

type Church = {
  id?: string;
  name: string;
  district: string;
  area: string;
  country: string;
  witnesses: number;
};

type StoredChurch = {
  church: Church;
  selectedAt: string;
};

const CHURCH_STORAGE_KEY = '@selected_church';

export default function FindChurchScreen() {
  const router = useRouter();
  const { updateUserProfile, userProfile } = useWitness();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedChurch, setSelectedChurch] = useState<Church | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [filteredChurches, setFilteredChurches] = useState<Church[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  const [newChurch, setNewChurch] = useState({
    name: '',
    district: '',
    area: '',
    country: '',
  });

  useEffect(() => {
    loadSelectedChurch();
  }, []);

  useEffect(() => {
    const searchChurchesDebounced = async () => {
      if (!searchQuery.trim()) {
        setFilteredChurches([]);
        setShowDropdown(false);
        return;
      }

      try {
        setIsSearching(true);
        console.log('🔍 Searching churches:', searchQuery);
        const results = await api.churches.searchChurches(searchQuery);
        console.log('✅ Search results:', results);
        
        const mapped = results.map((c: any) => ({
          id: c.id,
          name: c.name,
          district: c.district,
          area: c.area,
          country: c.country,
          witnesses: c.witnessesCount,
        }));
        
        setFilteredChurches(mapped);
        setShowDropdown(true);
      } catch (error: any) {
        console.error('❌ Error searching churches:', error);
        console.error('Full error details:', {
          message: error.message,
          response: error.response?.data,
          status: error.response?.status,
        });
        setFilteredChurches([]);
      } finally {
        setIsSearching(false);
      }
    };

    const timer = setTimeout(() => {
      searchChurchesDebounced();
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const loadSelectedChurch = async () => {
    try {
      const stored = await AsyncStorage.getItem(CHURCH_STORAGE_KEY);
      if (stored) {
        const data: StoredChurch = JSON.parse(stored);
        setSelectedChurch(data.church);
      }
    } catch (error) {
      console.error('Failed to load selected church:', error);
    }
  };



  const handleSelectChurch = async (church: Church) => {
    setSelectedChurch(church);
    setSearchQuery('');
    setShowDropdown(false);
    
    const storedChurch: StoredChurch = {
      church,
      selectedAt: new Date().toISOString(),
    };
    
    try {
      await AsyncStorage.setItem(CHURCH_STORAGE_KEY, JSON.stringify(storedChurch));
      updateUserProfile({
        ...userProfile!,
        country: church.country,
        district: church.district,
        assembly: church.name,
      });

      if (userProfile?.id && church.id) {
        console.log('🔗 Linking profile to church:', userProfile.id, church.id);
        await api.churches.linkProfileToChurch({
          witnessProfileId: userProfile.id,
          churchId: church.id,
        });
        console.log('✅ Profile linked to church successfully');
      }
    } catch (error) {
      console.error('❌ Error selecting church:', error);
    }
  };

  const handleAddChurch = async () => {
    if (!newChurch.name || !newChurch.district || !newChurch.area || !newChurch.country) {
      return;
    }

    try {
      setIsSaving(true);
      console.log('💾 Saving new church:', newChurch);
      
      const savedChurch = await api.churches.saveChurch({
        name: newChurch.name,
        district: newChurch.district,
        area: newChurch.area,
        country: newChurch.country,
      });

      console.log('✅ Church saved successfully:', savedChurch);

      const church: Church = {
        id: savedChurch.id,
        name: savedChurch.name,
        district: savedChurch.district,
        area: savedChurch.area,
        country: savedChurch.country,
        witnesses: savedChurch.witnessesCount,
      };

      setShowAddModal(false);
      setNewChurch({ name: '', district: '', area: '', country: '' });
      await handleSelectChurch(church);
    } catch (error: any) {
      console.error('❌ Error adding church:', error);
      console.error('Full error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSearchFocus = () => {
    if (searchQuery.trim()) {
      setShowDropdown(true);
    }
  };

  const handleSearchChange = (text: string) => {
    setSearchQuery(text);
  };

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
          <Text style={styles.topBarTitle}>My Church</Text>
          <View style={styles.backButton} />
        </View>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.header}>
            <View style={styles.iconContainer}>
              <ChurchIcon size={32} color={colors.accent} />
            </View>
            <Text style={styles.title}>My Church</Text>
            <Text style={styles.subtitle}>
              Connect with your local assembly
            </Text>
          </View>

          {!selectedChurch && (
            <View style={styles.searchSection}>
              <View style={styles.searchContainer}>
                {isSearching ? (
                  <ActivityIndicator size="small" color={colors.accent} />
                ) : (
                  <Search size={20} color={colors.text.secondary} />
                )}
                <TextInput
                  style={styles.searchInput}
                  placeholder="Search for your church..."
                  placeholderTextColor={colors.text.light}
                  value={searchQuery}
                  onChangeText={handleSearchChange}
                  onFocus={handleSearchFocus}
                />
              </View>

              {showDropdown && filteredChurches.length > 0 && (
                <View style={styles.dropdown}>
                  <ScrollView
                    style={styles.dropdownScroll}
                    nestedScrollEnabled
                    keyboardShouldPersistTaps="handled"
                  >
                    {filteredChurches.map((church, index) => (
                      <TouchableOpacity
                        key={`${church.id}-${index}`}
                        style={styles.dropdownItem}
                        onPress={() => handleSelectChurch(church)}
                        activeOpacity={0.7}
                      >
                        <View style={styles.dropdownItemContent}>
                          <Text style={styles.dropdownItemName}>{church.name}</Text>
                          <View style={styles.dropdownItemDetails}>
                            <MapPin size={14} color={colors.text.light} />
                            <Text style={styles.dropdownItemText}>
                              {church.district}, {church.country}
                            </Text>
                          </View>
                          <View style={styles.dropdownItemDetails}>
                            <Users size={14} color={colors.text.light} />
                            <Text style={styles.dropdownItemText}>
                              {church.witnesses} witnesses
                            </Text>
                          </View>
                        </View>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              )}

              {showDropdown && searchQuery.trim() && filteredChurches.length === 0 && !isSearching && (
                <View style={styles.noResults}>
                  <Text style={styles.noResultsText}>No churches found</Text>
                  <Text style={styles.noResultsSubtext}>Try adding your church below</Text>
                </View>
              )}

              <TouchableOpacity
                style={styles.addButton}
                onPress={() => setShowAddModal(true)}
                activeOpacity={0.7}
              >
                <Plus size={20} color={colors.primary} />
                <Text style={styles.addButtonText}>Add New Church</Text>
              </TouchableOpacity>
            </View>
          )}

          {selectedChurch && (
            <View style={styles.selectedChurchContainer}>
              <View style={styles.selectedChurchCard}>
                <View style={styles.selectedChurchHeader}>
                  <ChurchIcon size={28} color={colors.accent} />
                  <Text style={styles.selectedChurchName}>{selectedChurch.name}</Text>
                </View>
                
                <View style={styles.selectedChurchDetails}>
                  <View style={styles.detailRow}>
                    <MapPin size={18} color={colors.text.secondary} />
                    <View style={styles.detailContent}>
                      <Text style={styles.detailLabel}>District</Text>
                      <Text style={styles.detailValue}>{selectedChurch.district}</Text>
                    </View>
                  </View>

                  <View style={styles.detailRow}>
                    <MapPin size={18} color={colors.text.secondary} />
                    <View style={styles.detailContent}>
                      <Text style={styles.detailLabel}>Area</Text>
                      <Text style={styles.detailValue}>{selectedChurch.area}</Text>
                    </View>
                  </View>

                  <View style={styles.detailRow}>
                    <Users size={18} color={colors.accent} />
                    <View style={styles.detailContent}>
                      <Text style={styles.detailLabel}>Number of Witnesses</Text>
                      <Text style={[styles.detailValue, styles.witnessCount]}>
                        {selectedChurch.witnesses}
                      </Text>
                    </View>
                  </View>
                </View>

                <TouchableOpacity
                  style={styles.changeButton}
                  onPress={() => setSelectedChurch(null)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.changeButtonText}>Change Church</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          <View style={styles.bottomSpacer} />
        </ScrollView>
      </SafeAreaView>

      <Modal
        visible={showAddModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowAddModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add New Church</Text>
            
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Church Name</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., PIWC Tema"
                placeholderTextColor={colors.text.light}
                value={newChurch.name}
                onChangeText={(text) => setNewChurch({ ...newChurch, name: text })}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>District</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., Greater Accra"
                placeholderTextColor={colors.text.light}
                value={newChurch.district}
                onChangeText={(text) => setNewChurch({ ...newChurch, district: text })}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Area</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., Tema Community 1"
                placeholderTextColor={colors.text.light}
                value={newChurch.area}
                onChangeText={(text) => setNewChurch({ ...newChurch, area: text })}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Country</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., Ghana"
                placeholderTextColor={colors.text.light}
                value={newChurch.country}
                onChangeText={(text) => setNewChurch({ ...newChurch, country: text })}
              />
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonCancel]}
                onPress={() => {
                  setShowAddModal(false);
                  setNewChurch({ name: '', district: '', area: '', country: '' });
                }}
                disabled={isSaving}
                activeOpacity={0.7}
              >
                <Text style={styles.modalButtonTextCancel}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.modalButton,
                  styles.modalButtonAdd,
                  (!newChurch.name || !newChurch.district || !newChurch.area || !newChurch.country || isSaving) &&
                    styles.modalButtonDisabled,
                ]}
                onPress={handleAddChurch}
                disabled={!newChurch.name || !newChurch.district || !newChurch.area || !newChurch.country || isSaving}
                activeOpacity={0.7}
              >
                {isSaving ? (
                  <ActivityIndicator size="small" color={colors.white} />
                ) : (
                  <Text style={styles.modalButtonTextAdd}>Add Church</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
    marginTop: 32,
    marginBottom: 32,
  },
  iconContainer: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: `${colors.accent}25`,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: '700' as const,
    color: colors.primary,
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  searchSection: {
    gap: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 2,
    borderColor: colors.border,
    gap: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: colors.primary,
  },
  dropdown: {
    backgroundColor: colors.white,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.border,
    maxHeight: 300,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  dropdownScroll: {
    maxHeight: 300,
  },
  dropdownItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  dropdownItemContent: {
    gap: 6,
  },
  dropdownItemName: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: colors.primary,
    marginBottom: 4,
  },
  dropdownItemDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dropdownItemText: {
    fontSize: 14,
    color: colors.text.secondary,
  },
  noResults: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.border,
  },
  noResultsText: {
    fontSize: 16,
    color: colors.text.secondary,
    marginBottom: 4,
  },
  noResultsSubtext: {
    fontSize: 14,
    color: colors.text.light,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: colors.accent,
    gap: 8,
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: colors.primary,
  },
  selectedChurchContainer: {
    marginTop: 8,
  },
  selectedChurchCard: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 24,
    borderWidth: 2,
    borderColor: colors.accent,
    shadowColor: colors.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  selectedChurchHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 24,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  selectedChurchName: {
    flex: 1,
    fontSize: 22,
    fontWeight: '700' as const,
    color: colors.primary,
  },
  selectedChurchDetails: {
    gap: 20,
    marginBottom: 24,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  detailContent: {
    flex: 1,
    gap: 4,
  },
  detailLabel: {
    fontSize: 14,
    color: colors.text.light,
    fontWeight: '500' as const,
  },
  detailValue: {
    fontSize: 16,
    color: colors.primary,
    fontWeight: '600' as const,
  },
  witnessCount: {
    fontSize: 24,
    color: colors.accent,
    fontWeight: '700' as const,
  },
  changeButton: {
    backgroundColor: colors.background,
    borderRadius: 10,
    padding: 14,
    alignItems: 'center',
  },
  changeButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: colors.primary,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalContent: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: colors.primary,
    marginBottom: 24,
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: colors.primary,
    marginBottom: 8,
  },
  input: {
    backgroundColor: colors.background,
    borderRadius: 10,
    padding: 14,
    fontSize: 16,
    color: colors.primary,
    borderWidth: 2,
    borderColor: colors.border,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  modalButton: {
    flex: 1,
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
  },
  modalButtonCancel: {
    backgroundColor: colors.background,
  },
  modalButtonAdd: {
    backgroundColor: colors.primary,
  },
  modalButtonDisabled: {
    backgroundColor: colors.text.light,
  },
  modalButtonTextCancel: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: colors.primary,
  },
  modalButtonTextAdd: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: colors.white,
  },
  bottomSpacer: {
    height: 40,
  },
});
