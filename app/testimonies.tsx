import { colors } from '@/constants/colors';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as MediaLibrary from 'expo-media-library';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as Clipboard from 'expo-clipboard';
import { ArrowLeft, BookOpen, Hand, MessageSquare, Plus, Share2 } from 'lucide-react-native';
import React, { useRef, useState, useMemo, useEffect, useCallback } from 'react';
import { useWitness } from '@/contexts/WitnessContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { MOCK_TESTIMONIES } from '@/mocks/testimonies';
import {
  ActivityIndicator,
  Alert,
  Animated,
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ViewShot from 'react-native-view-shot';

type Testimony = {
  id: string;
  name: string;
  role: string;
  photoUri: string;
  story: string;
  seen: string[];
  heard: string[];
  experienced: string[];
  claps: number;
  slug: string;
  createdAt: string;
  isLocal?: boolean;
};

export default function Testimonies() {
  const router = useRouter();
  const params = useLocalSearchParams<{ highlightId?: string }>();
  const { userProfile } = useWitness();
  const [sharingId, setSharingId] = useState<string | null>(null);
  const [capturingId, setCapturingId] = useState<string | null>(null);
  const cardRefs = useRef<{ [key: string]: ViewShot | null }>({});
  const [clapAnimations, setClapAnimations] = useState<{ [key: string]: Animated.Value }>({});
  const [clapCounts, setClapCounts] = useState<{ [key: string]: number }>({});
  const [userTestimonies, setUserTestimonies] = useState<Testimony[]>([]);

  const TESTIMONIES_KEY = '@unleashed_testimonies';
  const CLAPS_KEY = '@unleashed_claps';

  const loadUserTestimonies = useCallback(async () => {
    try {
      const stored = await AsyncStorage.getItem(TESTIMONIES_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        const formattedTestimonies: Testimony[] = parsed.map((t: any) => ({
          id: t.id,
          name: userProfile?.name || 'Anonymous',
          role: userProfile?.role || 'Witness',
          photoUri: userProfile?.photoUri || 'https://i.pravatar.cc/150?img=50',
          story: t.enhancedMessage || t.originalMessage,
          seen: t.category === 'seen' ? [t.originalMessage] : [],
          heard: t.category === 'heard' ? [t.originalMessage] : [],
          experienced: t.category === 'experienced' ? [t.originalMessage] : [],
          claps: 0,
          slug: `testimony-${t.id}`,
          createdAt: t.createdAt,
          isLocal: true,
        }));
        setUserTestimonies(formattedTestimonies);
        console.log('Loaded user testimonies:', formattedTestimonies.length);
      }
    } catch (error) {
      console.error('Error loading user testimonies:', error);
    }
  }, [userProfile?.name, userProfile?.role, userProfile?.photoUri]);

  const loadClaps = useCallback(async () => {
    try {
      const stored = await AsyncStorage.getItem(CLAPS_KEY);
      if (stored) {
        setClapCounts(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Error loading claps:', error);
    }
  }, []);

  useEffect(() => {
    loadUserTestimonies();
    loadClaps();
  }, [loadUserTestimonies, loadClaps]);

  const saveClaps = async (claps: { [key: string]: number }) => {
    try {
      await AsyncStorage.setItem(CLAPS_KEY, JSON.stringify(claps));
    } catch (error) {
      console.error('Error saving claps:', error);
    }
  };

  const testimonies = useMemo(() => {
    const combined = [...userTestimonies, ...MOCK_TESTIMONIES];
    console.log('Combined testimonies count:', combined.length);
    console.log('User testimonies count:', userTestimonies.length);
    console.log('Mock testimonies count:', MOCK_TESTIMONIES.length);
    
    return combined.sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return dateB - dateA;
    });
  }, [userTestimonies]);

  useEffect(() => {
    const newAnimations: { [key: string]: Animated.Value } = {};
    testimonies.forEach((t) => {
      if (!clapAnimations[t.id]) {
        newAnimations[t.id] = new Animated.Value(1);
      }
    });
    if (Object.keys(newAnimations).length > 0) {
      setClapAnimations((prev) => ({ ...prev, ...newAnimations }));
    }
  }, [testimonies, clapAnimations]);

  const handleClap = (id: string) => {
    if (!clapAnimations[id]) return;
    
    const newClapCounts = {
      ...clapCounts,
      [id]: (clapCounts[id] || 0) + 1,
    };
    setClapCounts(newClapCounts);
    saveClaps(newClapCounts);
    
    Animated.sequence([
      Animated.timing(clapAnimations[id], {
        toValue: 1.3,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(clapAnimations[id], {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleShare = async (testimony: Testimony) => {
    try {
      console.log('Starting image capture for:', testimony.name);

      const testimonyText = `🙏 Testimony from ${testimony.name}\n\n${testimony.story}\n\nWhat I've Seen:\n${testimony.seen.map(s => `• ${s}`).join('\n')}\n\nWhat I've Heard:\n${testimony.heard.map(h => `• ${h}`).join('\n')}\n\nWhat I've Experienced:\n${testimony.experienced.map(e => `• ${e}`).join('\n')}\n\n#GoAndTell #Unleashed\n\nView more testimonies at: https://unleashed.vercel.app/testimonies`;

      console.log('Copying testimony text to clipboard...');
      await Clipboard.setStringAsync(testimonyText);
      console.log('Text copied to clipboard');

      if (Platform.OS === 'web') {
        console.log('Sharing on web...');
        const shareUrl = `https://unleashed.vercel.app/witness/${testimony.slug}`;
        const shareMessage = `🙏 Check out this testimony from ${testimony.name}\n\n${shareUrl}`;
        if (navigator.share) {
          await navigator.share({
            text: shareMessage,
          });
        } else {
          alert('Message copied to clipboard! Share it on your preferred social media platform.');
        }
        return;
      }

      Alert.alert(
        'Message Copied!',
        'The message has been copied to your clipboard. You can now share the image on your preferred social media platform and paste the copied text as caption or description.',
        [
          {
            text: 'Okay',
            onPress: async () => {
              setSharingId(testimony.id);
              setCapturingId(testimony.id);
              
              try {
                console.log('Capturing card image on mobile...');
                
                await new Promise(resolve => setTimeout(resolve, 500));
                
                const cardRef = cardRefs.current[testimony.id];
                
                if (!cardRef || !cardRef.capture) {
                  console.error('Card ref not found for:', testimony.id);
                  alert('Unable to capture image. Please try again.');
                  setCapturingId(null);
                  setSharingId(null);
                  return;
                }

                console.log('Capturing screenshot...');
                const capturedUri = await cardRef.capture();
                console.log('Captured URI:', capturedUri);
                
                if (!capturedUri) {
                  console.error('URI is empty');
                  alert('Failed to capture image');
                  setCapturingId(null);
                  setSharingId(null);
                  return;
                }

                setCapturingId(null);
                await new Promise(resolve => setTimeout(resolve, 100));

                console.log('Copying to cache directory...');
                const filename = `testimony-${testimony.id}-${Date.now()}.png`;
                const newPath = `${FileSystem.cacheDirectory}${filename}`;
                
                await FileSystem.copyAsync({
                  from: capturedUri,
                  to: newPath
                });
                
                console.log('File copied to:', newPath);

                const fileInfo = await FileSystem.getInfoAsync(newPath);
                console.log('File info:', fileInfo);

                if (!fileInfo.exists) {
                  console.error('File does not exist at:', newPath);
                  alert('Failed to prepare image for sharing');
                  setSharingId(null);
                  return;
                }

                console.log('Saving to gallery...');
                const { status } = await MediaLibrary.requestPermissionsAsync();
                if (status === 'granted') {
                  const asset = await MediaLibrary.createAssetAsync(newPath);
                  await MediaLibrary.createAlbumAsync('Unleashed', asset, false);
                  console.log('Saved to gallery');
                }

                console.log('Checking if sharing is available...');
                const isAvailable = await Sharing.isAvailableAsync();
                
                if (!isAvailable) {
                  alert('Image saved! Testimony text copied to clipboard.');
                  setSharingId(null);
                  return;
                }

                console.log('Sharing image...');
                await Sharing.shareAsync(newPath, {
                  mimeType: 'image/png',
                  dialogTitle: `Testimony from ${testimony.name}`,
                  UTI: 'public.png',
                });
                
                console.log('Share completed');
              } catch (error: any) {
                console.error('Error sharing:', error);
                if (error.message && !error.message.includes('cancelled')) {
                  alert(`Error sharing testimony: ${error.message}`);
                }
              } finally {
                setSharingId(null);
                setCapturingId(null);
              }
            },
          },
        ]
      );
    } catch (error: any) {
      console.error('Error copying to clipboard:', error);
      alert('Failed to copy message. Please try again.');
    }
  };

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
          <Text style={styles.topBarTitle}>Testimonies</Text>
          <View style={styles.backButton} />
        </View>
      </SafeAreaView>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        {testimonies.map((testimony) => (
          <View key={testimony.id}>
            <ViewShot
              ref={(ref: ViewShot | null) => {
                cardRefs.current[testimony.id] = ref;
              }}
              options={{ format: 'png', quality: 1.0 }}
              style={styles.viewShotContainer}
            >
              <View style={styles.card}>
              {capturingId === testimony.id && (
                <View style={styles.cardLogo}>
                  <Image
                    source={{ uri: 'https://pub-e001eb4506b145aa938b5d3badbff6a5.r2.dev/attachments/7b1nz2zi97kww3mmtf3t7' }}
                    style={styles.logoImage}
                    resizeMode="contain"
                  />
                </View>
              )}
              <View style={styles.cardHeader}>
              <Image
                source={{ uri: testimony.photoUri }}
                style={styles.avatar}
              />
              <View style={styles.userInfo}>
                <Text style={styles.userName}>{testimony.name}</Text>
                <Text style={styles.userRole}>{testimony.role}</Text>
              </View>
            </View>

            <Text style={styles.storyText}>{testimony.story}</Text>

            <View style={styles.testimonyDetails}>
              {testimony.seen.length > 0 && (
                <View style={styles.detailSection}>
                  <Text style={styles.detailLabel}>What I&apos;ve Seen</Text>
                  {testimony.seen.slice(0, 2).map((item, idx) => (
                    <Text key={idx} style={styles.detailText}>• {item}</Text>
                  ))}
                </View>
              )}

              {testimony.heard.length > 0 && (
                <View style={styles.detailSection}>
                  <Text style={styles.detailLabel}>What I&apos;ve Heard</Text>
                  {testimony.heard.slice(0, 2).map((item, idx) => (
                    <Text key={idx} style={styles.detailText}>• {item}</Text>
                  ))}
                </View>
              )}

              {testimony.experienced.length > 0 && (
                <View style={styles.detailSection}>
                  <Text style={styles.detailLabel}>What I&apos;ve Experienced</Text>
                  {testimony.experienced.slice(0, 2).map((item, idx) => (
                    <Text key={idx} style={styles.detailText}>• {item}</Text>
                  ))}
                </View>
              )}
            </View>

              {capturingId === testimony.id ? (
                <View style={styles.cardFooter}>
                  <Text style={styles.footerBrand}>Unleashed - #Go and Tell</Text>
                </View>
              ) : (
                <View style={styles.cardActions}>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => handleClap(testimony.id)}
                  activeOpacity={0.7}
                >
                  <Animated.View
                    style={[
                      styles.actionButtonInner,
                      clapAnimations[testimony.id] && {
                        transform: [{ scale: clapAnimations[testimony.id] }],
                      },
                    ]}
                  >
                    <Hand size={20} color={colors.secondary} />
                    <Text style={styles.actionText}>{clapCounts[testimony.id] || testimony.claps}</Text>
                  </Animated.View>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => handleShare(testimony)}
                  activeOpacity={0.7}
                  disabled={sharingId === testimony.id}
                >
                  <View style={styles.actionButtonInner}>
                    {sharingId === testimony.id ? (
                      <ActivityIndicator size="small" color={colors.secondary} />
                    ) : (
                      <>
                        <Share2 size={20} color={colors.secondary} />
                        <Text style={styles.actionText}>Share</Text>
                      </>
                    )}
                  </View>
                </TouchableOpacity>
              </View>
              )}
              </View>
            </ViewShot>
          </View>
        ))}

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Be part of the movement. Share your testimony.
          </Text>
          <TouchableOpacity
            style={styles.ctaButton}
            onPress={() => router.push('/add-testimony')}
            activeOpacity={0.8}
          >
            <Plus size={20} color={colors.white} />
            <Text style={styles.ctaButtonText}>Share Your Story</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <SafeAreaView style={styles.bottomNav} edges={['bottom']}>
        <View style={styles.bottomNavContainer}>
          <TouchableOpacity
            style={styles.navItem}
            onPress={() => router.push('/testimonies')}
            activeOpacity={0.7}
          >
            <MessageSquare size={24} color={colors.secondary} />
            <Text style={[styles.navLabel, styles.navLabelActive]}>Testimonies</Text>
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
  content: {
    padding: 20,
    gap: 16,
    paddingBottom: 100,
  },
  viewShotContainer: {
    backgroundColor: 'transparent',
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
    gap: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 2,
    borderColor: colors.accent,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: colors.primary,
    marginBottom: 2,
  },
  userRole: {
    fontSize: 14,
    color: colors.text.secondary,
    fontWeight: '500' as const,
  },
  storyText: {
    fontSize: 16,
    lineHeight: 24,
    color: colors.text.primary,
    fontWeight: '500' as const,
  },
  testimonyDetails: {
    gap: 12,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 16,
  },
  detailSection: {
    gap: 6,
  },
  detailLabel: {
    fontSize: 13,
    fontWeight: '700' as const,
    color: colors.secondary,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.5,
  },
  detailText: {
    fontSize: 14,
    color: colors.text.primary,
    lineHeight: 20,
    paddingLeft: 4,
  },
  cardActions: {
    flexDirection: 'row',
    gap: 12,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  actionButton: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  actionButtonInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
  },
  actionText: {
    fontSize: 15,
    fontWeight: '700' as const,
    color: colors.secondary,
  },
  footer: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    gap: 16,
    marginTop: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  footerText: {
    fontSize: 16,
    color: colors.text.secondary,
    textAlign: 'center',
    fontWeight: '500' as const,
  },
  ctaButton: {
    backgroundColor: colors.secondary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 12,
    gap: 8,
    shadowColor: colors.secondary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  ctaButtonText: {
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
  navLabelActive: {
    color: colors.secondary,
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
  cardLogo: {
    alignItems: 'center',
    marginBottom: 16,
    paddingTop: 8,
  },
  logoImage: {
    width: 150,
    height: 50,
  },
  cardFooter: {
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    alignItems: 'center',
  },
  footerBrand: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: colors.secondary,
  },
});
