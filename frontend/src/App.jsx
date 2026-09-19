import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import Sidebar from './components/common/Sidebar';
import Header from './components/common/Header';
import Toast from './components/common/Toast';
import CreateSpaceModal from './components/upload/CreateSpaceModal';

// Pages
import SpacesPage from './pages/SpacesPage';
import SpaceOverviewPage from './pages/SpaceOverviewPage';
import TopicsPage from './pages/TopicsPage';
import QuestionsPage from './pages/QuestionsPage';
import FlashcardsPage from './pages/FlashcardsPage';
import QuizPage from './pages/QuizPage';
import DashboardPage from './pages/DashboardPage';

function AppContent() {
  const { route } = useApp();
  const [createSpaceOpen, setCreateSpaceOpen] = useState(false);

  const renderActivePage = () => {
    switch (route.page) {
      case 'spaces':
        return <SpacesPage onOpenCreateSpace={() => setCreateSpaceOpen(true)} />;
      case 'overview':
        return <SpaceOverviewPage />;
      case 'topics':
        return <TopicsPage />;
      case 'questions':
        return <QuestionsPage />;
      case 'flashcards':
        return <FlashcardsPage />;
      case 'quiz':
      case 'quiz-results':
        return <QuizPage />;
      case 'dashboard':
        return <DashboardPage />;
      default:
        return <SpacesPage onOpenCreateSpace={() => setCreateSpaceOpen(true)} />;
    }
  };

  return (
    <div className="app-layout">
      {/* Persistent Left Sidebar */}
      <Sidebar onOpenCreateSpace={() => setCreateSpaceOpen(true)} />

      {/* Main View Area */}
      <div className="app-main">
        <Header onOpenCreateSpace={() => setCreateSpaceOpen(true)} />

        <main className="content-wrapper">
          {renderActivePage()}
        </main>
      </div>

      {/* Create Space Modal */}
      <CreateSpaceModal
        isOpen={createSpaceOpen}
        onClose={() => setCreateSpaceOpen(false)}
      />

      {/* Global Toast Notification */}
      <Toast />
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
