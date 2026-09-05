import DocViewer from '@/components/DocViewer';

export const metadata = {
  title: 'Documentation — Change Firewall ⚡ Complete Usage & MCP Guide',
  description:
    'Comprehensive documentation for Change Firewall CLI commands, AST behavioral diffing engine, Model Context Protocol (MCP) server setup, and CI/CD gates.',
};

export default function DocsPage() {
  return (
    <div className="w-full h-[calc(100vh-4rem)] m-0 p-0 overflow-hidden flex flex-col">
      <DocViewer />
    </div>
  );
}
