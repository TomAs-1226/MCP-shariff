import { Finding } from '../mcp/types.js';

const severityPenalty: Record<Finding['severity'], number> = {
  low: 5,
  medium: 12,
  high: 25
};

export function computeRiskScore(findings: Finding[]): number {
  const penalty = findings.reduce((acc, f) => acc + severityPenalty[f.severity], 0);
  return Math.max(0, 100 - penalty);
}
