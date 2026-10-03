import React from 'react';
import { Calendar } from 'lucide-react';
import { BRAND_INFO } from '../data/restaurantData';

interface HeroProps {
  onOpenReservation: () => void;
  onExploreMenu: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onOpenReservation, onExploreMenu }) => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[#171513]">
      {/* Cinematic Full-screen Background Image with Scrim */}
      <div className="absolute inset-0 z-0">
        <img
          src="/images/hero_elane_dining_1790754730497.jpg"
          alt="ÉLANÉ luxury dining room atmosphere"
          className="w-full h-full object-cover object-center scale-105 animate-pulse-slow"
          referrerPolicy="no-referrer"
        />
        {/* Measured Scrim for contrast and rich dark ambiance */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#171513]/85 via-[#171513]/65 to-[#171513] backdrop-brightness-75" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-transparent via-[#171513]/40 to-[#171513]/90" />
      </div>

      {/* Hero Content Container */}
      <div className="relative z-10 max-w-[1200px] w-full mx-auto px-6 md:px-8 py-24 sm:py-32 text-center flex flex-col items-center">
        {/* Main Heading: 64px desktop / 40px mobile */}
        <h1 className="font-serif text-[40px] sm:text-[52px] lg:text-[64px] leading-[1.1] font-normal text-[#F5F0E8] max-w-4xl tracking-tight text-balance mb-4">
          Where Every Dish <br className="hidden sm:inline" />
          Becomes an Experience.
        </h1>

        {/* Supporting text: Paragraph (16px, 16px distance from heading) */}
        <p className="text-[15px] sm:text-[16px] text-[#F5F0E8]/85 max-w-xl font-light leading-relaxed mb-6">
          {BRAND_INFO.heroSubtext}
        </p>

        {/* Buttons (24px distance from paragraph) */}
        <div className="flex flex-col sm:flex-row items-center gap-4 mb-8">
          <button
            onClick={onOpenReservation}
            className="btn-gold-primary w-full sm:w-auto shadow-xl shadow-black/40 group"
          >
            <Calendar className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" />
            Reserve a Table
          </button>
          <button
            onClick={onExploreMenu}
            className="btn-gold-secondary w-full sm:w-auto cursor-pointer"
          >
            Explore Menu
          </button>
        </div>

        {/* Small detail underneath: LAGOS • NIGERIA */}
        <div className="flex items-center justify-center gap-3 text-xs tracking-[0.3em] uppercase text-[#8B8175] font-medium pt-2">
          <span>{BRAND_INFO.location}</span>
        </div>
      </div>
    </section>
  );
};
