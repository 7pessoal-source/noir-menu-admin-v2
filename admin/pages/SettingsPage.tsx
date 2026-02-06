
import React, { useState } from 'react'
import { useSettings } from '../hooks/useSettings'
import { useAuth } from '../../App'
import { Save, Store, Clock, Palette, ShoppingBag, Phone, Wallet, MapPin, Plus, Trash2 } from 'lucide-react'

export default function SettingsPage() {
  const { user } = useAuth()
  // No seu sistema, o restaurant_id pode ser o próprio user.id ou um campo específico
  // Vamos tentar usar o user.id como fallback se não houver restaurant_id
  const restaurantId = user?.id || 'default-restaurant'
  
  const {
    settings,
    loading,
    saving,
    error,
    updateSetting,
    saveAllSettings
  } = useSettings(restaurantId)

  const [activeTab, setActiveTab] = useState('general')
  const [newNeighborhood, setNewNeighborhood] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await saveAllSettings()
      alert('Configurações salvas com sucesso!')
    } catch (error) {
      alert('Erro ao salvar as configurações. Verifique o console para mais detalhes.')
    }
  }

  const addNeighborhood = () => {
    if (!newNeighborhood) return
    const current = settings['delivery.neighborhoods'] || []
    updateSetting('delivery.neighborhoods', [...current, newNeighborhood])
    setNewNeighborhood('')
  }

  const removeNeighborhood = (name: string) => {
    const current = settings['delivery.neighborhoods'] || []
    updateSetting('delivery.neighborhoods', current.filter((n: string) => n !== name))
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-zinc-400">Carregando configurações...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8 animate-in slide-in-from-right-4 duration-500 pb-12">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white uppercase italic">Configurações</h1>
          <p className="text-zinc-500">Gerencie os detalhes do seu negócio e cardápio.</p>
        </div>
        <button 
          onClick={handleSubmit}
          disabled={saving}
          className="bg-white text-zinc-950 font-bold px-8 py-3 rounded-xl hover:bg-zinc-200 transition-colors flex items-center gap-2 disabled:opacity-50 shadow-lg"
        >
          <Save className="w-5 h-5" />
          {saving ? 'Salvando...' : 'Salvar Alterações'}
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/50 rounded-xl text-red-500 text-sm">
          {error}
        </div>
      )}

      <div className="flex gap-2 p-1 bg-zinc-900 border border-zinc-800 rounded-xl w-fit">
        {[
          { id: 'general', label: 'Geral', icon: Store },
          { id: 'hours', label: 'Horários', icon: Clock },
          { id: 'delivery', label: 'Entrega', icon: MapPin },
          { id: 'theme', label: 'Aparência', icon: Palette },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${
              activeTab === tab.id 
                ? 'bg-zinc-800 text-white shadow-sm' 
                : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-8">
        {activeTab === 'general' && (
          <div className="space-y-6 animate-in fade-in duration-500">
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-6 text-zinc-100">
                <Store className="w-5 h-5" />
                <h2 className="font-bold text-lg uppercase">Dados do Estabelecimento</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-zinc-500 uppercase">Nome do Restaurante</label>
                  <input
                    type="text"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-1 focus:ring-zinc-600"
                    value={settings['general.name'] || ''}
                    onChange={(e) => updateSetting('general.name', e.target.value)}
                    placeholder="Ex: Noir Bistro"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-zinc-500 uppercase">Slogan / Descrição</label>
                  <input
                    type="text"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-1 focus:ring-zinc-600"
                    value={settings['general.description'] || ''}
                    onChange={(e) => updateSetting('general.description', e.target.value)}
                    placeholder="O melhor sabor da cidade"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-zinc-500 uppercase">WhatsApp de Pedidos</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3.5 w-4 h-4 text-zinc-600" />
                    <input
                      type="text"
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-lg pl-10 pr-4 py-3 text-white focus:outline-none focus:ring-1 focus:ring-zinc-600"
                      value={settings['general.phone'] || ''}
                      onChange={(e) => updateSetting('general.phone', e.target.value)}
                      placeholder="5511999999999"
                    />
                  </div>
                  <p className="text-[10px] text-zinc-600 uppercase">Apenas números com DDD</p>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-zinc-500 uppercase">Email de Contato</label>
                  <input
                    type="email"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-1 focus:ring-zinc-600"
                    value={settings['general.email'] || ''}
                    onChange={(e) => updateSetting('general.email', e.target.value)}
                    placeholder="contato@restaurante.com"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'hours' && (
          <div className="space-y-6 animate-in fade-in duration-500">
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-6 text-zinc-100">
                <Clock className="w-5 h-5" />
                <h2 className="font-bold text-lg uppercase">Horário de Funcionamento</h2>
              </div>
              <div className="space-y-4">
                {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map((day) => {
                  const dayLabel = {
                    monday: 'Segunda', tuesday: 'Terça', wednesday: 'Quarta', 
                    thursday: 'Quinta', friday: 'Sexta', saturday: 'Sábado', sunday: 'Domingo'
                  }[day]
                  const daySettings = settings[`hours.${day}`] || { open: '18:00', close: '23:00', closed: false }
                  
                  return (
                    <div key={day} className="flex flex-col md:flex-row md:items-center gap-4 p-4 bg-zinc-950 border border-zinc-800 rounded-xl">
                      <div className="w-24 font-bold text-sm text-white uppercase">{dayLabel}</div>
                      <div className="flex items-center gap-3 flex-1">
                        <input
                          type="time"
                          className="bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-white focus:outline-none disabled:opacity-30"
                          value={daySettings.open}
                          onChange={(e) => updateSetting(`hours.${day}`, { ...daySettings, open: e.target.value })}
                          disabled={daySettings.closed}
                        />
                        <span className="text-zinc-600">até</span>
                        <input
                          type="time"
                          className="bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-white focus:outline-none disabled:opacity-30"
                          value={daySettings.close}
                          onChange={(e) => updateSetting(`hours.${day}`, { ...daySettings, close: e.target.value })}
                          disabled={daySettings.closed}
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => updateSetting(`hours.${day}`, { ...daySettings, closed: !daySettings.closed })}
                        className={`px-4 py-2 rounded-lg text-xs font-bold transition-colors ${
                          daySettings.closed 
                            ? 'bg-red-500/10 text-red-500 border border-red-500/20' 
                            : 'bg-green-500/10 text-green-500 border border-green-500/20'
                        }`}
                      >
                        {daySettings.closed ? 'FECHADO' : 'ABERTO'}
                      </button>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'delivery' && (
          <div className="space-y-6 animate-in fade-in duration-500">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
                <div className="flex items-center gap-2 mb-6 text-zinc-100">
                  <Wallet className="w-5 h-5" />
                  <h2 className="font-bold text-lg uppercase">Regras de Entrega</h2>
                </div>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-zinc-500 uppercase">Pedido Mínimo (R$)</label>
                    <input
                      type="number"
                      step="0.01"
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-1 focus:ring-zinc-600"
                      value={settings['orders.minimum_value'] || 0}
                      onChange={(e) => updateSetting('orders.minimum_value', parseFloat(e.target.value))}
                    />
                  </div>
                  <div className="flex items-center justify-between p-4 bg-zinc-950 border border-zinc-800 rounded-xl">
                    <span className="text-sm font-bold text-white uppercase">Aceitar Pedidos</span>
                    <button
                      type="button"
                      onClick={() => updateSetting('orders.enabled', !settings['orders.enabled'])}
                      className={`px-4 py-2 rounded-lg text-xs font-bold transition-colors ${
                        settings['orders.enabled'] !== false
                          ? 'bg-green-500/10 text-green-500 border border-green-500/20' 
                          : 'bg-red-500/10 text-red-500 border border-red-500/20'
                      }`}
                    >
                      {settings['orders.enabled'] !== false ? 'ATIVO' : 'PAUSADO'}
                    </button>
                  </div>
                </div>
              </div>

              <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
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
                    onChange={(e) => setNewNeighborhood(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && addNeighborhood()}
                  />
                  <button
                    type="button"
                    onClick={addNeighborhood}
                    className="p-3 bg-zinc-800 rounded-lg text-white hover:bg-zinc-700 transition-colors"
                  >
                    <Plus className="w-6 h-6" />
                  </button>
                </div>
                <div className="space-y-2 max-h-[200px] overflow-y-auto pr-2">
                  {(settings['delivery.neighborhoods'] || []).length === 0 ? (
                    <p className="text-zinc-600 text-sm italic text-center py-4">Nenhum bairro cadastrado.</p>
                  ) : (
                    settings['delivery.neighborhoods'].map((n: string) => (
                      <div key={n} className="flex items-center justify-between p-3 bg-zinc-950 border border-zinc-800 rounded-lg group">
                        <span className="text-zinc-300 font-medium">{n}</span>
                        <button
                          type="button"
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
        )}

        {activeTab === 'theme' && (
          <div className="space-y-6 animate-in fade-in duration-500">
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-6 text-zinc-100">
                <Palette className="w-5 h-5" />
                <h2 className="font-bold text-lg uppercase">Personalização Visual</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-zinc-500 uppercase">Cor Primária</label>
                    <div className="flex gap-3">
                      <input
                        type="color"
                        className="w-12 h-12 bg-transparent border-none cursor-pointer"
                        value={settings['theme.primary_color'] || '#000000'}
                        onChange={(e) => updateSetting('theme.primary_color', e.target.value)}
                      />
                      <input
                        type="text"
                        className="flex-1 bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-3 text-white focus:outline-none"
                        value={settings['theme.primary_color'] || '#000000'}
                        onChange={(e) => updateSetting('theme.primary_color', e.target.value)}
                      />
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-zinc-500 uppercase">URL do Logo</label>
                    <input
                      type="text"
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-3 text-white focus:outline-none"
                      value={settings['theme.logo_url'] || ''}
                      onChange={(e) => updateSetting('theme.logo_url', e.target.value)}
                      placeholder="https://..."
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
