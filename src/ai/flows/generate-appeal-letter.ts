'use server';
/**
 * @fileOverview Generates a draft appeal letter based on detected billing errors.
 *
 * - generateAppealLetter - A function that generates an appeal letter.
 */

import {ai} from '@/ai/genkit';
import {
  GenerateAppealLetterInputSchema,
  type GenerateAppealLetterInput,
  GenerateAppealLetterOutputSchema,
  type GenerateAppealLetterOutput,
} from '@/lib/types';


export async function generateAppealLetter(input: GenerateAppealLetterInput): Promise<GenerateAppealLetterOutput> {
  return generateAppealLetterFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateAppealLetterPrompt',
  input: {schema: GenerateAppealLetterInputSchema},
  output: {schema: GenerateAppealLetterOutputSchema},
  prompt: `You are a patient advocate and an expert in medical billing correspondence. Your task is to write a professional and clear appeal letter to a healthcare provider based on a medical bill analysis.

The user has analyzed their medical bill and found potential errors. Use the provided bill data and error report to draft a letter.

**Letter Requirements:**
1.  **Tone:** Polite, respectful, but firm and clear.
2.  **Structure:**
    *   **Patient Information:** Start by clearly identifying the patient (Name: {{{extractedData.patientName}}}, Account Number: {{{extractedData.accountNumber}}}).
    *   **Purpose:** State that the letter is regarding a bill dated {{{extractedData.billDate}}} and that you are seeking clarification on potential billing discrepancies.
    *   **Details:** Reference the specific errors identified in the 'Detailed Report'. For each error, clearly state the service/charge in question and why it appears to be an error. Use the detailed report as the source for this section.
    *   **Request:** Politely request a detailed, itemized review of the charges and a corrected bill to be sent.
    *   **Closing:** End with a professional closing ("Sincerely,") and a placeholder for the user's name ("[Your Name]").
3.  **Content:** Do not add any information not present in the context. The letter should be addressed to the provider ("To Whom It May Concern at {{{extractedData.providerName}}},").

**Context for the letter:**

**Error Analysis Report:**
{{{errorAnalysis.detailedReport}}}

Based on all the information above, generate the appeal letter as a single block of text.
`,
});

const generateAppealLetterFlow = ai.defineFlow(
  {
    name: 'generateAppealLetterFlow',
    inputSchema: GenerateAppealLetterInputSchema,
    outputSchema: GenerateAppealLetterOutputSchema,
  },
  async input => {
    // We only generate a letter if errors were actually detected.
    if (!input.errorAnalysis.errorsDetected) {
      return { appealLetter: '' };
    }
    const {output} = await prompt(input);
    return output!;
  }
);
