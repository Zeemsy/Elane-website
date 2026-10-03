import React, { useState } from 'react';
import { FULL_MENU } from '../data/restaurantData';
import { MenuItem } from '../types/restaurant';
import { Wine, Sparkles, X, ArrowUpRight } from 'lucide-react';

interface MenuSectionProps {
  currency: 'NGN' | 'USD';
  onToggleCurrency: () => void;
  onOpenReservation: () => void;
  menuItems?: MenuItem[];
}

export const MenuSection: React.FC<MenuSectionProps> = ({
  currency,
  onToggleCurrency,
  onOpenReservation,
  menuItems = FULL_MENU,
}) => {
  const [activeCategory, setActiveCategory] = useState<'starters' | 'mains' | 'desserts' | 'drinks'>('mains');
  const [dietaryFilter, setDietaryFilter] = useState<string>('all');
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);

  const categories = [
    { id: 'starters', label: 'Starters' },
    { id: 'mains', label: 'Mains' },
    { id: 'desserts', label: 'Desserts' },
    { id: 'drinks', label: 'Drinks & Cellar' },
  ] as const;

  const filteredItems = menuItems.filter((item) => {
    if (item.category !== activeCategory) return false;
    if (dietaryFilter === 'all') return true;
    if (dietaryFilter === 'V') return item.dietary?.includes('V');
    if (dietaryFilter === 'GF') return item.dietary?.includes('GF');
    if (dietaryFilter === 'Chef') return item.dietary?.includes('Chef');
    return true;
  });

  const formatPrice = (item: MenuItem) => {
    if (currency === 'USD') {
      return `$${item.priceUsd}`;
    }
    return `₦${item.priceNaira.toLocaleString()}`;
  };

  return (
    <section id="menu" className="py-24 lg:py-36 bg-[#F5F0E8] text-[#171513] relative transition-colors duration-300">
      <div className="max-w-[1200px] mx-auto px-6 md:px-8">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="flex items-center justify-center gap-2 text-xs font-semibold uppercase tracking-[0.25em] text-[#8B8175] mb-3">
            <span>05</span>
            <span className="w-8 h-[1px] bg-[#8B8175]/40" />
            <span>Seasonal Degustation & À La Carte</span>
          </div>

          <h2 className="font-serif text-[36px] sm:text-[44px] lg:text-[48px] text-[#171513] font-normal leading-tight mb-4">
            The Culinary Collection
          </h2>

          <p className="text-sm md:text-base text-[#8B8175] font-light leading-relaxed">
            Thoughtfully sourced ingredients, prepared with reverence. Each creation is presented with photographic fidelity to celebrate its artisan technique.
          </p>

          {/* Currency Toggle */}
          <div className="mt-4 flex items-center justify-center gap-2">
            <span className="text-xs text-[#8B8175]">Currency:</span>
            <button
              onClick={onToggleCurrency}
              className="text-xs font-semibold text-[#171513] underline decoration-[#C9A96E] underline-offset-4 hover:text-[#C9A96E] transition-colors cursor-pointer"
            >
              {currency === 'NGN' ? 'NGN (₦) · Switch to USD ($)' : 'USD ($) · Switch to NGN (₦)'}
            </button>
          </div>
        </div>

        {/* Category Navigation Tabs */}
        <div className="flex justify-center border-b border-[#171513]/10 mb-12 overflow-x-auto">
          <div className="flex gap-8 sm:gap-12 px-2">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`py-4 text-sm uppercase tracking-[0.15em] font-medium transition-all relative whitespace-nowrap cursor-pointer ${
                  activeCategory === cat.id
                    ? 'text-[#171513] font-semibold after:content-[\'\'] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px] after:bg-[#171513]'
                    : 'text-[#8B8175] hover:text-[#171513]'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Dietary Filter Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-4 mb-16 text-xs text-[#8B8175]">
          <span className="font-medium">Filter:</span>
          {[
            { id: 'all', label: 'All Dishes' },
            { id: 'Chef', label: 'Chef’s Selection' },
            { id: 'V', label: 'Vegetarian' },
            { id: 'GF', label: 'Gluten-Free' },
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => setDietaryFilter(f.id)}
              className={`px-3 py-1 text-xs rounded-[4px] transition-colors cursor-pointer ${
                dietaryFilter === f.id
                  ? 'bg-[#171513] text-[#F5F0E8]'
                  : 'bg-transparent text-[#8B8175] hover:text-[#171513] border border-[#171513]/10'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Menu Items Grid: Every dish has a clear high-res image of its respective name */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              onClick={() => setSelectedItem(item)}
              className="group bg-white/70 hover:bg-white rounded-[8px] p-5 border border-[#171513]/10 hover:border-[#C9A96E]/60 transition-all duration-300 flex flex-col justify-between shadow-sm hover:shadow-xl cursor-pointer"
            >
              <div>
                {/* Clear Picture of Respective Item */}
                <div className="relative aspect-[4/3] w-full rounded-[6px] overflow-hidden mb-5 bg-[#171513]/10">
                  {item.image ? (
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-[#171513]/5">
                      <Sparkles className="w-6 h-6 text-[#C9A96E]" />
                    </div>
                  )}

                  {/* Signature or Category Tag */}
                  {item.isSignature && (
                    <div className="absolute top-3 left-3 bg-[#171513]/90 backdrop-blur-sm px-2.5 py-1 rounded-[4px] text-[10px] tracking-widest uppercase font-semibold text-[#C9A96E]">
                      Signature
                    </div>
                  )}

                  <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 p-1.5 rounded-full shadow-sm text-[#171513]">
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </div>
                </div>

                {/* Title & Price on Single Row */}
                <div className="flex items-baseline justify-between gap-3 mb-1.5">
                  <h3 className="font-serif text-xl text-[#171513] group-hover:text-[#b8985c] transition-colors leading-snug font-medium">
                    {item.name}
                  </h3>
                  <span className="font-mono text-base font-bold text-[#171513] tabular-nums shrink-0">
                    {formatPrice(item)}
                  </span>
                </div>

                {/* Dietary Tags as Clean Unboxed Text with Separators */}
                {item.dietary && item.dietary.length > 0 && (
                  <div className="flex items-center gap-1.5 text-[11px] font-medium tracking-wider text-[#8B8175] mb-2.5 uppercase">
                    {item.dietary.map((d, index) => (
                      <React.Fragment key={d}>
                        {index > 0 && <span>·</span>}
                        <span>
                          {d === 'V' && 'Vegetarian'}
                          {d === 'GF' && 'Gluten Free'}
                          {d === 'DF' && 'Dairy Free'}
                          {d === 'Chef' && 'Chef Signature'}
                        </span>
                      </React.Fragment>
                    ))}
                  </div>
                )}

                {/* Description */}
                <p className="text-xs sm:text-sm text-[#5c544c] font-light leading-relaxed mb-4">
                  {item.description}
                </p>
              </div>

              {/* Card Footer / Sommelier Pairing */}
              {item.pairing && (
                <div className="pt-3 border-t border-[#171513]/10 flex items-center gap-1.5 text-xs text-[#8B8175] italic font-serif truncate">
                  <Wine className="w-3.5 h-3.5 text-[#C9A96E] shrink-0" />
                  <span className="truncate">{item.pairing}</span>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Degustation Note & Reservation Prompt */}
        <div className="mt-20 text-center max-w-xl mx-auto pt-10 border-t border-[#171513]/15">
          <p className="font-serif text-xl text-[#171513] mb-2">
            Executive Tasting Menu
          </p>
          <p className="text-xs sm:text-sm text-[#8B8175] mb-6 leading-relaxed">
            7-Course Blind Degustation tailored by Chef Adebayo Thorne · ₦85,000 / $58 per guest
            <br />
            Optional Grand Cru Cellar Pairing available
          </p>
          <button
            onClick={onOpenReservation}
            className="btn-gold-primary bg-[#171513] text-[#F5F0E8] hover:bg-[#211E1B]"
          >
            Reserve Degustation Table
          </button>
        </div>
      </div>

      {/* Dish Inspection Lightbox Modal */}
      {selectedItem && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in"
          onClick={() => setSelectedItem(null)}
        >
          <div
            className="bg-[#171513] text-[#F5F0E8] border border-[#211E1B] rounded-[8px] max-w-xl w-full p-6 md:p-8 relative shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedItem(null)}
              className="absolute top-4 right-4 text-[#8B8175] hover:text-[#F5F0E8] p-1.5 rounded-md hover:bg-[#211E1B] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {selectedItem.image && (
              <div className="aspect-[16/10] w-full rounded-[6px] overflow-hidden mb-6 bg-[#211E1B]">
                <img
                  src={selectedItem.image}
                  alt={selectedItem.name}
                  className="w-full h-full object-cover object-center"
                />
              </div>
            )}

            <div className="flex items-baseline justify-between mb-2">
              <h3 className="font-serif text-2xl text-[#F5F0E8]">{selectedItem.name}</h3>
              <span className="font-mono text-xl font-bold text-[#C9A96E] tabular-nums">
                {formatPrice(selectedItem)}
              </span>
            </div>

            <p className="text-xs text-[#C9A96E] uppercase tracking-wider mb-4 font-medium">
              Category: {selectedItem.category} {selectedItem.isSignature && '· Signature Creation'}
            </p>

            <p className="text-[#F5F0E8]/85 text-sm leading-relaxed mb-6 font-light">
              {selectedItem.description}
            </p>

            {selectedItem.pairing && (
              <div className="bg-[#211E1B] p-4 rounded-[6px] border border-[#2a2622] mb-6">
                <span className="text-[11px] uppercase tracking-widest text-[#8B8175] block mb-1">
                  Sommelier Cellar Pairing
                </span>
                <p className="text-sm font-serif italic text-[#C9A96E]">
                  {selectedItem.pairing}
                </p>
              </div>
            )}

            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  setSelectedItem(null);
                  onOpenReservation();
                }}
                className="btn-gold-primary flex-1"
              >
                Reserve a Table for This Dish
              </button>
              <button
                onClick={() => setSelectedItem(null)}
                className="btn-gold-secondary px-6"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
