'use client';

import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { useTheme } from '@/components/ThemeProvider';

const PixelTrail = dynamic(() => import('@/components/originkit/ui/pixel-trail'), {
  ssr: false,
});

export default function PixelTrailCursor() {
  const [mounted, setMounted] = useState(false);
  const { theme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const isDark = theme === 'dark';

  return (
    <div className="fixed inset-0 pointer-events-none z-20 overflow-hidden">
      <PixelTrail
        global={true}
        columns={45}
        pixel={{
          color: isDark ? 'rgba(56, 189, 248, 0.45)' : 'rgba(255, 92, 38, 0.45)',
          gap: 3,
          radius: 3,
          blendMode: isDark ? 'screen' : 'normal',
        }}
        trail={{
          hold: 0.18,
          fade: 0.45,
          reach: 1,
        }}
        background="transparent"
        style={{
          position: 'absolute',
          inset: 0,
          width: '100vw',
          height: '100vh',
          pointerEvents: 'none',
        }}
      />
    </div>
  );
}
