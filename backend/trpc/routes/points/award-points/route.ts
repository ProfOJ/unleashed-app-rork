import { z } from 'zod';
import { publicProcedure } from '../../../create-context';

export const awardPointsProcedure = publicProcedure
  .input(
    z.object({
      witnessProfileId: z.string(),
      actionType: z.enum(['testimony_seen', 'testimony_heard', 'testimony_experienced', 'soul_added', 'share']),
      description: z.string().optional(),
    })
  )
  .mutation(async ({ input, ctx }) => {
    if (!ctx.supabase) {
      throw new Error('Database is not configured. Please set up Supabase credentials in your .env file.');
    }

    const pointsMap = {
      testimony_seen: 3,
      testimony_heard: 2,
      testimony_experienced: 5,
      soul_added: 10,
      share: 2,
    };

    const points = pointsMap[input.actionType];

    const { data: existingPoints, error: fetchError } = await ctx.supabase
      .from('user_points')
      .select('*')
      .eq('witness_profile_id', input.witnessProfileId)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') {
      console.error('Error fetching user points:', fetchError);
      throw new Error('Failed to fetch user points');
    }

    if (!existingPoints) {
      const { error: insertError } = await ctx.supabase
        .from('user_points')
        .insert({
          witness_profile_id: input.witnessProfileId,
          total_points: points,
          testimonies_count: input.actionType.startsWith('testimony_') ? 1 : 0,
          testimonies_seen_count: input.actionType === 'testimony_seen' ? 1 : 0,
          testimonies_heard_count: input.actionType === 'testimony_heard' ? 1 : 0,
          testimonies_experienced_count: input.actionType === 'testimony_experienced' ? 1 : 0,
          souls_count: input.actionType === 'soul_added' ? 1 : 0,
          shares_count: input.actionType === 'share' ? 1 : 0,
        });

      if (insertError) {
        console.error('Error inserting user points:', insertError);
        throw new Error('Failed to insert user points');
      }
    } else {
      const updates: any = {
        total_points: existingPoints.total_points + points,
      };

      if (input.actionType === 'testimony_seen') {
        updates.testimonies_count = existingPoints.testimonies_count + 1;
        updates.testimonies_seen_count = existingPoints.testimonies_seen_count + 1;
      } else if (input.actionType === 'testimony_heard') {
        updates.testimonies_count = existingPoints.testimonies_count + 1;
        updates.testimonies_heard_count = existingPoints.testimonies_heard_count + 1;
      } else if (input.actionType === 'testimony_experienced') {
        updates.testimonies_count = existingPoints.testimonies_count + 1;
        updates.testimonies_experienced_count = existingPoints.testimonies_experienced_count + 1;
      } else if (input.actionType === 'soul_added') {
        updates.souls_count = existingPoints.souls_count + 1;
      } else if (input.actionType === 'share') {
        updates.shares_count = existingPoints.shares_count + 1;
      }

      const { error: updateError } = await ctx.supabase
        .from('user_points')
        .update(updates)
        .eq('witness_profile_id', input.witnessProfileId);

      if (updateError) {
        console.error('Error updating user points:', updateError);
        throw new Error('Failed to update user points');
      }
    }

    const { error: transactionError } = await ctx.supabase
      .from('point_transactions')
      .insert({
        witness_profile_id: input.witnessProfileId,
        action_type: input.actionType,
        points: points,
        description: input.description,
      });

    if (transactionError) {
      console.error('Error creating point transaction:', transactionError);
    }

    return { success: true, points };
  });

export default awardPointsProcedure;
