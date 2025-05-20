// src/ai/flows/generate-truth-dare.ts
'use server';

/**
 * @fileOverview Generates truth and dare prompts based on difficulty and maturity level.
 *
 * - generateTruthDare - A function that generates a truth or dare prompt.
 * - TruthDareInput - The input type for the generateTruthDare function.
 * - TruthDareOutput - The return type for the generateTruthDare function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const TruthDareInputSchema = z.object({
  type: z.enum(['truth', 'dare']).describe('The type of prompt to generate: truth or dare.'),
  difficulty: z
    .number()
    .min(1)
    .max(10)
    .describe('The difficulty level of the prompt, from 1 (mild) to 10 (wild).'),
  maturity: z.enum(['general', '18+']).describe('The maturity level of the prompt.'),
});
export type TruthDareInput = z.infer<typeof TruthDareInputSchema>;

const TruthDareOutputSchema = z.object({
  prompt: z.string().describe('The generated truth or dare prompt.'),
});
export type TruthDareOutput = z.infer<typeof TruthDareOutputSchema>;

export async function generateTruthDare(input: TruthDareInput): Promise<TruthDareOutput> {
  return generateTruthDareFlow(input);
}

const prompt = ai.definePrompt({
  name: 'truthDarePrompt',
  input: {schema: TruthDareInputSchema},
  output: {schema: TruthDareOutputSchema},
  prompt: `You are a truth and dare game master.

  Generate a {{type}} prompt based on the following criteria:

  Difficulty: {{difficulty}} (1 = mild, 10 = wild)
  Maturity: {{maturity}}

  The prompt should be appropriate for the selected difficulty and maturity levels.

  If the maturity is 18+, the prompt can be sexual, naughty, or dark.
  If the maturity is general, the prompt should be appropriate for all ages.

  Here are some examples of truth prompts:
  - What is your biggest regret?
  - What is the most embarrassing thing that has ever happened to you?
  - What is your biggest fear?

  Here are some examples of dare prompts:
  - Sing a song in public.
  - Do 20 pushups.
  - Tell a stranger a joke.

  Ensure that the prompt is engaging and relevant to the selected difficulty and maturity levels.
  Output the prompt.
  `, 
});

const generateTruthDareFlow = ai.defineFlow(
  {
    name: 'generateTruthDareFlow',
    inputSchema: TruthDareInputSchema,
    outputSchema: TruthDareOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
