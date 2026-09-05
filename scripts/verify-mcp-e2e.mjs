import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');
const binPath = path.join(projectRoot, 'bin', 'change-firewall.js');

console.log('='.repeat(70));
console.log('  CHANGE FIREWALL — 100% END-TO-END MCP PROTOCOL PROOF');
console.log('  Simulating Claude Desktop / Antigravity / Cursor Stdio Client');
console.log('='.repeat(70));

async function runProof() {
  const startTime = Date.now();

  console.log(`\n[1/7] Spawning MCP Subprocess via Stdio:`);
  console.log(`      Command: node ${binPath} mcp`);

  const transport = new StdioClientTransport({
    command: 'node',
    args: [binPath, 'mcp'],
    cwd: projectRoot,
  });

  const client = new Client(
    { name: 'claude-desktop-simulator', version: '1.0.0' },
    { capabilities: {} }
  );

  console.log(`[2/7] Connecting client and initiating JSON-RPC handshake...`);
  await client.connect(transport);
  console.log(`      ✓ Handshake SUCCESSFUL! Connected over stdio transport.`);

  // Server info verification
  const serverVersion = client.getServerVersion();
  console.log(`      ✓ Server identified as: "${serverVersion?.name}" version "${serverVersion?.version}"`);
  if (serverVersion?.name !== 'change-firewall' || serverVersion?.version !== '0.1.4') {
    throw new Error(`Unexpected server version: ${JSON.stringify(serverVersion)}`);
  }

  // Tools discovery
  console.log(`\n[3/7] Requesting tools list via MCP protocol (tools/list)...`);
  const toolsResult = await client.listTools();
  const toolNames = toolsResult.tools.map((t) => t.name);
  console.log(`      ✓ Found ${toolsResult.tools.length} exposed tools:`);
  for (const tool of toolsResult.tools) {
    console.log(`        • ${tool.name} — ${tool.description}`);
  }

  const expectedTools = [
    'analyze_changes',
    'evaluate_preflight',
    'compute_blast_radius',
    'explain_file_impact',
  ];
  for (const expected of expectedTools) {
    if (!toolNames.includes(expected)) {
      throw new Error(`Missing expected MCP tool: ${expected}`);
    }
  }

  // Prompts discovery
  console.log(`\n[4/7] Requesting prompts list via MCP protocol (prompts/list)...`);
  const promptsResult = await client.listPrompts();
  console.log(`      ✓ Found ${promptsResult.prompts.length} prompt(s):`);
  for (const prompt of promptsResult.prompts) {
    console.log(`        • ${prompt.name} — ${prompt.description}`);
  }
  if (!promptsResult.prompts.some((p) => p.name === 'change_firewall_audit')) {
    throw new Error('Missing expected prompt: change_firewall_audit');
  }

  // Test Tool Call: compute_blast_radius
  console.log(`\n[5/7] Calling tool over stdio: "compute_blast_radius" on "src/index.ts"...`);
  const blastRes = await client.callTool({
    name: 'compute_blast_radius',
    arguments: { file: 'src/index.ts' },
  });
  if (blastRes.isError) throw new Error(`compute_blast_radius returned error: ${JSON.stringify(blastRes)}`);
  const blastData = JSON.parse(blastRes.content[0].text);
  console.log(`      ✓ Blast Radius Response received:`);
  console.log(`        - Target File:     ${blastData.file}`);
  console.log(`        - Severity Level:  ${blastData.severity}`);
  console.log(`        - Total Consumers: ${blastData.totalConsumers}`);
  console.log(`        - Dependents:      ${blastData.directDependents.join(', ')}`);

  // Test Tool Call: evaluate_preflight
  console.log(`\n[6/7] Calling tool over stdio: "evaluate_preflight" (threshold: 70)...`);
  const preflightRes = await client.callTool({
    name: 'evaluate_preflight',
    arguments: { maxRisk: 70 },
  });
  if (preflightRes.isError) throw new Error(`evaluate_preflight returned error: ${JSON.stringify(preflightRes)}`);
  const preflightData = JSON.parse(preflightRes.content[0].text);
  console.log(`      ✓ Preflight Response received:`);
  console.log(`        - Ready to Merge:   ${preflightData.readyToMerge ? '✅ YES' : '❌ NO'}`);
  console.log(`        - Risk Score:       ${preflightData.score} / 100`);
  console.log(`        - Max Threshold:    ${preflightData.maxRiskThreshold}`);
  console.log(`        - High Risk Count:  ${preflightData.highRiskCount}`);

  // Test Tool Call: analyze_changes
  console.log(`\n[7/7] Calling tool over stdio: "analyze_changes"...`);
  const analyzeRes = await client.callTool({
    name: 'analyze_changes',
    arguments: {},
  });
  if (analyzeRes.isError) throw new Error(`analyze_changes returned error: ${JSON.stringify(analyzeRes)}`);
  const analyzeData = JSON.parse(analyzeRes.content[0].text);
  console.log(`      ✓ Analysis Response received:`);
  console.log(`        - Files Changed:      ${analyzeData.summary.totalFilesChanged}`);
  console.log(`        - Lines Added:        +${analyzeData.summary.linesAdded}`);
  console.log(`        - Lines Deleted:      -${analyzeData.summary.linesDeleted}`);
  console.log(`        - Behavioral Shifts:  ${analyzeData.summary.behavioralChangesCount}`);
  console.log(`        - Risk Score:         ${analyzeData.risk.score}/100 [${analyzeData.risk.level}]`);

  // Clean close
  await client.close();
  const duration = Date.now() - startTime;

  console.log('\n' + '='.repeat(70));
  console.log(`  🎉 100% PROOF VERIFIED: Change Firewall MCP Server is fully operational!`);
  console.log(`  Total Protocol Execution Time: ${duration}ms`);
  console.log('='.repeat(70) + '\n');
}

runProof().catch((err) => {
  console.error('\n❌ PROOF FAILED:', err);
  process.exit(1);
});
