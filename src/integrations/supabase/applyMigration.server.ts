// TEMPORARY SERVER-ONLY module to apply the questionnaire_responses constraint migration
// This file will be deleted after migration is applied.
// DO NOT import from client-bundle code.
import { supabaseAdmin } from "./client.server";

export async function applyQuestionnaireResponsesMigration(): Promise<{
  ok: boolean;
  error: string | null;
  details: string;
}> {
  // Use PostgREST's ability to execute raw SQL via the service role
  // We'll use the Supabase JavaScript client's .rpc() to call a SQL execution function

  // Method 1: Try pg_query (PostgreSQL extension)
  try {
    // @ts-expect-error - pg_query is a custom RPC function
    const { error: pgQueryError } = await supabaseAdmin.rpc('pg_query', {
      query: 'SELECT 1'
    });

    if (!pgQueryError) {
      // pg_query exists, use it for the full migration
      const migrationSql = `
        ALTER TABLE public.questionnaire_responses
        DROP CONSTRAINT IF EXISTS questionnaire_responses_user_id_question_id_key;

        ALTER TABLE public.questionnaire_responses
        ADD CONSTRAINT questionnaire_responses_user_id_category_question_id_key
        UNIQUE (user_id, category, question_id);
      `;

      // @ts-expect-error - pg_query is a custom RPC function
      const { error } = await supabaseAdmin.rpc('pg_query', { query: migrationSql });
      if (error) {
        return { ok: false, error: error.message, details: 'pg_query failed' };
      }
      return { ok: true, error: null, details: 'Migration applied via pg_query' };
    }
  } catch (e) {
    console.log('pg_query not available:', e);
  }

  // Method 2: Try exec_sql
  try {
    const dropSql = `ALTER TABLE public.questionnaire_responses DROP CONSTRAINT IF EXISTS questionnaire_responses_user_id_question_id_key;`;
    const addSql = `ALTER TABLE public.questionnaire_responses ADD CONSTRAINT questionnaire_responses_user_id_category_question_id_key UNIQUE (user_id, category, question_id);`;

    // @ts-expect-error - exec_sql is a custom RPC function
    const { error: dropError } = await supabaseAdmin.rpc('exec_sql', { sql: dropSql });
    if (dropError) {
      console.log('drop error:', dropError);
    }

    // @ts-expect-error - exec_sql is a custom RPC function
    const { error: addError } = await supabaseAdmin.rpc('exec_sql', { sql: addSql });
    if (addError) {
      console.log('add error:', addError);
      return { ok: false, error: addError.message, details: 'Failed to add constraint via exec_sql' };
    }

    return { ok: true, error: null, details: 'Migration applied via exec_sql' };
  } catch (e) {
    console.log('exec_sql not available:', e);
  }

  // Method 3: Try using the Supabase Management API directly via fetch
  try {
    const serviceRoleKey = process.env['SUPABASE_SERVICE_ROLE_KEY'];
    const supabaseUrl = process.env['SUPABASE_URL'];

    if (serviceRoleKey && supabaseUrl) {
      const projectRef = supabaseUrl.match(/https:\/\/([^.]+)/)?.[1];
      if (projectRef) {
        // Use Supabase Management API to execute SQL
        const response = await fetch(`https://api.supabase.com/v1/projects/${projectRef}/database/query`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${serviceRoleKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            query: `
              ALTER TABLE public.questionnaire_responses
              DROP CONSTRAINT IF EXISTS questionnaire_responses_user_id_question_id_key;

              ALTER TABLE public.questionnaire_responses
              ADD CONSTRAINT questionnaire_responses_user_id_category_question_id_key
              UNIQUE (user_id, category, question_id);
            `
          })
        });

        if (response.ok) {
          return { ok: true, error: null, details: 'Migration applied via Management API' };
        } else {
          const errorText = await response.text();
          console.log('Management API error:', errorText);
        }
      }
    }
  } catch (e) {
    console.log('Management API not available:', e);
  }

  return { ok: false, error: 'No SQL execution method available', details: 'All methods failed' };
}

// Verification function
export async function verifyMigration(): Promise<{
  ok: boolean;
  error: string | null;
  constraints: any[];
}> {
  // Try pg_query first
  try {
    // @ts-expect-error - pg_query is a custom RPC function
    const { data, error } = await supabaseAdmin.rpc('pg_query', {
      query: `
        SELECT constraint_name, constraint_type
        FROM information_schema.table_constraints
        WHERE table_name = 'questionnaire_responses'
        AND constraint_type = 'UNIQUE';
      `
    });

    if (!error) {
      return { ok: true, error: null, constraints: Array.isArray(data) ? data : [] };
    }
  } catch (e) {
    console.log('pg_query not available for verify:', e);
  }

  // Try exec_sql
  try {
    // @ts-expect-error - exec_sql is a custom RPC function
    const { data, error } = await supabaseAdmin.rpc('exec_sql', {
      sql: `
        SELECT constraint_name, constraint_type
        FROM information_schema.table_constraints
        WHERE table_name = 'questionnaire_responses'
        AND constraint_type = 'UNIQUE;
      `
    });

    if (!error) {
      return { ok: true, error: null, constraints: Array.isArray(data) ? data : [] };
    }
  } catch (e) {
    console.log('exec_sql not available for verify:', e);
  }

  return { ok: false, error: 'No verification method available', constraints: [] };
}