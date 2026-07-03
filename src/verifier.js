const NL = String.fromCharCode(10);

const DIMENSIONS = {
  specMatch: { label: 'Spec match', max: 40 },
  acceptanceMet: { label: 'Acceptance met', max: 30 },
  functionalCorrectness: { label: 'Functional correctness', max: 20 },
  professionalStandard: { label: 'Professional standard', max: 10 }
};

const SCORE_VALUE = { pass: 1, partial: 0.5, missing_evidence: 0, fail: 0 };
const REQUIREMENT_PATTERN = /(must|should|required|requires|include|includes|provide|deliver|acceptance|criteria|need|needs|必须|需要|包含|包括|提供|交付|验收|标准|要求)/i;
const STOP_WORDS = ['the', 'and', 'for', 'with', 'that', 'this', 'must', 'should', 'provide', 'include', 'deliver', 'report'];

function c(id, label, dimension, severity, keywords, pass, partial, fail) {
  return { id, label, dimension, severity, keywords, pass, partial, fail };
}

export const REVIEW_SKILLS = {
  world_cup_prediction: {
    label: 'World Cup / Prediction Market',
    focus: 'Reviews match predictions, odds analysis, market links, probability reasoning, timestamps, and risk boundaries.',
    evidenceToCheck: ['match or market scope', 'data timestamp', 'odds or market price', 'model probability', 'score prediction', 'injury or lineup note', 'market link', 'risk disclaimer'],
    criteria: [
      c('match_scope', 'Target match or market scope', 'specMatch', 'high', ['match', 'market', 'team', 'group', 'fixture', '比赛', '市场', '球队', '赛程'], 'Target match or market is clearly identified.', 'Match or market is mentioned but incomplete.', 'No clear match or market scope is provided.'),
      c('required_outputs', 'Requested outputs covered', 'specMatch', 'high', ['schedule', 'win probability', 'score', 'polymarket', 'odds', '赛程', '胜率', '比分', '赔率', '链接'], 'Requested schedule, probability, score, and market output are covered.', 'Only some requested outputs are present.', 'Core requested outputs are missing.'),
      c('fresh_data', 'Fresh data and timestamp', 'acceptanceMet', 'high', ['latest', 'as of', 'updated', 'timestamp', 'injury', 'odds', '最新', '截至', '更新时间', '伤病'], 'Update time and current match context are clear.', 'Freshness is implied but not timestamped.', 'No current-data evidence or update time is provided.'),
      c('market_link', 'Market or source link', 'acceptanceMet', 'medium', ['polymarket', 'http', 'https', 'market link', 'source', '链接', '来源', '市场'], 'Relevant market or source link is provided.', 'Source is mentioned but not directly usable.', 'No market/source link is provided.'),
      c('probability_logic', 'Probability and odds reasoning', 'functionalCorrectness', 'high', ['probability', 'implied', 'odds', 'edge', 'model', 'poisson', '概率', '赔率', '模型', '胜率', '优势'], 'Probability or odds reasoning supports the conclusion.', 'Probability is given but reasoning is thin.', 'No probability or odds logic is provided.'),
      c('risk_boundary', 'Risk and uncertainty boundary', 'professionalStandard', 'high', ['risk', 'not financial advice', 'uncertainty', 'confidence', '风险', '不构成', '不确定', '置信'], 'Uncertainty and risk boundary are clearly stated.', 'Risk is mentioned briefly.', 'No risk or uncertainty note is provided.')
    ]
  },
  finance_defi: {
    label: 'Finance / DeFi',
    focus: 'Reviews yield, arbitrage, token risk, DeFi positions, and market opportunity reports.',
    evidenceToCheck: ['asset or protocol scope', 'data source', 'timestamp', 'APY/APR or price data', 'gas/slippage/cost assumptions', 'liquidity', 'risk notes'],
    criteria: [
      c('asset_scope', 'Asset, chain, or protocol scope', 'specMatch', 'high', ['asset', 'chain', 'protocol', 'pool', 'token', '资产', '链', '协议', '池子'], 'Requested asset, chain, or protocol is clearly covered.', 'Scope is present but incomplete.', 'Requested asset/protocol scope is missing.'),
      c('opportunity_output', 'Requested opportunity output', 'specMatch', 'high', ['apy', 'apr', 'funding', 'arbitrage', 'yield', 'risk score', '年化', '资金费率', '套利', '收益'], 'Requested yield, arbitrage, or risk output is provided.', 'Only part of the output is present.', 'Core opportunity output is missing.'),
      c('data_source_time', 'Data source and timestamp', 'acceptanceMet', 'high', ['source', 'timestamp', 'as of', 'updated', '来源', '时间', '截至', '更新'], 'Data sources and update time are cited.', 'Source or time is partial.', 'No data source or timestamp is provided.'),
      c('cost_model', 'Cost, fee, gas, or slippage model', 'functionalCorrectness', 'high', ['gas', 'fee', 'slippage', 'liquidity', 'cost', '手续费', '滑点', '流动性', '成本'], 'Execution costs, fees, liquidity, or slippage are considered.', 'Some cost factors are mentioned but not quantified.', 'No cost or liquidity constraint is considered.'),
      c('calculation_reasoning', 'Calculation reasoning', 'functionalCorrectness', 'high', ['calculation', 'annualized', 'spread', 'net', 'formula', '计算', '年化', '价差', '净收益'], 'Calculation or ranking logic is explained.', 'Result is given but calculation details are limited.', 'No calculation logic is provided.'),
      c('risk_disclosure', 'Risk disclosure', 'professionalStandard', 'high', ['risk', 'depeg', 'liquidation', 'oracle', 'not financial advice', '风险', '脱锚', '清算', '预言机'], 'Risks are disclosed and guaranteed-return language is avoided.', 'Risk disclosure is brief.', 'No risk disclosure is provided.')
    ]
  },
  software_service: {
    label: 'Software Service',
    focus: 'Reviews code, scripts, APIs, MCP endpoints, DApps, smart contract audits, and technical documents.',
    evidenceToCheck: ['source files', 'feature list', 'setup instructions', 'dependencies', 'test result', 'run/deploy command', 'logs/screenshots', 'security notes'],
    criteria: [
      c('feature_coverage', 'Feature coverage', 'specMatch', 'high', ['feature', 'implemented', 'requirement', 'function', '功能', '实现', '需求'], 'Requested core features are covered.', 'Some features are covered but important parts are incomplete.', 'Core requested features are missing.'),
      c('deliverable_files', 'Deliverable files or artifacts', 'specMatch', 'high', ['file', 'repo', 'source', 'artifact', 'contract', '文件', '仓库', '源码', '合约'], 'Required files, repo, artifact, or source material are provided.', 'Artifacts are referenced but incomplete.', 'No verifiable deliverable artifact is provided.'),
      c('setup_run', 'Setup and run instructions', 'acceptanceMet', 'high', ['install', 'setup', 'run', 'start', 'deploy', '安装', '配置', '运行', '启动', '部署'], 'Install, run, or deploy steps are provided.', 'Run instructions are incomplete.', 'No setup or run instructions are provided.'),
      c('test_evidence', 'Test or validation evidence', 'functionalCorrectness', 'high', ['test', 'passed', 'log', 'screenshot', 'coverage', '测试', '通过', '日志', '截图'], 'Tests, logs, screenshots, or validation evidence are provided.', 'Validation evidence is partial.', 'No test or validation evidence is provided.'),
      c('error_handling', 'Error handling and edge cases', 'functionalCorrectness', 'medium', ['error', 'exception', 'fallback', 'edge case', '错误', '异常', '边界'], 'Errors and important edge cases are addressed.', 'Some edge cases are mentioned.', 'No error handling or edge-case consideration is provided.'),
      c('code_quality', 'Code quality and maintainability', 'professionalStandard', 'medium', ['structure', 'readme', 'document', 'lint', 'maintain', '结构', '文档', '说明', '维护'], 'Delivery is structured, documented, and maintainable.', 'Structure or documentation is partial.', 'Basic structure or documentation is missing.')
    ]
  },
  life_service: {
    label: 'Life Service',
    focus: 'Reviews cooking, learning, planning, wellness-style, entertainment, and daily-life advice deliverables.',
    evidenceToCheck: ['user constraints', 'step-by-step plan', 'safety boundary', 'time/cost requirements', 'personalization', 'clear next action'],
    criteria: [
      c('user_context', 'User context and constraints', 'specMatch', 'high', ['age', 'budget', 'preference', 'restriction', 'condition', '年龄', '预算', '偏好', '限制', '情况'], 'User context and constraints are reflected.', 'Some context is considered but important constraints are missing.', 'User context and constraints are not addressed.'),
      c('requested_plan', 'Requested plan or answer', 'specMatch', 'high', ['plan', 'recipe', 'schedule', 'steps', '方案', '食谱', '计划', '步骤'], 'Requested plan, recipe, schedule, or answer is provided.', 'Plan is present but incomplete.', 'Requested output is missing.'),
      c('actionability', 'Actionable steps', 'acceptanceMet', 'high', ['step', 'do', 'prepare', 'checklist', '步骤', '准备', '清单', '执行'], 'Clear followable steps are provided.', 'Steps are present but vague.', 'No actionable steps are provided.'),
      c('safety_boundary', 'Safety and boundary notes', 'functionalCorrectness', 'high', ['risk', 'doctor', 'professional', 'allergy', 'not medical', '风险', '医生', '专业人士', '过敏', '非医疗'], 'Appropriate safety or boundary notes are included.', 'Boundary notes are brief.', 'No safety or boundary note is provided for sensitive advice.'),
      c('personalization', 'Personalization quality', 'functionalCorrectness', 'medium', ['custom', 'personalized', 'based on', 'tailored', '定制', '个性化', '根据'], 'Delivery is tailored to the specific request.', 'Personalization is generic.', 'Delivery is generic and not tailored.'),
      c('clarity_tone', 'Clarity and tone', 'professionalStandard', 'medium', ['summary', 'clear', 'note', 'avoid', '总结', '清晰', '注意', '避免'], 'Delivery is clear, careful, and appropriately framed.', 'Tone is acceptable but could be clearer.', 'Delivery is confusing or overclaims.')
    ]
  },
  creative_work: {
    label: 'Art & Creative',
    focus: 'Reviews copywriting, images, brand content, social posts, UI concepts, video scripts, and creative assets.',
    evidenceToCheck: ['final asset', 'format/size/count', 'style reference', 'target audience', 'platform', 'source/editable asset', 'usage fit'],
    criteria: [
      c('theme_style_fit', 'Theme and style fit', 'specMatch', 'high', ['theme', 'style', 'brand', 'tone', '主题', '风格', '品牌', '语气'], 'Theme, brand, tone, and style match the request.', 'Style is close but not fully aligned.', 'Requested style or theme is not matched.'),
      c('format_count', 'Format, size, or quantity requirements', 'acceptanceMet', 'high', ['format', 'size', 'dimension', 'count', 'length', '格式', '尺寸', '数量', '字数'], 'Format, size, count, or length requirements are satisfied.', 'Some format requirements are met.', 'Required format, size, or quantity is missing.'),
      c('target_audience', 'Target audience and use case', 'specMatch', 'medium', ['audience', 'user', 'platform', 'use case', '受众', '用户', '平台', '用途'], 'Delivery fits the target audience and usage scenario.', 'Audience fit is implied but not explicit.', 'Target audience or use case is ignored.'),
      c('publish_ready', 'Publish-ready quality', 'functionalCorrectness', 'high', ['publish', 'final', 'ready', 'usable', '发布', '最终', '可用'], 'Delivery is ready to publish or use with minimal editing.', 'Some editing is still needed.', 'It is not usable as a final deliverable.'),
      c('source_assets', 'Source or editable assets', 'acceptanceMet', 'medium', ['source', 'editable', 'figma', 'psd', 'prompt', '源文件', '可编辑', '提示词'], 'Source/editable assets are provided when required.', 'Source assets are mentioned but incomplete.', 'Required source or editable assets are missing.'),
      c('creative_quality', 'Creative quality and consistency', 'professionalStandard', 'medium', ['consistent', 'quality', 'polish', 'coherent', '一致', '质量', '完成度'], 'Delivery is consistent, polished, and coherent.', 'Quality is acceptable but uneven.', 'Delivery is inconsistent or low quality.')
    ]
  },
  general: {
    label: 'General / Other',
    focus: 'Reviews tasks that do not fit a specific OKX.AI category using general requirement coverage and evidence quality.',
    evidenceToCheck: ['original request', 'explicit acceptance criteria', 'final output', 'supporting evidence', 'user concern'],
    criteria: [
      c('requirement_coverage', 'Requirement coverage', 'specMatch', 'high', ['requirement', 'must', 'need', 'deliver', '需求', '必须', '需要', '交付'], 'Main task requirements are covered.', 'Some requirements are covered.', 'Core requirements are missing.'),
      c('acceptance_criteria', 'Acceptance criteria coverage', 'acceptanceMet', 'high', ['acceptance', 'criteria', 'standard', '验收', '标准'], 'Stated acceptance criteria are satisfied.', 'Acceptance criteria are partially satisfied.', 'Acceptance criteria are not addressed.'),
      c('final_output', 'Usable final output', 'functionalCorrectness', 'high', ['final', 'output', 'usable', 'result', '最终', '结果', '可用'], 'A usable final output is provided.', 'Output is present but needs clarification.', 'No usable final output is provided.'),
      c('supporting_evidence', 'Supporting evidence', 'functionalCorrectness', 'medium', ['evidence', 'proof', 'source', 'screenshot', '证据', '来源', '截图'], 'Supporting evidence is included.', 'Evidence is partial.', 'No supporting evidence is provided.'),
      c('completion_quality', 'Completion quality', 'professionalStandard', 'medium', ['complete', 'clear', 'structured', '完整', '清晰', '结构'], 'Delivery is complete, clear, and structured.', 'Delivery is understandable but incomplete.', 'Delivery is unclear or poorly structured.')
    ]
  }
};

const ACTIONS = [
  { min: 80, verdict: 'accept', label: 'Accept', risk: 'Low risk', summary: 'The deliverable appears ready for acceptance.' },
  { min: 75, verdict: 'minor_revision', label: 'Minor Revision', risk: 'Medium risk', summary: 'The deliverable is mostly complete but should be supplemented before final acceptance.' },
  { min: 60, verdict: 'request_revision', label: 'Request Revision', risk: 'Medium-high risk', summary: 'Ask the provider to supplement missing evidence before acceptance.' },
  { min: 0, verdict: 'reject_ready', label: 'Reject Ready', risk: 'High risk', summary: 'The deliverable has major gaps and the user should prepare a structured rejection reason.' }
];

export function verifyDeliverable(input = {}) {
  const normalized = normalizeInput(input);
  const skill = REVIEW_SKILLS[normalized.taskType] || REVIEW_SKILLS.general;
  const explicitCriteria = extractExplicitRequirements(normalized.taskDescription).map((requirement, index) => buildExplicitCriterion(requirement, index));
  const promiseCriteria = normalized.aspPromise ? [buildExplicitCriterion(`Service promise: ${normalized.aspPromise}`, 'promise')] : [];
  const criteria = [...explicitCriteria, ...promiseCriteria, ...skill.criteria];
  const coverageMatrix = criteria.map((item) => evaluateCriterion(item, normalized.deliverableText));
  const counts = countStatuses(coverageMatrix);
  const scores = scoreByDimension(coverageMatrix);
  const totalScore = Object.values(scores).reduce((sum, value) => sum + value, 0);
  const action = ACTIONS.find((item) => totalScore >= item.min) || ACTIONS[ACTIONS.length - 1];
  const missingItems = coverageMatrix.filter((row) => row.status !== 'pass').map((row) => row.requirement);
  const mainReasons = buildMainReasons(action, coverageMatrix, missingItems);
  const methodNote = 'This public MVP uses OKX.AI-style review dimensions, task-category review skills, and deterministic evidence checks. It is a review aid, not an official ruling.';
  return { jobId: normalized.jobId, taskTitle: normalized.taskTitle, taskType: normalized.taskType, skillLabel: skill.label, skillFocus: skill.focus, evidenceToCheck: skill.evidenceToCheck, reviewMode: 'deterministic_fallback', methodNote, verdict: action.verdict, verdictLabel: action.label, riskLevel: action.risk, summary: action.summary, totalScore, scores, scoreBasis: buildScoreBasis(coverageMatrix), statusCounts: counts, coverageMatrix, missingItems, mainReasons, suggestedReply: buildSuggestedReply(normalized, action, coverageMatrix), evidencePack: buildEvidencePack(normalized, action, scores, totalScore, coverageMatrix, missingItems, skill), generatedAt: new Date().toISOString() };
}

export function buildMarkdownReport(report) {
  const rows = report.coverageMatrix.map((row) => `| ${escapePipe(row.requirement)} | ${row.status} | ${row.dimension} | ${row.severity} | ${escapePipe(row.evidence)} | ${escapePipe(row.issue || '—')} |`).join(NL);
  return ['# AgentProof Review Report', '', `- Job ID: ${report.jobId || 'not provided'}`, `- Task: ${report.taskTitle || 'Untitled task'}`, `- Review skill: ${report.skillLabel || report.taskType}`, `- Review mode: ${report.reviewMode}`, `- Recommendation: ${report.verdictLabel}`, `- Reference score: ${report.totalScore}/100`, '', '## Score basis', '', `- Spec match: ${report.scores.specMatch}/40`, `- Acceptance met: ${report.scores.acceptanceMet}/30`, `- Functional correctness: ${report.scores.functionalCorrectness}/20`, `- Professional standard: ${report.scores.professionalStandard}/10`, '', '## Main reasons', '', report.mainReasons.map((reason) => `- ${reason}`).join(NL), '', '## Review checklist', '', '| Requirement | Status | Dimension | Severity | Evidence | Issue |', '|---|---|---|---|---|---|', rows, '', '## Suggested response', '', report.suggestedReply, '', '## Method note', '', report.methodNote].join(NL);
}

function normalizeInput(input) { return { jobId: String(input.jobId || '').trim(), taskTitle: String(input.taskTitle || '').trim(), taskType: String(input.taskType || 'world_cup_prediction').trim(), taskDescription: String(input.taskDescription || '').trim(), aspPromise: String(input.aspPromise || '').trim(), deliverableText: String(input.deliverableText || '').trim(), userConcern: String(input.userConcern || '').trim() }; }
function buildExplicitCriterion(requirement, index) { return { id: `explicit_${index}`, label: requirement, dimension: 'specMatch', severity: 'high', keywords: tokenizeRequirement(requirement), pass: 'The deliverable clearly addresses this explicit task requirement.', partial: 'The deliverable mentions this requirement but does not provide enough detail.', fail: 'The deliverable does not provide verifiable evidence for this explicit requirement.', explicit: true }; }
function extractExplicitRequirements(taskDescription) { const text = String(taskDescription || '').replace(/\r/g, ''); const bulletLines = text.split(NL).map((line) => line.replace(/^[-*•\d.)\s]+/, '').trim()).filter(Boolean); const bulletRequirements = bulletLines.filter((item) => item.length >= 8 && item.length <= 260 && REQUIREMENT_PATTERN.test(item) && !isHeadingLine(item)); if (bulletRequirements.length >= 2) return uniqueRequirements(bulletRequirements).slice(0, 12); return uniqueRequirements(text.split(/[.;。！？!?\n]+/).map((item) => item.trim()).filter((item) => item.length >= 8 && item.length <= 260 && REQUIREMENT_PATTERN.test(item) && !isHeadingLine(item))).slice(0, 12); }
function isHeadingLine(item) {
  return /^(acceptance criteria|验收标准|requirements|任务要求|criteria)[:：]?$/i.test(String(item).trim());
}

function evaluateCriterion(criterionItem, deliverableText) { const text = deliverableText.toLowerCase(); const keywords = criterionItem.keywords?.length ? criterionItem.keywords : tokenizeRequirement(criterionItem.label); const hits = keywords.filter((keyword) => text.includes(keyword.toLowerCase())); const requirementWords = tokenizeRequirement(criterionItem.label); const wordHits = requirementWords.filter((word) => text.includes(word.toLowerCase())); const hitScore = Math.max(keywords.length ? hits.length / keywords.length : 0, requirementWords.length ? Math.min(wordHits.length / Math.min(requirementWords.length, 5), 1) : 0); if (!deliverableText.trim()) return row(criterionItem, 'missing_evidence', 'No deliverable text was provided.', 'No evidence can be reviewed from empty delivery material.'); if (hitScore >= 0.45 || hits.length >= 2) return row(criterionItem, 'pass', hits.length ? `Found evidence keywords: ${hits.slice(0, 5).join(', ')}` : criterionItem.pass, null); if (hitScore >= 0.18 || hits.length === 1 || wordHits.length >= 1) return row(criterionItem, 'partial', `Partial signal detected: ${[...hits, ...wordHits].slice(0, 5).join(', ') || 'related wording'}`, criterionItem.partial); return row(criterionItem, 'missing_evidence', 'No clear supporting evidence found in the deliverable text.', criterionItem.fail); }
function row(criterionItem, status, evidence, issue) { return { id: criterionItem.id, requirement: criterionItem.label, status, dimension: criterionItem.dimension, severity: criterionItem.severity, evidence, issue, passRule: criterionItem.pass, partialRule: criterionItem.partial, failRule: criterionItem.fail }; }
function tokenizeRequirement(requirement) {
  const source = String(requirement || '');
  const lower = source.toLowerCase();
  const latin = lower.replace(/[^a-z0-9\s]/g, ' ').split(/\s+/).filter((word) => word.length > 2).filter((word) => !STOP_WORDS.includes(word));
  const zhDictionary = ['比赛', '市场', '球队', '赛程', '时间', '胜率', '比分', '赔率', '概率', '链接', '来源', '伤病', '阵容', '状态', '上下文', '风险', '不确定', '简报', '交付', '目标', '数据', '更新', '模型', '预测'];
  const zh = zhDictionary.filter((word) => source.includes(word));
  return [...new Set([...latin, ...zh])].slice(0, 12);
}
function uniqueRequirements(items) { const seen = new Set(); return items.filter((item) => { const key = item.toLowerCase().replace(/\s+/g, ' ').trim(); if (!key || seen.has(key)) return false; seen.add(key); return true; }); }
function countStatuses(rows) { return rows.reduce((acc, row) => { acc[row.status] = (acc[row.status] || 0) + 1; return acc; }, { pass: 0, partial: 0, missing_evidence: 0, fail: 0 }); }
function scoreByDimension(rows) { const scores = {}; for (const [dimension, config] of Object.entries(DIMENSIONS)) { const dimensionRows = rows.filter((row) => row.dimension === dimension); if (!dimensionRows.length) { scores[dimension] = 0; continue; } const earned = dimensionRows.reduce((sum, row) => sum + SCORE_VALUE[row.status], 0); scores[dimension] = Math.round(clamp(earned / dimensionRows.length, 0, 1) * config.max); } return scores; }
function buildScoreBasis(rows) { return Object.fromEntries(Object.keys(DIMENSIONS).map((dimension) => { const dimensionRows = rows.filter((row) => row.dimension === dimension); return [dimension, { max: DIMENSIONS[dimension].max, total: dimensionRows.length, pass: dimensionRows.filter((row) => row.status === 'pass').length, partial: dimensionRows.filter((row) => row.status === 'partial').length, missingEvidence: dimensionRows.filter((row) => row.status === 'missing_evidence').length, fail: dimensionRows.filter((row) => row.status === 'fail').length }]; })); }
function buildMainReasons(action, matrix, missingItems) { if (action.verdict === 'accept') return ['Most core requirements have supporting evidence in the provided deliverable.']; const priority = { high: 0, medium: 1, low: 2 }; const rows = matrix.filter((row) => row.status !== 'pass').sort((a, b) => priority[a.severity] - priority[b.severity]).slice(0, 4); const reasons = rows.map((row) => { if (row.status === 'partial') return `${row.requirement}: partially addressed, but the evidence is not detailed enough for confident acceptance.`; if (row.status === 'fail') return `${row.requirement}: does not match the requirement.`; return `${row.requirement}: no clear supporting evidence was found in the provided deliverable.`; }); if (!reasons.length && missingItems.length) reasons.push(`The review found unresolved items: ${missingItems.slice(0, 3).join(', ')}.`); return reasons.length ? reasons : ['The deliverable should be reviewed manually before final acceptance.']; }
function buildSuggestedReply(input, action, matrix) { const jobPart = input.jobId ? ` for Job ID ${input.jobId}` : ''; const unresolved = matrix.filter((row) => row.status !== 'pass').sort((a, b) => (a.severity === 'high' ? -1 : 1)).slice(0, 7); if (action.verdict === 'accept') return `I reviewed the deliverable${jobPart} and it appears to satisfy the main task requirements. I am ready to accept the delivery.`; const itemList = unresolved.length ? unresolved.map((row, index) => `${index + 1}. ${row.requirement} — ${row.status === 'missing_evidence' ? 'missing evidence' : row.status}`).join(NL) : '1. Please provide additional evidence for the requested acceptance criteria.'; if (action.verdict === 'minor_revision') return ['I can accept the delivery after minor supplements' + jobPart + '. Please add or clarify:', itemList, 'Once these points are addressed, the deliverable should be ready for acceptance.'].join(NL + NL); if (action.verdict === 'request_revision') return ['I am not ready to accept the delivery yet' + jobPart + '. Please revise and supplement the following missing or partial items:', itemList, 'These items are part of the original task requirements or review checklist and are needed before final acceptance.'].join(NL + NL); return ['I cannot accept the current delivery' + jobPart + ' because major required items are missing or not verifiable:', itemList, 'Please provide a substantially revised deliverable or the task may need to proceed with a structured rejection / dispute evidence pack.'].join(NL + NL); }
function buildEvidencePack(input, action, scores, totalScore, matrix, missingItems, skill) { const facts = matrix.filter((row) => row.status !== 'pass').slice(0, 10).map((row, index) => `${index + 1}. ${row.requirement} — ${row.status.toUpperCase()} (${row.dimension}, ${row.severity}). ${row.issue || row.evidence}`).join(NL); return ['Review summary', '', `Job ID: ${input.jobId || 'not provided'}`, `Task: ${input.taskTitle || 'Untitled task'}`, `Review skill: ${skill.label}`, `Suggested action: ${action.label}`, `Reference scoring: Spec ${scores.specMatch}/40 + Acceptance ${scores.acceptanceMet}/30 + Functional ${scores.functionalCorrectness}/20 + Professional ${scores.professionalStandard}/10 = Total ${totalScore}/100`, '', 'Evidence to check:', skill.evidenceToCheck.map((item) => `- ${item}`).join(NL), '', 'Findings:', facts || '1. No major missing item detected by the current verifier.', '', 'Missing / partial / evidence-insufficient items:', missingItems.length ? missingItems.map((item) => `- ${item}`).join(NL) : '- None detected', '', 'Boundary:', 'AgentProof reviews only the materials provided by the user. Missing evidence means not verifiable from the provided deliverable; it does not automatically prove provider failure.'].join(NL); }
function clamp(value, min, max) { return Math.max(min, Math.min(max, value)); }
function escapePipe(value) { return String(value).replace(/\|/g, '\\|').split(NL).join('<br>'); }
