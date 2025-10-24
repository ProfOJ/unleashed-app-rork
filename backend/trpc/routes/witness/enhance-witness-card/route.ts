import { z } from 'zod';
import { publicProcedure } from '../../../create-context';
import axios from 'axios';
import { TRPCError } from '@trpc/server';

export const enhanceWitnessCardProcedure = publicProcedure
  .input(
    z.object({
      seen: z.array(z.string()),
      heard: z.array(z.string()),
      experienced: z.array(z.string()),
    })
  )
  .mutation(async ({ input }) => {
    const geminiApiKey = process.env.GEMINI_API_KEY;

    if (!geminiApiKey) {
      console.error('GEMINI_API_KEY is not configured in environment variables');
      throw new TRPCError({
        code: 'PRECONDITION_FAILED',
        message: 'GEMINI_API_KEY is not configured. Please add your Gemini API key to the .env file.',
      });
    }

    console.log('Enhancing witness card with Gemini...');

    const allEntries = [
      ...input.seen.map(s => `Seen: ${s}`),
      ...input.heard.map(h => `Heard: ${h}`),
      ...input.experienced.map(e => `Experienced: ${e}`)
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

    try {
      const url = `https://generativelanguage.googleapis.com/v1/models/gemini-2.0-flash:generateContent?key=${geminiApiKey}`;
      
      console.log('Making request to Gemini API for witness card...');
      
      const response = await axios({
        method: 'POST',
        url: url,
        data: {
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
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 30000,
        validateStatus: (status) => status < 600,
        transformResponse: [(data) => {
          if (typeof data === 'string') {
            if (data.trim().startsWith('<')) {
              console.error('Received HTML response instead of JSON');
              return { error: 'HTML_RESPONSE', htmlContent: data };
            }
            try {
              return JSON.parse(data);
            } catch {
              console.error('Failed to parse response as JSON');
              return { error: 'INVALID_JSON', rawContent: data };
            }
          }
          return data;
        }],
      });

      console.log('Gemini response received');

      if (response.data?.error === 'HTML_RESPONSE') {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Gemini API returned an HTML error page. The API key or endpoint might be invalid.',
        });
      }

      if (response.data?.error === 'INVALID_JSON') {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Gemini API returned invalid response format.',
        });
      }

      if (response.status !== 200) {
        console.error('Non-200 status code:', response.status);
        
        let errorMessage = 'Failed to enhance witness card';
        
        if (response.status === 400) {
          errorMessage = response.data?.error?.message || 'Invalid request to Gemini API. Please check your API key.';
        } else if (response.status === 401 || response.status === 403) {
          errorMessage = 'API key not valid. Please check your GEMINI_API_KEY in .env file.';
        } else if (response.status === 429) {
          errorMessage = 'Too many requests. Please try again later.';
        } else if (response.status >= 500) {
          errorMessage = 'Gemini API is experiencing issues. Please try again later.';
        }
        
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: errorMessage,
        });
      }

      const data = response.data;
      
      if (!data || typeof data !== 'object') {
        console.error('Invalid response data type:', typeof data);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Invalid response from Gemini API',
        });
      }
      
      if (!data.candidates || !data.candidates[0]?.content?.parts?.[0]?.text) {
        console.error('Unexpected response structure');
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Invalid response structure from Gemini API',
        });
      }

      const enhancedMessage = data.candidates[0].content.parts[0].text;

      console.log('Enhanced witness card successfully');
      console.log('Enhanced message length:', enhancedMessage.length);

      return {
        enhancedMessage: enhancedMessage.trim(),
      };
    } catch (error: any) {
      console.error('Error calling Gemini API:', error);
      
      if (error instanceof TRPCError) {
        throw error;
      }
      
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: `Failed to enhance witness card: ${error.message || 'Unknown error'}`,
      });
    }
  });

export default enhanceWitnessCardProcedure;
