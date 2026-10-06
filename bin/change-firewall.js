#!/usr/bin/env node

const argumentsList = process.argv.slice(2);
const machineReadable = argumentsList.includes('--json') || argumentsList[0] === 'mcp';
if (process.env.CHANGE_FIREWALL_PLAYGROUND_PROGRESS === '1' && !machineReadable) {
  console.log('Starting Change Firewall compiler...');
}

await import('../dist/cli.js');
