import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  MessageSquare,
  Send,
  Sparkles,
  Radio,
  Film,
  Plus,
  ThumbsUp,
  CheckCircle,
  Clapperboard,
} from 'lucide-react';

export const CommunityRoom: React.FC = () => {
  const {
    communityMessages,
    sendCommunityMessage,
    currentUser,
    seriesList,
    seriesRequests,
    addSeriesRequest,
    upvoteSeriesRequest,
    allUsers,
    viewUserProfile,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'chat' | 'requests'>('chat');
  const [inputText, setInputText] = useState('');
  const [selectedMention, setSelectedMention] = useState<string>('');

  // Series Request Form State
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [reqTitle, setReqTitle] = useState('');
  const [reqGenre, setReqGenre] = useState('Bilim Kurgu');
  const [reqDesc, setReqDesc] = useState('');
  const [reqSuccess, setReqSuccess] = useState(false);

  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    sendCommunityMessage(inputText, selectedMention || undefined);
    setInputText('');
    setSelectedMention('');
  };

  const handleQuickReaction = (emoji: string) => {
    sendCommunityMessage(emoji, selectedMention || undefined);
  };

  const handleCreateRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reqTitle.trim() || !reqDesc.trim()) return;
    addSeriesRequest(reqTitle, reqGenre, reqDesc);
    setReqTitle('');
    setReqDesc('');
    setShowRequestForm(false);
    setReqSuccess(true);
    setTimeout(() => setReqSuccess(false), 3000);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 h-[calc(100vh-5rem)] flex flex-col">
      {/* Community Room Header */}
      <div className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-[#0b1222] border border-slate-200 dark:border-blue-900/30 shadow-xl mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-blue-600/10 dark:bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-600 dark:text-blue-400">
            <Radio className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-slate-900 dark:text-white font-display">
                Minimo Topluluk & İstek Odası
              </h1>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
                CANLI
              </span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Canlı sohbet odasında bölümleri tartışın veya çekilmesini istediğiniz yeni mini dizileri önerin.
            </p>
          </div>
        </div>

        {/* Tab Switcher: Chat vs Series Requests */}
        <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 self-start sm:self-auto">
          <button
            onClick={() => setActiveTab('chat')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors ${
              activeTab === 'chat'
                ? 'bg-blue-600 text-white shadow'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Canlı Sohbet</span>
          </button>

          <button
            onClick={() => setActiveTab('requests')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors ${
              activeTab === 'requests'
                ? 'bg-blue-600 text-white shadow'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Clapperboard className="w-3.5 h-3.5" />
            <span>Dizi İstek Panosu ({seriesRequests.length})</span>
          </button>
        </div>
      </div>

      {/* View 1: Canlı Sohbet Odası */}
      {activeTab === 'chat' && (
        <div className="flex-1 bg-white dark:bg-[#090e1c] border border-slate-200 dark:border-blue-900/30 rounded-3xl overflow-hidden flex flex-col shadow-2xl">
          {/* Pinned Broadcast announcement */}
          <div className="px-4 py-2.5 bg-blue-50 dark:bg-blue-950/60 border-b border-blue-200 dark:border-blue-900/40 flex items-center justify-between text-xs text-blue-900 dark:text-blue-300">
            <div className="flex items-center gap-2 truncate">
              <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
              <span className="font-semibold text-slate-900 dark:text-white">Sabitlenen Duyuru:</span>
              <span className="truncate">Yeni bir mini dizi fikrin mi var? "Dizi İstek Panosu" sekmesinden yapımcı ekibe ilet!</span>
            </div>
            <button
              onClick={() => setActiveTab('requests')}
              className="text-[11px] font-bold text-blue-600 dark:text-cyan-400 hover:underline shrink-0 ml-2"
            >
              İstek Gönder
            </button>
          </div>

          {/* Messages Scroll Area */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 no-scrollbar">
            {communityMessages.length === 0 ? (
              <div className="h-full min-h-[220px] flex flex-col items-center justify-center p-8 text-center my-auto">
                <div className="w-14 h-14 rounded-2xl bg-blue-600/10 dark:bg-blue-600/20 text-blue-500 dark:text-cyan-400 flex items-center justify-center mb-3">
                  <MessageSquare className="w-7 h-7" />
                </div>
                <h4 className="text-sm font-bold text-slate-800 dark:text-white mb-1">
                  Topluluk Odasına Hoş Geldiniz!
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs">
                  Henüz mesaj yazılmadı. Canlı yayındaki tüm izleyicilerle sohbet etmek için ilk mesajı aşağıdan gönderebilirsiniz.
                </p>
              </div>
            ) : (
              communityMessages.map(msg => {
                const isMe = msg.userId === currentUser.id;
                const senderUser = allUsers.find(u => u.id === msg.userId || u.displayName === msg.userName);

                return (
                  <div
                    key={msg.id}
                    className={`flex items-start gap-3 ${isMe ? 'flex-row-reverse' : ''}`}
                  >
                    <button
                      type="button"
                      onClick={() => senderUser && viewUserProfile(senderUser)}
                      title={`${msg.userName} profilini gör`}
                      className="cursor-pointer group shrink-0"
                    >
                      <img
                        src={msg.userAvatar}
                        alt={msg.userName}
                        referrerPolicy="no-referrer"
                        className="w-9 h-9 rounded-full object-cover border border-blue-500/20 group-hover:ring-2 ring-blue-500 transition-all"
                      />
                    </button>

                    <div className={`max-w-md ${isMe ? 'items-end' : 'items-start'} flex flex-col`}>
                      <div className="flex items-center gap-2 mb-1">
                        <button
                          type="button"
                          onClick={() => senderUser && viewUserProfile(senderUser)}
                          className="text-xs font-bold text-slate-800 dark:text-slate-200 hover:text-blue-500 dark:hover:text-cyan-400 cursor-pointer transition-colors"
                        >
                          {msg.userName}
                        </button>
                        {msg.role === 'admin' && (
                          <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-700 dark:text-amber-300 font-bold">
                            YÖNETİCİ
                          </span>
                        )}
                        {msg.role === 'moderator' && (
                          <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 font-bold">
                            MODERATÖR
                          </span>
                        )}
                        <span className="text-[10px] text-slate-400 font-mono">{msg.timestamp}</span>
                      </div>

                    <div
                      className={`p-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                        isMe
                          ? 'bg-blue-600 text-white rounded-tr-none shadow-md shadow-blue-600/20'
                          : 'bg-slate-100 dark:bg-slate-900/90 text-slate-900 dark:text-slate-200 border border-slate-200 dark:border-slate-800 rounded-tl-none'
                      }`}
                    >
                      {msg.seriesMention && (
                        <div className="mb-1 text-[11px] font-semibold text-blue-600 dark:text-sky-300 flex items-center gap-1">
                          <Film className="w-3 h-3" />
                          <span>#{msg.seriesMention}</span>
                        </div>
                      )}
                      <p>{msg.text}</p>
                    </div>
                  </div>
                </div>
              );
            })
          )}
          </div>

          {/* Quick Reactions Bar */}
          <div className="px-4 py-2 bg-slate-50 dark:bg-slate-950/80 border-t border-slate-200 dark:border-slate-800/80 flex items-center justify-between gap-2 overflow-x-auto no-scrollbar">
            <div className="flex items-center gap-1.5 text-xs">
              <span className="text-slate-500 dark:text-slate-400 text-[11px] mr-1 hidden sm:inline">Hızlı Tepki:</span>
              {['🔥 Harika!', '🍿 Patlamış Mısır', '💙 Çok duygusal', '😱 Şoktayım!', '✨ 10/10'].map(r => (
                <button
                  key={r}
                  onClick={() => handleQuickReaction(r)}
                  className="px-2.5 py-1 rounded-full bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-300 dark:border-slate-800 text-slate-700 dark:text-slate-300 text-xs whitespace-nowrap transition-colors"
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          {/* Input Bar */}
          <form
            onSubmit={handleSendChat}
            className="p-3 sm:p-4 bg-white dark:bg-[#0a0f1d] border-t border-slate-200 dark:border-blue-900/40 flex items-center gap-2"
          >
            <select
              value={selectedMention}
              onChange={e => setSelectedMention(e.target.value)}
              className="px-2.5 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-300 focus:outline-none focus:border-blue-500 hidden sm:block max-w-[130px]"
            >
              <option value="">Dizi Etiketi Yok</option>
              {seriesList.map(s => (
                <option key={s.id} value={s.title}>
                  #{s.title}
                </option>
              ))}
            </select>

            <input
              type="text"
              value={inputText}
              onChange={e => setInputText(e.target.value)}
              placeholder="Minimo topluluğu ile sohbet et..."
              className="flex-1 px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 text-xs focus:outline-none focus:border-blue-500"
            />

            <button
              type="submit"
              className="p-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white transition-colors flex items-center justify-center shrink-0 shadow-md shadow-blue-600/30"
              aria-label="Gönder"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}

      {/* View 2: Dizi İstek Panosu */}
      {activeTab === 'requests' && (
        <div className="flex-1 bg-white dark:bg-[#090e1c] border border-slate-200 dark:border-blue-900/30 rounded-3xl overflow-hidden flex flex-col p-4 sm:p-6 shadow-2xl">
          {/* Header Action Bar */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800 mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">İzleyici Dizi Talepleri & Oylama</h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                En çok oy alan mini dizi fikirleri yapımcı ekibimiz tarafından dikey formatta çekilmektedir.
              </p>
            </div>

            <button
              onClick={() => setShowRequestForm(prev => !prev)}
              className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-md"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{showRequestForm ? 'Formu Gizle' : 'Yeni Dizi İste'}</span>
            </button>
          </div>

          {reqSuccess && (
            <div className="mb-4 p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-xs font-semibold flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>Dizi talebiniz başarıyla panoya eklendi! Topluluk oylaması başladı.</span>
            </div>
          )}

          {/* New Request Form Modal/Collapsible */}
          {showRequestForm && (
            <form onSubmit={handleCreateRequest} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/90 border border-slate-300 dark:border-blue-900/40 mb-5 space-y-3 animate-in fade-in">
              <h4 className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-cyan-400">
                Yeni Dizi Talebi Oluştur
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  type="text"
                  value={reqTitle}
                  onChange={e => setReqTitle(e.target.value)}
                  placeholder="Dizi Adı / Fikir Başlığı (Örn: Zamanın Ötesinde)"
                  required
                  className="px-3 py-2 text-xs bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
                />

                <select
                  value={reqGenre}
                  onChange={e => setReqGenre(e.target.value)}
                  className="px-3 py-2 text-xs bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="Bilim Kurgu">Bilim Kurgu</option>
                  <option value="Dram & Gerilim">Dram & Gerilim</option>
                  <option value="Romantik">Romantik</option>
                  <option value="Komedi">Komedi</option>
                  <option value="Gizem & Polisiye">Gizem & Polisiye</option>
                  <option value="Aksiyon">Aksiyon</option>
                </select>
              </div>

              <textarea
                value={reqDesc}
                onChange={e => setReqDesc(e.target.value)}
                rows={3}
                placeholder="Bu mini dizide ne anlatılmalı? Karakterler, atmosfer ve kritik olay örgüsü..."
                required
                className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
              />

              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowRequestForm(false)}
                  className="px-3 py-1.5 text-xs text-slate-500 hover:text-slate-900 dark:hover:text-white"
                >
                  Vazgeç
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-600/30 transition-colors"
                >
                  Talebi Yayınla
                </button>
              </div>
            </form>
          )}

          {/* Requests List */}
          <div className="flex-1 overflow-y-auto space-y-3 no-scrollbar pr-1">
            {seriesRequests.map(req => {
              const hasUpvoted = req.upvotedByUserIds.includes(currentUser.id);

              return (
                <div
                  key={req.id}
                  className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                >
                  <div className="flex items-start gap-3.5 flex-1 min-w-0">
                    <img
                      src={req.userAvatar}
                      alt={req.userName}
                      referrerPolicy="no-referrer"
                      className="w-10 h-10 rounded-full object-cover shrink-0 mt-0.5 border border-blue-500/30"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white">{req.title}</h4>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-500/15 text-blue-700 dark:text-blue-400 font-semibold">
                          {req.genre}
                        </span>
                        <span
                          className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded ${
                            req.status === 'Yayında'
                              ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                              : req.status === 'Çekim Aşamasında'
                              ? 'bg-cyan-500/20 text-cyan-600 dark:text-cyan-400'
                              : 'bg-amber-500/20 text-amber-700 dark:text-amber-400'
                          }`}
                        >
                          {req.status}
                        </span>
                      </div>

                      <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-1.5">{req.description}</p>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {req.userName} tarafından önerildi · {req.createdAt}
                      </span>
                    </div>
                  </div>

                  {/* Upvote Button */}
                  <button
                    onClick={() => upvoteSeriesRequest(req.id)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all shrink-0 ${
                      hasUpvoted
                        ? 'bg-cyan-500/20 text-cyan-700 dark:text-cyan-300 border border-cyan-500/40'
                        : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-700'
                    }`}
                  >
                    <ThumbsUp className={`w-3.5 h-3.5 ${hasUpvoted ? 'fill-current' : ''}`} />
                    <span>{req.upvotes} Destek</span>
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
