import { colors } from '@/constants/colors';
import { useWitness } from '@/contexts/WitnessContext';
import { useRouter } from 'expo-router';
import { Heart, Send, Users } from 'lucide-react-native';
import React, { useEffect, useRef } from 'react';
import {
  ActivityIndicator,
  Animated,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function Index() {
  const router = useRouter();
  const { userProfile, isLoading } = useWitness();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    if (!isLoading) {
      if (userProfile?.name) {
        console.log('User profile exists, redirecting to dashboard...');
        router.replace('/dashboard');
      } else {
        console.log('No user profile, showing welcome screen...');
        Animated.parallel([
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(slideAnim, {
            toValue: 0,
            duration: 800,
            useNativeDriver: true,
          }),
        ]).start();
      }
    }
  }, [isLoading, userProfile, router, fadeAnim, slideAnim]);

  const handleGetStarted = () => {
    router.push('/wizard-step1');
  };

  if (isLoading) {
    return (
      <View style={[styles.background, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={colors.white} />
        <Text style={[styles.tagline, { marginTop: 16 }]}>Loading...</Text>
      </View>
    );
  }

  if (userProfile?.name) {
    return null;
  }

  return (
    <View style={styles.background}>
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <Animated.View
          style={[
            styles.content,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <View style={styles.heroSection}>
            <View style={styles.logoContainer}>
              <View style={styles.logoCircle}>
                <Image
                  source={{ uri: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRYpt5LpKnQd6tOq30nWtcdTvb8zmJ-VthfNQ&s' }}
                  style={styles.logoImage}
                  resizeMode="contain"
                />
              </View>
            </View>

            <Text style={styles.mainTitle}>Unleashed</Text>
            <Text style={styles.tagline}>
              To Go and Tell!
            </Text>
          </View>

          <View style={styles.missionSection}> 
            {/* <Text style={styles.missionTitle}>Your Faith. Your Story. Your Mission.</Text> */}
            {/* <Text style={styles.missionText}>
              Share what you&apos;ve heard, seen, and experienced about Jesus Christ — online and in-person.
            </Text> */}

            <View style={styles.featuresContainer}>
              <View style={styles.feature}>
                <View style={styles.featureIconContainer}>
                  <Send size={24} color={colors.primary} />
                </View>
                <View style={styles.featureTextContainer}>
                  <Text style={styles.featureTitle}>Discover Your Testimony</Text>
                  <Text style={styles.featureText}>
                    Guided tools to shape your witness story
                  </Text>
                </View> 
              </View>

              <View style={styles.feature}>
                <View style={styles.featureIconContainer}>
                  <Heart size={24} color={colors.primary} />
                </View>
                <View style={styles.featureTextContainer}>
                  <Text style={styles.featureTitle}>Create Your Witness Card</Text>
                  <Text style={styles.featureText}>
                    A digital identity for your faith journey
                  </Text>
                </View>
              </View>

              <View style={styles.feature}>
                <View style={styles.featureIconContainer}>
                  <Users size={24} color={colors.primary} />
                </View>
                <View style={styles.featureTextContainer}>
                  <Text style={styles.featureTitle}>Share Confidently</Text>
                  <Text style={styles.featureText}>
                    Spread the Gospel across all platforms
                  </Text>
                </View>
              </View>
            </View>
          </View>

          <View style={styles.footer}>
            <TouchableOpacity
              style={styles.button}
              onPress={handleGetStarted}
              activeOpacity={0.8}
            >
              <Text style={styles.buttonText}>Get Started</Text>
            </TouchableOpacity>

            <Text style={styles.footerText}>
              ProfOJ - A Church of Pentecost Youth
            </Text>
          </View>
        </Animated.View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    backgroundColor: colors.primary,
  },
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  heroSection: {
    alignItems: 'center',
    marginTop: 16,
  },
  logoContainer: {
    marginBottom: 12,
  },
  logoCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.accent,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
    borderWidth: 3,
    borderColor: colors.accent,
  },
  logoImage: {
    width: 84,
    height: 84,
    borderRadius: 42,
  },
  mainTitle: {
    fontSize: 42,
    fontWeight: '800' as const,
    color: colors.white,
    marginBottom: 8,
    textAlign: 'center',
  },
  tagline: {
    fontSize: 16,
    color: colors.accent,
    textAlign: 'center',
    fontWeight: '600' as const,
    lineHeight: 22,
  },
  missionSection: {
    backgroundColor: colors.white,
    borderRadius: 24,
    padding: 20,
    shadowColor: colors.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 6,
  },
  missionTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: colors.primary,
    marginBottom: 8,
    textAlign: 'center',
  },
  missionText: {
    fontSize: 15,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 16,
  },
  featuresContainer: {
    gap: 12,
  },
  feature: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 16,
  },
  featureIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: `${colors.accent}30`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureTextContainer: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: colors.primary,
    marginBottom: 4,
  },
  featureText: {
    fontSize: 14,
    color: colors.text.secondary,
    lineHeight: 20,
  },
  footer: {
    gap: 12,
    marginTop: 12,
  },
  button: {
    backgroundColor: colors.accent,
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 20,
    alignItems: 'center',
    shadowColor: colors.accent,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  buttonText: {
    color: colors.primary,
    fontSize: 18,
    fontWeight: '800' as const,
  },
  footerText: {
    fontSize: 14,
    color: colors.accent,
    textAlign: 'center',
    opacity: 0.8,
  },
});
