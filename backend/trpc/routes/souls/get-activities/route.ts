import { z } from "zod";
import { publicProcedure } from "../../../create-context";

export default publicProcedure
  .input(z.string())
  .query(async ({ input: soulId, ctx }) => {
    if (!ctx.supabase) {
      throw new Error('Supabase client not available');
    }

    console.log('📋 Fetching activities for soul:', soulId);

    const { data, error } = await ctx.supabase
      .from('soul_activities')
      .select('*')
      .eq('soul_id', soulId)
      .order('date', { ascending: false });

    if (error) {
      console.error('❌ Error fetching activities:', error);
      throw new Error(`Failed to fetch activities: ${error.message}`);
    }

    console.log(`✅ Found ${data?.length || 0} activities for soul ${soulId}`);
    return data || [];
  });
