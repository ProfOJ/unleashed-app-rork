import { z } from "zod";
import { publicProcedure } from "../../../create-context";

export const deleteActivityProcedure = publicProcedure
  .input(z.string())
  .mutation(async ({ input: activityId, ctx }) => {
    if (!ctx.supabase) {
      throw new Error('Supabase client not available');
    }

    console.log('🗑️ Deleting activity:', activityId);

    const { error } = await ctx.supabase
      .from('soul_activities')
      .delete()
      .eq('id', activityId);

    if (error) {
      console.error('❌ Error deleting activity:', error);
      throw new Error(`Failed to delete activity: ${error.message}`);
    }

    console.log('✅ Activity deleted successfully');
    return { success: true };
  });

export default deleteActivityProcedure;
