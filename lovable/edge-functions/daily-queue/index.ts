import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
};

const queue = [
  ['Facebook groups', 'organic_interactions', 'Post or comment in 15 approved local groups', 'Use privacy-safe plan-specific copy and move interested members to private intake.', 5],
  ['Short-form video', 'content_post', 'Publish 2 plan-specific reels/shorts', 'Use local keywords and CTA to text MOLINA, SILVERSUMMIT, FFS, or CHECKLIST.', 3],
  ['Google Business Profile', 'local_search', 'Publish or refresh 1 benefits post and answer Q&A', 'Use may-qualify language and link to the checklist page.', 2],
  ['Reddit / Nextdoor', 'helpful_reply', 'Answer 5 local Medicaid benefit questions', 'Answer with value first and no public PHI requests.', 1],
  ['Partner outreach', 'partner_message', 'Message 5 community partners with the checklist', 'Prioritize food, church, school, pregnancy, disability, housing, and recovery resources.', 2],
  ['Follow-up review', 'lead_followup', 'Call or text every same-day qualified lead', 'Work highest scores first and document consent before texting.', 2]
];

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  );

  const now = new Date();
  const metricDate = now.toISOString().slice(0, 10);
  const dueAt = new Date(now);
  dueAt.setHours(8, 0, 0, 0);

  const tasks = queue.map(([channel, taskType, title, instructions, expectedLeads]) => ({
    due_at: dueAt.toISOString(),
    channel,
    task_type: taskType,
    title,
    instructions,
    expected_leads: expectedLeads
  }));

  const { data: existing } = await supabase
    .from('outreach_tasks')
    .select('id')
    .gte('due_at', `${metricDate}T00:00:00.000Z`)
    .lt('due_at', `${metricDate}T23:59:59.999Z`)
    .eq('task_type', 'organic_interactions')
    .limit(1);

  if (!existing?.length) {
    const { error } = await supabase.from('outreach_tasks').insert(tasks);
    if (error) return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: corsHeaders });
  }

  return new Response(JSON.stringify({ ok: true, date: metricDate, tasks_created: existing?.length ? 0 : tasks.length }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
});
