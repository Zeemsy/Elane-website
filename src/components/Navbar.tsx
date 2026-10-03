import React, { useState, useEffect } from 'react';
import { Menu, X, Calendar } from 'lucide-react';
import { BRAND_INFO } from '../data/restaurantData';

interface NavbarProps {
  onOpenReservation: () => void;
  onOpenAdmin: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenReservation,
  onOpenAdmin,
}) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 40) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { label: 'Our Story', href: '#story' },
    { label: 'Signatures', href: '#signatures' },
    { label: 'Menu', href: '#menu' },
    { label: 'Experience', href: '#experience' },
    { label: 'Gallery', href: '#gallery' },
    { label: 'Contact', href: '#contact' },
  ];

  const handleNavClick = (href: string) => {
    setMobileMenuOpen(false);
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
          isScrolled
            ? 'bg-[#171513]/95 backdrop-blur-md border-b border-[#211E1B] py-4 shadow-lg shadow-black/20'
            : 'bg-transparent py-6'
        }`}
      >
        <div className="max-w-[1200px] mx-auto px-6 md:px-8 flex items-center justify-between">
          {/* Zone 1: Single element wordmark (no descriptor/location subtext) */}
          <a
            href="#"
            className="font-serif text-2xl md:text-3xl tracking-[0.18em] text-[#F5F0E8] hover:text-[#C9A96E] transition-colors"
            title={`${BRAND_INFO.pronunciation} — ${BRAND_INFO.meaning}`}
          >
            {BRAND_INFO.name}
          </a>

          {/* Zone 2: Clean 4-6 text navigation links */}
          <nav className="hidden lg:flex items-center gap-8 text-[14px] font-medium text-[#F5F0E8]/80">
            {navLinks.map((link) => (
              <button
                key={link.label}
                onClick={() => handleNavClick(link.href)}
                className="hover:text-[#C9A96E] transition-colors relative py-1 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-[1px] after:bg-[#C9A96E] hover:after:w-full after:transition-all after:duration-200 cursor-pointer"
              >
                {link.label}
              </button>
            ))}
          </nav>

          {/* Zone 3: Actions (Reserve Table button) */}
          <div className="flex items-center gap-3">
            <button
              onClick={onOpenReservation}
              className="btn-gold-primary whitespace-nowrap text-xs md:text-sm shadow-md"
            >
              Reserve a Table
            </button>

            {/* Mobile menu trigger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-[#F5F0E8] hover:text-[#C9A96E] transition-colors"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-30 bg-[#171513]/98 backdrop-blur-xl flex flex-col justify-between pt-28 pb-12 px-8 lg:hidden animate-fade-in">
          <div className="flex flex-col gap-6">
            <p className="text-xs uppercase tracking-[0.2em] text-[#C9A96E] font-medium">
              Navigation
            </p>
            {navLinks.map((link) => (
              <button
                key={link.label}
                onClick={() => handleNavClick(link.href)}
                className="font-serif text-2xl text-left text-[#F5F0E8] hover:text-[#C9A96E] transition-colors"
              >
                {link.label}
              </button>
            ))}
          </div>

          <div className="flex flex-col gap-4">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenReservation();
              }}
              className="btn-gold-primary w-full"
            >
              <Calendar className="w-4 h-4 mr-2" />
              Reserve a Table
            </button>
            <div className="text-center text-xs text-[#8B8175]">
              <p>{BRAND_INFO.location}</p>
              <p className="mt-1">{BRAND_INFO.hours.dinner}</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
