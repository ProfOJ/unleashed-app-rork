import { z } from "zod";
import { publicProcedure } from "../../../create-context";

const inputSchema = z.object({
  soulId: z.string(),
  activityType: z.enum(['follow_up', 'church_attendance', 'water_baptism', 'holy_ghost_baptism']),
  date: z.string(),
  remarks: z.string().optional(),
});

export const addActivityProcedure = publicProcedure
  .input(inputSchema)
  .mutation(async ({ input, ctx }) => {
    if (!ctx.supabase) {
      throw new Error('Supabase client not available');
    }

    console.log('💾 Adding activity for soul:', input.soulId);

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
      throw new Error(`Failed to add activity: ${error.message}`);
    }

    console.log('✅ Activity added successfully:', data);
    return data;
  });

export default addActivityProcedure;
