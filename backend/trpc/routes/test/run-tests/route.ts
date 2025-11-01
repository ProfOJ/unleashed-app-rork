import { publicProcedure } from '../../../create-context';

export const runTestsProcedure = publicProcedure
  .mutation(async ({ ctx }) => {
    if (!ctx.supabase) {
      throw new Error('Database is not configured. Please set up Supabase credentials in your .env file.');
    }

    const results: any[] = [];
    let testProfileId: string | null = null;

    try {
      results.push({ step: 'Starting tests', status: 'info' });

      results.push({ step: '1. Testing save profile', status: 'running' });
      const { data: profileData, error: profileError } = await ctx.supabase
        .from('witness_profiles')
        .insert({
          name: 'Test User',
          contact: '+1234567890',
          role: 'Pastor',
          country: 'Test Country',
          district: 'Test District',
          assembly: 'Test Assembly',
        })
        .select()
        .single();

      if (profileError) {
        results.push({ step: '1. Save profile', status: 'error', error: profileError.message });
        throw new Error('Profile creation failed');
      }

      testProfileId = profileData.id;
      results.push({ 
        step: '1. Save profile', 
        status: 'success', 
        data: { id: testProfileId, name: profileData.name } 
      });

      results.push({ step: '2. Testing save testimony', status: 'running' });
      const { data: testimonyData, error: testimonyError } = await ctx.supabase
        .from('testimonies')
        .insert({
          witness_profile_id: testProfileId,
          tell_online: true,
          tell_in_person: false,
          go_workplace: true,
          go_school: false,
          go_neighborhood: true,
          heard: ['Test heard testimony'],
          seen: ['Test seen testimony'],
          experienced: ['Test experienced testimony'],
        })
        .select()
        .single();

      if (testimonyError) {
        results.push({ step: '2. Save testimony', status: 'error', error: testimonyError.message });
        throw new Error('Testimony creation failed');
      }

      results.push({ 
        step: '2. Save testimony', 
        status: 'success', 
        data: { id: testimonyData.id } 
      });

      results.push({ step: '3. Testing save soul', status: 'running' });
      const { data: soulData, error: soulError } = await ctx.supabase
        .from('souls')
        .insert({
          witness_profile_id: testProfileId,
          name: 'Test Soul',
          contact: '+9876543210',
          location: '123 Test Street, Test City, Test Region, Test Country',
          latitude: 40.7128,
          longitude: -74.0060,
          notes: 'Test notes for soul',
          handed_to: 'Test Church',
          date: new Date().toISOString().split('T')[0],
        })
        .select()
        .single();

      if (soulError) {
        results.push({ step: '3. Save soul', status: 'error', error: soulError.message });
        throw new Error('Soul creation failed');
      }

      results.push({ 
        step: '3. Save soul', 
        status: 'success', 
        data: { id: soulData.id, name: soulData.name } 
      });

      results.push({ step: '4. Testing save witness card', status: 'running' });
      const { data: cardData, error: cardError } = await ctx.supabase
        .from('witness_cards')
        .insert({
          witness_profile_id: testProfileId,
          card_data: {
            testimony: 'Test testimony',
            verse: 'John 3:16',
            design: 'modern',
          },
        })
        .select()
        .single();

      if (cardError) {
        results.push({ step: '4. Save witness card', status: 'error', error: cardError.message });
        throw new Error('Witness card creation failed');
      }

      results.push({ 
        step: '4. Save witness card', 
        status: 'success', 
        data: { id: cardData.id } 
      });

      results.push({ step: '5. Testing award points (testimony_seen)', status: 'running' });
      const { data: existingPoints5, error: fetchError5 } = await ctx.supabase
        .from('user_points')
        .select('*')
        .eq('witness_profile_id', testProfileId)
        .single();

      if (!existingPoints5 || fetchError5?.code === 'PGRST116') {
        const { error: insertError5 } = await ctx.supabase
          .from('user_points')
          .insert({
            witness_profile_id: testProfileId,
            total_points: 3,
            testimonies_count: 1,
            testimonies_seen_count: 1,
            testimonies_heard_count: 0,
            testimonies_experienced_count: 0,
            souls_count: 0,
            shares_count: 0,
          });

        if (insertError5) {
          results.push({ step: '5. Award points (testimony_seen)', status: 'error', error: insertError5.message });
          throw new Error('Points initialization failed');
        }
      } else {
        const { error: updateError5 } = await ctx.supabase
          .from('user_points')
          .update({
            total_points: existingPoints5.total_points + 3,
            testimonies_count: existingPoints5.testimonies_count + 1,
            testimonies_seen_count: existingPoints5.testimonies_seen_count + 1,
          })
          .eq('witness_profile_id', testProfileId);

        if (updateError5) {
          results.push({ step: '5. Award points (testimony_seen)', status: 'error', error: updateError5.message });
          throw new Error('Points update failed');
        }
      }

      const { error: transactionError5 } = await ctx.supabase
        .from('point_transactions')
        .insert({
          witness_profile_id: testProfileId,
          action_type: 'testimony_seen',
          points: 3,
          description: 'Test testimony seen points',
        });

      if (transactionError5) {
        results.push({ step: '5. Award points (testimony_seen)', status: 'error', error: transactionError5.message });
      } else {
        results.push({ 
          step: '5. Award points (testimony_seen)', 
          status: 'success', 
          data: { points: 3 } 
        });
      }

      results.push({ step: '6. Testing award points (soul_added)', status: 'running' });
      const { data: existingPoints6, error: fetchError6 } = await ctx.supabase
        .from('user_points')
        .select('*')
        .eq('witness_profile_id', testProfileId)
        .single();

      if (fetchError6) {
        results.push({ step: '6. Award points (soul_added)', status: 'error', error: fetchError6.message });
        throw new Error('Fetch points failed for soul');
      }

      const { error: updateError6 } = await ctx.supabase
        .from('user_points')
        .update({
          total_points: existingPoints6.total_points + 10,
          souls_count: existingPoints6.souls_count + 1,
        })
        .eq('witness_profile_id', testProfileId);

      if (updateError6) {
        results.push({ step: '6. Award points (soul_added)', status: 'error', error: updateError6.message });
        throw new Error('Points update failed for soul');
      }

      const { error: transactionError6 } = await ctx.supabase
        .from('point_transactions')
        .insert({
          witness_profile_id: testProfileId,
          action_type: 'soul_added',
          points: 10,
          description: 'Test soul added points',
        });

      if (transactionError6) {
        results.push({ step: '6. Award points (soul_added)', status: 'error', error: transactionError6.message });
      } else {
        results.push({ 
          step: '6. Award points (soul_added)', 
          status: 'success', 
          data: { points: 10 } 
        });
      }

      results.push({ step: '7. Testing award points (share)', status: 'running' });
      const { data: existingPoints7, error: fetchError7 } = await ctx.supabase
        .from('user_points')
        .select('*')
        .eq('witness_profile_id', testProfileId)
        .single();

      if (fetchError7) {
        results.push({ step: '7. Award points (share)', status: 'error', error: fetchError7.message });
        throw new Error('Fetch points failed for share');
      }

      const { error: updateError7 } = await ctx.supabase
        .from('user_points')
        .update({
          total_points: existingPoints7.total_points + 2,
          shares_count: existingPoints7.shares_count + 1,
        })
        .eq('witness_profile_id', testProfileId);

      if (updateError7) {
        results.push({ step: '7. Award points (share)', status: 'error', error: updateError7.message });
        throw new Error('Points update failed for share');
      }

      const { error: transactionError7 } = await ctx.supabase
        .from('point_transactions')
        .insert({
          witness_profile_id: testProfileId,
          action_type: 'share',
          points: 2,
          description: 'Test share points',
        });

      if (transactionError7) {
        results.push({ step: '7. Award points (share)', status: 'error', error: transactionError7.message });
      } else {
        results.push({ 
          step: '7. Award points (share)', 
          status: 'success', 
          data: { points: 2 } 
        });
      }

      results.push({ step: '8. Testing get user stats', status: 'running' });
      const { data: statsData, error: statsError } = await ctx.supabase
        .from('user_points')
        .select(`
          *,
          witness_profiles (
            name,
            role,
            photo_uri
          )
        `)
        .eq('witness_profile_id', testProfileId)
        .single();

      if (statsError) {
        results.push({ step: '8. Get user stats', status: 'error', error: statsError.message });
        throw new Error('Get user stats failed');
      }

      results.push({ 
        step: '8. Get user stats', 
        status: 'success', 
        data: { 
          totalPoints: statsData.total_points,
          testimoniesCount: statsData.testimonies_count,
          soulsCount: statsData.souls_count,
          sharesCount: statsData.shares_count
        } 
      });

      results.push({ step: '9. Testing get leaderboard', status: 'running' });
      const { data: leaderboardData, error: leaderboardError } = await ctx.supabase
        .from('user_points')
        .select(`
          *,
          witness_profiles (
            name,
            role,
            photo_uri
          )
        `)
        .order('total_points', { ascending: false })
        .limit(10);

      if (leaderboardError) {
        results.push({ step: '9. Get leaderboard', status: 'error', error: leaderboardError.message });
        throw new Error('Get leaderboard failed');
      }

      results.push({ 
        step: '9. Get leaderboard', 
        status: 'success', 
        data: { count: leaderboardData.length } 
      });

      results.push({ step: '10. Testing get testimonies', status: 'running' });
      const { data: testimoniesData, error: testimoniesError } = await ctx.supabase
        .from('testimonies')
        .select('*')
        .eq('witness_profile_id', testProfileId);

      if (testimoniesError) {
        results.push({ step: '10. Get testimonies', status: 'error', error: testimoniesError.message });
        throw new Error('Get testimonies failed');
      }

      results.push({ 
        step: '10. Get testimonies', 
        status: 'success', 
        data: { count: testimoniesData.length } 
      });

      results.push({ 
        step: 'All tests completed successfully!', 
        status: 'success',
        summary: {
          profileId: testProfileId,
          totalPoints: statsData.total_points,
          testimoniesCreated: testimoniesData.length,
          soulsAdded: 1,
          witnessCardsCreated: 1,
        }
      });

      return {
        success: true,
        results,
        testProfileId,
      };
    } catch (error: any) {
      results.push({ 
        step: 'Test failed', 
        status: 'error', 
        error: error.message 
      });
      
      return {
        success: false,
        results,
        testProfileId,
        error: error.message,
      };
    }
  });

export default runTestsProcedure;
