
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { UserPlus, Mail, Lock, AlertCircle, CheckCircle2, ArrowLeft } from 'lucide-react';

const SignUpPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (password !== confirmPassword) {
      setError('As senhas não coincidem.');
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres.');
      setLoading(false);
      return;
    }

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        console.error('Erro de cadastro:', error);
        setError(error.message);
        setLoading(false);
      } else {
        setSuccess(true);
        setLoading(false);
      }
    } catch (err) {
      setError('Ocorreu um erro inesperado.');
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-4 text-center">
        <div className="w-full max-w-md bg-zinc-900 rounded-2xl border border-zinc-800 p-8 shadow-2xl">
          <CheckCircle2 className="w-16 h-16 text-emerald-500 mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-white mb-4">Conta Criada!</h2>
          <p className="text-zinc-400 mb-8 leading-relaxed">
            Um link de confirmação foi enviado para <strong>{email}</strong>. 
            Verifique seu e-mail para ativar sua conta e poder logar.
          </p>
          <button
            onClick={() => navigate('/admin/login')}
            className="w-full py-4 bg-white text-zinc-950 rounded-lg font-bold uppercase tracking-wide hover:bg-zinc-200 transition-colors"
          >
            Voltar para Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-zinc-900 rounded-2xl border border-zinc-800 p-8 shadow-2xl">
        <div className="mb-8">
          <Link to="/admin/login" className="text-zinc-500 hover:text-white flex items-center gap-2 mb-6 text-sm transition-colors w-fit">
            <ArrowLeft className="w-4 h-4" />
            Voltar
          </Link>
          <h1 className="text-3xl font-bold text-white uppercase tracking-tighter italic">Novo Admin</h1>
          <p className="text-zinc-500 mt-2">Crie seu acesso administrativo</p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-4 rounded-lg mb-6 flex items-start gap-3 animate-in fade-in zoom-in duration-300">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <p className="text-xs leading-relaxed">{error}</p>
          </div>
        )}

        <form onSubmit={handleSignUp} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-1">E-mail</label>
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
                placeholder="Mínimo 6 caracteres"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-1">Confirmar Senha</label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 w-5 h-5 text-zinc-600" />
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-zinc-600 focus:border-transparent transition-all"
                placeholder="Repita a senha"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-white text-zinc-950 rounded-lg font-bold uppercase tracking-wide hover:bg-zinc-200 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? 'Criando conta...' : (
              <>
                <UserPlus className="w-5 h-5" />
                Cadastrar Agora
              </>
            )}
          </button>
        </form>
        
        <div className="mt-8 pt-6 border-t border-zinc-800 text-center">
          <p className="text-[10px] text-zinc-600 uppercase tracking-[0.2em]">Noir Menu System v1.0</p>
        </div>
      </div>
    </div>
  );
};

export default SignUpPage;
