# Example MCP

Example MCP server from Scalably. Replace this line.

## Install

Claude Code:

```bash
claude mcp add example -- npx -y @scalably-io/example-mcp
```

Codex:

```bash
codex mcp add example -- npx -y @scalably-io/example-mcp
```

Claude Desktop: download `example-mcp.mcpb` from the latest GitHub release and open it.

## Tools (1)

| Tool | What it does |
|---|---|
| `example_echo` | Return the text you pass in. |

## Configuration

| Variable | Required | Purpose |
|---|---|---|
| `EXAMPLE_LOG_LEVEL` | no | INFO (default) or DEBUG |

## Verify

Each release lists the package version, the `.mcpb` sha256 and the production commit it was derived from in CHANGELOG.md. CI runs the tests and a clean install of the packed tarball on every push.

## Privacy Policy

This server runs locally, on your machine, under your own credentials. It collects no personal data, contains no telemetry, stores nothing persistently, and talks only to the vendor API it wraps. No third party, including Scalably, receives your data. Contact: hello@scalably.io. Canonical copy: https://scalably.io/connector-privacy.html

## License

MIT. Copyright Scalably.
