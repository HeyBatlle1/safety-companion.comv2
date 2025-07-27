
'use server';

/**
 * @fileOverview An AI agent that analyzes construction safety checklist data to provide predictive safety intelligence.
 *
 * - analyzeChecklist - A function that handles the checklist analysis.
 * - AnalyzeChecklistInput - The input type for the analyzeChecklist function.
 * - AnalyzeChecklistOutput - The return type for the analyzeChecklist function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzeChecklistInputSchema = z.object({
  projectContext: z
    .string()
    .describe('Details about the project, like name, location, and type of work being performed (e.g., high-rise glass installation).'),
  checklistResponses: z
    .array(
      z.object({
        itemId: z.string(),
        text: z.string(),
        passed: z.boolean(),
        priority: z.string(),
        category: z.string(),
        photoAttached: z.boolean(),
      })
    )
    .describe('An array of all checklist item responses, including failures and passes.'),
});
export type AnalyzeChecklistInput = z.infer<typeof AnalyzeChecklistInputSchema>;

const AnalyzeChecklistOutputSchema = z.object({
  executiveSummary: z.string().describe('A high-level summary for management, focusing on overall risk, critical failures, and recommended immediate actions.'),
  technicalReport: z.string().describe('A detailed report for safety officers, including analysis of each failed item, potential OSHA violations, and specific mitigation advice.'),
  trendAnalysis: z.string().describe('Analysis for insurance documentation, identifying patterns, potential long-term risks, and comparison to safety benchmarks. Mention items that are frequently failed.'),
  trainingRecommendations: z.string().describe('Actionable training recommendations for crew supervisors based on identified knowledge or performance gaps.'),
});
export type AnalyzeChecklistOutput = z.infer<
  typeof AnalyzeChecklistOutputSchema
>;

export async function analyzeChecklist(
  input: AnalyzeChecklistInput
): Promise<AnalyzeChecklistOutput> {
  return analyzeChecklistFlow(input);
}

const prompt = ai.definePrompt({
  name: 'analyzeChecklistPrompt',
  input: {schema: AnalyzeChecklistInputSchema},
  output: {schema: AnalyzeChecklistOutputSchema},
  prompt: `You are a world-class construction safety expert and data analyst with a specialization in predictive risk assessment for high-risk jobs like commercial glass installation. A safety checklist has just been submitted. Your task is to analyze it with extreme scrutiny and provide predictive safety intelligence.

Analyze the provided checklist responses in the context of the project. Go beyond just listing failures. Identify correlations, potential cascading failures, and hidden risks. A single failed item can have massive implications.

Project Context:
{{{projectContext}}}

Checklist Responses (JSON):
{{{json stringify=checklistResponses}}}

Based on your analysis, generate the following four distinct reports:

1.  **Executive Summary:** For a busy construction executive. Be concise. Start with an overall risk assessment (e.g., "High-Risk," "Action Required"). Immediately highlight any CRITICAL failures and their potential consequences (e.g., "Immediate work stoppage required due to critical fall protection failure, posing a fatality risk."). Provide a bulleted list of 2-3 essential actions.

2.  **Detailed Technical Report:** For the on-site Safety Officer. Be thorough and reference specific standards. For each failed item, provide:
    *   **Root Cause Analysis:** What are the likely reasons for this failure? (e.g., "Lack of training," "Faulty equipment," "Complacency").
    *   **Potential OSHA Citations:** Which specific OSHA standards might be violated? (e.g., "Potential violation of 1926.502(d)").
    *   **Mitigation Steps:** What specific, immediate actions must be taken?

3.  **Trend & Insurance Analysis:** For the Risk Manager or Insurance provider. Focus on patterns and long-term risk. Are there recurring failures in a specific category (e.g., "repeated failures in Equipment Safety")? How does this checklist compare to industry benchmarks? What are the potential financial and legal liabilities associated with these failures?

4.  **Crew Training Recommendations:** For the Crew Supervisor. Be direct and actionable. Based on the failures, what specific training is needed? (e.g., "Immediate retraining on proper fitting of personal fall arrest systems is required for the entire crew."). Suggest specific "toolbox talk" topics.

Your analysis must reflect the life-or-death importance of this information. Every insight you provide can prevent an accident. Do not be generic. Provide specific, actionable intelligence.`,
});

const analyzeChecklistFlow = ai.defineFlow(
  {
    name: 'analyzeChecklistFlow',
    inputSchema: AnalyzeChecklistInputSchema,
    outputSchema: AnalyzeChecklistOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
