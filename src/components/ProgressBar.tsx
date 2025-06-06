'use client';

import { useEffect, useState } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { useNProgress } from '@tanem/react-nprogress';

export default function ProgressBar() {
  const [isAnimating, setIsAnimating] = useState(false);
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    setIsAnimating(true);
    const timeout = setTimeout(() => setIsAnimating(false), 500);
    return () => clearTimeout(timeout);
  }, [pathname, searchParams]);

  const { animationDuration, isFinished, progress } = useNProgress({
    isAnimating,
  });

  return (
    <div
      style={{
        opacity: isFinished ? 0 : 1,
        pointerEvents: 'none',
        transition: `opacity ${animationDuration}ms linear`,
      }}
    >
      <div
        style={{          position: 'fixed',
          top: '64px', // Position right below navbar
          left: 0,
          right: 0,
          height: '3px',
          backgroundColor: '#fbbf24', // Bright amber color
          transform: `translateX(${-100 + progress * 100}%)`,
          transition: `transform ${animationDuration}ms linear`,
          zIndex: 1000,
        }}
      />
      <div
        style={{
          display: 'block',
          position: 'absolute',
          right: 0,
          top: '64px', // Position right below navbar          width: '100px',
          height: '3px',
          boxShadow: '0 0 10px #fbbf24, 0 0 5px #fbbf24',
          opacity: 1,
          transform: 'rotate(3deg) translate(0px, -4px)',
          zIndex: 1000,
        }}
      />
    </div>
  );
}
