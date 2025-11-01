import { z } from 'zod';
import { publicProcedure } from '../../../create-context';

export const deleteTestimonyProcedure = publicProcedure
  .input(
    z.object({
      id: z.string(),
    })
  )
  .mutation(async ({ input, ctx }) => {
    if (!ctx.supabase) {
      throw new Error('Database is not configured. Please set up Supabase credentials in your .env file.');
    }

    const { error } = await ctx.supabase
      .from('testimonies')
      .delete()
      .eq('id', input.id);

    if (error) {
      console.error('Error deleting testimony:', error);
      throw new Error('Failed to delete testimony');
    }

    return { success: true };
  });

export default deleteTestimonyProcedure;
