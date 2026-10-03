import React, { useEffect, useState } from 'react';

export const ScrollProgress: React.FC = () => {
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (totalHeight > 0) {
        const progress = Math.min(Math.max(window.scrollY / totalHeight, 0), 1);
        setScrollProgress(progress);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div
      className="fixed top-0 left-0 right-0 z-50 h-[2.5px] bg-[#171513]/30 pointer-events-none"
      aria-hidden="true"
    >
      <div
        className="h-full bg-gradient-to-r from-[#b8985c] via-[#C9A96E] to-[#F5F0E8] transition-transform duration-75 ease-out origin-left shadow-[0_0_8px_rgba(201,169,110,0.5)]"
        style={{
          transform: `scaleX(${scrollProgress})`,
        }}
      />
    </div>
  );
};
