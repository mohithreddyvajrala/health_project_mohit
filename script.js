/**
 * HealthMonitor — Rule-Based Risk Engine
 * Hybrid Visual Health Monitoring System (Academic Prototype)
 */

const healthForm = document.getElementById('health-form');
if (healthForm) {
  healthForm.addEventListener('submit', function (e) {
    e.preventDefault();
    assessRisk();
  });
}

function getValue(name) {
  const el = document.querySelector(`input[name="${name}"]:checked`);
  return el ? el.value : null;
}

function assessRisk() {
  const temperature = getValue('temperature');
  const pain        = getValue('pain');
  const breathing   = getValue('breathing');
  const bp          = getValue('bp');
  const emergency   = getValue('emergency');

  // Validate — all fields must be selected
  const validationMsg = document.getElementById('validation-msg');
  const patientName = document.getElementById('patient-name') ? document.getElementById('patient-name').value.trim() : 'N/A';
  const patientMobile = document.getElementById('patient-mobile') ? document.getElementById('patient-mobile').value.trim() : 'N/A';

  if (!patientName || !patientMobile || !temperature || !pain || !breathing || !bp || !emergency) {
    validationMsg.style.display = 'block';
    return;
  }
  validationMsg.style.display = 'none';

  // ── Rule Engine ──────────────────────────────────────────────
  const triggers = [];
  let level = 'low';

  // --- Critical ---
  if (pain === 'severe')            triggers.push({ label: 'Severe Pain',                  lvl: 'critical' });
  if (breathing === 'severe')       triggers.push({ label: 'Severe Breathing Difficulty',  lvl: 'critical' });
  if (emergency === 'chest_pain')   triggers.push({ label: 'Chest Pain (Emergency)',        lvl: 'critical' });
  if (emergency === 'breathing_difficulty')
                                    triggers.push({ label: 'Breathing Difficulty (Emergency)', lvl: 'critical' });

  // --- High ---
  if (temperature === 'high_fever')      triggers.push({ label: 'High Fever',         lvl: 'high' });
  if (bp === 'high')                     triggers.push({ label: 'High Blood Pressure', lvl: 'high' });
  if (pain === 'moderate')               triggers.push({ label: 'Moderate Pain',       lvl: 'high' });

  // --- Moderate ---
  if (temperature === 'mild_fever')      triggers.push({ label: 'Mild Fever',                lvl: 'moderate' });
  if (breathing === 'slight')            triggers.push({ label: 'Slight Breathing Difficulty', lvl: 'moderate' });

  // Determine overall level (worst triggered)
  if (triggers.some(t => t.lvl === 'critical'))  level = 'critical';
  else if (triggers.some(t => t.lvl === 'high')) level = 'high';
  else if (triggers.some(t => t.lvl === 'moderate')) level = 'moderate';
  else level = 'low';

  // Build trigger reason string
  const relevantTriggers = triggers.filter(t => {
    if (level === 'critical') return t.lvl === 'critical';
    if (level === 'high')     return t.lvl === 'high' || t.lvl === 'critical';
    if (level === 'moderate') return t.lvl === 'moderate';
    return false;
  });

  const triggerText = relevantTriggers.length > 0
    ? relevantTriggers.map(t => t.label).join(' + ')
    : 'All readings within normal range';

  // ── Output Map ────────────────────────────────────────────────
  const output = {
    critical: {
      icon: '&#128680;',
      levelText: 'CRITICAL RISK',
      message: 'Immediate medical attention required',
      cssClass: 'critical',
    },
    high: {
      icon: '&#9888;',
      levelText: 'HIGH RISK',
      message: 'Medical evaluation recommended',
      cssClass: 'high',
    },
    moderate: {
      icon: '&#128064;',
      levelText: 'MODERATE RISK',
      message: 'Monitor condition closely',
      cssClass: 'moderate',
    },
    low: {
      icon: '&#9989;',
      levelText: 'LOW RISK',
      message: 'Stable condition — routine follow-up',
      cssClass: 'low',
    },
  };

  const result = output[level];

  // ── Render ────────────────────────────────────────────────────
  const resultCard = document.getElementById('result-card');
  resultCard.className = 'result-card ' + result.cssClass;

  document.getElementById('result-icon').innerHTML = result.icon;
  document.getElementById('result-level').textContent = result.levelText;
  document.getElementById('result-message').textContent = result.message;
  document.getElementById('result-reason').innerHTML =
    '<strong>Triggered by:</strong> ' + triggerText +
    '<br><span style="font-size:0.85rem; color: var(--gray-400); margin-top:6px; display:block;">👤 ' + patientName + ' &nbsp;|&nbsp; 📱 ' + patientMobile + '</span>';

  const outputSection = document.getElementById('output-section');
  outputSection.style.display = 'block';

  // Smooth scroll to result
  setTimeout(() => {
    outputSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, 80);
}

function resetForm() {
  document.getElementById('health-form').reset();
  const outputSection = document.getElementById('output-section');
  outputSection.style.display = 'none';
  document.getElementById('validation-msg').style.display = 'none';
  window.scrollTo({ top: 0, behavior: 'smooth' });
}
