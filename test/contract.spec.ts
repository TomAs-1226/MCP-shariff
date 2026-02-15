import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { JsonRpcClient } from '../src/mcp/jsonrpc.js';
import { StdioTransport } from '../src/mcp/transport_stdio.js';
import { runCallToolTest } from '../src/tests/contract/call_tool.js';
import { runErrorShapesTest } from '../src/tests/contract/error_shapes.js';
import { runListToolsTest } from '../src/tests/contract/list_tools.js';

describe('contract suite', () => {
  const transport = new StdioTransport();
  let client: JsonRpcClient;

  beforeEach(async () => {
    await transport.start({ stdioCommand: 'node fixtures/servers/hello-mcp-server/server.cjs' });
    client = new JsonRpcClient(transport, 2000);
    await client.request('initialize', { clientInfo: { name: 'contract', version: '0.1.0' } });
  });

  afterEach(async () => {
    await transport.stop();
  });

  it('passes list tools', async () => {
    const { result } = await runListToolsTest(client);
    expect(result.passed).toBe(true);
  });

  it('passes tool call', async () => {
    const result = await runCallToolTest(client);
    expect(result.passed).toBe(true);
  });

  it('checks error shapes', async () => {
    const result = await runErrorShapesTest(client);
    expect(result.passed).toBe(true);
  });
});
