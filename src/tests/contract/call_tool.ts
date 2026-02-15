import { JsonRpcClient } from '../../mcp/jsonrpc.js';
import { TestResult } from '../../mcp/types.js';

export async function runCallToolTest(client: JsonRpcClient): Promise<TestResult> {
  const response = await client.request<{ content: string }>('tools/call', {
    name: 'hello',
    arguments: { name: 'doctor' }
  });
  const passed = typeof response.content === 'string' && response.content.includes('doctor');
  return {
    name: 'call_tool',
    passed,
    details: passed ? response.content : 'Unexpected response format'
  };
}
