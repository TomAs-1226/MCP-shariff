import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { Report } from '../mcp/types.js';

export async function writeMarkdownReport(report: Report, outDir: string): Promise<string> {
  await mkdir(outDir, { recursive: true });
  const output = join(outDir, 'report.md');

  const lines: string[] = [];
  lines.push(`# MCP Doctor Report`);
  lines.push('');
  lines.push(`- Generated: ${report.generatedAt}`);
  lines.push(`- Command: \`${report.server.command}\``);
  lines.push(`- Protocol version: ${report.server.protocolVersion ?? 'unknown'}`);
  lines.push(`- Risk score: **${report.score}/100**`);
  lines.push('');

  lines.push('## Tools');
  lines.push('');
  lines.push('| Name | Description |');
  lines.push('| --- | --- |');
  for (const tool of report.tools) {
    lines.push(`| ${tool.name} | ${tool.description ?? ''} |`);
  }
  lines.push('');

  lines.push('## Findings');
  lines.push('');
  if (report.findings.length === 0) {
    lines.push('- No findings');
  } else {
    for (const finding of report.findings) {
      lines.push(`- **${finding.severity.toUpperCase()}** ${finding.ruleId}: ${finding.message}`);
      lines.push(`  - Evidence: \`${finding.evidence}\``);
      lines.push(`  - Remediation: ${finding.remediation}`);
    }
  }

  lines.push('');
  lines.push('## Contract Tests');
  lines.push('');
  for (const test of report.tests) {
    lines.push(`- ${test.passed ? '✅' : '❌'} ${test.name}: ${test.details ?? ''}`);
  }

  await writeFile(output, `${lines.join('\n')}\n`, 'utf8');
  return output;
}
