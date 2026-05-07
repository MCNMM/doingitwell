const SNHP_AUTOMATION_KEY = 'snhpAutonomousLeadSystem:v1';

const defaultTasks = [
  { channel: 'Facebook groups', action: 'Post or comment in 15 approved local groups', target: 5, status: 'open' },
  { channel: 'Short-form video', action: 'Publish 2 plan-specific reels/shorts', target: 3, status: 'open' },
  { channel: 'Google Business Profile', action: 'Publish or refresh 1 benefits post and answer Q&A', target: 2, status: 'open' },
  { channel: 'Reddit / Nextdoor', action: 'Answer 5 local Medicaid benefit questions', target: 1, status: 'open' },
  { channel: 'Partner outreach', action: 'Message 5 community partners with the checklist', target: 2, status: 'open' },
  { channel: 'Website checklist', action: 'Follow up with every CHECKLIST text or website form lead', target: 2, status: 'open' }
];

const templates = {
  'Facebook group post': {
    'All target plans': 'Have Molina, SilverSummit, or Nevada Medicaid Fee-for-Service? You may have free benefits you are not using, such as rides, wellness rewards, OTC items, pregnancy resources, gym resources, and more depending on your plan. Southern Nevada Health Pass helps members check benefits for free. Call or text 702-867-1223. Comment "benefits" and we will send the checklist. Please do not post private health information in the comments.',
    'Molina Healthcare of Nevada': 'Molina Medicaid members in Las Vegas: have you checked your wellness visit, rides, pregnancy resources, and plan extras this year? Southern Nevada Health Pass can help you review what to ask Molina about. Text MOLINA to 702-867-1223. Please do not post private health information publicly.',
    'SilverSummit Healthplan': 'SilverSummit Medicaid members: your plan may include resources for wellness visits, rides, pregnancy support, and covered services depending on eligibility and current plan rules. Text SILVERSUMMIT to 702-867-1223 for a free benefit checklist. Please do not post private health information publicly.',
    'Nevada Medicaid Fee-for-Service': 'Not sure if you have Nevada Medicaid Fee-for-Service or a managed care plan? Southern Nevada Health Pass can help you review your card and prepare the right questions. Text FFS to 702-867-1223. Please do not post private health information publicly.'
  },
  'Helpful comment reply': {
    default: 'You may want to check your plan-specific member benefits. Molina, SilverSummit, and Nevada Medicaid Fee-for-Service can have different rules for rewards, transportation, wellness visits, and covered services. Southern Nevada Health Pass helps local members review their card and benefit questions for free. You can call or text 702-867-1223. Please do not post private health information publicly.'
  },
  'Partner outreach': {
    default: 'Hi, I am reaching out from Southern Nevada Health Pass. We help local Molina, SilverSummit, and Nevada Medicaid Fee-for-Service members understand benefits they may not be using, including rides, wellness visit rewards, pregnancy resources, OTC items, and provider questions depending on their plan. Would you be open to sharing this with your community page? Call or text 702-867-1223. Text CHECKLIST for the 2026 Southern Nevada Medicaid Benefits Checklist.'
  },
  'Google Business Profile post': {
    'Molina Healthcare of Nevada': 'Molina Medicaid members in Las Vegas: Southern Nevada Health Pass helps you review benefits you may not be using, including rides, wellness visit resources, pregnancy support, and plan extras depending on eligibility and current plan rules. Call or text 702-867-1223.',
    'SilverSummit Healthplan': 'SilverSummit members may have resources for covered appointments, transportation, preventive care, pregnancy support, and more depending on the plan. Southern Nevada Health Pass helps local members understand what to ask. Text SILVERSUMMIT to 702-867-1223.',
    'Nevada Medicaid Fee-for-Service': 'Not sure if your Nevada Medicaid is Fee-for-Service or a managed care plan? Southern Nevada Health Pass can help you review your card and prepare benefit questions. Call or text 702-867-1223.',
    'All target plans': 'Southern Nevada Health Pass helps Molina, SilverSummit, and Nevada Medicaid Fee-for-Service members review benefit questions for free. Call or text 702-867-1223.'
  },
  'Short-form video script': {
    default: 'If you have Molina, SilverSummit, or Nevada Medicaid Fee-for-Service in Southern Nevada, you might be missing free benefits. Southern Nevada Health Pass helps you check rewards, rides, wellness visit options, and plan extras. Text your insurance plan name to 702-867-1223 and we will help you for free.'
  }
};

const state = loadState();

function loadState() {
  const stored = localStorage.getItem(SNHP_AUTOMATION_KEY);
  if (stored) return JSON.parse(stored);
  return {
    generatedDate: null,
    leads: [],
    tasks: [],
    followups: []
  };
}

function saveState() {
  localStorage.setItem(SNHP_AUTOMATION_KEY, JSON.stringify(state));
}

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

function generateDailyQueue() {
  const date = todayKey();
  state.generatedDate = date;
  state.tasks = defaultTasks.map((task, index) => ({
    id: `${date}-task-${index + 1}`,
    date,
    ...task
  }));
  saveState();
  render();
}

function scoreLead(lead) {
  let score = 0;
  if (lead.optIn) score += 35;
  if (lead.phone) score += 25;
  if (lead.plan !== 'Not sure') score += 20;
  if (['Transportation / rides', 'Wellness rewards', 'Pregnancy or baby resources'].includes(lead.need)) score += 10;
  if (['Google Business Profile', 'Website checklist', 'Community partner'].includes(lead.source)) score += 10;
  return Math.min(score, 100);
}

function saveLead(event) {
  event.preventDefault();
  const form = event.currentTarget;
  const lead = {
    id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now()),
    createdAt: new Date().toISOString(),
    name: form.name.value.trim(),
    phone: form.phone.value.trim(),
    plan: form.plan.value,
    source: form.source.value,
    need: form.need.value,
    optIn: form.optIn.checked,
    status: 'new'
  };
  lead.score = scoreLead(lead);
  state.leads.push(lead);
  state.followups.push({
    id: `${lead.id}-same-day`,
    leadId: lead.id,
    due: new Date().toISOString(),
    status: 'open',
    action: `Call or text ${lead.name || 'new lead'} about ${lead.need}`
  });
  saveState();
  form.reset();
  render();
}

function generateMessage() {
  const channel = document.querySelector('#message-channel').value;
  const plan = document.querySelector('#message-plan').value;
  const channelTemplates = templates[channel];
  const message = channelTemplates[plan] || channelTemplates.default || channelTemplates['All target plans'];
  document.querySelector('#generated-message').value = message;
}

async function copyMessage() {
  const messageBox = document.querySelector('#generated-message');
  messageBox.select();
  if (navigator.clipboard) await navigator.clipboard.writeText(messageBox.value);
}

function exportCsv() {
  const headers = ['createdAt', 'name', 'phone', 'plan', 'source', 'need', 'optIn', 'score', 'status'];
  const rows = state.leads.map((lead) => headers.map((header) => JSON.stringify(lead[header] ?? '')).join(','));
  const csv = [headers.join(','), ...rows].join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `snhp-leads-${todayKey()}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

function renderTasks() {
  const list = document.querySelector('#task-list');
  if (!list) return;
  const tasks = state.tasks.length ? state.tasks : defaultTasks;
  list.innerHTML = tasks.map((task) => `
    <div class="task-item">
      <div>
        <strong>${task.channel}</strong>
        <p>${task.action}</p>
      </div>
      <span>${task.target} leads</span>
    </div>
  `).join('');
}

function renderFollowups() {
  const list = document.querySelector('#followup-list');
  if (!list) return;
  if (!state.followups.length) {
    list.innerHTML = '<p class="disclaimer">No follow-ups yet. Save a lead to create the first task.</p>';
    return;
  }
  list.innerHTML = state.followups.slice(-8).reverse().map((followup) => {
    const lead = state.leads.find((item) => item.id === followup.leadId);
    return `
      <div class="task-item">
        <div>
          <strong>${lead?.name || 'New lead'} · ${lead?.plan || 'Unknown plan'}</strong>
          <p>${followup.action}</p>
        </div>
        <span>${lead?.score || 0}/100</span>
      </div>
    `;
  }).join('');
}

function renderMetrics() {
  const leads = state.leads.filter((lead) => lead.createdAt.slice(0, 10) === todayKey());
  const qualified = leads.filter((lead) => lead.score >= 70);
  const openTasks = state.tasks.length || defaultTasks.length;
  const followups = state.followups.filter((followup) => followup.status === 'open');
  document.querySelector('#metric-leads').textContent = leads.length;
  document.querySelector('#metric-qualified').textContent = qualified.length;
  document.querySelector('#metric-tasks').textContent = openTasks;
  document.querySelector('#metric-followups').textContent = followups.length;
}

function render() {
  renderTasks();
  renderFollowups();
  renderMetrics();
}

function wireEvents() {
  document.querySelector('#lead-form')?.addEventListener('submit', saveLead);
  document.querySelector('[data-action="generate-day"]')?.addEventListener('click', generateDailyQueue);
  document.querySelector('[data-action="export-csv"]')?.addEventListener('click', exportCsv);
  document.querySelector('[data-action="generate-message"]')?.addEventListener('click', generateMessage);
  document.querySelector('[data-action="copy-message"]')?.addEventListener('click', copyMessage);
}

wireEvents();
if (!state.tasks.length || state.generatedDate !== todayKey()) generateDailyQueue();
render();
