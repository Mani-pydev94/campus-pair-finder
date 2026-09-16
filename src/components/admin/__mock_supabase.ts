// TEMPORARY mock for client-render probe only.
const seededCategories = [
  { id: '0534838d-7b78-4a3c-a504-a32a2a28ac36', name: 'Values', description: null, display_order: 0, emoji: '✨', tone: 'bg-brand/10 text-brand', is_active: true },
];
const seededQuestions = Array.from({ length: 6 }, (_, i) => ({
  id: 'q-' + i, external_id: 'ext-' + i, category_id: '0534838d-7b78-4a3c-a504-a32a2a28ac36',
  question_text: 'Sample question ' + i, description: null, question_type: 'multiple_choice',
  options: ['Strongly Agree', 'Agree', 'Neutral', 'Disagree', 'Strongly Disagree'],
  display_order: i, is_active: true, is_required: true, ai_insight: null, emoji: '❓',
}));

function makeResult(rows: any[]) {
  const p: any = Promise.resolve({ data: rows, error: null });
  p.order = () => Promise.resolve({ data: rows, error: null });
  p.eq = () => Promise.resolve({ data: rows, error: null });
  p.single = () => Promise.resolve({ data: rows[0] ?? null, error: null });
  p.maybeSingle = () => Promise.resolve({ data: rows[0] ?? null, error: null });
  return p;
}

function from(table: string) {
  const rows = table === 'questionnaire_categories' ? seededCategories
    : table === 'questionnaire_questions' ? seededQuestions : [];
  return { select: () => makeResult(rows) };
}

export const supabase = {
  auth: { getSession: async () => ({ data: { session: { access_token: 'fake.jwt.token', user: { id: 'u1' } } } }) },
  from,
};
