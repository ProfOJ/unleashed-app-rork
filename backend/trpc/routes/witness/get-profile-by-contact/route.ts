import { z } from 'zod';
import { publicProcedure } from '../../../create-context';

export const getProfileByContactProcedure = publicProcedure
  .input(z.object({ contact: z.string() }))
  .query(async ({ input, ctx }) => {
    if (!ctx.supabase) {
      throw new Error('Database is not configured. Please set up Supabase credentials in your .env file.');
    }

    const { data, error } = await ctx.supabase
      .from('witness_profiles')
      .select('*')
      .eq('contact', input.contact)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      console.error('Error fetching profile by contact:', error);
      return null;
    }

    return {
      id: data.id,
      name: data.name,
      contact: data.contact,
      role: data.role,
      photoUri: data.photo_uri,
      country: data.country,
      district: data.district,
      assembly: data.assembly,
    };
  });

export default getProfileByContactProcedure;
