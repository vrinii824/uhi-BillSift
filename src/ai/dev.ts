import { config } from 'dotenv';
config();

import '@/ai/flows/extract-medical-bill-data.ts';
import '@/ai/flows/detect-billing-errors.ts';
import '@/ai/flows/generate-appeal-letter.ts';
