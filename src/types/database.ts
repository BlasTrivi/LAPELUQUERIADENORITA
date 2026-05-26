export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          full_name: string | null
          role: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          full_name?: string | null
          role?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          full_name?: string | null
          role?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      clients: {
        Row: {
          id: string
          user_id: string
          first_name: string
          last_name: string | null
          phone: string | null
          email: string | null
          notes: string | null
          photo_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          first_name: string
          last_name?: string | null
          phone?: string | null
          email?: string | null
          notes?: string | null
          photo_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          first_name?: string
          last_name?: string
          phone?: string | null
          email?: string | null
          notes?: string | null
          photo_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      services: {
        Row: {
          id: string
          user_id: string
          name: string
          default_price: number | null
          is_active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          default_price?: number | null
          is_active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          default_price?: number | null
          is_active?: boolean
          created_at?: string
        }
      }
      visits: {
        Row: {
          id: string
          client_id: string
          user_id: string
          service_id: string | null
          visit_date: string
          price: number | null
          notes: string | null
          photo_url: string | null
          created_at: string
        }
        Insert: {
          id?: string
          client_id: string
          user_id: string
          service_id?: string | null
          visit_date: string
          price?: number | null
          notes?: string | null
          photo_url?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          client_id?: string
          user_id?: string
          service_id?: string | null
          visit_date?: string
          price?: number | null
          notes?: string | null
          photo_url?: string | null
          created_at?: string
        }
      }
      color_formulas: {
        Row: {
          id: string
          visit_id: string
          brand: string | null
          color_number: string | null
          developer_volume: string | null
          mix_details: string | null
          application_notes: string | null
        }
        Insert: {
          id?: string
          visit_id: string
          brand?: string | null
          color_number?: string | null
          developer_volume?: string | null
          mix_details?: string | null
          application_notes?: string | null
        }
        Update: {
          id?: string
          visit_id?: string
          brand?: string | null
          color_number?: string | null
          developer_volume?: string | null
          mix_details?: string | null
          application_notes?: string | null
        }
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
  }
}
