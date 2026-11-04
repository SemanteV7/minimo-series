import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  X,
  Send,
  MessageCircle,
  Search,
  CheckCheck,
  User as UserIcon,
} from 'lucide-react';

export const DirectMessagesModal: React.FC = () => {
  const {
    isDmModalOpen,
    closeDmModal,
    currentUser,
    allUsers,
    directMessages,
    sendDirectMessage,
    activeDmUserId,
    openDmWithUser,
    viewUserProfile,
  } = useApp();

  const [messageText, setMessageText] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  if (!isDmModalOpen) return null;

  // Other users available for DM
  const otherUsers = allUsers.filter(u => u.id !== currentUser.id);
  const filteredUsers = otherUsers.filter(u =>
    u.displayName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const activePartnerId = activeDmUserId || otherUsers[0]?.id;
  const activePartner = allUsers.find(u => u.id === activePartnerId);

  // Messages between current user and active partner
  const conversation = directMessages.filter(
    m =>
      (m.senderId === currentUser.id && m.receiverId === activePartnerId) ||
      (m.senderId === activePartnerId && m.receiverId === currentUser.id)
  );

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim() || !activePartnerId) return;
    sendDirectMessage(activePartnerId, messageText);
    setMessageText('');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-in fade-in">
      <div className="bg-white dark:bg-[#0b1222] border border-slate-200 dark:border-blue-900/40 text-slate-800 dark:text-slate-100 rounded-3xl max-w-4xl w-full h-[620px] max-h-[90vh] overflow-hidden shadow-2xl flex flex-col md:flex-row">
        {/* Left Column: Contacts List */}
        <div className="w-full md:w-80 border-b md:border-b-0 md:border-r border-slate-200 dark:border-slate-800 flex flex-col bg-slate-50 dark:bg-[#070b14]/90">
          {/* Header */}
          <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageCircle className="w-5 h-5 text-blue-500 dark:text-blue-400" />
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">Kişisel Mesajlar (DM)</h3>
            </div>
            <button
              onClick={closeDmModal}
              className="md:hidden w-7 h-7 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 flex items-center justify-center"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Search Contacts */}
          <div className="p-3 border-b border-slate-200 dark:border-slate-800">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                placeholder="Kişilerde ara..."
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* Contacts */}
          <div className="flex-1 overflow-y-auto no-scrollbar p-2 space-y-1">
            {filteredUsers.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-400">
                Henüz başka bir kullanıcı bulunmuyor.
              </div>
            ) : (
              filteredUsers.map(user => {
              const isSelected = user.id === activePartnerId;
              // Latest message snippet
              const lastMsg = directMessages
                .filter(
                  m =>
                    (m.senderId === currentUser.id && m.receiverId === user.id) ||
                    (m.senderId === user.id && m.receiverId === currentUser.id)
                )
                .slice(-1)[0];

              return (
                <button
                  key={user.id}
                  onClick={() => openDmWithUser(user.id)}
                  className={`w-full p-2.5 rounded-2xl flex items-center gap-3 transition-colors text-left ${
                    isSelected
                      ? 'bg-blue-600/20 border border-blue-500/40 text-white'
                      : 'hover:bg-slate-900/80 text-slate-300'
                  }`}
                >
                  <div className="relative">
                    <img
                      src={user.avatar}
                      alt={user.displayName}
                      referrerPolicy="no-referrer"
                      className="w-10 h-10 rounded-full object-cover shrink-0"
                    />
                    <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-[#0b1222]"></span>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white truncate">
                        {user.displayName}
                      </span>
                      {lastMsg && (
                        <span className="text-[10px] text-slate-500 font-mono">
                          {lastMsg.timestamp}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-400 truncate">
                      {lastMsg ? lastMsg.text : user.bio}
                    </p>
                  </div>
                </button>
              );
            })
          )}
          </div>
        </div>

        {/* Right Column: Chat Window */}
        <div className="flex-1 flex flex-col bg-white dark:bg-[#0b1222]">
          {/* Chat Header */}
          <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-900/40">
            {activePartner ? (
              <div
                onClick={() => {
                  viewUserProfile(activePartner);
                  closeDmModal();
                }}
                className="flex items-center gap-3 cursor-pointer group"
                title={`${activePartner.displayName} profilini gör`}
              >
                <img
                  src={activePartner.avatar}
                  alt={activePartner.displayName}
                  referrerPolicy="no-referrer"
                  className="w-9 h-9 rounded-full object-cover group-hover:ring-2 ring-blue-500 transition-all"
                />
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-blue-500 transition-colors">
                    {activePartner.displayName}
                  </h4>
                  <span className="text-[10px] text-emerald-500 dark:text-emerald-400 font-medium">Çevrimiçi</span>
                </div>
              </div>
            ) : (
              <span className="text-xs text-slate-400">Bir kişi seçin</span>
            )}

            <div className="flex items-center gap-2">
              {activePartner && (
                <button
                  type="button"
                  onClick={() => {
                    viewUserProfile(activePartner);
                    closeDmModal();
                  }}
                  className="px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-blue-600 hover:text-white text-xs font-bold text-slate-700 dark:text-slate-300 transition-colors"
                >
                  Profili Gör
                </button>
              )}

              <button
                onClick={closeDmModal}
                className="w-8 h-8 rounded-full bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Messages Flow */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 no-scrollbar">
            {conversation.length === 0 ? (
              <div className="text-center py-16 text-xs text-slate-400">
                {activePartner ? `${activePartner.displayName} ile henüz bir konuşmanız yok. Bir selam yazın!` : 'Mesajlaşmak için soldan bir kullanıcı seçin.'}
              </div>
            ) : (
              conversation.map(msg => {
                const isMe = msg.senderId === currentUser.id;

                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                  >
                    <div
                      className={`max-w-[78%] px-4 py-2.5 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                        isMe
                          ? 'bg-blue-600 text-white rounded-tr-none'
                          : 'bg-slate-800 text-slate-200 rounded-tl-none'
                      }`}
                    >
                      <p>{msg.text}</p>
                    </div>
                    <div className="flex items-center gap-1 mt-1 text-[10px] text-slate-500 font-mono">
                      <span>{msg.timestamp}</span>
                      {isMe && <CheckCheck className="w-3 h-3 text-blue-400" />}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Message Input or Blocked Notice */}
          {activePartner && (currentUser.blockedUserIds || []).includes(activePartner.id) ? (
            <div className="p-4 border-t border-slate-800 bg-rose-950/20 flex items-center justify-between text-xs text-rose-300">
              <span>Bu kullanıcı engellendi. Mesajlaşmak için engeli kaldırmanız gerekir.</span>
            </div>
          ) : (
            <form
              onSubmit={handleSend}
              className="p-3 border-t border-slate-800 bg-slate-900/50 flex items-center gap-2"
            >
              <input
                type="text"
                value={messageText}
                onChange={e => setMessageText(e.target.value)}
                placeholder={`${activePartner?.displayName || 'Kişiye'} mesaj yaz...`}
                className="flex-1 px-4 py-2 text-xs bg-slate-950 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
              <button
                type="submit"
                disabled={!messageText.trim()}
                className="p-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white rounded-xl transition-colors"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
