import { useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import type { Visit, ColorFormula } from '@/types'

export interface VisitWithDetails extends Visit {
  service: { name: string } | null
  color_formula: ColorFormula | null
}

export function useVisits(clientId?: string) {
  const [visits, setVisits] = useState<VisitWithDetails[]>([])
  const [loading, setLoading] = useState(true)

  const fetchVisits = useCallback(async (cId?: string) => {
    const targetId = cId ?? clientId
    if (!targetId) return

    setLoading(true)
    const { data } = await supabase
      .from('visits')
      .select(`
        *,
        service:services(name),
        color_formula:color_formulas(*)
      `)
      .eq('client_id', targetId)
      .order('visit_date', { ascending: false })

    setVisits((data as VisitWithDetails[] | null) ?? [])
    setLoading(false)
  }, [clientId])

  const addVisit = async (visit: {
    client_id: string
    service_id: string
    visit_date: string
    price?: number
    notes?: string
    colorFormula?: {
      brand?: string
      color_number?: string
      developer_volume?: string
      mix_details?: string
      application_notes?: string
    }
  }) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('No autenticado')

    const { data: visitData, error: visitErr } = await supabase
      .from('visits')
      .insert({
        client_id: visit.client_id,
        service_id: visit.service_id,
        user_id: user.id,
        visit_date: visit.visit_date,
        price: visit.price ?? null,
        notes: visit.notes ?? null,
      })
      .select()
      .single()

    if (visitErr) throw visitErr

    if (visit.colorFormula && Object.values(visit.colorFormula).some(v => v)) {
      await supabase
        .from('color_formulas')
        .insert({
          visit_id: visitData.id,
          brand: visit.colorFormula.brand ?? null,
          color_number: visit.colorFormula.color_number ?? null,
          developer_volume: visit.colorFormula.developer_volume ?? null,
          mix_details: visit.colorFormula.mix_details ?? null,
          application_notes: visit.colorFormula.application_notes ?? null,
        })
    }

    await fetchVisits(visit.client_id)
    return visitData
  }

  const deleteVisit = async (id: string) => {
    const { error } = await supabase
      .from('visits')
      .delete()
      .eq('id', id)
    if (error) throw error
    setVisits(prev => prev.filter(v => v.id !== id))
  }

  return { visits, loading, fetchVisits, addVisit, deleteVisit }
}
