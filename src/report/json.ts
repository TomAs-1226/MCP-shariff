import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { Report } from '../mcp/types.js';

export async function writeJsonReport(report: Report, outDir: string): Promise<string> {
  await mkdir(outDir, { recursive: true });
  const output = join(outDir, 'report.json');
  await writeFile(output, JSON.stringify(report, null, 2), 'utf8');
  return output;
}
