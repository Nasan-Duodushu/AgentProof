const NL = String.fromCharCode(10);

const TASK_TEMPLATES = {
  smart_contract_audit: {
    label: 'Smart Contract Audit',
    checks: [
      'vulnerability list',
      'severity rating',
      'attack path',
      'affected code location',
      'reproduction steps',
      'concrete remediation advice',
      'false positive or limitation notes'
    ],
    keywords: {
      'vulnerability list': ['vulnerability', 'issue', 'bug', 'risk', '漏洞', '问题', '风险'],
      'severity rating': ['critical', 'high', 'medium', 'low', 'severity', '严重性', '高危', '中危', '低危'],
      'attack path': ['attack path', 'exploit', 'step', 'reproduce', '攻击路径', '利用路径', '复现'],
      'affected code location': ['line', 'function', 'contract', 'code location', '代码位置', '函数', '行号'],
      'reproduction steps': ['reproduction', 'steps', 'proof of concept', 'poc', '复现步骤'],
      'concrete remediation advice': ['fix', 'patch', 'remediation', 'code change', '修复', '修改建议'],
      'false positive or limitation notes': ['limitation', 'scope', 'false positive', 'assumption', '限制', '误报']
    }
  },
  code_delivery: {
    label: 'Code Delivery',
    checks: ['feature coverage', 'setup instructions', 'dependency list', 'test evidence', 'error handling', 'deployment or run command'],
    keywords: {
      'feature coverage': ['feature', 'implemented', '功能', '实现'],
      'setup instructions': ['setup', 'install', 'configuration', '安装', '配置'],
      'dependency list': ['dependency', 'package', 'requirements', '依赖'],
      'test evidence': ['test', 'passed', 'coverage', '测试'],
      'error handling': ['error handling', 'fallback', 'exception', '错误处理'],
      'deployment or run command': ['run', 'deploy', 'start', '启动', '部署']
    }
  },
  research_report: {
    label: 'Research Report',
    checks: ['data sources', 'time range', 'methodology', 'answer to original question', 'risk or uncertainty notes', 'clear conclusion'],
    keywords: {
      'data sources': ['source', 'citation', 'reference', '来源', '引用'],
      'time range': ['date', 'period', 'as of', '时间', '日期'],
      'methodology': ['methodology', 'method', 'approach', '方法'],
      'answer to original question': ['conclusion', 'answer', 'therefore', '结论', '回答'],
      'risk or uncertainty notes': ['risk', 'uncertainty', 'limitation', '风险', '不确定'],
      'clear conclusion': ['summary', 'recommendation', '结论', '建议']
    }
  },
  creative_deliverable: {
    label: 'Creative Deliverable',
    checks: ['format compliance', 'style match', 'target audience fit', 'publish-ready output', 'source file or editable asset notes'],
    keywords: {
      'format compliance': ['format', 'size', 'dimension', '格式', '尺寸'],
      'style match': ['style', 'tone', 'brand', '风格', '语气'],
      'target audience fit': ['audience', 'user', 'persona', '受众'],
      'publish-ready output': ['publish', 'ready', 'final', '可发布', '最终'],
      'source file or editable asset notes': ['source file', 'editable', 'figma', 'psd', '源文件', '可编辑']
    }
  },
  general: {
    label: 'General Task',
    checks: ['requirements coverage', 'acceptance criteria coverage', 'usable final output', 'evidence quality', 'professional completeness'],
    keywords: {
      'requirements coverage': ['requirement', 'deliver', 'must', '需求', '要求'],
      'acceptance criteria coverage': ['acceptance', 'criteria', '验收', '标准'],
      'usable final output': ['final', 'usable', 'output', '交付', '可用'],
      'evidence quality': ['evidence', 'proof', 'screenshot', '证据'],
      'professional completeness': ['complete', 'professional', '完整', '专业']
    }
  }
};

const ACTIONS = [
  { min: 80, verdict: 'accept', label: 'Accept', risk: 'Low risk', summary: 'The deliverable appears ready for acceptance.' },
  { min: 75, verdict: 'minor_revision', label: 'Minor Revision', risk: 'Medium risk', summary: 'The deliverable is mostly complete but should be supplemented before final acceptance.' },
  { min: 60, verdict: 'request_revision', label: 'Request Revision', risk: 'Medium-high risk', summary: 'Ask the provider to supplement missing evidence before acceptance.' },
  { min: 0, verdict: 'reject_ready', label: 'Reject Ready', risk: 'High risk', summary: 'The deliverable has major gaps and the user should prepare a structured rejection reason.' }
];

const REQUIREMENT_PATTERN = /(must|should|required|requires|include|includes|provide|deliver|acceptance|criteria|need|needs|必须|需要|包含|包括|提供|交付|验收|标准|要求)/i;

export function verifyDeliverable(input = {}) {
  const normalized = normalizeInput(input);
  const template = TASK_TEMPLATES[normalized.taskType] || TASK_TEMPLATES.general;
  const explicitRequirements = extractRequirements(normalized.taskDescription);
  const aspRequirements = extractRequirements(normalized.aspPromise).slice(0, 4);
  const requirements = uniqueRequirements([
    ...explicitRequirements,
    ...aspRequirements.map((item) => `ASP promise: ${item}`),
    ...template.checks
  ]).slice(0, 16);

  const coverageMatrix = requirements.map((requirement) => evaluateRequirement(requirement, normalized.deliverableText, template));
  const counts = countStatuses(coverageMatrix);
  const coverageScore = weightedCoverage(counts, coverageMatrix.length);
  const acceptanceRows = coverageMatrix.filter((row) => isAcceptanceLike(row.requirement));
  const acceptanceScore = weightedCoverage(countStatuses(acceptanceRows), Math.max(acceptanceRows.length, 1)) || coverageScore;
  const functionalScore = evaluateFunctionalEvidence(normalized, template, coverageMatrix);
  const professionalScore = evaluateProfessionalStandard(normalized, coverageMatrix);

  const scores = {
    specMatch: Math.round(coverageScore * 40),
    acceptanceMet: Math.round(acceptanceScore * 30),
    functionalCorrectness: Math.round(functionalScore * 20),
    professionalStandard: Math.round(professionalScore * 10)
  };
  const totalScore = clamp(Object.values(scores).reduce((sum, value) => sum + value, 0), 0, 100);
  const action = ACTIONS.find((item) => totalScore >= item.min) || ACTIONS[ACTIONS.length - 1];
  const missingItems = coverageMatrix.filter((row) => row.status !== 'pass').map((row) => row.requirement).slice(0, 8);

  return {
    jobId: normalized.jobId,
    taskTitle: normalized.taskTitle,
    taskType: normalized.taskType,
    verdict: action.verdict,
    verdictLabel: action.label,
    riskLevel: action.risk,
    summary: action.summary,
    totalScore,
    scores,
    statusCounts: counts,
    coverageMatrix,
    missingItems,
    suggestedReply: buildSuggestedReply(normalized, action, missingItems),
    evidencePack: buildEvidencePack(normalized, action, scores, totalScore, coverageMatrix, missingItems),
    generatedAt: new Date().toISOString()
  };
}

export function buildMarkdownReport(report) {
  const lines = [
    '# AgentProof Verification Report',
    '',
    `**Job ID:** ${report.jobId || 'not provided'}`,
    '',
    `**Task:** ${report.taskTitle || 'Untitled task'}`,
    '',
    `**Verdict:** ${report.verdictLabel}`,
    '',
    `**Total Score:** ${report.totalScore}/100`,
    '',
    '## Rubric',
    '',
    `- Spec match: ${report.scores.specMatch}/40`,
    `- Acceptance met: ${report.scores.acceptanceMet}/30`,
    `- Functional correctness: ${report.scores.functionalCorrectness}/20`,
    `- Professional standard: ${report.scores.professionalStandard}/10`,
    '',
    '## Missing or Partial Items',
    '',
    report.missingItems.length ? report.missingItems.map((item) => `- ${item}`).join(NL) : '- None detected',
    '',
    '## Coverage Matrix',
    '',
    '| Requirement | Status | Evidence | Issue |',
    '|---|---|---|---|',
    report.coverageMatrix.map((row) => `| ${escapePipe(row.requirement)} | ${row.status} | ${escapePipe(row.evidence)} | ${escapePipe(row.issue || '—')} |`).join(NL),
    '',
    '## Suggested Reply',
    '',
    report.suggestedReply,
    '',
    '## Evidence Pack',
    '',
    report.evidencePack
  ];
  return lines.join(NL);
}

function normalizeInput(input) {
  return {
    jobId: String(input.jobId || '').trim(),
    taskTitle: String(input.taskTitle || '').trim(),
    taskType: String(input.taskType || 'general').trim(),
    taskDescription: String(input.taskDescription || '').trim(),
    aspPromise: String(input.aspPromise || '').trim(),
    deliverableText: String(input.deliverableText || input.deliverable || '').trim(),
    userConcern: String(input.userConcern || '').trim()
  };
}

function extractRequirements(text) {
  if (!text) return [];
  const rawLines = text.split(NL).map((line) => line.trim()).filter(Boolean);
  const bulletLines = rawLines
    .filter((line) => /^[-*•0-9.）) ]+/.test(line))
    .map((line) => line.replace(/^[-*•0-9.）) ]+/, '').trim())
    .filter(Boolean);
  const sentenceSource = bulletLines.length ? bulletLines : text.split(/[.;。！？!?]+/).map((sentence) => sentence.trim()).filter(Boolean);
  return uniqueRequirements(sentenceSource
    .filter((item) => item.length >= 8 && item.length <= 220)
    .filter((item) => REQUIREMENT_PATTERN.test(item))
    .filter((item) => !/(acceptance criteria|验收标准)[:：]?$/i.test(item.trim())))
    .slice(0, 10);
}

function uniqueRequirements(items) {
  const seen = new Set();
  return items.filter((item) => {
    const key = item.toLowerCase().replace(/\s+/g, ' ').trim();
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function evaluateRequirement(requirement, deliverableText, template) {
  const text = deliverableText.toLowerCase();
  const requirementKey = findTemplateKey(requirement, template);
  const keywords = template.keywords[requirementKey] || tokenizeRequirement(requirement);
  const hits = keywords.filter((keyword) => text.includes(keyword.toLowerCase()));
  const requirementWords = tokenizeRequirement(requirement);
  const wordHits = requirementWords.filter((word) => text.includes(word.toLowerCase()));
  const hitScore = Math.max(
    keywords.length ? hits.length / keywords.length : 0,
    requirementWords.length ? Math.min(wordHits.length / Math.min(requirementWords.length, 5), 1) : 0
  );

  if (hitScore >= 0.45 || hits.length >= 2) {
    return { requirement, status: 'pass', evidence: hits.length ? `Found evidence keywords: ${hits.slice(0, 4).join(', ')}` : 'The deliverable appears to address this requirement.', issue: null };
  }
  if (hitScore >= 0.18 || hits.length === 1 || wordHits.length >= 1) {
    return { requirement, status: 'partial', evidence: `Partial signal detected: ${[...hits, ...wordHits].slice(0, 4).join(', ') || 'related wording'}`, issue: 'The deliverable mentions this area but does not provide enough concrete evidence.' };
  }
  return { requirement, status: 'fail', evidence: 'No clear evidence found in the deliverable text.', issue: 'Missing or not verifiable from the submitted deliverable.' };
}

function findTemplateKey(requirement, template) {
  const lower = requirement.toLowerCase();
  return template.checks.find((check) => lower.includes(check.toLowerCase())) || template.checks.find((check) => check.split(' ').some((part) => lower.includes(part))) || requirement;
}

function tokenizeRequirement(requirement) {
  return requirement
    .toLowerCase()
    .replace(/[^a-z0-9一-龥\s]/g, ' ')
    .split(/\s+/)
    .filter((word) => word.length > 2)
    .filter((word) => !['the', 'and', 'for', 'with', 'that', 'this', 'must', 'should', 'provide', 'include', 'deliver'].includes(word))
    .slice(0, 8);
}

function countStatuses(rows) {
  return rows.reduce((acc, row) => {
    acc[row.status] = (acc[row.status] || 0) + 1;
    return acc;
  }, { pass: 0, partial: 0, fail: 0 });
}

function weightedCoverage(counts, total) {
  if (!total) return 0;
  return clamp((counts.pass + counts.partial * 0.5) / total, 0, 1);
}

function isAcceptanceLike(requirement) {
  return /(acceptance|criteria|required|must|验收|标准|必须|要求|需要)/i.test(requirement);
}

function evaluateFunctionalEvidence(input, template, matrix) {
  const text = input.deliverableText.toLowerCase();
  const signals = ['test', 'tested', 'run', 'demo', 'screenshot', 'evidence', 'poc', 'source', 'result', '测试', '运行', '截图', '证据', '结果'];
  const signalCount = signals.filter((signal) => text.includes(signal)).length;
  const failPenalty = (matrix.filter((row) => row.status === 'fail').length / Math.max(matrix.length, 1)) * 0.45;
  const templateBonus = template.checks.some((check) => text.includes(check.split(' ')[0])) ? 0.1 : 0;
  return clamp(0.58 + Math.min(signalCount, 5) * 0.07 + templateBonus - failPenalty, 0.15, 1);
}

function evaluateProfessionalStandard(input, matrix) {
  const text = input.deliverableText;
  const lines = text.split(NL);
  const hasStructure = lines.some((line) => line.trim().startsWith('#') || line.trim().startsWith('-') || line.trim().startsWith('*') || /^[0-9]+[.)]/.test(line.trim()));
  const hasEvidence = /(because|therefore|evidence|source|line|function|screenshot|由于|因此|证据|来源|函数|截图)/i.test(text);
  const lengthScore = text.length > 1200 ? 0.25 : text.length > 500 ? 0.18 : text.length > 200 ? 0.1 : 0;
  const failRate = matrix.filter((row) => row.status === 'fail').length / Math.max(matrix.length, 1);
  return clamp(0.45 + lengthScore + (hasStructure ? 0.16 : 0) + (hasEvidence ? 0.14 : 0) - failRate * 0.25, 0.1, 1);
}

function buildSuggestedReply(input, action, missingItems) {
  const jobPart = input.jobId ? ` for Job ID ${input.jobId}` : '';
  if (action.verdict === 'accept') return `I reviewed the deliverable${jobPart} and it appears to satisfy the main task requirements. I am ready to accept the delivery.`;
  const itemList = missingItems.length ? missingItems.map((item, index) => `${index + 1}. ${item}`).join(NL) : '1. Please provide additional evidence for the requested acceptance criteria.';
  if (action.verdict === 'minor_revision') return ['I can accept the delivery after minor supplements' + jobPart + '. Please add or clarify:', itemList, 'Once these points are addressed, the deliverable should be ready for acceptance.'].join(NL + NL);
  if (action.verdict === 'request_revision') return ['I am not ready to accept the delivery yet' + jobPart + '. Please revise and supplement the following missing or partial items:', itemList, 'These items are part of the original task requirements and are needed before final acceptance.'].join(NL + NL);
  return ['I cannot accept the current delivery' + jobPart + ' because major required items are missing or not verifiable:', itemList, 'Please provide a substantially revised deliverable or the task may need to proceed with a structured rejection / dispute evidence pack.'].join(NL + NL);
}

function buildEvidencePack(input, action, scores, totalScore, matrix, missingItems) {
  const facts = matrix.filter((row) => row.status !== 'pass').slice(0, 8).map((row, index) => `${index + 1}. ${row.requirement} — ${row.status.toUpperCase()}. ${row.issue || row.evidence}`).join(NL);
  return [
    'Verdict',
    '',
    `Job ID: ${input.jobId || 'not provided'}`,
    `Task: ${input.taskTitle || 'Untitled task'}`,
    `Suggested action: ${action.label}`,
    `Rubric scoring: Spec ${scores.specMatch}/40 + Acceptance ${scores.acceptanceMet}/30 + Functional ${scores.functionalCorrectness}/20 + Professional ${scores.professionalStandard}/10 = Total ${totalScore}/100`,
    '',
    'Findings of fact:',
    facts || '1. No major missing item detected by the current verifier.',
    '',
    'Missing / partial items:',
    missingItems.length ? missingItems.map((item) => `- ${item}`).join(NL) : '- None detected',
    '',
    'Reasoning:',
    'AgentProof compares the submitted deliverable against the original task requirements and ASP promise using a four-part acceptance rubric aligned with OKX.AI arbitration-style dimensions: specification match, acceptance criteria, functional correctness, and professional standard. The suggested action is based on the total score and unresolved missing evidence.'
  ].join(NL);
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function escapePipe(value) {
  return String(value).replace(/\|/g, '\\|').split(NL).join('<br>');
}
