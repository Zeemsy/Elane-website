/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { Introduction } from './components/Introduction';
import { SignatureDishes } from './components/SignatureDishes';
import { OurStory } from './components/OurStory';
import { MenuSection } from './components/MenuSection';
import { Experience } from './components/Experience';
import { GallerySection } from './components/GallerySection';
import { CustomerReviews } from './components/CustomerReviews';
import { ReservationSection } from './components/ReservationSection';
import { Footer } from './components/Footer';
import { ReservationModal } from './components/ReservationModal';
import { ScrollProgress } from './components/ScrollProgress';
import { AdminDashboard } from './components/AdminDashboard';
import { Calendar } from 'lucide-react';
import { MenuItem, ReservationConfirmation } from './types/restaurant';
import { FULL_MENU } from './data/restaurantData';

export default function App() {
  const [isReservationOpen, setIsReservationOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [currency, setCurrency] = useState<'NGN' | 'USD'>('NGN');

  // Dynamic Menu Items (persisted in localStorage)
  const [menuItems, setMenuItems] = useState<MenuItem[]>(() => {
    try {
      const saved = localStorage.getItem('elane_menu');
      if (!saved) return FULL_MENU;
      const parsed = JSON.parse(saved);
      return parsed.map((item: MenuItem) => {
        let image = item.image;
        if (image && image.startsWith('/src/assets/images/')) {
          image = image.replace('/src/assets/images/', '/images/');
        }
        return { ...item, image };
      });
    } catch {
      return FULL_MENU;
    }
  });

  // Dynamic Reservations (persisted in localStorage)
  const [reservations, setReservations] = useState<ReservationConfirmation[]>(() => {
    try {
      const saved = localStorage.getItem('elane_reservations');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const handleUpdateMenu = (updated: MenuItem[]) => {
    setMenuItems(updated);
  };

  const handleUpdateReservations = (updated: ReservationConfirmation[]) => {
    setReservations(updated);
    localStorage.setItem('elane_reservations', JSON.stringify(updated));
  };

  const handleAddReservation = (newRes: ReservationConfirmation) => {
    const updated = [newRes, ...reservations];
    setReservations(updated);
    localStorage.setItem('elane_reservations', JSON.stringify(updated));
  };

  const scrollToMenu = () => {
    const el = document.getElementById('menu');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const toggleCurrency = () => {
    setCurrency((prev) => (prev === 'NGN' ? 'USD' : 'NGN'));
  };

  // Staff keyboard shortcut: Alt+A or Ctrl+Shift+A
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'a') || (e.altKey && e.key.toLowerCase() === 'a')) {
        e.preventDefault();
        setIsAdminOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="min-h-screen bg-[#171513] text-[#F5F0E8] relative selection:bg-[#C9A96E] selection:text-[#171513]">
      {/* Editorial Scroll Progress Bar */}
      <ScrollProgress />

      {/* Top Bar Navigation */}
      <Navbar
        onOpenReservation={() => setIsReservationOpen(true)}
        onOpenAdmin={() => setIsAdminOpen(true)}
      />

      {/* 01 — Hero Section */}
      <Hero
        onOpenReservation={() => setIsReservationOpen(true)}
        onExploreMenu={scrollToMenu}
      />

      {/* 02 — Introduction Section */}
      <Introduction />

      {/* 03 — Signature Dishes Cards */}
      <SignatureDishes
        currency={currency}
        onExploreFullMenu={scrollToMenu}
      />

      {/* 04 — Our Story Section (Chef dishing food on the right side) */}
      <OurStory />

      {/* 05 — Menu Section (Each dish with clear photo matching its respective name) */}
      <MenuSection
        currency={currency}
        onToggleCurrency={toggleCurrency}
        onOpenReservation={() => setIsReservationOpen(true)}
        menuItems={menuItems}
      />

      {/* 06 — Dining Experience Features */}
      <Experience />

      {/* 07 — Gallery Section (Asymmetric grid) */}
      <GallerySection />

      {/* 08 — Customer Reviews ("WHAT OUR GUEST SAY") */}
      <CustomerReviews />

      {/* 09 — Reservation CTA Section */}
      <ReservationSection
        onOpenReservation={() => setIsReservationOpen(true)}
      />

      {/* 09 — Footer */}
      <Footer
        onOpenReservation={() => setIsReservationOpen(true)}
        onOpenAdmin={() => setIsAdminOpen(true)}
      />

      {/* Interactive Reservation Modal & Booking Engine */}
      <ReservationModal
        isOpen={isReservationOpen}
        onClose={() => setIsReservationOpen(false)}
        onAddReservation={handleAddReservation}
      />

      {/* Admin Dashboard: Image Studio, Base64 conversion, Menu & Reservation management */}
      <AdminDashboard
        isOpen={isAdminOpen}
        onClose={() => setIsAdminOpen(false)}
        menuItems={menuItems}
        onUpdateMenu={handleUpdateMenu}
        reservations={reservations}
        onUpdateReservations={handleUpdateReservations}
      />

      {/* Floating Reservation Quick-Access Button (Bottom Right) */}
      <aside aria-label="Reservation quick action" className="fixed bottom-6 right-6 z-40">
        <button
          onClick={() => setIsReservationOpen(true)}
          className="bg-[#C9A96E] text-[#171513] hover:bg-[#b8985c] px-4 py-2.5 rounded-full text-xs font-semibold flex items-center gap-2 shadow-2xl transition-all cursor-pointer"
        >
          <Calendar className="w-3.5 h-3.5" />
          <span>Book Table</span>
        </button>
      </aside>
    </div>
  );
}
