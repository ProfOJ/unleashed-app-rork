import { z } from 'zod';
import { publicProcedure } from '../../../create-context';

export const saveTestimonyProcedure = publicProcedure
  .input(
    z.object({
      witnessProfileId: z.string(),
      tellOnline: z.boolean(),
      tellInPerson: z.boolean(),
      goWorkplace: z.boolean(),
      goSchool: z.boolean(),
      goNeighborhood: z.boolean(),
      heard: z.array(z.string()),
      seen: z.array(z.string()),
      experienced: z.array(z.string()),
    })
  )
  .mutation(async ({ input, ctx }) => {
    if (!ctx.supabase) {
      throw new Error('Database is not configured. Please set up Supabase credentials in your .env file.');
    }

    const { data, error } = await ctx.supabase
      .from('testimonies')
      .insert({
        witness_profile_id: input.witnessProfileId,
        tell_online: input.tellOnline,
        tell_in_person: input.tellInPerson,
        go_workplace: input.goWorkplace,
        go_school: input.goSchool,
        go_neighborhood: input.goNeighborhood,
        heard: input.heard,
        seen: input.seen,
        experienced: input.experienced,
      })
      .select()
      .single();

    if (error) {
      console.error('Error saving testimony:', error);
      throw new Error('Failed to save testimony');
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
    };
  });

export default saveTestimonyProcedure;
