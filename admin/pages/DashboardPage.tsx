
import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Tag, Package, TrendingUp } from 'lucide-react';

const DashboardPage: React.FC = () => {
  const [stats, setStats] = useState({ products: 0, categories: 0, available: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      const [pRes, cRes] = await Promise.all([
        supabase.from('products').select('*', { count: 'exact', head: true }),
        supabase.from('categories').select('*', { count: 'exact', head: true })
      ]);
      
      const { count: avCount } = await supabase.from('products').select('*', { count: 'exact', head: true }).eq('available', true);

      setStats({
        products: pRes.count || 0,
        categories: cRes.count || 0,
        available: avCount || 0
      });
      setLoading(false);
    }
    fetchStats();
  }, []);

  const Card = ({ title, value, icon: Icon, color }: any) => (
    <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl">
      <div className="flex items-center justify-between mb-4">
        <span className="text-zinc-500 text-sm font-medium">{title}</span>
        <div className={`p-2 rounded-lg ${color}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
      <span className="text-3xl font-bold text-white">{value}</span>
    </div>
  );

  if (loading) return <div>Carregando dashboard...</div>;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white uppercase italic">Dashboard</h1>
        <p className="text-zinc-500">Bem-vindo ao painel de controle do seu cardápio.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card title="Total de Produtos" value={stats.products} icon={Package} color="bg-blue-500/10 text-blue-500" />
        <Card title="Categorias" value={stats.categories} icon={Tag} color="bg-purple-500/10 text-purple-500" />
        <Card title="Produtos Ativos" value={stats.available} icon={TrendingUp} color="bg-emerald-500/10 text-emerald-500" />
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-12 flex flex-col justify-center items-center text-center">
          <Package className="w-16 h-16 text-zinc-700 mb-4" />
          <h3 className="text-xl font-bold text-white mb-2 uppercase italic">Cardápio Online</h3>
          <p className="text-zinc-400 max-w-xs">Seu cardápio está configurado e pronto para receber pedidos via WhatsApp.</p>
      </div>
    </div>
  );
};

export default DashboardPage;
