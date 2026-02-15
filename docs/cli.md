# CLI Reference

## Commands

- `mcp-guard validate --stdio <cmd>|--http <url> [--profile default|strict|paranoid] [--out reports]`
- `mcp-guard test --stdio <cmd>|--http <url> [--out reports]`
- `mcp-guard audit --stdio <cmd>|--http <url> [--sarif reports/report.sarif] [--fail-on off|low|medium|high]`
- `mcp-guard scan [--repo <path>] [--path <file>] [--format md|json|sarif] [--out reports]`
- `mcp-guard registry lint <file>`
- `mcp-guard registry score <file>`
- `mcp-guard registry verify <file> --sample 5`

## Exit codes

- `0`: no findings or findings below policy threshold
- `1`: findings exist but policy threshold does not fail
- `2`: contract test failure, policy gate failure, or command/schema validation errors
