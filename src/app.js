import { sampleData } from './sample-data.js';
import { buildMarkdownReport, verifyDeliverable } from './verifier.js';

const fields = ['jobId', 'taskType', 'taskTitle', 'taskDescription', 'aspPromise', 'deliverableText', 'userConcern'];
const state = { report: null };

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => Array.from(document.querySelectorAll(selector));

const savedLang = localStorage.getItem('agentproof-lang');
let currentLang = ['en', 'zh'].includes(savedLang) ? savedLang : ((navigator.language || '').toLowerCase().startsWith('zh') ? 'zh' : 'en');

const I18N = {
  en: {
    brandSubtitle: 'OKX.AI A2A verifier',
    nav: ['Workspace', 'API', 'Use Cases'],
    eyebrow: 'Built for agent-native task verification',
    heroLine1: 'Agents deliver.',
    heroLine2: 'AgentProof verifies.',
    heroDesc: 'An automated pre-acceptance checker for OKX.AI A2A workflows. Copy the task description and deliverable text, verify requirements coverage in 1 second, and secure evidence-style reports before taking action.',
    runVerification: 'Run Verification',
    loadSample: 'Load Solidity Sample',
    loadDemo: 'Load Demo',
    keyModules: 'Key modules:',
    trust: ['OKX.AI-style scoring', '4-Dimensional rubric', 'Coverage matrix', 'Evidence pack'],
    currentVerdict: 'Current verdict',
    heroMuted: 'Missing attack path and code-level remediation evidence in the demo deliverable.',
    workspaceKicker: 'Workspace',
    verificationInputs: 'Verification inputs',
    inputDesc: 'Configure task constraints and copy deliverables.',
    jobId: 'Job ID <small>(Optional)</small>',
    taskType: 'Task type',
    taskTitle: 'Task title',
    taskDesc: 'Original task description & criteria',
    aspPromise: 'ASP service promise <small>(Optional)</small>',
    deliverableText: 'Deliverable text',
    userConcern: 'User concern <small>(Optional)</small>',
    clearForm: 'Clear Form',
    reportKicker: 'Audit Report',
    resultTitle: 'Verification result',
    resultDesc: 'Generated acceptance analysis and evidence-style materials.',
    suggestedAction: 'Suggested action',
    tabs: ['Coverage Matrix', 'Suggested Reply', 'Evidence Pack', 'JSON'],
    table: ['Requirement', 'Status', 'Evidence', 'Issue'],
    terminal: {
      reply: 'suggested-reply.md',
      evidence: 'evidence-pack.md',
      json: 'report.json',
      copyReply: 'Copy Reply',
      copyEvidence: 'Copy Evidence',
      download: 'Download Markdown',
      copyJson: 'Copy JSON'
    },
    apiKicker: 'Hosted API',
    apiTitle: 'Designed for agents and workflows',
    apiDesc: 'The MVP includes a Cloudflare Pages Function contract at POST /api/verify. Future agent integrations can call the same verifier payload.',
    useCaseKicker: 'Use cases',
    useCaseTitle: 'Deliverable Verification Report',
    useCaseDesc: 'Users provide the Job ID, task description, service promise, deliverable text or files, and concerns. AgentProof returns a structured acceptance report and evidence-style pack.',
    tags: ['0.5 USDT suggested fee', 'A2A first', 'A2MCP later'],
    placeholders: {
      jobId: 'e.g. okx-a2a-task-402',
      taskTitle: 'e.g. ERC20 audit report or website layout design',
      taskDescription: 'Paste the original OKX.AI brief and acceptance criteria...',
      aspPromise: 'Paste the service description or delivery promise from the registry...',
      deliverableText: 'Paste the raw text of the deliverable delivered by the agent...',
      userConcern: 'State any specific concerns you want the checker to verify...'
    },
    taskOptions: ['Smart Contract Audit', 'Code Delivery', 'Research Report', 'Creative Deliverable', 'General Task'],
    rubric: ['Spec match', 'Acceptance met', 'Functional correctness', 'Professional standard'],
    heroRubric: ['Spec match', 'Acceptance', 'Functional', 'Professional'],
    verdicts: {
      accept: ['Accept', 'Low risk', 'The deliverable appears ready for acceptance.'],
      minor_revision: ['Minor Revision', 'Medium risk', 'The deliverable is mostly complete but should be supplemented before final acceptance.'],
      request_revision: ['Request Revision', 'Medium-high risk', 'Ask the provider to supplement missing evidence before acceptance.'],
      reject_ready: ['Reject Ready', 'High risk', 'The deliverable has major gaps and the user should prepare a structured rejection reason.']
    },
    status: { pass: 'pass', partial: 'partial', fail: 'fail' },
    copied: 'Copied to clipboard',
    sampleLoaded: 'Sample loaded'
  },
  zh: {
    brandSubtitle: 'OKX.AI A2A 验收检查器',
    nav: ['工作台', 'API', '使用场景'],
    eyebrow: '为 Agent 原生任务验收而构建',
    heroLine1: 'Agent 负责交付。',
    heroLine2: 'AgentProof 负责验证。',
    heroDesc: '面向 OKX.AI A2A 工作流的自动化验收前检查器。粘贴任务描述和交付物正文，1 秒检查需求覆盖情况，并在操作前生成证据风格报告。',
    runVerification: '运行验收检查',
    loadSample: '加载 Solidity 示例',
    loadDemo: '加载示例',
    keyModules: '核心模块：',
    trust: ['OKX.AI 风格评分', '四维评分框架', '需求覆盖矩阵', '证据包'],
    currentVerdict: '当前结论',
    heroMuted: '示例交付物缺少攻击路径和代码级修复证据。',
    workspaceKicker: '工作台',
    verificationInputs: '验收输入',
    inputDesc: '配置任务约束，并粘贴交付内容。',
    jobId: '任务 ID <small>（可选）</small>',
    taskType: '任务类型',
    taskTitle: '任务标题',
    taskDesc: '原始任务描述与验收标准',
    aspPromise: '服务承诺 <small>（可选）</small>',
    deliverableText: '交付物正文',
    userConcern: '用户关注点 <small>（可选）</small>',
    clearForm: '清空表单',
    reportKicker: '验收报告',
    resultTitle: '检查结果',
    resultDesc: '生成验收分析和证据风格材料。',
    suggestedAction: '建议动作',
    tabs: ['覆盖矩阵', '建议回复', '证据包', 'JSON'],
    table: ['要求', '状态', '证据', '问题'],
    terminal: {
      reply: '建议回复.md',
      evidence: '证据包.md',
      json: '报告.json',
      copyReply: '复制回复',
      copyEvidence: '复制证据',
      download: '下载 Markdown',
      copyJson: '复制 JSON'
    },
    apiKicker: '托管 API',
    apiTitle: '为 Agent 和工作流设计',
    apiDesc: 'MVP 包含 Cloudflare Pages Function 接口 POST /api/verify。未来的 Agent 集成可以调用同一套验证载荷。',
    useCaseKicker: '使用场景',
    useCaseTitle: '交付物验收检查报告',
    useCaseDesc: '用户提供任务 ID、任务描述、服务承诺、交付物文本或文件以及关注点。AgentProof 返回结构化验收报告和证据风格材料。',
    tags: ['建议价格 0.5 USDT', '优先 A2A', '后续 A2MCP'],
    placeholders: {
      jobId: '例如 okx-a2a-task-402',
      taskTitle: '例如 ERC20 审计报告或网站布局设计',
      taskDescription: '粘贴原始 OKX.AI 任务说明和验收标准...',
      aspPromise: '粘贴服务描述或交付承诺...',
      deliverableText: '粘贴 Agent 提交的交付物原文...',
      userConcern: '写下你希望重点检查的问题...'
    },
    taskOptions: ['智能合约审计', '代码交付', '研究报告', '创意交付', '通用任务'],
    rubric: ['规格匹配', '验收满足', '功能正确性', '专业标准'],
    heroRubric: ['规格匹配', '验收满足', '功能正确性', '专业标准'],
    verdicts: {
      accept: ['建议验收', '低风险', '交付物看起来已满足主要任务要求。'],
      minor_revision: ['小幅修改', '中等风险', '交付物大体完整，但最终验收前建议补充少量内容。'],
      request_revision: ['要求修改', '中高风险', '建议先要求服务方补充缺失证据，再考虑验收。'],
      reject_ready: ['可准备拒绝', '高风险', '交付物存在明显缺口，用户应准备结构化拒绝理由。']
    },
    status: { pass: '通过', partial: '部分满足', fail: '未满足' },
    copied: '已复制到剪贴板',
    sampleLoaded: '示例已加载'
  }
};

function ui() {
  return I18N[currentLang];
}

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
  applyLanguage();
  const workspaceElement = document.getElementById('workspace');
  if (workspaceElement) {
    workspaceElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

function updateCircleProgress(elementId, score, verdict) {
  const circle = document.getElementById(elementId);
  if (!circle) return;

  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  circle.style.strokeDashoffset = offset;

  let color = '#10b981';
  if (verdict === 'minor_revision' || verdict === 'request_revision') color = '#f59e0b';
  else if (verdict === 'reject_ready') color = '#ef4444';

  circle.style.setProperty('--verdict-color', color);
  const wrapper = circle.closest('.score-circle-wrapper');
  if (wrapper) wrapper.style.setProperty('--verdict-color', color);
}

function renderReport(report) {
  const verdict = ui().verdicts[report.verdict] || [report.verdictLabel, report.riskLevel, report.summary];
  $('#totalScore').textContent = report.totalScore;
  $('#heroScore').textContent = report.totalScore;
  $('#verdictLabel').textContent = verdict[0];
  $('#heroVerdict').textContent = verdict[0];
  $('#verdictSummary').textContent = verdict[2];

  const riskPill = $('#riskPill');
  riskPill.textContent = verdict[1];
  riskPill.className = `status-pill ${report.verdict}`;

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
  const labels = ui().rubric;
  const items = [
    [labels[0], report.scores.specMatch, 40],
    [labels[1], report.scores.acceptanceMet, 30],
    [labels[2], report.scores.functionalCorrectness, 20],
    [labels[3], report.scores.professionalStandard, 10]
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
  const labels = ui().heroRubric;
  const items = [
    [labels[0], report.scores.specMatch, 40],
    [labels[1], report.scores.acceptanceMet, 30],
    [labels[2], report.scores.functionalCorrectness, 20],
    [labels[3], report.scores.professionalStandard, 10]
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
      <td><span class="matrix-status ${row.status}">${ui().status[row.status] || row.status}</span></td>
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
  showToast(ui().copied);
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

function setButtonLabel(button, label) {
  if (!button) return;
  const svg = button.querySelector('svg');
  button.textContent = '';
  if (svg) button.appendChild(svg);
  button.append(` ${label}`);
}

function setText(selector, text) {
  const element = $(selector);
  if (element) element.textContent = text;
}

function setHtml(selector, html) {
  const element = $(selector);
  if (element) element.innerHTML = html;
}

function ensureLanguageSwitch() {
  if ($('.lang-switch')) return;
  const switcher = document.createElement('div');
  switcher.className = 'lang-switch';
  switcher.innerHTML = '<button class="lang-btn" data-lang="en">EN</button><button class="lang-btn" data-lang="zh">中文</button>';
  $('.nav')?.appendChild(switcher);
  $$('.lang-btn').forEach((button) => {
    button.addEventListener('click', () => {
      currentLang = button.dataset.lang;
      localStorage.setItem('agentproof-lang', currentLang);
      applyLanguage();
      if (state.report) renderReport(state.report);
    });
  });
}

function applyLanguage() {
  const text = ui();
  document.documentElement.lang = currentLang === 'zh' ? 'zh-CN' : 'en';
  document.title = currentLang === 'zh' ? 'AgentProof — OKX.AI 验收前检查器' : 'AgentProof — Pre-Acceptance Verifier for OKX.AI';

  $$('.lang-btn').forEach((button) => button.classList.toggle('active', button.dataset.lang === currentLang));

  setText('.brand-text span', text.brandSubtitle);
  $$('.nav-links a').forEach((link, index) => setButtonLabel(link, text.nav[index] || link.textContent.trim()));
  setText('.eyebrow', text.eyebrow);
  const heroLines = $$('.gradient-text');
  if (heroLines[0]) heroLines[0].textContent = text.heroLine1;
  if (heroLines[1]) heroLines[1].textContent = text.heroLine2;
  setText('.hero-copy > p', text.heroDesc);
  setButtonLabel($('#heroRun'), text.runVerification);
  setButtonLabel($('#heroLoad'), text.loadSample);

  const trustItems = $$('.trust-row span');
  if (trustItems[0]) trustItems[0].textContent = text.keyModules;
  text.trust.forEach((item, index) => {
    if (trustItems[index + 1]) trustItems[index + 1].textContent = item;
  });

  setText('.hero-card .card-label', text.currentVerdict);
  setText('.hero-card .muted', text.heroMuted);

  const inputHead = $$('.section-head-title')[0];
  const resultHead = $$('.section-head-title')[1];
  if (inputHead) {
    inputHead.querySelector('.section-kicker').textContent = text.workspaceKicker;
    inputHead.querySelector('h2').textContent = text.verificationInputs;
    inputHead.querySelector('p').textContent = text.inputDesc;
  }
  setButtonLabel($('#loadSample'), text.loadDemo);

  const labels = $$('.input-panel label span');
  [text.jobId, text.taskType, text.taskTitle, text.taskDesc, text.aspPromise, text.deliverableText, text.userConcern].forEach((item, index) => {
    if (labels[index]) labels[index].innerHTML = item;
  });

  Object.entries(text.placeholders).forEach(([id, placeholder]) => {
    const element = document.getElementById(id);
    if (element) element.placeholder = placeholder;
  });

  $$('#taskType option').forEach((option, index) => {
    option.textContent = text.taskOptions[index] || option.textContent;
  });

  setButtonLabel($('#runVerification'), text.runVerification);
  setButtonLabel($('#clearForm'), text.clearForm);

  if (resultHead) {
    resultHead.querySelector('.section-kicker').textContent = text.reportKicker;
    resultHead.querySelector('h2').textContent = text.resultTitle;
    resultHead.querySelector('p').textContent = text.resultDesc;
  }
  setText('.score-layout .card-label', text.suggestedAction);
  $$('.tab').forEach((tab, index) => {
    tab.textContent = text.tabs[index] || tab.textContent;
  });
  $$('#matrixTab th').forEach((th, index) => {
    th.textContent = text.table[index] || th.textContent;
  });

  const terminalTitles = $$('.terminal-title');
  if (terminalTitles[0]) terminalTitles[0].textContent = text.terminal.reply;
  if (terminalTitles[1]) terminalTitles[1].textContent = text.terminal.evidence;
  if (terminalTitles[2]) terminalTitles[2].textContent = text.terminal.json;
  const terminalButtons = $$('.terminal-action-btn');
  [text.terminal.copyReply, text.terminal.copyEvidence, text.terminal.download, text.terminal.copyJson].forEach((label, index) => {
    if (terminalButtons[index]) setButtonLabel(terminalButtons[index], label);
  });

  const infoPanels = $$('.info-grid .panel');
  if (infoPanels[0]) {
    infoPanels[0].querySelector('.section-kicker').textContent = text.apiKicker;
    infoPanels[0].querySelector('h2, h3').textContent = text.apiTitle;
    infoPanels[0].querySelector('p').textContent = text.apiDesc;
  }
  if (infoPanels[1]) {
    infoPanels[1].querySelector('.section-kicker').textContent = text.useCaseKicker;
    infoPanels[1].querySelector('h2, h3').textContent = text.useCaseTitle;
    infoPanels[1].querySelector('p').textContent = text.useCaseDesc;
    infoPanels[1].querySelectorAll('.asp-tags span').forEach((tag, index) => {
      tag.textContent = text.tags[index] || tag.textContent;
    });
  }

  if (state.report) {
    const verdict = text.verdicts[state.report.verdict];
    if (verdict) {
      setText('#verdictLabel', verdict[0]);
      setText('#heroVerdict', verdict[0]);
      setText('#verdictSummary', verdict[2]);
      setText('#riskPill', verdict[1]);
    }
  }
}

function init() {
  ensureLanguageSwitch();
  fillForm(sampleData);
  runVerification();

  $('#loadSample').addEventListener('click', () => {
    fillForm(sampleData);
    runVerification();
    showToast(ui().sampleLoaded);
  });

  $('#heroLoad').addEventListener('click', () => {
    fillForm(sampleData);
    runVerification();
    showToast(ui().sampleLoaded);
  });

  $('#heroRun').addEventListener('click', runVerification);
  $('#runVerification').addEventListener('click', runVerification);
  $('#clearForm').addEventListener('click', clearForm);
  $('#downloadMarkdown').addEventListener('click', downloadMarkdown);

  $$('.tab').forEach((button) => button.addEventListener('click', () => setActiveTab(button.dataset.tab)));
  $$('[data-copy]').forEach((button) => button.addEventListener('click', () => copyElementText(button.dataset.copy)));
}

document.addEventListener('DOMContentLoaded', init);
