import React from 'react';
import { DINING_PILLARS } from '../data/restaurantData';
import { Sparkles, Compass, HeartHandshake } from 'lucide-react';

export const Experience: React.FC = () => {
  const getIcon = (num: string) => {
    switch (num) {
      case '01':
        return <Sparkles className="w-5 h-5 text-[#C9A96E]" />;
      case '02':
        return <Compass className="w-5 h-5 text-[#C9A96E]" />;
      case '03':
        return <HeartHandshake className="w-5 h-5 text-[#C9A96E]" />;
      default:
        return null;
    }
  };

  return (
    <section id="experience" className="py-24 lg:py-36 bg-[#171513] border-t border-[#211E1B] relative">
      <div className="max-w-[1200px] mx-auto px-6 md:px-8">
        {/* Section Header */}
        <div className="max-w-2xl mb-20">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.25em] text-[#C9A96E] mb-3">
            <span>06</span>
            <span className="w-8 h-[1px] bg-[#C9A96E]/40" />
            <span>The ÉLANÉ Philosophy</span>
          </div>

          <h2 className="font-serif text-[32px] sm:text-[40px] lg:text-[48px] leading-[1.15] text-[#F5F0E8] mb-4">
            The Dining Experience
          </h2>

          <p className="text-sm md:text-base text-[#8B8175] font-light leading-relaxed">
            Every element—from the resonant warmth of acoustic architecture to the quiet precision of table service—is calibrated to create timeless memories.
          </p>
        </div>

        {/* 3 Experience Pillars (12-column grid or 3-column split) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
          {DINING_PILLARS.map((pillar) => (
            <div
              key={pillar.number}
              className="bg-[#211E1B] rounded-[8px] p-8 flex flex-col justify-between border border-[#2a2622] hover:border-[#C9A96E]/40 transition-all duration-300"
            >
              <div>
                <div className="flex items-center justify-between mb-8">
                  <span className="font-serif text-3xl lg:text-4xl text-[#C9A96E]/70 font-light">
                    {pillar.number}
                  </span>
                  {getIcon(pillar.number)}
                </div>

                <h3 className="font-serif text-2xl text-[#F5F0E8] mb-2">
                  {pillar.title}
                </h3>

                <p className="text-xs uppercase tracking-wider text-[#C9A96E] mb-4 font-medium">
                  {pillar.subtitle}
                </p>

                <p className="text-sm text-[#8B8175] font-light leading-relaxed mb-6">
                  {pillar.description}
                </p>
              </div>

              <div className="pt-6 border-t border-[#171513] text-xs text-[#F5F0E8]/70 italic font-serif">
                {pillar.highlight}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
