import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

import { useDocumentStore } from './store/documentStore';
import { useConversationStore } from './store/conversationStore';
import { useAuthStore } from './store/authStore';

import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import ChatView from './components/ChatView';
import SearchView from './components/SearchView';
import ChunksView from './components/ChunksView';
import UploadDialog from './components/UploadDialog';
import ProtectedRoute from './components/ProtectedRoute';
import { ErrorBoundary } from './components/ErrorBoundary';

import Login from './pages/Login';
import Register from './pages/Register';

const Dashboard: React.FC = () => {
  const { activeTab, fetchDocuments } = useDocumentStore();
  const { loadChats } = useConversationStore();

  const token = useAuthStore((state) => state.token);
  const user = useAuthStore((state) => state.user);

  const [isUploadOpen, setIsUploadOpen] = useState(false);

  useEffect(() => {
    if (token && user) {
      fetchDocuments();
      loadChats();
    }
  }, [token, user, fetchDocuments, loadChats]);

  return (
    <div
      className="
        flex
        flex-col
        h-screen
        overflow-hidden
        bg-[var(--bg-primary)]
        text-[var(--text-primary)]
        transition-colors
        duration-300
      "
    >
      <Navbar onUploadClick={() => setIsUploadOpen(true)} />

      <div className="flex flex-1 overflow-hidden">
        <Sidebar onUploadClick={() => setIsUploadOpen(true)} />

        <main className="flex-1 overflow-hidden">
          {activeTab === 'chat' && <ChatView />}
          {activeTab === 'search' && <SearchView />}
          {activeTab === 'chunks' && <ChunksView />}
        </main>
      </div>

      <UploadDialog
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
      />
    </div>
  );
};

const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected Application Routes */}
          {/* 
          <Route element={<ProtectedRoute />}>
          */}
            <Route path="/" element={<Dashboard />} />
            <Route path="/*" element={<Navigate to="/" replace />} />
          {/*
          </Route>
          */}
        </Routes>

        {/* Theme-aware global toast */}
        <Toaster
          position="bottom-right"
          gutter={10}
          toastOptions={{
            duration: 3500,

            style: {
              background: 'var(--bg-secondary)',
              color: 'var(--text-primary)',
              border: '1px solid var(--border-primary)',
              borderRadius: '12px',
              fontSize: '14px',
              boxShadow: '0 10px 30px rgba(0, 0, 0, 0.15)',
              transition:
                'background-color 0.25s ease, color 0.25s ease, border-color 0.25s ease',
            },

            success: {
              iconTheme: {
                primary: '#22c55e',
                secondary: 'var(--bg-secondary)',
              },
            },

            error: {
              iconTheme: {
                primary: '#ef4444',
                secondary: 'var(--bg-secondary)',
              },
            },
          }}
        />
      </BrowserRouter>
    </ErrorBoundary>
  );
};

export default App;
