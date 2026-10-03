import { createClient, SupabaseClient } from '@supabase/supabase-js';

/**
 * Sanitizes Supabase URL to origin format (e.g. strips /rest/v1 or trailing slashes)
 * Supabase client requires the base project domain like 'https://xyz.supabase.co'
 */
export function sanitizeSupabaseUrl(raw: string): string {
  if (!raw) return '';
  let url = raw.trim();
  // Strip trailing /rest/v1 or /rest/v1/ or any trailing slashes
  url = url.replace(/\/rest\/v1\/?$/i, '').replace(/\/+$/, '');
  return url;
}

// 1. Initial URL and Anon Key from environment, localStorage, or user's project defaults
const DEFAULT_URL = 'https://gzltxtqxtblzyjusgzuu.supabase.co';
const DEFAULT_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd6bHR4dHF4dGJsenlqdXNnenV1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA3OTQwNTksImV4cCI6MjEwNjM3MDA1OX0.z29VPYVXzsAuaI1Ebj_ymTIusGHltHE0nt00PfCj0WA';

export function getStoredSupabaseConfig() {
  const envUrl = import.meta.env.VITE_SUPABASE_URL || '';
  const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

  const localUrl = typeof window !== 'undefined' ? localStorage.getItem('elane_supabase_url') : null;
  const localKey = typeof window !== 'undefined' ? localStorage.getItem('elane_supabase_anon_key') : null;

  const rawUrl = localUrl || envUrl || DEFAULT_URL;
  const sanitizedUrl = sanitizeSupabaseUrl(rawUrl);
  const anonKey = localKey || envKey || DEFAULT_ANON_KEY;

  return {
    rawUrl,
    url: sanitizedUrl,
    anonKey,
    isConfigured: Boolean(sanitizedUrl && anonKey && !anonKey.includes('your-anon-public-key')),
  };
}

const initialConfig = getStoredSupabaseConfig();

export let isSupabaseConfigured = initialConfig.isConfigured;

export let supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(initialConfig.url, initialConfig.anonKey)
  : null;

/**
 * Update Supabase client credentials dynamically at runtime
 */
export function updateSupabaseConfig(rawUrl: string, anonKey: string) {
  const cleanUrl = sanitizeSupabaseUrl(rawUrl);
  if (typeof window !== 'undefined') {
    localStorage.setItem('elane_supabase_url', cleanUrl);
    localStorage.setItem('elane_supabase_anon_key', anonKey);
  }

  isSupabaseConfigured = Boolean(cleanUrl && anonKey && !anonKey.includes('your-anon-public-key'));
  supabase = isSupabaseConfigured ? createClient(cleanUrl, anonKey) : null;

  return {
    cleanUrl,
    isConfigured: isSupabaseConfigured,
  };
}

// ==============================================================================
// Database Helper Types & Functions
// ==============================================================================

export interface DbMenuItem {
  id: string;
  name: string;
  category: 'starters' | 'mains' | 'desserts' | 'drinks';
  description: string;
  price_naira: number;
  price_usd: number;
  dietary?: string[];
  pairing?: string;
  image_url?: string;
  is_signature?: boolean;
  is_available?: boolean;
  sort_order?: number;
}

export interface DbReservation {
  id?: string;
  booking_reference?: string;
  guest_name: string;
  guest_email: string;
  guest_phone: string;
  guests_count: number;
  seating_area: 'dining-room' | 'terrace' | 'cellar' | 'chef-counter';
  occasion?: string;
  special_requests?: string;
  reservation_date: string;
  reservation_time: string;
  status?: string;
}

export interface DbCustomerReview {
  id: string;
  guest_name: string;
  title_or_role: string;
  avatar_url?: string;
  quote: string;
  experience?: string;
  seating_area?: string;
  date_label?: string;
  rating?: number;
  verified?: boolean;
  is_published?: boolean;
}

/**
 * Fetch all available menu items from Supabase
 */
export async function getMenuItemsFromSupabase() {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from('menu_items')
    .select('*')
    .eq('is_available', true)
    .order('sort_order', { ascending: true });

  if (error) {
    console.error('Error fetching menu items from Supabase:', error);
    return null;
  }
  return data;
}

/**
 * Submit a reservation to Supabase
 */
export async function createReservationInSupabase(reservation: DbReservation) {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from('reservations')
    .insert([reservation])
    .select()
    .single();

  if (error) {
    console.error('Error creating reservation in Supabase:', error);
    throw error;
  }
  return data;
}

/**
 * Fetch published customer reviews from Supabase
 */
export async function getCustomerReviewsFromSupabase() {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from('customer_reviews')
    .select('*')
    .eq('is_published', true)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching customer reviews from Supabase:', error);
    return null;
  }
  return data;
}

/**
 * Submit a new patron reflection to Supabase
 */
export async function submitReviewToSupabase(review: DbCustomerReview) {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from('customer_reviews')
    .insert([review])
    .select()
    .single();

  if (error) {
    console.error('Error submitting review to Supabase:', error);
    throw error;
  }
  return data;
}
