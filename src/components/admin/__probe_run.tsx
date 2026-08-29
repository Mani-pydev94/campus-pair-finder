import React from 'react';
import { renderToString } from 'react-dom/server';

// Mock supabase BEFORE importing the component module graph.
const seededCategories = [
  { id: '0534838d-7b78-4a3c-a504-a32a2a28ac36', name: 'Values', description: null, display_order: 0, emoji: '✨', tone: 'bg-brand/10 text-brand', is_active: true },
];
const seededQuestions = Array.from({ length: 6 }, (_, i) => ({
  id: 'q-' + i, external_id: 'ext-' + i, category_id: '0534838d-7b78-4a3c-a504-a32a2a28ac36',
  question_text: 'Sample question ' + i, description: null, question_type: 'multiple_choice',
  options: ['Strongly Agree', 'Agree', 'Neutral', 'Disagree', 'Strongly Disagree'],
  display_order: i, is_active: true, is_required: true, ai_insight: null, emoji: '❓',
}));

const fakeFrom = (rows: any[]) => ({
  select: () => ({ order: () => Promise.resolve({ data: rows, error: null }), eq: () => ({ order: () => Promise.resolve({ data: rows, error: null }) }) }),
});

const mockSupabase = {
  auth: { getSession: async () => ({ data: { session: { access_token: 'fake.jwt.token', user: { id: 'u1' } } } }) },
  from: (table: string) => {
    if (table === 'questionnaire_categories') return fakeFrom(seededCategories);
    if (table === 'questionnaire_questions') return fakeFrom(seededQuestions);
    return fakeFrom([]);
  },
};
(globalThis as any).__mockSupabase = mockSupabase;

// Patch the client module's export.
await import('@/integrations/supabase/client').then((m: any) => {
  // client.ts exports `supabase` as a Proxy; we can't easily replace it.
});

import { QuestionnaireManager } from './__probe_QM';

const noop = async () => ({ ok: true, error: null });
const html = renderToString(React.createElement(QuestionnaireManager, { deleteQuestion: noop }));
console.log('RENDER-OK length:', html.length);
