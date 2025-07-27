import { config } from 'dotenv';
config();

import '@/ai/flows/generate-safety-report-draft.ts';
import '@/ai/flows/recommend-relevant-regulations.ts';
import '@/ai/flows/analyze-checklist.ts';
