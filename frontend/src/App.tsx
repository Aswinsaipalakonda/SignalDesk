import React, { useCallback, useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Sidebar } from './components/layout/Sidebar';
import { Topbar } from './components/layout/Topbar';
import { Dashboard } from './pages/Dashboard';
import { AnalyzeTicket } from './pages/AnalyzeTicket';
import { TicketExplorer } from './pages/TicketExplorer';
import { ModelPerformance } from './pages/ModelPerformance';
import { About } from './pages/About';
import { api } from './services/api';
import { ClassificationSummary, HealthStatus, Ticket } from './types';

const PAGES = ['overview', 'analyze', 'explorer', 'performance', 'about'] as const;

const PAGE_TITLES: Record<string, string> = {
  overview: 'Overview Dashboard',
  analyze: 'Analyze Ticket',
  explorer: 'Ticket Explorer',
  performance: 'Model Performance',
  about: 'About SignalDesk',
};

function pageFromHash(): string {
  const hash = window.location.hash.replace(/^#\/?/, '');
  return (PAGES as readonly string[]).includes(hash) ? hash : 'overview';
}

export const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<string>(pageFromHash());
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [lastClassified, setLastClassified] = useState<ClassificationSummary | undefined>();
  const [focusedTicket, setFocusedTicket] = useState<Ticket | null>(null);

  const navigate = useCallback((page: string) => {
    const next = (PAGES as readonly string[]).includes(page) ? page : 'overview';
    setCurrentPage(next);
    setSidebarOpen(false);
    window.location.hash = `/${next}`;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  useEffect(() => {
    const onHashChange = () => setCurrentPage(pageFromHash());
    window.addEventListener('hashchange', onHashChange);
    if (!window.location.hash) {
      window.history.replaceState(null, '', '#/overview');
    }
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  useEffect(() => {
    let cancelled = false;

    const loadHealth = async () => {
      try {
        const status = await api.getHealth();
        if (!cancelled) setHealth(status);
      } catch {
        if (!cancelled) setHealth(null);
      }
    };

    loadHealth();
    const interval = window.setInterval(loadHealth, 60000);
    return () => {
      cancelled = true;
      window.clearInterval(interval);
    };
  }, []);

  const openTicket = useCallback(
    (ticket: Ticket) => {
      setFocusedTicket(ticket);
      navigate('explorer');
    },
    [navigate],
  );

  const renderPage = () => {
    switch (currentPage) {
      case 'analyze':
        return (
          <AnalyzeTicket
            onTicketClassified={(summary) => setLastClassified(summary)}
          />
        );
      case 'explorer':
        return (
          <TicketExplorer
            initialTicket={focusedTicket}
            onInitialTicketHandled={() => setFocusedTicket(null)}
          />
        );
      case 'performance':
        return <ModelPerformance />;
      case 'about':
        return <About onAnalyzeClick={() => navigate('analyze')} />;
      case 'overview':
      default:
        return (
          <Dashboard
            onNavigate={navigate}
            lastClassified={lastClassified}
            onSelectTicket={openTicket}
          />
        );
    }
  };

  return (
    <div className="flex min-h-screen bg-canvas">
      <Sidebar
        currentPage={currentPage}
        onPageChange={navigate}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        health={health}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar
          currentPageTitle={PAGE_TITLES[currentPage] || 'Overview'}
          onMenuClick={() => setSidebarOpen(true)}
          onNavigateAnalyze={() => navigate('analyze')}
          onSelectTicket={openTicket}
        />

        <main className="flex-1 overflow-x-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentPage}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
            >
              {renderPage()}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
};

export default App;
