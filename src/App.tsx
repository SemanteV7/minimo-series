/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { NetflixHome } from './components/NetflixHome';
import { ReelsPlayer } from './components/ReelsPlayer';
import { CommunityRoom } from './components/CommunityRoom';
import { AdminPanel } from './components/AdminPanel';
import { ProfileView } from './components/ProfileView';
import { DirectMessagesModal } from './components/DirectMessagesModal';
import { InfoModals } from './components/InfoModals';
import { LibraryView } from './components/LibraryView';
import { AdvancedSearchModal } from './components/AdvancedSearchModal';
import { AuthModal } from './components/AuthModal';

const MainContent: React.FC = () => {
  const { activeView } = useApp();

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-[#070b14] text-slate-900 dark:text-slate-100 transition-colors duration-200">
      <Navbar />

      <main className={`w-full ${activeView === 'reels' ? '' : 'pb-16 md:pb-0'}`}>
        {activeView === 'home' && <NetflixHome />}
        {activeView === 'reels' && <ReelsPlayer />}
        {activeView === 'library' && <LibraryView />}
        {activeView === 'community' && <CommunityRoom />}
        {activeView === 'admin' && <AdminPanel />}
        {activeView === 'profile' && <ProfileView />}
      </main>

      {/* Global Modals */}
      <DirectMessagesModal />
      <InfoModals />
      <AdvancedSearchModal />
      <AuthModal />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainContent />
    </AppProvider>
  );
}
