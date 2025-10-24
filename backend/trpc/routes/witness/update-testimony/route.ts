import { z } from 'zod';
import { publicProcedure } from '../../../create-context';

export const updateTestimonyProcedure = publicProcedure
  .input(
    z.object({
      id: z.string(),
      tellOnline: z.boolean().optional(),
      tellInPerson: z.boolean().optional(),
      goWorkplace: z.boolean().optional(),
      goSchool: z.boolean().optional(),
      goNeighborhood: z.boolean().optional(),
      heard: z.array(z.string()).optional(),
      seen: z.array(z.string()).optional(),
      experienced: z.array(z.string()).optional(),
    })
  )
  .mutation(async ({ input, ctx }) => {
    if (!ctx.supabase) {
      throw new Error('Database is not configured. Please set up Supabase credentials in your .env file.');
    }

    const { id, ...updates } = input;

    const updateData: any = {};
    if (updates.tellOnline !== undefined) updateData.tell_online = updates.tellOnline;
    if (updates.tellInPerson !== undefined) updateData.tell_in_person = updates.tellInPerson;
    if (updates.goWorkplace !== undefined) updateData.go_workplace = updates.goWorkplace;
    if (updates.goSchool !== undefined) updateData.go_school = updates.goSchool;
    if (updates.goNeighborhood !== undefined) updateData.go_neighborhood = updates.goNeighborhood;
    if (updates.heard !== undefined) updateData.heard = updates.heard;
    if (updates.seen !== undefined) updateData.seen = updates.seen;
    if (updates.experienced !== undefined) updateData.experienced = updates.experienced;
    updateData.updated_at = new Date().toISOString();

    const { data, error } = await ctx.supabase
      .from('testimonies')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating testimony:', error);
      throw new Error('Failed to update testimony');
    }

    return {
      id: data.id,
      witnessProfileId: data.witness_profile_id,
      tellOnline: data.tell_online,
      tellInPerson: data.tell_in_person,
      goWorkplace: data.go_workplace,
      goSchool: data.go_school,
      goNeighborhood: data.go_neighborhood,
      heard: data.heard,
      seen: data.seen,
      experienced: data.experienced,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  });

export default updateTestimonyProcedure;
