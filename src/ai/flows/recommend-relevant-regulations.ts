// Recommend relevant safety regulations and information based on the context of a safety violation.

'use server';

/**
 * @fileOverview Recommends relevant safety regulations and information based on the context of a safety violation.
 *
 * - recommendRelevantRegulations - A function that recommends relevant regulations.
 * - RecommendRelevantRegulationsInput - The input type for the recommendRelevantRegulations function.
 * - RecommendRelevantRegulationsOutput - The return type for the recommendRelevantRegulations function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const RecommendRelevantRegulationsInputSchema = z.object({
  violationDescription: z
    .string()
    .describe('The description of the safety violation.'),
  projectSpecificRequirements: z
    .string()
    .optional()
    .describe('Project specific safety requirements.'),
});
export type RecommendRelevantRegulationsInput = z.infer<
  typeof RecommendRelevantRegulationsInputSchema
>;

const RecommendRelevantRegulationsOutputSchema = z.object({
  relevantRegulations: z
    .array(z.string())
    .describe('A list of relevant safety regulations.'),
  relevantInformation: z
    .string()
    .describe('Relevant safety information to include in the report.'),
});
export type RecommendRelevantRegulationsOutput = z.infer<
  typeof RecommendRelevantRegulationsOutputSchema
>;

export async function recommendRelevantRegulations(
  input: RecommendRelevantRegulationsInput
): Promise<RecommendRelevantRegulationsOutput> {
  return recommendRelevantRegulationsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'recommendRelevantRegulationsPrompt',
  input: {schema: RecommendRelevantRegulationsInputSchema},
  output: {schema: RecommendRelevantRegulationsOutputSchema},
  prompt: `You are a safety expert. Based on the description of a safety violation, you will recommend relevant safety regulations and information to include in a safety report.

Violation Description: {{{violationDescription}}}

{{#if projectSpecificRequirements}}
Project Specific Requirements: {{{projectSpecificRequirements}}}
{{/if}}

Return the recommendations in JSON format.
`,
});

const recommendRelevantRegulationsFlow = ai.defineFlow(
  {
    name: 'recommendRelevantRegulationsFlow',
    inputSchema: RecommendRelevantRegulationsInputSchema,
    outputSchema: RecommendRelevantRegulationsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
