import React from 'react';
import { createRoot } from 'react-dom/client';
import { QuestionnaireManager } from '@/components/admin/__probe_QM';

const noop = async () => ({ ok: true, error: null });
const el = document.getElementById('root')!;
createRoot(el).render(React.createElement(QuestionnaireManager, { deleteQuestion: noop as any }));

setTimeout(() => {
  const btns = Array.from(document.querySelectorAll('button')) as HTMLButtonElement[];
  const q = btns.find((b) => (b.textContent || '').trim() === 'Questions');
  console.log('[PROBE] Questions button found:', !!q);
  if (q) q.click();
  setTimeout(() => {
    const hasQ = Array.from(document.querySelectorAll('h3')).some((h) => (h.textContent || '').startsWith('Sample question'));
    console.log('[PROBE] question cards visible:', hasQ);
    console.log('[PROBE] root len:', el.innerHTML.length);
    console.log('[PROBE] contains "No questions":', !!el.innerHTML.includes('No questions'));
  }, 1500);
}, 1500);
