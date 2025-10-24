import { colors } from '@/constants/colors';
import { useWitness } from '@/contexts/WitnessContext';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { ArrowLeft, Heart, Sparkles } from 'lucide-react-native';
import React from 'react';
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function SummaryScreen() {
  const router = useRouter();
  const { userProfile, testimony } = useWitness();
  const [loading, setLoading] = React.useState(false);

  if (!userProfile) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  const handleGenerateCard = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      router.push('/witness-card' as any);
    }, 800);
  };

  return (
    <View style={styles.background}>
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.topBar}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButtonTop}
            activeOpacity={0.7}
          >
            <ArrowLeft size={24} color={colors.primary} />
          </TouchableOpacity>
          <Text style={styles.topBarTitle}>Your Witness Story</Text>
          <View style={styles.backButtonTop} />
        </View>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <Text style={styles.subtitle}>
              Review your testimony before sharing{'\n'}with the world
            </Text>
          </View>

          <View style={styles.card}>
            <LinearGradient
              colors={[colors.primary, '#1a3a7a']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.cardGradient}
            >
              <View style={styles.cardHeader}>
                <Text style={styles.cardBrand}>Go and Tell</Text>
                <Heart size={20} color={colors.accent} fill={colors.accent} />
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
                  <Text style={styles.profileChurch}>
                    {userProfile.assembly}, {userProfile.district}
                  </Text>
                </View>
              </View>

              <View style={styles.divider} />

              <View style={styles.testimonySection}>
                <View style={styles.testimonyBlock}>
                  <Text style={styles.testimonyLabel}>What I&apos;ve Heard</Text>
                  {testimony.heard.slice(0, 2).map((item, index) => (
                    <Text key={index} style={styles.testimonyText}>
                      • {item}
                    </Text>
                  ))}
                  {testimony.heard.length > 2 && (
                    <Text style={styles.testimonyMore}>
                      +{testimony.heard.length - 2} more
                    </Text>
                  )}
                </View>

                <View style={styles.testimonyBlock}>
                  <Text style={styles.testimonyLabel}>What I&apos;ve Seen</Text>
                  {testimony.seen.slice(0, 2).map((item, index) => (
                    <Text key={index} style={styles.testimonyText}>
                      • {item}
                    </Text>
                  ))}
                  {testimony.seen.length > 2 && (
                    <Text style={styles.testimonyMore}>
                      +{testimony.seen.length - 2} more
                    </Text>
                  )}
                </View>

                <View style={styles.testimonyBlock}>
                  <Text style={styles.testimonyLabel}>What I&apos;ve Experienced</Text>
                  {testimony.experienced.slice(0, 2).map((item, index) => (
                    <Text key={index} style={styles.testimonyText}>
                      • {item}
                    </Text>
                  ))}
                  {testimony.experienced.length > 2 && (
                    <Text style={styles.testimonyMore}>
                      +{testimony.experienced.length - 2} more
                    </Text>
                  )}
                </View>
              </View>

              <View style={styles.cardFooter}>
                <Text style={styles.cardFooterText}>
                  &quot;We have been unleashed to Go and Tell!&quot;
                </Text>
              </View>
            </LinearGradient>
          </View>

          <TouchableOpacity
            style={styles.button}
            onPress={handleGenerateCard}
            disabled={loading}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator color={colors.white} />
            ) : (
              <>
                <Sparkles size={20} color={colors.white} />
                <Text style={styles.buttonText}>Generate My Testimony Card</Text>
              </>
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
  backButtonTop: {
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
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
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
  card: {
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  cardGradient: {
    padding: 24,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  cardBrand: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: colors.white,
  },
  profileSection: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 20,
  },
  profilePhoto: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: colors.accent,
  },
  profilePhotoPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: colors.accent,
  },
  profileInitial: {
    fontSize: 32,
    fontWeight: '700' as const,
    color: colors.primary,
  },
  profileInfo: {
    flex: 1,
    justifyContent: 'center',
    gap: 4,
  },
  profileName: {
    fontSize: 22,
    fontWeight: '700' as const,
    color: colors.white,
  },
  profileRole: {
    fontSize: 14,
    color: colors.accent,
    fontWeight: '600' as const,
  },
  profileChurch: {
    fontSize: 12,
    color: `${colors.white}90`,
  },
  divider: {
    height: 1,
    backgroundColor: `${colors.white}30`,
    marginVertical: 20,
  },
  testimonySection: {
    gap: 16,
  },
  testimonyBlock: {
    gap: 8,
  },
  testimonyLabel: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: colors.accent,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  testimonyText: {
    fontSize: 14,
    color: colors.white,
    lineHeight: 20,
  },
  testimonyMore: {
    fontSize: 12,
    color: `${colors.white}70`,
    fontStyle: 'italic',
  },
  cardFooter: {
    marginTop: 24,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: `${colors.white}30`,
  },
  cardFooterText: {
    fontSize: 13,
    color: colors.accent,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  button: {
    backgroundColor: colors.secondary,
    borderRadius: 12,
    padding: 18,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
    marginTop: 32,
    shadowColor: colors.secondary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
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
