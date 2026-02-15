#!/usr/bin/env node
import { mkdir, readFile } from 'node:fs/promises';
import { basename, join } from 'node:path';
import { Command } from 'commander';
import yaml from 'js-yaml';
import { JsonRpcClient } from './mcp/jsonrpc.js';
import { StdioTransport } from './mcp/transport_stdio.js';
import { Finding, Report, ToolDescriptor } from './mcp/types.js';
import { writeJsonReport } from './report/json.js';
import { writeMarkdownReport } from './report/markdown.js';
import { writeSarif } from './report/sarif.js';
import { computeRiskScore } from './security/scorer.js';
import { pathTraversalRule } from './security/rules/path_traversal.js';
import { rawArgsRule } from './security/rules/raw_args.js';
import { shellInjectionRule } from './security/rules/shell_injection.js';
import { runSchemaLints } from './validate/schema_lints.js';
import { runCallToolTest } from './tests/contract/call_tool.js';
import { runErrorShapesTest } from './tests/contract/error_shapes.js';
import { runListToolsTest } from './tests/contract/list_tools.js';

const program = new Command();

async function executeSuite(stdioCommand: string, outDir: string, runTests: boolean, runAudit: boolean, sarif?: string): Promise<number> {
  const transport = new StdioTransport();
  await transport.start({ stdioCommand });
  const client = new JsonRpcClient(transport, 4000);

  const findings: Finding[] = [];
  let tools: ToolDescriptor[] = [];
  const tests = [];
  let protocolVersion = 'unknown';

  try {
    const init = await client.request<{ protocolVersion?: string }>('initialize', {
      clientInfo: { name: 'mcp-doctor', version: '0.1.0' }
    });
    protocolVersion = init.protocolVersion ?? 'unknown';

    const listResult = await runListToolsTest(client);
    tools = listResult.tools;
    if (runTests) tests.push(listResult.result);

    if (runTests) {
      tests.push(await runCallToolTest(client));
      tests.push(await runErrorShapesTest(client));
    }

    if (runAudit) {
      findings.push(...runSchemaLints(tools));
      findings.push(...pathTraversalRule(tools));
      findings.push(...shellInjectionRule(tools));
      findings.push(...rawArgsRule(tools));
    }
  } finally {
    await transport.stop();
  }

  const score = computeRiskScore(findings);
  const report: Report = {
    server: { command: stdioCommand, protocolVersion },
    tools,
    findings,
    tests,
    score,
    generatedAt: new Date().toISOString()
  };

  await mkdir(outDir, { recursive: true });
  await writeJsonReport(report, outDir);
  await writeMarkdownReport(report, outDir);
  if (sarif) {
    await writeSarif(findings, sarif);
  }

  if (tests.some((t) => !t.passed)) return 2;
  if (findings.length > 0) return 1;
  return 0;
}

program
  .name('mcp-doctor')
  .description('Validate, test, and security-audit MCP servers over STDIO');

for (const commandName of ['validate', 'test', 'audit'] as const) {
  program.command(commandName)
    .requiredOption('--stdio <cmd>', 'Command used to launch MCP server')
    .option('--out <dir>', 'Output directory', 'reports')
    .option('--sarif <file>', 'SARIF output file (audit command only)')
    .action(async (options) => {
      const doTests = commandName === 'test' || commandName === 'audit';
      const doAudit = commandName === 'audit' || commandName === 'validate';
      const code = await executeSuite(options.stdio, options.out, doTests, doAudit, options.sarif);
      process.exit(code);
    });
}

const registry = program.command('registry').description('Registry utilities');

registry.command('lint')
  .argument('<file>', 'Registry yaml file')
  .action(async (file) => {
    const raw = await readFile(file, 'utf8');
    const parsed = yaml.load(raw) as Record<string, unknown>;
    const servers = (parsed.servers ?? []) as Array<Record<string, unknown>>;
    const missing = servers.filter((s) => !s.name || !s.repo || !s.transport);
    if (missing.length > 0) {
      // eslint-disable-next-line no-console
      console.error(`Registry lint failed: ${missing.length} entries missing required fields`);
      process.exit(2);
    }
    // eslint-disable-next-line no-console
    console.log(`Registry lint ok: ${servers.length} entries`);
    process.exit(0);
  });

registry.command('score')
  .argument('<file>', 'Registry yaml file')
  .action(async (file) => {
    const raw = await readFile(file, 'utf8');
    const parsed = yaml.load(raw) as Record<string, unknown>;
    const servers = (parsed.servers ?? []) as Array<Record<string, unknown>>;
    const rows = ['# Registry Scoreboard', '', '| Server | Score |', '| --- | --- |'];
    for (const server of servers) {
      const score = server.securityNotes ? 90 : 70;
      rows.push(`| ${String(server.name ?? basename(file))} | ${score} |`);
    }
    const out = join('results', 'scoreboard.md');
    await mkdir('results', { recursive: true });
    await import('node:fs/promises').then((fs) => fs.writeFile(out, `${rows.join('\n')}\n`, 'utf8'));
    // eslint-disable-next-line no-console
    console.log(`Wrote ${out}`);
    process.exit(0);
  });

program.parseAsync(process.argv);
