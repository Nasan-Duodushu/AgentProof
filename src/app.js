import { sampleDataByLang } from './sample-data.js';
import { REVIEW_SKILLS, buildMarkdownReport, verifyDeliverable } from './verifier.js';

const fields = ['jobId', 'taskType', 'taskTitle', 'taskDescription', 'aspPromise', 'deliverableText', 'userConcern'];
const state = { report: null };
const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => Array.from(document.querySelectorAll(selector));

const savedLang = localStorage.getItem('agentproof-lang');
let currentLang = ['en', 'zh'].includes(savedLang) ? savedLang : ((navigator.language || '').toLowerCase().startsWith('zh') ? 'zh' : 'en');

const I18N = {
  en: {
    brandSubtitle: 'Agent delivery review',
    navWorkspace: 'Workspace',
    navFlow: 'Review Flow',
    navMethod: 'Method',
    eyebrow: 'For OKX.AI Agent delivery review',
    heroLine1: 'Review an Agent delivery',
    heroLine2: 'before you accept it.',
    heroDesc: 'Paste the original task and the delivered result. AgentProof checks possible gaps, evidence quality, and drafts a clear follow-up response.',
    runReview: 'Run Review',
    loadSample: 'Load Sample Case',
    loadDemo: 'Load Demo',
    notJudge: 'Review assistant, not an official judge',
    trustChecklist: 'Requirement checklist',
    trustEvidence: 'Evidence notes',
    trustReply: 'Response draft',
    referenceScoreShort: 'ref.',
    currentRecommendation: 'Current recommendation',
    heroMuted: 'The sample delivery is useful, but key acceptance evidence is missing.',
    flowKicker: 'How it works',
    flowTitle: 'A second-opinion review before acceptance',
    flowDesc: 'AgentProof is designed for the moment after another Agent delivers work and before the user accepts it.',
    flow1Title: 'Paste the original task',
    flow1Desc: 'Include the request, acceptance criteria, and service promise if available.',
    flow2Title: 'Paste the deliverable',
    flow2Desc: 'Add the report, code summary, research output, or delivery text.',
    flow3Title: 'Get a review pack',
    flow3Desc: 'Receive a checklist, possible gaps, evidence notes, and a response draft.',
    workspaceKicker: 'Workspace',
    inputTitle: 'Review inputs',
    inputDesc: 'Use the same material a user would provide when hiring AgentProof on OKX.AI.',
    jobIdLabel: 'Job ID <small>(optional)</small>',
    taskTypeLabel: 'OKX.AI service category',
    taskTitleLabel: 'Task title',
    taskDescriptionLabel: 'Original task and acceptance criteria',
    servicePromiseLabel: 'Service promise <small>(optional)</small>',
    deliverableLabel: 'Agent deliverable',
    concernLabel: 'User concern <small>(optional)</small>',
    clearForm: 'Clear Form',
    reportKicker: 'Review Report',
    resultTitle: 'Acceptance review',
    resultDesc: 'A structured recommendation and evidence-style review notes.',
    recommendationLabel: 'Review recommendation',
    whyTitle: 'Why this matters',
    tabChecklist: 'Review Checklist',
    tabReply: 'Response Draft',
    tabEvidence: 'Evidence Notes',
    checklistNote: 'The checklist maps each task requirement to evidence found in the deliverable. It is a review aid, not an official ruling.',
    thRequirement: 'Requirement',
    thStatus: 'Status',
    thEvidence: 'Evidence',
    thIssue: 'Issue',
    replyFile: 'response-draft.md',
    evidenceFile: 'evidence-notes.md',
    copyReply: 'Copy Reply',
    copyEvidence: 'Copy Evidence',
    downloadMarkdown: 'Download Markdown',
    copyJson: 'Copy JSON',
    evidenceCardTitle: 'Evidence to check',
    issuesCardTitle: 'Common issues',
    scoreBasisTitle: 'Score basis',
    methodKicker: 'Review method',
    methodTitle: 'Transparent review logic',
    methodDesc: 'The public demo uses requirement extraction, task templates, and deterministic coverage checks. Production review can add AI-assisted semantic analysis and evidence mapping.',
    boundaryKicker: 'Boundary',
    boundaryTitle: 'Review assistant, not a judge',
    boundaryDesc: 'AgentProof prepares acceptance review notes and response drafts. The user remains responsible for final acceptance, rejection, or dispute decisions.',
    placeholders: {
      jobId: 'e.g. okx-a2a-task-402',
      taskTitle: 'e.g. Solidity audit report acceptance check',
      taskDescription: 'Paste the original task, scope, and acceptance criteria...',
      aspPromise: 'Paste the provider service promise if available...',
      deliverableText: 'Paste the Agent deliverable text, report, or delivery summary...',
      userConcern: 'State any concern you want AgentProof to review...'
    },
    taskOptions: ['World Cup / Prediction Market', 'Finance / DeFi', 'Software Service', 'Life Service', 'Art & Creative', 'General / Other'],
    taskFocus: {
      world_cup_prediction: 'Checks match scope, update time, odds/probability reasoning, market links, and risk boundaries.',
      finance_defi: 'Checks asset scope, data source, APY/cost logic, liquidity constraints, and risk disclosure.',
      software_service: 'Checks feature coverage, artifacts, setup instructions, validation evidence, and code quality.',
      life_service: 'Checks user constraints, actionable steps, safety boundaries, personalization, and clarity.',
      creative_work: 'Checks style fit, format requirements, audience/use case, publish readiness, and source assets.',
      general: 'Checks requirement coverage, acceptance criteria, final output, supporting evidence, and completion quality.'
    },
    rubric: ['Spec match', 'Acceptance met', 'Functional correctness', 'Professional standard'],
    heroRubric: ['Spec match', 'Acceptance', 'Functional', 'Professional'],
    verdicts: {
      accept: ['Accept', 'Low risk', 'The deliverable appears ready for acceptance.'],
      minor_revision: ['Minor Revision', 'Medium risk', 'The deliverable is mostly complete but should be supplemented before final acceptance.'],
      request_revision: ['Request Revision', 'Medium-high risk', 'Ask the provider to supplement missing evidence before acceptance.'],
      reject_ready: ['Reject Ready', 'High risk', 'The deliverable has major gaps and the user should prepare a structured rejection reason.']
    },
    status: { pass: 'pass', partial: 'partial', missing_evidence: 'missing evidence', fail: 'fail' },
    fallbackReasons: {
      pass: 'Most core requirements have supporting evidence in the deliverable.',
      partial: 'Some requirements are mentioned, but the evidence is not detailed enough for confident acceptance.',
      missing_evidence: 'Some items cannot be verified from the provided deliverable.',
      fail: 'Several required items are missing or contradict the requirement.'
    },
    copied: 'Copied to clipboard',
    sampleLoaded: 'Sample loaded'
  },
  zh: {
    brandSubtitle: 'Agent 交付物验收复核',
    navWorkspace: '工作台',
    navFlow: '复核流程',
    navMethod: '机制说明',
    eyebrow: '用于 OKX.AI Agent 交付物验收复核',
    heroLine1: '验收 Agent 交付物之前，',
    heroLine2: '先做一次复核。',
    heroDesc: '粘贴原始任务和交付结果，AgentProof 会检查可能缺失项、证据充分性，并生成清晰的后续回复草稿。',
    runReview: '运行复核',
    loadSample: '加载示例案例',
    loadDemo: '加载示例',
    notJudge: '复核助手，不是官方裁决者',
    trustChecklist: '任务要求清单',
    trustEvidence: '证据说明',
    trustReply: '回复草稿',
    referenceScoreShort: '参考分',
    currentRecommendation: '当前建议',
    heroMuted: '示例交付物有价值，但缺少关键验收证据。',
    flowKicker: '使用流程',
    flowTitle: '验收前的第二意见复核',
    flowDesc: 'AgentProof 用于其他 Agent 提交交付物之后、用户最终验收之前。',
    flow1Title: '粘贴原始任务',
    flow1Desc: '包含用户需求、验收标准，以及可选的服务承诺。',
    flow2Title: '粘贴交付物',
    flow2Desc: '输入报告、代码说明、研究结果或交付正文。',
    flow3Title: '获得复核包',
    flow3Desc: '得到复核清单、可能缺失项、证据说明和回复草稿。',
    workspaceKicker: '工作台',
    inputTitle: '复核输入',
    inputDesc: '这里展示的是用户在 OKX.AI 雇佣 AgentProof 时会提供的材料。',
    jobIdLabel: '任务 ID <small>（可选）</small>',
    taskTypeLabel: 'OKX.AI 服务分类',
    taskTitleLabel: '任务标题',
    taskDescriptionLabel: '原始任务和验收标准',
    servicePromiseLabel: '服务承诺 <small>（可选）</small>',
    deliverableLabel: 'Agent 交付物',
    concernLabel: '用户关注点 <small>（可选）</small>',
    clearForm: '清空表单',
    reportKicker: '复核报告',
    resultTitle: '验收复核',
    resultDesc: '结构化建议和证据风格复核说明。',
    recommendationLabel: '复核建议',
    whyTitle: '为什么这样建议',
    tabChecklist: '复核清单',
    tabReply: '回复草稿',
    tabEvidence: '证据说明',
    checklistNote: '复核清单会把任务要求逐条映射到交付物中的证据。它是验收辅助，不是官方裁决。',
    thRequirement: '要求',
    thStatus: '状态',
    thEvidence: '证据',
    thIssue: '问题',
    replyFile: '回复草稿.md',
    evidenceFile: '证据说明.md',
    copyReply: '复制回复',
    copyEvidence: '复制证据',
    downloadMarkdown: '下载 Markdown',
    copyJson: '复制 JSON',
    evidenceCardTitle: '必查证据',
    issuesCardTitle: '常见问题',
    scoreBasisTitle: '评分依据',
    methodKicker: '复核机制',
    methodTitle: '透明的复核逻辑',
    methodDesc: '公开 Demo 使用任务要求提取、任务类型模板和确定性覆盖检查。正式复核可以加入 AI 语义分析和证据映射。',
    boundaryKicker: '边界说明',
    boundaryTitle: '复核助手，不是审判者',
    boundaryDesc: 'AgentProof 生成验收复核说明和回复草稿。最终验收、拒绝或争议决策仍由用户自己负责。',
    placeholders: {
      jobId: '例如 okx-a2a-task-402',
      taskTitle: '例如 Solidity 审计报告验收检查',
      taskDescription: '粘贴原始任务、范围和验收标准...',
      aspPromise: '如果有服务方承诺，可以粘贴在这里...',
      deliverableText: '粘贴 Agent 提交的交付物正文、报告或交付说明...',
      userConcern: '写下你希望 AgentProof 重点复核的问题...'
    },
    taskOptions: ['世界杯 / 预测市场', '金融 / DeFi', '软件服务', '生活服务', '艺术创作', '其他'],
    taskFocus: {
      world_cup_prediction: '检查比赛/市场范围、数据更新时间、赔率/概率依据、市场链接和风险边界。',
      finance_defi: '检查资产范围、数据来源、APY/成本逻辑、流动性约束和风险披露。',
      software_service: '检查功能覆盖、交付文件、运行说明、验证证据和代码质量。',
      life_service: '检查用户条件、可执行步骤、安全边界、个性化程度和表达清晰度。',
      creative_work: '检查风格匹配、格式要求、受众/用途、可发布性和源文件。',
      general: '检查需求覆盖、验收标准、最终输出、支持证据和完成质量。'
    },
    rubric: ['规格匹配', '验收满足', '功能正确性', '专业标准'],
    heroRubric: ['规格匹配', '验收满足', '功能正确性', '专业标准'],
    verdicts: {
      accept: ['建议验收', '低风险', '交付物看起来已满足主要任务要求。'],
      minor_revision: ['小幅修改', '中等风险', '交付物大体完整，但最终验收前建议补充少量内容。'],
      request_revision: ['要求修改', '中高风险', '建议先要求服务方补充缺失证据，再考虑验收。'],
      reject_ready: ['可准备拒绝', '高风险', '交付物存在明显缺口，用户应准备结构化拒绝理由。']
    },
    status: { pass: '通过', partial: '部分满足', missing_evidence: '证据不足', fail: '不满足' },
    fallbackReasons: {
      pass: '多数核心要求在交付物中找到了支持证据。',
      partial: '部分要求被提到，但证据不够具体，直接验收仍有不确定性。',
      missing_evidence: '部分项目无法从当前交付物中验证。',
      fail: '多项必要内容缺失，或与要求不一致。'
    },
    copied: '已复制到剪贴板',
    sampleLoaded: '示例已加载'
  }
};

function t(key) { return I18N[currentLang][key] || key; }
function ui() { return I18N[currentLang]; }

function getCurrentSample() {
  return sampleDataByLang[currentLang] || sampleDataByLang.en;
}

function loadCurrentLanguageSample(showMessage = true) {
  fillForm(getCurrentSample());
  runVerification();
  if (showMessage) showToast(t('sampleLoaded'));
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
    if (element && Object.prototype.hasOwnProperty.call(data, field)) element.value = data[field];
  });
}

function clearForm() {
  fields.forEach((field) => {
    const element = document.getElementById(field);
    if (element) element.value = field === 'taskType' ? 'smart_contract_audit' : '';
  });
}

function runVerification() {
  state.report = verifyDeliverable(readForm());
  renderReport(state.report);
  document.getElementById('workspace')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function updateCircleProgress(elementId, score, verdict) {
  const circle = document.getElementById(elementId);
  if (!circle) return;
  const circumference = 2 * Math.PI * 42;
  circle.style.strokeDashoffset = circumference - (score / 100) * circumference;
  let color = '#10b981';
  if (verdict === 'minor_revision' || verdict === 'request_revision') color = '#f59e0b';
  if (verdict === 'reject_ready') color = '#ef4444';
  circle.style.setProperty('--verdict-color', color);
  circle.closest('.score-circle-wrapper')?.style.setProperty('--verdict-color', color);
}

function renderReport(report) {
  const verdict = ui().verdicts[report.verdict] || [report.verdictLabel, report.riskLevel, report.summary];
  $('#totalScore').textContent = report.totalScore;
  $('#heroScore').textContent = report.totalScore;
  $('#verdictLabel').textContent = verdict[0];
  $('#heroVerdict').textContent = verdict[0];
  $('#verdictSummary').textContent = verdict[2];
  $('#riskPill').textContent = verdict[1];
  $('#riskPill').className = `status-pill ${report.verdict}`;

  updateCircleProgress('heroScoreCircle', report.totalScore, report.verdict);
  updateCircleProgress('totalScoreCircle', report.totalScore, report.verdict);
  renderMainReasons(report);
  renderRubric(report);
  renderSkillDetails(report);
  renderHeroMiniBars(report);
  updateTaskTypeHint(report.taskType);
  renderCoverage(report.coverageMatrix);
  $('#suggestedReply').textContent = displayReply(report);
  $('#evidencePack').textContent = displayEvidence(report);
  $('#jsonReport').textContent = JSON.stringify(report, null, 2);
}

function renderMainReasons(report) {
  const reasons = displayReasons(report);
  $('#mainReasons').innerHTML = reasons.map((reason) => `<li>${escapeHtml(reason)}</li>`).join('');
}
function reasonFallback(report) {
  if (report.verdict === 'accept') return ui().fallbackReasons.pass;
  if (report.verdict === 'reject_ready') return ui().fallbackReasons.fail;
  return ui().fallbackReasons.partial;
}

function displayReasons(report) {
  if (currentLang === 'en') return report.mainReasons?.length ? report.mainReasons : [reasonFallback(report)];
  const rows = report.coverageMatrix.filter((row) => row.status !== 'pass').slice(0, 4);
  if (report.verdict === 'accept') return ['多数核心要求已在交付物中找到支持证据。'];
  if (!rows.length) return ['建议用户在最终验收前再人工确认一次交付物。'];
  return rows.map((row) => {
    const name = displayRequirementText(row.requirement);
    if (row.status === 'fail') return `${name}：交付物与要求不一致或明显不满足。`;
    if (row.status === 'missing_evidence') return `${name}：当前交付物中没有找到可验证证据。`;
    return `${name}：交付物有提及，但证据不够具体，不适合直接确认验收。`;
  });
}

function displayReply(report) {
  if (currentLang === 'en') return report.suggestedReply;
  const newline = String.fromCharCode(10);
  const job = report.jobId ? `（任务 ID：${report.jobId}）` : '';
  const items = report.missingItems?.length ? report.missingItems.map((item, index) => `${index + 1}. ${displayRequirementText(item)}`).join(newline) : '1. 请补充与验收标准相关的更多证据。';
  if (report.verdict === 'accept') return `我已复核该交付物${job}，主要任务要求看起来已经满足，可以进入验收。`;
  if (report.verdict === 'minor_revision') return `我可以在补充少量内容后验收该交付物${job}。请补充或澄清以下事项：${newline}${newline}${items}${newline}${newline}这些内容补齐后，交付物应可以进入最终验收。`;
  if (report.verdict === 'request_revision') return `我暂时不建议直接验收该交付物${job}。请先补充或修改以下缺失 / 证据不足的内容：${newline}${newline}${items}${newline}${newline}这些事项属于原始任务要求或验收标准的一部分，补充后我再继续验收。`;
  return `我目前无法验收该交付物${job}，因为存在较多必要内容缺失或无法验证：${newline}${newline}${items}${newline}${newline}请提供实质性修订版本，否则该任务可能需要保留结构化拒绝理由和证据材料。`;
}

function displayEvidence(report) {
  if (currentLang === 'en') return report.evidencePack;
  const newline = String.fromCharCode(10);
  const rows = report.coverageMatrix.filter((row) => row.status !== 'pass').slice(0, 8);
  const findings = rows.length ? rows.map((row, index) => {
    const label = ui().status[row.status] || row.status;
    return `${index + 1}. ${displayRequirementText(row.requirement)} — ${label}。${displayIssueText(row.issue) || displayEvidenceText(row.evidence)}`;
  }).join(newline) : '1. 当前复核未发现明显缺失项。';
  const missing = report.missingItems?.length ? report.missingItems.map((item) => `- ${displayRequirementText(item)}`).join(newline) : '- 未发现明显缺失项';
  return [
    '复核结论',
    '',
    `任务 ID：${report.jobId || '未提供'}`,
    `任务标题：${report.taskTitle || '未命名任务'}`,
    `建议动作：${ui().verdicts[report.verdict]?.[0] || report.verdictLabel}`,
    `参考分：${report.totalScore}/100`,
    `复核模式：${report.reviewMode || 'deterministic_fallback'}`,
    '',
    '主要发现：',
    findings,
    '',
    '缺失 / 证据不足项：',
    missing,
    '',
    '机制说明：',
    'AgentProof 会将原始任务要求与交付物逐项对比，整理可能缺失项和证据不足项。本结果是验收复核辅助，不是官方裁决。'
  ].join(newline);
}
function renderRubric(report) {
  const labels = ui().rubric;
  const items = [
    [labels[0], report.scores.specMatch, 40],
    [labels[1], report.scores.acceptanceMet, 30],
    [labels[2], report.scores.functionalCorrectness, 20],
    [labels[3], report.scores.professionalStandard, 10]
  ];
  $('#rubricGrid').innerHTML = items.map(([label, value, max]) => {
    const percent = Math.round((value / max) * 100);
    return `<div class="rubric-card"><span>${label}</span><strong>${value}<small>/${max}</small></strong><div class="bar"><b style="width:${percent}%"></b></div></div>`;
  }).join('');
}

function renderSkillDetails(report) {
  renderSimpleList('#evidenceToCheckList', localizeList(report.evidenceToCheck || [], 'evidence'));
  renderSimpleList('#commonIssuesList', localizeList(report.commonIssues || [], 'issues'));
  renderSimpleList('#scoreBasisList', buildScoreBasisLines(report));
}

function renderSimpleList(selector, items) {
  const element = document.querySelector(selector);
  if (!element) return;
  element.innerHTML = items.slice(0, 6).map((item) => `<li>${escapeHtml(item)}</li>`).join('');
}

function buildScoreBasisLines(report) {
  const basis = report.scoreBasis || {};
  if (currentLang === 'zh') {
    return [
      `规格匹配：${basis.specMatch?.pass || 0} 通过 / ${basis.specMatch?.partial || 0} 部分 / ${basis.specMatch?.missingEvidence || 0} 证据不足`,
      `验收满足：${basis.acceptanceMet?.pass || 0} 通过 / ${basis.acceptanceMet?.partial || 0} 部分 / ${basis.acceptanceMet?.missingEvidence || 0} 证据不足`,
      `功能正确性：${basis.functionalCorrectness?.pass || 0} 通过 / ${basis.functionalCorrectness?.partial || 0} 部分 / ${basis.functionalCorrectness?.missingEvidence || 0} 证据不足`,
      `专业标准：${basis.professionalStandard?.pass || 0} 通过 / ${basis.professionalStandard?.partial || 0} 部分 / ${basis.professionalStandard?.missingEvidence || 0} 证据不足`
    ];
  }
  return [
    `Spec match: ${basis.specMatch?.pass || 0} pass / ${basis.specMatch?.partial || 0} partial / ${basis.specMatch?.missingEvidence || 0} missing`,
    `Acceptance met: ${basis.acceptanceMet?.pass || 0} pass / ${basis.acceptanceMet?.partial || 0} partial / ${basis.acceptanceMet?.missingEvidence || 0} missing`,
    `Functional correctness: ${basis.functionalCorrectness?.pass || 0} pass / ${basis.functionalCorrectness?.partial || 0} partial / ${basis.functionalCorrectness?.missingEvidence || 0} missing`,
    `Professional standard: ${basis.professionalStandard?.pass || 0} pass / ${basis.professionalStandard?.partial || 0} partial / ${basis.professionalStandard?.missingEvidence || 0} missing`
  ];
}

const LIST_ZH = {
  evidence: {
    'match or market scope': '比赛或市场范围',
    'data timestamp': '数据时间戳',
    'odds or market price': '赔率或市场价格',
    'model probability': '模型概率',
    'score prediction': '比分预测',
    'injury or lineup note': '伤病或阵容说明',
    'market link': '市场链接',
    'risk disclaimer': '风险说明',
    'asset or protocol scope': '资产或协议范围',
    'data source': '数据来源',
    'APY/APR or price data': 'APY/APR 或价格数据',
    'gas/slippage/cost assumptions': 'Gas / 滑点 / 成本假设',
    'liquidity': '流动性',
    'risk notes': '风险说明',
    'source files': '源文件',
    'feature list': '功能清单',
    'setup instructions': '安装说明',
    'dependencies': '依赖项',
    'test result': '测试结果',
    'run/deploy command': '运行 / 部署命令',
    'logs/screenshots': '日志 / 截图',
    'security notes': '安全说明'
  },
  issues: {
    'No data timestamp or stale odds': '没有数据时间戳或赔率过时',
    'No direct market/source link': '没有直接市场或来源链接',
    'Prediction stated as certainty instead of probability': '把预测说成确定结果',
    'No injury, lineup, or form source when those factors are used': '使用伤病、阵容或状态时没有来源',
    'No risk or uncertainty note': '没有风险或不确定性说明',
    'No timestamp or data source': '没有时间戳或数据来源',
    'APY shown without calculation logic': '展示 APY 但没有计算逻辑',
    'Gas, slippage, liquidity, or bridge cost ignored': '忽略 Gas、滑点、流动性或跨链成本',
    'No source files or repository link': '没有源文件或仓库链接',
    'No setup or run instructions': '没有安装或运行说明',
    'No test, log, screenshot, or validation evidence': '没有测试、日志、截图或验证证据'
  }
};

function localizeList(items, type) {
  if (currentLang !== 'zh') return items;
  const map = LIST_ZH[type] || {};
  return items.map((item) => map[item] || item);
}

function renderHeroMiniBars(report) {
  const labels = ui().heroRubric;
  const items = [[labels[0], report.scores.specMatch, 40], [labels[1], report.scores.acceptanceMet, 30], [labels[2], report.scores.functionalCorrectness, 20], [labels[3], report.scores.professionalStandard, 10]];
  $$('.mini-bar-row').forEach((row, index) => {
    const item = items[index];
    if (!item) return;
    const [label, value, max] = item;
    const percent = Math.round((value / max) * 100);
    row.querySelector('span').textContent = label;
    row.querySelector('strong').textContent = `${percent}%`;
    row.querySelector('.bar-inner').style.setProperty('--w', `${percent}%`);
  });
}

const REQUIREMENT_ZH = {
  'Target match or market scope': '目标比赛或市场范围',
  'Requested outputs covered': '请求输出覆盖情况',
  'Fresh data and timestamp': '最新数据和时间戳',
  'Market or source link': '市场或来源链接',
  'Probability and odds reasoning': '概率和赔率推理',
  'Risk and uncertainty boundary': '风险和不确定性边界',
  'Asset, chain, or protocol scope': '资产、链或协议范围',
  'Requested opportunity output': '机会输出覆盖情况',
  'Data source and timestamp': '数据来源和时间戳',
  'Cost, fee, gas, or slippage model': '成本、手续费、Gas 或滑点模型',
  'Calculation reasoning': '计算依据',
  'Risk disclosure': '风险披露',
  'Feature coverage': '功能覆盖',
  'Deliverable files or artifacts': '交付文件或产物',
  'Setup and run instructions': '安装和运行说明',
  'Test or validation evidence': '测试或验证证据',
  'Error handling and edge cases': '错误处理和边界情况',
  'Code quality and maintainability': '代码质量和可维护性',
  'User context and constraints': '用户条件和限制',
  'Requested plan or answer': '请求的方案或答案',
  'Actionable steps': '可执行步骤',
  'Safety and boundary notes': '安全和边界说明',
  'Personalization quality': '个性化程度',
  'Clarity and tone': '清晰度和语气',
  'Theme and style fit': '主题和风格匹配',
  'Format, size, or quantity requirements': '格式、尺寸或数量要求',
  'Target audience and use case': '目标受众和使用场景',
  'Publish-ready quality': '可发布质量',
  'Source or editable assets': '源文件或可编辑资产',
  'Creative quality and consistency': '创意质量和一致性',
  'Requirement coverage': '需求覆盖',
  'Acceptance criteria coverage': '验收标准覆盖',
  'Usable final output': '可用最终输出',
  'Supporting evidence': '支持证据',
  'Completion quality': '完成质量'
};

function displayRequirementText(value) {
  if (currentLang !== 'zh') return value;
  if (value.startsWith('Service promise:')) return value.replace('Service promise:', '服务承诺：');
  return REQUIREMENT_ZH[value] || value;
}

function displayEvidenceText(value) {
  if (currentLang !== 'zh') return value;
  return String(value)
    .replace('Found evidence keywords:', '发现证据关键词：')
    .replace('Partial signal detected:', '发现部分信号：')
    .replace('No clear supporting evidence found in the deliverable text.', '当前交付物中未找到清晰支持证据。')
    .replace('No deliverable text was provided.', '未提供交付物正文。');
}

function displayIssueText(value) {
  if (!value) return value;
  if (currentLang !== 'zh') return value;
  return String(value)
    .replace('The deliverable does not provide verifiable evidence for this explicit requirement.', '交付物没有为该明确要求提供可验证证据。')
    .replace('No current-data evidence or update time is provided.', '未提供当前数据证据或更新时间。')
    .replace('Source is mentioned but not directly usable.', '提到了来源或市场，但缺少可直接使用的链接。')
    .replace('Probability is given but reasoning is thin.', '提供了概率，但推理依据不够充分。')
    .replace('No market/source link is provided.', '未提供市场或来源链接。')
    .replace('No risk or uncertainty note is provided.', '未提供风险或不确定性说明。');
}

function renderCoverage(rows) {
  $('#coverageRows').innerHTML = rows.map((row) => {
    const meta = `${dimensionLabel(row.dimension)} · ${severityLabel(row.severity)}`;
    const requirement = displayRequirementText(row.requirement);
    const evidence = displayEvidenceText(row.evidence);
    const issue = displayIssueText(row.issue);
    return `<tr class="row-${row.status}"><td><strong>${escapeHtml(requirement)}</strong><small class="criterion-meta">${escapeHtml(meta)}</small></td><td><span class="matrix-status ${row.status}">${ui().status[row.status] || row.status}</span></td><td>${escapeHtml(evidence)}</td><td>${issue ? escapeHtml(issue) : '<span class="muted">—</span>'}</td></tr>`;
  }).join('');
}

function dimensionLabel(value) {
  const map = { specMatch: ui().rubric[0], acceptanceMet: ui().rubric[1], functionalCorrectness: ui().rubric[2], professionalStandard: ui().rubric[3] };
  return map[value] || value;
}

function severityLabel(value) {
  if (currentLang === 'zh') return { high: '高优先级', medium: '中优先级', low: '低优先级' }[value] || value;
  return { high: 'high priority', medium: 'medium priority', low: 'low priority' }[value] || value;
}

function updateTaskTypeHint(taskType = document.getElementById('taskType')?.value) {
  const hint = document.getElementById('taskTypeHint');
  if (!hint) return;
  hint.textContent = ui().taskFocus?.[taskType] || REVIEW_SKILLS[taskType]?.focus || '';
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
  showToast(t('copied'));
}

function downloadMarkdown() {
  if (!state.report) return;
  const blob = new Blob([buildMarkdownReport(state.report)], { type: 'text/markdown;charset=utf-8' });
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
  return String(value).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');
}

function applyLanguage() {
  const dict = ui();
  document.documentElement.lang = currentLang === 'zh' ? 'zh-CN' : 'en';
  document.title = currentLang === 'zh' ? 'AgentProof — OKX.AI Agent 交付物验收复核' : 'AgentProof — Agent Delivery Review for OKX.AI';
  $$('.lang-btn').forEach((button) => button.classList.toggle('active', button.dataset.lang === currentLang));
  $$('[data-i18n]').forEach((element) => { element.textContent = dict[element.dataset.i18n] || element.textContent; });
  $$('[data-i18n-html]').forEach((element) => { element.innerHTML = dict[element.dataset.i18nHtml] || element.innerHTML; });
  Object.entries(dict.placeholders).forEach(([id, placeholder]) => { const el = document.getElementById(id); if (el) el.placeholder = placeholder; });
  $$('#taskType option').forEach((option, index) => { option.textContent = dict.taskOptions[index] || option.textContent; });
  updateTaskTypeHint();
  if (state.report) renderReport(state.report);
}

function init() {
  loadCurrentLanguageSample(false);
  applyLanguage();
  runVerification();
  $$('.lang-btn').forEach((button) => button.addEventListener('click', () => {
    const isDemo = document.getElementById('jobId')?.value?.startsWith('okx-a2a-worldcup-demo');
    currentLang = button.dataset.lang;
    localStorage.setItem('agentproof-lang', currentLang);
    if (isDemo) fillForm(getCurrentSample());
    applyLanguage();
  }));
  $('#loadSample').addEventListener('click', () => loadCurrentLanguageSample(true));
  $('#heroLoad').addEventListener('click', () => loadCurrentLanguageSample(true));
  $('#heroRun').addEventListener('click', runVerification);
  $('#runVerification').addEventListener('click', runVerification);
  $('#taskType').addEventListener('change', () => { updateTaskTypeHint(); runVerification(); });
  $('#clearForm').addEventListener('click', clearForm);
  $('#downloadMarkdown').addEventListener('click', downloadMarkdown);
  $$('.tab').forEach((button) => button.addEventListener('click', () => setActiveTab(button.dataset.tab)));
  $$('[data-copy]').forEach((button) => button.addEventListener('click', () => copyElementText(button.dataset.copy)));
}

document.addEventListener('DOMContentLoaded', init);
