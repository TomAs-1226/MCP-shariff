import { JsonRpcClient } from '../../mcp/jsonrpc.js';
import { ToolDescriptor, TestResult } from '../../mcp/types.js';

export async function runListToolsTest(client: JsonRpcClient): Promise<{ result: TestResult; tools: ToolDescriptor[] }> {
  const listed = (await client.request<{ tools: ToolDescriptor[] }>('tools/list')).tools;
  const passed = Array.isArray(listed) && listed.length > 0;
  return {
    result: {
      name: 'list_tools',
      passed,
      details: passed ? `Listed ${listed.length} tools` : 'No tools returned'
    },
    tools: listed
  };
}
