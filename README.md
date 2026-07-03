# AgentProof

**Agents deliver. AgentProof verifies.**

AgentProof is a pre-acceptance verification workspace for agent task deliverables. It helps users review whether a submitted deliverable satisfies the original task before accepting, rejecting, or escalating the task.

Live demo: https://agentproof-b5q.pages.dev/

---

## Overview

AgentProof is designed for agent-native task workflows where a user receives a deliverable and needs a structured way to review it.

The current MVP provides:

- Requirement extraction from the original task brief
- Deliverable coverage checking
- Four-part scoring rubric
- Coverage matrix with Pass / Partial / Fail status
- Suggested revision or rejection reply
- Evidence-style report for human review
- JSON output for API and agent workflows
- Markdown export

AgentProof is not an arbitration system and does not make binding decisions. It is a verification workspace that helps users and service providers prepare clearer acceptance decisions.

---

## Scoring Rubric

The MVP uses a four-part scoring model:

| Dimension | Weight |
|---|---:|
| Spec Match | 40 |
| Acceptance Met | 30 |
| Functional Correctness | 20 |
| Professional Standard | 10 |

The final score maps to one of four suggested actions:

| Score | Suggested Action |
|---:|---|
| 80 - 100 | Accept |
| 75 - 79 | Minor Revision |
| 60 - 74 | Request Revision |
| < 60 | Reject Ready |

---

## Demo Scenario

The default demo uses a Solidity audit review case:

1. A user asks for a Solidity vault contract audit.
2. The task requires vulnerability list, severity rating, code location, attack path, reproduction steps, and remediation advice.
3. The submitted report contains useful findings but lacks clear attack path and code-level remediation details.
4. AgentProof scores the deliverable and recommends **Request Revision**.
5. The user receives a structured reply and evidence-style report.

---

## API

AgentProof includes a Cloudflare Pages Function API prototype.

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

### Example Response

```json
{
  "verdict": "request_revision",
  "verdictLabel": "Request Revision",
  "totalScore": 69,
  "scores": {
    "specMatch": 27,
    "acceptanceMet": 21,
    "functionalCorrectness": 12,
    "professionalStandard": 9
  },
  "coverageMatrix": [],
  "missingItems": [],
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
- Deterministic verification logic
- No external AI dependency in the MVP

The MVP intentionally avoids API keys, wallets, databases, private user files, and external model calls so the public demo remains stable and easy to review.

---

## Project Structure

```text
index.html                 Main single-page interface
src/app.js                 UI interaction and report rendering
src/styles.css             Visual design and responsive layout
src/sample-data.js         Built-in demo scenario
src/verifier.js            Deterministic verification logic
functions/api/verify.js    Cloudflare Pages Function API
wrangler.toml              Cloudflare configuration
```

---

## Deployment

Recommended Cloudflare Pages configuration:

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

Cloudflare Pages will publish the static site and expose the Pages Function under `/api/verify`.

---

## Privacy and Security Notes

- The MVP does not store submitted task data.
- The MVP does not require wallet connection.
- The MVP does not include API keys or secrets.
- The verifier runs deterministic logic for the public demo.
- Users should not paste private keys, seed phrases, passwords, or confidential production data into public demos.

---

## Project Status

AgentProof is an MVP for validating a pre-acceptance verification workflow for agent task deliverables. Future versions may add richer templates, optional AI-assisted review, shareable reports, and deeper agent workflow integrations.

---

# AgentProof 中文说明

**Agent 负责交付，AgentProof 负责验证。**

AgentProof 是一个面向 Agent 任务交付物的验收前检查工作台。它帮助用户在验收、拒绝或升级任务之前，结构化判断交付物是否满足原始任务要求。

在线演示： https://agentproof-b5q.pages.dev/

---

## 项目概览

AgentProof 面向 Agent 原生任务流程：用户收到交付物后，需要一种结构化方式判断交付质量。

当前 MVP 提供：

- 从原始任务描述中提取要求
- 检查交付物覆盖情况
- 四维评分
- Pass / Partial / Fail 覆盖矩阵
- 修改或拒绝回复草稿
- 证据风格报告
- 面向 API 和 Agent 工作流的 JSON 输出
- Markdown 导出

AgentProof 不是仲裁系统，也不会做出有约束力的裁决。它是一个验收前检查工作台，用来帮助用户和服务提供方做出更清晰的验收判断。

---

## 评分框架

MVP 使用四维评分模型：

| 维度 | 权重 |
|---|---:|
| 规格匹配 | 40 |
| 验收满足 | 30 |
| 功能正确性 | 20 |
| 专业标准 | 10 |

总分对应四类建议动作：

| 分数 | 建议动作 |
|---:|---|
| 80 - 100 | Accept |
| 75 - 79 | Minor Revision |
| 60 - 74 | Request Revision |
| < 60 | Reject Ready |

---

## 演示场景

默认 Demo 使用 Solidity 审计验收场景：

1. 用户要求审计 Solidity Vault 合约。
2. 任务要求包含漏洞列表、严重性评级、代码位置、攻击路径、复现步骤和修复建议。
3. 交付报告包含有用发现，但缺少清晰攻击路径和代码级修复细节。
4. AgentProof 给出评分，并建议 **Request Revision**。
5. 用户获得结构化回复和证据风格报告。

---

## API

AgentProof 包含一个 Cloudflare Pages Function API 原型。

### 接口

```http
POST /api/verify
```

### 请求示例

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

---

## 技术栈

- Cloudflare Pages
- Cloudflare Pages Functions
- 原生 JavaScript
- HTML / CSS
- 确定性验证逻辑
- MVP 不依赖外部 AI API

第一版不包含 API Key、钱包连接、数据库、私有用户文件或外部模型调用，因此更适合公开演示和评审。

---

## 项目结构

```text
index.html                 单页主界面
src/app.js                 页面交互和报告渲染
src/styles.css             视觉样式和响应式布局
src/sample-data.js         内置演示数据
src/verifier.js            确定性验证逻辑
functions/api/verify.js    Cloudflare Pages Function API
wrangler.toml              Cloudflare 配置
```

---

## 部署方式

Cloudflare Pages 推荐配置：

```text
Framework preset: None
Build command: npm run build
Build output directory: dist
Root directory: /
Environment variables: none required
```

本地构建：

```bash
npm run build
```

Cloudflare Pages 会发布静态网站，并自动暴露 `/api/verify` 函数接口。

---

## 隐私和安全说明

- MVP 不存储提交的任务数据。
- MVP 不需要连接钱包。
- MVP 不包含 API Key 或密钥。
- 公开 Demo 使用确定性逻辑运行。
- 用户不应在公开 Demo 中粘贴私钥、助记词、密码或机密生产数据。

---

## 项目状态

AgentProof 当前是一个 MVP，用于验证 Agent 任务交付物的验收前检查流程。后续版本可以加入更丰富的模板、可选 AI 辅助分析、可分享报告以及更深入的 Agent 工作流集成。
