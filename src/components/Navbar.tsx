import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { BrandLogo } from './BrandLogo';
import {
  Film,
  Compass,
  MessageSquare,
  ShieldCheck,
  Bell,
  Sun,
  Moon,
  UserCheck,
  ChevronDown,
  Mail,
  Bookmark,
  Search,
  LogOut,
  LogIn,
} from 'lucide-react';

// Dedicated 18+ rating badge icon
const Icon18Plus: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
    aria-hidden="true"
  >
    <rect x="2" y="2" width="20" height="20" rx="6" fill="none" stroke="currentColor" strokeWidth="2" />
    <text
      x="12"
      y="15.5"
      textAnchor="middle"
      fontSize="9.5"
      fontWeight="900"
      fontFamily="system-ui, -apple-system, sans-serif"
      fill="currentColor"
      letterSpacing="-0.5px"
    >
      18+
    </text>
  </svg>
);

export const Navbar: React.FC = () => {
  const {
    activeView,
    setActiveView,
    isDarkMode,
    toggleTheme,
    isNsfwEnabled,
    toggleNsfw,
    currentUser,
    notifications,
    unreadNotifsCount,
    markNotificationsAsRead,
    openReelsPlayer,
    seriesList,
    setIsDmModalOpen,
    setIsAdvancedSearchOpen,
    isLoggedIn,
    logout,
    setIsAuthModalOpen,
  } = useApp();

  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  const userRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifDropdown(false);
      }
      if (userRef.current && !userRef.current.contains(e.target as Node)) {
        setShowUserDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleOpenReels = () => {
    if (seriesList.length > 0) {
      openReelsPlayer(seriesList[0].id);
    } else {
      setActiveView('reels');
    }
  };

  // Strictly check if user is the root super admin (semajim30@gmail.com) OR authorized by admin
  const isSuperAdmin = currentUser.email === 'semajim30@gmail.com';
  const hasAdminAccess = isSuperAdmin || Boolean(currentUser.isAuthorizedStaff);

  // If unauthorized and currently in admin view, redirect to home immediately
  useEffect(() => {
    if (activeView === 'admin' && !hasAdminAccess) {
      setActiveView('home');
    }
  }, [activeView, hasAdminAccess, setActiveView]);

  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 dark:bg-[#070b14]/95 backdrop-blur-md border-b border-slate-200 dark:border-blue-900/30 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Zone 1: Creative Brand Logo with Isolated Mascot */}
        <BrandLogo onClick={() => setActiveView('home')} />

        {/* Zone 2: Navigation Links (Desktop) */}
        <nav className="hidden md:flex items-center gap-1 lg:gap-2 text-sm font-medium">
          <button
            onClick={() => setActiveView('home')}
            className={`px-3 py-1.5 rounded-xl transition-all whitespace-nowrap flex items-center gap-1.5 ${
              activeView === 'home'
                ? 'bg-blue-600/15 dark:bg-blue-600/25 text-blue-600 dark:text-blue-400 font-semibold border border-blue-500/30'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60'
            }`}
          >
            <Film className="w-4 h-4" />
            <span>Ana Sayfa</span>
          </button>

          <button
            onClick={handleOpenReels}
            className={`px-3 py-1.5 rounded-xl transition-all whitespace-nowrap flex items-center gap-1.5 ${
              activeView === 'reels'
                ? 'bg-blue-600 text-white font-semibold shadow-md shadow-blue-500/30'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60'
            }`}
          >
            <Compass className="w-4 h-4" />
            <span>Reels Akışı</span>
          </button>

          <button
            onClick={() => setActiveView('library')}
            className={`px-3 py-1.5 rounded-xl transition-all whitespace-nowrap flex items-center gap-1.5 ${
              activeView === 'library'
                ? 'bg-blue-600/15 dark:bg-blue-600/25 text-blue-600 dark:text-blue-400 font-semibold border border-blue-500/30'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60'
            }`}
          >
            <Bookmark className="w-4 h-4" />
            <span>Kütüphane</span>
          </button>

          <button
            onClick={() => setActiveView('community')}
            className={`px-3 py-1.5 rounded-xl transition-all whitespace-nowrap flex items-center gap-1.5 ${
              activeView === 'community'
                ? 'bg-blue-600/15 dark:bg-blue-600/25 text-blue-600 dark:text-blue-400 font-semibold border border-blue-500/30'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>Topluluk Odası</span>
          </button>

          {/* SADECE YÖNETİCİ (semajim30@gmail.com) VEYA YETKİ VERDİĞİ KİŞİLER GÖREBİLİR */}
          {hasAdminAccess && (
            <button
              onClick={() => setActiveView('admin')}
              className={`px-3 py-1.5 rounded-xl transition-all whitespace-nowrap flex items-center gap-1.5 ${
                activeView === 'admin'
                  ? 'bg-indigo-600 text-white font-semibold shadow-md shadow-indigo-500/30'
                  : 'text-indigo-600 dark:text-indigo-300 hover:text-indigo-900 dark:hover:text-white hover:bg-indigo-50 dark:hover:bg-indigo-950/40 border border-indigo-500/25'
              }`}
            >
              <ShieldCheck className="w-4 h-4 text-indigo-500 dark:text-indigo-400" />
              <span>Yönetim Odası</span>
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            </button>
          )}
        </nav>

        {/* Zone 3: Actions (Search, NSFW Toggle, Theme, Notifications, DMs, User Switcher) */}
        <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
          {/* Advanced Search Button */}
          <button
            onClick={() => setIsAdvancedSearchOpen(true)}
            aria-label="Gelişmiş Arama"
            title="Gelişmiş Dizi Arama (Kategori, Bölüm Sayısı, Etiket)"
            className="h-9 px-2.5 sm:px-3 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-cyan-400 border border-blue-200 dark:border-blue-800/60 hover:bg-blue-100 dark:hover:bg-blue-900/60"
          >
            <Search className="w-3.5 h-3.5 text-blue-600 dark:text-cyan-400" />
            <span className="hidden sm:inline">Gelişmiş Arama</span>
          </button>

          {/* NSFW Mode Toggle - Dedicated 18+ rating badge icon only (no text, no eye) */}
          <button
            onClick={toggleNsfw}
            aria-label="18+ Kuşağı"
            title={isNsfwEnabled ? '18+ İçerik Kuşağı Açık (Kapatmak için tıkla)' : '18+ İçerik Kuşağı Kapalı (Açmak için tıkla)'}
            className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all border ${
              isNsfwEnabled
                ? 'bg-rose-500/15 text-rose-500 dark:text-rose-400 border-rose-500/40 hover:bg-rose-500/25 shadow-sm shadow-rose-500/20'
                : 'bg-slate-100 dark:bg-slate-800/80 text-slate-400 dark:text-slate-500 border-slate-200 dark:border-slate-700/60 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            <Icon18Plus className="w-5 h-5" />
          </button>

          {/* Dark / Light Mode Switch */}
          <button
            onClick={toggleTheme}
            aria-label="Tema Değiştir"
            title={isDarkMode ? 'Açık Moda Geç' : 'Koyu Mod (Gece) Geç'}
            className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-blue-600" />}
          </button>

          {/* Direct Messages Icon Button */}
          <button
            onClick={() => setIsDmModalOpen(true)}
            aria-label="Kişisel Mesajlar (DM)"
            title="Kişisel Mesajlar"
            className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors relative"
          >
            <Mail className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-blue-500 rounded-full"></span>
          </button>

          {/* Notifications Dropdown Container */}
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => {
                setShowNotifDropdown(prev => !prev);
                if (!showNotifDropdown && unreadNotifsCount > 0) {
                  markNotificationsAsRead();
                }
              }}
              aria-label="Bildirimler"
              className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors relative"
            >
              <Bell className="w-4 h-4" />
              {unreadNotifsCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 px-1.5 py-0.2 text-[10px] font-bold bg-rose-500 text-white rounded-full leading-tight font-mono">
                  {unreadNotifsCount}
                </span>
              )}
            </button>

            {/* Notification Menu */}
            {showNotifDropdown && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-[#0c1324] rounded-2xl shadow-2xl border border-slate-200 dark:border-blue-900/40 p-3 z-50 animate-in fade-in zoom-in-95 duration-150">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800 mb-2">
                  <div className="flex items-center gap-1.5">
                    <Bell className="w-4 h-4 text-blue-500 dark:text-blue-400" />
                    <span className="text-xs font-bold text-slate-900 dark:text-white">Bildirimler</span>
                  </div>
                  <button
                    onClick={markNotificationsAsRead}
                    className="text-[11px] text-blue-600 dark:text-blue-400 hover:underline font-medium"
                  >
                    Tümünü Okundu Say
                  </button>
                </div>

                <div className="max-h-72 overflow-y-auto space-y-2 pr-1 no-scrollbar">
                  {notifications.length === 0 ? (
                    <p className="text-center py-6 text-xs text-slate-400">Yeni bildirim bulunmuyor.</p>
                  ) : (
                    notifications.map(notif => (
                      <div
                        key={notif.id}
                        className={`p-2.5 rounded-xl flex items-start gap-2.5 text-xs transition-colors ${
                          notif.isRead
                            ? 'bg-slate-800/30 text-slate-400'
                            : 'bg-blue-950/40 text-slate-200 border border-blue-800/40'
                        }`}
                      >
                        <img
                          src={notif.actorAvatar}
                          alt={notif.actorName}
                          referrerPolicy="no-referrer"
                          className="w-8 h-8 rounded-full object-cover shrink-0 mt-0.5 border border-blue-500/20"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="leading-snug">
                            <span className="font-semibold text-white">{notif.actorName} </span>
                            {notif.message}
                          </p>
                          <span className="text-[10px] text-slate-400 mt-1 inline-block">
                            {notif.createdAt}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User Profile & Account Actions Dropdown / Login Button */}
          {isLoggedIn ? (
            <div className="relative" ref={userRef}>
              <button
                onClick={() => {
                  if (window.innerWidth < 768) {
                    setActiveView('profile');
                  } else {
                    setShowUserDropdown(prev => !prev);
                  }
                }}
                title="Profilim"
                aria-label="Profilim"
                className="flex items-center gap-1.5 p-1 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <div className="relative w-8 h-8 rounded-lg overflow-hidden border border-blue-500/40">
                  <img
                    src={currentUser.avatar}
                    alt={currentUser.displayName}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400 hidden sm:block" />
              </button>

              {/* User Dropdown */}
              {showUserDropdown && (
                <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-[#0c1324] rounded-2xl shadow-2xl border border-slate-200 dark:border-blue-900/40 p-3 z-50 animate-in fade-in zoom-in-95 duration-150">
                  <div className="pb-3 border-b border-slate-200 dark:border-slate-800">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                        {currentUser.displayName}
                      </p>
                      {isSuperAdmin && (
                        <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-600 dark:text-amber-300 font-bold border border-amber-500/30">
                          BAŞ YÖNETİCİ
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-blue-600 dark:text-cyan-400 font-mono truncate">{currentUser.email}</p>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 font-mono">
                      {hasAdminAccess ? '✅ Yönetim Odası Yetkisi Var' : '❌ Normal Üye'}
                    </p>
                  </div>

                  {/* Primary Actions: Profilim & Yönetim */}
                  <div className="py-2.5 border-b border-slate-200 dark:border-slate-800 space-y-1.5">
                    <button
                      onClick={() => {
                        setActiveView('profile');
                        setShowUserDropdown(false);
                      }}
                      className="w-full py-2 px-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-blue-600/25 transition-all"
                    >
                      <UserCheck className="w-4 h-4" />
                      <span>Profilime Git</span>
                    </button>

                    {hasAdminAccess && (
                      <button
                        onClick={() => {
                          setActiveView('admin');
                          setShowUserDropdown(false);
                        }}
                        className="w-full py-2 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-indigo-600/25 transition-all"
                      >
                        <ShieldCheck className="w-4 h-4" />
                        <span>Yönetim Odasına Git</span>
                      </button>
                    )}
                  </div>

                  {/* Log Out Action */}
                  <div className="pt-2">
                    <button
                      onClick={() => {
                        logout();
                        setShowUserDropdown(false);
                      }}
                      className="w-full text-left py-2 px-3 rounded-xl text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 flex items-center gap-2 font-semibold transition-colors"
                    >
                      <LogOut className="w-4 h-4 text-rose-500" />
                      <span>Çıkış Yap</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={() => setIsAuthModalOpen(true)}
              className="h-9 px-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-md shadow-blue-600/25 shrink-0"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Giriş Yap</span>
            </button>
          )}
        </div>
      </div>

      {/* Mobile Fixed Bottom Navigation Bar - Includes dedicated Profile tab for all members */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-[#070b14]/95 backdrop-blur-lg border-t border-slate-200 dark:border-blue-900/30 px-1 py-1 shadow-lg">
        <div className={`grid ${hasAdminAccess ? 'grid-cols-6' : 'grid-cols-5'} items-center h-14`}>
          <button
            onClick={() => setActiveView('home')}
            className={`flex flex-col items-center justify-center min-h-[44px] transition-colors ${
              activeView === 'home' ? 'text-blue-600 dark:text-cyan-400 font-bold' : 'text-slate-500 dark:text-slate-400'
            }`}
          >
            <Film className="w-5 h-5" />
            <span className="text-[10px] font-medium tracking-tight mt-0.5">Ana Sayfa</span>
          </button>

          <button
            onClick={handleOpenReels}
            className={`flex flex-col items-center justify-center min-h-[44px] transition-colors ${
              activeView === 'reels' ? 'text-blue-600 dark:text-cyan-400 font-bold' : 'text-slate-500 dark:text-slate-400'
            }`}
          >
            <Compass className="w-5 h-5" />
            <span className="text-[10px] font-medium tracking-tight mt-0.5">Reels</span>
          </button>

          <button
            onClick={() => setActiveView('library')}
            className={`flex flex-col items-center justify-center min-h-[44px] transition-colors ${
              activeView === 'library' ? 'text-blue-600 dark:text-cyan-400 font-bold' : 'text-slate-500 dark:text-slate-400'
            }`}
          >
            <Bookmark className="w-5 h-5" />
            <span className="text-[10px] font-medium tracking-tight mt-0.5">Kütüphane</span>
          </button>

          <button
            onClick={() => setActiveView('community')}
            className={`flex flex-col items-center justify-center min-h-[44px] transition-colors ${
              activeView === 'community' ? 'text-blue-600 dark:text-cyan-400 font-bold' : 'text-slate-500 dark:text-slate-400'
            }`}
          >
            <MessageSquare className="w-5 h-5" />
            <span className="text-[10px] font-medium tracking-tight mt-0.5">Topluluk</span>
          </button>

          {/* SADECE YÖNETİCİ VEYA YETKİLİ KİŞİLER GÖREBİLİR */}
          {hasAdminAccess && (
            <button
              onClick={() => setActiveView('admin')}
              className={`flex flex-col items-center justify-center min-h-[44px] transition-colors ${
                activeView === 'admin' ? 'text-indigo-600 dark:text-indigo-400 font-bold' : 'text-slate-500 dark:text-slate-400'
              }`}
            >
              <ShieldCheck className="w-5 h-5" />
              <span className="text-[10px] font-medium tracking-tight mt-0.5">Yönetim</span>
            </button>
          )}

          {/* TÜM ÜYELER İÇİN BİREBİR PROFİL SEKMESİ VEYA GİRİŞ */}
          {isLoggedIn ? (
            <button
              onClick={() => setActiveView('profile')}
              className={`flex flex-col items-center justify-center min-h-[44px] transition-colors ${
                activeView === 'profile' ? 'text-blue-600 dark:text-cyan-400 font-bold' : 'text-slate-500 dark:text-slate-400'
              }`}
            >
              <div className={`w-5 h-5 rounded-full overflow-hidden border ${
                activeView === 'profile'
                  ? 'border-blue-600 dark:border-cyan-400 ring-2 ring-blue-500/30 scale-105'
                  : 'border-slate-400 dark:border-slate-600'
              }`}>
                <img
                  src={currentUser.avatar}
                  alt={currentUser.displayName}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              </div>
              <span className="text-[10px] font-medium tracking-tight mt-0.5">Profilim</span>
            </button>
          ) : (
            <button
              onClick={() => setIsAuthModalOpen(true)}
              className="flex flex-col items-center justify-center min-h-[44px] text-blue-600 dark:text-cyan-400 transition-colors"
            >
              <LogIn className="w-5 h-5" />
              <span className="text-[10px] font-bold tracking-tight mt-0.5">Giriş</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
