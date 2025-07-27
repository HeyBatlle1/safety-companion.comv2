'use server';

/**
 * @fileOverview An AI agent that generates a draft safety report based on project details and recent safety violations.
 *
 * - generateSafetyReportDraft - A function that handles the generation of the safety report draft.
 * - GenerateSafetyReportDraftInput - The input type for the generateSafetyReportDraft function.
 * - GenerateSafetyReportDraftOutput - The return type for the generateSafetyReportDraft function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateSafetyReportDraftInputSchema = z.object({
  projectDetails: z.string().describe('Details of the project including name, location, and key personnel.'),
  recentSafetyViolations: z.string().describe('A summary of recent safety violations on the project site.'),
  relevantRegulations: z.string().describe('List of Regulations applicable to the project'),
});
export type GenerateSafetyReportDraftInput = z.infer<
  typeof GenerateSafetyReportDraftInputSchema
>;

const GenerateSafetyReportDraftOutputSchema = z.object({
  reportDraft: z.string().describe('A draft safety report pre-populated with project details and recent safety violations.'),
});

export type GenerateSafetyReportDraftOutput = z.infer<
  typeof GenerateSafetyReportDraftOutputSchema
>;

export async function generateSafetyReportDraft(
  input: GenerateSafetyReportDraftInput
): Promise<GenerateSafetyReportDraftOutput> {
  return generateSafetyReportDraftFlow(input);
}

const generateSafetyReportDraftPrompt = ai.definePrompt({
  name: 'generateSafetyReportDraftPrompt',
  input: {schema: GenerateSafetyReportDraftInputSchema},
  output: {schema: GenerateSafetyReportDraftOutputSchema},
  prompt: `You are a safety expert responsible for drafting safety reports.

  Based on the project details, recent safety violations, and relevant regulations, generate a draft safety report.

  Project Details: {{{projectDetails}}}
  Recent Safety Violations: {{{recentSafetyViolations}}}
  Relevant Regulations: {{{relevantRegulations}}}

  Draft Safety Report:`,
});

const generateSafetyReportDraftFlow = ai.defineFlow(
  {
    name: 'generateSafetyReportDraftFlow',
    inputSchema: GenerateSafetyReportDraftInputSchema,
    outputSchema: GenerateSafetyReportDraftOutputSchema,
  },
  async input => {
    const {output} = await generateSafetyReportDraftPrompt(input);
    return output!;
  }
);
