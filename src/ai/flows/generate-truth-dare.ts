
// src/ai/flows/generate-truth-dare.ts
'use server';

/**
 * @fileOverview Generates truth and dare prompts based on difficulty and maturity level, avoiding recent repetitions.
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
  promptHistory: z.array(z.string()).optional().describe('A list of recently generated prompts to avoid repetition. Generate something different from these.'),
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

  If {{type}} is "dare": The dare MUST be performable indoors or in the current location. It should NOT require the person to go outside or travel to a different location.
  If maturity is "18+" and {{type}} is "dare", the dare MUST NOT involve blindfolds or any items that restrict vision.
  Furthermore, if maturity is "18+" and {{type}} is "dare", the dare MUST NOT involve the removal of any clothing.

  {{#if promptHistory}}
  IMPORTANT: Avoid generating a prompt that is the same as or has a very similar meaning to any of the following recently generated prompts:
  {{#each promptHistory}}
  - "{{{this}}}"
  {{/each}}
  Generate something new and distinct from the above list.
  {{/if}}

  Here are some examples of truth prompts (if you generate a truth prompt, make sure it is different from these and from the history provided):
  - What is your biggest regret?
  - What is the most embarrassing thing that has ever happened to you?
  - What is your biggest fear?

  Here are some examples of dare prompts (if {{type}} is "dare", ensure these are treated as indoor examples, different from the history provided, and any new dares you generate are also indoors):
  - Sing a song loudly.
  - Do 20 pushups.
  - Tell a household member a joke.
  - Impersonate a celebrity for 2 minutes.

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
