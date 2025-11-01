import { colors } from '@/constants/colors';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { api } from '@/lib/api-client';
import {
  ArrowLeft,
  Calendar,
  MapPin,
  MessageSquare,
  Phone,
  Share2,
  User,
  UserCheck,
} from 'lucide-react-native';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Platform,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useWitness } from '@/contexts/WitnessContext';

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

export default function SoulDetail() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { userProfile } = useWitness();
  const [soul, setSoul] = useState<Soul | null>(null);
  const [isLoading, setIsLoading] = useState(true);

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

        <TouchableOpacity
          style={styles.shareButtonLarge}
          onPress={handleShare}
          activeOpacity={0.8}
        >
          <Share2 size={20} color={colors.white} />
          <Text style={styles.shareButtonText}>Share Soul Details</Text>
        </TouchableOpacity>
      </ScrollView>
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
});
