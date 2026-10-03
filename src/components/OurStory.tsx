import React from 'react';
import { BRAND_INFO } from '../data/restaurantData';

export const OurStory: React.FC = () => {
  return (
    <section id="story" className="py-24 lg:py-32 bg-[#171513] relative overflow-hidden border-t border-[#211E1B]">
      <div className="max-w-[1200px] mx-auto px-6 md:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* Left Column: Editorial Text */}
          <div className="lg:col-span-6 flex flex-col justify-center">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.25em] text-[#C9A96E] mb-4">
              <span>04</span>
              <span className="w-8 h-[1px] bg-[#C9A96E]/40" />
              <span>Our Heritage & Vision</span>
            </div>

            <h2 className="font-serif text-[32px] sm:text-[40px] lg:text-[48px] leading-[1.15] text-[#F5F0E8] mb-6">
              Rooted in Tradition. <br />
              Designed for Today.
            </h2>

            <div className="space-y-5 text-[15px] sm:text-[16px] text-[#F5F0E8]/85 font-light leading-relaxed">
              <p>
                ÉLANÉ was conceived as an ode to modern African cosmopolitanism—where ancient culinary instincts meet contemporary restraint. Situated along the luminous waters of Victoria Island, our kitchen treats local biodiversity as a fine artist treats precious pigments.
              </p>
              <p>
                From wild-caught Atlantic sea bass line-fished off the Lagos coast to rare white truffles flown in from Alba and aged cheeses from Normandy, we respect the intrinsic integrity of every ingredient. No shortcut is taken. Sauces simmer for forty-eight hours; breads ferment for seventy-two.
              </p>
              <p className="text-sm text-[#8B8175] pt-2 italic">
                “Luxury is not excessive abundance; it is the absolute purity of the essential.”
              </p>
            </div>

            {/* Signature & Provenance notes */}
            <div className="mt-10 pt-8 border-t border-[#211E1B] flex items-center justify-between">
              <div>
                <span className="font-serif text-2xl text-[#C9A96E] tracking-wider block">ÉLANÉ</span>
                <span className="text-xs uppercase tracking-widest text-[#8B8175] mt-1 block">
                  Est. Lagos, Nigeria
                </span>
              </div>
              <div className="text-right">
                <span className="text-xs uppercase tracking-widest text-[#8B8175] block">Table Reservations</span>
                <span className="text-sm font-mono text-[#F5F0E8]">{BRAND_INFO.phone}</span>
              </div>
            </div>
          </div>

          {/* Right Column: Picture of Chef Dishing Food */}
          <div className="lg:col-span-6 relative">
            <div className="relative rounded-[8px] overflow-hidden bg-[#211E1B] aspect-[4/5] shadow-2xl group border border-[#2a2622]">
              <img
                src="/images/chef_dishing_food_1790776601417.jpg"
                alt="Executive Chef dishing and plating fine dining cuisine at ÉLANÉ"
                className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#171513]/85 via-transparent to-transparent pointer-events-none" />
              
              {/* Subtle Chef Caption Overlay */}
              <div className="absolute bottom-8 left-8 right-8">
                <p className="text-xs tracking-widest uppercase text-[#C9A96E] font-medium mb-1">
                  At the Pass · Plating Precision
                </p>
                <h4 className="font-serif text-lg text-[#F5F0E8]">
                  Chef Adebayo Thorne
                </h4>
                <p className="text-xs text-[#8B8175] mt-0.5 font-light">
                  Meticulously dishing the signature tasting menu course
                </p>
              </div>
            </div>

            {/* Subtle architectural gold hairline framing */}
            <div className="hidden sm:block absolute -bottom-3 -right-3 w-28 h-28 border-r border-b border-[#C9A96E]/30 rounded-br-[8px] -z-10" />
          </div>
        </div>
      </div>
    </section>
  );
};
