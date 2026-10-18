/**
 * Intro Animation: 1-second converging dots into OMNI-SWARM logo
 * Runs on first load only; respects prefers-reduced-motion
 */

import React, { useEffect, useState } from 'react';

interface IntroAnimationProps {
  onComplete: () => void;
}

export default function IntroAnimation({ onComplete }: IntroAnimationProps) {
  const [visible, setVisible] = useState(() => {
    if (typeof window === 'undefined') return false;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return false;
    return !sessionStorage.getItem('omni_swarm_intro_viewed');
  });

  const [fade, setFade] = useState(false);

  useEffect(() => {
    if (!visible) {
      onComplete();
      return;
    }

    sessionStorage.setItem('omni_swarm_intro_viewed', 'true');

    // After 1000ms, fade out
    const fadeTimer = setTimeout(() => {
      setFade(true);
      // Remove completely after fade transition
      const removeTimer = setTimeout(() => {
        setVisible(false);
        onComplete();
      }, 300);
      return () => clearTimeout(removeTimer);
    }, 1000);

    return () => clearTimeout(fadeTimer);
  }, []);

  if (!visible) return null;

  // Positions for 12 converging dots in circular radius
  const dots = Array.from({ length: 12 }, (_, i) => {
    const angle = (i * 30 * Math.PI) / 180;
    const r = 85;
    const x = Math.round(r * Math.cos(angle));
    const y = Math.round(r * Math.sin(angle));
    return { x, y, delay: i * 25 };
  });

  return (
    <div
      onClick={() => {
        setVisible(false);
        onComplete();
      }}
      className={`fixed inset-0 z-50 flex items-center justify-center bg-white transition-opacity duration-300 cursor-pointer ${
        fade ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      <div className="relative flex flex-col items-center">
        {/* Converging Dots */}
        <div className="relative w-36 h-36 flex items-center justify-center">
          {dots.map((d, idx) => (
            <div
              key={idx}
              className="absolute w-2.5 h-2.5 rounded-full transition-all duration-700 ease-out"
              style={{
                backgroundColor: idx % 2 === 0 ? '#0B2A5B' : '#0F766E',
                transform: !fade ? `translate(${d.x}px, ${d.y}px)` : 'translate(0px, 0px) scale(0)',
                opacity: !fade ? 0.9 : 0,
                transitionDelay: `${d.delay}ms`
              }}
            />
          ))}

          {/* Central Logo */}
          <div className="w-16 h-16 rounded-2xl bg-[#0B2A5B] flex items-center justify-center shadow-lg transform transition-transform duration-500 scale-100">
            <svg
              className="w-9 h-9 text-white"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <path d="m4.93 4.93 4.24 4.24" />
              <path d="m14.83 9.17 4.24-4.24" />
              <path d="m14.83 14.83 4.24 4.24" />
              <path d="m9.17 14.83-4.24 4.24" />
              <circle cx="12" cy="12" r="4" fill="#0F766E" />
            </svg>
          </div>
        </div>

        {/* Brand Name */}
        <div className="mt-4 text-center">
          <h1 className="text-xl font-bold tracking-tight text-[#0B2A5B]">OMNI-SWARM</h1>
          <p className="text-xs font-medium text-[#0F766E] uppercase tracking-widest mt-0.5">
            Sovereign Multi-Agent Platform
          </p>
        </div>
      </div>
    </div>
  );
}
