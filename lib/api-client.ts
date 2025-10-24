import axios from 'axios';
import Constants from 'expo-constants';

const SUPABASE_URL = Constants.expoConfig?.extra?.supabaseUrl || process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://oqrxpfzcclwmsrwhmtiv.supabase.co';
const SUPABASE_ANON_KEY = Constants.expoConfig?.extra?.supabaseAnonKey || process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9xcnhwZnpjY2x3bXNyd2htdGl2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjExNjE1MzAsImV4cCI6MjA3NjczNzUzMH0.4Qacs3C2o5AWvq4Eoa0bmGdrWgqJ5Z3qX1h4RufllsY';

console.log('🔍 API Client Configuration:');
console.log('SUPABASE_URL:', SUPABASE_URL);
console.log('SUPABASE_ANON_KEY:', SUPABASE_ANON_KEY ? 'Present' : 'Missing');

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('❌ Supabase credentials not configured!');
  console.error('SUPABASE_URL:', SUPABASE_URL);
  console.error('SUPABASE_ANON_KEY:', SUPABASE_ANON_KEY ? 'Present' : 'Missing');
  throw new Error('Supabase credentials are required');
}

const supabaseClient = axios.create({
  baseURL: `${SUPABASE_URL}/rest/v1`,
  headers: {
    'apikey': SUPABASE_ANON_KEY!,
    'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
    'Content-Type': 'application/json',
    'Prefer': 'return=representation',
  },
  timeout: 30000,
});

supabaseClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('❌ Supabase API Error:', {
      message: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      url: error.config?.url,
    });
    return Promise.reject(error);
  }
);

export const api = {
  witness: {
    saveProfile: async (data: {
      id?: string;
      name: string;
      contact: string;
      role: string;
      photoUri?: string;
      country?: string;
      district?: string;
      assembly?: string;
    }) => {
      const profileData = {
        name: data.name,
        contact: data.contact,
        role: data.role,
        photo_uri: data.photoUri || null,
        country: data.country || null,
        district: data.district || null,
        assembly: data.assembly || null,
      };

      let response;
      if (data.id) {
        // Update existing profile
        response = await supabaseClient.patch(
          '/witness_profiles',
          profileData,
          {
            params: {
              id: `eq.${data.id}`,
            },
          }
        );
      } else {
        // Create new profile
        response = await supabaseClient.post('/witness_profiles', profileData);
      }

      const profile = response.data[0];
      return {
        id: profile.id,
        name: profile.name,
        contact: profile.contact,
        role: profile.role,
        photoUri: profile.photo_uri || '',
        country: profile.country || '',
        district: profile.district || '',
        assembly: profile.assembly || '',
      };
    },

    getProfile: async (witnessProfileId: string) => {
      const response = await supabaseClient.get('/witness_profiles', {
        params: {
          id: `eq.${witnessProfileId}`,
        },
      });

      const profile = response.data[0];
      if (!profile) {
        throw new Error('Profile not found');
      }

      return {
        id: profile.id,
        name: profile.name,
        contact: profile.contact,
        role: profile.role,
        photoUri: profile.photo_uri || '',
        country: profile.country || '',
        district: profile.district || '',
        assembly: profile.assembly || '',
      };
    },

    saveTestimony: async (data: {
      witnessProfileId: string;
      originalMessage: string;
      enhancedMessage: string;
      category: string;
      tellOnline: boolean;
      tellInPerson: boolean;
      goWorkplace: boolean;
      goSchool: boolean;
      goNeighborhood: boolean;
    }) => {
      const response = await supabaseClient.post('/testimonies', {
        witness_profile_id: data.witnessProfileId,
        category: data.category,
        original_message: data.originalMessage,
        enhanced_message: data.enhancedMessage,
        tell_online: data.tellOnline,
        tell_in_person: data.tellInPerson,
        go_workplace: data.goWorkplace,
        go_school: data.goSchool,
        go_neighborhood: data.goNeighborhood,
      });

      const testimony = response.data[0];
      return {
        id: testimony.id,
        witnessProfileId: testimony.witness_profile_id,
        category: testimony.category,
        originalMessage: testimony.original_message,
        enhancedMessage: testimony.enhanced_message,
        tellOnline: testimony.tell_online,
        tellInPerson: testimony.tell_in_person,
        goWorkplace: testimony.go_workplace,
        goSchool: testimony.go_school,
        goNeighborhood: testimony.go_neighborhood,
        createdAt: testimony.created_at,
      };
    },

    getTestimonies: async (witnessProfileId: string) => {
      const response = await supabaseClient.get('/testimonies', {
        params: {
          witness_profile_id: `eq.${witnessProfileId}`,
          order: 'created_at.desc',
        },
      });

      return response.data.map((t: any) => ({
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
      }));
    },

    deleteTestimony: async (testimonyId: string) => {
      await supabaseClient.delete('/testimonies', {
        params: {
          id: `eq.${testimonyId}`,
        },
      });

      return { success: true };
    },

    updateTestimony: async (data: {
      testimonyId: string;
      originalMessage?: string;
      enhancedMessage?: string;
      category?: string;
      tellOnline?: boolean;
      tellInPerson?: boolean;
      goWorkplace?: boolean;
      goSchool?: boolean;
      goNeighborhood?: boolean;
    }) => {
      const updateData: any = {};
      if (data.originalMessage !== undefined) updateData.original_message = data.originalMessage;
      if (data.enhancedMessage !== undefined) updateData.enhanced_message = data.enhancedMessage;
      if (data.category !== undefined) updateData.category = data.category;
      if (data.tellOnline !== undefined) updateData.tell_online = data.tellOnline;
      if (data.tellInPerson !== undefined) updateData.tell_in_person = data.tellInPerson;
      if (data.goWorkplace !== undefined) updateData.go_workplace = data.goWorkplace;
      if (data.goSchool !== undefined) updateData.go_school = data.goSchool;
      if (data.goNeighborhood !== undefined) updateData.go_neighborhood = data.goNeighborhood;

      const response = await supabaseClient.patch(
        '/testimonies',
        updateData,
        {
          params: {
            id: `eq.${data.testimonyId}`,
          },
        }
      );

      const testimony = response.data[0];
      return {
        id: testimony.id,
        witnessProfileId: testimony.witness_profile_id,
        category: testimony.category,
        originalMessage: testimony.original_message,
        enhancedMessage: testimony.enhanced_message,
        tellOnline: testimony.tell_online,
        tellInPerson: testimony.tell_in_person,
        goWorkplace: testimony.go_workplace,
        goSchool: testimony.go_school,
        goNeighborhood: testimony.go_neighborhood,
        createdAt: testimony.created_at,
      };
    },

    enhanceTestimony: async (data: {
      testimony: string;
      category: string;
    }) => {
      const geminiApiKey = Constants.expoConfig?.extra?.geminiApiKey || process.env.EXPO_PUBLIC_GEMINI_API_KEY || 'AIzaSyBfl_xh8vRqg-4cddEzCHtGYQKeKpS5usI';

      if (!geminiApiKey) {
        throw new Error('GEMINI_API_KEY is not configured');
      }

      const categoryContext: Record<string, string> = {
        seen: "what the user has witnessed in their life",
        heard: "what the user has heard about God's work",
        experienced: "what the user has personally experienced",
      };

      const prompt = `Transform this testimony into a compelling and concise narrative using modern storytelling techniques.

Context: This testimony is about ${categoryContext[data.category]}.

Original testimony: "${data.testimony}"

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

      let enhancedTestimony = data.testimony;

      if (response.data?.candidates?.[0]?.content?.parts?.[0]?.text) {
        enhancedTestimony = response.data.candidates[0].content.parts[0].text.trim();
      }

      return {
        originalTestimony: data.testimony,
        enhancedTestimony: enhancedTestimony,
      };
    },

    enhanceWitnessCard: async (data: {
      seen: string[];
      heard: string[];
      experienced: string[];
    }) => {
      const geminiApiKey = Constants.expoConfig?.extra?.geminiApiKey || process.env.EXPO_PUBLIC_GEMINI_API_KEY || 'AIzaSyBfl_xh8vRqg-4cddEzCHtGYQKeKpS5usI';

      if (!geminiApiKey) {
        throw new Error('GEMINI_API_KEY is not configured');
      }

      const allEntries = [
        ...data.seen.map((s: string) => `Seen: ${s}`),
        ...data.heard.map((h: string) => `Heard: ${h}`),
        ...data.experienced.map((e: string) => `Experienced: ${e}`)
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

      if (!response.data?.candidates?.[0]?.content?.parts?.[0]?.text) {
        throw new Error('Invalid response from Gemini API');
      }

      const enhancedMessage = response.data.candidates[0].content.parts[0].text;

      return {
        enhancedMessage: enhancedMessage.trim(),
      };
    },

    saveSoul: async (data: {
      witnessProfileId: string;
      name: string;
      contact?: string;
      location?: string;
      latitude?: number;
      longitude?: number;
      notes?: string;
      handedTo?: string;
      date: string;
    }) => {
      const response = await supabaseClient.post('/souls', {
        witness_profile_id: data.witnessProfileId,
        name: data.name,
        contact: data.contact || null,
        location: data.location || null,
        latitude: data.latitude || null,
        longitude: data.longitude || null,
        notes: data.notes || null,
        handed_to: data.handedTo || null,
        date: data.date,
      });

      const soul = response.data[0];
      return {
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
      };
    },

    getSouls: async (witnessProfileId: string) => {
      const response = await supabaseClient.get('/souls', {
        params: {
          witness_profile_id: `eq.${witnessProfileId}`,
          order: 'created_at.desc',
        },
      });

      return response.data.map((s: any) => ({
        id: s.id,
        witnessProfileId: s.witness_profile_id,
        name: s.name,
        contact: s.contact,
        location: s.location,
        latitude: s.latitude,
        longitude: s.longitude,
        notes: s.notes,
        handedTo: s.handed_to,
        date: s.date,
        createdAt: s.created_at,
      }));
    },

    deleteSoul: async (soulId: string) => {
      await supabaseClient.delete('/souls', {
        params: {
          id: `eq.${soulId}`,
        },
      });

      return { success: true };
    },

    saveWitnessCard: async (data: {
      witnessProfileId: string;
      cardData: Record<string, any>;
    }) => {
      const response = await supabaseClient.post('/witness_cards', {
        witness_profile_id: data.witnessProfileId,
        card_data: data.cardData,
      });

      const card = response.data[0];
      return {
        id: card.id,
        witnessProfileId: card.witness_profile_id,
        cardData: card.card_data,
        createdAt: card.created_at,
      };
    },

    getWitnessCards: async (witnessProfileId: string) => {
      const response = await supabaseClient.get('/witness_cards', {
        params: {
          witness_profile_id: `eq.${witnessProfileId}`,
          order: 'created_at.desc',
        },
      });

      return response.data.map((c: any) => ({
        id: c.id,
        witnessProfileId: c.witness_profile_id,
        cardData: c.card_data,
        createdAt: c.created_at,
      }));
    },
  },

  points: {
    awardPoints: async (data: {
      witnessProfileId: string;
      actionType: string;
      description: string;
    }) => {
      const pointsMap: Record<string, number> = {
        'testimony_seen': 3,
        'testimony_heard': 2,
        'testimony_experienced': 5,
        'soul_added': 10,
        'share': 2,
      };

      const points = pointsMap[data.actionType] || 0;

      await supabaseClient.post('/point_transactions', {
        witness_profile_id: data.witnessProfileId,
        action_type: data.actionType,
        points,
        description: data.description,
      });

      const existingResponse = await supabaseClient.get('/user_points', {
        params: {
          witness_profile_id: `eq.${data.witnessProfileId}`,
        },
      });

      const existing = existingResponse.data[0];

      if (!existing) {
        await supabaseClient.post('/user_points', {
          witness_profile_id: data.witnessProfileId,
          total_points: points,
          testimonies_count: data.actionType.startsWith('testimony_') ? 1 : 0,
          testimonies_seen_count: data.actionType === 'testimony_seen' ? 1 : 0,
          testimonies_heard_count: data.actionType === 'testimony_heard' ? 1 : 0,
          testimonies_experienced_count: data.actionType === 'testimony_experienced' ? 1 : 0,
          souls_count: data.actionType === 'soul_added' ? 1 : 0,
          shares_count: data.actionType === 'share' ? 1 : 0,
        });
      } else {
        const updateData: any = {
          total_points: existing.total_points + points,
        };

        if (data.actionType.startsWith('testimony_')) {
          updateData.testimonies_count = existing.testimonies_count + 1;
          if (data.actionType === 'testimony_seen') updateData.testimonies_seen_count = existing.testimonies_seen_count + 1;
          if (data.actionType === 'testimony_heard') updateData.testimonies_heard_count = existing.testimonies_heard_count + 1;
          if (data.actionType === 'testimony_experienced') updateData.testimonies_experienced_count = existing.testimonies_experienced_count + 1;
        } else if (data.actionType === 'soul_added') {
          updateData.souls_count = existing.souls_count + 1;
        } else if (data.actionType === 'share') {
          updateData.shares_count = existing.shares_count + 1;
        }

        await supabaseClient.patch(
          '/user_points',
          updateData,
          {
            params: {
              witness_profile_id: `eq.${data.witnessProfileId}`,
            },
          }
        );
      }

      return { success: true, points };
    },

    getLeaderboard: async (params: { limit?: number } = {}) => {
      const limit = params.limit || 100;

      const response = await supabaseClient.get('/user_points', {
        params: {
          order: 'total_points.desc',
          limit,
          select: '*, witness_profiles(name, role, photo_uri)',
        },
      });

      return response.data.map((entry: any) => ({
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
      }));
    },

    getUserStats: async (witnessProfileId: string) => {
      const response = await supabaseClient.get('/user_points', {
        params: {
          witness_profile_id: `eq.${witnessProfileId}`,
        },
      });

      const data = response.data[0];

      if (!data) {
        return {
          witnessProfileId,
          totalPoints: 0,
          testimoniesCount: 0,
          testimoniesSeenCount: 0,
          testimoniesHeardCount: 0,
          testimoniesExperiencedCount: 0,
          soulsCount: 0,
          sharesCount: 0,
        };
      }

      return {
        id: data.id,
        witnessProfileId: data.witness_profile_id,
        totalPoints: data.total_points,
        testimoniesCount: data.testimonies_count,
        testimoniesSeenCount: data.testimonies_seen_count,
        testimoniesHeardCount: data.testimonies_heard_count,
        testimoniesExperiencedCount: data.testimonies_experienced_count,
        soulsCount: data.souls_count,
        sharesCount: data.shares_count,
      };
    },
  },

  churches: {
    saveChurch: async (data: {
      name: string;
      district: string;
      area: string;
      country: string;
    }) => {
      const response = await supabaseClient.post('/churches', {
        name: data.name,
        district: data.district,
        area: data.area,
        country: data.country,
        witnesses_count: 0,
      });

      const church = response.data[0];
      return {
        id: church.id,
        name: church.name,
        district: church.district,
        area: church.area,
        country: church.country,
        witnessesCount: church.witnesses_count,
        createdAt: church.created_at,
      };
    },

    searchChurches: async (query: string) => {
      const ilike = `%${query}%`;
      const response = await supabaseClient.get('/churches', {
        params: {
          or: `(name.ilike.${ilike},district.ilike.${ilike},country.ilike.${ilike})`,
          order: 'witnesses_count.desc,name.asc',
          limit: 50,
        },
      });

      return response.data.map((c: any) => ({
        id: c.id,
        name: c.name,
        district: c.district,
        area: c.area,
        country: c.country,
        witnessesCount: c.witnesses_count,
        createdAt: c.created_at,
      }));
    },

    getChurch: async (churchId: string) => {
      const response = await supabaseClient.get('/churches', {
        params: {
          id: `eq.${churchId}`,
        },
      });

      const church = response.data[0];
      if (!church) {
        throw new Error('Church not found');
      }

      return {
        id: church.id,
        name: church.name,
        district: church.district,
        area: church.area,
        country: church.country,
        witnessesCount: church.witnesses_count,
        createdAt: church.created_at,
      };
    },

    linkProfileToChurch: async (data: {
      witnessProfileId: string;
      churchId: string;
    }) => {
      const checkResponse = await supabaseClient.get('/witness_churches', {
        params: {
          witness_profile_id: `eq.${data.witnessProfileId}`,
          church_id: `eq.${data.churchId}`,
        },
      });

      if (checkResponse.data.length > 0) {
        return {
          id: checkResponse.data[0].id,
          witnessProfileId: checkResponse.data[0].witness_profile_id,
          churchId: checkResponse.data[0].church_id,
          joinedAt: checkResponse.data[0].joined_at,
        };
      }

      const response = await supabaseClient.post('/witness_churches', {
        witness_profile_id: data.witnessProfileId,
        church_id: data.churchId,
      });

      const churchResponse = await supabaseClient.get('/churches', {
        params: {
          id: `eq.${data.churchId}`,
        },
      });

      const currentChurch = churchResponse.data[0];
      if (currentChurch) {
        await supabaseClient.patch(
          '/churches',
          { witnesses_count: currentChurch.witnesses_count + 1 },
          {
            params: {
              id: `eq.${data.churchId}`,
            },
          }
        );
      }

      const link = response.data[0];
      return {
        id: link.id,
        witnessProfileId: link.witness_profile_id,
        churchId: link.church_id,
        joinedAt: link.joined_at,
      };
    },

    getProfileChurches: async (witnessProfileId: string) => {
      const response = await supabaseClient.get('/witness_churches', {
        params: {
          witness_profile_id: `eq.${witnessProfileId}`,
          select: 'id,joined_at,churches(id,name,district,area,country,witnesses_count)',
        },
      });

      return response.data.map((wc: any) => ({
        linkId: wc.id,
        joinedAt: wc.joined_at,
        church: {
          id: wc.churches.id,
          name: wc.churches.name,
          district: wc.churches.district,
          area: wc.churches.area,
          country: wc.churches.country,
          witnessesCount: wc.churches.witnesses_count,
        },
      }));
    },
  },

  test: {
    runTests: async () => {
      const results: any[] = [];

      try {
        const profileResponse = await supabaseClient.post('/witness_profiles', {
          name: 'Test User',
          contact: 'test@example.com',
          role: 'Tester',
        });

        const profile = profileResponse.data[0];
        results.push({ test: 'Create Profile', status: 'passed', data: profile });

        const witnessProfileId = profile.id;

        const testimonyResponse = await supabaseClient.post('/testimonies', {
          witness_profile_id: witnessProfileId,
          category: 'seen',
          original_message: 'Test testimony',
          enhanced_message: 'Enhanced test testimony',
        });

        const testimony = testimonyResponse.data[0];
        results.push({ test: 'Create Testimony', status: 'passed', data: testimony });

        const soulResponse = await supabaseClient.post('/souls', {
          witness_profile_id: witnessProfileId,
          name: 'Test Soul',
          date: new Date().toISOString().split('T')[0],
        });

        const soul = soulResponse.data[0];
        results.push({ test: 'Create Soul', status: 'passed', data: soul });

        const witnessCardResponse = await supabaseClient.post('/witness_cards', {
          witness_profile_id: witnessProfileId,
          card_data: { test: true },
        });

        const witnessCard = witnessCardResponse.data[0];
        results.push({ test: 'Create Witness Card', status: 'passed', data: witnessCard });

        const pointTransactionResponse = await supabaseClient.post('/point_transactions', {
          witness_profile_id: witnessProfileId,
          action_type: 'testimony_seen',
          points: 3,
          description: 'Test points',
        });

        const pointTransaction = pointTransactionResponse.data[0];
        results.push({ test: 'Create Point Transaction', status: 'passed', data: pointTransaction });

        const userPointsResponse = await supabaseClient.post('/user_points', {
          witness_profile_id: witnessProfileId,
          total_points: 3,
          testimonies_count: 1,
          testimonies_seen_count: 1,
        });

        const userPoints = userPointsResponse.data[0];
        results.push({ test: 'Create User Points', status: 'passed', data: userPoints });

      } catch (testError: any) {
        results.push({ test: 'Database Tests', status: 'failed', error: testError.message });
      }

      return { results };
    },
  },
};

export default supabaseClient;
