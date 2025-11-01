import { z } from 'zod';
import { publicProcedure } from '../../../create-context';

export const getTestimoniesProcedure = publicProcedure
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
      .from('testimonies')
      .select('*')
      .eq('witness_profile_id', input.witnessProfileId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching testimonies:', error);
      throw new Error('Failed to fetch testimonies');
    }

    return data.map((testimony) => ({
      id: testimony.id,
      witnessProfileId: testimony.witness_profile_id,
      tellOnline: testimony.tell_online,
      tellInPerson: testimony.tell_in_person,
      goWorkplace: testimony.go_workplace,
      goSchool: testimony.go_school,
      goNeighborhood: testimony.go_neighborhood,
      heard: testimony.heard,
      seen: testimony.seen,
      experienced: testimony.experienced,
      createdAt: testimony.created_at,
      updatedAt: testimony.updated_at,
    }));
  });

export default getTestimoniesProcedure;
