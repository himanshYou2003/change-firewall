import type { Metadata, Viewport } from 'next';
import './globals.css';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { ThemeProvider } from '@/components/ThemeProvider';

export const viewport: Viewport = {
  themeColor: '#f5f2e8',
};

export const metadata: Metadata = {
  title: 'Change Firewall ⚡ — The Deterministic Trust Layer for AI Coding Agents',
  description:
    'The neutral, non-LLM referee between "Agent says it\'s done" and "Safe to merge." Deterministic compiler-grounded verification of AI agent actions, blast radius mapping, invariant memory, and symbolic runtime crash proofs.',
  keywords: [
    'Change Firewall',
    'AI Coding Agent Trust Layer',
    'AI Code Referee',
    'Deterministic Verification',
    'Model Context Protocol',
    'MCP Server',
    'Claude Code MCP',
    'Cursor Agent MCP',
    'Devin',
    'Antigravity IDE',
    'Blast Radius Mapping',
    'Symbolic Crash Proofs',
    'AST Diffing',
  ],
  authors: [{ name: 'Himanshu' }],
  openGraph: {
    title: 'Change Firewall ⚡ Stop Letting AI Coding Agents Grade Their Own Homework.',
    description:
      'The neutral, compiler-grounded referee sitting between "Agent says it\'s done" and "Safe to merge." Deterministic AST verification, blast radius mapping, and invariant memory.',
    url: 'https://change-firewall.vercel.app',
    siteName: 'Change Firewall',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="light" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  if (localStorage.getItem('cf-theme') && !localStorage.getItem('cf-theme-mode')) {
                    localStorage.removeItem('cf-theme');
                  }
                  var stored = localStorage.getItem('cf-theme-mode');
                  if (stored === 'dark') {
                    document.documentElement.classList.add('dark');
                    document.documentElement.classList.remove('light');
                  } else {
                    document.documentElement.classList.remove('dark');
                    document.documentElement.classList.add('light');
                  }
                } catch (e) {
                  document.documentElement.classList.remove('dark');
                  document.documentElement.classList.add('light');
                }
              })();
            `,
          }}
        />
      </head>
      <body className="bg-background text-[var(--text-primary)] min-h-screen flex flex-col selection:bg-[#d1c8b7] selection:text-[#181512] transition-colors duration-200">
        <ThemeProvider>
          <div className="fixed inset-0 bg-grid-pattern pointer-events-none opacity-60 z-0" />
          <div className="fixed inset-0 bg-radial-gradient pointer-events-none z-0" />
          <div className="relative z-10 flex flex-col min-h-screen">
            <Navbar />
            <main className="flex-1 min-h-0 flex flex-col">{children}</main>
            <Footer />
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}

