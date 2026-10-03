import React from 'react';
import { Sparkles } from 'lucide-react';
import { BRAND_INFO } from '../data/restaurantData';

export const Introduction: React.FC = () => {
  return (
    <section id="introduction" className="py-24 lg:py-32 bg-[#171513] text-[#F5F0E8] relative overflow-hidden">
      <div className="max-w-[1200px] mx-auto px-6 md:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* Left Column: Editorial narrative */}
          <div className="lg:col-span-6 flex flex-col justify-center">
            {/* Subtle category / kicker */}
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.25em] text-[#C9A96E] mb-4">
              <span>02</span>
              <span className="w-8 h-[1px] bg-[#C9A96E]/40" />
              <span>Introduction</span>
            </div>

            <h2 className="font-serif text-[32px] sm:text-[40px] lg:text-[48px] leading-[1.15] text-[#F5F0E8] mb-6">
              A New Expression of Dining
            </h2>

            <div className="space-y-4 text-[15px] sm:text-[16px] text-[#F5F0E8]/80 leading-relaxed font-light">
              <p>
                At <span className="text-[#F5F0E8] font-medium">ÉLANÉ</span>, dining transcends sustenance to become an evocative sensory journey. Born from the French concept of <em>élan</em>—signifying distinctive flair, vivacity, and unstudied grace—our tables invite you into a world of quiet luxury.
              </p>
              <p>
                We marry the untamed richness of the West African coastline with classical culinary discipline and contemporary artistry. Each seasonal menu honors artisanal fishermen, heritage farmers, and generational foragers, presented with uncompromising precision.
              </p>
            </div>

            {/* Quiet Details / Metric adjacency */}
            <div className="mt-8 pt-8 border-t border-[#211E1B] grid grid-cols-3 gap-6">
              <div>
                <span className="block font-serif text-2xl lg:text-3xl text-[#C9A96E]">32</span>
                <span className="text-xs uppercase tracking-wider text-[#8B8175] mt-1 block">
                  Intimate Seats
                </span>
              </div>
              <div>
                <span className="block font-serif text-2xl lg:text-3xl text-[#C9A96E]">7-Course</span>
                <span className="text-xs uppercase tracking-wider text-[#8B8175] mt-1 block">
                  Tasting Journey
                </span>
              </div>
              <div>
                <span className="block font-serif text-2xl lg:text-3xl text-[#C9A96E]">380+</span>
                <span className="text-xs uppercase tracking-wider text-[#8B8175] mt-1 block">
                  Curated Cellar
                </span>
              </div>
            </div>
          </div>

          {/* Right Column: Large editorial photography */}
          <div className="lg:col-span-6 relative">
            <div className="relative rounded-[8px] overflow-hidden bg-[#211E1B] aspect-[4/3] sm:aspect-[5/4] shadow-2xl">
              <img
                src="/images/interior_terrace_lagos_1790754779581.jpg"
                alt="ÉLANÉ Lagos restaurant architecture and ambiance"
                className="w-full h-full object-cover object-center transform hover:scale-105 transition-transform duration-700"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#171513]/70 via-transparent to-transparent pointer-events-none" />
              
              {/* Subtle caption */}
              <div className="absolute bottom-6 left-6 right-6 flex items-center justify-between text-xs text-[#F5F0E8]/90">
                <span className="font-serif italic">Waterfront Terrace at Dusk</span>
                <span className="text-[#C9A96E] uppercase tracking-wider text-[11px]">Victoria Island</span>
              </div>
            </div>

            {/* Architectural accent border frame */}
            <div className="hidden sm:block absolute -bottom-4 -left-4 w-32 h-32 border-l border-b border-[#C9A96E]/30 rounded-bl-[12px] -z-10" />
          </div>
        </div>
      </div>
    </section>
  );
};
