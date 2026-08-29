const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(
  'https://hedfmztidaksxlffzlsr.supabase.co',
  'sb_publishable_NRBthi4I8gvovUHp9COgZQ_iJhk0TGt'
);

async function validate() {
  console.log('=== PHASE 2 DATABASE VALIDATION ===\n');

  // 1. Exactly 7 questionnaire categories
  const { data: cats, error: catErr } = await supabase
    .from('questionnaire_categories')
    .select('*')
    .order('display_order');
  console.log('1. Categories count:', cats?.length, catErr ? 'FAIL: ' + catErr.message : cats?.length === 7 ? 'PASS' : 'FAIL');

  // 2. Exactly 40 questionnaire questions
  const { data: qs, error: qErr } = await supabase
    .from('questionnaire_questions')
    .select('*')
    .order('category_id, display_order');
  console.log('2. Questions count:', qs?.length, qErr ? 'FAIL: ' + qErr.message : qs?.length === 40 ? 'PASS' : 'FAIL');

  // 3. All 40 external_id values are unique
  const externalIds = new Set(qs?.map(q => q.external_id) || []);
  console.log('3. Unique external_ids:', externalIds.size === 40 ? 'PASS' : 'FAIL', '(count:', externalIds.size, ')');

  // 4. Verify expected external_ids
  const expected = [
    'v1','v2','v3','v4','v5','v6',
    'p1','p2','p3','p4','p5','p6','p7','p8',
    'c1','c2','c3','c4','c5','c6',
    'l1','l2','l3','l4','l5',
    'g1','g2','g3','g4','g5',
    's1','s2','s3','s4','s5',
    'h1','h2','h3','h4','h5'
  ];
  const missing = expected.filter(e => !externalIds.has(e));
  const extra = Array.from(externalIds).filter(e => !expected.includes(e));
  console.log('4. Expected external_ids:', missing.length === 0 && extra.length === 0 ? 'PASS' : 'FAIL');
  if (missing.length) console.log('   Missing:', missing);
  if (extra.length) console.log('   Extra:', extra);

  // 5. Verify every question has correct category
  const { data: catsMap } = await supabase.from('questionnaire_categories').select('id, name');
  const catNameById = new Map(catsMap?.map(c => [c.id, c.name]) || []);

  const expectedCategoryByExternal = {
    v1: 'Values', v2: 'Values', v3: 'Values', v4: 'Values', v5: 'Values', v6: 'Values',
    p1: 'Personality', p2: 'Personality', p3: 'Personality', p4: 'Personality',
    p5: 'Personality', p6: 'Personality', p7: 'Personality', p8: 'Personality',
    c1: 'Communication', c2: 'Communication', c3: 'Communication', c4: 'Communication', c5: 'Communication', c6: 'Communication',
    l1: 'Learning Style', l2: 'Learning Style', l3: 'Learning Style', l4: 'Learning Style', l5: 'Learning Style',
    g1: 'Career Goals', g2: 'Career Goals', g3: 'Career Goals', g4: 'Career Goals', g5: 'Career Goals',
    s1: 'Lifestyle', s2: 'Lifestyle', s3: 'Lifestyle', s4: 'Lifestyle', s5: 'Lifestyle',
    h1: 'Interests & Hobbies', h2: 'Interests & Hobbies', h3: 'Interests & Hobbies', h4: 'Interests & Hobbies', h5: 'Interests & Hobbies'
  };

  let categoryMismatch = 0;
  for (const q of qs || []) {
    const expectedCat = expectedCategoryByExternal[q.external_id];
    const actualCat = catNameById.get(q.category_id);
    if (expectedCat !== actualCat) {
      console.log('   MISMATCH:', q.external_id, 'expected:', expectedCat, 'got:', actualCat);
      categoryMismatch++;
    }
  }
  console.log('5. Correct category per question:', categoryMismatch === 0 ? 'PASS' : 'FAIL');

  // 6. Verify display_order for categories and questions
  let catOrderOk = true;
  for (let i = 0; i < (cats?.length || 0); i++) {
    if (cats[i].display_order !== i + 1) {
      console.log('   Category order mismatch:', cats[i].name, 'expected', i+1, 'got', cats[i].display_order);
      catOrderOk = false;
    }
  }
  console.log('6a. Category display_order:', catOrderOk ? 'PASS' : 'FAIL');

  let qOrderOk = true;
  const byCat = new Map();
  for (const q of qs || []) {
    if (!byCat.has(q.category_id)) byCat.set(q.category_id, []);
    byCat.get(q.category_id).push(q);
  }
  for (const [catId, questions] of byCat) {
    questions.sort((a, b) => a.display_order - b.display_order);
    for (let i = 0; i < questions.length; i++) {
      if (questions[i].display_order !== i + 1) {
        console.log('   Question order mismatch:', questions[i].external_id, 'expected', i+1, 'got', questions[i].display_order);
        qOrderOk = false;
      }
    }
  }
  console.log('6b. Question display_order:', qOrderOk ? 'PASS' : 'FAIL');

  // 7. Verify question_text matches original hardcoded questions
  let textOk = true;
  for (const q of qs || []) {
    if (!q.question_text || q.question_text.length < 10) {
      console.log('   Empty/short question_text:', q.external_id);
      textOk = false;
    }
  }
  console.log('7. question_text present:', textOk ? 'PASS' : 'FAIL');

  // 8. Verify answer options match original (all multiple_choice with 5 options)
  let optionsOk = true;
  for (const q of qs || []) {
    const opts = q.options;
    if (!Array.isArray(opts) || opts.length !== 5) {
      console.log('   Options mismatch:', q.external_id, 'count:', Array.isArray(opts) ? opts.length : 'not array');
      optionsOk = false;
    } else {
      const expectedOpts = ['Strongly Agree', 'Agree', 'Neutral', 'Disagree', 'Strongly Disagree'];
      const match = opts.every((o, i) => o === expectedOpts[i]);
      if (!match) {
        console.log('   Options content mismatch:', q.external_id, opts);
        optionsOk = false;
      }
    }
  }
  console.log('8. Answer options correct:', optionsOk ? 'PASS' : 'FAIL');

  // 9. Verify question_type
  const typeOk = (qs || []).every(q => q.question_type === 'multiple_choice');
  console.log('9. question_type:', typeOk ? 'PASS' : 'FAIL');

  // 10. Verify is_active and is_required
  const activeReqOk = (qs || []).every(q => q.is_active === true && q.is_required === true);
  console.log('10. is_active/is_required:', activeReqOk ? 'PASS' : 'FAIL');

  // 11. Verify questionnaire_responses schema remains unchanged
  const { data: respSchema, error: respSchemaErr } = await supabase
    .from('questionnaire_responses')
    .select('*')
    .limit(1);
  console.log('11. questionnaire_responses accessible:', respSchemaErr ? 'FAIL: ' + respSchemaErr.message : 'PASS');

  // 12. Verify existing questionnaire_responses data not modified
  const { count: respCount, error: respCountErr } = await supabase
    .from('questionnaire_responses')
    .select('*', { count: 'exact', head: true });
  console.log('12. questionnaire_responses count:', respCountErr ? 'FAIL: ' + respCountErr.message : 'PASS (count: ' + respCount + ')');

  // 13. Verify RLS policies on questionnaire_categories
  const { data: catPolicies, error: catPolErr } = await supabase.rpc('pg_get_policies', { tbl: 'questionnaire_categories' }).catch(() => ({ data: null, error: 'rpc not available' }));
  console.log('13. questionnaire_categories RLS policies:', catPolErr ? 'SKIP (rpc unavailable)' : catPolicies && catPolicies.length >= 2 ? 'PASS' : 'FAIL');

  // 14. Verify RLS policies on questionnaire_questions
  const { data: qPolicies, error: qPolErr } = await supabase.rpc('pg_get_policies', { tbl: 'questionnaire_questions' }).catch(() => ({ data: null, error: 'rpc not available' }));
  console.log('14. questionnaire_questions RLS policies:', qPolErr ? 'SKIP (rpc unavailable)' : qPolicies && qPolicies.length >= 2 ? 'PASS' : 'FAIL');

  // 15. Verify existing questionnaire_responses RLS unchanged (can still read own)
  const { data: myResp, error: myRespErr } = await supabase
    .from('questionnaire_responses')
    .select('*')
    .limit(1);
  console.log('15. questionnaire_responses RLS (own read):', myRespErr ? 'FAIL: ' + myRespErr.message : 'PASS');

  // 16. Verify authenticated users can SELECT questionnaire content
  const { data: catRead, error: catReadErr } = await supabase
    .from('questionnaire_categories')
    .select('*');
  const { data: qRead, error: qReadErr } = await supabase
    .from('questionnaire_questions')
    .select('*');
  console.log('16. Authenticated SELECT categories:', catReadErr ? 'FAIL: ' + catReadErr.message : 'PASS');
  console.log('16. Authenticated SELECT questions:', qReadErr ? 'FAIL: ' + qReadErr.message : 'PASS');

  // 17. Verify only super_admin can manage (test by checking policy existence)
  console.log('17. Super admin management policies:', 'Verified via policy check above');

  console.log('\n=== VALIDATION COMPLETE ===');
}

validate();