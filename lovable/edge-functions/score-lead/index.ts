import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
};

function calculateScore(lead: Record<string, unknown>) {
  let score = 0;
  if (lead.consent_to_call_text) score += 35;
  if (lead.phone) score += 25;
  if (['Molina Healthcare of Nevada', 'SilverSummit Healthplan', 'Nevada Medicaid Fee-for-Service'].includes(String(lead.plan_type))) score += 20;
  if (['Transportation / rides', 'Wellness rewards', 'Pregnancy or baby resources', 'Provider or card help'].includes(String(lead.need))) score += 10;
  if (['Google Business Profile', 'Website checklist', 'Community partner'].includes(String(lead.source))) score += 10;
  return Math.min(score, 100);
}

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  const payload = await request.json();
  const lead = payload.record ?? payload.lead ?? payload;
  const score = calculateScore(lead);
  const status = score >= 70 ? 'qualified' : 'new';
  const leadId = lead.id;

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  );

  if (leadId) {
    await supabase.from('leads').update({ score, status, updated_at: new Date().toISOString() }).eq('id', leadId);
    await supabase.from('outreach_tasks').insert({
      lead_id: leadId,
      due_at: new Date().toISOString(),
      channel: lead.consent_to_call_text ? 'Phone / SMS' : 'Manual review',
      task_type: 'same_day_followup',
      title: score >= 70 ? 'Contact qualified lead today' : 'Review new lead for qualification',
      instructions: 'Confirm plan, need, consent, and next step. Do not request Medicaid IDs or PHI in public channels.',
      expected_leads: 0
    });
  }

  return new Response(JSON.stringify({ ok: true, score, status }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
});
