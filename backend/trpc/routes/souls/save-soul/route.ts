import { publicProcedure } from "../../../create-context";
import { z } from "zod";

const inputSchema = z.object({
  witnessProfileId: z.string().uuid(),
  name: z.string().min(1),
  contact: z.string().optional(),
  location: z.string().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  notes: z.string().optional(),
  handedTo: z.string().optional(),
  date: z.string(),
});

export default publicProcedure
  .input(inputSchema)
  .mutation(async ({ input, ctx }) => {
    console.log('💾 Saving soul to database:', input);

    try {
      if (!ctx.supabase) {
        throw new Error('Supabase client not available');
      }

      const { data, error } = await ctx.supabase
        .from('souls')
        .insert({
          witness_profile_id: input.witnessProfileId,
          name: input.name,
          contact: input.contact || null,
          location: input.location || null,
          latitude: input.latitude || null,
          longitude: input.longitude || null,
          notes: input.notes || null,
          handed_to: input.handedTo || null,
          date: input.date,
        })
        .select()
        .single();

      if (error) {
        console.error('❌ Error saving soul to database:', error);
        throw new Error(`Failed to save soul: ${error.message}`);
      }

      console.log('✅ Soul saved successfully:', data);

      return {
        success: true,
        soul: {
          id: data.id,
          witnessProfileId: data.witness_profile_id,
          name: data.name,
          contact: data.contact,
          location: data.location,
          latitude: data.latitude,
          longitude: data.longitude,
          notes: data.notes,
          handedTo: data.handed_to,
          date: data.date,
          createdAt: data.created_at,
          updatedAt: data.updated_at,
        },
      };
    } catch (err) {
      console.error('❌ Exception saving soul:', err);
      throw err;
    }
  });
