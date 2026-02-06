
import React, { useState } from 'react';
import { useNavigate, Navigate, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../../App';
import { LogIn, Mail, Lock, AlertCircle, UserPlus } from 'lucide-react';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  if (user) return <Navigate to="/admin" />;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('Erro de login:', error);
        if (error.message.includes('Invalid login credentials')) {
          setError('E-mail ou senha incorretos.');
        } else if (error.message.includes('Email not confirmed')) {
          setError('E-mail não confirmado. Verifique sua caixa de entrada.');
        } else {
          setError('Erro ao acessar. Verifique se sua Chave Anon do Supabase está correta.');
        }
        setLoading(false);
      } else {
        navigate('/admin');
      }
    } catch (err) {
      setError('Erro de conexão com o servidor.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-zinc-900 rounded-2xl border border-zinc-800 p-8 shadow-2xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white uppercase tracking-tighter italic">Noir Menu</h1>
          <p className="text-zinc-500 mt-2">Área Administrativa</p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-4 rounded-lg mb-6 flex items-start gap-3 animate-in fade-in zoom-in duration-300">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <p className="text-xs leading-relaxed">{error}</p>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-1">E-mail de Admin</label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 w-5 h-5 text-zinc-600" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-zinc-600 focus:border-transparent transition-all"
                placeholder="seu@email.com"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-1">Senha</label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 w-5 h-5 text-zinc-600" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-zinc-600 focus:border-transparent transition-all"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-white text-zinc-950 rounded-lg font-bold uppercase tracking-wide hover:bg-zinc-200 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? 'Autenticando...' : (
              <>
                <LogIn className="w-5 h-5" />
                Entrar no Painel
              </>
            )}
          </button>
        </form>
        
        <div className="mt-6 text-center">
          <Link to="/admin/signup" className="text-sm text-zinc-500 hover:text-white transition-colors flex items-center justify-center gap-2">
            <UserPlus className="w-4 h-4" />
            Não tem uma conta? Criar acesso
          </Link>
        </div>

        <div className="mt-8 pt-6 border-t border-zinc-800 text-center">
          <p className="text-[10px] text-zinc-600 uppercase tracking-[0.2em]">Noir Menu Digital Management</p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
