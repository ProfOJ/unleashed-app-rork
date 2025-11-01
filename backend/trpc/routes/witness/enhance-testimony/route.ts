import { z } from 'zod';
import { publicProcedure } from '../../../create-context';
import axios from 'axios';
import { TRPCError } from '@trpc/server';

export const enhanceTestimonyProcedure = publicProcedure
  .input(
    z.object({
      testimony: z.string(),
      category: z.enum(['seen', 'heard', 'experienced']),
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

    console.log('Enhancing testimony with Gemini...');
    console.log('API Key present:', geminiApiKey ? 'Yes' : 'No');
    console.log('API Key length:', geminiApiKey.length);

    const categoryContext: Record<string, string> = {
      seen: "what the user has witnessed in their life",
      heard: "what the user has heard about God's work",
      experienced: "what the user has personally experienced",
    };

    const prompt = `Rewrite this testimony in a short, Gen Z style with modern scenarios and light emojis where needed.

Context: This testimony is about ${categoryContext[input.category]}.

Original testimony: "${input.testimony}"

Make it:
- Super short (40-60 words max)
- Relatable with modern scenarios (like school, work, social media vibes)
- First person perspective
- Include 2-3 light emojis naturally
- End with a simple call to follow Jesus
- Keep it real and conversational, not preachy

Just rewrite the testimony directly, no explanations.`;

    try {
      const url = `https://generativelanguage.googleapis.com/v1/models/gemini-2.0-flash:generateContent?key=${geminiApiKey}`;
      
      console.log('Making request to Gemini API...');
      console.log('Request URL:', url.replace(geminiApiKey, 'HIDDEN_KEY'));
      
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
            maxOutputTokens: 500,
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
              console.error('HTML preview:', data.substring(0, 200));
              return { error: 'HTML_RESPONSE', htmlContent: data };
            }
            try {
              return JSON.parse(data);
            } catch (e) {
              console.error('Failed to parse response as JSON:', data.substring(0, 200));
              return { error: 'INVALID_JSON', rawContent: data };
            }
          }
          return data;
        }],
      });

      console.log('Gemini response received');
      console.log('Response status:', response.status);
      console.log('Response content-type:', response.headers['content-type']);

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
        console.error('Response data:', JSON.stringify(response.data, null, 2));
        
        let errorMessage = 'Failed to enhance testimony';
        
        if (response.status === 400) {
          errorMessage = response.data?.error?.message || 'Invalid request to Gemini API. Please check your API key.';
        } else if (response.status === 401 || response.status === 403) {
          errorMessage = 'API key not valid. Please check your GEMINI_API_KEY in .env file.';
        } else if (response.status === 429) {
          errorMessage = 'Too many requests. Please try again later.';
        } else if (response.status >= 500) {
          errorMessage = 'Gemini API is experiencing issues. Please try again later.';
        } else {
          errorMessage = response.data?.error?.message || 
                        `Gemini API error: ${response.status} ${response.statusText}`;
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
        console.error('Unexpected response structure:', JSON.stringify(data, null, 2));
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Invalid response structure from Gemini API',
        });
      }

      const enhancedTestimony = data.candidates[0].content.parts[0].text;

      console.log('Enhanced testimony successfully');
      console.log('Enhanced testimony length:', enhancedTestimony.length);

      return {
        originalTestimony: input.testimony,
        enhancedTestimony: enhancedTestimony.trim(),
      };
    } catch (error: any) {
      console.error('Error calling Gemini API:');
      console.error('Error details:', error);
      
      if (axios.isAxiosError(error)) {
        if (error.response) {
          console.error('Response status:', error.response.status);
          console.error('Response content-type:', error.response.headers['content-type']);
          console.error('Response data (first 500 chars):', 
            typeof error.response.data === 'string' 
              ? error.response.data.substring(0, 500)
              : JSON.stringify(error.response.data, null, 2).substring(0, 500)
          );
          
          if (typeof error.response.data === 'string' && error.response.data.trim().startsWith('<')) {
            throw new TRPCError({
              code: 'INTERNAL_SERVER_ERROR',
              message: 'Gemini API returned an HTML error page. Please verify your API key is correct.',
            });
          }
        } else if (error.request) {
          console.error('No response received from Gemini API');
          console.error('Request details:', error.message);
        } else {
          console.error('Error setting up request:', error.message);
        }
      }
      
      if (error instanceof TRPCError) {
        throw error;
      }
      
      console.error('Unexpected error:', error.message || error);
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: `Failed to enhance testimony: ${error.message || 'Unknown error'}`,
      });
    }
  });

export default enhanceTestimonyProcedure;
