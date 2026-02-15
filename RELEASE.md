# Release Checklist

1. Update version in `package.json`.
2. Run full checks:
   - `npm run lint`
   - `npm test`
   - `npm run build`
   - `npm pack --dry-run`
3. Validate CLI smoke commands locally.
4. Update changelog/release notes.
5. Commit and tag (`vX.Y.Z`).
6. Publish (`npm publish --access public`).
7. Create GitHub release and attach notable report snippets.
