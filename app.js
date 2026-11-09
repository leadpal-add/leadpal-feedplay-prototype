// LeadPal x FeedPlay prototype v1.0
// Shows the LeadPal email gate over the FeedPlay player at a fixed time.
const TRIGGER_SECONDS = 10;

const video = document.getElementById('video');
const overlay = document.getElementById('overlay');
const form = document.getElementById('leadForm');
const emailInput = document.getElementById('email');
const leadsList = document.getElementById('leads');

let captured = false;

video.addEventListener('timeupdate', () => {
  if (!captured && video.currentTime >= TRIGGER_SECONDS) {
    video.pause();
    overlay.classList.remove('hidden');
    emailInput.focus();
  }
});

form.addEventListener('submit', (e) => {
  e.preventDefault();
  const email = emailInput.value.trim();
  if (!email) return;
  captured = true;
  addLead(email);
  overlay.classList.add('hidden');
  form.reset();
  video.play();
});

function addLead(email) {
  const empty = leadsList.querySelector('.empty');
  if (empty) empty.remove();
  const li = document.createElement('li');
  li.textContent = `${email} · ${new Date().toLocaleTimeString()}`;
  leadsList.appendChild(li);
}
