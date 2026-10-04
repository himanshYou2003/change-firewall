import http from 'node:http';
import fs from 'node:fs';
import open from 'open';
import type { AnalysisReport } from '../types/index.js';
import { getDashboardHtml } from './ui.js';

export interface DashboardServer {
  url: string;
  close: () => Promise<void>;
  update: (newReport: AnalysisReport) => void;
}

export interface DashboardReadyEvent {
  type: 'dashboard-ready';
  port: number;
  autoOpen: boolean;
  mode: DashboardMode;
}

export type DashboardMode = 'snapshot' | 'watch' | 'demo';

export interface DashboardServerOptions {
  /** Optional advisory hook for sandbox/runtime integrations. Disabled by default. */
  onReady?: (event: DashboardReadyEvent) => void;
  mode?: DashboardMode;
}

function getReadyDescriptor(): number | undefined {
  const descriptorText = process.env.CHANGE_FIREWALL_DASHBOARD_READY_FD;
  if (!descriptorText || !/^\d+$/.test(descriptorText)) return undefined;

  const descriptor = Number.parseInt(descriptorText, 10);
  return descriptor >= 3 ? descriptor : undefined;
}

function getEnvironmentMode(): DashboardMode | undefined {
  const mode = process.env.CHANGE_FIREWALL_DASHBOARD_MODE;
  return mode === 'snapshot' || mode === 'watch' || mode === 'demo' ? mode : undefined;
}

function emitEnvironmentReadyEvent(event: DashboardReadyEvent, descriptor: number): void {

  try {
    fs.writeSync(descriptor, `${JSON.stringify(event)}\n`);
  } catch {
    // A disconnected advisory receiver must not affect dashboard startup.
  }
}

export async function startDashboardServer(
  initialReport: AnalysisReport,
  preferredPort = 4783,
  autoOpen = false,
  options: DashboardServerOptions = {}
): Promise<DashboardServer> {
  let currentReport = initialReport;
  const sseClients = new Set<http.ServerResponse>();

  return new Promise((resolve, reject) => {
    const server = http.createServer((req, res) => {
      const url = req.url || '/';

      if (url === '/api/report') {
        res.writeHead(200, {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        });
        res.end(JSON.stringify(currentReport));
        return;
      }

      if (url === '/api/events') {
        res.writeHead(200, {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          Connection: 'keep-alive',
          'Access-Control-Allow-Origin': '*',
        });
        res.write(`data: ${JSON.stringify(currentReport)}\n\n`);
        sseClients.add(res);

        req.on('close', () => {
          sseClients.delete(res);
        });
        return;
      }

      // Default to HTML
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(getDashboardHtml(currentReport));
    });

    let currentPort = preferredPort;
    let fallbackAttempts = 0;

    server.on('error', (err: any) => {
      if (err.code === 'EADDRINUSE' && fallbackAttempts < 10) {
        fallbackAttempts++;
        currentPort++;
        server.listen(currentPort, '127.0.0.1');
      } else {
        reject(err);
      }
    });

    server.listen(preferredPort, '127.0.0.1', async () => {
      const address = server.address();
      const actualPort = typeof address === 'object' && address ? address.port : currentPort;
      const url = `http://localhost:${actualPort}`;

      const readyEvent: DashboardReadyEvent = {
        type: 'dashboard-ready',
        port: actualPort,
        autoOpen,
        mode: options.mode || getEnvironmentMode() || 'snapshot',
      };
      const readyDescriptor = getReadyDescriptor();
      try {
        if (options.onReady) options.onReady(readyEvent);
        else if (readyDescriptor !== undefined) emitEnvironmentReadyEvent(readyEvent, readyDescriptor);
      } catch {
        // Advisory hooks must never prevent the local dashboard from starting.
      }

      // A playground bridge owns browser presentation. Suppress the host OS
      // opener whenever its inherited advisory descriptor is active.
      if (autoOpen && readyDescriptor === undefined) {
        try {
          await open(url);
        } catch {
          // Ignore if open browser fails in headless environments
        }
      }

      function update(newReport: AnalysisReport) {
        currentReport = newReport;
        const payload = `data: ${JSON.stringify(newReport)}\n\n`;
        for (const client of sseClients) {
          try {
            client.write(payload);
          } catch {
            sseClients.delete(client);
          }
        }
      }

      resolve({
        url,
        close: () =>
          new Promise<void>((resClose) => {
            for (const client of sseClients) {
              client.end();
            }
            server.close(() => resClose());
          }),
        update,
      });
    });
  });
}
