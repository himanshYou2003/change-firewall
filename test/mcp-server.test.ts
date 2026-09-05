import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { InMemoryTransport } from '@modelcontextprotocol/sdk/inMemory.js';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { createMcpServer } from '../src/mcp/index.js';

describe('Model Context Protocol (MCP) Server Integration', () => {
  let client: Client;
  let clientTransport: InMemoryTransport;
  let serverTransport: InMemoryTransport;

  beforeAll(async () => {
    [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
    const server = createMcpServer();
    await server.connect(serverTransport);

    client = new Client(
      { name: 'vitest-mcp-client', version: '1.0.0' },
      { capabilities: {} }
    );
    await client.connect(clientTransport);
  });

  afterAll(async () => {
    await client.close();
  });

  it('registers all required Change Firewall MCP tools', async () => {
    const { tools } = await client.listTools();
    const toolNames = tools.map((t) => t.name);

    expect(toolNames).toContain('analyze_changes');
    expect(toolNames).toContain('evaluate_preflight');
    expect(toolNames).toContain('compute_blast_radius');
    expect(toolNames).toContain('explain_file_impact');
  });

  it('registers the change_firewall_audit prompt template', async () => {
    const { prompts } = await client.listPrompts();
    const promptNames = prompts.map((p) => p.name);

    expect(promptNames).toContain('change_firewall_audit');

    const prompt = await client.getPrompt({
      name: 'change_firewall_audit',
      arguments: { focus: 'api-routes' },
    });

    expect(prompt.messages.length).toBeGreaterThan(0);
    const content = prompt.messages[0].content;
    expect(content.type).toBe('text');
    if (content.type === 'text') {
      expect(content.text).toContain('api-routes');
    }
  });

  it('executes compute_blast_radius tool over MCP', async () => {
    const result: any = await client.callTool({
      name: 'compute_blast_radius',
      arguments: { file: 'package.json' },
    });

    expect(result.content).toBeDefined();
    expect(result.content[0].type).toBe('text');

    const parsed = JSON.parse(result.content[0].text);
    expect(parsed.file).toBe('package.json');
    expect(parsed.severity).toBeDefined();
    expect(Array.isArray(parsed.directDependents)).toBe(true);
  });

  it('executes explain_file_impact tool over MCP', async () => {
    const result: any = await client.callTool({
      name: 'explain_file_impact',
      arguments: { file: 'package.json' },
    });

    expect(result.content).toBeDefined();
    expect(result.content[0].type).toBe('text');

    const parsed = JSON.parse(result.content[0].text);
    expect(parsed.file).toBe('package.json');
    expect(parsed.architecturalRole).toBeDefined();
    expect(parsed.gitHistory).toBeDefined();
  });

  it('executes evaluate_preflight tool over MCP', async () => {
    const result: any = await client.callTool({
      name: 'evaluate_preflight',
      arguments: { maxRisk: 80 },
    });

    expect(result.content).toBeDefined();
    expect(result.content[0].type).toBe('text');

    const parsed = JSON.parse(result.content[0].text);
    expect(typeof parsed.readyToMerge).toBe('boolean');
    expect(typeof parsed.score).toBe('number');
    expect(Array.isArray(parsed.blockers)).toBe(true);
  });

  it('executes analyze_changes tool over MCP', async () => {
    const result: any = await client.callTool({
      name: 'analyze_changes',
      arguments: {},
    });

    expect(result.content).toBeDefined();
    expect(result.content[0].type).toBe('text');

    const parsed = JSON.parse(result.content[0].text);
    expect(parsed.summary).toBeDefined();
    expect(parsed.risk).toBeDefined();
    expect(Array.isArray(parsed.findings)).toBe(true);
  });
});
