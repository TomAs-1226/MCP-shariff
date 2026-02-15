# Quickstart

```bash
npm install
npm run build
npx mcp-guard audit --stdio "node fixtures/servers/hello-mcp-server/server.cjs" --out reports --sarif reports/report.sarif
```

Reports are written to `reports/`.
