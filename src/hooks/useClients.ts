import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import type { Client, ClientInsert, ClientUpdate } from '@/types'

export function useClients() {
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchClients = useCallback(async () => {
    setLoading(true)
    setError(null)
    const { data, error: err } = await supabase
      .from('clients')
      .select('*')
      .order('first_name')
    if (err) {
      setError(err.message)
    } else {
      setClients((data as Client[]) ?? [])
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchClients()
  }, [fetchClients])

  const addClient = async (client: Omit<ClientInsert, 'user_id'>) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('No autenticado')

    const payload: ClientInsert = { ...client, user_id: user.id }
    const { data, error: err } = await supabase
      .from('clients')
      .insert(payload as never)
      .select()
      .single()
    if (err) throw err
    const row = data as Client
    setClients(prev => [...prev, row].sort((a, b) => a.first_name.localeCompare(b.first_name)))
    return row
  }

  const updateClient = async (id: string, updates: Partial<Client>) => {
    const { data, error: err } = await supabase
      .from('clients')
      .update(updates as ClientUpdate as never)
      .eq('id', id)
      .select()
      .single()
    if (err) throw err
    const row = data as Client
    setClients(prev => prev.map(c => c.id === id ? row : c))
    return row
  }

  const deleteClient = async (id: string) => {
    const { error: err } = await supabase
      .from('clients')
      .delete()
      .eq('id', id)
    if (err) throw err
    setClients(prev => prev.filter(c => c.id !== id))
  }

  return { clients, loading, error, fetchClients, addClient, updateClient, deleteClient }
}
