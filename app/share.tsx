import { colors } from '@/constants/colors';
import { useWitness } from '@/contexts/WitnessContext';
import * as Clipboard from 'expo-clipboard';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { ArrowLeft, Copy, Facebook, Heart, Instagram, MessageCircle } from 'lucide-react-native';
import React, { useState } from 'react';
import { api } from '@/lib/api-client';
import {
  Alert,
  Image,
  Linking,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ShareScreen() {
  const router = useRouter();
  const { userProfile, testimony } = useWitness();
  const [copied, setCopied] = useState(false);

  if (!userProfile) {
    return null;
  }

  const shareText = `🙏 I've been unleashed to Go and Tell!\n\nI'm ${userProfile.name}, ${userProfile.role}.\n\nI'm sharing my witness story about what I've heard, seen, and experienced with Jesus Christ.\n\nJoin the movement: #GoAndTell`;

  const shareUrl = 'https://goandtell.org/witness/' + encodeURIComponent(userProfile.name);

  const handleCopyLink = async () => {
    await Clipboard.setStringAsync(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);

    if (userProfile?.id) {
      try {
        await api.points.awardPoints({
          witnessProfileId: userProfile.id,
          actionType: 'share',
          description: 'Copied share link',
        });
        console.log('Points awarded for copying link');
      } catch (error) {
        console.error('Failed to award points:', error);
      }
    }

    if (Platform.OS !== 'web') {
      Alert.alert('Copied!', 'Link copied to clipboard');
    }
  };

  const handleShareWhatsApp = async () => {
    const message = encodeURIComponent(shareText + '\n\n' + shareUrl);
    const url = `whatsapp://send?text=${message}`;
    
    try {
      await Linking.openURL(url);
      
      if (userProfile?.id) {
        try {
          await api.points.awardPoints({
            witnessProfileId: userProfile.id,
            actionType: 'share',
            description: 'Shared on WhatsApp',
          });
          console.log('Points awarded for WhatsApp share');
        } catch (error) {
          console.error('Failed to award points:', error);
        }
      }
    } catch (error) {
      Alert.alert('Error', 'WhatsApp is not installed on your device');
    }
  };

  const handleShareFacebook = async () => {
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
    
    try {
      await Linking.openURL(url);
      
      if (userProfile?.id) {
        try {
          await api.points.awardPoints({
            witnessProfileId: userProfile.id,
            actionType: 'share',
            description: 'Shared on Facebook',
          });
          console.log('Points awarded for Facebook share');
        } catch (error) {
          console.error('Failed to award points:', error);
        }
      }
    } catch (error) {
      console.error('Error opening Facebook:', error);
    }
  };

  const handleShareInstagram = async () => {
    Alert.alert(
      'Share on Instagram',
      'Take a screenshot of your testimony card and share it on Instagram with #GoAndTell',
      [
        {
          text: 'OK',
          onPress: async () => {
            if (userProfile?.id) {
              try {
                await api.points.awardPoints({
                  witnessProfileId: userProfile.id,
                  actionType: 'share',
                  description: 'Shared on Instagram',
                });
                console.log('Points awarded for Instagram share');
              } catch (error) {
                console.error('Failed to award points:', error);
              }
            }
          },
        },
      ]
    );
  };

  const handleBack = () => {
    router.back();
  };

  return (
    <View style={styles.background}>
      <LinearGradient
        colors={[colors.primary, '#1a3a7a', colors.primary]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={styles.gradient}
      >
        <SafeAreaView style={styles.container} edges={['top']}>
          <TouchableOpacity style={styles.backButton} onPress={handleBack} activeOpacity={0.7}>
            <ArrowLeft size={24} color={colors.white} />
          </TouchableOpacity>

          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.header}>
              <View style={styles.iconContainer}>
                <Heart size={48} color={colors.accent} fill={colors.accent} />
              </View>
              <Text style={styles.title}>You&apos;ve Been Unleashed!</Text>
              <Text style={styles.subtitle}>
                Share your testimony and inspire others{'\n'}to Go and Tell their stories
              </Text>
            </View>

            <View style={styles.card}>
              <View style={styles.cardInner}>
                <View style={styles.cardHeader}>
                  <Text style={styles.cardBrand}>Go and Tell</Text>
                  <Heart size={16} color={colors.accent} fill={colors.accent} />
                </View>

                <View style={styles.profileSection}>
                  {userProfile.photoUri ? (
                    <Image source={{ uri: userProfile.photoUri }} style={styles.profilePhoto} />
                  ) : (
                    <View style={styles.profilePhotoPlaceholder}>
                      <Text style={styles.profileInitial}>{userProfile.name.charAt(0)}</Text>
                    </View>
                  )}
                  <View style={styles.profileInfo}>
                    <Text style={styles.profileName}>{userProfile.name}</Text>
                    <Text style={styles.profileRole}>{userProfile.role}</Text>
                  </View>
                </View>

                <View style={styles.statsRow}>
                  <View style={styles.statBox}>
                    <Text style={styles.statNumber}>{testimony.heard.length}</Text>
                    <Text style={styles.statLabel}>Heard</Text>
                  </View>
                  <View style={styles.statBox}>
                    <Text style={styles.statNumber}>{testimony.seen.length}</Text>
                    <Text style={styles.statLabel}>Seen</Text>
                  </View>
                  <View style={styles.statBox}>
                    <Text style={styles.statNumber}>{testimony.experienced.length}</Text>
                    <Text style={styles.statLabel}>Experienced</Text>
                  </View>
                </View>

                <View style={styles.calloutBox}>
                  <Text style={styles.calloutText}>
                    &quot;I&apos;ve been unleashed to Go and Tell!&quot;
                  </Text>
                </View>

                <View style={styles.assemblyBadge}>
                  <Text style={styles.assemblyText}>
                    {userProfile.assembly} • {userProfile.district}
                  </Text>
                </View>
              </View>
            </View>

            <View style={styles.shareSection}>
              <Text style={styles.shareTitle}>Share Your Story</Text>

              <View style={styles.shareButtons}>
                <TouchableOpacity
                  style={styles.shareButton}
                  onPress={handleShareWhatsApp}
                  activeOpacity={0.7}
                >
                  <View style={[styles.shareIconContainer, { backgroundColor: '#25D366' }]}>
                    <MessageCircle size={24} color={colors.white} />
                  </View>
                  <Text style={styles.shareButtonText}>WhatsApp</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.shareButton}
                  onPress={handleShareInstagram}
                  activeOpacity={0.7}
                >
                  <View style={[styles.shareIconContainer, { backgroundColor: '#E4405F' }]}>
                    <Instagram size={24} color={colors.white} />
                  </View>
                  <Text style={styles.shareButtonText}>Instagram</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.shareButton}
                  onPress={handleShareFacebook}
                  activeOpacity={0.7}
                >
                  <View style={[styles.shareIconContainer, { backgroundColor: '#1877F2' }]}>
                    <Facebook size={24} color={colors.white} />
                  </View>
                  <Text style={styles.shareButtonText}>Facebook</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.shareButton}
                  onPress={handleCopyLink}
                  activeOpacity={0.7}
                >
                  <View style={[styles.shareIconContainer, { backgroundColor: colors.accent }]}>
                    <Copy size={24} color={colors.primary} />
                  </View>
                  <Text style={styles.shareButtonText}>
                    {copied ? 'Copied!' : 'Copy Link'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.hashtag}>
              <Text style={styles.hashtagText}>#GoAndTell</Text>
            </View>

            <View style={styles.bottomSpacer} />
          </ScrollView>
        </SafeAreaView>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    backgroundColor: colors.primary,
  },
  gradient: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  backButton: {
    position: 'absolute',
    top: 60,
    left: 24,
    zIndex: 10,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: `${colors.white}20`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
  },
  header: {
    alignItems: 'center',
    marginTop: 80,
    marginBottom: 32,
  },
  iconContainer: {
    marginBottom: 16,
  },
  title: {
    fontSize: 36,
    fontWeight: '700' as const,
    color: colors.white,
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: `${colors.white}90`,
    textAlign: 'center',
    lineHeight: 24,
  },
  card: {
    borderRadius: 20,
    backgroundColor: colors.white,
    padding: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  cardInner: {
    borderRadius: 16,
    backgroundColor: colors.primary,
    padding: 20,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  cardBrand: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: colors.white,
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 20,
  },
  profilePhoto: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: colors.accent,
  },
  profilePhotoPlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileInitial: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: colors.primary,
  },
  profileInfo: {
    flex: 1,
    gap: 4,
  },
  profileName: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: colors.white,
  },
  profileRole: {
    fontSize: 12,
    color: colors.accent,
    fontWeight: '600' as const,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  statBox: {
    flex: 1,
    backgroundColor: `${colors.white}10`,
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: colors.accent,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 11,
    color: `${colors.white}80`,
    textTransform: 'uppercase',
  },
  calloutBox: {
    backgroundColor: colors.accent,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  calloutText: {
    fontSize: 15,
    fontWeight: '700' as const,
    color: colors.primary,
    textAlign: 'center',
  },
  assemblyBadge: {
    backgroundColor: `${colors.white}10`,
    borderRadius: 8,
    padding: 10,
    alignItems: 'center',
  },
  assemblyText: {
    fontSize: 11,
    color: colors.white,
    fontWeight: '600' as const,
  },
  shareSection: {
    marginTop: 40,
  },
  shareTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: colors.white,
    textAlign: 'center',
    marginBottom: 24,
  },
  shareButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 20,
  },
  shareButton: {
    alignItems: 'center',
    gap: 8,
    width: 80,
  },
  shareIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shareButtonText: {
    fontSize: 12,
    color: colors.white,
    fontWeight: '600' as const,
    textAlign: 'center',
  },
  hashtag: {
    marginTop: 48,
    alignItems: 'center',
  },
  hashtagText: {
    fontSize: 28,
    fontWeight: '700' as const,
    color: colors.accent,
  },
  bottomSpacer: {
    height: 60,
  },
});
