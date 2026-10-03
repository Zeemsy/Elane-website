import React, { useState } from 'react';
import { GALLERY_ITEMS } from '../data/restaurantData';
import { X, Maximize2 } from 'lucide-react';

export const GallerySection: React.FC = () => {
  const [activeImage, setActiveImage] = useState<{ image: string; title: string; category: string } | null>(null);

  return (
    <section id="gallery" className="py-24 lg:py-32 bg-[#171513] border-t border-[#211E1B] relative">
      <div className="max-w-[1200px] mx-auto px-6 md:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.25em] text-[#C9A96E] mb-3">
              <span>07</span>
              <span className="w-8 h-[1px] bg-[#C9A96E]/40" />
              <span>Atmosphere & Artistry</span>
            </div>
            <h2 className="font-serif text-[32px] sm:text-[40px] lg:text-[48px] leading-[1.15] text-[#F5F0E8]">
              Visual Impressions
            </h2>
          </div>
          <p className="text-sm md:text-base text-[#8B8175] max-w-md font-light leading-relaxed">
            Moments captured in our Lagos sanctuary. Architectural shadows, culinary precision, and the warmth of shared anticipation.
          </p>
        </div>

        {/* Gallery Grid: Desktop asymmetric, Mobile 2-column */}
        <div className="grid grid-cols-2 md:grid-cols-12 gap-4 md:gap-6">
          {GALLERY_ITEMS.map((item, idx) => (
            <div
              key={item.id}
              onClick={() => setActiveImage(item)}
              className={`group relative overflow-hidden rounded-[8px] bg-[#211E1B] cursor-pointer shadow-lg ${
                // Mobile: 2-column or full width for 1st item; Desktop uses span
                idx === 0 ? 'col-span-2 md:col-span-8 aspect-[16/10]' : 'col-span-1 md:col-span-4 aspect-[4/3] md:aspect-auto'
              }`}
            >
              <img
                src={item.image}
                alt={item.title}
                className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4 md:p-6">
                <span className="text-[11px] uppercase tracking-widest text-[#C9A96E] mb-1 font-medium">
                  {item.category}
                </span>
                <div className="flex items-center justify-between">
                  <h4 className="font-serif text-sm md:text-lg text-[#F5F0E8]">
                    {item.title}
                  </h4>
                  <Maximize2 className="w-4 h-4 text-[#F5F0E8]/70" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Lightbox Modal */}
      {activeImage && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setActiveImage(null)}
        >
          <button
            onClick={() => setActiveImage(null)}
            className="absolute top-6 right-6 text-[#F5F0E8]/70 hover:text-[#F5F0E8] p-2"
          >
            <X className="w-8 h-8" />
          </button>
          <div
            className="max-w-4xl w-full bg-[#171513] rounded-[8px] overflow-hidden border border-[#211E1B]"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={activeImage.image}
              alt={activeImage.title}
              className="w-full max-h-[75vh] object-cover"
            />
            <div className="p-6 flex items-center justify-between">
              <div>
                <span className="text-xs uppercase tracking-widest text-[#C9A96E] block mb-1">
                  {activeImage.category}
                </span>
                <h3 className="font-serif text-xl text-[#F5F0E8]">{activeImage.title}</h3>
              </div>
              <span className="text-xs text-[#8B8175]">ÉLANÉ · Lagos</span>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
