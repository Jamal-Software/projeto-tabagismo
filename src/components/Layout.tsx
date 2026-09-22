import { Outlet, Link, useLocation } from 'react-router-dom';
import { Home, Users, Upload, Download } from 'lucide-react';
import { useAppContext } from '../lib/AppContext';
import { exportODS } from '../lib/odsUtils';

export default function Layout() {
  const location = useLocation();
  const { isFileLoaded, odsData } = useAppContext();
  
  const handleExport = () => {
    if (odsData) {
      exportODS(odsData);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--color-background)] pb-20 md:pb-0 md:pt-16">
      {/* Mobile Header */}
      <header className="fixed top-0 left-0 right-0 h-16 bg-[var(--color-primary)] text-white shadow-md z-10 flex items-center px-4 md:hidden">
        <h1 className="text-xl font-bold">INCA Tabagismo</h1>
        {isFileLoaded && (
          <button 
            onClick={handleExport}
            className="ml-auto bg-[var(--color-accent)] text-[var(--color-text)] p-2 rounded-full shadow-lg"
            title="Salvar e Baixar"
          >
            <Download size={20} />
          </button>
        )}
      </header>

      {/* Desktop Sidebar/Header */}
      <header className="hidden md:flex fixed top-0 left-0 right-0 h-16 bg-[var(--color-primary)] text-white shadow-md z-10 items-center px-6">
        <h1 className="text-xl font-bold mr-8">INCA Tabagismo</h1>
        
        <nav className="flex space-x-6 flex-1">
          <Link to="/upload" className={`flex items-center space-x-2 hover:text-[var(--color-accent)] ${location.pathname === '/upload' ? 'text-[var(--color-accent)] font-semibold' : ''}`}>
            <Upload size={18} />
            <span>Arquivo</span>
          </Link>
          
          {isFileLoaded && (
            <>
              <Link to="/dashboard" className={`flex items-center space-x-2 hover:text-[var(--color-accent)] ${location.pathname === '/dashboard' ? 'text-[var(--color-accent)] font-semibold' : ''}`}>
                <Home size={18} />
                <span>Dashboard</span>
              </Link>
              <Link to="/patients" className={`flex items-center space-x-2 hover:text-[var(--color-accent)] ${location.pathname.startsWith('/patients') ? 'text-[var(--color-accent)] font-semibold' : ''}`}>
                <Users size={18} />
                <span>Atendimentos</span>
              </Link>
            </>
          )}
        </nav>
        
        {isFileLoaded && (
          <button 
            onClick={handleExport}
            className="bg-[var(--color-accent)] text-[var(--color-text)] px-4 py-2 rounded-md font-medium flex items-center space-x-2 shadow hover:opacity-90"
          >
            <Download size={18} />
            <span>Salvar e Baixar</span>
          </button>
        )}
      </header>

      {/* Main Content */}
      <main className="p-4 md:p-8 max-w-7xl mx-auto mt-16 md:mt-0">
        <Outlet />
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-white border-t border-[var(--color-border)] flex justify-around items-center z-10 pb-safe">
        <Link to="/upload" className={`flex flex-col items-center justify-center w-full h-full ${location.pathname === '/upload' ? 'text-[var(--color-primary)]' : 'text-[var(--color-text-muted)]'}`}>
          <Upload size={24} />
          <span className="text-[10px] mt-1">Arquivo</span>
        </Link>
        
        {isFileLoaded && (
          <>
            <Link to="/dashboard" className={`flex flex-col items-center justify-center w-full h-full ${location.pathname === '/dashboard' ? 'text-[var(--color-primary)]' : 'text-[var(--color-text-muted)]'}`}>
              <Home size={24} />
              <span className="text-[10px] mt-1">Dashboard</span>
            </Link>
            <Link to="/patients" className={`flex flex-col items-center justify-center w-full h-full ${location.pathname.startsWith('/patients') ? 'text-[var(--color-primary)]' : 'text-[var(--color-text-muted)]'}`}>
              <Users size={24} />
              <span className="text-[10px] mt-1">Pacientes</span>
            </Link>
          </>
        )}
      </nav>
    </div>
  );
}
