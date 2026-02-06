
import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { MenuConfig } from '../types';
import { Save, Plus, Trash2, MapPin, Phone, Wallet, Store, Clock } from 'lucide-react';

const SettingsPage: React.FC = () => {
  const [config, setConfig] = useState<MenuConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newNeighborhood, setNewNeighborhood] = useState('');

  useEffect(() => {
    async function fetchConfig() {
      const { data } = await supabase.from('menu_config').select('*').single();
      if (data) setConfig(data);
      else {
        // Create initial config if not exists
        const { data: newData } = await supabase.from('menu_config').insert([{
          whatsapp_number: '5500000000000',
          minimum_order: 0,
          neighborhoods: [],
          restaurant_name: 'Meu Estabelecimento',
          restaurant_tagline: 'O melhor sabor da região',
          open_time: '18:00',
          close_time: '23:00',
          working_days: 'Terça a Domingo',
          is_open: true
        }]).select().single();
        if (newData) setConfig(newData);
      }
      setLoading(false);
    }
    fetchConfig();
  }, []);

  const handleSave = async () => {
    if (!config) return;
    setSaving(true);
    
    // Ensure we are updating the correct record
    const { error } = await supabase
      .from('menu_config')
      .update({
        whatsapp_number: config.whatsapp_number,
        minimum_order: config.minimum_order,
        neighborhoods: config.neighborhoods,
        restaurant_name: config.restaurant_name,
        restaurant_tagline: config.restaurant_tagline,
        open_time: config.open_time,
        close_time: config.close_time,
        working_days: config.working_days,
        is_open: config.is_open
      })
      .eq('id', config.id);

    setSaving(false);
    if (error) {
      alert('Erro ao salvar: ' + error.message);
    } else {
      alert('Configurações salvas com sucesso!');
    }
  };

  const addNeighborhood = () => {
    if (!newNeighborhood || !config) return;
    setConfig({
      ...config,
      neighborhoods: [...config.neighborhoods, newNeighborhood]
    });
    setNewNeighborhood('');
  };

  const removeNeighborhood = (name: string) => {
    if (!config) return;
    setConfig({
      ...config,
      neighborhoods: config.neighborhoods.filter(n => n !== name)
    });
  };

  if (loading) return <div>Carregando configurações...</div>;

  return (
    <div className="space-y-8 animate-in slide-in-from-right-4 duration-500 pb-12">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white uppercase italic">Configurações</h1>
          <p className="text-zinc-500">Ajuste os detalhes do seu negócio e entrega.</p>
        </div>
        <button 
          onClick={handleSave}
          disabled={saving}
          className="bg-white text-zinc-950 font-bold px-8 py-3 rounded-xl hover:bg-zinc-200 transition-colors flex items-center gap-2 disabled:opacity-50 shadow-lg"
        >
          <Save className="w-5 h-5" />
          {saving ? 'Salvando...' : 'Salvar Alterações'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-8">
          {/* Restaurant Info Section */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-6 text-zinc-100">
              <Store className="w-5 h-5" />
              <h2 className="font-bold text-lg uppercase">Dados do Estabelecimento</h2>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-zinc-500 uppercase mb-2">Nome do Estabelecimento</label>
                <input 
                  type="text"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-1 focus:ring-zinc-600"
                  placeholder="Ex: Noir Menu"
                  value={config?.restaurant_name || ''}
                  onChange={e => setConfig(c => c ? {...c, restaurant_name: e.target.value} : null)}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-zinc-500 uppercase mb-2">Slogan / Descrição Curta</label>
                <input 
                  type="text"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-1 focus:ring-zinc-600"
                  placeholder="Ex: O melhor hambúrguer da cidade"
                  value={config?.restaurant_tagline || ''}
                  onChange={e => setConfig(c => c ? {...c, restaurant_tagline: e.target.value} : null)}
                />
              </div>
            </div>
          </div>

          {/* WhatsApp Section */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-6 text-zinc-100">
              <Phone className="w-5 h-5" />
              <h2 className="font-bold text-lg uppercase">Recebimento de Pedidos</h2>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-zinc-500 uppercase mb-2">WhatsApp do Estabelecimento</label>
                <input 
                  type="text"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-1 focus:ring-zinc-600"
                  placeholder="5511999999999"
                  value={config?.whatsapp_number || ''}
                  onChange={e => setConfig(c => c ? {...c, whatsapp_number: e.target.value} : null)}
                />
                <p className="text-[10px] text-zinc-600 mt-2 uppercase tracking-wider">Inclua código do país e DDD (apenas números)</p>
              </div>
            </div>
          </div>

          {/* Business Rules */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-6 text-zinc-100">
              <Wallet className="w-5 h-5" />
              <h2 className="font-bold text-lg uppercase">Regras de Negócio</h2>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-zinc-500 uppercase mb-2">Pedido Mínimo (R$)</label>
                <input 
                  type="number"
                  step="0.01"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-1 focus:ring-zinc-600"
                  value={config?.minimum_order || 0}
                  onChange={e => setConfig(c => c ? {...c, minimum_order: parseFloat(e.target.value)} : null)}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-8">
          {/* Schedule Section */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-6 text-zinc-100">
              <Clock className="w-5 h-5" />
              <h2 className="font-bold text-lg uppercase">Horário de Funcionamento</h2>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-zinc-950 border border-zinc-800 rounded-lg mb-4">
                <div>
                  <span className="text-sm font-bold text-white uppercase">Status do Cardápio</span>
                  <p className="text-xs text-zinc-500">Ative ou desative o recebimento de pedidos</p>
                </div>
                <button 
                  onClick={() => setConfig(c => c ? {...c, is_open: !c.is_open} : null)}
                  className={`px-4 py-2 rounded-lg font-bold text-xs transition-colors ${config?.is_open ? 'bg-green-500/10 text-green-500 border border-green-500/20' : 'bg-red-500/10 text-red-500 border border-red-500/20'}`}
                >
                  {config?.is_open ? 'ABERTO' : 'FECHADO'}
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-zinc-500 uppercase mb-2">Abre às</label>
                  <input 
                    type="text"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-1 focus:ring-zinc-600"
                    placeholder="18:00"
                    value={config?.open_time || ''}
                    onChange={e => setConfig(c => c ? {...c, open_time: e.target.value} : null)}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-500 uppercase mb-2">Fecha às</label>
                  <input 
                    type="text"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-1 focus:ring-zinc-600"
                    placeholder="23:00"
                    value={config?.close_time || ''}
                    onChange={e => setConfig(c => c ? {...c, close_time: e.target.value} : null)}
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-zinc-500 uppercase mb-2">Dias de Funcionamento</label>
                <input 
                  type="text"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-1 focus:ring-zinc-600"
                  placeholder="Ex: Terça a Domingo"
                  value={config?.working_days || ''}
                  onChange={e => setConfig(c => c ? {...c, working_days: e.target.value} : null)}
                />
              </div>
            </div>
          </div>

          {/* Neighborhoods / Delivery Areas */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 h-fit">
            <div className="flex items-center gap-2 mb-6 text-zinc-100">
              <MapPin className="w-5 h-5" />
              <h2 className="font-bold text-lg uppercase">Bairros Atendidos</h2>
            </div>
            
            <div className="flex gap-2 mb-6">
              <input 
                type="text"
                className="flex-1 bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-1 focus:ring-zinc-600"
                placeholder="Nome do bairro..."
                value={newNeighborhood}
                onChange={e => setNewNeighborhood(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addNeighborhood()}
              />
              <button 
                onClick={addNeighborhood}
                className="p-3 bg-zinc-800 rounded-lg text-white hover:bg-zinc-700 transition-colors"
              >
                <Plus className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-2">
              {config?.neighborhoods.length === 0 ? (
                <p className="text-zinc-600 text-sm italic text-center py-4">Nenhum bairro cadastrado.</p>
              ) : (
                config?.neighborhoods.map(n => (
                  <div key={n} className="flex items-center justify-between p-3 bg-zinc-950 border border-zinc-800 rounded-lg group">
                    <span className="text-zinc-300 font-medium">{n}</span>
                    <button 
                      onClick={() => removeNeighborhood(n)}
                      className="p-1 text-zinc-600 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
