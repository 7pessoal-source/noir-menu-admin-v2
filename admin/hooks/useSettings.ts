
import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

interface UseSettingsReturn {
  settings: Record<string, any>
  loading: boolean
  saving: boolean
  error: string | null
  loadSettings: () => Promise<void>
  updateSetting: (key: string, value: any) => Promise<void>
  saveAllSettings: () => Promise<void>
}

export function useSettings(restaurantId?: string): UseSettingsReturn {
  const [settings, setSettings] = useState<Record<string, any>>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Carregar configurações do banco
  const loadSettings = async () => {
    if (!restaurantId) {
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)

      const { data, error: fetchError } = await supabase
        .from('settings')
        .select('key, value')
        .eq('restaurant_id', restaurantId)

      if (fetchError) throw fetchError

      // Converter array de settings para objeto
      const settingsObj: Record<string, any> = {}
      data?.forEach((item: any) => {
        settingsObj[item.key] = item.value
      })

      setSettings(settingsObj)
    } catch (err) {
      console.error('Erro ao carregar configurações:', err)
      setError(err instanceof Error ? err.message : 'Erro desconhecido')
    } finally {
      setLoading(false)
    }
  }

  // Atualizar uma configuração (localmente)
  const updateSetting = async (key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }))
  }

  // Salvar todas as configurações no banco
  const saveAllSettings = async () => {
    if (!restaurantId) {
      setError('Restaurant ID não encontrado')
      return
    }

    try {
      setSaving(true)
      setError(null)

      // Usar a função RPC upsert_setting
      const promises = Object.entries(settings).map(([key, value]) => 
        supabase.rpc('upsert_setting', {
          p_restaurant_id: restaurantId,
          p_key: key,
          p_value: value
        })
      )

      const results = await Promise.all(promises)
      
      // Verificar erros
      const errors = results.filter(r => r.error)
      if (errors.length > 0) {
        console.error('Erros ao salvar:', errors)
        throw new Error('Alguns itens não foram salvos. Verifique se a função upsert_setting existe no Supabase.')
      }

      // Recarregar para confirmar
      await loadSettings()
    } catch (err) {
      console.error('Erro ao salvar configurações:', err)
      setError(err instanceof Error ? err.message : 'Erro ao salvar')
      throw err
    } finally {
      setSaving(false)
    }
  }

  // Carregar ao montar
  useEffect(() => {
    loadSettings()
  }, [restaurantId])

  return {
    settings,
    loading,
    saving,
    error,
    loadSettings,
    updateSetting,
    saveAllSettings
  }
}
