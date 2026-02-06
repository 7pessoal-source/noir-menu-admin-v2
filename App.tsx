
import React, { createContext, useContext, useEffect, useState } from 'react';
import { HashRouter, Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import { supabase } from './admin/lib/supabase';
import { User } from './admin/types';
import LoginPage from './admin/pages/LoginPage';
import SignUpPage from './admin/pages/SignUpPage';
import DashboardPage from './admin/pages/DashboardPage';
import CategoriesPage from './admin/pages/CategoriesPage';
import ProductsPage from './admin/pages/ProductsPage';
import SettingsPage from './admin/pages/SettingsPage';
import { LayoutDashboard, Tag, Package, Settings, LogOut, Menu } from 'lucide-react';

// Auth Context
interface AuthContextType {
  user: any | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({ user: null, loading: true, signOut: async () => {} });

export const useAuth = () => useContext(AuthContext);

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="flex items-center justify-center h-screen bg-zinc-950 text-white">Carregando...</div>;
  if (!user) return <Navigate to="/admin/login" />;
  return <>{children}</>;
};

const AdminLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { signOut } = useAuth();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { label: 'Dashboard', path: '/admin', icon: LayoutDashboard },
    { label: 'Categorias', path: '/admin/categories', icon: Tag },
    { label: 'Produtos', path: '/admin/products', icon: Package },
    { label: 'Configurações', path: '/admin/settings', icon: Settings },
  ];

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-zinc-950 text-zinc-100">
      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between p-4 border-b border-zinc-800 bg-zinc-900 sticky top-0 z-50">
        <span className="font-bold text-xl tracking-tight text-white uppercase">Noir Admin</span>
        <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          <Menu className="w-6 h-6" />
        </button>
      </div>

      {/* Sidebar */}
      <aside className={`
        fixed inset-0 z-40 md:relative md:flex md:flex-col w-64 bg-zinc-900 border-r border-zinc-800 transition-transform duration-300
        ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <div className="p-6 hidden md:block">
          <h1 className="text-2xl font-bold tracking-tighter text-white uppercase italic">Noir Menu</h1>
          <p className="text-xs text-zinc-500 mt-1">Painel de Gerenciamento</p>
        </div>

        <nav className="flex-1 px-4 py-4 space-y-2 overflow-y-auto">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors font-medium ${
                location.pathname === item.path 
                  ? 'bg-zinc-800 text-white' 
                  : 'text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-200'
              }`}
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-zinc-800">
          <button 
            onClick={() => signOut()}
            className="flex items-center gap-3 px-4 py-3 w-full rounded-lg text-zinc-400 hover:bg-red-500/10 hover:text-red-500 transition-colors font-medium"
          >
            <LogOut className="w-5 h-5" />
            Sair
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 md:p-10 overflow-x-hidden">
        {children}
      </main>
    </div>
  );
};

export default function App() {
  const [user, setUser] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ user, loading, signOut }}>
      <HashRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/admin" />} />
          <Route path="/admin/login" element={<LoginPage />} />
          <Route path="/admin/signup" element={<SignUpPage />} />
          
          <Route path="/admin" element={
            <ProtectedRoute>
              <AdminLayout><DashboardPage /></AdminLayout>
            </ProtectedRoute>
          } />
          <Route path="/admin/categories" element={
            <ProtectedRoute>
              <AdminLayout><CategoriesPage /></AdminLayout>
            </ProtectedRoute>
          } />
          <Route path="/admin/products" element={
            <ProtectedRoute>
              <AdminLayout><ProductsPage /></AdminLayout>
            </ProtectedRoute>
          } />
          <Route path="/admin/settings" element={
            <ProtectedRoute>
              <AdminLayout><SettingsPage /></AdminLayout>
            </ProtectedRoute>
          } />
        </Routes>
      </HashRouter>
    </AuthContext.Provider>
  );
}
