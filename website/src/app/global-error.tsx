'use client';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html>
      <body className="bg-[#07090e] text-white flex flex-col items-center justify-center min-h-screen">
        <h2>Global Error Occurred</h2>
        <button
          onClick={() => reset()}
          className="mt-4 px-4 py-2 bg-cyan-400 text-black rounded text-xs font-semibold"
        >
          Try again
        </button>
      </body>
    </html>
  );
}
