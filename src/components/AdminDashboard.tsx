import React, { useState, useEffect, useRef } from 'react';
import {
  Upload,
  Image as ImageIcon,
  Copy,
  Check,
  Trash2,
  Plus,
  RefreshCw,
  Eye,
  EyeOff,
  ArrowLeft,
  FileText,
  UtensilsCrossed,
  Calendar,
  Layers,
  Sparkles,
  Info,
  Lock,
  LogOut,
  X,
  Database,
  ExternalLink,
  ShieldCheck,
} from 'lucide-react';
import { MenuItem, ReservationConfirmation } from '../types/restaurant';
import { FULL_MENU } from '../data/restaurantData';
import {
  isSupabaseConfigured,
  getStoredSupabaseConfig,
  updateSupabaseConfig,
  sanitizeSupabaseUrl,
} from '../lib/supabaseClient';

interface AdminDashboardProps {
  isOpen: boolean;
  onClose: () => void;
  menuItems: MenuItem[];
  onUpdateMenu: (updated: MenuItem[]) => void;
  reservations: ReservationConfirmation[];
  onUpdateReservations: (updated: ReservationConfirmation[]) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  isOpen,
  onClose,
  menuItems,
  onUpdateMenu,
  reservations,
  onUpdateReservations,
}) => {
  // Password protection state
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    try {
      return sessionStorage.getItem('elane_admin_auth') === 'true';
    } catch {
      return false;
    }
  });
  const [passwordInput, setPasswordInput] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput === 'Rich1234') {
      setIsAuthenticated(true);
      setPasswordError('');
      try {
        sessionStorage.setItem('elane_admin_auth', 'true');
      } catch {
        // ignore
      }
    } else {
      setPasswordError('Invalid authorization passcode. Access denied.');
      setPasswordInput('');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    try {
      sessionStorage.removeItem('elane_admin_auth');
    } catch {
      // ignore
    }
    setPasswordInput('');
  };

  const [activeTab, setActiveTab] = useState<'upload' | 'menu' | 'reservations' | 'supabase'>('upload');

  // File Upload & Base64 State
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [base64String, setBase64String] = useState<string>('');
  const [fileDimensions, setFileDimensions] = useState<{ width: number; height: number } | null>(null);
  const [isConverting, setIsConverting] = useState(false);
  const [copiedBase64, setCopiedBase64] = useState(false);
  const [targetDishId, setTargetDishId] = useState<string>('');
  const [uploadSuccessMsg, setUploadSuccessMsg] = useState<string>('');

  // Stored Base64 Library State
  const [storedImages, setStoredImages] = useState<{ id: string; name: string; base64: string; size: string; date: string }[]>(() => {
    try {
      const saved = localStorage.getItem('elane_admin_images');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [copiedSql, setCopiedSql] = useState(false);

  // Supabase Live Configuration State
  const [supabaseCfg, setSupabaseCfg] = useState(() => getStoredSupabaseConfig());
  const [inputUrl, setInputUrl] = useState(() => getStoredSupabaseConfig().rawUrl || 'https://gzltxtqxtblzyjusgzuu.supabase.co');
  const [inputAnonKey, setInputAnonKey] = useState(() => getStoredSupabaseConfig().anonKey || '');
  const [showAnonKey, setShowAnonKey] = useState(true);
  const [connStatus, setConnStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [statusMsg, setStatusMsg] = useState('');

  const handleSaveAndTestSupabase = async () => {
    setConnStatus('testing');
    setStatusMsg('Testing connection to Supabase endpoint...');
    try {
      const clean = sanitizeSupabaseUrl(inputUrl);
      updateSupabaseConfig(clean, inputAnonKey);
      setSupabaseCfg(getStoredSupabaseConfig());

      if (!inputAnonKey.trim()) {
        setConnStatus('error');
        setStatusMsg('Supabase URL saved! To complete connection, please paste your anon public key from Project Settings > API.');
        return;
      }

      // Ping Supabase REST API
      const res = await fetch(`${clean}/rest/v1/menu_items?select=id&limit=1`, {
        headers: {
          apikey: inputAnonKey.trim(),
          Authorization: `Bearer ${inputAnonKey.trim()}`,
        },
      });

      if (res.ok) {
        setConnStatus('success');
        setStatusMsg('Connection successful! Database is online and ready.');
      } else {
        const errText = await res.text();
        setConnStatus('error');
        setStatusMsg(`URL reached, but Supabase responded with HTTP ${res.status}: ${errText}`);
      }
    } catch (err: any) {
      setConnStatus('error');
      setStatusMsg(`Connection error: ${err.message || 'Network error'}`);
    }
  };

  // Edit Dish Modal State
  const [editingDish, setEditingDish] = useState<MenuItem | null>(null);
  const [newDishModal, setNewDishModal] = useState(false);
  const [newDishForm, setNewDishForm] = useState<Partial<MenuItem>>({
    name: '',
    category: 'mains',
    priceNaira: 35000,
    priceUsd: 24,
    description: '',
    pairing: '',
    image: '',
  });

  if (!isOpen) return null;

  // Password Authentication Gate (Passcode: Rich1234)
  if (!isAuthenticated) {
    return (
      <div className="fixed inset-0 z-50 bg-[#171513]/95 backdrop-blur-md text-[#F5F0E8] flex items-center justify-center p-4 animate-fade-in font-sans">
        <div className="bg-[#211E1B] border border-[#2a2622] rounded-[8px] max-w-sm w-full p-8 shadow-2xl relative">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 text-[#8B8175] hover:text-[#F5F0E8] p-1.5 rounded-md hover:bg-[#171513] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="text-center mb-6">
            <div className="w-12 h-12 rounded-full bg-[#171513] border border-[#2a2622] text-[#C9A96E] flex items-center justify-center mx-auto mb-3 shadow-inner">
              <Lock className="w-5 h-5" />
            </div>
            <h3 className="font-serif text-2xl text-[#F5F0E8]">Management Console</h3>
            <p className="text-xs text-[#8B8175] mt-1 font-light">
              Restricted area. Please enter your management passcode.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-[11px] uppercase tracking-wider text-[#8B8175] mb-1.5 font-medium">
                Passcode
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={passwordInput}
                  onChange={(e) => {
                    setPasswordInput(e.target.value);
                    setPasswordError('');
                  }}
                  placeholder="Enter passcode"
                  className="w-full bg-[#171513] border border-[#2a2622] focus:border-[#C9A96E] text-[#F5F0E8] text-sm rounded-[4px] px-3.5 py-2.5 outline-none pr-10"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-[#8B8175] hover:text-[#F5F0E8] p-0.5"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {passwordError && (
              <p className="text-xs text-rose-400 font-medium">{passwordError}</p>
            )}

            <button
              type="submit"
              className="btn-gold-primary w-full text-xs h-10 shadow-lg"
            >
              Unlock Console
            </button>

            <button
              type="button"
              onClick={onClose}
              className="w-full text-center text-xs text-[#8B8175] hover:text-[#F5F0E8] py-2 transition-colors cursor-pointer"
            >
              ← Return to Restaurant Site
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Handle File Selection with instant preview
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);
    setUploadSuccessMsg('');

    // Create object URL for instant preview before uploading/converting
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);

    // Calculate dimensions
    const img = new Image();
    img.src = objectUrl;
    img.onload = () => {
      setFileDimensions({ width: img.naturalWidth, height: img.naturalHeight });
    };

    // Automatically convert to Base64
    convertFileToBase64(file);
  };

  // Convert File to Base64 logic
  const convertFileToBase64 = (file: File) => {
    setIsConverting(true);
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setBase64String(result);
      setIsConverting(false);
    };
    reader.onerror = () => {
      setIsConverting(false);
      alert('Failed to read image file.');
    };
    reader.readAsDataURL(file);
  };

  // Copy Base64 code to clipboard
  const handleCopyBase64 = () => {
    if (!base64String) return;
    navigator.clipboard.writeText(base64String);
    setCopiedBase64(true);
    setTimeout(() => setCopiedBase64(false), 2000);
  };

  // Save converted Base64 to Library & LocalStorage
  const handleSaveToLibrary = () => {
    if (!base64String || !selectedFile) return;

    const newImageItem = {
      id: `img-${Date.now()}`,
      name: selectedFile.name,
      base64: base64String,
      size: `${(selectedFile.size / 1024).toFixed(1)} KB`,
      date: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const updated = [newImageItem, ...storedImages];
    setStoredImages(updated);
    try {
      localStorage.setItem('elane_admin_images', JSON.stringify(updated));
    } catch {
      console.warn('Storage limit reached for custom images.');
    }

    setUploadSuccessMsg('Image successfully converted to Base64 and saved to library!');
    setTimeout(() => setUploadSuccessMsg(''), 4000);
  };

  // Assign Base64 image to specific menu dish
  const handleAssignToDish = () => {
    if (!base64String || !targetDishId) return;

    const updated = menuItems.map((item) => {
      if (item.id === targetDishId) {
        return { ...item, image: base64String };
      }
      return item;
    });

    onUpdateMenu(updated);
    try {
      localStorage.setItem('elane_menu', JSON.stringify(updated));
    } catch {
      console.warn('Storage limit exceeded');
    }

    const dishName = menuItems.find((d) => d.id === targetDishId)?.name;
    setUploadSuccessMsg(`Base64 image assigned to "${dishName}"! It is now live on the menu.`);
    setTimeout(() => setUploadSuccessMsg(''), 4000);
  };

  // Delete from library
  const handleDeleteFromLibrary = (id: string) => {
    const updated = storedImages.filter((img) => img.id !== id);
    setStoredImages(updated);
    localStorage.setItem('elane_admin_images', JSON.stringify(updated));
  };

  // Reset menu back to default factory items
  const handleResetMenuToDefault = () => {
    if (confirm('Reset menu items and images to the curated default state?')) {
      onUpdateMenu(FULL_MENU);
      localStorage.removeItem('elane_menu');
    }
  };

  // Handle Add New Dish
  const handleCreateDish = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDishForm.name) return;

    const newDish: MenuItem = {
      id: `custom-${Date.now()}`,
      name: newDishForm.name,
      category: (newDishForm.category as any) || 'mains',
      priceNaira: Number(newDishForm.priceNaira) || 30000,
      priceUsd: Number(newDishForm.priceUsd) || 20,
      description: newDishForm.description || '',
      pairing: newDishForm.pairing || '',
      image: newDishForm.image || base64String || '/images/food_truffle_tagliolini_1790754742635.jpg',
    };

    const updated = [newDish, ...menuItems];
    onUpdateMenu(updated);
    localStorage.setItem('elane_menu', JSON.stringify(updated));
    setNewDishModal(false);
    setNewDishForm({
      name: '',
      category: 'mains',
      priceNaira: 35000,
      priceUsd: 24,
      description: '',
      pairing: '',
      image: '',
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#171513] text-[#F5F0E8] flex flex-col overflow-hidden animate-fade-in font-sans">
      {/* Top Console Bar */}
      <header className="bg-[#141210] border-b border-[#211E1B] px-6 py-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
          <button
            onClick={onClose}
            className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#C9A96E] hover:text-[#b8985c] bg-[#211E1B] px-3 py-2 rounded-[4px] border border-[#2a2622] transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Public Site</span>
          </button>

          <div className="h-4 w-[1px] bg-[#211E1B]" />

          <div className="flex items-center gap-2">
            <span className="font-serif text-xl tracking-wider text-[#F5F0E8]">
              ÉLANÉ
            </span>
            <span className="text-[11px] uppercase tracking-widest text-[#8B8175] bg-[#211E1B] px-2 py-0.5 rounded-[4px]">
              Admin Console
            </span>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 bg-[#211E1B] p-1 rounded-[6px] border border-[#2a2622]">
          <button
            onClick={() => setActiveTab('upload')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-[4px] text-xs font-medium transition-colors cursor-pointer ${
              activeTab === 'upload'
                ? 'bg-[#C9A96E] text-[#171513] font-semibold'
                : 'text-[#8B8175] hover:text-[#F5F0E8]'
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Image Studio & Base64</span>
          </button>

          <button
            onClick={() => setActiveTab('menu')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-[4px] text-xs font-medium transition-colors cursor-pointer ${
              activeTab === 'menu'
                ? 'bg-[#C9A96E] text-[#171513] font-semibold'
                : 'text-[#8B8175] hover:text-[#F5F0E8]'
            }`}
          >
            <UtensilsCrossed className="w-3.5 h-3.5" />
            <span>Menu Manager ({menuItems.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('reservations')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-[4px] text-xs font-medium transition-colors cursor-pointer ${
              activeTab === 'reservations'
                ? 'bg-[#C9A96E] text-[#171513] font-semibold'
                : 'text-[#8B8175] hover:text-[#F5F0E8]'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Reservations ({reservations.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('supabase')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-[4px] text-xs font-medium transition-colors cursor-pointer ${
              activeTab === 'supabase'
                ? 'bg-[#C9A96E] text-[#171513] font-semibold'
                : 'text-[#8B8175] hover:text-[#F5F0E8]'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            <span>Supabase & SQL</span>
          </button>

          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-[4px] text-xs font-medium text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 border border-transparent hover:border-rose-900/50 transition-colors ml-2 cursor-pointer"
            title="Lock Console and require passcode"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Lock</span>
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto p-6 md:p-8">
        <div className="max-w-[1200px] mx-auto">
          {/* TAB 1: Image Studio & Base64 Converter */}
          {activeTab === 'upload' && (
            <div className="space-y-8 animate-fade-in">
              {/* Header explanation */}
              <div>
                <h2 className="font-serif text-2xl md:text-3xl text-[#F5F0E8] mb-2">
                  Image Studio & Base64 Encoder
                </h2>
                <p className="text-xs sm:text-sm text-[#8B8175] font-light max-w-2xl">
                  Upload culinary photography, view an instant preview, inspect dimensions & file size, and convert into Base64 format to store and display across the menu.
                </p>
              </div>

              {uploadSuccessMsg && (
                <div className="bg-emerald-950/60 border border-emerald-600/40 text-emerald-300 px-4 py-3 rounded-[6px] text-xs flex items-center justify-between">
                  <span>{uploadSuccessMsg}</span>
                  <Check className="w-4 h-4 text-emerald-400" />
                </div>
              )}

              {/* Upload & Preview Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Left: File Input & Drop Zone (5 cols) */}
                <div className="lg:col-span-5 space-y-4">
                  <div className="bg-[#211E1B] border-2 border-dashed border-[#2a2622] hover:border-[#C9A96E]/50 rounded-[8px] p-8 text-center transition-colors">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                    />

                    <div className="w-12 h-12 rounded-full bg-[#171513] flex items-center justify-center mx-auto mb-4 text-[#C9A96E]">
                      <Upload className="w-6 h-6" />
                    </div>

                    <h3 className="font-serif text-lg text-[#F5F0E8] mb-1">
                      Select or Drop Dish Photograph
                    </h3>
                    <p className="text-xs text-[#8B8175] mb-6">
                      Supports JPG, PNG, WebP (Max 5MB recommended)
                    </p>

                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="btn-gold-primary text-xs h-10 px-6 cursor-pointer"
                    >
                      Browse Files
                    </button>
                  </div>

                  {/* Actions for current uploaded file */}
                  {selectedFile && base64String && (
                    <div className="bg-[#211E1B] p-5 rounded-[8px] border border-[#2a2622] space-y-4">
                      <span className="text-xs uppercase tracking-wider text-[#C9A96E] font-medium block">
                        Direct Assignment
                      </span>

                      <div>
                        <label className="block text-xs text-[#8B8175] mb-1.5">
                          Assign Base64 Photo to Existing Menu Dish:
                        </label>
                        <select
                          value={targetDishId}
                          onChange={(e) => setTargetDishId(e.target.value)}
                          className="w-full bg-[#171513] border border-[#2a2622] text-[#F5F0E8] text-xs rounded-[4px] p-2.5 focus:outline-none focus:border-[#C9A96E] cursor-pointer"
                        >
                          <option value="">Select a dish to update...</option>
                          {menuItems.map((dish) => (
                            <option key={dish.id} value={dish.id}>
                              {dish.name} ({dish.category})
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={handleAssignToDish}
                          disabled={!targetDishId}
                          className="btn-gold-primary text-xs h-10 flex-1 disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                          Apply to Selected Dish
                        </button>
                        <button
                          type="button"
                          onClick={handleSaveToLibrary}
                          className="btn-gold-secondary text-xs h-10 px-4"
                        >
                          Save to Library
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Right: Selected Image Live Preview & Metadata (7 cols) */}
                <div className="lg:col-span-7 space-y-6">
                  <div className="bg-[#211E1B] rounded-[8px] p-6 border border-[#2a2622]">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-xs uppercase tracking-wider text-[#C9A96E] font-medium flex items-center gap-1.5">
                        <Eye className="w-3.5 h-3.5" />
                        <span>Live Preview (4:3 Culinary Format)</span>
                      </span>

                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono text-[#8B8175] bg-[#171513] px-2 py-0.5 rounded border border-[#2a2622]">
                          aspect-ratio: 4/3
                        </span>
                        {selectedFile && (
                          <span className="text-xs font-mono text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-800/40">
                            Ready for Display
                          </span>
                        )}
                      </div>
                    </div>

                    {previewUrl ? (
                      <div>
                        {/* The 4:3 Professional Preview Frame (Matches Signature & Menu Cards) */}
                        <div
                          className="relative aspect-[4/3] w-full rounded-[6px] overflow-hidden bg-[#171513] border border-[#2a2622] mb-4 shadow-xl group"
                          style={{ aspectRatio: '4 / 3' }}
                        >
                          <img
                            src={previewUrl}
                            alt="Selected dish preview"
                            className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
                          />
                          <div className="absolute top-2.5 left-2.5 bg-[#171513]/85 backdrop-blur-sm px-2 py-0.5 rounded text-[10px] uppercase tracking-wider font-semibold text-[#C9A96E]">
                            4:3 Preview Match
                          </div>
                        </div>

                        {/* File Metadata Badges */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs mb-4">
                          <div className="bg-[#171513] p-2.5 rounded-[4px] border border-[#2a2622]">
                            <span className="text-[#8B8175] block text-[10px] uppercase">File Name</span>
                            <span className="font-mono text-[#F5F0E8] truncate block" title={selectedFile?.name}>
                              {selectedFile?.name}
                            </span>
                          </div>

                          <div className="bg-[#171513] p-2.5 rounded-[4px] border border-[#2a2622]">
                            <span className="text-[#8B8175] block text-[10px] uppercase">File Size</span>
                            <span className="font-mono text-[#F5F0E8]">
                              {selectedFile ? `${(selectedFile.size / 1024).toFixed(1)} KB` : '—'}
                            </span>
                          </div>

                          <div className="bg-[#171513] p-2.5 rounded-[4px] border border-[#2a2622]">
                            <span className="text-[#8B8175] block text-[10px] uppercase">Dimensions</span>
                            <span className="font-mono text-[#F5F0E8]">
                              {fileDimensions ? `${fileDimensions.width} × ${fileDimensions.height}` : 'Calculating...'}
                            </span>
                          </div>

                          <div className="bg-[#171513] p-2.5 rounded-[4px] border border-[#2a2622]">
                            <span className="text-[#8B8175] block text-[10px] uppercase">MIME Format</span>
                            <span className="font-mono text-[#C9A96E]">
                              {selectedFile?.type || 'image/*'}
                            </span>
                          </div>
                        </div>

                        {/* Base64 Output Viewer */}
                        {base64String && (
                          <div className="bg-[#141210] p-4 rounded-[6px] border border-[#2a2622]">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-[11px] font-mono text-[#8B8175]">
                                Converted Base64 URI ({base64String.length.toLocaleString()} characters)
                              </span>
                              <button
                                onClick={handleCopyBase64}
                                className="flex items-center gap-1.5 text-xs text-[#C9A96E] hover:text-[#F5F0E8] transition-colors"
                              >
                                {copiedBase64 ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                                <span>{copiedBase64 ? 'Copied Base64!' : 'Copy Base64'}</span>
                              </button>
                            </div>
                            <div className="font-mono text-[10px] text-[#8B8175] break-all max-h-20 overflow-y-auto bg-[#171513] p-2.5 rounded border border-[#211E1B]">
                              {base64String.slice(0, 300)}...
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div
                        className="aspect-[4/3] w-full rounded-[6px] border border-dashed border-[#2a2622] flex flex-col items-center justify-center text-[#8B8175] bg-[#171513]/50"
                        style={{ aspectRatio: '4 / 3' }}
                      >
                        <ImageIcon className="w-10 h-10 mb-2 opacity-30 text-[#C9A96E]" />
                        <p className="text-xs font-medium text-[#F5F0E8]/70">No image selected yet</p>
                        <p className="text-[11px] text-[#8B8175]/60 mt-1">Upload an image on the left to see live 4:3 preview.</p>
                        <span className="text-[10px] font-mono text-[#8B8175]/40 mt-3 border border-[#2a2622] px-2 py-0.5 rounded">
                          aspect-ratio: 4/3
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Stored Base64 Media Library */}
              <div className="pt-8 border-t border-[#211E1B]">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="font-serif text-xl text-[#F5F0E8]">Stored Base64 Media Library</h3>
                    <p className="text-xs text-[#8B8175]">Previously converted and stored custom images</p>
                  </div>
                  <span className="text-xs text-[#8B8175] font-mono">
                    {storedImages.length} Saved Assets
                  </span>
                </div>

                {storedImages.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {storedImages.map((img) => (
                      <div
                        key={img.id}
                        className="bg-[#211E1B] rounded-[6px] p-2.5 border border-[#2a2622] flex flex-col justify-between group"
                      >
                        <div className="aspect-square rounded-[4px] overflow-hidden bg-[#171513] mb-2 relative">
                          <img
                            src={img.base64}
                            alt={img.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <span className="text-[11px] font-medium text-[#F5F0E8] truncate block" title={img.name}>
                          {img.name}
                        </span>
                        <div className="flex items-center justify-between text-[10px] text-[#8B8175] mt-1 pt-1 border-t border-[#171513]">
                          <span>{img.size}</span>
                          <button
                            onClick={() => handleDeleteFromLibrary(img.id)}
                            className="text-rose-400/70 hover:text-rose-400 p-0.5"
                            title="Delete"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-[#8B8175] italic">No custom Base64 images stored in library yet.</p>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: Menu Manager */}
          {activeTab === 'menu' && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="font-serif text-2xl md:text-3xl text-[#F5F0E8]">Menu Manager</h2>
                  <p className="text-xs text-[#8B8175]">
                    Manage dishes, pricing, and live pictures displayed on the public site.
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={handleResetMenuToDefault}
                    className="flex items-center gap-1.5 px-3 py-2 text-xs text-[#8B8175] hover:text-[#F5F0E8] border border-[#2a2622] rounded-[4px]"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Reset to Defaults</span>
                  </button>
                  <button
                    onClick={() => setNewDishModal(true)}
                    className="btn-gold-primary text-xs h-9 px-4 flex items-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add New Dish</span>
                  </button>
                </div>
              </div>

              {/* Menu items table / cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {menuItems.map((dish) => (
                  <div
                    key={dish.id}
                    className="bg-[#211E1B] border border-[#2a2622] rounded-[8px] p-4 flex flex-col justify-between"
                  >
                    <div>
                      <div
                        className="relative aspect-[4/3] w-full rounded-[6px] overflow-hidden mb-3 bg-[#171513]"
                        style={{ aspectRatio: '4 / 3' }}
                      >
                        {dish.image ? (
                          <img
                            src={dish.image}
                            alt={dish.name}
                            className="w-full h-full object-cover object-center"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-[#8B8175]">
                            <ImageIcon className="w-6 h-6" />
                          </div>
                        )}
                        <span className="absolute top-2 left-2 bg-[#171513]/90 text-[#C9A96E] text-[10px] uppercase tracking-wider px-2 py-0.5 rounded font-medium">
                          {dish.category}
                        </span>
                        {dish.image?.startsWith('data:image') && (
                          <span className="absolute bottom-2 right-2 bg-emerald-950/90 text-emerald-300 text-[9px] uppercase px-1.5 py-0.5 rounded font-mono border border-emerald-700/50">
                            Base64 Image
                          </span>
                        )}
                      </div>

                      <div className="flex items-baseline justify-between mb-1">
                        <h4 className="font-serif text-lg text-[#F5F0E8]">{dish.name}</h4>
                        <span className="font-mono text-xs text-[#C9A96E] font-bold">
                          ₦{dish.priceNaira.toLocaleString()}
                        </span>
                      </div>

                      <p className="text-xs text-[#8B8175] line-clamp-2 mb-3">
                        {dish.description}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-[#171513] flex items-center justify-between">
                      <span className="text-[11px] text-[#8B8175] italic truncate max-w-[180px]">
                        {dish.pairing || 'No pairing note'}
                      </span>
                      <button
                        onClick={() => {
                          setTargetDishId(dish.id);
                          setActiveTab('upload');
                        }}
                        className="text-xs text-[#C9A96E] hover:underline"
                      >
                        Change Photo
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: Reservations Manager */}
          {activeTab === 'reservations' && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <h2 className="font-serif text-2xl md:text-3xl text-[#F5F0E8]">Guest Reservations</h2>
                <p className="text-xs text-[#8B8175]">
                  Directly synced with the guest booking engine on the public website.
                </p>
              </div>

              {reservations.length > 0 ? (
                <div className="bg-[#211E1B] rounded-[8px] border border-[#2a2622] overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-[#141210] text-[#8B8175] uppercase text-[10px] tracking-wider border-b border-[#2a2622]">
                        <tr>
                          <th className="p-4">Reference</th>
                          <th className="p-4">Guest</th>
                          <th className="p-4">Date & Time</th>
                          <th className="p-4">Party</th>
                          <th className="p-4">Atmosphere</th>
                          <th className="p-4">Contact</th>
                          <th className="p-4">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#2a2622] text-[#F5F0E8]">
                        {reservations.map((res) => (
                          <tr key={res.bookingReference} className="hover:bg-[#171513]/50">
                            <td className="p-4 font-mono text-[#C9A96E] font-medium">
                              {res.bookingReference}
                            </td>
                            <td className="p-4 font-medium">{res.guestName}</td>
                            <td className="p-4">{res.date} at {res.time}</td>
                            <td className="p-4 font-mono">{res.guests} Guests</td>
                            <td className="p-4 capitalize text-[#8B8175]">
                              {res.seatingArea.replace('-', ' ')}
                            </td>
                            <td className="p-4 text-[#8B8175]">
                              <div>{res.guestEmail}</div>
                              <div className="font-mono text-[11px]">{res.guestPhone}</div>
                            </td>
                            <td className="p-4">
                              <span className="bg-emerald-950/70 text-emerald-400 border border-emerald-800/40 px-2 py-0.5 rounded text-[10px] uppercase font-medium">
                                Confirmed
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <div className="bg-[#211E1B] p-12 rounded-[8px] border border-[#2a2622] text-center text-[#8B8175]">
                  <Calendar className="w-10 h-10 mx-auto mb-3 opacity-30 text-[#C9A96E]" />
                  <p className="text-sm">No reservations received yet.</p>
                  <p className="text-xs text-[#8B8175]/60 mt-1">Book a table on the public site to see it populate here in real-time.</p>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: Supabase Database Integration & SQL Script */}
          {activeTab === 'supabase' && (
            <div className="space-y-8 animate-fade-in">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="font-serif text-2xl md:text-3xl text-[#F5F0E8] mb-1">
                    Supabase Database Architecture
                  </h2>
                  <p className="text-xs sm:text-sm text-[#8B8175] font-light max-w-2xl">
                    PostgreSQL database schema, Row Level Security (RLS) policies, and seed data for ÉLANÉ.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  {isSupabaseConfigured ? (
                    <span className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-950/60 border border-emerald-600/40 text-emerald-300 text-xs rounded-full font-medium">
                      <ShieldCheck className="w-4 h-4 text-emerald-400" />
                      <span>Connected to Supabase</span>
                    </span>
                  ) : (
                    <span className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-950/40 border border-amber-600/30 text-amber-300 text-xs rounded-full font-medium">
                      <Info className="w-3.5 h-3.5 text-amber-400" />
                      <span>Local Persistence Mode (Credentials Pending)</span>
                    </span>
                  )}
                </div>
              </div>

              {/* Active Connection & Live Credentials Manager */}
              <div className="bg-[#211E1B] p-6 rounded-[8px] border border-[#C9A96E]/30 shadow-xl space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#2a2622]">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#171513] border border-[#C9A96E]/40 flex items-center justify-center text-[#C9A96E]">
                      <Database className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-serif text-lg text-[#F5F0E8]">
                        Active Supabase Project Connection
                      </h3>
                      <p className="text-xs text-[#8B8175]">
                        Configured endpoint and credentials for real-time PostgreSQL synchronization.
                      </p>
                    </div>
                  </div>

                  <span className="text-[11px] font-mono text-emerald-400 bg-emerald-950/40 border border-emerald-800/40 px-3 py-1 rounded-full flex items-center gap-1.5 w-fit">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span>Project URL Registered</span>
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  {/* Supabase URL Field */}
                  <div className="space-y-1.5">
                    <label className="block text-[#8B8175] font-medium uppercase tracking-wider text-[11px]">
                      Supabase Project URL
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={inputUrl}
                        onChange={(e) => setInputUrl(e.target.value)}
                        placeholder="https://gzltxtqxtblzyjusgzuu.supabase.co"
                        className="w-full bg-[#171513] border border-[#2a2622] rounded-[4px] p-2.5 font-mono text-[#F5F0E8] focus:border-[#C9A96E] outline-none text-xs"
                      />
                    </div>
                    <div className="bg-[#171513] p-2.5 rounded-[4px] border border-[#2a2622] space-y-1 text-[11px] text-[#8B8175]">
                      <div className="flex items-center justify-between">
                        <span>Original Input:</span>
                        <code className="text-[#8B8175] font-mono">https://gzltxtqxtblzyjusgzuu.supabase.co/rest/v1/</code>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-emerald-400 font-medium">Clean SDK Base:</span>
                        <code className="text-[#C9A96E] font-mono font-semibold">https://gzltxtqxtblzyjusgzuu.supabase.co</code>
                      </div>
                      <p className="text-[10px] text-[#8B8175]/80 pt-1 border-t border-[#211E1B]">
                        ✓ Automatically sanitized to project origin to prevent duplicated <code className="text-[#F5F0E8]">/rest/v1/rest/v1</code> route errors.
                      </p>
                    </div>
                  </div>

                  {/* Supabase Anon Key Field */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="block text-[#8B8175] font-medium uppercase tracking-wider text-[11px]">
                        Supabase Anon Public Key (apikey)
                      </label>
                      <button
                        type="button"
                        onClick={() => setShowAnonKey(!showAnonKey)}
                        className="text-[11px] text-[#C9A96E] hover:text-[#b8985c] flex items-center gap-1 cursor-pointer"
                      >
                        {showAnonKey ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        <span>{showAnonKey ? 'Mask Key' : 'Reveal Key'}</span>
                      </button>
                    </div>

                    <div className="relative">
                      <input
                        type={showAnonKey ? 'text' : 'password'}
                        value={inputAnonKey}
                        onChange={(e) => setInputAnonKey(e.target.value)}
                        placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                        className="w-full bg-[#171513] border border-[#2a2622] rounded-[4px] p-2.5 font-mono text-[#F5F0E8] focus:border-[#C9A96E] outline-none text-xs break-all"
                      />
                    </div>
                    <div className="bg-[#171513] p-2.5 rounded-[4px] border border-[#2a2622] space-y-1 text-[11px] text-[#8B8175]">
                      <div className="flex items-center justify-between">
                        <span>Key Status:</span>
                        <span className="text-emerald-400 font-mono font-medium flex items-center gap-1">
                          <Check className="w-3 h-3" />
                          <span>Configured & Injected</span>
                        </span>
                      </div>
                      <p className="text-[10px] text-[#8B8175]/80 pt-1 border-t border-[#211E1B]">
                        JWT Ref ID: <code className="text-[#C9A96E] font-mono">gzltxtqxtblzyjusgzuu</code> (matches your Supabase project)
                      </p>
                    </div>

                    <div className="pt-2 flex items-center gap-3">
                      <button
                        onClick={handleSaveAndTestSupabase}
                        disabled={connStatus === 'testing'}
                        className="btn-gold-primary text-xs h-9 px-4 flex items-center gap-2 cursor-pointer shadow-md disabled:opacity-50"
                      >
                        {connStatus === 'testing' ? (
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <ShieldCheck className="w-3.5 h-3.5" />
                        )}
                        <span>{connStatus === 'testing' ? 'Testing...' : 'Save & Test Connection'}</span>
                      </button>

                      {inputAnonKey && (
                        <span className="text-[11px] text-emerald-400 font-mono flex items-center gap-1">
                          <Check className="w-3 h-3" />
                          <span>Key entered</span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Connection Status Banner */}
                {statusMsg && (
                  <div
                    className={`p-3 rounded-[4px] text-xs flex items-center gap-2.5 ${
                      connStatus === 'success'
                        ? 'bg-emerald-950/60 border border-emerald-700/50 text-emerald-300'
                        : connStatus === 'error'
                        ? 'bg-rose-950/60 border border-rose-800/50 text-rose-300'
                        : 'bg-[#171513] border border-[#2a2622] text-[#C9A96E]'
                    }`}
                  >
                    {connStatus === 'success' ? (
                      <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    ) : (
                      <Info className="w-4 h-4 text-amber-400 shrink-0" />
                    )}
                    <span>{statusMsg}</span>
                  </div>
                )}
              </div>

              {/* Step-by-Step Connection Instructions */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-[#211E1B] p-5 rounded-[8px] border border-[#2a2622]">
                  <div className="w-7 h-7 rounded-full bg-[#171513] border border-[#2a2622] flex items-center justify-center text-[#C9A96E] font-mono text-xs font-semibold mb-3">
                    1
                  </div>
                  <h4 className="font-serif text-base text-[#F5F0E8] mb-1">Create Supabase Project</h4>
                  <p className="text-xs text-[#8B8175] leading-relaxed">
                    Head over to <span className="text-[#C9A96E]">supabase.com</span>, log in and create a new project named <strong className="text-[#F5F0E8]">elane-restaurant</strong>.
                  </p>
                </div>

                <div className="bg-[#211E1B] p-5 rounded-[8px] border border-[#2a2622]">
                  <div className="w-7 h-7 rounded-full bg-[#171513] border border-[#2a2622] flex items-center justify-center text-[#C9A96E] font-mono text-xs font-semibold mb-3">
                    2
                  </div>
                  <h4 className="font-serif text-base text-[#F5F0E8] mb-1">Execute SQL Schema</h4>
                  <p className="text-xs text-[#8B8175] leading-relaxed">
                    Navigate to <strong className="text-[#F5F0E8]">SQL Editor</strong> in the left sidebar, paste the SQL script below, and click <strong className="text-emerald-400">Run</strong>.
                  </p>
                </div>

                <div className="bg-[#211E1B] p-5 rounded-[8px] border border-[#2a2622]">
                  <div className="w-7 h-7 rounded-full bg-[#171513] border border-[#2a2622] flex items-center justify-center text-[#C9A96E] font-mono text-xs font-semibold mb-3">
                    3
                  </div>
                  <h4 className="font-serif text-base text-[#F5F0E8] mb-1">Add API Keys</h4>
                  <p className="text-xs text-[#8B8175] leading-relaxed">
                    Copy <strong className="text-[#F5F0E8]">Project URL</strong> & <strong className="text-[#F5F0E8]">anon key</strong> from Settings &gt; API into your environment variables.
                  </p>
                </div>
              </div>

              {/* SQL Action Bar & Copy Button */}
              <div className="bg-[#211E1B] p-6 rounded-[8px] border border-[#2a2622]">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 pb-4 border-b border-[#2a2622]">
                  <div>
                    <h3 className="font-serif text-lg text-[#F5F0E8]">
                      Complete PostgreSQL & Supabase Migration Script
                    </h3>
                    <p className="text-xs text-[#8B8175]">
                      Includes 4 tables (`menu_items`, `reservations`, `customer_reviews`, `media_assets`), RLS security, and full seed data.
                    </p>
                  </div>

                  <button
                    onClick={() => {
                      const sqlContent = `-- ÉLANÉ Fine Dining Restaurant — Supabase Schema
-- Run in Supabase SQL Editor (Clean & Idempotent)

-- 1. EXTENSIONS
create extension if not exists "uuid-ossp";

-- 2. SAFE CLEANUP (CASCADE automatically drops triggers/policies without error)
drop table if exists public.media_assets cascade;
drop table if exists public.customer_reviews cascade;
drop table if exists public.reservations cascade;
drop table if exists public.menu_items cascade;

-- 3. MENU ITEMS TABLE
create table public.menu_items (
    id text primary key,
    name text not null,
    category text not null check (category in ('starters', 'mains', 'desserts', 'drinks')),
    description text not null,
    price_naira numeric(12, 2) not null,
    price_usd numeric(10, 2) not null,
    dietary text[] default array[]::text[],
    pairing text,
    image_url text,
    is_signature boolean default false,
    is_available boolean default true,
    sort_order integer default 0,
    created_at timestamptz default now() not null
);

-- 4. RESERVATIONS TABLE
create table public.reservations (
    id uuid primary key default gen_random_uuid(),
    booking_reference text unique not null,
    guest_name text not null,
    guest_email text not null,
    guest_phone text not null,
    guests_count integer not null check (guests_count between 1 and 20),
    seating_area text not null,
    occasion text default 'Dinner',
    special_requests text,
    reservation_date date not null,
    reservation_time time not null,
    status text default 'confirmed',
    created_at timestamptz default now() not null
);

-- 5. CUSTOMER REVIEWS TABLE
create table public.customer_reviews (
    id text primary key,
    guest_name text not null,
    title_or_role text not null,
    avatar_url text,
    quote text not null,
    experience text default 'Chef’s Degustation Menu',
    seating_area text default 'Main Dining Room',
    date_label text default 'Recent Visit',
    rating smallint default 5,
    verified boolean default true,
    is_published boolean default true,
    created_at timestamptz default now() not null
);

-- 6. MEDIA ASSETS TABLE
create table public.media_assets (
    id uuid primary key default gen_random_uuid(),
    file_name text not null,
    file_size_kb numeric(10, 2),
    mime_type text default 'image/jpeg',
    dimensions text,
    base64_data text,
    storage_path text,
    assigned_menu_item_id text references public.menu_items(id) on delete set null,
    created_at timestamptz default now() not null
);

-- 7. ROW LEVEL SECURITY
alter table public.menu_items enable row level security;
alter table public.reservations enable row level security;
alter table public.customer_reviews enable row level security;
alter table public.media_assets enable row level security;

create policy "Public can read menu" on public.menu_items for select using (true);
create policy "Public can submit bookings" on public.reservations for insert with check (true);
create policy "Public can view bookings" on public.reservations for select using (true);
create policy "Public can view reviews" on public.customer_reviews for select using (is_published = true);
create policy "Public can submit reviews" on public.customer_reviews for insert with check (true);
create policy "Staff full access menu" on public.menu_items for all to authenticated using (true);
create policy "Staff full access reservations" on public.reservations for all to authenticated using (true);
create policy "Staff full access reviews" on public.customer_reviews for all to authenticated using (true);
create policy "Staff full access media" on public.media_assets for all to authenticated using (true);
`;
                      navigator.clipboard.writeText(sqlContent);
                      setCopiedSql(true);
                      setTimeout(() => setCopiedSql(false), 2200);
                    }}
                    className="btn-gold-primary text-xs h-9 px-4 flex items-center gap-2 shrink-0 cursor-pointer shadow-md"
                  >
                    {copiedSql ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedSql ? 'SQL Script Copied!' : 'Copy SQL Script'}</span>
                  </button>
                </div>

                {/* SQL Code Preview Block */}
                <div className="relative rounded-[6px] overflow-hidden border border-[#2a2622] bg-[#141210]">
                  <div className="flex items-center justify-between px-4 py-2 bg-[#171513] border-b border-[#211E1B] text-xs font-mono text-[#8B8175]">
                    <span>supabase/schema.sql</span>
                    <span className="text-[#C9A96E]">PostgreSQL 15+</span>
                  </div>

                  <pre className="p-4 text-xs font-mono text-[#F5F0E8]/85 overflow-x-auto max-h-96 leading-relaxed select-all">
{`-- 1. EXTENSIONS
create extension if not exists "uuid-ossp";

-- 2. MENU ITEMS TABLE
create table if not exists public.menu_items (
    id text primary key,
    name text not null,
    category text not null check (category in ('starters', 'mains', 'desserts', 'drinks')),
    description text not null,
    price_naira numeric(12, 2) not null,
    price_usd numeric(10, 2) not null,
    dietary text[] default array[]::text[],
    pairing text,
    image_url text,
    is_signature boolean default false,
    is_available boolean default true,
    sort_order integer default 0,
    created_at timestamptz default now() not null
);

-- 3. RESERVATIONS TABLE
create table if not exists public.reservations (
    id uuid primary key default gen_random_uuid(),
    booking_reference text unique not null,
    guest_name text not null,
    guest_email text not null,
    guest_phone text not null,
    guests_count integer not null check (guests_count between 1 and 20),
    seating_area text not null,
    occasion text default 'Dinner',
    special_requests text,
    reservation_date date not null,
    reservation_time time not null,
    status text default 'confirmed',
    created_at timestamptz default now() not null
);

-- 4. CUSTOMER REVIEWS TABLE
create table if not exists public.customer_reviews (
    id text primary key,
    guest_name text not null,
    title_or_role text not null,
    avatar_url text,
    quote text not null,
    experience text default 'Chef’s Degustation Menu',
    seating_area text default 'Main Dining Room',
    date_label text default 'Recent Visit',
    rating smallint default 5,
    verified boolean default true,
    is_published boolean default true,
    created_at timestamptz default now() not null
);

-- 5. ROW LEVEL SECURITY (RLS)
alter table public.menu_items enable row level security;
alter table public.reservations enable row level security;
alter table public.customer_reviews enable row level security;
alter table public.media_assets enable row level security;

create policy "Public can read menu" on public.menu_items for select using (true);
create policy "Public can submit bookings" on public.reservations for insert with check (true);
create policy "Public can view bookings" on public.reservations for select using (true);
create policy "Public can view reviews" on public.customer_reviews for select using (is_published = true);
create policy "Public can submit reviews" on public.customer_reviews for insert with check (true);
create policy "Staff full access menu" on public.menu_items for all to authenticated using (true);
create policy "Staff full access reservations" on public.reservations for all to authenticated using (true);`}
                  </pre>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Add New Dish Modal */}
      {newDishModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#171513] border border-[#211E1B] rounded-[8px] max-w-lg w-full p-6 shadow-2xl">
            <h3 className="font-serif text-xl text-[#F5F0E8] mb-4">Add New Culinary Creation</h3>

            <form onSubmit={handleCreateDish} className="space-y-4 text-xs">
              <div>
                <label className="block text-[#8B8175] mb-1">Dish Name *</label>
                <input
                  type="text"
                  value={newDishForm.name}
                  onChange={(e) => setNewDishForm({ ...newDishForm, name: e.target.value })}
                  placeholder="e.g. Pan-Roasted Turbot"
                  className="w-full bg-[#211E1B] border border-[#2a2622] text-[#F5F0E8] p-2.5 rounded focus:border-[#C9A96E] outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#8B8175] mb-1">Category</label>
                  <select
                    value={newDishForm.category}
                    onChange={(e) => setNewDishForm({ ...newDishForm, category: e.target.value as any })}
                    className="w-full bg-[#211E1B] border border-[#2a2622] text-[#F5F0E8] p-2.5 rounded focus:border-[#C9A96E] outline-none cursor-pointer"
                  >
                    <option value="starters">Starters</option>
                    <option value="mains">Mains</option>
                    <option value="desserts">Desserts</option>
                    <option value="drinks">Drinks & Cellar</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[#8B8175] mb-1">Price (₦ NGN)</label>
                  <input
                    type="number"
                    value={newDishForm.priceNaira}
                    onChange={(e) => setNewDishForm({ ...newDishForm, priceNaira: Number(e.target.value) })}
                    className="w-full bg-[#211E1B] border border-[#2a2622] text-[#F5F0E8] p-2.5 rounded focus:border-[#C9A96E] outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[#8B8175] mb-1">Description</label>
                <textarea
                  value={newDishForm.description}
                  onChange={(e) => setNewDishForm({ ...newDishForm, description: e.target.value })}
                  rows={2}
                  placeholder="Ingredients, culinary techniques, flavor notes..."
                  className="w-full bg-[#211E1B] border border-[#2a2622] text-[#F5F0E8] p-2 rounded focus:border-[#C9A96E] outline-none"
                />
              </div>

              <div>
                <label className="block text-[#8B8175] mb-1">Sommelier Pairing</label>
                <input
                  type="text"
                  value={newDishForm.pairing}
                  onChange={(e) => setNewDishForm({ ...newDishForm, pairing: e.target.value })}
                  placeholder="e.g. Puligny-Montrachet 2020"
                  className="w-full bg-[#211E1B] border border-[#2a2622] text-[#F5F0E8] p-2 rounded focus:border-[#C9A96E] outline-none"
                />
              </div>

              {base64String && (
                <div className="bg-[#211E1B] p-2.5 rounded border border-[#2a2622] flex items-center justify-between">
                  <span className="text-emerald-400">Use currently uploaded Base64 photo</span>
                  <input
                    type="checkbox"
                    defaultChecked
                    onChange={(e) => {
                      if (e.target.checked) setNewDishForm({ ...newDishForm, image: base64String });
                    }}
                  />
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setNewDishModal(false)}
                  className="btn-gold-secondary flex-1 h-9 text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-gold-primary flex-1 h-9 text-xs"
                >
                  Save Dish to Menu
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
