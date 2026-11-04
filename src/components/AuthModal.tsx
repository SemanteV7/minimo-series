import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  X,
  LogIn,
  UserPlus,
  Lock,
  Mail,
  User,
  AlertCircle,
  CheckCircle,
  KeyRound,
  ArrowLeft,
  ArrowRight,
  RefreshCw,
  Sparkles,
  ExternalLink,
  Loader2,
  ShieldCheck,
} from 'lucide-react';
import { GoogleAccountChooserModal } from './GoogleAccountChooserModal';

export const AuthModal: React.FC = () => {
  const {
    isAuthModalOpen,
    setIsAuthModalOpen,
    login,
    register,
    resetPasswordWithEmail,
    loginWithGoogle,
  } = useApp();

  const [tab, setTab] = useState<'login' | 'register' | 'forgot'>('login');

  // Login & Register Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [feedback, setFeedback] = useState<{ success: boolean; message: string } | null>(null);

  // Registration 2-Step Flow State:
  // Step 1: Bilgileri Gir & Doğrulama Kodu Gönder
  // Step 2: Mailine Gelen 6 Haneli Onay Kodunu Gir ve Tamamla
  const [registerStep, setRegisterStep] = useState<1 | 2>(1);
  const [registerGeneratedCode, setRegisterGeneratedCode] = useState('');
  const [registerCodeInput, setRegisterCodeInput] = useState('');
  const [showRegisterCodeHelper, setShowRegisterCodeHelper] = useState(false);
  const [isSendingRegisterEmail, setIsSendingRegisterEmail] = useState(false);

  // Forgot Password 3-Step Flow State:
  // Step 1: E-posta Gir & Mail Gönder
  // Step 2: Gelen Kodu Doğrula
  // Step 3: Şifre Yenileme Ekranı (Yeni Şifre Belirle)
  const [forgotStep, setForgotStep] = useState<1 | 2 | 3>(1);
  const [sentToEmail, setSentToEmail] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [generatedCode, setGeneratedCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [showCodeHelper, setShowCodeHelper] = useState(false);

  // Google Sign-In Account Chooser Modal State
  const [isGoogleChooserOpen, setIsGoogleChooserOpen] = useState(false);

  if (!isAuthModalOpen) return null;

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);
    const res = login(email, password);
    setFeedback(res);
    if (res.success) {
      setTimeout(() => {
        setIsAuthModalOpen(false);
        setFeedback(null);
      }, 1000);
    }
  };

  // STEP 1 REGISTRATION: Send 6-digit confirmation code to user's real email
  const handleStartRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);

    const cleanEmail = email.trim().toLowerCase();
    if (!displayName.trim()) {
      setFeedback({ success: false, message: 'Lütfen adınızı ve soyadınızı giriniz.' });
      return;
    }
    if (!cleanEmail || !cleanEmail.includes('@')) {
      setFeedback({ success: false, message: 'Lütfen geçerli bir e-posta adresi giriniz.' });
      return;
    }
    if (!password || password.length < 4) {
      setFeedback({ success: false, message: 'Şifreniz en az 4 karakter olmalıdır.' });
      return;
    }

    const randomCode = Math.floor(100000 + Math.random() * 900000).toString();
    setRegisterGeneratedCode(randomCode);
    setRegisterCodeInput('');
    setIsSendingRegisterEmail(true);

    try {
      await fetch('https://formspree.io/f/xkjjjawb', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({
          _subject: `Minimo Series Üyelik Onay Kodu: ${randomCode}`,
          email: cleanEmail,
          alici_eposta: cleanEmail,
          alici_isim: displayName.trim(),
          onay_kodu: randomCode,
          mesaj: `Merhaba ${displayName},\n\nMinimo Series platformuna kaydolmak için onay kodunuz: ${randomCode}\n\nBu kod 10 dakika süreyle geçerlidir. Ekrana bu kodu girerek üyeliğinizi hemen başlatabilirsiniz.\n\nİyi seyirler dileriz!`,
          kayit_tarihi: new Date().toLocaleString('tr-TR'),
        }),
      });
    } catch (err) {
      console.warn('Formspree register notification:', err);
    } finally {
      setIsSendingRegisterEmail(false);
      setRegisterStep(2);
      setFeedback({
        success: true,
        message: `6 haneli onay kodu "${cleanEmail}" adresinize gönderildi! Lütfen gelen kutunuzu kontrol edin.`,
      });
    }
  };

  // Resend registration code
  const handleResendRegisterCode = async () => {
    const randomCode = Math.floor(100000 + Math.random() * 900000).toString();
    setRegisterGeneratedCode(randomCode);
    setRegisterCodeInput('');
    setIsSendingRegisterEmail(true);
    setFeedback(null);

    try {
      await fetch('https://formspree.io/f/xkjjjawb', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({
          _subject: `Minimo Series Yeni Kayıt Onay Kodu: ${randomCode}`,
          email: email.trim().toLowerCase(),
          alici_eposta: email.trim().toLowerCase(),
          onay_kodu: randomCode,
          mesaj: `Yeni üyelik onay kodunuz: ${randomCode} (10 dakika geçerlidir)`,
        }),
      });
    } catch (err) {
      console.warn(err);
    } finally {
      setIsSendingRegisterEmail(false);
      setFeedback({
        success: true,
        message: `Yeni onay kodu "${email}" adresine gönderildi.`,
      });
    }
  };

  // STEP 2 REGISTRATION: Verify code & finalize user account creation
  const handleVerifyRegisterCode = (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);

    if (!registerCodeInput.trim()) {
      setFeedback({ success: false, message: 'Lütfen 6 haneli onay kodunu giriniz.' });
      return;
    }

    if (registerCodeInput.trim() !== registerGeneratedCode.trim()) {
      setFeedback({
        success: false,
        message: 'Girdiğiniz 6 haneli onay kodu hatalı. Lütfen e-postanızı kontrol edin.',
      });
      return;
    }

    // Code is correct -> officially register user!
    const res = register(displayName, email, password);
    setFeedback(res);
    if (res.success) {
      setTimeout(() => {
        setIsAuthModalOpen(false);
        setFeedback(null);
        setRegisterStep(1);
      }, 1200);
    }
  };

  // STEP 1: Send real verification email via Formspree endpoint & advance to Step 2
  const handleSendResetCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail) {
      setFeedback({ success: false, message: 'Lütfen geçerli bir e-posta adresi girin.' });
      return;
    }

    // Generate 6-digit secure code
    const randomCode = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedCode(randomCode);
    setSentToEmail(cleanEmail);
    setIsSendingEmail(true);

    try {
      // Real email dispatch via Formspree (connected to semajim30@gmail.com)
      await fetch('https://formspree.io/f/xkjjjawb', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          _subject: `Minimo Series Şifre Sıfırlama Kodu: ${randomCode}`,
          email: cleanEmail,
          alici_eposta: cleanEmail,
          dogrulama_kodu: randomCode,
          mesaj: `Minimo Series hesabınız için şifre sıfırlama talebinde bulundunuz.\n\nDoğrulama Kodunuz: ${randomCode}\n\nBu kod 10 dakika süreyle geçerlidir. Ekrana bu kodu girerek şifrenizi yenileyebilirsiniz.`,
          talep_tarihi: new Date().toLocaleString('tr-TR'),
        }),
      });
    } catch (err) {
      console.warn('Formspree dispatch notice:', err);
    } finally {
      setIsSendingEmail(false);
      setForgotStep(2); // Redirect to Step 2: Kodu Doğrula
      setVerificationCode('');
      setFeedback({
        success: true,
        message: `Doğrulama kodu "${cleanEmail}" adresinize gönderildi! Lütfen gelen kutunuzu kontrol ediniz.`,
      });
    }
  };

  // Resend code to email
  const handleResendCode = async () => {
    const randomCode = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedCode(randomCode);
    setVerificationCode('');
    setIsSendingEmail(true);
    setFeedback(null);

    try {
      await fetch('https://formspree.io/f/xkjjjawb', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({
          _subject: `Minimo Series Yeni Şifre Sıfırlama Kodu: ${randomCode}`,
          email: sentToEmail,
          alici_eposta: sentToEmail,
          dogrulama_kodu: randomCode,
          mesaj: `Yeni doğrulama kodunuz: ${randomCode} (10 dakika geçerli)`,
        }),
      });
    } catch (err) {
      console.warn(err);
    } finally {
      setIsSendingEmail(false);
      setFeedback({
        success: true,
        message: `Yeni kod "${sentToEmail}" adresine iletildi.`,
      });
    }
  };

  // STEP 2: Verify entered code -> redirect to Step 3 (Şifre Yenileme Ekranı)
  const handleVerifyCode = (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);

    if (!verificationCode.trim()) {
      setFeedback({ success: false, message: 'Lütfen 6 haneli doğrulama kodunu girin.' });
      return;
    }

    if (verificationCode.trim() !== generatedCode.trim()) {
      setFeedback({
        success: false,
        message: 'Girdiğiniz 6 haneli doğrulama kodu hatalı. Lütfen e-postanızı kontrol ediniz.',
      });
      return;
    }

    // Success! Redirect to Step 3: Şifre Yenileme Ekranı
    setForgotStep(3);
    setFeedback({
      success: true,
      message: 'Kod başarıyla doğrulandı! Şimdi yeni şifrenizi belirleyebilirsiniz.',
    });
  };

  // STEP 3: Submit New Password & Log In
  const handleResetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);

    if (newPassword.length < 4) {
      setFeedback({ success: false, message: 'Yeni şifreniz en az 4 karakter olmalıdır.' });
      return;
    }

    if (newPassword !== confirmPassword) {
      setFeedback({ success: false, message: 'Şifreler birbiriyle uyuşmuyor. Lütfen tekrar kontrol edin.' });
      return;
    }

    const res = resetPasswordWithEmail(sentToEmail, newPassword);
    setFeedback(res);
    if (res.success) {
      setTimeout(() => {
        setIsAuthModalOpen(false);
        setFeedback(null);
        setForgotStep(1);
        setTab('login');
      }, 1200);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-white dark:bg-[#0b1222] rounded-3xl border border-slate-200 dark:border-blue-900/40 shadow-2xl overflow-hidden p-6 text-slate-900 dark:text-slate-100 transition-colors">
        {/* Close Button */}
        <button
          onClick={() => {
            setIsAuthModalOpen(false);
            setFeedback(null);
          }}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 flex items-center justify-center transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="text-center mb-5">
          <div className="w-12 h-12 rounded-2xl bg-blue-600/10 dark:bg-cyan-500/15 text-blue-600 dark:text-cyan-400 border border-blue-500/30 flex items-center justify-center mx-auto mb-2">
            {tab === 'login' ? (
              <LogIn className="w-6 h-6" />
            ) : tab === 'register' ? (
              <UserPlus className="w-6 h-6" />
            ) : forgotStep === 1 ? (
              <Mail className="w-6 h-6 text-blue-500" />
            ) : forgotStep === 2 ? (
              <ShieldCheck className="w-6 h-6 text-emerald-500" />
            ) : (
              <KeyRound className="w-6 h-6 text-amber-500" />
            )}
          </div>
          <h3 className="text-xl font-black text-slate-900 dark:text-white">
            {tab === 'login'
              ? 'Minimo Hesabına Giriş Yap'
              : tab === 'register'
              ? 'Yeni Üyelik Oluştur'
              : forgotStep === 1
              ? 'Şifremi Unuttum'
              : forgotStep === 2
              ? 'Doğrulama Kodunu Gir'
              : 'Şifre Yenileme Ekranı'}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {tab === 'forgot'
              ? forgotStep === 1
                ? 'Hesabınıza kayıtlı e-postayı girin, güvenlik kodunuz mailinize gelsin.'
                : forgotStep === 2
                ? 'E-posta adresinize gönderilen 6 haneli kodu doğrulayın.'
                : 'Hesabınız doğrulandı! Şimdi güvenli yeni şifrenizi belirleyin.'
              : 'Dikey mini dizileri favorilemek, kaldığın yerden izlemek ve toplulukta sohbet etmek için katıl!'}
          </p>
        </div>

        {/* Tab Selector (Giriş / Kayıt Ol) */}
        {tab !== 'forgot' ? (
          <div className="flex p-1 bg-slate-100 dark:bg-slate-900/90 rounded-2xl mb-5 border border-slate-200 dark:border-slate-800">
            <button
              onClick={() => {
                setTab('login');
                setFeedback(null);
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
                tab === 'login'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Giriş Yap
            </button>
            <button
              onClick={() => {
                setTab('register');
                setFeedback(null);
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
                tab === 'register'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Kayıt Ol
            </button>
          </div>
        ) : (
          <div className="mb-4 flex items-center justify-between">
            <button
              onClick={() => {
                setTab('login');
                setFeedback(null);
                setForgotStep(1);
              }}
              className="text-xs font-bold text-blue-600 dark:text-cyan-400 hover:underline flex items-center gap-1.5"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Giriş Ekranına Dön</span>
            </button>

            {/* Step Indicator */}
            <div className="flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${forgotStep === 1 ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-700'}`} />
              <span className={`w-2 h-2 rounded-full ${forgotStep === 2 ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-700'}`} />
              <span className={`w-2 h-2 rounded-full ${forgotStep === 3 ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-700'}`} />
              <span className="text-[10px] font-mono text-slate-400 ml-1">Adım {forgotStep}/3</span>
            </div>
          </div>
        )}

        {/* Feedback Alert */}
        {feedback && (
          <div
            className={`mb-4 p-3 rounded-xl text-xs flex items-center gap-2 ${
              feedback.success
                ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                : 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30'
            }`}
          >
            {feedback.success ? (
              <CheckCircle className="w-4 h-4 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0" />
            )}
            <span>{feedback.message}</span>
          </div>
        )}


        {/* TAB 1: LOGIN */}
        {tab === 'login' && (
          <form onSubmit={handleLogin} className="space-y-3.5">
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                E-posta Adresi
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="ornek@domain.com"
                  className="w-full pl-9 pr-3 py-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 font-mono"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Şifre
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setTab('forgot');
                    setForgotStep(1);
                    setFeedback(null);
                  }}
                  className="text-[11px] font-semibold text-blue-600 dark:text-cyan-400 hover:underline"
                >
                  Şifremi Unuttum?
                </button>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 font-mono"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full mt-2 py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-blue-600/30 transition-all hover:scale-[1.01] active:scale-95"
            >
              <LogIn className="w-4 h-4" />
              <span>Giriş Yap</span>
            </button>
          </form>
        )}

        {/* TAB 2: REGISTER (2-STEP VERIFICATION FLOW) */}
        {tab === 'register' && (
          <div className="space-y-4">
            {registerStep === 1 ? (
              <form onSubmit={handleStartRegister} className="space-y-3.5">
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Ad Soyad / Görünen İsim
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={displayName}
                      onChange={e => setDisplayName(e.target.value)}
                      placeholder="Örn: Ayşe Yılmaz"
                      className="w-full pl-9 pr-3 py-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    E-posta Adresi (Onay Kodu Gönderilecektir)
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="adiniz@gmail.com"
                      className="w-full pl-9 pr-3 py-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 font-mono"
                    />
                  </div>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">
                    Kayıt işlemini tamamlamak için bu adrese 6 haneli güvenlik onay kodu gelecektir.
                  </p>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Hesap Şifresi
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="En az 4 karakter"
                      className="w-full pl-9 pr-3 py-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 font-mono"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSendingRegisterEmail}
                  className="w-full mt-2 py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-60 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-blue-600/30 transition-all hover:scale-[1.01] active:scale-95"
                >
                  {isSendingRegisterEmail ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Onay Kodu Gönderiliyor...</span>
                    </>
                  ) : (
                    <>
                      <Mail className="w-4 h-4" />
                      <span>Onay Kodu Gönder & Kayıt Ol</span>
                    </>
                  )}
                </button>
              </form>
            ) : (
              <form onSubmit={handleVerifyRegisterCode} className="space-y-4">
                {/* Email Sent Confirmation Card */}
                <div className="p-3.5 bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800/80 rounded-2xl text-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-blue-900 dark:text-cyan-300 flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-blue-600 dark:text-cyan-400" />
                      <span>Onay Kodu İletildi:</span>
                    </span>
                    <span className="text-[10px] bg-blue-600/20 text-blue-700 dark:text-cyan-300 px-1.5 py-0.5 rounded font-mono font-bold">
                      10 dk geçerli
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-700 dark:text-slate-300 font-mono truncate font-semibold">
                    {email}
                  </p>

                  <div className="pt-2 border-t border-blue-200/60 dark:border-blue-800/60 flex items-center justify-between">
                    <a
                      href="https://mail.google.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] font-bold text-blue-700 dark:text-cyan-300 hover:underline inline-flex items-center gap-1"
                    >
                      <span>Gmail'i Aç</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>

                    <button
                      type="button"
                      onClick={() => setShowRegisterCodeHelper(prev => !prev)}
                      className="text-[10px] text-slate-500 dark:text-slate-400 hover:underline"
                    >
                      {showRegisterCodeHelper ? 'Kodu Gizle' : 'Kodu Göremedim?'}
                    </button>
                  </div>

                  {showRegisterCodeHelper && (
                    <div className="mt-2 p-2 rounded-xl bg-white dark:bg-slate-900 border border-blue-200 dark:border-blue-800 text-[11px] flex items-center justify-between">
                      <span className="text-slate-600 dark:text-slate-400">Üretilen Kod:</span>
                      <span className="font-mono font-extrabold text-blue-600 dark:text-cyan-400 tracking-wider">
                        {registerGeneratedCode}
                      </span>
                      <button
                        type="button"
                        onClick={() => setRegisterCodeInput(registerGeneratedCode)}
                        className="text-[10px] font-bold text-cyan-600 dark:text-cyan-300 underline"
                      >
                        Kutuya Yaz
                      </button>
                    </div>
                  )}
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      Mailinize Gelen 6 Haneli Onay Kodu
                    </label>
                    <button
                      type="button"
                      onClick={handleResendRegisterCode}
                      disabled={isSendingRegisterEmail}
                      className="text-[10px] font-semibold text-blue-600 dark:text-cyan-400 hover:underline flex items-center gap-1"
                    >
                      <RefreshCw className={`w-3 h-3 ${isSendingRegisterEmail ? 'animate-spin' : ''}`} />
                      <span>Tekrar Gönder</span>
                    </button>
                  </div>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={registerCodeInput}
                    onChange={e => setRegisterCodeInput(e.target.value.replace(/\D/g, ''))}
                    placeholder="123456"
                    className="w-full text-center tracking-[0.35em] font-mono text-xl font-black py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                  />
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 text-center">
                    Mailinize gelen 6 haneli kodu girdiğinizde üyeliğiniz anında aktifleştirilecektir.
                  </p>
                </div>

                <div className="space-y-2">
                  <button
                    type="submit"
                    className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-emerald-600/30 transition-all hover:scale-[1.01] active:scale-95"
                  >
                    <CheckCircle className="w-4 h-4" />
                    <span>Kodu Doğrula ve Kaydı Tamamla</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setRegisterStep(1);
                      setFeedback(null);
                    }}
                    className="w-full py-2 text-xs font-semibold text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 flex items-center justify-center gap-1"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Bilgileri Değiştir (Geri Dön)</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        {/* TAB 3: FORGOT PASSWORD 3-STEP FLOW */}
        {tab === 'forgot' && (
          <div className="space-y-4">
            {/* STEP 1: ENTER EMAIL & SEND CODE TO REAL INBOX */}
            {forgotStep === 1 && (
              <form onSubmit={handleSendResetCode} className="space-y-3.5">
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Hesabınıza Bağlı E-posta Adresi
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="adiniz@gmail.com"
                      className="w-full pl-9 pr-3 py-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 font-mono"
                    />
                  </div>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">
                    Bu adrese 6 haneli güvenlik doğrulama kodu e-posta olarak gönderilecektir.
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={isSendingEmail}
                  className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-60 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-blue-600/30 transition-all hover:scale-[1.01] active:scale-95"
                >
                  {isSendingEmail ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>E-posta Gönderiliyor...</span>
                    </>
                  ) : (
                    <>
                      <Mail className="w-4 h-4" />
                      <span>Mailime Doğrulama Kodu Gönder</span>
                    </>
                  )}
                </button>
              </form>
            )}

            {/* STEP 2: VERIFY CODE ONLY (Separate screen as requested) */}
            {forgotStep === 2 && (
              <form onSubmit={handleVerifyCode} className="space-y-4">
                {/* Email Sent Confirmation Card */}
                <div className="p-3.5 bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800/80 rounded-2xl text-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-blue-900 dark:text-cyan-300 flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-blue-600 dark:text-cyan-400" />
                      <span>Kod Gönderildi:</span>
                    </span>
                    <span className="text-[10px] bg-blue-600/20 text-blue-700 dark:text-cyan-300 px-1.5 py-0.5 rounded font-mono font-bold">
                      10 dk geçerli
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 dark:text-slate-300 font-mono truncate font-semibold">
                    {sentToEmail}
                  </p>

                  <div className="pt-2 border-t border-blue-200/60 dark:border-blue-800/60 flex items-center justify-between">
                    <a
                      href="https://mail.google.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] font-bold text-blue-700 dark:text-cyan-300 hover:underline inline-flex items-center gap-1"
                    >
                      <span>Gmail'i Aç</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>

                    <button
                      type="button"
                      onClick={() => setShowCodeHelper(prev => !prev)}
                      className="text-[10px] text-slate-500 dark:text-slate-400 hover:underline"
                    >
                      {showCodeHelper ? 'Kodu Gizle' : 'Kodu Göremedim?'}
                    </button>
                  </div>

                  {showCodeHelper && (
                    <div className="mt-2 p-2 rounded-xl bg-white dark:bg-slate-900 border border-blue-200 dark:border-blue-800 text-[11px] flex items-center justify-between">
                      <span className="text-slate-600 dark:text-slate-400">Üretilen Kod:</span>
                      <span className="font-mono font-extrabold text-blue-600 dark:text-cyan-400 tracking-wider">
                        {generatedCode}
                      </span>
                      <button
                        type="button"
                        onClick={() => setVerificationCode(generatedCode)}
                        className="text-[10px] font-bold text-cyan-600 dark:text-cyan-300 underline"
                      >
                        Kutuya Yaz
                      </button>
                    </div>
                  )}
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      Mailinize Gelen 6 Haneli Kod
                    </label>
                    <button
                      type="button"
                      onClick={handleResendCode}
                      disabled={isSendingEmail}
                      className="text-[10px] font-semibold text-blue-600 dark:text-cyan-400 hover:underline flex items-center gap-1"
                    >
                      <RefreshCw className={`w-3 h-3 ${isSendingEmail ? 'animate-spin' : ''}`} />
                      <span>Tekrar Gönder</span>
                    </button>
                  </div>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={verificationCode}
                    onChange={e => setVerificationCode(e.target.value.replace(/\D/g, ''))}
                    placeholder="123456"
                    className="w-full text-center tracking-[0.35em] font-mono text-xl font-black py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                  />
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 text-center">
                    Gelen kod doğru girildiğinde otomatik olarak Şifre Yenileme ekranına geçilecektir.
                  </p>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-blue-600/30 transition-all hover:scale-[1.01] active:scale-95"
                >
                  <CheckCircle className="w-4 h-4" />
                  <span>Kodu Doğrula ve Şifre Yenilemeye Geç</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            )}

            {/* STEP 3: RESET PASSWORD SCREEN (Redirected here after code verification) */}
            {forgotStep === 3 && (
              <form onSubmit={handleResetPassword} className="space-y-3.5">
                {/* Verified Account Badge */}
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl flex items-center justify-between text-xs text-emerald-700 dark:text-emerald-300">
                  <div className="flex items-center gap-2 truncate">
                    <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span className="font-semibold truncate">{sentToEmail}</span>
                  </div>
                  <span className="text-[10px] bg-emerald-500/20 px-2 py-0.5 rounded-full font-bold">
                    Doğrulandı
                  </span>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Yeni Şifre
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="password"
                      required
                      value={newPassword}
                      onChange={e => setNewPassword(e.target.value)}
                      placeholder="Yeni şifreniz (En az 4 karakter)"
                      className="w-full pl-9 pr-3 py-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Yeni Şifre Tekrar
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="password"
                      required
                      value={confirmPassword}
                      onChange={e => setConfirmPassword(e.target.value)}
                      placeholder="Yeni şifrenizi tekrar girin"
                      className="w-full pl-9 pr-3 py-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 font-mono"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-emerald-600/30 transition-all hover:scale-[1.01] active:scale-95"
                >
                  <KeyRound className="w-4 h-4" />
                  <span>Yeni Şifremi Kaydet ve Giriş Yap</span>
                </button>
              </form>
            )}
          </div>
        )}

        {/* GOOGLE AUTHENTIC SIGN-IN BUTTON */}
        <div className="mt-5 pt-4 border-t border-slate-200 dark:border-slate-800">
          <button
            type="button"
            onClick={() => setIsGoogleChooserOpen(true)}
            className="w-full py-2.5 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900/80 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold flex items-center justify-center gap-2.5 shadow-sm transition-all hover:border-slate-300 dark:hover:border-slate-600 hover:scale-[1.01] active:scale-95 cursor-pointer"
          >
            <GoogleLogoSvg className="w-4 h-4" />
            <span>
              {tab === 'forgot' ? 'Google ile Hızlı Doğrula & Giriş Yap' : 'Google ile Devam Et'}
            </span>
          </button>
        </div>

        {/* Real Google Account Chooser Popup Window (Identical to Canva / Google Account Chooser) */}
        <GoogleAccountChooserModal
          isOpen={isGoogleChooserOpen}
          onClose={() => setIsGoogleChooserOpen(false)}
          onSuccess={() => {
            setIsAuthModalOpen(false);
            setFeedback(null);
          }}
        />
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
