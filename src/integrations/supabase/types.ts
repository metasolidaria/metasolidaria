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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      entities: {
        Row: {
          city: string
          created_at: string
          created_by: string | null
          id: string
          name: string
          phone: string | null
        }
        Insert: {
          city: string
          created_at?: string
          created_by?: string | null
          id?: string
          name: string
          phone?: string | null
        }
        Update: {
          city?: string
          created_at?: string
          created_by?: string | null
          id?: string
          name?: string
          phone?: string | null
        }
        Relationships: []
      }
      goal_progress: {
        Row: {
          amount: number
          created_at: string
          description: string | null
          group_id: string
          id: string
          member_id: string
          user_id: string
        }
        Insert: {
          amount?: number
          created_at?: string
          description?: string | null
          group_id: string
          id?: string
          member_id: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          description?: string | null
          group_id?: string
          id?: string
          member_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "goal_progress_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "goal_progress_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "groups_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "goal_progress_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "group_members"
            referencedColumns: ["id"]
          },
        ]
      }
      group_invitations: {
        Row: {
          created_at: string
          email: string
          expires_at: string
          group_id: string
          id: string
          invite_code: string
          invited_by: string
          status: string
        }
        Insert: {
          created_at?: string
          email: string
          expires_at?: string
          group_id: string
          id?: string
          invite_code?: string
          invited_by: string
          status?: string
        }
        Update: {
          created_at?: string
          email?: string
          expires_at?: string
          group_id?: string
          id?: string
          invite_code?: string
          invited_by?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "group_invitations_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "group_invitations_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "groups_public"
            referencedColumns: ["id"]
          },
        ]
      }
      group_members: {
        Row: {
          commitment_donation: number | null
          commitment_metric: string | null
          commitment_ratio: number | null
          commitment_type: string | null
          created_at: string
          goals_reached: number
          group_id: string
          id: string
          name: string
          penalty_donation: number | null
          personal_goal: number | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          commitment_donation?: number | null
          commitment_metric?: string | null
          commitment_ratio?: number | null
          commitment_type?: string | null
          created_at?: string
          goals_reached?: number
          group_id: string
          id?: string
          name: string
          penalty_donation?: number | null
          personal_goal?: number | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          commitment_donation?: number | null
          commitment_metric?: string | null
          commitment_ratio?: number | null
          commitment_type?: string | null
          created_at?: string
          goals_reached?: number
          group_id?: string
          id?: string
          name?: string
          penalty_donation?: number | null
          personal_goal?: number | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "group_members_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "group_members_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "groups_public"
            referencedColumns: ["id"]
          },
        ]
      }
      groups: {
        Row: {
          city: string
          created_at: string
          description: string | null
          donation_type: string
          end_date: string | null
          entity_id: string | null
          goal_2026: number
          id: string
          is_private: boolean
          leader_id: string
          leader_name: string | null
          leader_whatsapp: string | null
          name: string
          updated_at: string
        }
        Insert: {
          city: string
          created_at?: string
          description?: string | null
          donation_type: string
          end_date?: string | null
          entity_id?: string | null
          goal_2026?: number
          id?: string
          is_private?: boolean
          leader_id: string
          leader_name?: string | null
          leader_whatsapp?: string | null
          name: string
          updated_at?: string
        }
        Update: {
          city?: string
          created_at?: string
          description?: string | null
          donation_type?: string
          end_date?: string | null
          entity_id?: string | null
          goal_2026?: number
          id?: string
          is_private?: boolean
          leader_id?: string
          leader_name?: string | null
          leader_whatsapp?: string | null
          name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "groups_entity_id_fkey"
            columns: ["entity_id"]
            isOneToOne: false
            referencedRelation: "entities"
            referencedColumns: ["id"]
          },
        ]
      }
      member_commitments: {
        Row: {
          created_at: string
          donation_amount: number
          id: string
          member_id: string
          metric: string
          ratio: number
        }
        Insert: {
          created_at?: string
          donation_amount?: number
          id?: string
          member_id: string
          metric: string
          ratio?: number
        }
        Update: {
          created_at?: string
          donation_amount?: number
          id?: string
          member_id?: string
          metric?: string
          ratio?: number
        }
        Relationships: [
          {
            foreignKeyName: "member_commitments_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "group_members"
            referencedColumns: ["id"]
          },
        ]
      }
      partners: {
        Row: {
          city: string
          created_at: string
          description: string | null
          id: string
          instagram: string | null
          is_approved: boolean
          latitude: number | null
          longitude: number | null
          name: string
          specialty: string | null
          submitted_by: string | null
          tier: string | null
          updated_at: string
          whatsapp: string | null
        }
        Insert: {
          city: string
          created_at?: string
          description?: string | null
          id?: string
          instagram?: string | null
          is_approved?: boolean
          latitude?: number | null
          longitude?: number | null
          name: string
          specialty?: string | null
          submitted_by?: string | null
          tier?: string | null
          updated_at?: string
          whatsapp?: string | null
        }
        Update: {
          city?: string
          created_at?: string
          description?: string | null
          id?: string
          instagram?: string | null
          is_approved?: boolean
          latitude?: number | null
          longitude?: number | null
          name?: string
          specialty?: string | null
          submitted_by?: string | null
          tier?: string | null
          updated_at?: string
          whatsapp?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          full_name: string
          id: string
          updated_at: string
          user_id: string
          whatsapp: string
        }
        Insert: {
          created_at?: string
          full_name: string
          id?: string
          updated_at?: string
          user_id: string
          whatsapp: string
        }
        Update: {
          created_at?: string
          full_name?: string
          id?: string
          updated_at?: string
          user_id?: string
          whatsapp?: string
        }
        Relationships: []
      }
    }
    Views: {
      groups_public: {
        Row: {
          city: string | null
          created_at: string | null
          description: string | null
          donation_type: string | null
          goal_2026: number | null
          id: string | null
          is_private: boolean | null
          leader_id: string | null
          leader_name: string | null
          name: string | null
          updated_at: string | null
        }
        Insert: {
          city?: string | null
          created_at?: string | null
          description?: string | null
          donation_type?: string | null
          goal_2026?: number | null
          id?: string | null
          is_private?: boolean | null
          leader_id?: string | null
          leader_name?: string | null
          name?: string | null
          updated_at?: string | null
        }
        Update: {
          city?: string | null
          created_at?: string | null
          description?: string | null
          donation_type?: string | null
          goal_2026?: number | null
          id?: string | null
          is_private?: boolean | null
          leader_id?: string | null
          leader_name?: string | null
          name?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      accept_group_invitation: {
        Args: { _invite_code: string }
        Returns: string
      }
      create_group_with_leader:
        | {
            Args: {
              _city: string
              _description: string
              _donation_type: string
              _goal_2026: number
              _is_private: boolean
              _leader_name: string
              _leader_whatsapp: string
              _name: string
            }
            Returns: string
          }
        | {
            Args: {
              _city: string
              _description: string
              _donation_type: string
              _end_date?: string
              _goal_2026: number
              _is_private: boolean
              _leader_name: string
              _leader_whatsapp: string
              _name: string
            }
            Returns: string
          }
        | {
            Args: {
              _city: string
              _description: string
              _donation_type: string
              _end_date?: string
              _entity_id?: string
              _goal_2026: number
              _is_private: boolean
              _leader_name: string
              _leader_whatsapp: string
              _name: string
            }
            Returns: string
          }
      is_current_user_email: { Args: { _email: string }; Returns: boolean }
      is_group_member: {
        Args: { _group_id: string; _user_id: string }
        Returns: boolean
      }
    }
    Enums: {
      [_ in never]: never
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
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
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
