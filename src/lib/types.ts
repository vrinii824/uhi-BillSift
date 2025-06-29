import { z } from 'zod';

// Schemas from extract-medical-bill-data.ts
const LineItemSchema = z.object({
  description: z.string().describe('Description of the service or item.'),
  code: z.string().optional().describe('Billing code (e.g., CPT, HCPCS) for the item.'),
  charge: z.number().describe('The amount charged for the item.'),
});

export const ExtractMedicalBillDataInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo of a medical bill, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'"
    ),
});
export type ExtractMedicalBillDataInput = z.infer<typeof ExtractMedicalBillDataInputSchema>;

export const ExtractMedicalBillDataOutputSchema = z.object({
  patientName: z.string().describe("The patient's name."),
  billDate: z.string().describe('The date on the medical bill.'),
  providerName: z.string().describe('The name of the healthcare provider.'),
  totalAmount: z.number().describe('The total amount due on the bill.'),
  accountNumber: z.string().describe('The account number for the bill.'),
  insuranceName: z.string().describe('The name of the insurance company.'),
  procedures: z.array(LineItemSchema).describe('A list of all medical procedures.'),
  tests: z.array(LineItemSchema).describe('A list of all diagnostic tests.'),
  medications: z.array(LineItemSchema).describe('A list of all prescribed medications.'),
});
export type ExtractMedicalBillDataOutput = z.infer<typeof ExtractMedicalBillDataOutputSchema>;


// Schemas from detect-billing-errors.ts
export const DetectBillingErrorsInputSchema = z.object({
  extractedData: z
    .string()
    .describe("Extracted data from the medical bill, including charges, codes, and descriptions."),
  billingErrorDatabase: z
    .string()
    .describe("A database of common billing errors, overcharges, and fraud indicators."),
});
export type DetectBillingErrorsInput = z.infer<typeof DetectBillingErrorsInputSchema>;

export const DetectBillingErrorsOutputSchema = z.object({
  errorsDetected: z.boolean().describe("Whether any potential billing errors were detected."),
  errorSummary: z.string().describe("A summary of the potential billing errors detected."),
  detailedReport: z.string().describe("A detailed report of each potential billing error, including the specific charge, the potential error, and the reasoning."),
});
export type DetectBillingErrorsOutput = z.infer<typeof DetectBillingErrorsOutputSchema>;


// Schemas from generate-appeal-letter.ts
export const GenerateAppealLetterInputSchema = z.object({
  extractedData: ExtractMedicalBillDataOutputSchema,
  errorAnalysis: DetectBillingErrorsOutputSchema,
});
export type GenerateAppealLetterInput = z.infer<typeof GenerateAppealLetterInputSchema>;

export const GenerateAppealLetterOutputSchema = z.object({
  appealLetter: z.string().describe("The generated appeal letter draft."),
});
export type GenerateAppealLetterOutput = z.infer<typeof GenerateAppealLetterOutputSchema>;


// Existing types
export type AnalysisResult = {
  extractedData: ExtractMedicalBillDataOutput;
  errorAnalysis: DetectBillingErrorsOutput;
  appealLetter: string;
};

export type ServerActionResponse<T> =
  | { data: T; error?: never }
  | { data?: never; error: string };
