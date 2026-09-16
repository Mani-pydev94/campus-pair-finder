import { renderToString } from 'react-dom/server';
import React from 'react';

async function main() {
  const mod = await import('./src/components/admin/__probe_QM.tsx');
  const QuestionnaireManager = mod.QuestionnaireManager;
  const noop = async () => ({ ok: true, error: null });
  const html = renderToString(
    React.createElement(QuestionnaireManager, { deleteQuestion: noop }),
  );
  console.log('HTML length:', html.length);
  console.log('Has "Questions" heading:', html.includes('Questions'));
  console.log('Has "Sample question":', html.includes('Sample question'));
  console.log('Has category name lookup (falls back to undefined):', html.includes('undefined'));
}
main().catch((e) => { console.error('RENDER ERROR:', e); process.exit(1); });
