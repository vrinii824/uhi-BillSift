'use server';

/**
 * @fileOverview Analyzes extracted medical bill data for common billing errors and overcharges.
 *
 * - detectBillingErrors - A function that analyzes medical bill data for errors.
 */

import {ai} from '@/ai/genkit';
import {
    DetectBillingErrorsInputSchema,
    type DetectBillingErrorsInput,
    DetectBillingErrorsOutputSchema,
    type DetectBillingErrorsOutput,
} from '@/lib/types';


export async function detectBillingErrors(input: DetectBillingErrorsInput): Promise<DetectBillingErrorsOutput> {
  return detectBillingErrorsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'detectBillingErrorsPrompt',
  input: {schema: DetectBillingErrorsInputSchema},
  output: {schema: DetectBillingErrorsOutputSchema},
  prompt: `You are an expert medical billing auditor focused on accountability and transparency. Your primary goal is to identify potential overcharges and duplicate billings.

Analyze the extracted line items from the medical bill. Your analysis should be based on the provided list of common billing errors.

**Your Tasks:**
1.  **Check for Duplicate Services:** Scrutinize the list of procedures, tests, and medications for any identical line items (same description, code, and charge) that appear more than once without clear justification.
2.  **Flag Potential Overcharges (Upcoding):** While you cannot know the exact service provided, look for charges that seem unusually high for a given description, or services that are commonly bundled but billed separately. Use the provided billing error database for guidance.
3.  **Generate a Report:** Based on your findings, provide a clear summary and a detailed report. The tone should be objective and factual.

- If you find duplicates, list them clearly.
- If you suspect overcharges, explain why.
- If no definite errors are found, state that the bill appears to be transparent and accurate based on the provided information.

**Extracted Data:**
{{{extractedData}}}

**Common Billing Errors Guide:**
{{{billingErrorDatabase}}}

Provide the analysis in the specified JSON output format. Be conservative and only flag issues with a high degree of certainty.
`,
});

const detectBillingErrorsFlow = ai.defineFlow(
  {
    name: 'detectBillingErrorsFlow',
    inputSchema: DetectBillingErrorsInputSchema,
    outputSchema: DetectBillingErrorsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
