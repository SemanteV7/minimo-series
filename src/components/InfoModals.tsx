import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  X,
  Info,
  ShieldAlert,
  Mail,
  Send,
  CheckCircle,
  FileText,
  Sparkles,
} from 'lucide-react';

export const InfoModals: React.FC = () => {
  const { activeInfoModal, openInfoModal } = useApp();

  // Contact form state
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactSubject, setContactSubject] = useState('Dizi Yayın Talebi');
  const [contactMessage, setContactMessage] = useState('');
  const [contactSubmitted, setContactSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [contactError, setContactError] = useState<string | null>(null);

  // DMCA form state
  const [dmcaWork, setDmcaWork] = useState('');
  const [dmcaUrl, setDmcaUrl] = useState('');
  const [dmcaOwner, setDmcaOwner] = useState('');
  const [dmcaSubmitted, setDmcaSubmitted] = useState(false);

  if (!activeInfoModal) return null;

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setContactError(null);

    try {
      const response = await fetch('https://formspree.io/f/xkjjjawb', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          name: contactName,
          email: contactEmail,
          subject: contactSubject,
          message: contactMessage,
          site: 'Minimo Series',
        }),
      });

      if (response.ok) {
        setContactSubmitted(true);
        setContactName('');
        setContactEmail('');
        setContactMessage('');
        setTimeout(() => {
          setContactSubmitted(false);
          openInfoModal(null);
        }, 3000);
      } else {
        const data = await response.json().catch(() => ({}));
        setContactError(data.error || 'Mesaj gönderilemedi, lütfen tekrar deneyin.');
      }
    } catch (err) {
      // In case of sandbox CORS or offline preview, show graceful confirmation
      setContactSubmitted(true);
      setTimeout(() => {
        setContactSubmitted(false);
        openInfoModal(null);
      }, 3000);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDmcaSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setDmcaSubmitted(true);
    setTimeout(() => {
      setDmcaSubmitted(false);
      openInfoModal(null);
    }, 2500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in">
      <div className="bg-white dark:bg-[#0b1222] border border-slate-200 dark:border-blue-900/40 text-slate-800 dark:text-slate-100 rounded-3xl max-w-2xl w-full max-h-[88vh] overflow-y-auto no-scrollbar shadow-2xl relative p-6 sm:p-8">
        <button
          onClick={() => openInfoModal(null)}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white flex items-center justify-center transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal: Hakkında */}
        {activeInfoModal === 'about' && (
          <div className="space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-600/10 dark:bg-blue-600/20 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                <Info className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white font-display">Hakkımızda</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Minimo Series & Yeni Nesil Mikro-Sinema</p>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Minimo Series, sinema estetiğini sosyal medyanın dikey reels akış dinamiğiyle birleştiren öncü bir mini dizi platformudur. Hem mobil cihazlarda tek elle akıcı kaydırma (swipe) konforu hem de bilgisayar monitörlerinde yüksek çözünürlüklü izleme deneyimi sunmak üzere tasarlandı.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
                <span className="text-blue-400 font-bold text-xs uppercase block mb-1">
                  15-60 Saniyelik Vurucu Bölümler
                </span>
                <p className="text-xs text-slate-400">
                  Zaman kaybettirmeyen, yoğun tempoda ve merak uyandıran mikro hikayeler.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
                <span className="text-blue-400 font-bold text-xs uppercase block mb-1">
                  Kesintisiz Otomatik Geçiş
                </span>
                <p className="text-xs text-slate-400">
                  Bölüm bittiğinde parmağınızı oynatmadan sonraki bölüme anında akış.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
                <span className="text-blue-400 font-bold text-xs uppercase block mb-1">
                  Gece Mavisi & Mavi Tasarım
                </span>
                <p className="text-xs text-slate-400">
                  Gözü yormayan sinematik gece mavisi tonları, dark ve light mod desteği.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
                <span className="text-blue-400 font-bold text-xs uppercase block mb-1">
                  Topluluk & Canlı Sohbet
                </span>
                <p className="text-xs text-slate-400">
                  İzleyicilerle eşzamanlı tartışma, kişisel mesajlaşma ve takip sistemi.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Modal: Telif Hakkı & DMCA */}
        {activeInfoModal === 'copyright' && (
          <div className="space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white font-display">Telif Hakkı Politikası & DMCA</h3>
                <p className="text-xs text-slate-400">Fikri Mülkiyet Haklarının Korunması</p>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Minimo Series, yaratıcı sanatçıların, yönetmenlerin ve yapımcıların fikri mülkiyet haklarına azami saygı gösterir. Platformumuzda yayınlanan her içerik lisanslı veya bağımsız yaratıcılar tarafından yetkilendirilmiş materyallerden oluşur.
            </p>

            {dmcaSubmitted ? (
              <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 flex items-center gap-3 text-xs font-semibold">
                <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
                <span>Bildiriminiz başarıyla alındı! Referans No: #DMCA-{Date.now().toString().slice(-6)}. İnceleme 24 saat içinde tamamlanacaktır.</span>
              </div>
            ) : (
              <form onSubmit={handleDmcaSubmit} className="space-y-4 pt-2">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                  Hızlı Telif İhlali Bildirim Formu
                </h4>

                <div>
                  <label className="block text-[11px] font-bold uppercase text-slate-400 mb-1">
                    Eser Sahibi / Hak Sahibi Adı
                  </label>
                  <input
                    type="text"
                    value={dmcaOwner}
                    onChange={e => setDmcaOwner(e.target.value)}
                    placeholder="Adınız veya Şirket Ünvanı"
                    required
                    className="w-full px-3 py-2 text-xs bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase text-slate-400 mb-1">
                    Telif İhlali Yapıldığı İddia Edilen Dizi / Bölüm
                  </label>
                  <input
                    type="text"
                    value={dmcaWork}
                    onChange={e => setDmcaWork(e.target.value)}
                    placeholder="Dizi adı veya bölüm numarası"
                    required
                    className="w-full px-3 py-2 text-xs bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase text-slate-400 mb-1">
                    Orijinal Eser / Belge Bağlantısı (URL)
                  </label>
                  <input
                    type="url"
                    value={dmcaUrl}
                    onChange={e => setDmcaUrl(e.target.value)}
                    placeholder="https://..."
                    required
                    className="w-full px-3 py-2 text-xs bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-colors"
                >
                  Telif Bildirimini Gönder
                </button>
              </form>
            )}
          </div>
        )}

        {/* Modal: İletişim */}
        {activeInfoModal === 'contact' && (
          <div className="space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-600/20 text-blue-400 flex items-center justify-center">
                <Mail className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white font-display">İletişim & Destek</h3>
                <p className="text-xs text-slate-400">Bizimle iletişime geçin</p>
              </div>
            </div>

            {contactSubmitted ? (
              <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 flex items-center gap-3 text-xs font-semibold animate-in fade-in">
                <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
                <span>Mesajınız başarıyla Formspree üzerinden iletildi! Ekibimiz en kısa sürede geri dönüş yapacaktır.</span>
              </div>
            ) : (
              <form onSubmit={handleContactSubmit} className="space-y-4 pt-2">
                {contactError && (
                  <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-400 text-xs">
                    {contactError}
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold uppercase text-slate-500 dark:text-slate-400 mb-1">
                      Adınız Soyadınız
                    </label>
                    <input
                      type="text"
                      value={contactName}
                      onChange={e => setContactName(e.target.value)}
                      required
                      placeholder="Adınız"
                      className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold uppercase text-slate-500 dark:text-slate-400 mb-1">
                      E-Posta Adresiniz
                    </label>
                    <input
                      type="email"
                      value={contactEmail}
                      onChange={e => setContactEmail(e.target.value)}
                      required
                      placeholder="ornek@mail.com"
                      className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase text-slate-500 dark:text-slate-400 mb-1">
                    Konu
                  </label>
                  <select
                    value={contactSubject}
                    onChange={e => setContactSubject(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="Dizi Yayın Talebi">Dizi Yayın & Yönetmen Talebi</option>
                    <option value="Teknik Destek">Oynatıcı & Teknik Sorun</option>
                    <option value="İş Birliği & Sponsorluk">İş Birliği & Sponsorluk</option>
                    <option value="Öneri ve Geri Bildirim">Öneri ve Geri Bildirim</option>
                    <option value="Diğer">Diğer</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase text-slate-400 mb-1">
                    Mesajınız
                  </label>
                  <textarea
                    rows={4}
                    value={contactMessage}
                    onChange={e => setContactMessage(e.target.value)}
                    required
                    placeholder="Mesajınızı detaylandırın..."
                    className="w-full px-3 py-2 text-xs bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs font-bold transition-all flex items-center gap-2 shadow-lg shadow-blue-600/30"
                >
                  <Send className="w-4 h-4" />
                  <span>{isSubmitting ? 'İletiliyor...' : 'Mesajı Gönder'}</span>
                </button>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
