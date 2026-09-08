#!/usr/bin/env node
// Usage: node bootstrap.mjs <server> "<Title>" <prod-sha> <prod-date> <prod-path>
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.dirname(fileURLToPath(import.meta.url));
const [server, title, sha, date, prodPath] = process.argv.slice(2);
const short = server.endsWith('-mcp') ? server.slice(0, -4) : server;
const SKIP = new Set(['.git', 'node_modules', 'dist']);
const repl = [
  ['@scalably-io/example-mcp', `@scalably-io/${server}`],
  ['scalably-example-mcp', `scalably-${server}`],
  ['example-mcp', server],
  ['Example MCP', title],
  ["new FastMCP({ name: 'example'", `new FastMCP({ name: '${short}'`],
  ['mcp add example ', `mcp add ${short} `],
  ['EXAMPLE_LOG_LEVEL', `${short.toUpperCase().replace(/-/g, '_')}_LOG_LEVEL`],
  ['(production commit sha, date, path) filled by bootstrap.mjs', `\`${prodPath}\` at \`${sha}\` (${date}) in the private ScalablyAI repository`],
];
function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (SKIP.has(entry.name)) continue;
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) { walk(p); continue; }
    if (entry.name === 'bootstrap.mjs') continue;
    let text; try { text = fs.readFileSync(p, 'utf8'); } catch { continue; }
    let next = text; for (const [a, b] of repl) next = next.split(a).join(b);
    if (next !== text) fs.writeFileSync(p, next);
  }
}
walk(root);
console.log(`renamed to ${server} / @scalably-io/${server} / protocol name ${short}`);
