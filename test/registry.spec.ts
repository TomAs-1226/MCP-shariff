import { describe, expect, it } from 'vitest';
import { lintRegistry, verifyRegistry } from '../src/registry/validator.js';

describe('registry schema validation', () => {
  it('returns line-referenced errors for missing fields', () => {
    const raw = `servers:\n  - name: bad\n    repo: example/repo\n    transport: stdio\n`;
    const issues = lintRegistry(raw);
    expect(issues.some((issue) => issue.message.includes('install'))).toBe(true);
    expect(issues[0].line).toBeGreaterThan(0);
  });

  it('verify warns on missing risk metadata', () => {
    const raw = `servers:\n  - name: ok\n    repo: example/repo\n    transport: stdio\n    install: npm i\n    run: node server.cjs\n    tags: [test]\n    permissions: [read]\n`;
    const issues = verifyRegistry(raw, 5);
    expect(issues.some((issue) => issue.message.includes('riskNotes'))).toBe(true);
  });
});
