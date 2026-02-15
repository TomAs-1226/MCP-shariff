import { JsonRpcClient } from '../../mcp/jsonrpc.js';
import { TestResult } from '../../mcp/types.js';

export async function runErrorShapesTest(client: JsonRpcClient): Promise<TestResult> {
  try {
    await client.request('tools/call', {
      name: 'hello',
      arguments: {}
    });
    return {
      name: 'error_shapes',
      passed: false,
      details: 'Expected an error but call succeeded'
    };
  } catch (error) {
    const normalized = client.normalizeError(error);
    const passed = Number.isInteger(normalized.code) && typeof normalized.message === 'string';
    return {
      name: 'error_shapes',
      passed,
      details: JSON.stringify(normalized)
    };
  }
}
