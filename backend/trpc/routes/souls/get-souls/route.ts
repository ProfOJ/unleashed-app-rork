import { publicProcedure } from "../../../create-context";
import { z } from "zod";

const inputSchema = z.object({
  witnessProfileId: z.string().uuid(),
});

export default publicProcedure
  .input(inputSchema)
  .query(async ({ input, ctx }) => {
    console.log('📖 Fetching souls from database for profile:', input.witnessProfileId);

    try {
      if (!ctx.supabase) {
        throw new Error('Supabase client not available');
      }

      const { data, error } = await ctx.supabase
        .from('souls')
        .select('*')
        .eq('witness_profile_id', input.witnessProfileId)
        .order('date', { ascending: false });

      if (error) {
        console.error('❌ Error fetching souls:', error);
        throw new Error(`Failed to fetch souls: ${error.message}`);
      }

      console.log(`✅ Fetched ${data?.length || 0} souls from database`);

      const souls = (data || []).map((soul) => ({
        id: soul.id,
        witnessProfileId: soul.witness_profile_id,
        name: soul.name,
        contact: soul.contact,
        location: soul.location,
        latitude: soul.latitude,
        longitude: soul.longitude,
        notes: soul.notes,
        handedTo: soul.handed_to,
        date: soul.date,
        createdAt: soul.created_at,
        updatedAt: soul.updated_at,
      }));

      return { souls };
    } catch (err) {
      console.error('❌ Exception fetching souls:', err);
      throw err;
    }
  });
