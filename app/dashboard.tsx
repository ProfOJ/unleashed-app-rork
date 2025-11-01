import { colors } from '@/constants/colors';
import { useWitness } from '@/contexts/WitnessContext';
import { useRouter } from 'expo-router';
import { BookOpen, ChevronRight, Download, Edit2, LogOut, Menu, MessageSquare, Plus, Trash2, User } from 'lucide-react-native';
import React, { useCallback, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { api } from '@/lib/api-client';
import { usePWAInstall } from '@/lib/usePWAInstall';
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Linking,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type Testimony = {
  id: string;
  createdAt: string;
  enhancedMessage: string;
  originalMessage: string;
  category: string;
  tellOnline: boolean;
  tellInPerson: boolean;
  goWorkplace: boolean;
  goSchool: boolean;
  goNeighborhood: boolean;
};

type WitnessCard = {
  id: string;
  createdAt: string;
  enhancedMessage: string;
  originalContent: {
    seen: string[];
    heard: string[];
    experienced: string[];
  };
};

export default function Dashboard() {
  const router = useRouter();
  const { userProfile, reset } = useWitness();
  const { canPromptInstall, promptInstall } = usePWAInstall();
  const [menuVisible, setMenuVisible] = useState(false);
  const [testimonies, setTestimonies] = useState<Testimony[]>([]);
  const [witnessCard, setWitnessCard] = useState<WitnessCard | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [soulsCount, setSoulsCount] = useState(0);

  const TESTIMONIES_KEY = '@unleashed_testimonies';
  const WITNESS_CARD_KEY = '@unleashed_witness_card';

  const loadTestimonies = async () => {
    try {
      setIsLoading(true);
      console.log('Loading testimonies from localStorage...');
      const stored = await AsyncStorage.getItem(TESTIMONIES_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        console.log('Loaded testimonies:', parsed);
        setTestimonies(parsed.reverse());
      } else {
        console.log('No testimonies found in localStorage');
        setTestimonies([]);
      }
    } catch (error) {
      console.error('Error loading testimonies:', error);
      setTestimonies([]);
    } finally {
      setIsLoading(false);
    }
  };

  const loadWitnessCard = async () => {
    try {
      console.log('Loading witness card from localStorage...');
      const stored = await AsyncStorage.getItem(WITNESS_CARD_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        console.log('Loaded witness card:', parsed);
        setWitnessCard(parsed);
      } else {
        console.log('No witness card found in localStorage');
        setWitnessCard(null);
      }
    } catch (error) {
      console.error('Error loading witness card:', error);
      setWitnessCard(null);
    }
  };

  const loadSoulsCount = async () => {
    if (!userProfile?.id) {
      setSoulsCount(0);
      return;
    }

    try {
      console.log('Loading souls count for profile:', userProfile.id);
      const soulsData = await api.witness.getSouls(userProfile.id);
      console.log('Souls loaded:', soulsData.length);
      setSoulsCount(soulsData.length);
    } catch (error) {
      console.error('Error loading souls count:', error);
      setSoulsCount(0);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadTestimonies();
      loadWitnessCard();
      loadSoulsCount();
    }, [userProfile?.id])
  );

  const handleEditTestimony = (id: string) => {
    const testimony = testimonies.find(t => t.id === id);
    if (!testimony) return;

    router.push({
      pathname: '/add-testimony',
      params: {
        editId: id,
        message: testimony.originalMessage,
        category: testimony.category,
      },
    });
  };

  const handleDeleteTestimony = (id: string) => {
    Alert.alert(
      'Delete Testimony',
      'Are you sure you want to delete this testimony?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              console.log('Deleting testimony:', id);
              const filtered = testimonies.filter(t => t.id !== id);
              await AsyncStorage.setItem(TESTIMONIES_KEY, JSON.stringify(filtered));
              setTestimonies(filtered);
              Alert.alert('Success', 'Testimony deleted successfully');
            } catch (error) {
              console.error('Error deleting testimony:', error);
              Alert.alert('Error', 'Failed to delete testimony');
            }
          },
        },
      ]
    );
  };

  const handleEditWitnessCard = () => {
    if (!witnessCard) return;
    router.push('/wizard-step3');
  };

  const handleDeleteWitnessCard = () => {
    Alert.alert(
      'Delete Witness Card',
      'Are you sure you want to delete your witness card?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              console.log('Deleting witness card');
              await AsyncStorage.removeItem(WITNESS_CARD_KEY);
              setWitnessCard(null);
              Alert.alert('Success', 'Witness card deleted successfully');
            } catch (error) {
              console.error('Error deleting witness card:', error);
              Alert.alert('Error', 'Failed to delete witness card');
            }
          },
        },
      ]
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return `Today at ${date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`;
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    }
  };

  const handleSignOut = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out? This will clear all your local data.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            try {
              console.log('Signing out and clearing all data...');
              
              await AsyncStorage.clear();
              
              reset();
              
              setMenuVisible(false);
              
              console.log('All data cleared, redirecting to wizard...');
              setTimeout(() => {
                router.replace('/wizard-step1');
              }, 100);
            } catch (error) {
              console.error('Error during sign out:', error);
              Alert.alert('Error', 'Failed to sign out. Please try again.');
            }
          },
        },
      ]
    );
  };

  const handleInstallApp = async () => {
    if (canPromptInstall) {
      setMenuVisible(false);
      await promptInstall();
    } else {
      Alert.alert(
        'Install App',
        'To install this app, please use your browser\'s "Add to Home Screen" or "Install App" option.',
        [{ text: 'OK' }]
      );
    }
  };

  const getCategoryLabel = (testimony: Testimony) => {
    const labels: { [key: string]: string } = {
      seen: "What I've Seen",
      heard: "What I've Heard",
      experienced: "What I've Experienced",
    };
    return labels[testimony.category] || 'Testimony';
  };

  const getTestimonyContent = (testimony: Testimony) => {
    return testimony.enhancedMessage || testimony.originalMessage;
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.menuButton}
            onPress={() => setMenuVisible(!menuVisible)}
            activeOpacity={0.7}
          >
            <Menu size={24} color={colors.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Unleashed</Text>
          <Image
            source={{ uri: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRYpt5LpKnQd6tOq30nWtcdTvb8zmJ-VthfNQ&s' }}
            style={styles.logo}
            resizeMode="cover"
          />
        </View>
      </SafeAreaView>

      {menuVisible && (
        <View style={styles.menuOverlay}>
          <TouchableOpacity 
            style={styles.menuBackdrop}
            activeOpacity={1}
            onPress={() => setMenuVisible(false)}
          />
          <SafeAreaView style={styles.menuDrawer} edges={['top', 'bottom', 'left']}>
            <View style={styles.menuHeader}>
              <Image
                source={{ uri: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRYpt5LpKnQd6tOq30nWtcdTvb8zmJ-VthfNQ&s' }}
                style={styles.menuLogo}
                resizeMode="cover"
              />
            </View>

            <View style={styles.menuContent}>
              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => {
                  setMenuVisible(false);
                  router.push('/witness-card');
                }}
                activeOpacity={0.7}
              >
                <Text style={styles.menuItemText}>My Witness Card</Text>
                <ChevronRight size={20} color={colors.text.secondary} />
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => {
                  setMenuVisible(false);
                  router.push('/find-church');
                }}
                activeOpacity={0.7}
              >
                <Text style={styles.menuItemText}>My Church</Text>
                <ChevronRight size={20} color={colors.text.secondary} />
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => {
                  setMenuVisible(false);
                  router.push('/souls');
                }}
                activeOpacity={0.7}
              >
                <Text style={styles.menuItemText}>Souls</Text>
                <ChevronRight size={20} color={colors.text.secondary} />
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => {
                  setMenuVisible(false);
                  router.push('/leaderboard');
                }}
                activeOpacity={0.7}
              >
                <Text style={styles.menuItemText}>Leaderboard</Text>
                <ChevronRight size={20} color={colors.text.secondary} />
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => {
                  setMenuVisible(false);
                  router.push('/wizard-step1');
                }}
                activeOpacity={0.7}
              >
                <Text style={styles.menuItemText}>Profile</Text>
                <ChevronRight size={20} color={colors.text.secondary} />
              </TouchableOpacity>
              
              {Platform.OS === 'web' && (
                <TouchableOpacity
                  style={styles.menuItem}
                  onPress={handleInstallApp}
                  activeOpacity={0.7}
                >
                  <View style={styles.installContent}>
                    <Download size={20} color={colors.secondary} />
                    <Text style={[styles.menuItemText, styles.installText]}>Install App</Text>
                  </View>
                </TouchableOpacity>
              )}
              
              <TouchableOpacity
                style={[styles.menuItem, styles.signOutItem]}
                onPress={handleSignOut}
                activeOpacity={0.7}
              >
                <View style={styles.signOutContent}>
                  <LogOut size={20} color="#EF4444" />
                  <Text style={styles.signOutText}>Sign Out</Text>
                </View>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.menuFooter}
              onPress={() => Linking.openURL('https://whatsapp.com/channel/0029Vb3Xrj2C6ZveJl2Rdb3b')}
              activeOpacity={0.7}
            >
              <Text style={styles.menuFooterText}>Built by ProfOJ</Text>
            </TouchableOpacity>
          </SafeAreaView>
        </View>
      )}

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        <View style={styles.contentInner}>
        <View style={styles.profileCard}>
          <TouchableOpacity
            style={styles.editIconButton}
            onPress={() => router.push('/wizard-step1')}
            activeOpacity={0.7}
          >
            <Edit2 size={20} color={colors.secondary} />
          </TouchableOpacity>
          
          <View style={styles.profileHeader}>
            {userProfile?.photoUri ? (
              <Image
                source={{ uri: userProfile.photoUri }}
                style={styles.profileImage}
              />
            ) : (
              <View style={[styles.profileImage, styles.placeholderImage]}>
                <User size={32} color={colors.white} />
              </View>
            )}
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>{userProfile?.name || 'Your Name'}</Text>
              <Text style={styles.profileRole}>{userProfile?.role || 'Your Role'}</Text>
            </View>
          </View>
        </View>

        <View style={styles.analyticsRow}>
          <TouchableOpacity 
            style={styles.analyticsCard}
            onPress={() => router.push('/testimonies')}
            activeOpacity={0.8}
          >
            <View style={styles.analyticsIconContainer}>
              <MessageSquare size={28} color={colors.white} />
            </View>
            <Text style={styles.analyticsNumber}>{testimonies.length}</Text>
            <Text style={styles.analyticsLabel}>Testimonies</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.analyticsCard, styles.analyticsCardSecondary]}
            onPress={() => router.push('/souls')}
            activeOpacity={0.8}
          >
            <View style={[styles.analyticsIconContainer, styles.analyticsIconSecondary]}>
              <User size={28} color={colors.white} />
            </View>
            <Text style={styles.analyticsNumber}>{soulsCount}</Text>
            <Text style={styles.analyticsLabel}>Souls Won</Text>
          </TouchableOpacity>
        </View>

        {witnessCard && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>My Witness Card</Text>
            </View>
            
            <TouchableOpacity 
              style={styles.witnessCardItem}
              onPress={() => router.push('/witness-card')}
              activeOpacity={0.9}
            >
              <View style={styles.witnessCardHeader}>
                <Text style={styles.witnessCardLabel}>Generated Witness Card</Text>
                <View style={styles.witnessCardActions}>
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={(e) => {
                      e.stopPropagation();
                      handleEditWitnessCard();
                    }}
                    activeOpacity={0.7}
                  >
                    <Edit2 size={18} color={colors.secondary} />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={(e) => {
                      e.stopPropagation();
                      handleDeleteWitnessCard();
                    }}
                    activeOpacity={0.7}
                  >
                    <Trash2 size={18} color="#EF4444" />
                  </TouchableOpacity>
                </View>
              </View>
              
              <Text style={styles.witnessCardContent} numberOfLines={3}>
                {witnessCard.enhancedMessage}
              </Text>

              <Text style={styles.witnessCardDate}>
                Created {formatDate(witnessCard.createdAt)}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>My Testimonies</Text>
            {testimonies.length > 0 && (
              <Text style={styles.sectionCount}>{testimonies.length}</Text>
            )}
          </View>
          
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={colors.secondary} />
              <Text style={styles.loadingText}>Loading testimonies...</Text>
            </View>
          ) : testimonies.length > 0 ? (
            <View style={styles.testimoniesList}>
              {testimonies.map((testimony) => (
                <TouchableOpacity 
                  key={testimony.id} 
                  style={styles.testimonyItem}
                  onPress={() => router.push({ pathname: '/testimonies', params: { highlightId: testimony.id } })}
                  activeOpacity={0.9}
                >
                  <View style={styles.testimonyHeader}>
                    <View style={styles.testimonyHeaderLeft}>
                      <Text style={styles.categoryLabel}>{getCategoryLabel(testimony)}</Text>
                      <Text style={styles.dateText}>{formatDate(testimony.createdAt)}</Text>
                    </View>
                    <View style={styles.testimonyActions}>
                      <TouchableOpacity
                        style={styles.actionButton}
                        onPress={(e) => {
                          e.stopPropagation();
                          handleEditTestimony(testimony.id);
                        }}
                        activeOpacity={0.7}
                      >
                        <Edit2 size={18} color={colors.secondary} />
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.actionButton}
                        onPress={(e) => {
                          e.stopPropagation();
                          handleDeleteTestimony(testimony.id);
                        }}
                        activeOpacity={0.7}
                      >
                        <Trash2 size={18} color="#EF4444" />
                      </TouchableOpacity>
                    </View>
                  </View>
                  
                  <Text style={styles.testimonyContent} numberOfLines={3}>
                    {getTestimonyContent(testimony)}
                  </Text>

                  <View style={styles.testimonyFooter}>
                    {testimony.tellOnline && (
                      <View style={styles.tag}>
                        <Text style={styles.tagText}>Online</Text>
                      </View>
                    )}
                    {testimony.tellInPerson && (
                      <View style={styles.tag}>
                        <Text style={styles.tagText}>In Person</Text>
                      </View>
                    )}
                    {testimony.goWorkplace && (
                      <View style={styles.tag}>
                        <Text style={styles.tagText}>Workplace</Text>
                      </View>
                    )}
                    {testimony.goSchool && (
                      <View style={styles.tag}>
                        <Text style={styles.tagText}>School</Text>
                      </View>
                    )}
                    {testimony.goNeighborhood && (
                      <View style={styles.tag}>
                        <Text style={styles.tagText}>Neighborhood</Text>
                      </View>
                    )}
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>No testimonies yet</Text>
              <TouchableOpacity
                style={styles.addButton}
                onPress={() => router.push('/add-testimony')}
                activeOpacity={0.7}
              >
                <Text style={styles.addButtonText}>Add Your First Testimony</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* <TouchableOpacity
          style={styles.shareButton}
          onPress={() => router.push('/witness-card')}
          activeOpacity={0.8}
        >
          <Share2 size={20} color={colors.white} />
          <Text style={styles.shareButtonText}>View & Share My Witness Card</Text>
        </TouchableOpacity> */}
          
        </View>
      </ScrollView>

      <SafeAreaView style={styles.bottomNav} edges={['bottom']}>
        <View style={styles.bottomNavContainer}>
          <TouchableOpacity
            style={styles.navItem}
            onPress={() => router.push('/testimonies')}
            activeOpacity={0.7}
          >
            <MessageSquare size={24} color={colors.primary} />
            <Text style={styles.navLabel}>Testimonies</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.mainNavButton}
            onPress={() => router.push('/add-testimony')}
            activeOpacity={0.8}
          >
            <View style={styles.mainNavButtonInner}>
              <Plus size={28} color={colors.white} strokeWidth={3} />
            </View>
            <Text style={styles.mainNavLabel}>Witness</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.navItem}
            onPress={() => router.push('/guides')}
            activeOpacity={0.7}
          >
            <BookOpen size={24} color={colors.primary} />
            <Text style={styles.navLabel}>Guides</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
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
  menuButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  menuOverlay: {
    position: 'absolute' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
  },
  menuBackdrop: {
    position: 'absolute' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  menuDrawer: {
    position: 'absolute' as const,
    left: 0,
    top: 0,
    bottom: 0,
    width: 280,
    backgroundColor: colors.white,
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 10,
    justifyContent: 'space-between',
  },
  menuHeader: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    alignItems: 'center',
  },
  menuLogo: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  menuContent: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  menuFooter: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    alignItems: 'center',
  },
  menuFooterText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: colors.secondary,
    textDecorationLine: 'underline',
  },
  menuItemText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: colors.primary,
  },
  signOutItem: {
    borderBottomWidth: 0,
    marginTop: 8,
  },
  signOutContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  signOutText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#EF4444',
  },
  installContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  installText: {
    color: colors.secondary,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: colors.primary,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingBottom: 100,
  },
  contentInner: {
    padding: 20,
    gap: 20,
  },
  profileCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  editIconButton: {
    position: 'absolute' as const,
    top: 16,
    right: 16,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    zIndex: 10,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: colors.accent,
  },
  placeholderImage: {
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 22,
    fontWeight: '700' as const,
    color: colors.primary,
    marginBottom: 4,
  },
  profileRole: {
    fontSize: 15,
    color: colors.text.secondary,
    fontWeight: '500' as const,
  },
  section: {
    gap: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: colors.primary,
  },
  sectionCount: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: colors.secondary,
    backgroundColor: `${colors.secondary}15`,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  loadingContainer: {
    backgroundColor: '#FFFFFF',
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
  testimoniesList: {
    gap: 12,
  },
  testimonyItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
    gap: 12,
  },
  testimonyHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  testimonyHeaderLeft: {
    flex: 1,
    gap: 4,
  },
  categoryLabel: {
    fontSize: 15,
    fontWeight: '700' as const,
    color: colors.secondary,
  },
  dateText: {
    fontSize: 13,
    color: colors.text.secondary,
    fontWeight: '500' as const,
  },
  testimonyActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  testimonyContent: {
    fontSize: 15,
    color: colors.text.primary,
    lineHeight: 22,
  },
  testimonyFooter: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    backgroundColor: `${colors.accent}`,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  tagText: {
    fontSize: 11,
    fontWeight: '600' as const,
    color: colors.secondary,
  },
  emptyState: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  emptyText: {
    fontSize: 16,
    color: colors.text.secondary,
    marginBottom: 16,
    textAlign: 'center' as const,
  },
  witnessCardItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 2,
    borderColor: `${colors.secondary}30`,
    shadowColor: colors.secondary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
    gap: 12,
  },
  witnessCardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  witnessCardLabel: {
    fontSize: 15,
    fontWeight: '700' as const,
    color: colors.secondary,
  },
  witnessCardActions: {
    flexDirection: 'row',
    gap: 8,
  },
  witnessCardContent: {
    fontSize: 15,
    color: colors.text.primary,
    lineHeight: 22,
    fontWeight: '500' as const,
  },
  witnessCardDate: {
    fontSize: 13,
    color: colors.text.secondary,
    fontWeight: '500' as const,
  },
  addButton: {
    backgroundColor: colors.accent,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  addButtonText: {
    color: colors.primary,
    fontSize: 15,
    fontWeight: '700' as const,
  },
  shareButton: {
    backgroundColor: colors.secondary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 16,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
    marginTop: 8,
  },
  shareButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '700' as const,
  },
  bottomNav: {
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 8,
  },
  bottomNavContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingTop: 12,
    paddingBottom: 8,
    paddingHorizontal: 20,
  },
  analyticsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  analyticsCard: {
    flex: 1,
    backgroundColor: colors.secondary,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    shadowColor: colors.secondary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
    gap: 8,
  },
  analyticsCardSecondary: {
    backgroundColor: '#10B981',
    shadowColor: '#10B981',
  },
  analyticsIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  analyticsIconSecondary: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  analyticsNumber: {
    fontSize: 32,
    fontWeight: '800' as const,
    color: colors.white,
  },
  analyticsLabel: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: colors.white,
    opacity: 0.95,
  },
  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    flex: 1,
  },
  navLabel: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: colors.text.secondary,
  },
  mainNavButton: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    flex: 1,
    marginTop: -20,
  },
  mainNavButtonInner: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.secondary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  mainNavLabel: {
    fontSize: 12,
    fontWeight: '700' as const,
    color: colors.secondary,
    marginTop: 4,
  },
});
