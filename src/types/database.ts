export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      attendance_modes: {
        Row: {
          id: number
          nome: string
          ordem: number
          slug: string
        }
        Insert: {
          id?: never
          nome: string
          ordem?: number
          slug: string
        }
        Update: {
          id?: never
          nome?: string
          ordem?: number
          slug?: string
        }
        Relationships: []
      }
      clinics: {
        Row: {
          created_at: string
          endereco: string | null
          id: string
          lat: number | null
          lng: number | null
          neighborhood_id: number | null
          nome: string
          region_id: number
          veterinarian_id: string
        }
        Insert: {
          created_at?: string
          endereco?: string | null
          id?: string
          lat?: number | null
          lng?: number | null
          neighborhood_id?: number | null
          nome: string
          region_id: number
          veterinarian_id: string
        }
        Update: {
          created_at?: string
          endereco?: string | null
          id?: string
          lat?: number | null
          lng?: number | null
          neighborhood_id?: number | null
          nome?: string
          region_id?: number
          veterinarian_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "clinics_neighborhood_fk"
            columns: ["neighborhood_id", "region_id"]
            isOneToOne: false
            referencedRelation: "neighborhoods"
            referencedColumns: ["id", "region_id"]
          },
          {
            foreignKeyName: "clinics_region_id_fkey"
            columns: ["region_id"]
            isOneToOne: false
            referencedRelation: "regions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clinics_veterinarian_id_fkey"
            columns: ["veterinarian_id"]
            isOneToOne: false
            referencedRelation: "veterinarians"
            referencedColumns: ["id"]
          },
        ]
      }
      contact_events: {
        Row: {
          canal: Database["public"]["Enums"]["contact_canal"]
          created_at: string
          filtros_usados: Json
          id: number
          origem: Database["public"]["Enums"]["contact_origem"]
          vet_is_demo: boolean
          vet_slug: string
          veterinarian_id: string | null
        }
        Insert: {
          canal: Database["public"]["Enums"]["contact_canal"]
          created_at?: string
          filtros_usados?: Json
          id?: never
          origem: Database["public"]["Enums"]["contact_origem"]
          vet_is_demo?: boolean
          vet_slug?: string
          veterinarian_id?: string | null
        }
        Update: {
          canal?: Database["public"]["Enums"]["contact_canal"]
          created_at?: string
          filtros_usados?: Json
          id?: never
          origem?: Database["public"]["Enums"]["contact_origem"]
          vet_is_demo?: boolean
          vet_slug?: string
          veterinarian_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "contact_events_veterinarian_id_fkey"
            columns: ["veterinarian_id"]
            isOneToOne: false
            referencedRelation: "veterinarians"
            referencedColumns: ["id"]
          },
        ]
      }
      neighborhoods: {
        Row: {
          id: number
          nome: string
          region_id: number
          slug: string
        }
        Insert: {
          id?: never
          nome: string
          region_id: number
          slug: string
        }
        Update: {
          id?: never
          nome?: string
          region_id?: number
          slug?: string
        }
        Relationships: [
          {
            foreignKeyName: "neighborhoods_region_id_fkey"
            columns: ["region_id"]
            isOneToOne: false
            referencedRelation: "regions"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_methods: {
        Row: {
          id: number
          nome: string
          ordem: number
          slug: string
        }
        Insert: {
          id?: never
          nome: string
          ordem?: number
          slug: string
        }
        Update: {
          id?: never
          nome?: string
          ordem?: number
          slug?: string
        }
        Relationships: []
      }
      regions: {
        Row: {
          id: number
          nome: string
          regiao_macro: Database["public"]["Enums"]["regiao_macro"]
          slug: string
          tipo: Database["public"]["Enums"]["region_tipo"]
        }
        Insert: {
          id?: never
          nome: string
          regiao_macro: Database["public"]["Enums"]["regiao_macro"]
          slug: string
          tipo: Database["public"]["Enums"]["region_tipo"]
        }
        Update: {
          id?: never
          nome?: string
          regiao_macro?: Database["public"]["Enums"]["regiao_macro"]
          slug?: string
          tipo?: Database["public"]["Enums"]["region_tipo"]
        }
        Relationships: []
      }
      services: {
        Row: {
          id: number
          nome: string
          ordem: number
          slug: string
        }
        Insert: {
          id?: never
          nome: string
          ordem?: number
          slug: string
        }
        Update: {
          id?: never
          nome?: string
          ordem?: number
          slug?: string
        }
        Relationships: []
      }
      specialties: {
        Row: {
          id: number
          nome: string
          ordem: number
          slug: string
        }
        Insert: {
          id?: never
          nome: string
          ordem?: number
          slug: string
        }
        Update: {
          id?: never
          nome?: string
          ordem?: number
          slug?: string
        }
        Relationships: []
      }
      species: {
        Row: {
          id: number
          nome: string
          ordem: number
          slug: string
        }
        Insert: {
          id?: never
          nome: string
          ordem?: number
          slug: string
        }
        Update: {
          id?: never
          nome?: string
          ordem?: number
          slug?: string
        }
        Relationships: []
      }
      vet_waitlist: {
        Row: {
          consentimento_lgpd: boolean
          created_at: string
          crmv_numero: string
          crmv_uf: string
          email: string
          especies: string[]
          id: number
          modalidades: string[]
          nome: string
          region_id: number
          whatsapp: string
        }
        Insert: {
          consentimento_lgpd: boolean
          created_at?: string
          crmv_numero: string
          crmv_uf: string
          email: string
          especies?: string[]
          id?: never
          modalidades?: string[]
          nome: string
          region_id: number
          whatsapp: string
        }
        Update: {
          consentimento_lgpd?: boolean
          created_at?: string
          crmv_numero?: string
          crmv_uf?: string
          email?: string
          especies?: string[]
          id?: never
          modalidades?: string[]
          nome?: string
          region_id?: number
          whatsapp?: string
        }
        Relationships: [
          {
            foreignKeyName: "vet_waitlist_region_id_fkey"
            columns: ["region_id"]
            isOneToOne: false
            referencedRelation: "regions"
            referencedColumns: ["id"]
          },
        ]
      }
      veterinarian_attendance_modes: {
        Row: {
          attendance_mode_id: number
          veterinarian_id: string
        }
        Insert: {
          attendance_mode_id: number
          veterinarian_id: string
        }
        Update: {
          attendance_mode_id?: number
          veterinarian_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "veterinarian_attendance_modes_attendance_mode_id_fkey"
            columns: ["attendance_mode_id"]
            isOneToOne: false
            referencedRelation: "attendance_modes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "veterinarian_attendance_modes_veterinarian_id_fkey"
            columns: ["veterinarian_id"]
            isOneToOne: false
            referencedRelation: "veterinarians"
            referencedColumns: ["id"]
          },
        ]
      }
      veterinarian_coverage_regions: {
        Row: {
          region_id: number
          veterinarian_id: string
        }
        Insert: {
          region_id: number
          veterinarian_id: string
        }
        Update: {
          region_id?: number
          veterinarian_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "veterinarian_coverage_regions_region_id_fkey"
            columns: ["region_id"]
            isOneToOne: false
            referencedRelation: "regions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "veterinarian_coverage_regions_veterinarian_id_fkey"
            columns: ["veterinarian_id"]
            isOneToOne: false
            referencedRelation: "veterinarians"
            referencedColumns: ["id"]
          },
        ]
      }
      veterinarian_payment_methods: {
        Row: {
          parcelas_max: number | null
          payment_method_id: number
          veterinarian_id: string
        }
        Insert: {
          parcelas_max?: number | null
          payment_method_id: number
          veterinarian_id: string
        }
        Update: {
          parcelas_max?: number | null
          payment_method_id?: number
          veterinarian_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "veterinarian_payment_methods_payment_method_id_fkey"
            columns: ["payment_method_id"]
            isOneToOne: false
            referencedRelation: "payment_methods"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "veterinarian_payment_methods_veterinarian_id_fkey"
            columns: ["veterinarian_id"]
            isOneToOne: false
            referencedRelation: "veterinarians"
            referencedColumns: ["id"]
          },
        ]
      }
      veterinarian_services: {
        Row: {
          preco_max: number | null
          preco_min: number | null
          service_id: number
          veterinarian_id: string
        }
        Insert: {
          preco_max?: number | null
          preco_min?: number | null
          service_id: number
          veterinarian_id: string
        }
        Update: {
          preco_max?: number | null
          preco_min?: number | null
          service_id?: number
          veterinarian_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "veterinarian_services_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "veterinarian_services_veterinarian_id_fkey"
            columns: ["veterinarian_id"]
            isOneToOne: false
            referencedRelation: "veterinarians"
            referencedColumns: ["id"]
          },
        ]
      }
      veterinarian_specialties: {
        Row: {
          principal: boolean
          specialty_id: number
          veterinarian_id: string
        }
        Insert: {
          principal?: boolean
          specialty_id: number
          veterinarian_id: string
        }
        Update: {
          principal?: boolean
          specialty_id?: number
          veterinarian_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "veterinarian_specialties_specialty_id_fkey"
            columns: ["specialty_id"]
            isOneToOne: false
            referencedRelation: "specialties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "veterinarian_specialties_veterinarian_id_fkey"
            columns: ["veterinarian_id"]
            isOneToOne: false
            referencedRelation: "veterinarians"
            referencedColumns: ["id"]
          },
        ]
      }
      veterinarian_species: {
        Row: {
          species_id: number
          veterinarian_id: string
        }
        Insert: {
          species_id: number
          veterinarian_id: string
        }
        Update: {
          species_id?: number
          veterinarian_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "veterinarian_species_species_id_fkey"
            columns: ["species_id"]
            isOneToOne: false
            referencedRelation: "species"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "veterinarian_species_veterinarian_id_fkey"
            columns: ["veterinarian_id"]
            isOneToOne: false
            referencedRelation: "veterinarians"
            referencedColumns: ["id"]
          },
        ]
      }
      veterinarians: {
        Row: {
          anos_experiencia: number | null
          atende_emergencia: boolean
          atende_fim_de_semana: boolean
          atende_noturno: boolean
          bio: string | null
          consulta_preco_max: number | null
          consulta_preco_min: number | null
          created_at: string
          crmv_numero: string
          crmv_uf: string
          crmv_verificado: boolean
          foto_url: string | null
          id: string
          instagram: string | null
          is_demo: boolean
          nome_exibicao: string
          slug: string
          status: Database["public"]["Enums"]["vet_status"]
          updated_at: string
          user_id: string | null
          whatsapp: string | null
        }
        Insert: {
          anos_experiencia?: number | null
          atende_emergencia?: boolean
          atende_fim_de_semana?: boolean
          atende_noturno?: boolean
          bio?: string | null
          consulta_preco_max?: number | null
          consulta_preco_min?: number | null
          created_at?: string
          crmv_numero: string
          crmv_uf: string
          crmv_verificado?: boolean
          foto_url?: string | null
          id?: string
          instagram?: string | null
          is_demo?: boolean
          nome_exibicao: string
          slug: string
          status?: Database["public"]["Enums"]["vet_status"]
          updated_at?: string
          user_id?: string | null
          whatsapp?: string | null
        }
        Update: {
          anos_experiencia?: number | null
          atende_emergencia?: boolean
          atende_fim_de_semana?: boolean
          atende_noturno?: boolean
          bio?: string | null
          consulta_preco_max?: number | null
          consulta_preco_min?: number | null
          created_at?: string
          crmv_numero?: string
          crmv_uf?: string
          crmv_verificado?: boolean
          foto_url?: string | null
          id?: string
          instagram?: string | null
          is_demo?: boolean
          nome_exibicao?: string
          slug?: string
          status?: Database["public"]["Enums"]["vet_status"]
          updated_at?: string
          user_id?: string | null
          whatsapp?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      buscar_veterinarios: {
        Args: {
          p_area?: string
          p_bairro?: string
          p_emergencia?: boolean
          p_especie?: string
          p_fim_de_semana?: boolean
          p_limite?: number
          p_modos?: string[]
          p_noturno?: boolean
          p_offset?: number
          p_pagamentos?: string[]
          p_preco_max?: number
          p_regiao?: string
          p_servico?: string
        }
        Returns: Json
      }
    }
    Enums: {
      contact_canal: "whatsapp" | "instagram" | "maps"
      contact_origem: "card" | "perfil"
      regiao_macro: "alto_tiete" | "zona_leste_sp"
      region_tipo: "municipio" | "subprefeitura"
      vet_status: "rascunho" | "ativo" | "inativo"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      contact_canal: ["whatsapp", "instagram", "maps"],
      contact_origem: ["card", "perfil"],
      regiao_macro: ["alto_tiete", "zona_leste_sp"],
      region_tipo: ["municipio", "subprefeitura"],
      vet_status: ["rascunho", "ativo", "inativo"],
    },
  },
} as const
