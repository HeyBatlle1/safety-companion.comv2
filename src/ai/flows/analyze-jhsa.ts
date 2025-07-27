'use server';

/**
 * @fileOverview An AI agent that analyzes Job Hazard Safety Analysis (JHSA) data.
 *
 * - analyzeJHSA - A function that handles the JHSA analysis.
 * - AnalyzeJHSAInput - The input type for the analyzeJHSA function.
 * - AnalyzeJHSAOutput - The return type for the analyzeJHSA function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

export const AnalyzeJHSAInputSchema = z.object({
  regulatory_standards: z.array(z.string()).describe('The applicable OSHA regulatory standards for the task.'),
  environmental_factors: z.string().describe('A description of the environmental factors at the job site.'),
  photo_descriptions: z.string().describe('A description of the photo provided for visual verification.'),
  text_context: z.string().describe('Detailed context of the situation.'),
  quantitative_data: z.string().describe('Specific quantitative data like height, depth, voltage etc.'),
});
export type AnalyzeJHSAInput = z.infer<typeof AnalyzeJHSAInputSchema>;

export const AnalyzeJHSAOutputSchema = z.object({
  compliance_status: z.enum(['compliant', 'non_compliant', 'requires_attention']).describe('The overall compliance status.'),
  risk_level: z.enum(['low', 'moderate', 'high', 'critical']).describe('The assessed risk level.'),
  specific_violations: z.array(z.string()).describe('A list of specific OSHA violations identified.'),
  immediate_hazards: z.array(z.string()).describe('A list of immediate hazards that require attention.'),
  corrective_actions: z.array(z.object({
    action: z.string().describe('The corrective action to be taken.'),
    priority: z.enum(['immediate', 'high', 'medium', 'low']).describe('The priority of the action.'),
    osha_standard: z.string().describe('The relevant OSHA standard.'),
    implementation_timeframe: z.string().describe('The timeframe for implementing the action.'),
  })).describe('A list of required corrective actions.'),
  additional_recommendations: z.array(z.string()).describe('A list of additional recommendations.'),
  insurance_risk_factors: z.array(z.string()).describe('A list of risk factors relevant to insurance.'),
});
export type AnalyzeJHSAOutput = z.infer<typeof AnalyzeJHSAOutputSchema>;


export async function analyzeJHSA(input: AnalyzeJHSAInput): Promise<AnalyzeJHSAOutput> {
    return analyzeJHSAFlow(input);
}


const prompt = ai.definePrompt({
    name: 'analyzeJHSAPrompt',
    input: {schema: AnalyzeJHSAInputSchema},
    output: {schema: AnalyzeJHSAOutputSchema},
    prompt: `You are an expert AI Safety Analyst for the construction industry. Your task is to perform a Job Hazard Safety Analysis (JHSA) based on the provided data, in strict accordance with OSHA regulations.

    **Analysis Input:**

    *   **Applicable OSHA Standards:** {{{regulatory_standards}}}
    *   **Environmental Factors:** {{{environmental_factors}}}
    *   **Visual Verification:** {{{photo_descriptions}}}
    *   **Site Context:** {{{text_context}}}
    *   **Quantitative Data:** {{{quantitative_data}}}

    **Your Task:**

    Analyze the input data to generate a comprehensive safety assessment. You must return a JSON object with the following structure:

    1.  `compliance_status`: Determine if the situation is 'compliant', 'non_compliant', or 'requires_attention'.
    2.  `risk_level`: Assess the risk as 'low', 'moderate', 'high', or 'critical'.
    3.  `specific_violations`: List any specific OSHA standards that are being violated. If none, return an empty array.
    4.  `immediate_hazards`: Identify any immediate dangers to personnel. If none, return an empty array.
    5.  `corrective_actions`: Provide a list of specific, actionable steps to mitigate hazards. For each action, include:
        *   `action`: The required action.
        *   `priority`: The priority ('immediate', 'high', 'medium', 'low').
        *   `osha_standard`: The corresponding OSHA standard.
        *   `implementation_timeframe`: The deadline for completion.
    6.  `additional_recommendations`: Suggest further safety improvements or training.
    7.  `insurance_risk_factors`: List factors that would be relevant for an insurance underwriter assessing this site.

    Your analysis must be precise, referencing the provided standards and data. The safety of the workers depends on the accuracy of your assessment.`
});

const analyzeJHSAFlow = ai.defineFlow(
  {
    name: 'analyzeJHSAFlow',
    inputSchema: AnalyzeJHSAInputSchema,
    outputSchema: AnalyzeJHSAOutputSchema,
  },
  async (input) => {
    const {output} = await prompt(input);
    return output!;
  }
);
