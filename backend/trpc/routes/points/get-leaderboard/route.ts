import { z } from 'zod';
import { publicProcedure } from '../../../create-context';

export const getLeaderboardProcedure = publicProcedure
  .input(
    z.object({
      limit: z.number().optional().default(100),
    })
  )
  .query(async ({ input, ctx }) => {
    if (!ctx.supabase) {
      throw new Error('Database is not configured. Please set up Supabase credentials in your .env file.');
    }

    const { data, error } = await ctx.supabase
      .from('user_points')
      .select(`
        *,
        witness_profiles (
          name,
          role,
          photo_uri
        )
      `)
      .order('total_points', { ascending: false })
      .limit(input.limit);

    if (error) {
      console.error('Error fetching leaderboard:', error);
      throw new Error('Failed to fetch leaderboard');
    }

    return data.map((entry: any) => ({
      id: entry.id,
      witnessProfileId: entry.witness_profile_id,
      totalPoints: entry.total_points,
      testimoniesCount: entry.testimonies_count,
      testimoniesSeenCount: entry.testimonies_seen_count,
      testimoniesHeardCount: entry.testimonies_heard_count,
      testimoniesExperiencedCount: entry.testimonies_experienced_count,
      soulsCount: entry.souls_count,
      sharesCount: entry.shares_count,
      name: entry.witness_profiles?.name || 'Unknown',
      role: entry.witness_profiles?.role || '',
      photoUri: entry.witness_profiles?.photo_uri || null,
      createdAt: entry.created_at,
    }));
  });

export default getLeaderboardProcedure;
