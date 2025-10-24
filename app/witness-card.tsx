import { colors } from '@/constants/colors';
import { useWitness } from '@/contexts/WitnessContext';
import { useRouter } from 'expo-router';
import { ArrowLeft, Download, Share2, ArrowRight } from 'lucide-react-native';
import React, { useEffect, useRef, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Clipboard from 'expo-clipboard';
import {
  Alert,
  Animated,
  Dimensions,
  Image,
  Platform,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as MediaLibrary from 'expo-media-library';
import ViewShot from 'react-native-view-shot';

const SCREEN_WIDTH = Dimensions.get('window').width;

type Theme = {
  id: string;
  name: string;
  background: string;
  headerBg: string;
  headerText: string;
  sectionBg: string;
  sectionText: string;
  labelColor: string;
  bodyText: string;
};

const themes: Theme[] = [
  {
    id: 'gold',
    name: 'Golden Glory',
    background: '#FFD700',
    headerBg: '#E3342F',
    headerText: '#FFFFFF',
    sectionBg: 'rgba(11, 28, 69, 0.05)',
    sectionText: '#0B1C45',
    labelColor: '#E3342F',
    bodyText: '#0B1C45',
  },
  {
    id: 'navy',
    name: 'Navy Blue',
    background: '#0B1C45',
    headerBg: '#E3342F',
    headerText: '#FFFFFF',
    sectionBg: 'rgba(255, 255, 255, 0.1)',
    sectionText: '#FFFFFF',
    labelColor: '#FFD700',
    bodyText: '#FFFFFF',
  },
  {
    id: 'red',
    name: 'Pentecost Red',
    background: '#E3342F',
    headerBg: '#0B1C45',
    headerText: '#FFFFFF',
    sectionBg: 'rgba(255, 255, 255, 0.15)',
    sectionText: '#FFFFFF',
    labelColor: '#FFD700',
    bodyText: '#FFFFFF',
  },
  {
    id: 'white',
    name: 'Pure White',
    background: '#FFFFFF',
    headerBg: '#E3342F',
    headerText: '#FFFFFF',
    sectionBg: '#F1F5F9',
    sectionText: '#0B1C45',
    labelColor: '#E3342F',
    bodyText: '#0B1C45',
  },
];

type WitnessCardData = {
  id: string;
  createdAt: string;
  enhancedMessage: string;
  originalContent: {
    seen: string[];
    heard: string[];
    experienced: string[];
  };
};

export default function WitnessCard() {
  const router = useRouter();
  const { userProfile } = useWitness();
  const [currentThemeIndex, setCurrentThemeIndex] = useState(0);
  const [hasShared, setHasShared] = useState(false);
  const [witnessCard, setWitnessCard] = useState<WitnessCardData | null>(null);
  const scrollX = useRef(new Animated.Value(0)).current;
  const scrollViewRef = useRef<ScrollView>(null);
  const viewShotRefs = useRef<(ViewShot | null)[]>([]);

  const WITNESS_CARD_KEY = '@unleashed_witness_card';

  useEffect(() => {
    checkSharedStatus();
    loadWitnessCard();
  }, []);

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
      }
    } catch (error) {
      console.error('Error loading witness card:', error);
    }
  };

  const checkSharedStatus = async () => {
    try {
      const shared = await AsyncStorage.getItem('@witness_card_shared');
      if (shared === 'true') {
        setHasShared(true);
      }
    } catch (error) {
      console.error('Failed to check shared status:', error);
    }
  };

  const markAsShared = async () => {
    try {
      await AsyncStorage.setItem('@witness_card_shared', 'true');
      setHasShared(true);
    } catch (error) {
      console.error('Failed to mark as shared:', error);
    }
  };

  const currentTheme = themes[currentThemeIndex];

  const handleSaveImage = async () => {
    try {
      if (Platform.OS === 'web') {
        alert('Image download is not supported on web. Please take a screenshot instead.');
        return;
      }

      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== 'granted') {
        alert('Permission to access media library is required!');
        return;
      }

      const viewShotRef = viewShotRefs.current[currentThemeIndex];
      if (!viewShotRef) {
        alert('Unable to capture image. Please try again.');
        return;
      }

      const uri = await viewShotRef.capture?.();
      if (!uri) {
        alert('Failed to capture image');
        return;
      }

      const asset = await MediaLibrary.createAssetAsync(uri);
      await MediaLibrary.createAlbumAsync('Unleashed', asset, false);

      alert('Witness card saved to gallery!');
    } catch (error) {
      console.error('Error saving image:', error);
      alert('Failed to save image. Please try again.');
    }
  };

  const handleShareImage = async () => {
    try {
      const userSlug = userProfile?.name?.toLowerCase().replace(/\s+/g, '-') || 'witness';
      const shareMessage = `🙏 I've been unleashed to Go and Tell!

I'm ${userProfile?.name}, ${userProfile?.role}

Here's what I have seen, heard and experienced in Christ.

You can share your story too: #GoAndTell

https://unleashed.vercel.app/witness/${userSlug}`;

      if (Platform.OS === 'web') {
        await Clipboard.setStringAsync(shareMessage);
        if (navigator.share) {
          await navigator.share({
            text: shareMessage,
          });
        } else {
          alert('Message copied to clipboard! Share it on your preferred social media platform.');
        }
        return;
      }

      const viewShotRef = viewShotRefs.current[currentThemeIndex];
      if (!viewShotRef) {
        Alert.alert('Error', 'Unable to capture image. Please try again.');
        return;
      }

      const uri = await viewShotRef.capture?.();
      if (!uri) {
        Alert.alert('Error', 'Failed to capture image');
        return;
      }

      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Permission to access media library is required to share the image!');
        return;
      }

      const asset = await MediaLibrary.createAssetAsync(uri);
      await MediaLibrary.createAlbumAsync('Unleashed', asset, false);

      await Clipboard.setStringAsync(shareMessage);

      Alert.alert(
        'Ready to Share! 🎉',
        'The witness card has been saved to your gallery and the message copied to clipboard.\n\nShare the image on your social media and paste the copied text as your caption.',
        [
          {
            text: 'Open Share Menu',
            onPress: async () => {
              try {
                await Share.share({
                  url: uri,
                  message: shareMessage,
                });
                await markAsShared();
              } catch (error: any) {
                if (error.message !== 'User did not share') {
                  console.error('Error sharing:', error);
                }
              }
            },
          },
          {
            text: 'Done',
            onPress: async () => {
              await markAsShared();
            },
            style: 'cancel',
          },
        ]
      );
    } catch (error: any) {
      console.error('Error in share process:', error);
      Alert.alert('Error', 'Failed to prepare share. Please try again.');
    }
  };

  const handleButtonPress = () => {
    if (hasShared) {
      router.push('/dashboard');
    } else {
      handleShareImage();
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
            style={styles.backButton}
            onPress={() => router.back()}
            activeOpacity={0.7}
          >
            <ArrowLeft size={24} color={colors.primary} />
          </TouchableOpacity>
          <Text style={styles.topBarTitle}>My Witness Card</Text>
          <TouchableOpacity
            style={styles.saveButton}
            onPress={handleSaveImage}
            activeOpacity={0.7}
          >
            <Download size={24} color={colors.secondary} />
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      <ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          {
            useNativeDriver: false,
            listener: (event: any) => {
              const offsetX = event.nativeEvent.contentOffset.x;
              const index = Math.round(offsetX / SCREEN_WIDTH);
              setCurrentThemeIndex(index);
            },
          }
        )}
        scrollEventThrottle={16}
      >
        {themes.map((theme, index) => (
          <View key={theme.id} style={[styles.cardContainer, { width: SCREEN_WIDTH }]}>
            {Platform.OS === 'web' ? (
              <View style={styles.viewShotContainer}>
                <View style={[styles.card, { backgroundColor: theme.background }]}>
                <View style={styles.cardHeader}>
                  <Image
                    source={{ uri: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRYpt5LpKnQd6tOq30nWtcdTvb8zmJ-VthfNQ&s' }}
                    style={styles.logo}
                    resizeMode="contain"
                  />
                  <Text style={[styles.logoText, { color: theme.bodyText }]}>UNLEASHED</Text>
                </View>

                <View style={styles.profileSection}>
                  {userProfile.photoUri && (
                    <Image
                      source={{ uri: userProfile.photoUri }}
                      style={styles.profilePhoto}
                    />
                  )}
                  <View style={styles.profileInfo}>
                    <Text style={[styles.profileName, { color: theme.bodyText }]}>
                      {userProfile.name}
                    </Text>
                    <Text style={[styles.profileRole, { color: theme.bodyText, opacity: 0.8 }]}>
                      {userProfile.role}
                    </Text>
                  </View>
                </View>

                {witnessCard?.enhancedMessage && (
                  <View style={[styles.section, { backgroundColor: theme.sectionBg }]}>
                    <Text style={[styles.enhancedMessageText, { color: theme.sectionText }]}>
                      {witnessCard.enhancedMessage}
                    </Text>
                  </View>
                )}

                {witnessCard?.originalContent.seen && witnessCard.originalContent.seen.length > 0 && (
                  <View style={[styles.section, { backgroundColor: theme.sectionBg }]}>
                    <Text style={[styles.sectionLabel, { color: theme.labelColor }]}>
                      What I&apos;ve Seen
                    </Text>
                    {witnessCard.originalContent.seen.slice(0, 2).map((item, idx) => (
                      <Text key={idx} style={[styles.sectionText, { color: theme.sectionText }]}>
                        • {item}
                      </Text>
                    ))}
                  </View>
                )}

                {witnessCard?.originalContent.heard && witnessCard.originalContent.heard.length > 0 && (
                  <View style={[styles.section, { backgroundColor: theme.sectionBg }]}>
                    <Text style={[styles.sectionLabel, { color: theme.labelColor }]}>
                      What I&apos;ve Heard
                    </Text>
                    {witnessCard.originalContent.heard.slice(0, 2).map((item, idx) => (
                      <Text key={idx} style={[styles.sectionText, { color: theme.sectionText }]}>
                        • {item}
                      </Text>
                    ))}
                  </View>
                )}

                {witnessCard?.originalContent.experienced && witnessCard.originalContent.experienced.length > 0 && (
                  <View style={[styles.section, { backgroundColor: theme.sectionBg }]}>
                    <Text style={[styles.sectionLabel, { color: theme.labelColor }]}>
                      What I&apos;ve Experienced
                    </Text>
                    {witnessCard.originalContent.experienced.slice(0, 2).map((item, idx) => (
                      <Text key={idx} style={[styles.sectionText, { color: theme.sectionText }]}>
                        • {item}
                      </Text>
                    ))}
                  </View>
                )}

                <View style={styles.footer}>
                  <Text style={[styles.footerText, { color: theme.bodyText, opacity: 0.7 }]}>
                    Go and Tell the world!
                  </Text>
                </View>
              </View>
            </View>
            ) : (
              <ViewShot
                ref={(ref: ViewShot | null) => {
                  viewShotRefs.current[index] = ref;
                }}
                options={{ format: 'png', quality: 1.0 }}
                style={styles.viewShotContainer}
              >
                <View style={[styles.card, { backgroundColor: theme.background }]}>
                  <View style={styles.cardHeader}>
                    <Image
                      source={{ uri: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRYpt5LpKnQd6tOq30nWtcdTvb8zmJ-VthfNQ&s' }}
                      style={styles.logo}
                      resizeMode="contain"
                    />
                    <Text style={[styles.logoText, { color: theme.bodyText }]}>UNLEASHED</Text>
                  </View>

                  <View style={styles.profileSection}>
                    {userProfile.photoUri && (
                      <Image
                        source={{ uri: userProfile.photoUri }}
                        style={styles.profilePhoto}
                      />
                    )}
                    <View style={styles.profileInfo}>
                      <Text style={[styles.profileName, { color: theme.bodyText }]}>
                        {userProfile.name}
                      </Text>
                      <Text style={[styles.profileRole, { color: theme.bodyText, opacity: 0.8 }]}>
                        {userProfile.role}
                      </Text>
                    </View>
                  </View>

                  {witnessCard?.enhancedMessage && (
                    <View style={[styles.section, { backgroundColor: theme.sectionBg }]}>
                      <Text style={[styles.enhancedMessageText, { color: theme.sectionText }]}>
                        {witnessCard.enhancedMessage}
                      </Text>
                    </View>
                  )}

                  {witnessCard?.originalContent.seen && witnessCard.originalContent.seen.length > 0 && (
                    <View style={[styles.section, { backgroundColor: theme.sectionBg }]}>
                      <Text style={[styles.sectionLabel, { color: theme.labelColor }]}>
                        What I&apos;ve Seen
                      </Text>
                      {witnessCard.originalContent.seen.slice(0, 2).map((item, idx) => (
                        <Text key={idx} style={[styles.sectionText, { color: theme.sectionText }]}>
                          • {item}
                        </Text>
                      ))}
                    </View>
                  )}

                  {witnessCard?.originalContent.heard && witnessCard.originalContent.heard.length > 0 && (
                    <View style={[styles.section, { backgroundColor: theme.sectionBg }]}>
                      <Text style={[styles.sectionLabel, { color: theme.labelColor }]}>
                        What I&apos;ve Heard
                      </Text>
                      {witnessCard.originalContent.heard.slice(0, 2).map((item, idx) => (
                        <Text key={idx} style={[styles.sectionText, { color: theme.sectionText }]}>
                          • {item}
                        </Text>
                      ))}
                    </View>
                  )}

                  {witnessCard?.originalContent.experienced && witnessCard.originalContent.experienced.length > 0 && (
                    <View style={[styles.section, { backgroundColor: theme.sectionBg }]}>
                      <Text style={[styles.sectionLabel, { color: theme.labelColor }]}>
                        What I&apos;ve Experienced
                      </Text>
                      {witnessCard.originalContent.experienced.slice(0, 2).map((item, idx) => (
                        <Text key={idx} style={[styles.sectionText, { color: theme.sectionText }]}>
                          • {item}
                        </Text>
                      ))}
                    </View>
                  )}

                  <View style={styles.footer}>
                    <Text style={[styles.footerText, { color: theme.bodyText, opacity: 0.7 }]}>
                      Go and Tell the world!
                    </Text>
                  </View>
                </View>
              </ViewShot>
            )}
          </View>
        ))}
      </ScrollView>

      <View style={styles.dotsContainer}>
        {themes.map((theme, index) => {
          const opacity = scrollX.interpolate({
            inputRange: [
              (index - 1) * SCREEN_WIDTH,
              index * SCREEN_WIDTH,
              (index + 1) * SCREEN_WIDTH,
            ],
            outputRange: [0.3, 1, 0.3],
            extrapolate: 'clamp',
          });

          const scale = scrollX.interpolate({
            inputRange: [
              (index - 1) * SCREEN_WIDTH,
              index * SCREEN_WIDTH,
              (index + 1) * SCREEN_WIDTH,
            ],
            outputRange: [0.8, 1.2, 0.8],
            extrapolate: 'clamp',
          });

          return (
            <Animated.View
              key={theme.id}
              style={[
                styles.dot,
                {
                  backgroundColor: theme.background,
                  opacity,
                  transform: [{ scale }],
                },
              ]}
            />
          );
        })}
      </View>

      <View style={styles.themeInfo}>
        <Text style={styles.themeText}>
          Swipe to see different themes • {currentTheme.name}
        </Text>
      </View>

      <SafeAreaView style={styles.bottomArea} edges={['bottom']}>
        <TouchableOpacity
          style={styles.shareButton}
          onPress={handleButtonPress}
          activeOpacity={0.8}
        >
          {hasShared ? (
            <ArrowRight size={20} color={colors.white} />
          ) : (
            <Share2 size={20} color={colors.white} />
          )}
          <Text style={styles.shareButtonText}>
            {hasShared ? 'Go to Dashboard' : 'Share Witness Card'}
          </Text>
        </TouchableOpacity>

        <View style={styles.linksContainer}>
          <TouchableOpacity
            onPress={() => router.push('/')}
            activeOpacity={0.7}
          >
            <Text style={styles.linkText}>Start over</Text>
          </TouchableOpacity>
          <Text style={styles.linkSeparator}>&bull;</Text>
          <TouchableOpacity
            onPress={() => router.push('/dashboard')}
            activeOpacity={0.7}
          >
            <Text style={styles.linkText}>Continue</Text>
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
  saveButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardContainer: {
    padding: 20,
    alignItems: 'center',
  },
  viewShotContainer: {
    backgroundColor: 'transparent',
    borderRadius: 24,
    overflow: 'hidden',
  },
  card: {
    width: SCREEN_WIDTH - 40,
    borderRadius: 24,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  cardHeader: {
    alignItems: 'center',
    marginBottom: 16,
  },
  logo: {
    width: 60,
    height: 60,
    marginBottom: 8,
    borderRadius: 30,
  },
  logoText: {
    fontSize: 20,
    fontWeight: '900' as const,
    letterSpacing: 2,
  },
  titleBanner: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginBottom: 20,
    alignItems: 'center',
  },
  bannerText: {
    fontSize: 18,
    fontWeight: '700' as const,
    textAlign: 'center',
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    gap: 16,
  },
  profilePhoto: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.5)',
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 20,
    fontWeight: '700' as const,
    marginBottom: 4,
  },
  profileRole: {
    fontSize: 13,
    fontWeight: '500' as const,
  },
  section: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: '700' as const,
    marginBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  sectionText: {
    fontSize: 13,
    lineHeight: 20,
    marginBottom: 6,
  },
  enhancedMessageText: {
    fontSize: 15,
    lineHeight: 24,
    fontWeight: '500' as const,
  },
  footer: {
    alignItems: 'center',
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.1)',
  },
  footerText: {
    fontSize: 14,
    fontWeight: '600' as const,
    fontStyle: 'italic',
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
    gap: 8,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  themeInfo: {
    alignItems: 'center',
    marginTop: 12,
    marginBottom: 24,
  },
  themeText: {
    fontSize: 14,
    color: colors.text.secondary,
    fontWeight: '500' as const,
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
  bottomArea: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 20,
    paddingBottom: 8,
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
  },
  shareButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '700' as const,
  },
  linksContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    gap: 12,
  },
  linkText: {
    fontSize: 16,
    color: colors.primary,
    fontWeight: '600' as const,
    textDecorationLine: 'underline',
  },
  linkSeparator: {
    fontSize: 16,
    color: colors.text.secondary,
    fontWeight: '400' as const,
  },
});
