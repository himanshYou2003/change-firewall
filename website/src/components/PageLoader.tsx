'use client';

import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { useTheme } from '@/components/ThemeProvider';

const ParticleWobble = dynamic(() => import('@/components/originkit/ui/particle-wobble'), {
  ssr: false,
});

export default function PageLoader() {
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(true);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    setMounted(true);

    // Fade out smoothly after brief initial animation
    const timer = setTimeout(() => {
      setFading(true);
      setTimeout(() => {
        setVisible(false);
      }, 700);
    }, 900);

    return () => clearTimeout(timer);
  }, []);

  if (!visible) return null;

  const isDark = theme === 'dark';
  const particleColor = isDark ? '#38bdf8' : '#ff5c26';

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center transition-all duration-700 ease-out ${
        isDark ? 'bg-[#07090e]' : 'bg-[#f5f2e8]'
      } ${fading ? 'opacity-0 scale-105 pointer-events-none' : 'opacity-100 scale-100'}`}
    >
      {/* Pure Particle Wobble Effect */}
      <div className="relative w-64 h-64 sm:w-80 sm:h-80 flex items-center justify-center pointer-events-auto">
        {mounted && (
          <ParticleWobble
            dotColor={particleColor}
            density={300}
            dotSize={110}
            speed={60}
            spinTurns={1}
            ball={{
              spread: 115,
              turn: 0,
              tilt: 15,
            }}
            pointer={{
              drag: 90,
              damping: 20,
            }}
            style={{
              width: '100%',
              height: '100%',
            }}
          />
        )}
      </div>
    </div>
  );
}
