import http from 'node:http';
import open from 'open';
import type { AnalysisReport } from '../types/index.js';
import { getDashboardHtml } from './ui.js';

export interface DashboardServer {
  url: string;
  close: () => Promise<void>;
  update: (newReport: AnalysisReport) => void;
}

export async function startDashboardServer(
  initialReport: AnalysisReport,
  preferredPort = 4783,
  autoOpen = false
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

    server.on('error', (err: any) => {
      if (err.code === 'EADDRINUSE') {
        // Try fallback port
        server.listen(preferredPort + 1, '127.0.0.1');
      } else {
        reject(err);
      }
    });

    server.listen(preferredPort, '127.0.0.1', async () => {
      const address = server.address();
      const actualPort = typeof address === 'object' && address ? address.port : preferredPort;
      const url = `http://localhost:${actualPort}`;

      if (autoOpen) {
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
