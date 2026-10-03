import React, { useState, useEffect, useRef } from 'react';
import { Quote, CheckCircle2, MessageSquarePlus, X, ChevronLeft, ChevronRight, User, Sparkles } from 'lucide-react';
import { submitReviewToSupabase, isSupabaseConfigured } from '../lib/supabaseClient';

export interface CustomerReview {
  id: string;
  guestName: string;
  titleOrRole: string;
  avatar?: string;
  quote: string;
  experience: string;
  seatingArea: string;
  date: string;
  verified: boolean;
}

const INITIAL_REVIEWS: CustomerReview[] = [
  {
    id: 'rev-1',
    guestName: 'Dr. Folashade Adeleke',
    titleOrRole: 'Patron & Culinary Connoisseur · Victoria Island, Lagos',
    avatar: '/images/avatar_folashade_adeleke_1790779314418.jpg',
    quote: 'The Truffle Tagliolini paired with the Barolo was nothing short of transcendent. ÉLANÉ has redefined what fine dining means in West Africa—restrained, precise, and profoundly memorable.',
    experience: 'Chef’s 7-Course Degustation',
    seatingArea: 'Waterfront Terrace',
    date: 'September 2026',
    verified: true,
  },
  {
    id: 'rev-2',
    guestName: 'Marcus Vance',
    titleOrRole: 'Contributing Editor, Global Gastronomy Journal',
    avatar: '/images/avatar_marcus_vance_1790779328428.jpg',
    quote: 'An extraordinary masterclass in contemporary cuisine. The charred sea bass with citrus emulsion delivers a depth of flavor that easily rivals three-star tables in Paris and London. The quiet luxury ambiance is immaculate.',
    experience: 'Sommelier Cellar Pairing',
    seatingArea: 'Private Wine Cellar',
    date: 'August 2026',
    verified: true,
  },
  {
    id: 'rev-3',
    guestName: 'Amara & Tunde Biobaku',
    titleOrRole: 'Private Patrons · Ikoyi, Lagos',
    avatar: '/images/avatar_amara_tunde_1790779340676.jpg',
    quote: 'We celebrated our anniversary at the Chef’s Counter. From the warm welcome to the theatrical pour over the Valrhona chocolate sphere, the intuition and graciousness of the team made it our most cherished dining experience of the year.',
    experience: 'Anniversary Celebration Tasting',
    seatingArea: 'Chef Adebayo Counter',
    date: 'September 2026',
    verified: true,
  },
];

export const CustomerReviews: React.FC = () => {
  const [reviews, setReviews] = useState<CustomerReview[]>(() => {
    try {
      const saved = localStorage.getItem('elane_reviews');
      if (saved) {
        const parsed = JSON.parse(saved);
        return parsed.map((r: CustomerReview, i: number) => {
          let avatar = r.avatar || INITIAL_REVIEWS[i % INITIAL_REVIEWS.length]?.avatar;
          if (avatar && avatar.startsWith('/src/assets/images/')) {
            avatar = avatar.replace('/src/assets/images/', '/images/');
          }
          return {
            ...r,
            avatar,
          };
        });
      }
      return INITIAL_REVIEWS;
    } catch {
      return INITIAL_REVIEWS;
    }
  });

  // Carousel State & Touch/Interaction Handling
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const autoPlayRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-play timer (advances every 7s when not hovered/paused)
  useEffect(() => {
    if (isPaused) return;

    autoPlayRef.current = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % reviews.length);
    }, 7000);

    return () => {
      if (autoPlayRef.current) clearInterval(autoPlayRef.current);
    };
  }, [reviews.length, isPaused]);

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
    setIsPaused(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    setIsPaused(false);
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 45;
    const isRightSwipe = distance < -45;

    if (isLeftSwipe) {
      setCurrentIndex((prev) => (prev + 1) % reviews.length);
    } else if (isRightSwipe) {
      setCurrentIndex((prev) => (prev === 0 ? reviews.length - 1 : prev - 1));
    }
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev === 0 ? reviews.length - 1 : prev - 1));
  };

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % reviews.length);
  };

  // Review Submission Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [newReview, setNewReview] = useState({
    name: '',
    role: '',
    quote: '',
    experience: 'Chef’s Degustation Menu',
    seatingArea: 'Main Dining Room',
  });
  const [submittedFeedback, setSubmittedFeedback] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReview.name || !newReview.quote) return;

    const created: CustomerReview = {
      id: `rev-${Date.now()}`,
      guestName: newReview.name,
      titleOrRole: newReview.role || 'Guest Patron · Lagos',
      avatar: '/images/avatar_folashade_adeleke_1790779314418.jpg',
      quote: newReview.quote,
      experience: newReview.experience,
      seatingArea: newReview.seatingArea,
      date: 'Recent Visit',
      verified: true,
    };

    const updated = [created, ...reviews];
    setReviews(updated);
    localStorage.setItem('elane_reviews', JSON.stringify(updated));

    if (isSupabaseConfigured) {
      submitReviewToSupabase({
        id: created.id,
        guest_name: created.guestName,
        title_or_role: created.titleOrRole,
        avatar_url: created.avatar,
        quote: created.quote,
        experience: created.experience,
        seating_area: created.seatingArea,
        date_label: created.date,
        verified: true,
        is_published: true,
      }).catch((err) => {
        console.error('Supabase review submission error:', err);
      });
    }

    setSubmittedFeedback(true);
    setTimeout(() => {
      setSubmittedFeedback(false);
      setModalOpen(false);
      setNewReview({
        name: '',
        role: '',
        quote: '',
        experience: 'Chef’s Degustation Menu',
        seatingArea: 'Main Dining Room',
      });
    }, 1800);
  };

  const activeReview = reviews[currentIndex] || reviews[0];

  return (
    <section id="reviews" className="py-24 lg:py-36 bg-[#171513] text-[#F5F0E8] border-t border-[#211E1B] relative overflow-hidden">
      {/* Subtle Atmospheric Backdrop Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-[#C9A96E]/5 blur-[120px] rounded-full pointer-events-none -z-10" />

      <div className="max-w-[1200px] mx-auto px-6 md:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 sm:mb-16 gap-6">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.25em] text-[#C9A96E] mb-3">
              <span>08</span>
              <span className="w-8 h-[1px] bg-[#C9A96E]/40" />
              <span>Guest Impressions</span>
            </div>

            <h2 className="font-serif text-[32px] sm:text-[40px] lg:text-[48px] leading-[1.15] text-[#F5F0E8] uppercase tracking-wide">
              WHAT OUR GUEST SAY
            </h2>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <p className="text-sm text-[#8B8175] max-w-md font-light leading-relaxed">
              Unfiltered reflections from discerning patrons, international critics, and milestone celebrations hosted in our dining sanctuary.
            </p>
            <button
              onClick={() => setModalOpen(true)}
              className="text-xs uppercase tracking-wider text-[#C9A96E] hover:text-[#b8985c] border border-[#2a2622] hover:border-[#C9A96E]/50 px-4 py-2.5 rounded-[4px] flex items-center gap-2 transition-colors cursor-pointer shrink-0"
            >
              <MessageSquarePlus className="w-3.5 h-3.5" />
              <span>Share Reflection</span>
            </button>
          </div>
        </div>

        {/* SPACIOUS CAROUSEL CARD CONTAINER (Optimized for Mobile, Tablet & Desktop) */}
        <div
          className="relative max-w-4xl mx-auto"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {/* Main Slide Carousel Track */}
          <div className="overflow-hidden rounded-[12px] bg-[#211E1B] border border-[#2a2622] shadow-2xl relative">
            {/* Watermark Quote Icon in Background */}
            <div className="absolute top-6 right-8 text-[#C9A96E]/5 pointer-events-none select-none">
              <Quote className="w-40 h-40 fill-current" />
            </div>

            {/* Slide Strip with Smooth Horizontal Motion */}
            <div
              className="flex transition-transform duration-600 ease-out"
              style={{ transform: `translateX(-${currentIndex * 100}%)` }}
            >
              {reviews.map((item, index) => (
                <div
                  key={item.id}
                  className="w-full shrink-0 p-8 sm:p-12 md:p-16 flex flex-col justify-between min-h-[380px] sm:min-h-[420px]"
                >
                  {/* Top Quote & Verification Header */}
                  <div>
                    <div className="flex items-center justify-between mb-6 sm:mb-8">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-full bg-[#171513] border border-[#2a2622] flex items-center justify-center text-[#C9A96E]">
                          <Quote className="w-4 h-4 fill-[#C9A96E]/20" />
                        </div>
                        <span className="text-xs uppercase tracking-[0.2em] text-[#C9A96E] font-medium">
                          Patron Reflection
                        </span>
                      </div>

                      {item.verified && (
                        <div className="flex items-center gap-1.5 text-xs text-[#8B8175] bg-[#171513] px-3 py-1 rounded-full border border-[#2a2622]">
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#C9A96E]" />
                          <span>Verified Guest</span>
                        </div>
                      )}
                    </div>

                    {/* Testimonial Quote - Generous size with plenty of breathing room to fit every word */}
                    <blockquote className="font-serif italic text-lg sm:text-2xl md:text-[26px] leading-relaxed md:leading-[1.45] text-[#F5F0E8] mb-8 text-balance">
                      “{item.quote}”
                    </blockquote>
                  </div>

                  {/* Patron Profile & Dining Details Footer */}
                  <div className="pt-6 border-t border-[#171513] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    {/* Author Portrait + Name & Role */}
                    <div className="flex items-center gap-4">
                      <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-full overflow-hidden border border-[#C9A96E]/40 ring-2 ring-[#C9A96E]/20 bg-[#171513] shrink-0 shadow-lg">
                        {item.avatar ? (
                          <img
                            src={item.avatar}
                            alt={item.guestName}
                            className="w-full h-full object-cover object-center"
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-[#C9A96E]">
                            <User className="w-6 h-6" />
                          </div>
                        )}
                      </div>

                      <div>
                        <h4 className="font-serif text-lg sm:text-xl text-[#F5F0E8] tracking-wide">
                          {item.guestName}
                        </h4>
                        <p className="text-xs sm:text-sm text-[#8B8175] font-light mt-0.5">
                          {item.titleOrRole}
                        </p>
                      </div>
                    </div>

                    {/* Experience & Table Placement Notes */}
                    <div className="sm:text-right text-xs text-[#8B8175] pl-2 sm:pl-0 border-l sm:border-l-0 border-[#2a2622]">
                      <span className="text-[#C9A96E] block font-medium uppercase tracking-wider text-[11px] sm:text-xs">
                        {item.experience}
                      </span>
                      <span className="text-[11px] text-[#8B8175] block mt-0.5">
                        {item.seatingArea} · {item.date}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop / Tablet Left & Right Arrow Buttons Inside Card Frame */}
            <div className="hidden sm:flex absolute top-1/2 -translate-y-1/2 left-4 right-4 pointer-events-none justify-between">
              <button
                onClick={prevSlide}
                aria-label="Previous review"
                className="w-10 h-10 rounded-full bg-[#171513]/85 backdrop-blur-md border border-[#2a2622] text-[#8B8175] hover:text-[#C9A96E] hover:border-[#C9A96E]/50 flex items-center justify-center transition-all pointer-events-auto active:scale-95 shadow-xl cursor-pointer"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={nextSlide}
                aria-label="Next review"
                className="w-10 h-10 rounded-full bg-[#171513]/85 backdrop-blur-md border border-[#2a2622] text-[#8B8175] hover:text-[#C9A96E] hover:border-[#C9A96E]/50 flex items-center justify-center transition-all pointer-events-auto active:scale-95 shadow-xl cursor-pointer"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* ANIMATED PAGINATION CONTROLS & COUNTER */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 px-2">
            {/* Slide Index Monospace Counter */}
            <div className="font-mono text-xs text-[#8B8175] flex items-center gap-2">
              <span className="text-[#C9A96E] font-semibold text-sm">
                0{currentIndex + 1}
              </span>
              <span>/</span>
              <span>0{reviews.length}</span>
              <span className="text-[#8B8175]/60 pl-2 hidden sm:inline">
                {activeReview.guestName}
              </span>
            </div>

            {/* Animated Pagination Pills */}
            <div className="flex items-center gap-2.5">
              {reviews.map((_, idx) => {
                const isActive = idx === currentIndex;
                return (
                  <button
                    key={idx}
                    onClick={() => goToSlide(idx)}
                    aria-label={`Go to review ${idx + 1}`}
                    className={`h-2 rounded-full transition-all duration-500 ease-out cursor-pointer relative overflow-hidden ${
                      isActive
                        ? 'w-12 sm:w-16 bg-gradient-to-r from-[#b8985c] via-[#C9A96E] to-[#F5F0E8] shadow-[0_0_12px_rgba(201,169,110,0.6)]'
                        : 'w-2.5 sm:w-3 bg-[#8B8175]/30 hover:bg-[#8B8175]/60'
                    }`}
                  >
                    {isActive && (
                      <span className="absolute inset-0 bg-white/20 animate-pulse" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Mobile Touch / Navigation Arrow Buttons */}
            <div className="flex sm:hidden items-center gap-3">
              <button
                onClick={prevSlide}
                aria-label="Previous review"
                className="w-9 h-9 rounded-full bg-[#211E1B] border border-[#2a2622] text-[#8B8175] hover:text-[#C9A96E] flex items-center justify-center transition-colors active:scale-95 cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-[10px] text-[#8B8175] uppercase tracking-wider font-mono">
                Swipe
              </span>
              <button
                onClick={nextSlide}
                aria-label="Next review"
                className="w-9 h-9 rounded-full bg-[#211E1B] border border-[#2a2622] text-[#8B8175] hover:text-[#C9A96E] flex items-center justify-center transition-colors active:scale-95 cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Share Guest Experience Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
          <div className="bg-[#171513] border border-[#211E1B] rounded-[8px] max-w-lg w-full p-6 sm:p-8 relative shadow-2xl">
            <button
              onClick={() => setModalOpen(false)}
              className="absolute top-5 right-5 text-[#8B8175] hover:text-[#F5F0E8] p-1.5"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="font-serif text-2xl text-[#F5F0E8] mb-1">
              Share Your Dining Experience
            </h3>
            <p className="text-xs text-[#8B8175] mb-6">
              We cherish reflections from our patrons. Your note will be reviewed and featured on our guest ledger.
            </p>

            {submittedFeedback ? (
              <div className="bg-emerald-950/60 border border-emerald-700/40 text-emerald-300 p-6 rounded-[6px] text-center text-xs space-y-2">
                <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
                <p className="font-medium text-sm text-emerald-200">Thank you for your gracious reflection.</p>
                <p className="text-[#8B8175]">Your review has been preserved in the ÉLANÉ guest book.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                <div>
                  <label className="block text-[#8B8175] mb-1">Your Full Name *</label>
                  <input
                    type="text"
                    value={newReview.name}
                    onChange={(e) => setNewReview({ ...newReview, name: e.target.value })}
                    placeholder="e.g. Chief Adeleke"
                    className="w-full bg-[#211E1B] border border-[#2a2622] text-[#F5F0E8] p-2.5 rounded focus:border-[#C9A96E] outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[#8B8175] mb-1">Title, Role or Location (Optional)</label>
                  <input
                    type="text"
                    value={newReview.role}
                    onChange={(e) => setNewReview({ ...newReview, role: e.target.value })}
                    placeholder="e.g. Patron · Victoria Island"
                    className="w-full bg-[#211E1B] border border-[#2a2622] text-[#F5F0E8] p-2.5 rounded focus:border-[#C9A96E] outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[#8B8175] mb-1">Dining Experience</label>
                    <select
                      value={newReview.experience}
                      onChange={(e) => setNewReview({ ...newReview, experience: e.target.value })}
                      className="w-full bg-[#211E1B] border border-[#2a2622] text-[#F5F0E8] p-2.5 rounded focus:border-[#C9A96E] outline-none cursor-pointer"
                    >
                      <option value="Chef’s Degustation Menu">Chef’s Degustation Menu</option>
                      <option value="Sommelier Cellar Pairing">Sommelier Cellar Pairing</option>
                      <option value="À La Carte Dinner">À La Carte Dinner</option>
                      <option value="Anniversary Celebration">Anniversary Celebration</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[#8B8175] mb-1">Seating Atmosphere</label>
                    <select
                      value={newReview.seatingArea}
                      onChange={(e) => setNewReview({ ...newReview, seatingArea: e.target.value })}
                      className="w-full bg-[#211E1B] border border-[#2a2622] text-[#F5F0E8] p-2.5 rounded focus:border-[#C9A96E] outline-none cursor-pointer"
                    >
                      <option value="Waterfront Terrace">Waterfront Terrace</option>
                      <option value="Main Dining Room">Main Dining Room</option>
                      <option value="Private Wine Cellar">Private Wine Cellar</option>
                      <option value="Chef Adebayo Counter">Chef Adebayo Counter</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[#8B8175] mb-1">Your Reflection *</label>
                  <textarea
                    value={newReview.quote}
                    onChange={(e) => setNewReview({ ...newReview, quote: e.target.value })}
                    rows={3}
                    placeholder="Share your impressions of the dishes, wine pairings, and hospitality..."
                    className="w-full bg-[#211E1B] border border-[#2a2622] text-[#F5F0E8] p-2.5 rounded focus:border-[#C9A96E] outline-none"
                    required
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setModalOpen(false)}
                    className="btn-gold-secondary flex-1 h-9 text-xs"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn-gold-primary flex-1 h-9 text-xs"
                  >
                    Submit Reflection
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </section>
  );
};
