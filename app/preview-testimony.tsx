import { colors } from '@/constants/colors';
import { useWitness } from '@/contexts/WitnessContext';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as Clipboard from 'expo-clipboard';
import * as FileSystem from 'expo-file-system';
import * as MediaLibrary from 'expo-media-library';
import * as Sharing from 'expo-sharing';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ArrowLeft, Share2 } from 'lucide-react-native';
import { api } from '@/lib/api-client';
import React, { useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
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

export default function PreviewTestimony() {
  const router = useRouter();
  const params = useLocalSearchParams<{ message: string; originalMessage?: string; category: string; editId?: string }>();
  const { userProfile } = useWitness();
  const [sharing, setSharing] = useState(false);
  const [capturing, setCapturing] = useState(false);
  const [saving, setSaving] = useState(false);
  const cardRef = useRef<ViewShot | null>(null);

  const categoryLabels: { [key: string]: string } = {
    seen: "What I've Seen",
    heard: "What I've Heard",
    experienced: "What I've Experienced",
  };

  const handleDone = async () => {
    if (!userProfile) {
      alert('Please create a profile first');
      router.push('/wizard-step1');
      return;
    }

    setSaving(true);

    try {
      console.log('Saving testimony to Supabase...');

      const TESTIMONIES_KEY = '@unleashed_testimonies';
      const stored = await AsyncStorage.getItem(TESTIMONIES_KEY);
      const testimonies = stored ? JSON.parse(stored) : [];

      if (params.editId) {
        console.log('Updating existing testimony:', params.editId);
        
        try {
          await api.witness.updateTestimony({
            testimonyId: params.editId,
            enhancedMessage: params.message,
            originalMessage: params.originalMessage || params.message,
            category: params.category,
          });
          console.log('✅ Testimony updated in Supabase successfully');
        } catch (error) {
          console.error('❌ Failed to update testimony in Supabase:', error);
        }

        const index = testimonies.findIndex((t: any) => t.id === params.editId);
        if (index !== -1) {
          testimonies[index] = {
            ...testimonies[index],
            enhancedMessage: params.message,
            originalMessage: params.originalMessage || params.message,
            category: params.category,
          };
          console.log('Testimony updated in localStorage');
        }
      } else {
        console.log('Creating new testimony in Supabase...');
        
        if (!userProfile.id) {
          throw new Error('User profile ID is missing');
        }
        
        let savedTestimony;
        try {
          savedTestimony = await api.witness.saveTestimony({
            witnessProfileId: userProfile.id,
            originalMessage: params.originalMessage || params.message,
            enhancedMessage: params.message,
            category: params.category,
            tellOnline: false,
            tellInPerson: false,
            goWorkplace: false,
            goSchool: false,
            goNeighborhood: false,
          });
          console.log('✅ Testimony saved to Supabase successfully:', savedTestimony.id);
        } catch (error) {
          console.error('❌ Failed to save testimony to Supabase:', error);
          throw error;
        }

        const newTestimony = {
          id: savedTestimony?.id || Date.now().toString(),
          createdAt: savedTestimony?.createdAt || new Date().toISOString(),
          enhancedMessage: params.message,
          originalMessage: params.originalMessage || params.message,
          category: params.category,
          tellOnline: false,
          tellInPerson: false,
          goWorkplace: false,
          goSchool: false,
          goNeighborhood: false,
        };
        testimonies.push(newTestimony);
        console.log('Testimony saved to localStorage');

        if (userProfile.id) {
          try {
            const actionType = 
              params.category === 'seen' ? 'testimony_seen' :
              params.category === 'heard' ? 'testimony_heard' :
              'testimony_experienced';

            await api.points.awardPoints({
              witnessProfileId: userProfile.id,
              actionType,
              description: 'Created a new testimony',
            });
            console.log('✅ Points awarded for testimony');
          } catch (error) {
            console.error('❌ Failed to award points:', error);
          }
        }
      }

      await AsyncStorage.setItem(TESTIMONIES_KEY, JSON.stringify(testimonies));
      console.log('✅ All save operations completed successfully');
      router.push('/dashboard');
    } catch (error) {
      console.error('❌ Error saving testimony:', error);
      alert('Failed to save testimony to database. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleShare = async () => {
    try {
      console.log('Starting testimony share...');

      const testimonyText = `🙏 ${userProfile?.name || 'Anonymous'}'s Testimony\n\n${categoryLabels[params.category]}\n\n${params.message}\n\n#NYWC25 | #GoAndTell | #PossessingTheNations | #TellThemShowThem | #ProfOJ | @profoj.tech\n\nView more testimonies at: https://unleashed.vercel.app/testimonies`;

      console.log('Copying testimony text to clipboard...');
      await Clipboard.setStringAsync(testimonyText);

      if (Platform.OS === 'web') {
        console.log('Sharing on web...');
        if (navigator.share) {
          await navigator.share({
            text: testimonyText,
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
              setSharing(true);
              setCapturing(true);

              try {
                console.log('Capturing card image on mobile...');

                await new Promise((resolve) => setTimeout(resolve, 500));

                if (!cardRef.current || !cardRef.current.capture) {
                  console.error('Card ref not found');
                  alert('Unable to capture image. Please try again.');
                  setCapturing(false);
                  setSharing(false);
                  return;
                }

                console.log('Capturing screenshot...');
                const capturedUri = await cardRef.current.capture();
                console.log('Captured URI:', capturedUri);

                if (!capturedUri) {
                  console.error('URI is empty');
                  alert('Failed to capture image');
                  setCapturing(false);
                  setSharing(false);
                  return;
                }

                setCapturing(false);
                await new Promise((resolve) => setTimeout(resolve, 100));

                console.log('Copying to cache directory...');
                const filename = `testimony-${Date.now()}.png`;
                const newPath = `${FileSystem.cacheDirectory}${filename}`;

                await FileSystem.copyAsync({
                  from: capturedUri,
                  to: newPath,
                });

                console.log('File copied to:', newPath);

                const fileInfo = await FileSystem.getInfoAsync(newPath);
                console.log('File info:', fileInfo);

                if (!fileInfo.exists) {
                  console.error('File does not exist at:', newPath);
                  alert('Failed to prepare image for sharing');
                  setSharing(false);
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
                  setSharing(false);
                  return;
                }

                console.log('Sharing image...');
                await Sharing.shareAsync(newPath, {
                  mimeType: 'image/png',
                  dialogTitle: `${userProfile?.name}'s Testimony`,
                  UTI: 'public.png',
                });

                console.log('Share completed');

                if (userProfile?.id) {
                  try {
                    await api.points.awardPoints({
                      witnessProfileId: userProfile.id,
                      actionType: 'share',
                      description: 'Shared testimony',
                    });
                    console.log('Points awarded for sharing');
                  } catch (error) {
                    console.error('Failed to award points for share:', error);
                  }
                }
              } catch (error: any) {
                console.error('Error sharing:', error);
                if (error.message && !error.message.includes('cancelled')) {
                  alert(`Error sharing testimony: ${error.message}`);
                }
              } finally {
                setSharing(false);
                setCapturing(false);
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

  if (!userProfile) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>No profile data found</Text>
      </View>
    );
  }

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
          <Text style={styles.topBarTitle}>Preview Testimony</Text>
          <View style={styles.backButton} />
        </View>
      </SafeAreaView>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        <ViewShot
          ref={cardRef}
          options={{ format: 'png', quality: 1.0 }}
          style={styles.viewShotContainer}
        >
          <View style={styles.captureLogoContainer}>
            <Image
              source={{
                uri: 'https://pub-e001eb4506b145aa938b5d3badbff6a5.r2.dev/attachments/7b1nz2zi97kww3mmtf3t7',
              }}
              style={styles.captureLogoImage}
              resizeMode="contain"
            />
          </View>
          <View style={styles.card}>

            <View style={styles.cardHeader}>
              {userProfile.photoUri && (
                <Image
                  source={{ uri: userProfile.photoUri }}
                  style={styles.avatar}
                />
              )}
              <View style={styles.userInfo}>
                <Text style={styles.userName}>{userProfile.name}</Text>
                <Text style={styles.userRole}>{userProfile.role}</Text>
              </View>
            </View>

            <Text style={styles.storyText}>{params.message}</Text>

            {params.originalMessage && params.originalMessage !== params.message && (
              <View style={styles.testimonyDetails}>
                <View style={styles.detailSection}>
                  <Text style={styles.detailLabel}>{categoryLabels[params.category]}</Text>
                  <Text style={styles.detailText}>{params.originalMessage}</Text>
                </View>
              </View>
            )}

            {capturing ? (
              <View style={styles.cardFooter}>
                <Text style={styles.footerBrand}>Unleashed - #Go and Tell</Text>
              </View>
            ) : (
              <View style={styles.actionArea}>
                <TouchableOpacity
                  style={styles.shareButton}
                  onPress={handleShare}
                  activeOpacity={0.7}
                  disabled={sharing}
                >
                  {sharing ? (
                    <ActivityIndicator size="small" color={colors.secondary} />
                  ) : (
                    <>
                      <Share2 size={20} color={colors.secondary} />
                      <Text style={styles.shareButtonText}>Share</Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            )}
          </View>
        </ViewShot>

        <View style={styles.infoBox}>
          <Text style={styles.infoText}>
            Your testimony will be shared as an image. The text will be copied to your
            clipboard so you can paste it wherever you share the image.
          </Text>
        </View>
      </ScrollView>

      <SafeAreaView style={styles.bottomArea} edges={['bottom']}>
        <TouchableOpacity
          style={[styles.doneButton, saving && styles.doneButtonDisabled]}
          onPress={handleDone}
          activeOpacity={0.8}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator size="small" color={colors.white} />
          ) : (
            <Text style={styles.doneButtonText}>Save & Done</Text>
          )}
        </TouchableOpacity>
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
    gap: 20,
    paddingBottom: 20,
  },
  viewShotContainer: {
    backgroundColor: 'transparent',
    borderRadius: 16,
    overflow: 'hidden',
  },
  captureLogoContainer: {
    alignItems: 'center',
    paddingTop: 20,
    paddingBottom: 12,
    backgroundColor: colors.white,
  },
  captureLogoImage: {
    width: 150,
    height: 50,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: 0,
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
  actionArea: {
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingVertical: 12,
    gap: 8,
  },
  shareButtonText: {
    fontSize: 15,
    fontWeight: '700' as const,
    color: colors.secondary,
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
  infoBox: {
    backgroundColor: `${colors.secondary}10`,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: `${colors.secondary}30`,
  },
  infoText: {
    fontSize: 14,
    color: colors.primary,
    lineHeight: 20,
    textAlign: 'center',
  },
  bottomArea: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  doneButton: {
    backgroundColor: colors.primary,
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  doneButtonText: {
    color: colors.white,
    fontSize: 18,
    fontWeight: '700' as const,
  },
  doneButtonDisabled: {
    opacity: 0.5,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
  },
  errorText: {
    fontSize: 16,
    color: colors.text.secondary,
  },
});
