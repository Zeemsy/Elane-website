import React, { useState } from 'react';
import { Sparkles, Wine, ArrowRight, X } from 'lucide-react';
import { SIGNATURE_DISHES } from '../data/restaurantData';
import { MenuItem } from '../types/restaurant';

interface SignatureDishesProps {
  onExploreFullMenu: () => void;
  currency: 'NGN' | 'USD';
}

export const SignatureDishes: React.FC<SignatureDishesProps> = ({
  onExploreFullMenu,
  currency,
}) => {
  const [selectedDish, setSelectedDish] = useState<MenuItem | null>(null);

  const formatPrice = (dish: MenuItem) => {
    if (currency === 'USD') {
      return `$${dish.priceUsd}`;
    }
    return `₦${dish.priceNaira.toLocaleString()}`;
  };

  return (
    <section id="signatures" className="py-24 lg:py-32 bg-[#171513] border-t border-[#211E1B] relative">
      <div className="max-w-[1200px] mx-auto px-6 md:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.25em] text-[#C9A96E] mb-3">
              <span>03</span>
              <span className="w-8 h-[1px] bg-[#C9A96E]/40" />
              <span>Signature Creations</span>
            </div>
            <h2 className="font-serif text-[32px] sm:text-[40px] lg:text-[48px] leading-[1.15] text-[#F5F0E8]">
              A Taste Worth Remembering
            </h2>
          </div>
          <p className="text-sm md:text-base text-[#8B8175] max-w-md font-light leading-relaxed">
            Plated compositions that define the soul of ÉLANÉ. Crafted with meticulous restraint and singular ingredients.
          </p>
        </div>

        {/* 3–4 Signature Dish Cards Grid (12-column layout matching Figma design system) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {SIGNATURE_DISHES.slice(0, 3).map((dish) => (
            <div
              key={dish.id}
              onClick={() => setSelectedDish(dish)}
              className="group bg-[#211E1B] rounded-[8px] p-6 flex flex-col justify-between border border-transparent hover:border-[#C9A96E]/30 transition-all duration-300 cursor-pointer"
            >
              <div>
                {/* Food Image Container */}
                <div className="relative aspect-[4/3] w-full rounded-[6px] overflow-hidden mb-6 bg-[#171513]">
                  {dish.image ? (
                    <img
                      src={dish.image}
                      alt={dish.name}
                      className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-[#171513]">
                      <Sparkles className="w-8 h-8 text-[#C9A96E]/30" />
                    </div>
                  )}
                  {/* Subtle clean badge */}
                  <div className="absolute top-3 left-3 bg-[#171513]/90 backdrop-blur-sm px-2.5 py-1 rounded-[4px] text-[11px] tracking-widest uppercase font-medium text-[#C9A96E]">
                    Signature
                  </div>
                </div>

                {/* Dish Title & Price */}
                <div className="flex items-baseline justify-between gap-4 mb-2">
                  <h3 className="font-serif text-[24px] text-[#F5F0E8] group-hover:text-[#C9A96E] transition-colors leading-snug">
                    {dish.name}
                  </h3>
                  <span className="font-mono text-base font-semibold text-[#C9A96E] tabular-nums shrink-0">
                    {formatPrice(dish)}
                  </span>
                </div>

                {/* Unboxed Zero-Pill Metadata */}
                <p className="text-xs text-[#C9A96E]/80 tracking-wide mb-3 font-medium">
                  {dish.id === 'sig-1' && 'Fresh pasta · Black truffle · Parmesan'}
                  {dish.id === 'sig-2' && 'Herbs · Citrus · Brown butter'}
                  {dish.id === 'sig-3' && 'Dark chocolate · Hazelnut · Sea salt'}
                </p>

                {/* Narrative description */}
                <p className="text-sm text-[#8B8175] font-light leading-relaxed mb-4">
                  {dish.description}
                </p>
              </div>

              {/* Card Footer / Sommelier Pairing */}
              <div className="pt-4 border-t border-[#171513] flex items-center justify-between text-xs text-[#8B8175]">
                <div className="flex items-center gap-1.5 truncate pr-2">
                  <Wine className="w-3.5 h-3.5 text-[#C9A96E] shrink-0" />
                  <span className="truncate italic font-light">{dish.pairing}</span>
                </div>
                <span className="text-[#C9A96E] group-hover:translate-x-1 transition-transform flex items-center gap-1">
                  View <ArrowRight className="w-3 h-3" />
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Action Link to Full Menu */}
        <div className="mt-12 text-center">
          <button
            onClick={onExploreFullMenu}
            className="btn-gold-secondary"
          >
            Explore Complete Menu
          </button>
        </div>
      </div>

      {/* Dish Detail Modal */}
      {selectedDish && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#211E1B] border border-[#C9A96E]/30 rounded-[8px] max-w-lg w-full p-6 md:p-8 relative shadow-2xl">
            <button
              onClick={() => setSelectedDish(null)}
              className="absolute top-4 right-4 text-[#8B8175] hover:text-[#F5F0E8] p-1"
            >
              <X className="w-5 h-5" />
            </button>

            {selectedDish.image && (
              <div className="aspect-[16/9] w-full rounded-[6px] overflow-hidden mb-6 bg-[#171513]">
                <img
                  src={selectedDish.image}
                  alt={selectedDish.name}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            <div className="flex items-baseline justify-between mb-2">
              <h3 className="font-serif text-2xl text-[#F5F0E8]">{selectedDish.name}</h3>
              <span className="font-mono text-lg font-bold text-[#C9A96E] tabular-nums">
                {formatPrice(selectedDish)}
              </span>
            </div>

            <p className="text-xs text-[#C9A96E] uppercase tracking-wider mb-4">
              Category: {selectedDish.category} · Chef’s Selection
            </p>

            <p className="text-[#F5F0E8]/80 text-sm leading-relaxed mb-6 font-light">
              {selectedDish.description}
            </p>

            {selectedDish.pairing && (
              <div className="bg-[#171513] p-4 rounded-[6px] border border-[#2a2622] mb-6">
                <span className="text-[11px] uppercase tracking-widest text-[#8B8175] block mb-1">
                  Sommelier Pairing
                </span>
                <p className="text-sm font-serif italic text-[#C9A96E]">
                  {selectedDish.pairing}
                </p>
              </div>
            )}

            <button
              onClick={() => setSelectedDish(null)}
              className="btn-gold-primary w-full"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </section>
  );
};
