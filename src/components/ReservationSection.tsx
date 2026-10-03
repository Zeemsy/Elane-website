import React from 'react';
import { Calendar, Phone, Mail, ShieldCheck } from 'lucide-react';
import { BRAND_INFO } from '../data/restaurantData';

interface ReservationSectionProps {
  onOpenReservation: () => void;
}

export const ReservationSection: React.FC<ReservationSectionProps> = ({ onOpenReservation }) => {
  return (
    <section id="reserve" className="py-24 lg:py-36 bg-[#171513] relative overflow-hidden border-t border-[#211E1B]">
      {/* Subtle background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-[#C9A96E]/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-[1200px] mx-auto px-6 md:px-8 relative z-10 text-center">
        {/* Kicker */}
        <div className="flex items-center justify-center gap-2 text-xs font-semibold uppercase tracking-[0.25em] text-[#C9A96E] mb-4">
          <span>08</span>
          <span className="w-8 h-[1px] bg-[#C9A96E]/40" />
          <span>Intimate Sittings</span>
        </div>

        {/* Main Section Heading */}
        <h2 className="font-serif text-[40px] sm:text-[52px] lg:text-[64px] font-normal leading-tight text-[#F5F0E8] max-w-3xl mx-auto mb-6 text-balance">
          Your Table Awaits
        </h2>

        <p className="text-base sm:text-lg text-[#F5F0E8]/80 font-light max-w-xl mx-auto mb-10 leading-relaxed">
          Experience the quiet elegance of ÉLANÉ. Due to our intimate 32-seat capacity, advance reservations are warmly recommended.
        </p>

        {/* Primary CTA */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
          <button
            onClick={onOpenReservation}
            className="btn-gold-primary px-8 text-sm shadow-xl shadow-black/50"
          >
            <Calendar className="w-4 h-4 mr-2" />
            Reserve a Table
          </button>
        </div>

        {/* Direct Contact & Private Dining Information */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto pt-10 border-t border-[#211E1B] text-left">
          <div className="bg-[#211E1B] p-6 rounded-[8px] border border-[#2a2622]">
            <div className="flex items-center gap-2 text-[#C9A96E] text-xs uppercase tracking-wider font-semibold mb-2">
              <Phone className="w-4 h-4" />
              <span>Direct Concierge</span>
            </div>
            <p className="text-sm font-mono text-[#F5F0E8]">{BRAND_INFO.phone}</p>
            <p className="text-xs text-[#8B8175] mt-1">Daily 12:00 – 22:00</p>
          </div>

          <div className="bg-[#211E1B] p-6 rounded-[8px] border border-[#2a2622]">
            <div className="flex items-center gap-2 text-[#C9A96E] text-xs uppercase tracking-wider font-semibold mb-2">
              <Mail className="w-4 h-4" />
              <span>Private Salons & Buyouts</span>
            </div>
            <p className="text-sm text-[#F5F0E8]">{BRAND_INFO.email}</p>
            <p className="text-xs text-[#8B8175] mt-1">Parties of 9 or more guests</p>
          </div>

          <div className="bg-[#211E1B] p-6 rounded-[8px] border border-[#2a2622]">
            <div className="flex items-center gap-2 text-[#C9A96E] text-xs uppercase tracking-wider font-semibold mb-2">
              <ShieldCheck className="w-4 h-4" />
              <span>Dress Code & Etiquette</span>
            </div>
            <p className="text-sm text-[#F5F0E8]">Smart Elegant</p>
            <p className="text-xs text-[#8B8175] mt-1">Collared attire requested</p>
          </div>
        </div>
      </div>
    </section>
  );
};
