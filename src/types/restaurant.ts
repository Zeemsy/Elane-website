export interface MenuItem {
  id: string;
  name: string;
  category: 'starters' | 'mains' | 'desserts' | 'drinks';
  description: string;
  priceNaira: number;
  priceUsd: number;
  dietary?: ('V' | 'GF' | 'DF' | 'Chef')[];
  pairing?: string;
  image?: string;
  isSignature?: boolean;
}

export interface DiningExperiencePillar {
  number: string;
  title: string;
  subtitle: string;
  description: string;
  highlight: string;
}

export interface ReservationData {
  date: string;
  time: string;
  guests: number;
  seatingArea: 'dining-room' | 'terrace' | 'cellar' | 'chef-counter';
  occasion?: string;
  specialRequests?: string;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
}

export interface ReservationConfirmation extends ReservationData {
  bookingReference: string;
  createdAt: string;
}
