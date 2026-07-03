import { sampleData } from './sample-data.js';
import { buildMarkdownReport, verifyDeliverable } from './verifier.js';

const fields = ['jobId', 'taskType', 'taskTitle', 'taskDescription', 'aspPromise', 'deliverableText', 'userConcern'];
const state = { report: null };

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => Array.from(document.querySelectorAll(selector));

function readForm() {
  return fields.reduce((data, field) => {
    const element = document.getElementById(field);
    data[field] = element ? element.value : '';
    return data;
  }, {});
}

function fillForm(data) {
  fields.forEach((field) => {
    const element = document.getElementById(field);
    if (element && Object.prototype.hasOwnProperty.call(data, field)) {
      element.value = data[field];
    }
  });
}

function clearForm() {
  fields.forEach((field) => {
    const element = document.getElementById(field);
    if (element) element.value = field === 'taskType' ? 'smart_contract_audit' : '';
  });
}

function runVerification() {
  const input = readForm();
  state.report = verifyDeliverable(input);
  renderReport(state.report);
  
  // Smooth scroll to the results workspace when running
  const workspaceElement = document.getElementById('workspace');
  if (workspaceElement) {
    workspaceElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

// Helper to animate the SVG score circles
function updateCircleProgress(elementId, score, verdict) {
  const circle = document.getElementById(elementId);
  if (!circle) return;
  
  const radius = 42;
  const circumference = 2 * Math.PI * radius; // 263.89
  const offset = circumference - (score / 100) * circumference;
  
  // Apply the stroke offset
  circle.style.strokeDashoffset = offset;
  
  // Map verdict classes to corresponding theme colors
  let color = '#10b981'; // green default
  if (verdict === 'accept') color = '#10b981';
  else if (verdict === 'minor_revision' || verdict === 'request_revision') color = '#f59e0b'; // yellow/amber
  else if (verdict === 'reject_ready') color = '#ef4444'; // red
  
  // Set custom CSS variables on the SVG element
  circle.style.setProperty('--verdict-color', color);
  
  // Set custom color classes for the text wrapper as well
  const wrapper = circle.closest('.score-circle-wrapper');
  if (wrapper) {
    wrapper.style.setProperty('--verdict-color', color);
  }
}

function renderReport(report) {
  $('#totalScore').textContent = report.totalScore;
  $('#heroScore').textContent = report.totalScore;
  $('#verdictLabel').textContent = report.verdictLabel;
  $('#heroVerdict').textContent = report.verdictLabel;
  $('#verdictSummary').textContent = report.summary;
  
  // Update status pill and animate progress circles
  const riskPill = $('#riskPill');
  riskPill.textContent = report.riskLevel;
  riskPill.className = `status-pill ${report.verdict}`;

  // Animate both circular progress indicators
  updateCircleProgress('heroScoreCircle', report.totalScore, report.verdict);
  updateCircleProgress('totalScoreCircle', report.totalScore, report.verdict);

  renderRubric(report);
  renderHeroMiniBars(report);
  renderCoverage(report.coverageMatrix);

  $('#suggestedReply').textContent = report.suggestedReply;
  $('#evidencePack').textContent = report.evidencePack;
  $('#jsonReport').textContent = JSON.stringify(report, null, 2);
}

function renderRubric(report) {
  const items = [
    ['Spec match', report.scores.specMatch, 40],
    ['Acceptance met', report.scores.acceptanceMet, 30],
    ['Functional correctness', report.scores.functionalCorrectness, 20],
    ['Professional standard', report.scores.professionalStandard, 10]
  ];

  $('#rubricGrid').innerHTML = items
    .map(([label, value, max]) => {
      const percent = Math.round((value / max) * 100);
      return `<div class="rubric-card">
        <span>${label}</span>
        <strong>${value}<small>/${max}</small></strong>
        <div class="bar"><b style="width:${percent}%"></b></div>
      </div>`;
    })
    .join('');
}

function renderHeroMiniBars(report) {
  const items = [
    ['Spec match', report.scores.specMatch, 40],
    ['Acceptance', report.scores.acceptanceMet, 30],
    ['Functional', report.scores.functionalCorrectness, 20],
    ['Professional', report.scores.professionalStandard, 10]
  ];

  const rows = $$('.mini-bar-row');
  rows.forEach((row, index) => {
    const item = items[index];
    if (!item) return;
    const [label, value, max] = item;
    const percent = Math.round((value / max) * 100);
    const labelNode = row.querySelector('span');
    const valueNode = row.querySelector('strong');
    const barNode = row.querySelector('.bar-inner');
    if (labelNode) labelNode.textContent = label;
    if (valueNode) valueNode.textContent = `${percent}%`;
    if (barNode) barNode.style.setProperty('--w', `${percent}%`);
  });
}

function renderCoverage(rows) {
  $('#coverageRows').innerHTML = rows
    .map((row) => `<tr>
      <td>${escapeHtml(row.requirement)}</td>
      <td><span class="matrix-status ${row.status}">${row.status}</span></td>
      <td>${escapeHtml(row.evidence)}</td>
      <td>${row.issue ? escapeHtml(row.issue) : '<span class="muted">—</span>'}</td>
    </tr>`)
    .join('');
}

function setActiveTab(name) {
  $$('.tab').forEach((button) => button.classList.toggle('active', button.dataset.tab === name));
  $$('.tab-body').forEach((body) => body.classList.remove('active'));
  $(`#${name}Tab`).classList.add('active');
}

async function copyElementText(id) {
  const text = document.getElementById(id)?.textContent || '';
  if (!text.trim()) return;
  await navigator.clipboard.writeText(text);
  showToast('Copied to clipboard');
}

function downloadMarkdown() {
  if (!state.report) return;
  const markdown = buildMarkdownReport(state.report);
  const blob = new Blob([markdown], { type: 'text/markdown;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `agentproof-${state.report.jobId || 'report'}.md`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function showToast(message) {
  const toast = $('#toast');
  toast.textContent = message;
  toast.classList.add('show');
  window.setTimeout(() => toast.classList.remove('show'), 1800);
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function init() {
  fillForm(sampleData);
  runVerification();

  $('#loadSample').addEventListener('click', () => {
    fillForm(sampleData);
    runVerification();
    showToast('Sample loaded');
  });

  $('#heroLoad').addEventListener('click', () => {
    fillForm(sampleData);
    runVerification();
    showToast('Sample loaded');
  });

  $('#heroRun').addEventListener('click', runVerification);
  $('#runVerification').addEventListener('click', runVerification);
  $('#clearForm').addEventListener('click', clearForm);
  $('#downloadMarkdown').addEventListener('click', downloadMarkdown);

  $$('.tab').forEach((button) => button.addEventListener('click', () => setActiveTab(button.dataset.tab)));
  $$('[data-copy]').forEach((button) => button.addEventListener('click', () => copyElementText(button.dataset.copy)));
}

document.addEventListener('DOMContentLoaded', init);
