import { colors } from '@/constants/colors';
import { api } from '@/lib/api-client';
import { useRouter } from 'expo-router';
import { ArrowLeft, Award, Heart, MessageSquare, Share2, Trophy, User } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type LeaderboardEntry = {
  id: string;
  witnessProfileId: string;
  totalPoints: number;
  testimoniesCount: number;
  testimoniesSeenCount: number;
  testimoniesHeardCount: number;
  testimoniesExperiencedCount: number;
  soulsCount: number;
  sharesCount: number;
  name: string;
  role: string;
  photoUri: string | null;
};

export default function Leaderboard() {
  const router = useRouter();
  const [selectedUser, setSelectedUser] = useState<LeaderboardEntry | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        setIsLoading(true);
        const data = await api.points.getLeaderboard({ limit: 100 });
        setLeaderboard(data);
      } catch (error) {
        console.error('Error fetching leaderboard:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchLeaderboard();
  }, []);

  const handleUserClick = (user: LeaderboardEntry) => {
    setSelectedUser(user);
    setModalVisible(true);
  };

  const getRankColor = (index: number) => {
    if (index === 0) return '#FFD700';
    if (index === 1) return '#C0C0C0';
    if (index === 2) return '#CD7F32';
    return colors.text.secondary;
  };

  const getRankIcon = (index: number) => {
    if (index === 0) return '🥇';
    if (index === 1) return '🥈';
    if (index === 2) return '🥉';
    return `${index + 1}`;
  };

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
          <Text style={styles.headerTitle}>Leaderboard</Text>
          <View style={styles.backButton} />
        </View>
      </SafeAreaView>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.secondary} />
            <Text style={styles.loadingText}>Loading leaderboard...</Text>
          </View>
        ) : leaderboard && leaderboard.length > 0 ? (
          <>
            <View style={styles.heroSection}>
              <Trophy size={48} color={colors.accent} />
              <Text style={styles.heroTitle}>Top Witnesses</Text>
              <Text style={styles.heroSubtitle}>
                Compete with fellow believers in spreading the Gospel
              </Text>
            </View>

            <View style={styles.leaderboardList}>
              {leaderboard.map((entry, index) => (
                <TouchableOpacity
                  key={entry.id}
                  style={[
                    styles.leaderboardCard,
                    index < 3 && styles.topThreeCard,
                  ]}
                  onPress={() => handleUserClick(entry)}
                  activeOpacity={0.7}
                >
                  <View style={styles.rankBadge}>
                    <Text
                      style={[
                        styles.rankText,
                        { color: getRankColor(index) },
                      ]}
                    >
                      {getRankIcon(index)}
                    </Text>
                  </View>

                  <View style={styles.userInfo}>
                    {entry.photoUri ? (
                      <Image
                        source={{ uri: entry.photoUri }}
                        style={styles.userAvatar}
                      />
                    ) : (
                      <View style={styles.userAvatarPlaceholder}>
                        <User size={24} color={colors.white} />
                      </View>
                    )}

                    <View style={styles.userDetails}>
                      <Text style={styles.userName}>{entry.name}</Text>
                      <Text style={styles.userRole}>{entry.role}</Text>
                    </View>
                  </View>

                  <View style={styles.pointsBadge}>
                    <Award size={16} color={colors.accent} />
                    <Text style={styles.pointsText}>{entry.totalPoints}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </>
        ) : (
          <View style={styles.emptyState}>
            <View style={styles.emptyIcon}>
              <Trophy size={48} color={colors.text.secondary} />
            </View>
            <Text style={styles.emptyTitle}>No Data Yet</Text>
            <Text style={styles.emptyText}>
              Start witnessing and adding souls to appear on the leaderboard!
            </Text>
          </View>
        )}
      </ScrollView>

      <Modal
        visible={modalVisible}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity
            style={styles.modalBackdrop}
            activeOpacity={1}
            onPress={() => setModalVisible(false)}
          />
          {selectedUser && (
            <View style={styles.modalContent}>
              <SafeAreaView edges={['bottom']}>
                <View style={styles.modalHeader}>
                  {selectedUser.photoUri ? (
                    <Image
                      source={{ uri: selectedUser.photoUri }}
                      style={styles.modalAvatar}
                    />
                  ) : (
                    <View style={styles.modalAvatarPlaceholder}>
                      <User size={40} color={colors.white} />
                    </View>
                  )}

                  <Text style={styles.modalName}>{selectedUser.name}</Text>
                  <Text style={styles.modalRole}>{selectedUser.role}</Text>

                  <View style={styles.modalPointsBadge}>
                    <Award size={24} color={colors.accent} />
                    <Text style={styles.modalPointsText}>
                      {selectedUser.totalPoints} Points
                    </Text>
                  </View>
                </View>

                <View style={styles.statsGrid}>
                  <View style={styles.statCard}>
                    <View style={styles.statIconContainer}>
                      <MessageSquare size={28} color={colors.secondary} />
                    </View>
                    <Text style={styles.statNumber}>
                      {selectedUser.testimoniesCount}
                    </Text>
                    <Text style={styles.statLabel}>Testimonies</Text>
                  </View>

                  <View style={styles.statCard}>
                    <View style={styles.statIconContainer}>
                      <Heart size={28} color="#EF4444" />
                    </View>
                    <Text style={styles.statNumber}>
                      {selectedUser.soulsCount}
                    </Text>
                    <Text style={styles.statLabel}>Souls</Text>
                  </View>

                  <View style={styles.statCard}>
                    <View style={styles.statIconContainer}>
                      <Share2 size={28} color="#10B981" />
                    </View>
                    <Text style={styles.statNumber}>
                      {selectedUser.sharesCount}
                    </Text>
                    <Text style={styles.statLabel}>Shares</Text>
                  </View>
                </View>

                <View style={styles.testimoniesBreakdown}>
                  <Text style={styles.breakdownTitle}>Testimonies Breakdown</Text>
                  <View style={styles.breakdownItem}>
                    <Text style={styles.breakdownLabel}>
                      What I&apos;ve Seen (3 pts)
                    </Text>
                    <Text style={styles.breakdownValue}>
                      {selectedUser.testimoniesSeenCount}
                    </Text>
                  </View>
                  <View style={styles.breakdownItem}>
                    <Text style={styles.breakdownLabel}>
                      What I&apos;ve Heard (2 pts)
                    </Text>
                    <Text style={styles.breakdownValue}>
                      {selectedUser.testimoniesHeardCount}
                    </Text>
                  </View>
                  <View style={styles.breakdownItem}>
                    <Text style={styles.breakdownLabel}>
                      What I&apos;ve Experienced (5 pts)
                    </Text>
                    <Text style={styles.breakdownValue}>
                      {selectedUser.testimoniesExperiencedCount}
                    </Text>
                  </View>
                </View>

                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={() => setModalVisible(false)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.closeButtonText}>Close</Text>
                </TouchableOpacity>
              </SafeAreaView>
            </View>
          )}
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
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  heroSection: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: '800' as const,
    color: colors.primary,
    marginTop: 12,
    marginBottom: 8,
  },
  heroSubtitle: {
    fontSize: 15,
    color: colors.text.secondary,
    textAlign: 'center' as const,
    lineHeight: 22,
  },
  loadingContainer: {
    backgroundColor: colors.white,
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
  leaderboardList: {
    gap: 12,
  },
  leaderboardCard: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  topThreeCard: {
    borderWidth: 2,
    borderColor: colors.accent,
  },
  rankBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rankText: {
    fontSize: 18,
    fontWeight: '700' as const,
  },
  userInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  userAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: colors.accent,
  },
  userAvatarPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: colors.primary,
    marginBottom: 2,
  },
  userRole: {
    fontSize: 13,
    color: colors.text.secondary,
    fontWeight: '500' as const,
  },
  pointsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: `${colors.accent}30`,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
  },
  pointsText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: colors.secondary,
  },
  emptyState: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 40,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  emptyIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: colors.primary,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 15,
    color: colors.text.secondary,
    textAlign: 'center' as const,
    lineHeight: 22,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalBackdrop: {
    position: 'absolute' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  modalContent: {
    backgroundColor: colors.white,
    borderRadius: 24,
    width: '100%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 10,
  },
  modalHeader: {
    alignItems: 'center',
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  modalAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: colors.accent,
    marginBottom: 12,
  },
  modalAvatarPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  modalName: {
    fontSize: 22,
    fontWeight: '800' as const,
    color: colors.primary,
    marginBottom: 4,
  },
  modalRole: {
    fontSize: 15,
    color: colors.text.secondary,
    fontWeight: '500' as const,
    marginBottom: 16,
  },
  modalPointsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: `${colors.accent}30`,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  modalPointsText: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: colors.secondary,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
    padding: 20,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    gap: 8,
  },
  statIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '800' as const,
    color: colors.primary,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: colors.text.secondary,
    textAlign: 'center' as const,
  },
  testimoniesBreakdown: {
    padding: 20,
    paddingTop: 0,
    gap: 12,
  },
  breakdownTitle: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: colors.primary,
    marginBottom: 4,
  },
  breakdownItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
  },
  breakdownLabel: {
    fontSize: 14,
    color: colors.text.secondary,
    fontWeight: '500' as const,
  },
  breakdownValue: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: colors.secondary,
  },
  closeButton: {
    backgroundColor: colors.secondary,
    marginHorizontal: 20,
    marginBottom: 20,
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: colors.secondary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  closeButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '700' as const,
  },
});
