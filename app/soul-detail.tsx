import { colors } from '@/constants/colors';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { api } from '@/lib/api-client';
import {
  ArrowLeft,
  Calendar,
  ChevronDown,
  ClipboardList,
  Edit,
  MapPin,
  MessageSquare,
  Phone,
  Plus,
  Share2,
  Trash2,
  User,
  UserCheck,
  X,
} from 'lucide-react-native';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  Platform,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useWitness } from '@/contexts/WitnessContext';
import { trpc } from '@/lib/trpc';

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

type ActivityType = 'follow_up' | 'church_attendance' | 'water_baptism' | 'holy_ghost_baptism';

type Activity = {
  id: string;
  soul_id: string;
  activity_type: ActivityType;
  date: string;
  remarks: string | null;
  created_at: string;
  updated_at: string;
};

export default function SoulDetail() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { userProfile } = useWitness();
  const [soul, setSoul] = useState<Soul | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [editedSoul, setEditedSoul] = useState<Partial<Soul>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [isAddActivityModalVisible, setIsAddActivityModalVisible] = useState(false);
  const [activityType, setActivityType] = useState<ActivityType>('follow_up');
  const [activityDate, setActivityDate] = useState(new Date().toISOString().split('T')[0]);
  const [activityRemarks, setActivityRemarks] = useState('');
  const [isActivityDropdownOpen, setIsActivityDropdownOpen] = useState(false);

  const activitiesQuery = trpc.souls.getActivities.useQuery(id || '', {
    enabled: !!id,
  });

  const addActivityMutation = trpc.souls.addActivity.useMutation({
    onSuccess: () => {
      activitiesQuery.refetch();
      setIsAddActivityModalVisible(false);
      setActivityRemarks('');
      setActivityDate(new Date().toISOString().split('T')[0]);
      Alert.alert('Success', 'Activity added successfully!');
    },
    onError: (error) => {
      Alert.alert('Error', error.message || 'Failed to add activity');
    },
  });

  const deleteActivityMutation = trpc.souls.deleteActivity.useMutation({
    onSuccess: () => {
      activitiesQuery.refetch();
      Alert.alert('Success', 'Activity deleted successfully!');
    },
    onError: (error) => {
      Alert.alert('Error', error.message || 'Failed to delete activity');
    },
  });

  const loadSoulDetails = useCallback(async () => {
    if (!userProfile?.id || !id) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      console.log('Loading soul details for:', id);
      const soulsData = await api.witness.getSouls(userProfile.id);
      const foundSoul = soulsData.find((s: any) => s.id === id);
      
      if (foundSoul) {
        setSoul(foundSoul);
        console.log('Soul details loaded:', foundSoul);
      } else {
        Alert.alert('Error', 'Soul not found');
        router.back();
      }
    } catch (error) {
      console.error('Error loading soul details:', error);
      Alert.alert('Error', 'Failed to load soul details');
      router.back();
    } finally {
      setIsLoading(false);
    }
  }, [userProfile?.id, id, router]);

  useEffect(() => {
    loadSoulDetails();
  }, [loadSoulDetails]);

  const handleShare = async () => {
    if (!soul) return;

    const hashtags = '#NYWC25 | #GoAndTell | #PossessingTheNations | #TellThemShowThem | #ProfOJ | @profoj.tech';
    
    const message = `🙏 Soul Won for Christ!

Name: ${soul.name}
${
      soul.contact ? `Contact: ${soul.contact}\n` : ''
    }${
      soul.location ? `Location: ${soul.location}\n` : ''
    }${
      soul.handedTo ? `Handed to: ${soul.handedTo}\n` : ''
    }Date: ${formatDate(soul.date)}
${
      soul.notes ? `\nNotes: ${soul.notes}\n` : ''
    }${
      userProfile ? `\nWon by: ${userProfile.name}${userProfile.contact ? ` (${userProfile.contact})` : ''}` : ''
    }

${hashtags}`;

    try {
      if (Platform.OS === 'web') {
        if (navigator.share) {
          await navigator.share({
            title: `Soul Won: ${soul.name}`,
            text: message,
          });
        } else {
          await navigator.clipboard.writeText(message);
          Alert.alert('Success', 'Details copied to clipboard!');
        }
      } else {
        const result = await Share.share({
          message: message,
        });

        if (result.action === Share.sharedAction) {
          console.log('Soul details shared successfully');
        }
      }
    } catch (error) {
      console.error('Error sharing soul details:', error);
      Alert.alert('Error', 'Failed to share soul details');
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const handleEditPress = () => {
    if (soul) {
      setEditedSoul({
        name: soul.name,
        contact: soul.contact,
        location: soul.location,
        notes: soul.notes,
        handedTo: soul.handedTo,
        date: soul.date,
      });
      setIsEditModalVisible(true);
    }
  };

  const handleAddActivity = () => {
    if (!id) return;

    addActivityMutation.mutate({
      soulId: id,
      activityType: activityType,
      date: activityDate,
      remarks: activityRemarks || undefined,
    });
  };

  const handleDeleteActivity = (activityId: string) => {
    Alert.alert(
      'Delete Activity',
      'Are you sure you want to delete this activity?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deleteActivityMutation.mutate(activityId),
        },
      ]
    );
  };

  const getActivityTypeLabel = (type: ActivityType) => {
    switch (type) {
      case 'follow_up':
        return 'Follow Up';
      case 'church_attendance':
        return 'Church Attendance';
      case 'water_baptism':
        return 'Water Baptism';
      case 'holy_ghost_baptism':
        return 'Holy Ghost Baptism';
      default:
        return type;
    }
  };

  const handleSaveEdit = async () => {
    if (!userProfile?.id || !soul?.id || !editedSoul.name) {
      Alert.alert('Error', 'Name is required');
      return;
    }

    try {
      setIsSaving(true);
      console.log('Updating soul:', editedSoul);
      
      await api.witness.deleteSoul(soul.id);

      const newSoul = await api.witness.saveSoul({
        witnessProfileId: userProfile.id,
        name: editedSoul.name,
        contact: editedSoul.contact || '',
        location: editedSoul.location || '',
        notes: editedSoul.notes || '',
        handedTo: editedSoul.handedTo || '',
        date: editedSoul.date || soul.date,
      });

      setSoul(newSoul as Soul);
      setIsEditModalVisible(false);
      Alert.alert('Success', 'Soul details updated successfully!');
    } catch (error) {
      console.error('Error updating soul:', error);
      Alert.alert('Error', 'Failed to update soul details');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
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
            <Text style={styles.headerTitle}>Soul Details</Text>
            <View style={styles.placeholderButton} />
          </View>
        </SafeAreaView>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.secondary} />
          <Text style={styles.loadingText}>Loading soul details...</Text>
        </View>
      </View>
    );
  }

  if (!soul) {
    return null;
  }

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
          <Text style={styles.headerTitle}>Soul Details</Text>
          <TouchableOpacity
            style={styles.shareButton}
            onPress={handleShare}
            activeOpacity={0.7}
          >
            <Share2 size={22} color={colors.white} />
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        <View style={styles.avatarContainer}>
          <View style={styles.avatarCircle}>
            <User size={64} color={colors.white} />
          </View>
        </View>

        <Text style={styles.name}>{soul.name}</Text>
        <Text style={styles.dateAdded}>Added on {formatDate(soul.date)}</Text>

        <View style={styles.detailsCard}>
          <TouchableOpacity
            style={styles.editIconButton}
            onPress={handleEditPress}
            activeOpacity={0.7}
          >
            <Edit size={18} color={colors.secondary} />
          </TouchableOpacity>
          {soul.contact && (
            <View style={styles.detailRow}>
              <View style={styles.iconContainer}>
                <Phone size={20} color={colors.secondary} />
              </View>
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>Contact</Text>
                <Text style={styles.detailValue}>{soul.contact}</Text>
              </View>
            </View>
          )}

          {soul.location && (
            <View style={styles.detailRow}>
              <View style={styles.iconContainer}>
                <MapPin size={20} color={colors.secondary} />
              </View>
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>Location</Text>
                <Text style={styles.detailValue}>{soul.location}</Text>
              </View>
            </View>
          )}

          {soul.handedTo && (
            <View style={styles.detailRow}>
              <View style={styles.iconContainer}>
                <UserCheck size={20} color={colors.secondary} />
              </View>
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>Handed To</Text>
                <Text style={styles.detailValue}>{soul.handedTo}</Text>
              </View>
            </View>
          )}

          <View style={styles.detailRow}>
            <View style={styles.iconContainer}>
              <Calendar size={20} color={colors.secondary} />
            </View>
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>Date Won</Text>
              <Text style={styles.detailValue}>{formatDate(soul.date)}</Text>
            </View>
          </View>

          {soul.notes && (
            <View style={[styles.detailRow, styles.notesRow]}>
              <View style={styles.iconContainer}>
                <MessageSquare size={20} color={colors.secondary} />
              </View>
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>Notes</Text>
                <Text style={styles.detailValue}>{soul.notes}</Text>
              </View>
            </View>
          )}
        </View>

        <View style={styles.detailsCard}>
          <View style={styles.activityHeader}>
            <View style={styles.activityHeaderLeft}>
              <ClipboardList size={20} color={colors.secondary} />
              <Text style={styles.activityTitle}>Soul Activity</Text>
            </View>
            <TouchableOpacity
              style={styles.addActivityButton}
              onPress={() => setIsAddActivityModalVisible(true)}
              activeOpacity={0.7}
            >
              <Plus size={20} color={colors.secondary} />
            </TouchableOpacity>
          </View>

          {activitiesQuery.isLoading ? (
            <ActivityIndicator size="small" color={colors.secondary} style={{ marginTop: 16 }} />
          ) : activitiesQuery.data && activitiesQuery.data.length > 0 ? (
            <View style={styles.activitiesList}>
              {activitiesQuery.data.map((activity: Activity) => (
                <View key={activity.id} style={styles.activityItem}>
                  <View style={styles.activityContent}>
                    <Text style={styles.activityTypeText}>
                      {getActivityTypeLabel(activity.activity_type)}
                    </Text>
                    <Text style={styles.activityDateText}>
                      {formatDate(activity.date)}
                    </Text>
                    {activity.remarks && (
                      <Text style={styles.activityRemarks}>{activity.remarks}</Text>
                    )}
                  </View>
                  <TouchableOpacity
                    onPress={() => handleDeleteActivity(activity.id)}
                    style={styles.deleteActivityButton}
                    activeOpacity={0.7}
                  >
                    <Trash2 size={16} color="#EF4444" />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          ) : (
            <Text style={styles.noActivitiesText}>No activities recorded yet</Text>
          )}

          <TouchableOpacity
            style={styles.addActivityTextButton}
            onPress={() => setIsAddActivityModalVisible(true)}
            activeOpacity={0.7}
          >
            <Plus size={18} color={colors.secondary} />
            <Text style={styles.addActivityTextButtonText}>Add Activity</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.shareButtonLarge}
          onPress={handleShare}
          activeOpacity={0.8}
        >
          <Share2 size={20} color={colors.white} />
          <Text style={styles.shareButtonText}>Share Soul Details</Text>
        </TouchableOpacity>
      </ScrollView>

      <Modal
        visible={isEditModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setIsEditModalVisible(false)}
      >
        <SafeAreaView style={styles.modalContainer} edges={['top', 'bottom']}>
          <View style={styles.modalHeader}>
            <TouchableOpacity
              onPress={() => setIsEditModalVisible(false)}
              style={styles.modalCancelButton}
            >
              <Text style={styles.modalCancelText}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Edit Soul Details</Text>
            <TouchableOpacity
              onPress={handleSaveEdit}
              style={styles.modalSaveButton}
              disabled={isSaving}
            >
              {isSaving ? (
                <ActivityIndicator size="small" color={colors.secondary} />
              ) : (
                <Text style={styles.modalSaveText}>Save</Text>
              )}
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Name *</Text>
              <TextInput
                style={styles.input}
                value={editedSoul.name}
                onChangeText={(text) => setEditedSoul({ ...editedSoul, name: text })}
                placeholder="Enter name"
                placeholderTextColor={colors.text.secondary}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Contact</Text>
              <TextInput
                style={styles.input}
                value={editedSoul.contact}
                onChangeText={(text) => setEditedSoul({ ...editedSoul, contact: text })}
                placeholder="Phone or email"
                placeholderTextColor={colors.text.secondary}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Location</Text>
              <TextInput
                style={styles.input}
                value={editedSoul.location}
                onChangeText={(text) => setEditedSoul({ ...editedSoul, location: text })}
                placeholder="Enter location"
                placeholderTextColor={colors.text.secondary}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Handed To</Text>
              <TextInput
                style={styles.input}
                value={editedSoul.handedTo}
                onChangeText={(text) => setEditedSoul({ ...editedSoul, handedTo: text })}
                placeholder="Person or church name"
                placeholderTextColor={colors.text.secondary}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Notes</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={editedSoul.notes}
                onChangeText={(text) => setEditedSoul({ ...editedSoul, notes: text })}
                placeholder="Additional notes"
                placeholderTextColor={colors.text.secondary}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>

      <Modal
        visible={isAddActivityModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsAddActivityModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.activityModalContainer}>
            <SafeAreaView style={styles.activityModalContent} edges={['bottom']}>
              <View style={styles.activityModalHeader}>
                <Text style={styles.activityModalTitle}>Add Activity</Text>
                <TouchableOpacity
                  onPress={() => setIsAddActivityModalVisible(false)}
                  activeOpacity={0.7}
                >
                  <X size={24} color={colors.text.secondary} />
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.activityModalScroll} showsVerticalScrollIndicator={false}>
                <View style={styles.activityForm}>
                  <View style={styles.activityInputGroup}>
                    <Text style={styles.activityLabel}>Activity Type *</Text>
                    <TouchableOpacity
                      style={styles.dropdownButton}
                      onPress={() => setIsActivityDropdownOpen(!isActivityDropdownOpen)}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.dropdownButtonText}>
                        {getActivityTypeLabel(activityType)}
                      </Text>
                      <ChevronDown size={20} color={colors.text.secondary} />
                    </TouchableOpacity>
                    {isActivityDropdownOpen && (
                      <View style={styles.dropdownMenu}>
                        {(['follow_up', 'church_attendance', 'water_baptism', 'holy_ghost_baptism'] as ActivityType[]).map((type) => (
                          <TouchableOpacity
                            key={type}
                            style={styles.dropdownItem}
                            onPress={() => {
                              setActivityType(type);
                              setIsActivityDropdownOpen(false);
                            }}
                            activeOpacity={0.7}
                          >
                            <Text style={styles.dropdownItemText}>
                              {getActivityTypeLabel(type)}
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    )}
                  </View>

                  <View style={styles.activityInputGroup}>
                    <Text style={styles.activityLabel}>Date *</Text>
                    <TextInput
                      style={styles.activityInput}
                      value={activityDate}
                      onChangeText={setActivityDate}
                      placeholder="YYYY-MM-DD"
                      placeholderTextColor={colors.text.secondary}
                    />
                  </View>

                  <View style={styles.activityInputGroup}>
                    <Text style={styles.activityLabel}>Remarks</Text>
                    <TextInput
                      style={[styles.activityInput, styles.activityTextArea]}
                      value={activityRemarks}
                      onChangeText={setActivityRemarks}
                      placeholder="Additional notes or remarks"
                      placeholderTextColor={colors.text.secondary}
                      multiline
                      numberOfLines={4}
                      textAlignVertical="top"
                    />
                  </View>
                </View>
              </ScrollView>

              <TouchableOpacity
                style={styles.activitySubmitButton}
                onPress={handleAddActivity}
                disabled={addActivityMutation.isPending}
                activeOpacity={0.8}
              >
                {addActivityMutation.isPending ? (
                  <ActivityIndicator size="small" color={colors.white} />
                ) : (
                  <Text style={styles.activitySubmitButtonText}>Add Activity</Text>
                )}
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
  shareButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderButton: {
    width: 40,
    height: 40,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    color: colors.text.secondary,
  },
  avatarContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.secondary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  name: {
    fontSize: 28,
    fontWeight: '800' as const,
    color: colors.primary,
    textAlign: 'center' as const,
    marginBottom: 4,
  },
  dateAdded: {
    fontSize: 15,
    color: colors.text.secondary,
    textAlign: 'center' as const,
    marginBottom: 32,
  },
  detailsCard: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 20,
    gap: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
    marginBottom: 24,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 16,
  },
  notesRow: {
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: `${colors.secondary}15`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  detailContent: {
    flex: 1,
    gap: 4,
  },
  detailLabel: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: colors.text.secondary,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.5,
  },
  detailValue: {
    fontSize: 16,
    fontWeight: '500' as const,
    color: colors.primary,
    lineHeight: 22,
  },
  shareButtonLarge: {
    backgroundColor: colors.secondary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 16,
    gap: 12,
    shadowColor: colors.secondary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  shareButtonText: {
    color: colors.white,
    fontSize: 17,
    fontWeight: '700' as const,
  },
  editIconButton: {
    position: 'absolute' as const,
    top: 16,
    right: 16,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: `${colors.secondary}15`,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: colors.white,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  modalCancelButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  modalCancelText: {
    fontSize: 16,
    color: colors.text.secondary,
    fontWeight: '600' as const,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: colors.primary,
  },
  modalSaveButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  modalSaveText: {
    fontSize: 16,
    color: colors.secondary,
    fontWeight: '700' as const,
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: colors.primary,
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: colors.primary,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  textArea: {
    minHeight: 100,
    paddingTop: 14,
  },
  activityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  activityHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  activityTitle: {
    fontSize: 17,
    fontWeight: '700' as const,
    color: colors.primary,
  },
  addActivityButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: `${colors.secondary}15`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activitiesList: {
    gap: 12,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  activityContent: {
    flex: 1,
    gap: 4,
  },
  activityTypeText: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: colors.primary,
  },
  activityDateText: {
    fontSize: 13,
    fontWeight: '500' as const,
    color: colors.text.secondary,
  },
  activityRemarks: {
    fontSize: 14,
    color: colors.text.secondary,
    marginTop: 4,
    lineHeight: 20,
  },
  deleteActivityButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FEE2E2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  noActivitiesText: {
    fontSize: 14,
    color: colors.text.secondary,
    textAlign: 'center' as const,
    paddingVertical: 20,
  },
  dropdownButton: {
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dropdownButtonText: {
    fontSize: 16,
    color: colors.primary,
  },
  dropdownMenu: {
    marginTop: 8,
    backgroundColor: colors.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
  },
  dropdownItem: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  dropdownItemText: {
    fontSize: 16,
    color: colors.primary,
  },
  addActivityTextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.secondary,
    borderStyle: 'dashed',
    marginTop: 12,
  },
  addActivityTextButtonText: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: colors.secondary,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  activityModalContainer: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
    minHeight: '60%',
  },
  activityModalContent: {
    flex: 1,
  },
  activityModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  activityModalTitle: {
    fontSize: 22,
    fontWeight: '700' as const,
    color: colors.primary,
  },
  activityModalScroll: {
    flexGrow: 1,
  },
  activityForm: {
    padding: 20,
    gap: 20,
  },
  activityInputGroup: {
    gap: 8,
  },
  activityLabel: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: colors.primary,
  },
  activityInput: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: colors.text.primary,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  activityTextArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  activitySubmitButton: {
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
  activitySubmitButtonText: {
    color: colors.white,
    fontSize: 17,
    fontWeight: '700' as const,
  },
});
