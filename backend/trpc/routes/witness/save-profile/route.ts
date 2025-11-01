import { z } from 'zod';
import { publicProcedure } from '../../../create-context';

export const saveProfileProcedure = publicProcedure
  .input(
    z.object({
      id: z.string().optional(),
      name: z.string(),
      contact: z.string(),
      role: z.string(),
      photoUri: z.string().optional(),
      country: z.string().optional(),
      district: z.string().optional(),
      assembly: z.string().optional(),
    })
  )
  .mutation(async ({ input, ctx }) => {
    if (!ctx.supabase) {
      console.error('Supabase is not configured');
      throw new Error('Database is not configured. Please set up Supabase credentials in your .env file.');
    }

    try {
      let data, error;

      if (input.id) {
        const result = await ctx.supabase
          .from('witness_profiles')
          .update({
            name: input.name,
            contact: input.contact,
            role: input.role,
            photo_uri: input.photoUri,
            country: input.country,
            district: input.district,
            assembly: input.assembly,
          })
          .eq('id', input.id)
          .select()
          .single();
        
        data = result.data;
        error = result.error;
      } else {
        const result = await ctx.supabase
          .from('witness_profiles')
          .insert({
            name: input.name,
            contact: input.contact,
            role: input.role,
            photo_uri: input.photoUri,
            country: input.country,
            district: input.district,
            assembly: input.assembly,
          })
          .select()
          .single();
        
        data = result.data;
        error = result.error;
      }

      if (error) {
        console.error('Error saving profile:', error);
        throw new Error('Failed to save profile: ' + error.message);
      }

      if (!data) {
        throw new Error('No data returned from database');
      }

      return {
        id: data.id,
        name: data.name,
        contact: data.contact,
        role: data.role,
        photoUri: data.photo_uri || '',
        country: data.country || '',
        district: data.district || '',
        assembly: data.assembly || '',
      };
    } catch (error: any) {
      console.error('Error in saveProfile:', error);
      throw new Error(error.message || 'Failed to save profile');
    }
  });

export default saveProfileProcedure;
