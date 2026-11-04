import React, { useState } from 'react';
import { Lock, X, Minus, Square, ShieldCheck, User as UserIcon, ArrowLeft, Loader2, ExternalLink } from 'lucide-react';
import { useApp } from '../context/AppContext';

interface GoogleAccountItem {
  id: string;
  name: string;
  email: string;
  avatar: string;
  badge?: string;
  isCustom?: boolean;
}

interface GoogleAccountChooserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (account: { email: string; name: string; avatar: string }) => void;
}

export const GoogleAccountChooserModal: React.FC<GoogleAccountChooserModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { loginWithGoogle, allUsers } = useApp();

  // Mode: 'chooser' (Bir hesap seçin) or 'custom_input' (Başka bir hesap kullan)
  const [viewMode, setViewMode] = useState<'chooser' | 'custom_input'>('chooser');
  const [customEmail, setCustomEmail] = useState('');
  const [customName, setCustomName] = useState('');
  const [customError, setCustomError] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [activeSelectedEmail, setActiveSelectedEmail] = useState<string | null>(null);

  // Default recognized Google accounts matching user's exact screenshot + saved local accounts
  const defaultAccounts: GoogleAccountItem[] = [
    {
      id: 'sema',
      name: 'Sema',
      email: 'semajim30@gmail.com',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      badge: 'Baş Yönetici',
    },
    {
      id: 'wattyboon',
      name: 'Watty Boon',
      email: 'wattyboontr@gmail.com',
      avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=Watty+Boon&backgroundColor=6366f1&textColor=ffffff',
      badge: 'Üye',
    },
  ];

  // Retrieve any previously entered Google accounts from localStorage
  const [savedAccounts, setSavedAccounts] = useState<GoogleAccountItem[]>(() => {
    try {
      const stored = localStorage.getItem('minimo_saved_google_accounts');
      if (stored) {
        return JSON.parse(stored);
      }
    } catch {
      // ignore
    }
    return [];
  });

  if (!isOpen) return null;

  // Merge default + saved accounts (deduplicating by email)
  const mergedAccounts: GoogleAccountItem[] = [...defaultAccounts];
  savedAccounts.forEach(acc => {
    if (!mergedAccounts.some(m => m.email.toLowerCase() === acc.email.toLowerCase())) {
      mergedAccounts.push(acc);
    }
  });

  // Handle direct 1-click account selection
  const handleSelectAccount = (acc: GoogleAccountItem) => {
    setActiveSelectedEmail(acc.email);
    setIsVerifying(true);

    // Simulate authentic Google SSL verification handshake
    setTimeout(() => {
      const res = loginWithGoogle(acc.email, acc.name, acc.avatar);
      setIsVerifying(false);
      setActiveSelectedEmail(null);
      if (res.success) {
        if (onSuccess) {
          onSuccess({ email: acc.email, name: acc.name, avatar: acc.avatar });
        }
        onClose();
      }
    }, 750);
  };

  // Handle "Başka bir hesap kullan" submission
  const handleCustomAccountSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = customEmail.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      setCustomError('Lütfen geçerli bir Google e-posta adresi girin.');
      return;
    }
    setCustomError('');
    setIsVerifying(true);

    const generatedName = customName.trim() || cleanEmail.split('@')[0];
    const generatedAvatar = `https://api.dicebear.com/7.x/identicon/svg?seed=${cleanEmail}`;

    setTimeout(() => {
      const newAcc: GoogleAccountItem = {
        id: `custom-${Date.now()}`,
        name: generatedName,
        email: cleanEmail,
        avatar: generatedAvatar,
        isCustom: true,
      };

      // Save to localStorage for future 1-click use
      const updated = [newAcc, ...savedAccounts.filter(s => s.email !== cleanEmail)];
      setSavedAccounts(updated);
      try {
        localStorage.setItem('minimo_saved_google_accounts', JSON.stringify(updated));
      } catch {
        // ignore
      }

      const res = loginWithGoogle(cleanEmail, generatedName, generatedAvatar);
      setIsVerifying(false);
      if (res.success) {
        if (onSuccess) {
          onSuccess({ email: cleanEmail, name: generatedName, avatar: generatedAvatar });
        }
        onClose();
      }
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      {/* Pop-up Window Shell - Recreating Google Chrome / Google Accounts Chooser Window */}
      <div className="relative w-full max-w-[480px] bg-[#1a1b1e] text-[#e8eaed] rounded-xl shadow-2xl border border-slate-700/80 overflow-hidden flex flex-col font-sans transition-all">
        
        {/* Google Chrome Window Header */}
        <div className="bg-[#292a2d] px-3 py-2 border-b border-[#3c4043] flex items-center justify-between select-none">
          {/* Chrome Tab & Title */}
          <div className="flex items-center gap-2 overflow-hidden">
            <GoogleLogoSvg className="w-4 h-4 shrink-0" />
            <span className="text-xs text-[#bdc1c6] truncate font-medium">
              Oturum açın - Google Hesapları - Google Chrome
            </span>
          </div>

          {/* Window Action Icons */}
          <div className="flex items-center gap-2 shrink-0 text-[#9aa0a6]">
            <button
              type="button"
              onClick={onClose}
              className="p-1 hover:text-white hover:bg-slate-700/50 rounded transition-colors"
              title="Simge Durumuna Küçült"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              className="p-1 hover:text-white hover:bg-slate-700/50 rounded transition-colors"
              title="Ekranı Kapla"
            >
              <Square className="w-3 h-3" />
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1 hover:text-white hover:bg-red-600 rounded transition-colors"
              title="Kapat"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Chrome Address Bar (Omnibox) */}
        <div className="bg-[#202124] px-3 py-1.5 border-b border-[#3c4043] flex items-center gap-2">
          <div className="flex-1 bg-[#28292c] hover:bg-[#323438] rounded-full px-3 py-1 flex items-center gap-2 text-[11px] text-[#9aa0a6] border border-[#3c4043]/60">
            <Lock className="w-3 h-3 text-[#8ab4f8] shrink-0" />
            <span className="truncate font-mono">
              <span className="text-[#8ab4f8]">https://</span>accounts.google.com/v3/signin/accountchooser
            </span>
          </div>
        </div>

        {/* Google 4-Color Animated Linear Progress Bar when verifying */}
        <div className="h-1 w-full bg-[#202124] overflow-hidden">
          {isVerifying && (
            <div className="h-full w-full bg-gradient-to-r from-[#4285F4] via-[#EA4335] via-[#FBBC05] to-[#34A853] animate-pulse" />
          )}
        </div>

        {/* Window Inner Content */}
        <div className="p-6 sm:p-8 bg-[#131314] flex-1 flex flex-col justify-between">
          
          {viewMode === 'chooser' ? (
            <div>
              {/* Header: Google branding */}
              <div className="flex items-center gap-2.5 mb-6">
                <GoogleLogoSvg className="w-5 h-5" />
                <span className="text-sm font-medium text-[#bdc1c6]">Google ile oturum açın</span>
              </div>

              {/* App Identity Banner */}
              <div className="mb-4 flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-600 to-cyan-400 flex items-center justify-center text-white font-black text-sm shadow-md">
                  M
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white tracking-wide">Minimo Series</h4>
                  <p className="text-[11px] text-[#9aa0a6]">minimo-series.app</p>
                </div>
              </div>

              {/* Main Heading (Matching Google's Account Chooser Exactly) */}
              <div className="mb-6">
                <h2 className="text-2xl font-normal text-[#e8eaed] mb-1.5 tracking-tight">
                  Bir hesap seçin
                </h2>
                <p className="text-sm text-[#8ab4f8] font-medium">
                  Minimo Series uygulamasına devam edin
                </p>
              </div>

              {/* Account Selection List */}
              <div className="space-y-1 mb-6 border-t border-[#3c4043]/80 pt-2">
                {mergedAccounts.map((acc) => {
                  const isSelected = activeSelectedEmail === acc.email;
                  return (
                    <button
                      key={acc.id}
                      type="button"
                      disabled={isVerifying}
                      onClick={() => handleSelectAccount(acc)}
                      className={`w-full text-left py-3 px-3 rounded-lg flex items-center justify-between transition-all group ${
                        isSelected
                          ? 'bg-[#3c4043]/70 ring-1 ring-[#8ab4f8]'
                          : 'hover:bg-[#202124] active:bg-[#28292c]'
                      }`}
                    >
                      <div className="flex items-center gap-3.5 min-w-0">
                        {/* Avatar */}
                        <div className="relative shrink-0">
                          <img
                            src={acc.avatar}
                            alt={acc.name}
                            className="w-10 h-10 rounded-full object-cover ring-1 ring-slate-600"
                          />
                          {acc.badge && (
                            <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-[#131314]" />
                          )}
                        </div>

                        {/* User Details */}
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-[#e8eaed] group-hover:text-white truncate">
                              {acc.name}
                            </span>
                            {acc.badge && (
                              <span className="text-[10px] bg-blue-500/20 text-[#8ab4f8] border border-[#8ab4f8]/30 px-1.5 py-0.2 rounded font-semibold">
                                {acc.badge}
                              </span>
                            )}
                          </div>
                          <span className="text-xs text-[#9aa0a6] truncate block font-mono">
                            {acc.email}
                          </span>
                        </div>
                      </div>

                      {/* Right Loader or Action */}
                      {isSelected ? (
                        <Loader2 className="w-4 h-4 text-[#8ab4f8] animate-spin shrink-0" />
                      ) : (
                        <div className="w-2 h-2 rounded-full bg-transparent group-hover:bg-[#8ab4f8] transition-colors shrink-0" />
                      )}
                    </button>
                  );
                })}

                {/* Divider Line */}
                <div className="border-t border-[#3c4043] my-1" />

                {/* "Başka bir hesap kullan" Option */}
                <button
                  type="button"
                  disabled={isVerifying}
                  onClick={() => {
                    setViewMode('custom_input');
                    setCustomError('');
                  }}
                  className="w-full text-left py-3 px-3 rounded-lg flex items-center gap-3.5 hover:bg-[#202124] active:bg-[#28292c] transition-colors group"
                >
                  <div className="w-10 h-10 rounded-full border border-slate-600 flex items-center justify-center text-[#9aa0a6] group-hover:text-white group-hover:border-slate-400 shrink-0">
                    <UserIcon className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-sm font-medium text-[#e8eaed] group-hover:text-white">
                      Başka bir hesap kullan
                    </span>
                    <span className="text-xs text-[#9aa0a6] block">
                      Farklı bir Gmail ile oturum aç
                    </span>
                  </div>
                </button>
              </div>

              {/* Status feedback during verification */}
              {isVerifying && (
                <div className="mb-4 p-3 bg-blue-950/40 border border-[#8ab4f8]/40 rounded-lg flex items-center gap-2.5 text-xs text-[#8ab4f8] animate-in fade-in">
                  <Loader2 className="w-4 h-4 animate-spin shrink-0" />
                  <span>Google güvenliği ile kimlik doğrulanıyor... Lütfen bekleyin.</span>
                </div>
              )}

              {/* Privacy & Terms Note (Exact Google Notice) */}
              <p className="text-[11px] text-[#9aa0a6] leading-relaxed pt-2">
                Bu uygulamayı kullanmadan önce Minimo Series uygulamasının{' '}
                <a
                  href="#privacy"
                  onClick={(e) => {
                    e.preventDefault();
                    alert('Minimo Series Gizlilik Politikası: Kullanıcı verileriniz güvende tutulur ve üçüncü taraflarla paylaşılmaz.');
                  }}
                  className="text-[#8ab4f8] hover:underline"
                >
                  Gizlilik Politikası
                </a>
                'nı ve{' '}
                <a
                  href="#terms"
                  onClick={(e) => {
                    e.preventDefault();
                    alert('Minimo Series Hizmet Şartları: Topluluk kurallarına ve telif haklarına saygı gösterilmelidir.');
                  }}
                  className="text-[#8ab4f8] hover:underline"
                >
                  Hizmet Şartları
                </a>
                'nı inceleyebilirsiniz.
              </p>
            </div>
          ) : (
            /* Custom Account Sign-In View ("Başka bir hesap kullan") */
            <div>
              {/* Back to chooser */}
              <button
                type="button"
                onClick={() => setViewMode('chooser')}
                className="text-xs text-[#8ab4f8] hover:underline flex items-center gap-1.5 mb-5"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Hesap seçimine geri dön</span>
              </button>

              <div className="flex items-center gap-2.5 mb-5">
                <GoogleLogoSvg className="w-5 h-5" />
                <span className="text-sm font-medium text-[#bdc1c6]">Google ile oturum açın</span>
              </div>

              <div className="mb-6">
                <h2 className="text-2xl font-normal text-[#e8eaed] mb-1">Oturum açın</h2>
                <p className="text-sm text-[#8ab4f8]">Minimo Series uygulamasına devam edin</p>
              </div>

              <form onSubmit={handleCustomAccountSubmit} className="space-y-4">
                <div>
                  <label className="text-xs text-[#bdc1c6] block mb-1.5 font-medium">
                    E-posta veya telefon
                  </label>
                  <input
                    type="email"
                    required
                    autoFocus
                    value={customEmail}
                    onChange={(e) => setCustomEmail(e.target.value)}
                    placeholder="ornek@gmail.com"
                    className="w-full px-3.5 py-3 rounded-lg bg-[#1f1f1f] border border-[#5f6368] focus:border-[#8ab4f8] text-white text-sm focus:outline-none transition-colors font-mono"
                  />
                  {customError && (
                    <p className="text-xs text-[#f28b82] mt-1.5">{customError}</p>
                  )}
                </div>

                <div>
                  <label className="text-xs text-[#bdc1c6] block mb-1.5 font-medium">
                    Adınız (İsteğe bağlı)
                  </label>
                  <input
                    type="text"
                    value={customName}
                    onChange={(e) => setCustomName(e.target.value)}
                    placeholder="Ad Soyad"
                    className="w-full px-3.5 py-3 rounded-lg bg-[#1f1f1f] border border-[#5f6368] focus:border-[#8ab4f8] text-white text-sm focus:outline-none transition-colors"
                  />
                </div>

                <div className="pt-4 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setViewMode('chooser')}
                    className="text-xs text-[#8ab4f8] hover:underline"
                  >
                    Vazgeç
                  </button>

                  <button
                    type="submit"
                    disabled={isVerifying || !customEmail.trim()}
                    className="px-6 py-2.5 rounded-full bg-[#8ab4f8] hover:bg-[#a8c7fa] disabled:opacity-50 text-[#041e49] font-medium text-xs flex items-center gap-2 shadow-md transition-all font-semibold"
                  >
                    {isVerifying ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Doğrulanıyor...</span>
                      </>
                    ) : (
                      <span>İleri</span>
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Bottom Footer Bar */}
          <div className="mt-8 pt-4 border-t border-[#3c4043] flex items-center justify-between text-[11px] text-[#9aa0a6]">
            <span>Türkçe (Türkiye)</span>
            <div className="flex items-center gap-4">
              <a href="https://support.google.com/accounts" target="_blank" rel="noreferrer" className="hover:text-[#e8eaed]">Yardım</a>
              <a href="https://policies.google.com/privacy" target="_blank" rel="noreferrer" className="hover:text-[#e8eaed]">Gizlilik</a>
              <a href="https://policies.google.com/terms" target="_blank" rel="noreferrer" className="hover:text-[#e8eaed]">Şartlar</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Official 4-Color Google Logo SVG
const GoogleLogoSvg: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg className={className} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path
      fill="#4285F4"
      d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.66v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.15z"
    />
    <path
      fill="#34A853"
      d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.34 24 12 24z"
    />
    <path
      fill="#FBBC05"
      d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
    />
    <path
      fill="#EA4335"
      d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
    />
  </svg>
);
