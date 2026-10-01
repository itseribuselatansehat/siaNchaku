/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { BottomNavigation } from './components/BottomNavigation';
import { ActiveAlertsBanner } from './components/ActiveAlertsBanner';
import { MorningBriefingModal } from './components/MorningBriefingModal';
import { EveningReviewModal } from './components/EveningReviewModal';
import { QuickAddModal } from './components/QuickAddModal';
import { GlobalSearchModal } from './components/GlobalSearchModal';
import { OfflineIndicator } from './components/OfflineIndicator';

// Views
import { DashboardView } from './views/DashboardView';
import { TasksView } from './views/TasksView';
import { SchedulesView } from './views/SchedulesView';
import { NotesView } from './views/NotesView';
import { RemindersView } from './views/RemindersView';
import { FollowUpsView } from './views/FollowUpsView';
import { AiAssistantView } from './views/AiAssistantView';
import { StatsView } from './views/StatsView';
import { ActivityLogView } from './views/ActivityLogView';
import { GasIntegrationView } from './views/GasIntegrationView';
import { SettingsView } from './views/SettingsView';

function AppContent() {
  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);

  const renderActiveView = () => {
    switch (currentTab) {
      case 'dashboard':
        return <DashboardView onNavigateTab={setCurrentTab} />;
      case 'tasks':
        return <TasksView />;
      case 'schedules':
        return <SchedulesView />;
      case 'notes':
        return <NotesView />;
      case 'reminders':
        return <RemindersView />;
      case 'followups':
        return <FollowUpsView />;
      case 'ai':
        return <AiAssistantView />;
      case 'stats':
        return <StatsView />;
      case 'activities':
        return <ActivityLogView />;
      case 'gas':
        return <GasIntegrationView />;
      case 'settings':
        return <SettingsView />;
      default:
        return <DashboardView onNavigateTab={setCurrentTab} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors">
      {/* Active Floating Alert Toasts */}
      <ActiveAlertsBanner />

      {/* Offline Status Pill */}
      <OfflineIndicator />

      {/* Morning Briefing & Evening Review Modals */}
      <MorningBriefingModal />
      <EveningReviewModal />

      {/* Unified Fast NLP Quick Add Modal */}
      <QuickAddModal />

      {/* Global Search Modal (Ctrl+K) */}
      <GlobalSearchModal onNavigateTab={setCurrentTab} />

      {/* Desktop Sidebar & Mobile Drawer */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      {/* Main App Layout */}
      <div className="flex-1 md:pl-64 flex flex-col min-h-screen transition-all">
        {/* Header Bar */}
        <Header
          onToggleSidebar={() => setIsSidebarOpen(prev => !prev)}
          onOpenAi={() => setCurrentTab('ai')}
        />

        {/* Dynamic Main Body Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto pb-24 md:pb-12">
          {renderActiveView()}
        </main>

        {/* Mobile Bottom Navigation Bar */}
        <BottomNavigation
          currentTab={currentTab}
          onSelectTab={setCurrentTab}
          onOpenMenu={() => setIsSidebarOpen(true)}
        />
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
