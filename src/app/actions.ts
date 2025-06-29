'use server';

import { extractMedicalBillData } from '@/ai/flows/extract-medical-bill-data';
import { detectBillingErrors } from '@/ai/flows/detect-billing-errors';
import { generateAppealLetter } from '@/ai/flows/generate-appeal-letter';
import type { AnalysisResult, ServerActionResponse } from '@/lib/types';
import { z } from 'zod';
import { supabase } from '@/lib/supabase';

const fileSchema = z.instanceof(File);
const maxFileSize = 5 * 1024 * 1024; // 5MB

function toDataURI(file: File, buffer: ArrayBuffer) {
    return `data:${file.type};base64,${Buffer.from(buffer).toString('base64')}`;
}

const BILLING_ERROR_DATABASE = `
- Upcoding: Billing for a more expensive service than what was provided (e.g., billing for a 60-min session when it was 30-min).
- Unbundling: Charging separately for services that should be a single charge.
- Duplicate Billing: Charging for the same service multiple times.
- Incorrect Patient Information: Mismatched name, policy number, or other details.
- Non-covered Services: Charging for services not covered by the patient's insurance plan.
- Typographical Errors: Simple typos in codes or prices.
- Balance Billing: Illegally billing a patient for the difference between what insurance paid and what the provider charged (in-network providers).
- Outdated codes: Using CPT codes that are no longer valid.
`;

export async function analyzeBillAction(
  formData: FormData
): Promise<ServerActionResponse<AnalysisResult>> {
  try {
    const file = formData.get('file');

    const validation = fileSchema.refine(f => f.size > 0, 'File is empty.')
                                  .refine(f => f.size <= maxFileSize, 'File size exceeds 5MB.')
                                  .refine(f => f.type.startsWith('image/') || f.type === 'application/pdf', 'Only images and PDFs are supported.');

    const validationResult = validation.safeParse(file);
    if (!validationResult.success) {
      return { error: validationResult.error.errors.map(e => e.message).join(' ') };
    }
    
    const validFile = validationResult.data;
    const arrayBuffer = await validFile.arrayBuffer();
    const photoDataUri = toDataURI(validFile, arrayBuffer);

    const extractedData = await extractMedicalBillData({ photoDataUri });

    const errorAnalysis = await detectBillingErrors({
      extractedData: JSON.stringify(extractedData),
      billingErrorDatabase: BILLING_ERROR_DATABASE,
    });

    let appealLetter = '';
    if (errorAnalysis.errorsDetected) {
        const letterResult = await generateAppealLetter({ extractedData, errorAnalysis });
        appealLetter = letterResult.appealLetter;
    }

    const { error: dbError } = await supabase.from('bill_analyses').insert([
      {
        patient_name: extractedData.patientName,
        bill_date: extractedData.billDate,
        provider_name: extractedData.providerName,
        total_amount: extractedData.totalAmount,
        account_number: extractedData.accountNumber,
        insurance_name: extractedData.insuranceName,
        errors_detected: errorAnalysis.errorsDetected,
        error_summary: errorAnalysis.errorSummary,
        detailed_report: errorAnalysis.detailedReport,
        procedures: extractedData.procedures,
        tests: extractedData.tests,
        medications: extractedData.medications,
        appeal_letter: appealLetter,
      },
    ]);

    if (dbError) {
      console.error('Supabase error:', dbError);
      return { error: `Failed to save analysis to the database: ${dbError.message}` };
    }

    return { data: { extractedData, errorAnalysis, appealLetter } };
  } catch (error: any) {
    console.error('Error in analyzeBillAction:', error);
    // Genkit can sometimes wrap errors
    const errorMessage = error?.cause?.message || error.message || 'An unknown error occurred during analysis.';
    return { error: errorMessage };
  }
}
