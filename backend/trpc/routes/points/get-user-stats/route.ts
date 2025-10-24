import { z } from 'zod';
import { publicProcedure } from '../../../create-context';

export const getUserStatsProcedure = publicProcedure
  .input(
    z.object({
      witnessProfileId: z.string(),
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
      .eq('witness_profile_id', input.witnessProfileId)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching user stats:', error);
      throw new Error('Failed to fetch user stats');
    }

    if (!data) {
      return {
        witnessProfileId: input.witnessProfileId,
        totalPoints: 0,
        testimoniesCount: 0,
        testimoniesSeenCount: 0,
        testimoniesHeardCount: 0,
        testimoniesExperiencedCount: 0,
        soulsCount: 0,
        sharesCount: 0,
        name: 'Unknown',
        role: '',
        photoUri: null,
      };
    }

    return {
      id: data.id,
      witnessProfileId: data.witness_profile_id,
      totalPoints: data.total_points,
      testimoniesCount: data.testimonies_count,
      testimoniesSeenCount: data.testimonies_seen_count,
      testimoniesHeardCount: data.testimonies_heard_count,
      testimoniesExperiencedCount: data.testimonies_experienced_count,
      soulsCount: data.souls_count,
      sharesCount: data.shares_count,
      name: data.witness_profiles?.name || 'Unknown',
      role: data.witness_profiles?.role || '',
      photoUri: data.witness_profiles?.photo_uri || null,
      createdAt: data.created_at,
    };
  });

export default getUserStatsProcedure;
