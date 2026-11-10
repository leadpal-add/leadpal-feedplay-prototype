// LeadPal x FeedPlay prototype v1.1
// LeadPal gate over the FeedPlay player: social sign-up (simulated), adjustable trigger,
// required or optional gate, lead table, usage-fee estimate and CSV export.
const FEE_PER_LEAD = 0.09;

const $ = (id) => document.getElementById(id);
const video = $('video');
const overlay = $('overlay');
const form = $('leadForm');
const nameInput = $('name');
const emailInput = $('email');
const simNote = $('simNote');
const simSource = $('simSource');
const skipBtn = $('skipBtn');
const triggerPct = $('triggerPct');
const gateMode = $('gateMode');
const leadsBody = $('leads');
const exportBtn = $('exportBtn');

const leads = [];
let gateDone = false;   // captured or skipped for this viewing
let source = 'Email';

function triggerTime() {
  return video.duration ? video.duration * (Number(triggerPct.value) / 100) : Infinity;
}

video.addEventListener('timeupdate', () => {
  if (!gateDone && overlay.classList.contains('hidden') && video.currentTime >= triggerTime()) {
    openGate();
  }
});

function openGate() {
  video.pause();
  source = 'Email';
  simNote.classList.add('hidden');
  skipBtn.classList.toggle('hidden', gateMode.value !== 'soft');
  overlay.classList.remove('hidden');
}

function closeGate() {
  gateDone = true;
  overlay.classList.add('hidden');
  form.reset();
  video.play();
}

document.querySelectorAll('.soc').forEach((btn) => {
  btn.addEventListener('click', () => {
    source = btn.dataset.source;
    simSource.textContent = source;
    simNote.classList.remove('hidden');
    nameInput.focus();
  });
});

form.addEventListener('submit', (e) => {
  e.preventDefault();
  const name = nameInput.value.trim();
  const email = emailInput.value.trim();
  if (!name || !email) return;
  leads.push({
    name, email, source,
    videoTime: Math.round(video.currentTime),
    capturedAt: new Date().toISOString(),
  });
  renderLeads();
  closeGate();
});

skipBtn.addEventListener('click', closeGate);

$('resetBtn').addEventListener('click', () => {
  gateDone = false;
  overlay.classList.add('hidden');
  video.currentTime = 0;
  video.play();
});

function fmt(s) {
  const m = Math.floor(s / 60);
  return `${m}:${String(s % 60).padStart(2, '0')}`;
}

function renderLeads() {
  leadsBody.innerHTML = '';
  leads.forEach((l) => {
    const tr = document.createElement('tr');
    [l.name, l.source, fmt(l.videoTime)].forEach((v) => {
      const td = document.createElement('td');
      td.textContent = v;
      tr.appendChild(td);
    });
    leadsBody.appendChild(tr);
  });
  $('leadCount').textContent = `${leads.length} ${leads.length === 1 ? 'lead' : 'leads'}`;
  $('fee').textContent = `$${(leads.length * FEE_PER_LEAD).toFixed(2)}`;
  exportBtn.disabled = leads.length === 0;
}

exportBtn.addEventListener('click', () => {
  const head = ['name', 'email', 'source', 'video_time_seconds', 'captured_at'];
  const esc = (v) => `"${String(v).replace(/"/g, '""')}"`;
  const rows = leads.map((l) => [l.name, l.email, l.source, l.videoTime, l.capturedAt].map(esc).join(','));
  const blob = new Blob([[head.join(','), ...rows].join('\n')], { type: 'text/csv' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'leadpal-feedplay-leads.csv';
  a.click();
  URL.revokeObjectURL(a.href);
});
