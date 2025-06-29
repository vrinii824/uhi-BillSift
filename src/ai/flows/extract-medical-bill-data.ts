'use server';
/**
 * @fileOverview An AI agent for extracting relevant information from medical bills.
 *
 * - extractMedicalBillData - A function that handles the data extraction process.
 */

import {ai} from '@/ai/genkit';
import {
  ExtractMedicalBillDataInputSchema,
  type ExtractMedicalBillDataInput,
  ExtractMedicalBillDataOutputSchema,
  type ExtractMedicalBillDataOutput
} from '@/lib/types';


export async function extractMedicalBillData(input: ExtractMedicalBillDataInput): Promise<ExtractMedicalBillDataOutput> {
  return extractMedicalBillDataFlow(input);
}

const prompt = ai.definePrompt({
  name: 'extractMedicalBillDataPrompt',
  input: {schema: ExtractMedicalBillDataInputSchema},
  output: {schema: ExtractMedicalBillDataOutputSchema},
  prompt: `You are an expert data extraction specialist for medical bills.

  Given the image of the medical bill, extract the following information:

  - Patient Name: The name of the patient.
  - Bill Date: The date on the medical bill.
  - Provider Name: The name of the healthcare provider.
  - Total Amount: The total amount due on the bill.
  - Account Number: The account number for the bill.
  - Insurance Name: The name of the insurance company.

  Then, carefully analyze all line items on the bill. Categorize each line item into one of the following groups: 'procedures', 'tests', or 'medications'. For each line item, extract its description, any associated billing code (like a CPT code), and the charge amount.

  Return all the extracted information in the specified JSON format.

  Medical Bill Image: {{media url=photoDataUri}}
  `,
});

const extractMedicalBillDataFlow = ai.defineFlow(
  {
    name: 'extractMedicalBillDataFlow',
    inputSchema: ExtractMedicalBillDataInputSchema,
    outputSchema: ExtractMedicalBillDataOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
