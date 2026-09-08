#!/usr/bin/env node
import { FastMCP } from 'fastmcp';
import { z } from 'zod';
import { fail, reply } from './reply.js';

const mcp = new FastMCP({ name: 'example', version: '1.0.0' });

mcp.addTool({
  name: 'example_echo',
  description: 'Return the text you pass in. Replace with real tools.',
  annotations: { title: 'Echo text', readOnlyHint: true, openWorldHint: false },
  parameters: z.object({ text: z.string() }),
  execute: async ({ text }) => {
    if (!text) fail('invalid_argument', 'text must not be empty');
    return reply({ status: 'succeeded', operation: 'example_echo', summary: 'Echoed the text.', result: { text }, proof: { complete: true } });
  },
});

mcp.start({ transportType: 'stdio' });
