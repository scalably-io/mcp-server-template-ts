import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const textOf = (response) => response.result?.content?.find((item) => item.type === 'text')?.text || '';

export function client(env = {}) {
  const child = spawn(process.execPath, ['dist/index.js'], { cwd: root, env: { ...process.env, ...env }, stdio: ['pipe', 'pipe', 'pipe'] });
  let id = 1; let buffer = ''; let stderr = ''; const pending = new Map();
  child.stderr.setEncoding('utf8'); child.stderr.on('data', (c) => { stderr += c; });
  child.stdout.setEncoding('utf8');
  child.stdout.on('data', (chunk) => {
    buffer += chunk;
    while (buffer.includes('\n')) {
      const i = buffer.indexOf('\n'); const line = buffer.slice(0, i).trim(); buffer = buffer.slice(i + 1);
      if (!line) continue;
      const message = JSON.parse(line); const waiter = pending.get(message.id);
      if (waiter) { clearTimeout(waiter.timer); pending.delete(message.id); waiter.resolve(message); }
    }
  });
  const request = (method, params) => {
    const requestId = id++;
    const promise = new Promise((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error(`timeout ${method}: ${stderr}`)), 15_000);
      pending.set(requestId, { resolve, reject, timer });
    });
    child.stdin.write(`${JSON.stringify({ jsonrpc: '2.0', id: requestId, method, params })}\n`);
    return promise;
  };
  return {
    async init() {
      await request('initialize', { protocolVersion: '2025-06-18', capabilities: {}, clientInfo: { name: 'test', version: '1' } });
      child.stdin.write(`${JSON.stringify({ jsonrpc: '2.0', method: 'notifications/initialized' })}\n`);
    },
    list: () => request('tools/list', {}),
    call: (name, args = {}) => request('tools/call', { name, arguments: args }),
    async close() { const done = new Promise((r) => child.once('exit', r)); child.kill('SIGTERM'); await done; },
  };
}

test('example_echo lists its tool and replies with plain JSON', async () => {
  const c = client(); await c.init();
  try {
    const names = (await c.list()).result.tools.map((t) => t.name);
    assert.deepEqual(names, ['example_echo']);
    const ok = JSON.parse(textOf(await c.call('example_echo', { text: 'hi' })));
    assert.equal(ok.status, 'succeeded'); assert.equal(ok.result.text, 'hi'); assert.equal('schema' in ok, false);
    const bad = await c.call('example_echo', { text: '' });
    assert.equal(bad.result.isError, true); assert.match(textOf(bad), /^invalid_argument: text must not be empty/);
  } finally { await c.close(); }
});
