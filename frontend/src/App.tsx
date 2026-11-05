import React, { useState } from 'react';
import { Sidebar } from './components/layout/Sidebar';
import { Topbar } from './components/layout/Topbar';
import { Dashboard } from './pages/Dashboard';
import { AnalyzeTicket } from './pages/AnalyzeTicket';
import { TicketExplorer } from './pages/TicketExplorer';
import { ModelPerformance } from './pages/ModelPerformance';
import { About } from './pages/About';

export const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState('overview');
  const [lastClassified, setLastClassified] = useState<{ category: string; priority: string }>({
    category: 'Billing & Payment',
    priority: 'High',
  });

  const renderContent = () => {
    switch (currentPage) {
      case 'overview':
        return (
          <Dashboard
            onNavigate={(page) => setCurrentPage(page)}
            lastClassified={lastClassified}
          />
        );
      case 'analyze':
        return (
          <AnalyzeTicket
            onTicketClassified={(result) => setLastClassified(result)}
          />
        );
      case 'explorer':
        return <TicketExplorer />;
      case 'performance':
        return <ModelPerformance />;
      case 'about':
        return <About />;
      default:
        return <Dashboard onNavigate={(page) => setCurrentPage(page)} />;
    }
  };

  const pageTitles: Record<string, string> = {
    overview: 'Overview',
    analyze: 'Analyze Ticket',
    explorer: 'Ticket Explorer',
    performance: 'Model Performance',
    about: 'About',
  };

  return (
    <div className="flex min-h-screen bg-surface-warm">
      <Sidebar currentPage={currentPage} onPageChange={(p) => setCurrentPage(p)} />
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar currentPageTitle={pageTitles[currentPage] || 'Dashboard'} />
        <main className="flex-1 overflow-y-auto">{renderContent()}</main>
      </div>
    </div>
  );
};

export default App;
