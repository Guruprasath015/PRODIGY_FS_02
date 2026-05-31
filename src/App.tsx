import { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import EmployeesPage from './pages/EmployeesPage';
import Sidebar from './components/Sidebar';
import { Menu } from 'lucide-react';

type Page = 'dashboard' | 'employees';

function AppLayout() {
  const { user, loading } = useAuth();
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (!user) {
    return <LoginPage />;
  }

  return (
    <div className="min-h-screen bg-slate-100 flex">
      <Sidebar
        currentPage={currentPage}
        onNavigate={(page) => setCurrentPage(page as Page)}
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed((v) => !v)}
      />

      {/* Main content */}
      <div
        className={`flex-1 flex flex-col min-h-screen transition-all duration-300
          ${sidebarCollapsed ? 'lg:ml-16' : 'lg:ml-64'}`}
      >
        {/* Top bar */}
        <header className="bg-white border-b border-slate-200 px-4 sm:px-6 py-4 flex items-center gap-4 sticky top-0 z-10 shadow-sm">
          <button
            onClick={() => setSidebarCollapsed((v) => !v)}
            className="lg:hidden p-2 rounded-lg hover:bg-slate-100 text-slate-500 transition"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-sm font-semibold text-slate-700 capitalize">{currentPage}</h2>
            <p className="text-xs text-slate-400 hidden sm:block">
              {currentPage === 'dashboard' ? 'Overview & statistics' : 'Manage your workforce'}
            </p>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 sm:p-6">
          {currentPage === 'dashboard' && <DashboardPage />}
          {currentPage === 'employees' && <EmployeesPage />}
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppLayout />
    </AuthProvider>
  );
}
