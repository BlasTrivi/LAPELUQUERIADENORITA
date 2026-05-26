import type { Database } from './database'

// Row types (full records returned from DB)
export type Profile = Database['public']['Tables']['profiles']['Row']
export type Client = Database['public']['Tables']['clients']['Row']
export type Service = Database['public']['Tables']['services']['Row']
export type Visit = Database['public']['Tables']['visits']['Row']
export type ColorFormula = Database['public']['Tables']['color_formulas']['Row']

// Insert types (payloads for creating new records)
export type ProfileInsert = Database['public']['Tables']['profiles']['Insert']
export type ClientInsert = Database['public']['Tables']['clients']['Insert']
export type ServiceInsert = Database['public']['Tables']['services']['Insert']
export type VisitInsert = Database['public']['Tables']['visits']['Insert']
export type ColorFormulaInsert = Database['public']['Tables']['color_formulas']['Insert']

// Update types (partial payloads for updating existing records)
export type ProfileUpdate = Database['public']['Tables']['profiles']['Update']
export type ClientUpdate = Database['public']['Tables']['clients']['Update']
export type ServiceUpdate = Database['public']['Tables']['services']['Update']
export type VisitUpdate = Database['public']['Tables']['visits']['Update']
export type ColorFormulaUpdate = Database['public']['Tables']['color_formulas']['Update']
