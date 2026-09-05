import Link from 'next/link';
import { ShieldAlert } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-[65vh] flex flex-col items-center justify-center text-center px-4">
      <div className="w-12 h-12 rounded-2xl bg-surface-100 border border-white/10 flex items-center justify-center mb-4">
        <ShieldAlert className="w-6 h-6 text-brand-danger" />
      </div>
      <h1 className="text-4xl font-extrabold text-white tracking-tight">404 - Page Not Found</h1>
      <p className="mt-2 text-slate-400 text-sm max-w-md">
        The documentation page or section you are looking for does not exist or has been moved.
      </p>
      <Link
        href="/"
        className="mt-6 px-5 py-2.5 rounded-xl bg-gradient-to-r from-brand-cyan to-brand-blue text-slate-950 font-bold text-xs shadow-md shadow-brand-cyan/20 transition-all hover:opacity-95"
      >
        Return to Home
      </Link>
    </div>
  );
}
