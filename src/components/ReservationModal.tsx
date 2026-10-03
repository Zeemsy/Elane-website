import React, { useState } from 'react';
import { X, Calendar as CalendarIcon, Clock, Users, MapPin, CheckCircle2, Copy, Check } from 'lucide-react';
import { BRAND_INFO } from '../data/restaurantData';
import { ReservationConfirmation } from '../types/restaurant';
import { createReservationInSupabase, isSupabaseConfigured } from '../lib/supabaseClient';

interface ReservationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddReservation?: (reservation: ReservationConfirmation) => void;
}

export const ReservationModal: React.FC<ReservationModalProps> = ({ isOpen, onClose, onAddReservation }) => {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [date, setDate] = useState<string>(() => {
    const today = new Date();
    today.setDate(today.getDate() + 1);
    return today.toISOString().split('T')[0];
  });
  const [time, setTime] = useState<string>('19:30');
  const [guests, setGuests] = useState<number>(2);
  const [seatingArea, setSeatingArea] = useState<'dining-room' | 'terrace' | 'cellar' | 'chef-counter'>('dining-room');
  const [occasion, setOccasion] = useState<string>('Dinner');
  const [specialRequests, setSpecialRequests] = useState<string>('');
  
  // Guest details
  const [guestName, setGuestName] = useState<string>('');
  const [guestEmail, setGuestEmail] = useState<string>('');
  const [guestPhone, setGuestPhone] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string>('');
  
  // Confirmation state
  const [confirmation, setConfirmation] = useState<ReservationConfirmation | null>(null);
  const [copied, setCopied] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleNextStep = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (step === 1) {
      if (!date || !time) {
        setErrorMsg('Please select both a date and preferred dining time.');
        return;
      }
      setStep(2);
    } else if (step === 2) {
      if (!guestName.trim()) {
        setErrorMsg('Please enter your full name.');
        return;
      }
      if (!guestEmail.trim() || !guestEmail.includes('@')) {
        setErrorMsg('Please provide a valid email address for confirmation.');
        return;
      }
      if (!guestPhone.trim()) {
        setErrorMsg('Please enter your contact phone number.');
        return;
      }

      // Generate confirmed booking
      const refCode = `ELN-${Math.floor(1000 + Math.random() * 9000)}-${new Date().getFullYear().toString().slice(-2)}`;
      const confirmedData: ReservationConfirmation = {
        date,
        time,
        guests,
        seatingArea,
        occasion,
        specialRequests,
        guestName,
        guestEmail,
        guestPhone,
        bookingReference: refCode,
        createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setConfirmation(confirmedData);
      onAddReservation?.(confirmedData);

      // Asynchronously sync to Supabase database if configured
      if (isSupabaseConfigured) {
        createReservationInSupabase({
          booking_reference: refCode,
          guest_name: guestName,
          guest_email: guestEmail,
          guest_phone: guestPhone,
          guests_count: guests,
          seating_area: seatingArea,
          occasion: occasion,
          special_requests: specialRequests,
          reservation_date: date,
          reservation_time: time,
          status: 'confirmed',
        }).catch((err) => {
          console.error('Supabase reservation sync error:', err);
        });
      }

      setStep(3);
    }
  };

  const copyRefCode = () => {
    if (confirmation) {
      navigator.clipboard.writeText(confirmation.bookingReference);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const seatingNames = {
    'dining-room': 'Main Dining Room',
    'terrace': 'Waterfront Terrace',
    'cellar': 'Private Wine Cellar',
    'chef-counter': 'Chef Adebayo Counter',
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-start sm:items-center justify-center p-3 pt-14 pb-8 sm:p-4 bg-black/85 backdrop-blur-md animate-fade-in overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative bg-[#171513] border border-[#211E1B] rounded-[10px] sm:rounded-[8px] max-w-xl w-full p-5 sm:p-8 shadow-2xl my-2 sm:my-8">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Close reservation modal"
          className="absolute top-4 right-4 sm:top-5 sm:right-5 text-[#F5F0E8] sm:text-[#8B8175] hover:text-[#C9A96E] p-2 sm:p-1.5 rounded-full sm:rounded-md bg-[#211E1B] sm:bg-transparent border border-[#2a2622] sm:border-transparent hover:bg-[#2a2622] transition-colors cursor-pointer z-20 flex items-center justify-center active:scale-95 shadow-md sm:shadow-none"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="mb-6 pr-8 sm:pr-0">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.25em] text-[#C9A96E] mb-1">
            <span>ÉLANÉ Reservations</span>
            <span className="text-[#8B8175]">·</span>
            <span>Victoria Island</span>
          </div>
          <h3 className="font-serif text-2xl sm:text-3xl text-[#F5F0E8]">
            {step === 3 ? 'Reservation Confirmed' : 'Reserve Your Table'}
          </h3>
          <p className="text-xs sm:text-sm text-[#8B8175] mt-1 font-light">
            {step === 1 && 'Select your preferred date, party size, and dining atmosphere.'}
            {step === 2 && 'Please provide your contact details for host confirmation.'}
            {step === 3 && 'We look forward to hosting you at ÉLANÉ.'}
          </p>
        </div>

        {/* Step 1: Date, Time, Guests, Area */}
        {step === 1 && (
          <form onSubmit={handleNextStep} className="space-y-6">
            {/* Guests Selector */}
            <div>
              <label className="block text-xs uppercase tracking-wider text-[#F5F0E8]/80 mb-2 font-medium">
                Party Size
              </label>
              <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
                {[1, 2, 3, 4, 5, 6, 8].map((num) => (
                  <button
                    type="button"
                    key={num}
                    onClick={() => setGuests(num)}
                    className={`py-2 text-xs font-medium rounded-[4px] border transition-colors cursor-pointer ${
                      guests === num
                        ? 'bg-[#C9A96E] text-[#171513] border-[#C9A96E] font-semibold'
                        : 'bg-[#211E1B] text-[#F5F0E8] border-[#2a2622] hover:border-[#C9A96E]/50'
                    }`}
                  >
                    {num} {num === 1 ? 'Guest' : 'Guests'}
                  </button>
                ))}
              </div>
            </div>

            {/* Date & Time Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs uppercase tracking-wider text-[#F5F0E8]/80 mb-2 font-medium">
                  Date
                </label>
                <div className="relative">
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full bg-[#211E1B] border border-[#2a2622] text-[#F5F0E8] text-sm rounded-[4px] px-3 py-2.5 focus:outline-none focus:border-[#C9A96E]"
                    required
                  />
                  <CalendarIcon className="w-4 h-4 text-[#8B8175] absolute right-3 top-3 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-[#F5F0E8]/80 mb-2 font-medium">
                  Sitting Time
                </label>
                <div className="relative">
                  <select
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="w-full bg-[#211E1B] border border-[#2a2622] text-[#F5F0E8] text-sm rounded-[4px] px-3 py-2.5 focus:outline-none focus:border-[#C9A96E] cursor-pointer"
                  >
                    <option value="18:00">18:00 (Sunset Sitting)</option>
                    <option value="18:30">18:30 (Dinner)</option>
                    <option value="19:30">19:30 (Peak Prime)</option>
                    <option value="20:30">20:30 (Late Evening)</option>
                    <option value="21:30">21:30 (Night Degustation)</option>
                  </select>
                  <Clock className="w-4 h-4 text-[#8B8175] absolute right-3 top-3 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Atmosphere / Seating Area */}
            <div>
              <label className="block text-xs uppercase tracking-wider text-[#F5F0E8]/80 mb-2 font-medium">
                Seating Atmosphere
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { id: 'dining-room', title: 'Main Dining Room', desc: 'Charcoal stone & candlelight' },
                  { id: 'terrace', title: 'Waterfront Terrace', desc: 'Open lagoon breeze & ambient lanterns' },
                  { id: 'cellar', title: 'Private Cellar', desc: 'Surrounded by rare Grand Crus' },
                  { id: 'chef-counter', title: 'Chef’s Counter', desc: 'Front-row view of the plating brigade' },
                ].map((area) => (
                  <button
                    type="button"
                    key={area.id}
                    onClick={() => setSeatingArea(area.id as any)}
                    className={`p-3 text-left rounded-[4px] border transition-all cursor-pointer ${
                      seatingArea === area.id
                        ? 'bg-[#211E1B] border-[#C9A96E]'
                        : 'bg-[#171513] border-[#2a2622] hover:border-[#8B8175]'
                    }`}
                  >
                    <div className="text-xs font-semibold text-[#F5F0E8] flex items-center justify-between">
                      <span>{area.title}</span>
                      {seatingArea === area.id && <span className="w-2 h-2 rounded-full bg-[#C9A96E]" />}
                    </div>
                    <p className="text-[11px] text-[#8B8175] mt-0.5">{area.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            {errorMsg && (
              <p className="text-xs text-rose-400 font-medium">{errorMsg}</p>
            )}

            <div className="pt-2 w-full flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="hidden sm:inline-flex btn-gold-secondary sm:w-auto sm:px-8 h-12 text-xs sm:text-sm font-semibold tracking-wider uppercase items-center justify-center text-center cursor-pointer"
              >
                Close
              </button>
              <button
                type="submit"
                className="btn-gold-primary w-full flex-1 h-12 text-xs sm:text-sm font-semibold tracking-wider uppercase flex items-center justify-center text-center px-4 sm:px-8 cursor-pointer shadow-lg"
              >
                Continue to Guest Details
              </button>
            </div>
          </form>
        )}

        {/* Step 2: Guest Details */}
        {step === 2 && (
          <form onSubmit={handleNextStep} className="space-y-4">
            <div className="bg-[#211E1B] p-3 rounded-[4px] border border-[#2a2622] flex items-center justify-between text-xs text-[#8B8175]">
              <span>{guests} Guests · {date} at {time}</span>
              <span className="text-[#C9A96E]">{seatingNames[seatingArea]}</span>
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-[#F5F0E8]/80 mb-1 font-medium">
                Full Name *
              </label>
              <input
                type="text"
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                placeholder="e.g. Adeola Johnson"
                className="w-full bg-[#211E1B] border border-[#2a2622] text-[#F5F0E8] text-sm rounded-[4px] px-3 py-2.5 focus:outline-none focus:border-[#C9A96E]"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs uppercase tracking-wider text-[#F5F0E8]/80 mb-1 font-medium">
                  Email Address *
                </label>
                <input
                  type="email"
                  value={guestEmail}
                  onChange={(e) => setGuestEmail(e.target.value)}
                  placeholder="name@domain.com"
                  className="w-full bg-[#211E1B] border border-[#2a2622] text-[#F5F0E8] text-sm rounded-[4px] px-3 py-2.5 focus:outline-none focus:border-[#C9A96E]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-[#F5F0E8]/80 mb-1 font-medium">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  value={guestPhone}
                  onChange={(e) => setGuestPhone(e.target.value)}
                  placeholder="+234 ..."
                  className="w-full bg-[#211E1B] border border-[#2a2622] text-[#F5F0E8] text-sm rounded-[4px] px-3 py-2.5 focus:outline-none focus:border-[#C9A96E]"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-[#F5F0E8]/80 mb-1 font-medium">
                Occasion (Optional)
              </label>
              <select
                value={occasion}
                onChange={(e) => setOccasion(e.target.value)}
                className="w-full bg-[#211E1B] border border-[#2a2622] text-[#F5F0E8] text-sm rounded-[4px] px-3 py-2.5 focus:outline-none focus:border-[#C9A96E]"
              >
                <option value="Dinner">Fine Dining Dinner</option>
                <option value="Anniversary">Anniversary Celebration</option>
                <option value="Birthday">Birthday</option>
                <option value="Business">Executive Business Dinner</option>
                <option value="Tasting">Chef’s Tasting Menu</option>
              </select>
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-[#F5F0E8]/80 mb-1 font-medium">
                Dietary Restrictions or Special Requests
              </label>
              <textarea
                value={specialRequests}
                onChange={(e) => setSpecialRequests(e.target.value)}
                rows={2}
                placeholder="Allergies, preferred table, sommelier pairing requests..."
                className="w-full bg-[#211E1B] border border-[#2a2622] text-[#F5F0E8] text-sm rounded-[4px] px-3 py-2 focus:outline-none focus:border-[#C9A96E]"
              />
            </div>

            {errorMsg && (
              <p className="text-xs text-rose-400 font-medium">{errorMsg}</p>
            )}

            <div className="grid grid-cols-2 gap-3 pt-2 w-full">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="btn-gold-secondary w-full h-12 text-xs sm:text-sm font-semibold tracking-wider uppercase flex items-center justify-center text-center px-2 sm:px-4 cursor-pointer"
              >
                Back
              </button>
              <button
                type="submit"
                className="btn-gold-primary w-full h-12 text-xs sm:text-sm font-semibold tracking-wider uppercase flex items-center justify-center text-center px-2 sm:px-4 cursor-pointer leading-tight"
              >
                Confirm Reservation
              </button>
            </div>
          </form>
        )}

        {/* Step 3: Reservation Ticket Confirmation */}
        {step === 3 && confirmation && (
          <div className="space-y-6 text-center animate-fade-in">
            <div className="inline-flex p-3 rounded-full bg-[#C9A96E]/10 text-[#C9A96E] mb-1">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div className="bg-[#211E1B] border border-[#C9A96E]/30 rounded-[8px] p-6 text-left space-y-4">
              <div className="flex items-center justify-between border-b border-[#2a2622] pb-4">
                <div>
                  <span className="text-[11px] uppercase tracking-wider text-[#8B8175] block">
                    Booking Reference
                  </span>
                  <span className="font-mono text-lg font-bold text-[#C9A96E] tracking-wider">
                    {confirmation.bookingReference}
                  </span>
                </div>
                <button
                  onClick={copyRefCode}
                  className="flex items-center gap-1 text-xs text-[#8B8175] hover:text-[#C9A96E] p-1.5 rounded border border-[#2a2622]"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-[#8B8175] block">Guest Name</span>
                  <span className="text-[#F5F0E8] font-medium">{confirmation.guestName}</span>
                </div>
                <div>
                  <span className="text-[#8B8175] block">Party Size</span>
                  <span className="text-[#F5F0E8] font-medium">{confirmation.guests} Guests</span>
                </div>
                <div>
                  <span className="text-[#8B8175] block">Date & Time</span>
                  <span className="text-[#F5F0E8] font-medium">{confirmation.date} at {confirmation.time}</span>
                </div>
                <div>
                  <span className="text-[#8B8175] block">Atmosphere</span>
                  <span className="text-[#C9A96E] font-medium">{seatingNames[confirmation.seatingArea]}</span>
                </div>
              </div>

              {confirmation.specialRequests && (
                <div className="pt-2 border-t border-[#2a2622] text-xs">
                  <span className="text-[#8B8175] block">Special Notes</span>
                  <span className="text-[#F5F0E8]/80 italic">{confirmation.specialRequests}</span>
                </div>
              )}
            </div>

            <p className="text-xs text-[#8B8175] leading-relaxed">
              A digital confirmation and calendar invitation has been prepared for <strong className="text-[#F5F0E8]">{confirmation.guestEmail}</strong>. Our host will confirm any tailored requirements 24 hours prior.
            </p>

            <button
              onClick={onClose}
              className="btn-gold-primary w-full"
            >
              Done
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
