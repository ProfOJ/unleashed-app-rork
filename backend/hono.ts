import { Hono } from "hono";
import { cors } from "hono/cors";
import axios from 'axios';
import { supabase } from './lib/supabase';
import { fetchRequestHandler } from '@trpc/server/adapters/fetch';
import { appRouter } from './trpc/app-router';
import { createContext } from './trpc/create-context';

const app = new Hono();

app.use("*", cors());

app.get("/", (c) => {
  return c.json({ status: "ok", message: "API is running" });
});

// tRPC handler
app.all("/api/trpc/*", async (c) => {
  return fetchRequestHandler({
    endpoint: '/api/trpc',
    req: c.req.raw,
    router: appRouter,
    createContext,
  });
});

app.post("/api/witness/save-profile", async (c) => {
  try {
    const body = await c.req.json();
    const { name, contact, role, photoUri, country, district, assembly } = body;

    if (!supabase) {
      console.error('Supabase is not configured');
      return c.json({ error: 'Database is not configured. Please set up Supabase credentials in your .env file.' }, 500);
    }

    const { data, error } = await supabase
      .from('witness_profiles')
      .insert({
        name,
        contact,
        role,
        photo_uri: photoUri,
        country,
        district,
        assembly,
      })
      .select()
      .single();

    if (error) {
      console.error('Error saving profile:', error);
      return c.json({ error: 'Failed to save profile: ' + error.message }, 500);
    }

    if (!data) {
      return c.json({ error: 'No data returned from database' }, 500);
    }

    return c.json({
      id: data.id,
      name: data.name,
      contact: data.contact,
      role: data.role,
      photoUri: data.photo_uri || '',
      country: data.country || '',
      district: data.district || '',
      assembly: data.assembly || '',
    });
  } catch (error: any) {
    console.error('Error in save-profile:', error);
    return c.json({ error: error.message || 'Failed to save profile' }, 500);
  }
});

app.get("/api/witness/get-profile/:id", async (c) => {
  try {
    const witnessProfileId = c.req.param('id');

    if (!supabase) {
      return c.json({ error: 'Database is not configured' }, 500);
    }

    const { data, error } = await supabase
      .from('witness_profiles')
      .select('*')
      .eq('id', witnessProfileId)
      .single();

    if (error) {
      console.error('Error fetching profile:', error);
      return c.json({ error: 'Failed to fetch profile' }, 500);
    }

    return c.json({
      id: data.id,
      name: data.name,
      contact: data.contact,
      role: data.role,
      photoUri: data.photo_uri || '',
      country: data.country || '',
      district: data.district || '',
      assembly: data.assembly || '',
    });
  } catch (error: any) {
    console.error('Error in get-profile:', error);
    return c.json({ error: error.message || 'Failed to fetch profile' }, 500);
  }
});

app.post("/api/witness/save-testimony", async (c) => {
  try {
    const body = await c.req.json();
    const {
      witnessProfileId,
      originalMessage,
      enhancedMessage,
      category,
      tellOnline,
      tellInPerson,
      goWorkplace,
      goSchool,
      goNeighborhood,
    } = body;

    if (!supabase) {
      return c.json({ error: 'Database is not configured' }, 500);
    }

    const { data, error } = await supabase
      .from('testimonies')
      .insert({
        witness_profile_id: witnessProfileId,
        category,
        original_message: originalMessage,
        enhanced_message: enhancedMessage,
        tell_online: tellOnline,
        tell_in_person: tellInPerson,
        go_workplace: goWorkplace,
        go_school: goSchool,
        go_neighborhood: goNeighborhood,
      })
      .select()
      .single();

    if (error) {
      console.error('Error saving testimony:', error);
      return c.json({ error: 'Failed to save testimony: ' + error.message }, 500);
    }

    return c.json({
      id: data.id,
      witnessProfileId: data.witness_profile_id,
      category: data.category,
      originalMessage: data.original_message,
      enhancedMessage: data.enhanced_message,
      tellOnline: data.tell_online,
      tellInPerson: data.tell_in_person,
      goWorkplace: data.go_workplace,
      goSchool: data.go_school,
      goNeighborhood: data.go_neighborhood,
      createdAt: data.created_at,
    });
  } catch (error: any) {
    console.error('Error in save-testimony:', error);
    return c.json({ error: error.message || 'Failed to save testimony' }, 500);
  }
});

app.get("/api/witness/get-testimonies/:witnessProfileId", async (c) => {
  try {
    const witnessProfileId = c.req.param('witnessProfileId');

    if (!supabase) {
      return c.json({ error: 'Database is not configured' }, 500);
    }

    const { data, error } = await supabase
      .from('testimonies')
      .select('*')
      .eq('witness_profile_id', witnessProfileId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching testimonies:', error);
      return c.json({ error: 'Failed to fetch testimonies' }, 500);
    }

    return c.json(data.map((t: any) => ({
      id: t.id,
      witnessProfileId: t.witness_profile_id,
      category: t.category,
      originalMessage: t.original_message,
      enhancedMessage: t.enhanced_message,
      tellOnline: t.tell_online,
      tellInPerson: t.tell_in_person,
      goWorkplace: t.go_workplace,
      goSchool: t.go_school,
      goNeighborhood: t.go_neighborhood,
      createdAt: t.created_at,
    })));
  } catch (error: any) {
    console.error('Error in get-testimonies:', error);
    return c.json({ error: error.message || 'Failed to fetch testimonies' }, 500);
  }
});

app.delete("/api/witness/delete-testimony/:id", async (c) => {
  try {
    const testimonyId = c.req.param('id');

    if (!supabase) {
      return c.json({ error: 'Database is not configured' }, 500);
    }

    const { error } = await supabase
      .from('testimonies')
      .delete()
      .eq('id', testimonyId);

    if (error) {
      console.error('Error deleting testimony:', error);
      return c.json({ error: 'Failed to delete testimony' }, 500);
    }

    return c.json({ success: true });
  } catch (error: any) {
    console.error('Error in delete-testimony:', error);
    return c.json({ error: error.message || 'Failed to delete testimony' }, 500);
  }
});

app.put("/api/witness/update-testimony", async (c) => {
  try {
    const body = await c.req.json();
    const { testimonyId, ...updates } = body;

    if (!supabase) {
      return c.json({ error: 'Database is not configured' }, 500);
    }

    const updateData: any = {};
    if (updates.originalMessage !== undefined) updateData.original_message = updates.originalMessage;
    if (updates.enhancedMessage !== undefined) updateData.enhanced_message = updates.enhancedMessage;
    if (updates.category !== undefined) updateData.category = updates.category;
    if (updates.tellOnline !== undefined) updateData.tell_online = updates.tellOnline;
    if (updates.tellInPerson !== undefined) updateData.tell_in_person = updates.tellInPerson;
    if (updates.goWorkplace !== undefined) updateData.go_workplace = updates.goWorkplace;
    if (updates.goSchool !== undefined) updateData.go_school = updates.goSchool;
    if (updates.goNeighborhood !== undefined) updateData.go_neighborhood = updates.goNeighborhood;

    const { data, error } = await supabase
      .from('testimonies')
      .update(updateData)
      .eq('id', testimonyId)
      .select()
      .single();

    if (error) {
      console.error('Error updating testimony:', error);
      return c.json({ error: 'Failed to update testimony' }, 500);
    }

    return c.json({
      id: data.id,
      witnessProfileId: data.witness_profile_id,
      category: data.category,
      originalMessage: data.original_message,
      enhancedMessage: data.enhanced_message,
      tellOnline: data.tell_online,
      tellInPerson: data.tell_in_person,
      goWorkplace: data.go_workplace,
      goSchool: data.go_school,
      goNeighborhood: data.go_neighborhood,
      createdAt: data.created_at,
    });
  } catch (error: any) {
    console.error('Error in update-testimony:', error);
    return c.json({ error: error.message || 'Failed to update testimony' }, 500);
  }
});

app.post("/api/points/award-points", async (c) => {
  try {
    const body = await c.req.json();
    const { witnessProfileId, actionType, description } = body;

    if (!supabase) {
      return c.json({ error: 'Database is not configured' }, 500);
    }

    const pointsMap: Record<string, number> = {
      'testimony_seen': 3,
      'testimony_heard': 2,
      'testimony_experienced': 5,
      'soul_added': 10,
      'share': 2,
    };

    const points = pointsMap[actionType] || 0;

    const { error: transactionError } = await supabase
      .from('point_transactions')
      .insert({
        witness_profile_id: witnessProfileId,
        action_type: actionType,
        points,
        description,
      });

    if (transactionError) {
      console.error('Error creating point transaction:', transactionError);
      return c.json({ error: 'Failed to record points' }, 500);
    }

    const { data: existing, error: fetchError } = await supabase
      .from('user_points')
      .select('*')
      .eq('witness_profile_id', witnessProfileId)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') {
      console.error('Error fetching user points:', fetchError);
      return c.json({ error: 'Failed to fetch user points' }, 500);
    }

    if (!existing) {
      const { error: insertError } = await supabase
        .from('user_points')
        .insert({
          witness_profile_id: witnessProfileId,
          total_points: points,
          testimonies_count: actionType.startsWith('testimony_') ? 1 : 0,
          testimonies_seen_count: actionType === 'testimony_seen' ? 1 : 0,
          testimonies_heard_count: actionType === 'testimony_heard' ? 1 : 0,
          testimonies_experienced_count: actionType === 'testimony_experienced' ? 1 : 0,
          souls_count: actionType === 'soul_added' ? 1 : 0,
          shares_count: actionType === 'share' ? 1 : 0,
        });

      if (insertError) {
        console.error('Error creating user points:', insertError);
        return c.json({ error: 'Failed to create user points' }, 500);
      }
    } else {
      const updateData: any = {
        total_points: existing.total_points + points,
      };

      if (actionType.startsWith('testimony_')) {
        updateData.testimonies_count = existing.testimonies_count + 1;
        if (actionType === 'testimony_seen') updateData.testimonies_seen_count = existing.testimonies_seen_count + 1;
        if (actionType === 'testimony_heard') updateData.testimonies_heard_count = existing.testimonies_heard_count + 1;
        if (actionType === 'testimony_experienced') updateData.testimonies_experienced_count = existing.testimonies_experienced_count + 1;
      } else if (actionType === 'soul_added') {
        updateData.souls_count = existing.souls_count + 1;
      } else if (actionType === 'share') {
        updateData.shares_count = existing.shares_count + 1;
      }

      const { error: updateError } = await supabase
        .from('user_points')
        .update(updateData)
        .eq('witness_profile_id', witnessProfileId);

      if (updateError) {
        console.error('Error updating user points:', updateError);
        return c.json({ error: 'Failed to update user points' }, 500);
      }
    }

    return c.json({ success: true, points });
  } catch (error: any) {
    console.error('Error in award-points:', error);
    return c.json({ error: error.message || 'Failed to award points' }, 500);
  }
});

app.get("/api/points/leaderboard", async (c) => {
  try {
    const limit = parseInt(c.req.query('limit') || '100');

    if (!supabase) {
      return c.json({ error: 'Database is not configured' }, 500);
    }

    const { data, error } = await supabase
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
      .limit(limit);

    if (error) {
      console.error('Error fetching leaderboard:', error);
      return c.json({ error: 'Failed to fetch leaderboard' }, 500);
    }

    return c.json(data.map((entry: any) => ({
      id: entry.id,
      witnessProfileId: entry.witness_profile_id,
      totalPoints: entry.total_points,
      testimoniesCount: entry.testimonies_count,
      testimoniesSeenCount: entry.testimonies_seen_count,
      testimoniesHeardCount: entry.testimonies_heard_count,
      testimoniesExperiencedCount: entry.testimonies_experienced_count,
      soulsCount: entry.souls_count,
      sharesCount: entry.shares_count,
      name: entry.witness_profiles?.name || 'Unknown',
      role: entry.witness_profiles?.role || '',
      photoUri: entry.witness_profiles?.photo_uri || null,
      createdAt: entry.created_at,
    })));
  } catch (error: any) {
    console.error('Error in leaderboard:', error);
    return c.json({ error: error.message || 'Failed to fetch leaderboard' }, 500);
  }
});

app.get("/api/points/user-stats/:witnessProfileId", async (c) => {
  try {
    const witnessProfileId = c.req.param('witnessProfileId');

    if (!supabase) {
      return c.json({ error: 'Database is not configured' }, 500);
    }

    const { data, error } = await supabase
      .from('user_points')
      .select('*')
      .eq('witness_profile_id', witnessProfileId)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching user stats:', error);
      return c.json({ error: 'Failed to fetch user stats' }, 500);
    }

    if (!data) {
      return c.json({
        witnessProfileId,
        totalPoints: 0,
        testimoniesCount: 0,
        testimoniesSeenCount: 0,
        testimoniesHeardCount: 0,
        testimoniesExperiencedCount: 0,
        soulsCount: 0,
        sharesCount: 0,
      });
    }

    return c.json({
      id: data.id,
      witnessProfileId: data.witness_profile_id,
      totalPoints: data.total_points,
      testimoniesCount: data.testimonies_count,
      testimoniesSeenCount: data.testimonies_seen_count,
      testimoniesHeardCount: data.testimonies_heard_count,
      testimoniesExperiencedCount: data.testimonies_experienced_count,
      soulsCount: data.souls_count,
      sharesCount: data.shares_count,
    });
  } catch (error: any) {
    console.error('Error in user-stats:', error);
    return c.json({ error: error.message || 'Failed to fetch user stats' }, 500);
  }
});

app.post("/api/test/run-tests", async (c) => {
  try {
    if (!supabase) {
      return c.json({ error: 'Database is not configured' }, 500);
    }

    const results: any[] = [];

    try {
      const { data: profile, error: profileError } = await supabase
        .from('witness_profiles')
        .insert({
          name: 'Test User',
          contact: 'test@example.com',
          role: 'Tester',
        })
        .select()
        .single();

      if (profileError) throw profileError;
      results.push({ test: 'Create Profile', status: 'passed', data: profile });

      const witnessProfileId = profile.id;

      const { data: testimony, error: testimonyError } = await supabase
        .from('testimonies')
        .insert({
          witness_profile_id: witnessProfileId,
          category: 'seen',
          original_message: 'Test testimony',
          enhanced_message: 'Enhanced test testimony',
        })
        .select()
        .single();

      if (testimonyError) throw testimonyError;
      results.push({ test: 'Create Testimony', status: 'passed', data: testimony });

      const { data: soul, error: soulError } = await supabase
        .from('souls')
        .insert({
          witness_profile_id: witnessProfileId,
          name: 'Test Soul',
          date: new Date().toISOString().split('T')[0],
        })
        .select()
        .single();

      if (soulError) throw soulError;
      results.push({ test: 'Create Soul', status: 'passed', data: soul });

      const { data: witnessCard, error: witnessCardError } = await supabase
        .from('witness_cards')
        .insert({
          witness_profile_id: witnessProfileId,
          card_data: { test: true },
        })
        .select()
        .single();

      if (witnessCardError) throw witnessCardError;
      results.push({ test: 'Create Witness Card', status: 'passed', data: witnessCard });

      const { data: pointTransaction, error: pointError } = await supabase
        .from('point_transactions')
        .insert({
          witness_profile_id: witnessProfileId,
          action_type: 'testimony_seen',
          points: 3,
          description: 'Test points',
        })
        .select()
        .single();

      if (pointError) throw pointError;
      results.push({ test: 'Create Point Transaction', status: 'passed', data: pointTransaction });

      const { data: userPoints, error: userPointsError } = await supabase
        .from('user_points')
        .insert({
          witness_profile_id: witnessProfileId,
          total_points: 3,
          testimonies_count: 1,
          testimonies_seen_count: 1,
        })
        .select()
        .single();

      if (userPointsError) throw userPointsError;
      results.push({ test: 'Create User Points', status: 'passed', data: userPoints });

    } catch (testError: any) {
      results.push({ test: 'Database Tests', status: 'failed', error: testError.message });
    }

    return c.json({ results });
  } catch (error: any) {
    console.error('Error in run-tests:', error);
    return c.json({ error: error.message || 'Failed to run tests' }, 500);
  }
});

app.post("/api/enhance-testimony", async (c) => {
  try {
    const body = await c.req.json();
    const { testimony, category } = body;

    const geminiApiKey = process.env.GEMINI_API_KEY;

    if (!geminiApiKey) {
      console.error('GEMINI_API_KEY is not configured in environment variables');
      return c.json({ error: 'GEMINI_API_KEY is not configured. Please add your Gemini API key to the .env file.' }, 400);
    }

    console.log('Enhancing testimony with Gemini...');

    const categoryContext: Record<string, string> = {
      seen: "what the user has witnessed in their life",
      heard: "what the user has heard about God's work",
      experienced: "what the user has personally experienced",
    };

    const prompt = `Transform this testimony into a compelling and concise narrative using modern storytelling techniques.

Context: This testimony is about ${categoryContext[category]}.

Original testimony: "${testimony}"

Guidelines:
- Keep it concise (50-70 words maximum)
- Use contemporary scenarios (workplace challenges, digital age experiences, academic pressures, family dynamics)
- Maintain first-person narrative voice
- Include 1-2 appropriate emojis for emphasis
- Conclude with an inspirational call to faith
- Write in a warm, authentic tone while maintaining dignity and respect
- Focus on transformation and hope

Rewrite the testimony directly without any preamble or explanation.`;

    const url = `https://generativelanguage.googleapis.com/v1/models/gemini-2.0-flash:generateContent?key=${geminiApiKey}`;
    
    console.log('Making request to Gemini API...');
    
    const response = await axios.post(
      url,
      {
        contents: [
          {
            parts: [
              {
                text: prompt,
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 500,
        },
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 30000,
      }
    );

    console.log('Gemini response received');

    let enhancedTestimony = testimony;

    if (response.data?.candidates?.[0]?.content?.parts?.[0]?.text) {
      enhancedTestimony = response.data.candidates[0].content.parts[0].text.trim();
      console.log('Enhanced testimony extracted');
    } else {
      console.log('Using original testimony');
    }

    return c.json({
      originalTestimony: testimony,
      enhancedTestimony: enhancedTestimony,
    });
  } catch (error: any) {
    console.error('Error enhancing testimony:', error);
    return c.json({ error: `Failed to enhance testimony: ${error.message || 'Unknown error'}` }, 500);
  }
});

app.post("/api/enhance-witness-card", async (c) => {
  try {
    const body = await c.req.json();
    const { seen, heard, experienced } = body;

    const geminiApiKey = process.env.GEMINI_API_KEY;

    if (!geminiApiKey) {
      console.error('GEMINI_API_KEY is not configured in environment variables');
      return c.json({ error: 'GEMINI_API_KEY is not configured. Please add your Gemini API key to the .env file.' }, 400);
    }

    console.log('Enhancing witness card with Gemini...');

    const allEntries = [
      ...seen.map((s: string) => `Seen: ${s}`),
      ...heard.map((h: string) => `Heard: ${h}`),
      ...experienced.map((e: string) => `Experienced: ${e}`)
    ].join('\n');

    const prompt = `Create a short witness card message from these testimonies. Keep it 30-40 words max.

User's testimonies:
${allEntries}

Requirements:
- Super concise (30-40 words only)
- Professional but relatable tone
- Use 1-2 light emojis naturally
- First person perspective
- Focus on the most impactful point
- End with a simple call to action or hope

Just write the witness card message directly, no explanations.`;

    const url = `https://generativelanguage.googleapis.com/v1/models/gemini-2.0-flash:generateContent?key=${geminiApiKey}`;
    
    console.log('Making request to Gemini API for witness card...');
    
    const response = await axios.post(
      url,
      {
        contents: [
          {
            parts: [
              {
                text: prompt,
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 200,
        },
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 30000,
      }
    );

    console.log('Gemini response received');

    if (!response.data?.candidates?.[0]?.content?.parts?.[0]?.text) {
      console.error('Unexpected response structure');
      return c.json({ error: 'Invalid response structure from Gemini API' }, 500);
    }

    const enhancedMessage = response.data.candidates[0].content.parts[0].text;

    console.log('Enhanced witness card successfully');

    return c.json({
      enhancedMessage: enhancedMessage.trim(),
    });
  } catch (error: any) {
    console.error('Error enhancing witness card:', error);
    return c.json({ error: `Failed to enhance witness card: ${error.message || 'Unknown error'}` }, 500);
  }
});

export default app;
