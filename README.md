# mcp-doctor

Validate, test, and security-audit MCP servers and tool schemas—locally and in CI.

## Quickstart (20 seconds)

```bash
npm install
npm run dev -- audit --stdio "node fixtures/servers/hello-mcp-server/server.cjs" --out reports --sarif reports/report.sarif
```

Then open:

- `reports/report.json`
- `reports/report.md`
- `reports/report.sarif`

## CLI

```bash
mcp-doctor validate --stdio "node server.cjs" --out reports/
mcp-doctor test --stdio "node server.cjs" --out reports/
mcp-doctor audit --stdio "node server.cjs" --out reports/ --sarif reports/report.sarif
mcp-doctor registry lint registry/servers.yaml
mcp-doctor registry score registry/servers.yaml
```

Exit codes:

- `0`: clean
- `1`: warnings only
- `2`: errors / failed contract tests

## Example audit output

```text
Risk score: 100/100
✅ list_tools
✅ call_tool
✅ error_shapes
No findings
```

## How scoring works

The score starts at `100` and subtracts weighted penalties per finding:

- low = -5
- medium = -12
- high = -25

Floor is `0`.

## Add your server to the registry

Edit `registry/servers.yaml` and add an entry with:

- `name`
- `repo`
- `transport`
- `install`
- `run`
- `tags`
- `securityNotes`

Then run:

```bash
npm run dev -- registry lint registry/servers.yaml
npm run dev -- registry score registry/servers.yaml
```

## Security model / threat model

`mcp-doctor` uses a safe-by-default approach:

- Only deterministic contract calls are executed.
- All JSON-RPC requests use timeouts.
- Stuck server processes are terminated.
- Security lints flag high-risk schemas (path/file params, shell/command params, raw argv/flags arrays).
- Avoid chaining high-privilege MCP servers without strict parameter and capability controls.

## Screenshot

See `reports/report.md` after running audit for markdown-friendly output suitable for badges/PR comments.
