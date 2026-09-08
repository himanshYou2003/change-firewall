import type { Metadata, Viewport } from 'next';
import './globals.css';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { ThemeProvider } from '@/components/ThemeProvider';

export const viewport: Viewport = {
  themeColor: '#f5f2e8',
};

export const metadata: Metadata = {
  title: 'Change Firewall ⚡ — AST Behavioral Diffing, Blast Radius & MCP for AI Code',
  description:
    'Converts raw code diffs into behavior-aware change reports, downstream caller blast radius mapping, and deterministic risk scoring (0-100). Native MCP integration for Claude, Antigravity, Cursor, and Windsurf.',
  keywords: [
    'Change Firewall',
    'AI Code Review',
    'Model Context Protocol',
    'MCP Server',
    'Claude Desktop MCP',
    'Cursor MCP',
    'Blast Radius Mapping',
    'AST Diffing',
    'Antigravity IDE',
  ],
  authors: [{ name: 'Himanshu' }],
  openGraph: {
    title: 'Change Firewall ⚡ Your AI wrote the code. We tell you what it broke.',
    description:
      'Deterministic AST behavioral diffing, caller blast radius mapping, and native Model Context Protocol (MCP) server for modern AI engineering.',
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
                  var stored = localStorage.getItem('cf-theme');
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
            <main className="flex-1">{children}</main>
            <Footer />
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}

