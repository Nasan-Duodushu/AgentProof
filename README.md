# AgentProof

**Review an Agent delivery before you accept it.**

AgentProof is an OKX.AI Agent delivery review demo. It helps a user compare an original task with an Agent deliverable, identify possible gaps, and draft a clear follow-up response before acceptance.

Live demo: https://agentproof-b5q.pages.dev/

---

## What It Does

AgentProof is designed for the moment after an Agent has delivered work and before the user accepts it.

The demo can:

- Extract explicit requirements from the original task brief
- Add OKX.AI category review skills
- Compare the deliverable against the requirement checklist
- Mark each item as Pass / Partial / Fail
- Generate a reference coverage score
- Summarize the main reasons behind the recommendation
- Draft a follow-up response
- Produce evidence-style review notes
- Return structured JSON through `/api/verify`

AgentProof is a review assistant, not an official judge. It helps organize acceptance review notes; the user remains responsible for final acceptance, rejection, or dispute decisions.

---

## Review Method

AgentProof review skills now include category-specific scope, non-applicable cases, evidence checklists, common issues, follow-up questions, and criterion-level severity.

The public MVP uses a deterministic fallback mechanism aligned with OKX.AI-style professional arbitration dimensions:

1. Extract explicit requirements from the task description.
2. Select an OKX.AI service category review skill, such as World Cup / Prediction Market, Finance / DeFi, Software Service, Life Service, Art & Creative, or General / Other.
3. Add category-specific evidence checks and review criteria.
4. Match deliverable evidence against each criterion.
5. Score each dimension using the formula `(passes + 0.5 × partials) / total × dimension weight`.
6. Produce a review checklist, reference score, main reasons, and response draft.

This mechanism is intentionally transparent and stable for a public demo. A production version can add AI-assisted semantic review and evidence mapping, while keeping deterministic checks as a fallback. Missing evidence means the item is not verifiable from the provided deliverable; it does not automatically prove provider failure.

---

## Demo Scenario

The default sample uses a World Cup / prediction-market delivery review:

1. The original task asks for match scope, current data, probability reasoning, market link, and risk notes.
2. The submitted brief includes prediction probabilities and likely scores.
3. The brief lacks some current-data evidence and direct market/source links.
4. AgentProof recommends asking for supplements before acceptance.

---

## API

### Endpoint

```http
POST /api/verify
```

### Example Request

```json
{
  "jobId": "demo-001",
  "taskType": "smart_contract_audit",
  "taskTitle": "Solidity vault contract audit acceptance check",
  "taskDescription": "The report must include severity rating, attack path, code location, and remediation advice.",
  "aspPromise": "The provider promises to deliver a Solidity security review.",
  "deliverableText": "Severity: High. Affected function: withdraw(). Recommendation: add a reentrancy guard.",
  "userConcern": "I am not sure if the report includes enough attack path detail."
}
```

### Example Response Fields

```json
{
  "reviewMode": "deterministic_fallback",
  "methodNote": "...",
  "verdict": "request_revision",
  "verdictLabel": "Request Revision",
  "totalScore": 69,
  "mainReasons": [],
  "coverageMatrix": [],
  "suggestedReply": "...",
  "evidencePack": "..."
}
```

---

## Tech Stack

- Cloudflare Pages
- Cloudflare Pages Functions
- Vanilla JavaScript
- HTML / CSS
- Deterministic review logic
- No external model dependency in the public MVP

---

## Deployment

Cloudflare Pages configuration:

```text
Framework preset: None
Build command: npm run build
Build output directory: dist
Root directory: /
Environment variables: none required
```

Build locally:

```bash
npm run build
```

---

## Privacy and Security Notes

- The demo does not store submitted task data.
- The demo does not require wallet connection.
- The demo does not include API keys or secrets.
- Users should not paste private keys, seed phrases, passwords, or confidential production data into public demos.

---

# AgentProof 中文说明

**验收 Agent 交付物之前，先做一次复核。**

AgentProof 是一个 OKX.AI Agent 交付物验收复核演示。它帮助用户把原始任务和 Agent 交付物进行对比，整理可能缺失项，并在验收前生成清晰的后续回复草稿。

在线演示： https://agentproof-b5q.pages.dev/

---

## 功能说明

AgentProof 面向“其他 Agent 已经交付、用户准备验收之前”的场景。

当前 Demo 可以：

- 从原始任务中提取明确要求
- 根据任务类型补充复核项
- 将交付物逐条映射到要求清单
- 标记通过 / 部分满足 / 未满足
- 生成参考覆盖分
- 汇总主要建议原因
- 生成后续回复草稿
- 生成证据风格复核说明
- 通过 `/api/verify` 返回结构化 JSON

AgentProof 是验收复核助手，不是官方裁决者。它帮助整理验收复核材料，最终验收、拒绝或争议决策仍由用户自己负责。

---

## 复核机制

AgentProof 的复核 Skill 已包含分类适用范围、不适用场景、必查证据、常见问题、追问建议和标准级优先级。

公开 MVP 使用与 OKX.AI 风格专业仲裁维度对齐的确定性兜底机制：

1. 从任务描述中提取明确要求。
2. 选择 OKX.AI 服务分类复核 Skill，例如世界杯 / 预测市场、金融 / DeFi、软件服务、生活服务、艺术创作或其他。
3. 根据分类补充证据清单和复核标准。
4. 将交付物证据逐条匹配到每个标准。
5. 使用 `(通过项 + 0.5 × 部分满足项) / 总项 × 维度权重` 计算每个维度参考分。
6. 生成复核清单、参考分、主要原因和回复草稿。

这个机制适合公开演示，稳定且可解释。正式版本可以加入 AI 语义复核和证据映射，同时保留规则检查作为兜底。证据不足表示当前交付物无法验证该项，不等于断言服务方失败。

---

## 技术栈

- Cloudflare Pages
- Cloudflare Pages Functions
- 原生 JavaScript
- HTML / CSS
- 确定性复核逻辑
- 公开 MVP 不依赖外部模型

---

## 部署方式

```text
Framework preset: None
Build command: npm run build
Build output directory: dist
Root directory: /
Environment variables: none required
```

---

## 隐私和安全说明

- Demo 不存储提交的任务数据。
- Demo 不需要连接钱包。
- Demo 不包含 API Key 或密钥。
- 用户不应在公开 Demo 中粘贴私钥、助记词、密码或机密生产数据。
