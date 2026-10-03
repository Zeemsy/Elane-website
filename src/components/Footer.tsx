import React, { useState } from 'react';
import { BRAND_INFO } from '../data/restaurantData';
import { ArrowUp, Instagram, Facebook, Check } from 'lucide-react';

interface FooterProps {
  onOpenReservation: () => void;
  onOpenAdmin: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenReservation, onOpenAdmin }) => {
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (newsletterEmail && newsletterEmail.includes('@')) {
      setSubscribed(true);
      setNewsletterEmail('');
      setTimeout(() => setSubscribed(false), 4000);
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer id="contact" className="bg-[#171513] text-[#F5F0E8] border-t border-[#211E1B] pt-20 pb-12 relative">
      <div className="max-w-[1200px] mx-auto px-6 md:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 lg:gap-8 pb-16 border-b border-[#211E1B]">
          {/* Col 1: Brand & Meaning (4 cols) */}
          <div className="lg:col-span-4">
            <a href="#" className="inline-block font-serif text-3xl tracking-[0.2em] text-[#F5F0E8] hover:text-[#C9A96E] transition-colors mb-3">
              {BRAND_INFO.name}
            </a>
            <p className="text-xs text-[#C9A96E] uppercase tracking-widest font-medium mb-3">
              /{BRAND_INFO.pronunciation}/ · An elevated dining experience
            </p>
            <p className="text-sm text-[#8B8175] font-light leading-relaxed max-w-sm mb-6">
              Contemporary cuisine, thoughtfully crafted and beautifully served. Located along the serene coastline of Victoria Island, Lagos.
            </p>

            {/* Social links */}
            <div className="flex items-center gap-4 text-[#8B8175]">
              <a
                href="#instagram"
                className="w-9 h-9 rounded-full border border-[#211E1B] flex items-center justify-center hover:text-[#C9A96E] hover:border-[#C9A96E]/50 transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a
                href="#facebook"
                className="w-9 h-9 rounded-full border border-[#211E1B] flex items-center justify-center hover:text-[#C9A96E] hover:border-[#C9A96E]/50 transition-colors"
                aria-label="Facebook"
              >
                <Facebook className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Col 2: Navigation Links (2 cols) */}
          <div className="lg:col-span-2">
            <span className="text-xs uppercase tracking-[0.2em] text-[#C9A96E] font-medium block mb-4">
              Navigation
            </span>
            <ul className="space-y-2.5 text-sm text-[#8B8175]">
              <li><a href="#story" className="hover:text-[#F5F0E8] transition-colors">Our Story</a></li>
              <li><a href="#signatures" className="hover:text-[#F5F0E8] transition-colors">Signature Dishes</a></li>
              <li><a href="#menu" className="hover:text-[#F5F0E8] transition-colors">Culinary Menu</a></li>
              <li><a href="#experience" className="hover:text-[#F5F0E8] transition-colors">Dining Experience</a></li>
              <li><a href="#gallery" className="hover:text-[#F5F0E8] transition-colors">Gallery</a></li>
              <li>
                <button
                  onClick={onOpenReservation}
                  className="hover:text-[#C9A96E] text-left transition-colors cursor-pointer"
                >
                  Reserve Table
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Address & Hours (3 cols) */}
          <div className="lg:col-span-3">
            <span className="text-xs uppercase tracking-[0.2em] text-[#C9A96E] font-medium block mb-4">
              Hours & Location
            </span>
            <div className="space-y-3 text-sm text-[#8B8175] font-light leading-relaxed">
              <p>
                <strong className="text-[#F5F0E8] font-normal block">Address:</strong>
                {BRAND_INFO.address}
              </p>
              <p>
                <strong className="text-[#F5F0E8] font-normal block">Dinner Service:</strong>
                {BRAND_INFO.hours.dinner}
              </p>
              <p>
                <strong className="text-[#F5F0E8] font-normal block">Cocktails & Lounge:</strong>
                {BRAND_INFO.hours.bar}
              </p>
              <p className="text-xs text-[#8B8175]/80 italic">
                {BRAND_INFO.hours.closed}
              </p>
            </div>
          </div>

          {/* Col 4: Newsletter & Private Dining (3 cols) */}
          <div className="lg:col-span-3">
            <span className="text-xs uppercase tracking-[0.2em] text-[#C9A96E] font-medium block mb-4">
              Seasonal Journal
            </span>
            <p className="text-xs text-[#8B8175] leading-relaxed mb-4">
              Receive advance invitations to guest chef collaborations and seasonal tasting menu unveilings.
            </p>

            <form onSubmit={handleSubscribe} className="space-y-2">
              <div className="flex">
                <input
                  type="email"
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="bg-[#211E1B] border border-[#2a2622] text-[#F5F0E8] text-xs rounded-l-[4px] px-3 py-2.5 flex-1 focus:outline-none focus:border-[#C9A96E]"
                  required
                />
                <button
                  type="submit"
                  className="bg-[#C9A96E] text-[#171513] text-xs font-semibold px-4 rounded-r-[4px] hover:bg-[#b8985c] transition-colors"
                >
                  Join
                </button>
              </div>
              {subscribed && (
                <p className="text-xs text-emerald-400 flex items-center gap-1 mt-1">
                  <Check className="w-3.5 h-3.5" /> Thank you. You are on the private list.
                </p>
              )}
            </form>
          </div>
        </div>

        {/* Bottom Bar: Copyright & Back to Top */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#8B8175]">
          <p>
            © {new Date().getFullYear()} {BRAND_INFO.name} Restaurant. All rights reserved. Lagos, Nigeria.
          </p>
          <div className="flex items-center gap-6">
            <button
              onClick={onOpenAdmin}
              className="text-[10px] text-[#8B8175]/30 hover:text-[#8B8175] transition-colors cursor-pointer"
              title="Staff Portal (Passcode Required)"
            >
              Staff Portal
            </button>
            <span className="text-[11px] tracking-widest uppercase text-[#C9A96E]/80">
              Quiet Luxury
            </span>
            <button
              onClick={scrollToTop}
              className="flex items-center gap-1.5 text-[#F5F0E8] hover:text-[#C9A96E] transition-colors cursor-pointer"
            >
              <span>Back to Top</span>
              <ArrowUp className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
