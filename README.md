# AgentProof

**Agents deliver. AgentProof verifies.**

AgentProof is a pre-acceptance verifier for OKX.AI A2A task deliverables. It helps users and Agent Service Providers evaluate whether a submitted deliverable satisfies the original task before acceptance, rejection, or dispute.

Live demo: https://agentproof-b5q.pages.dev/

---

## What AgentProof Does

OKX.AI already provides task publishing, A2A service providers, escrow-based delivery, acceptance, rejection, and dispute flows. AgentProof adds a missing layer before the user clicks accept or reject:

- Checks whether the deliverable matches the original task requirements
- Scores the deliverable with an OKX.AI-style four-part rubric
- Generates a requirement coverage matrix
- Highlights missing or partial items
- Drafts a revision or rejection reply
- Produces a dispute-ready evidence pack

AgentProof does not replace OKX.AI arbitration. It helps users and ASPs prepare better decisions and better evidence before the official flow continues.

---

## Core Features

- **Pre-acceptance verification** for OKX.AI A2A tasks
- **Four-part scoring rubric**
  - Spec Match: 40
  - Acceptance Met: 30
  - Functional Correctness: 20
  - Professional Standard: 10
- **Coverage matrix** with Pass / Partial / Fail status
- **Suggested action**: Accept, Minor Revision, Request Revision, or Reject Ready
- **Suggested reply** for the user to send back to the provider
- **Evidence pack** for possible dispute preparation
- **JSON report** for API and agent workflows
- **Markdown export** for human review
- **Cloudflare Pages Function API** at `/api/verify`

---

## Demo Scenario

The current demo uses a Solidity audit acceptance case:

1. A user asks an ASP to audit a Solidity vault contract.
2. The acceptance criteria require vulnerability list, severity rating, code location, attack path, reproduction steps, and remediation advice.
3. The ASP submits a report that looks useful but lacks a clear attack path and code-level remediation details.
4. AgentProof scores the deliverable and recommends **Request Revision**.
5. The user receives a structured reply and evidence pack.

This scenario is designed for a 90-second OKX.AI Genesis Hackathon demo.

---

## API Contract

AgentProof includes a hosted verification API prototype.

### Endpoint

```http
POST /api/verify
```

### Example Request

```json
{
  "jobId": "okx-a2a-demo-001",
  "taskType": "smart_contract_audit",
  "taskTitle": "Solidity vault contract audit acceptance check",
  "taskDescription": "The report must include severity rating, attack path, code location, and remediation advice.",
  "aspPromise": "The ASP promises to provide Solidity security audit services.",
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
- Deterministic verifier logic, no external AI dependency in the MVP

The MVP intentionally avoids API keys, wallets, private data, databases, and external model calls so the public demo remains stable and easy to review.

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

Local build command:

```bash
npm run build
```

Cloudflare Pages will build the static site and expose the Pages Function under `/api/verify`.

---

## OKX.AI ASP Listing Draft

### ASP Name

```text
AgentProof
```

### ASP Description

```text
AgentProof is a pre-acceptance verifier for OKX.AI A2A tasks. It helps users and ASPs evaluate whether an agent deliverable satisfies the original task requirements before acceptance, rejection, or dispute. AgentProof produces a structured verification report with OKX.AI-style scoring, requirement coverage matrix, missing item analysis, suggested revision or rejection reply, and dispute-ready evidence pack.
```

### Service Name

```text
Deliverable Verification Report
```

### Service Type

```text
A2A
```

### Suggested Fee

```text
0.5 USDT
```

### Service Description

```text
① AgentProof checks whether an OKX.AI task deliverable satisfies the original task requirements using a structured four-part rubric: specification match, acceptance criteria, functional correctness, and professional standard.

② The user should provide the Job ID, task description, ASP promise or service description, deliverable text or files, and any concerns about acceptance or rejection.
```

---

## Roadmap

- Add richer verification templates for code, research, creative work, and security reports
- Add optional LLM-powered analysis while keeping deterministic scoring as a fallback
- Add report history and shareable report links
- Add PDF export
- Add OKX.AI A2A ASP workflow
- Add A2MCP quick verification endpoint with x402 payment support
- Add task deliverable import helpers for Onchain OS workflows

---

# AgentProof 中文说明

**Agent 负责交付，AgentProof 负责验证。**

AgentProof 是一个面向 OKX.AI A2A 任务的验收前检查器。它帮助用户和 Agent 服务提供商在验收、拒绝或进入争议前，判断交付物是否满足原始任务要求。

在线演示： https://agentproof-b5q.pages.dev/

---

## AgentProof 是什么

OKX.AI 已经提供任务发布、A2A 服务商、担保结算、交付、验收、拒绝和争议流程。AgentProof 补充的是用户点击验收或拒绝之前的判断层：

- 检查交付物是否匹配原始任务要求
- 使用 OKX.AI 风格的四维评分框架打分
- 生成需求覆盖矩阵
- 标出缺失项和部分满足项
- 生成修改或拒绝回复草稿
- 生成预仲裁证据包

AgentProof 不替代 OKX.AI 官方仲裁。它帮助用户和 ASP 在进入官方流程前做出更清晰、更有证据的决策。

---

## 核心功能

- OKX.AI A2A 任务验收前检查
- 四维评分：
  - 规格匹配：40 分
  - 验收满足：30 分
  - 功能正确性：20 分
  - 专业标准：10 分
- Pass / Partial / Fail 覆盖矩阵
- 建议动作：Accept、Minor Revision、Request Revision、Reject Ready
- 可复制的用户回复
- 预仲裁证据包
- JSON 报告
- Markdown 导出
- Cloudflare Pages Function API：`/api/verify`

---

## 演示场景

当前 Demo 使用 Solidity 审计验收场景：

1. 用户要求 ASP 审计一个 Solidity Vault 合约。
2. 验收标准要求漏洞列表、严重性评级、代码位置、攻击路径、复现步骤和修复建议。
3. ASP 提交的报告看起来有用，但缺少清晰攻击路径和代码级修复细节。
4. AgentProof 给出评分并建议 **Request Revision**。
5. 用户获得结构化修改回复和证据包。

这个场景适合用于 OKX.AI Genesis Hackathon 的 90 秒演示视频。

---

## 技术栈

- Cloudflare Pages
- Cloudflare Pages Functions
- 原生 JavaScript
- HTML / CSS
- MVP 使用确定性评分逻辑，不依赖外部 AI API

第一版不包含 API Key、钱包私钥、数据库、真实用户数据或外部模型调用，因此更适合公开展示和评审。

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

本地构建命令：

```bash
npm run build
```

Cloudflare Pages 会发布静态网站，并自动暴露 `/api/verify` 函数接口。

---

## OKX.AI ASP 上架草案

### ASP 名称

```text
AgentProof
```

### ASP 描述

```text
AgentProof is a pre-acceptance verifier for OKX.AI A2A tasks. It helps users and ASPs evaluate whether an agent deliverable satisfies the original task requirements before acceptance, rejection, or dispute. AgentProof produces a structured verification report with OKX.AI-style scoring, requirement coverage matrix, missing item analysis, suggested revision or rejection reply, and dispute-ready evidence pack.
```

### 服务名称

```text
Deliverable Verification Report
```

### 服务类型

```text
A2A
```

### 建议价格

```text
0.5 USDT
```

### 服务描述

```text
① AgentProof checks whether an OKX.AI task deliverable satisfies the original task requirements using a structured four-part rubric: specification match, acceptance criteria, functional correctness, and professional standard.

② The user should provide the Job ID, task description, ASP promise or service description, deliverable text or files, and any concerns about acceptance or rejection.
```

---

## 后续路线图

- 增加代码、研究报告、创意交付、安全报告等更多检查模板
- 增加可选 LLM 分析，同时保留确定性评分作为兜底
- 增加报告历史和分享链接
- 增加 PDF 导出
- 接入 OKX.AI A2A ASP 工作流
- 增加支持 x402 的 A2MCP quick verification endpoint
- 增加 Onchain OS 任务交付物导入辅助能力
