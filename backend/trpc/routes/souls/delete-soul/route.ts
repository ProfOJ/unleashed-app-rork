import { publicProcedure } from "../../../create-context";
import { z } from "zod";

const inputSchema = z.object({
  id: z.string().uuid(),
});

export default publicProcedure
  .input(inputSchema)
  .mutation(async ({ input, ctx }) => {
    console.log('🗑️ Deleting soul from database:', input.id);

    try {
      if (!ctx.supabase) {
        throw new Error('Supabase client not available');
      }

      const { error } = await ctx.supabase
        .from('souls')
        .delete()
        .eq('id', input.id);

      if (error) {
        console.error('❌ Error deleting soul:', error);
        throw new Error(`Failed to delete soul: ${error.message}`);
      }

      console.log('✅ Soul deleted successfully');

      return { success: true };
    } catch (err) {
      console.error('❌ Exception deleting soul:', err);
      throw err;
    }
  });
