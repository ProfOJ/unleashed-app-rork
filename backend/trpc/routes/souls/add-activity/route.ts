import { z } from "zod";
import { publicProcedure } from "../../../create-context";

const inputSchema = z.object({
  soulId: z.string(),
  activityType: z.enum(['follow_up', 'church_attendance', 'water_baptism', 'holy_ghost_baptism']),
  date: z.string(),
  remarks: z.string().optional(),
});

export default publicProcedure
  .input(inputSchema)
  .mutation(async ({ input, ctx }) => {
    if (!ctx.supabase) {
      console.error('❌ Supabase client not available');
      throw new Error('Supabase client not available');
    }

    console.log('💾 Adding activity for soul:', {
      soulId: input.soulId,
      activityType: input.activityType,
      date: input.date,
      remarks: input.remarks,
    });

    try {
      const { data, error } = await ctx.supabase
        .from('soul_activities')
        .insert({
          soul_id: input.soulId,
          activity_type: input.activityType,
          date: input.date,
          remarks: input.remarks || null,
        })
        .select()
        .single();

      if (error) {
        console.error('❌ Error adding activity:', error);
        console.error('❌ Error details:', JSON.stringify(error, null, 2));
        throw new Error(`Failed to add activity: ${error.message}`);
      }

      if (!data) {
        console.error('❌ No data returned from insert');
        throw new Error('No data returned from insert');
      }

      console.log('✅ Activity added successfully:', data);
      return data;
    } catch (err) {
      console.error('❌ Exception during activity insertion:', err);
      throw err;
    }
  });
