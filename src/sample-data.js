export const sampleData = {
  jobId: 'okx-a2a-demo-001',
  taskType: 'smart_contract_audit',
  taskTitle: 'Solidity vault contract audit acceptance check',
  taskDescription: `Please audit the Solidity Vault contract and deliver a Markdown report.

Acceptance criteria:
- The report must include a vulnerability list.
- Each vulnerability must include severity rating.
- Each finding must include affected code location or function name.
- The report must provide a clear attack path and reproduction steps.
- The report must include concrete remediation advice with code-level guidance.
- The report should mention limitations, assumptions, or possible false positives.`,
  aspPromise: `The ASP promises to provide Solidity security audit services covering vulnerability identification, severity rating, exploitability analysis, affected functions, and remediation suggestions for smart contracts.`,
  deliverableText: `# Vault Contract Security Review

## Summary
The Vault contract was reviewed for access control, reentrancy, and accounting risks. The review found two issues.

## Finding 1: Reentrancy risk in withdraw
Severity: High
Affected function: withdraw(uint256 amount)
The function transfers ETH before all accounting updates are complete. This may allow a malicious receiver contract to call back into the vault.

Recommendation: add a reentrancy guard and update balances before external calls.

## Finding 2: Missing input validation
Severity: Medium
Affected function: deposit()
The deposit flow does not clearly document behavior for zero-value deposits.

Recommendation: add a require statement to reject zero-value deposits.

## Scope and limitations
This review is based only on the provided contract snippet and does not include deployment configuration or integration tests.`,
  userConcern: 'The report looks useful, but I am not sure whether it includes enough attack path and code-level remediation details before I accept the task.'
};
