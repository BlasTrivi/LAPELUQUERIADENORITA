import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import type { Service } from '@/types'

export function useServices() {
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)

  const fetchServices = useCallback(async () => {
    setLoading(true)
    const { data } = await supabase
      .from('services')
      .select('*')
      .eq('is_active', true)
      .order('name')
    setServices(data ?? [])
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchServices()
  }, [fetchServices])

  const addService = async (name: string, defaultPrice?: number) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('No autenticado')

    const { data, error } = await supabase
      .from('services')
      .insert({ name, default_price: defaultPrice ?? null, user_id: user.id })
      .select()
      .single()
    if (error) throw error
    setServices(prev => [...prev, data].sort((a, b) => a.name.localeCompare(b.name)))
    return data
  }

  const updateService = async (id: string, updates: Partial<Service>) => {
    const { data, error } = await supabase
      .from('services')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    if (error) throw error
    setServices(prev => prev.map(s => s.id === id ? data : s))
    return data
  }

  const deleteService = async (id: string) => {
    const { error } = await supabase
      .from('services')
      .update({ is_active: false })
      .eq('id', id)
    if (error) throw error
    setServices(prev => prev.filter(s => s.id !== id))
  }

  return { services, loading, fetchServices, addService, updateService, deleteService }
}
