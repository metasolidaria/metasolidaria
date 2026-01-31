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
      admin_emails: {
        Row: {
          created_at: string | null
          email: string
          id: string
        }
        Insert: {
          created_at?: string | null
          email: string
          id?: string
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
        }
        Relationships: []
      }
      entities: {
        Row: {
          accepted_donations: string[] | null
          city: string
          created_at: string
          created_by: string | null
          id: string
          name: string
          observations: string | null
          phone: string | null
        }
        Insert: {
          accepted_donations?: string[] | null
          city: string
          created_at?: string
          created_by?: string | null
          id?: string
          name: string
          observations?: string | null
          phone?: string | null
        }
        Update: {
          accepted_donations?: string[] | null
          city?: string
          created_at?: string
          created_by?: string | null
          id?: string
          name?: string
          observations?: string | null
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
            referencedRelation: "group_stats"
            referencedColumns: ["group_id"]
          },
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
            foreignKeyName: "goal_progress_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "groups_search"
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
          email: string | null
          expires_at: string
          group_id: string
          id: string
          invite_code: string
          invite_type: string | null
          invited_by: string
          status: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          expires_at?: string
          group_id: string
          id?: string
          invite_code?: string
          invite_type?: string | null
          invited_by: string
          status?: string
        }
        Update: {
          created_at?: string
          email?: string | null
          expires_at?: string
          group_id?: string
          id?: string
          invite_code?: string
          invite_type?: string | null
          invited_by?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "group_invitations_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "group_stats"
            referencedColumns: ["group_id"]
          },
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
          {
            foreignKeyName: "group_invitations_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "groups_search"
            referencedColumns: ["id"]
          },
        ]
      }
      group_join_requests: {
        Row: {
          created_at: string
          group_id: string
          id: string
          message: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
          user_id: string
          user_name: string
        }
        Insert: {
          created_at?: string
          group_id: string
          id?: string
          message?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          user_id: string
          user_name: string
        }
        Update: {
          created_at?: string
          group_id?: string
          id?: string
          message?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          user_id?: string
          user_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "group_join_requests_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "group_stats"
            referencedColumns: ["group_id"]
          },
          {
            foreignKeyName: "group_join_requests_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "group_join_requests_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "groups_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "group_join_requests_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "groups_search"
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
          whatsapp: string | null
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
          whatsapp?: string | null
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
          whatsapp?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "group_members_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "group_stats"
            referencedColumns: ["group_id"]
          },
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
          {
            foreignKeyName: "group_members_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "groups_search"
            referencedColumns: ["id"]
          },
        ]
      }
      groups: {
        Row: {
          city: string
          created_at: string
          default_commitment_donation: number | null
          default_commitment_goal: number | null
          default_commitment_metric: string | null
          default_commitment_name: string | null
          default_commitment_ratio: number | null
          description: string | null
          donation_type: string
          end_date: string | null
          entity_id: string | null
          goal_2026: number
          id: string
          image_url: string | null
          is_private: boolean
          leader_id: string
          leader_name: string | null
          leader_whatsapp: string | null
          members_visible: boolean
          name: string
          updated_at: string
          view_count: number
        }
        Insert: {
          city: string
          created_at?: string
          default_commitment_donation?: number | null
          default_commitment_goal?: number | null
          default_commitment_metric?: string | null
          default_commitment_name?: string | null
          default_commitment_ratio?: number | null
          description?: string | null
          donation_type: string
          end_date?: string | null
          entity_id?: string | null
          goal_2026?: number
          id?: string
          image_url?: string | null
          is_private?: boolean
          leader_id: string
          leader_name?: string | null
          leader_whatsapp?: string | null
          members_visible?: boolean
          name: string
          updated_at?: string
          view_count?: number
        }
        Update: {
          city?: string
          created_at?: string
          default_commitment_donation?: number | null
          default_commitment_goal?: number | null
          default_commitment_metric?: string | null
          default_commitment_name?: string | null
          default_commitment_ratio?: number | null
          description?: string | null
          donation_type?: string
          end_date?: string | null
          entity_id?: string | null
          goal_2026?: number
          id?: string
          image_url?: string | null
          is_private?: boolean
          leader_id?: string
          leader_name?: string | null
          leader_whatsapp?: string | null
          members_visible?: boolean
          name?: string
          updated_at?: string
          view_count?: number
        }
        Relationships: [
          {
            foreignKeyName: "groups_entity_id_fkey"
            columns: ["entity_id"]
            isOneToOne: false
            referencedRelation: "entities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "groups_entity_id_fkey"
            columns: ["entity_id"]
            isOneToOne: false
            referencedRelation: "entities_public"
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
          name: string | null
          penalty_donation: number | null
          personal_goal: number | null
          ratio: number
        }
        Insert: {
          created_at?: string
          donation_amount?: number
          id?: string
          member_id: string
          metric: string
          name?: string | null
          penalty_donation?: number | null
          personal_goal?: number | null
          ratio?: number
        }
        Update: {
          created_at?: string
          donation_amount?: number
          id?: string
          member_id?: string
          metric?: string
          name?: string | null
          penalty_donation?: number | null
          personal_goal?: number | null
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
      notification_preferences: {
        Row: {
          created_at: string
          id: string
          join_requests: boolean
          new_donations: boolean
          new_members: boolean
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          join_requests?: boolean
          new_donations?: boolean
          new_members?: boolean
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          join_requests?: boolean
          new_donations?: boolean
          new_members?: boolean
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      partners: {
        Row: {
          city: string
          created_at: string
          description: string | null
          expires_at: string | null
          id: string
          instagram: string | null
          is_approved: boolean
          is_test: boolean | null
          latitude: number | null
          logo_url: string | null
          longitude: number | null
          name: string
          referrer_name: string | null
          referrer_phone: string | null
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
          expires_at?: string | null
          id?: string
          instagram?: string | null
          is_approved?: boolean
          is_test?: boolean | null
          latitude?: number | null
          logo_url?: string | null
          longitude?: number | null
          name: string
          referrer_name?: string | null
          referrer_phone?: string | null
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
          expires_at?: string | null
          id?: string
          instagram?: string | null
          is_approved?: boolean
          is_test?: boolean | null
          latitude?: number | null
          logo_url?: string | null
          longitude?: number | null
          name?: string
          referrer_name?: string | null
          referrer_phone?: string | null
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
          city: string | null
          created_at: string
          full_name: string
          id: string
          updated_at: string
          user_id: string
          whatsapp: string
        }
        Insert: {
          city?: string | null
          created_at?: string
          full_name: string
          id?: string
          updated_at?: string
          user_id: string
          whatsapp: string
        }
        Update: {
          city?: string | null
          created_at?: string
          full_name?: string
          id?: string
          updated_at?: string
          user_id?: string
          whatsapp?: string
        }
        Relationships: []
      }
      push_subscriptions: {
        Row: {
          auth: string | null
          created_at: string
          device_token: string | null
          endpoint: string | null
          id: string
          p256dh: string | null
          platform: string
          updated_at: string
          user_id: string
        }
        Insert: {
          auth?: string | null
          created_at?: string
          device_token?: string | null
          endpoint?: string | null
          id?: string
          p256dh?: string | null
          platform?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          auth?: string | null
          created_at?: string
          device_token?: string | null
          endpoint?: string | null
          id?: string
          p256dh?: string | null
          platform?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      entities_public: {
        Row: {
          accepted_donations: string[] | null
          city: string | null
          created_at: string | null
          id: string | null
          name: string | null
          observations: string | null
        }
        Insert: {
          accepted_donations?: string[] | null
          city?: string | null
          created_at?: string | null
          id?: string | null
          name?: string | null
          observations?: string | null
        }
        Update: {
          accepted_donations?: string[] | null
          city?: string | null
          created_at?: string | null
          id?: string | null
          name?: string | null
          observations?: string | null
        }
        Relationships: []
      }
      group_stats: {
        Row: {
          group_id: string | null
          member_count: number | null
          total_donations: number | null
          total_goals: number | null
        }
        Relationships: []
      }
      groups_admin: {
        Row: {
          city: string | null
          created_at: string | null
          description: string | null
          donation_type: string | null
          end_date: string | null
          entity_id: string | null
          goal_2026: number | null
          id: string | null
          image_url: string | null
          is_private: boolean | null
          leader_email: string | null
          leader_id: string | null
          leader_name: string | null
          leader_whatsapp: string | null
          member_count: number | null
          members_visible: boolean | null
          name: string | null
          total_donations: number | null
          total_goals: number | null
          updated_at: string | null
          view_count: number | null
        }
        Relationships: []
      }
      groups_public: {
        Row: {
          city: string | null
          created_at: string | null
          default_commitment_donation: number | null
          default_commitment_goal: number | null
          default_commitment_metric: string | null
          default_commitment_name: string | null
          default_commitment_ratio: number | null
          description: string | null
          donation_type: string | null
          end_date: string | null
          entity_id: string | null
          goal_2026: number | null
          id: string | null
          image_url: string | null
          is_private: boolean | null
          leader_id: string | null
          leader_name: string | null
          member_count: number | null
          members_visible: boolean | null
          name: string | null
          total_donations: number | null
          total_goals: number | null
          updated_at: string | null
          view_count: number | null
        }
        Relationships: [
          {
            foreignKeyName: "groups_entity_id_fkey"
            columns: ["entity_id"]
            isOneToOne: false
            referencedRelation: "entities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "groups_entity_id_fkey"
            columns: ["entity_id"]
            isOneToOne: false
            referencedRelation: "entities_public"
            referencedColumns: ["id"]
          },
        ]
      }
      groups_search: {
        Row: {
          city: string | null
          description: string | null
          donation_type: string | null
          id: string | null
          is_private: boolean | null
          leader_name: string | null
          name: string | null
        }
        Insert: {
          city?: string | null
          description?: string | null
          donation_type?: string | null
          id?: string | null
          is_private?: boolean | null
          leader_name?: string | null
          name?: string | null
        }
        Update: {
          city?: string | null
          description?: string | null
          donation_type?: string | null
          id?: string | null
          is_private?: boolean | null
          leader_name?: string | null
          name?: string | null
        }
        Relationships: []
      }
      hero_stats_public: {
        Row: {
          total_goals: number | null
          total_groups: number | null
          total_users: number | null
        }
        Relationships: []
      }
      impact_stats_public: {
        Row: {
          donation_type: string | null
          total_amount: number | null
          total_entries: number | null
        }
        Relationships: []
      }
      partners_public: {
        Row: {
          city: string | null
          created_at: string | null
          description: string | null
          expires_at: string | null
          id: string | null
          instagram: string | null
          is_approved: boolean | null
          is_test: boolean | null
          latitude: number | null
          logo_url: string | null
          longitude: number | null
          name: string | null
          specialty: string | null
          tier: string | null
          whatsapp: string | null
        }
        Insert: {
          city?: string | null
          created_at?: string | null
          description?: string | null
          expires_at?: string | null
          id?: string | null
          instagram?: string | null
          is_approved?: boolean | null
          is_test?: boolean | null
          latitude?: number | null
          logo_url?: string | null
          longitude?: number | null
          name?: string | null
          specialty?: string | null
          tier?: string | null
          whatsapp?: string | null
        }
        Update: {
          city?: string | null
          created_at?: string | null
          description?: string | null
          expires_at?: string | null
          id?: string | null
          instagram?: string | null
          is_approved?: boolean | null
          is_test?: boolean | null
          latitude?: number | null
          logo_url?: string | null
          longitude?: number | null
          name?: string | null
          specialty?: string | null
          tier?: string | null
          whatsapp?: string | null
        }
        Relationships: []
      }
      users_admin: {
        Row: {
          city: string | null
          created_at: string | null
          email: string | null
          full_name: string | null
          last_sign_in_at: string | null
          profile_id: string | null
          roles: Database["public"]["Enums"]["app_role"][] | null
          updated_at: string | null
          user_created_at: string | null
          user_id: string | null
          whatsapp: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      accept_group_invitation: {
        Args: { _invite_code: string }
        Returns: string
      }
      accept_link_invitation: {
        Args: { _invite_code: string }
        Returns: string
      }
      apply_default_commitment: {
        Args: { _group_id: string; _member_id: string }
        Returns: undefined
      }
      approve_join_request: { Args: { _request_id: string }; Returns: string }
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
              _members_visible?: boolean
              _name: string
            }
            Returns: string
          }
        | {
            Args: {
              _city: string
              _default_commitment_donation?: number
              _default_commitment_goal?: number
              _default_commitment_metric?: string
              _default_commitment_name?: string
              _default_commitment_ratio?: number
              _description: string
              _donation_type: string
              _end_date?: string
              _entity_id?: string
              _goal_2026: number
              _is_private: boolean
              _leader_name: string
              _leader_whatsapp: string
              _members_visible?: boolean
              _name: string
            }
            Returns: string
          }
      get_admin_groups: {
        Args: never
        Returns: {
          city: string
          created_at: string
          description: string
          donation_type: string
          end_date: string
          entity_id: string
          goal_2026: number
          id: string
          image_url: string
          is_private: boolean
          leader_email: string
          leader_id: string
          leader_name: string
          leader_whatsapp: string
          member_count: number
          members_visible: boolean
          name: string
          total_donations: number
          total_goals: number
          updated_at: string
          view_count: number
        }[]
      }
      get_admin_invitations: {
        Args: never
        Returns: {
          created_at: string
          email: string
          expires_at: string
          group_id: string
          group_name: string
          id: string
          invite_code: string
          invite_type: string
          invited_by: string
          invited_by_name: string
          status: string
        }[]
      }
      get_admin_users: {
        Args: never
        Returns: {
          city: string
          created_at: string
          email: string
          full_name: string
          last_sign_in_at: string
          profile_id: string
          roles: Database["public"]["Enums"]["app_role"][]
          updated_at: string
          user_created_at: string
          user_id: string
          whatsapp: string
        }[]
      }
      get_invitation_stats: {
        Args: never
        Returns: {
          acceptance_rate: number
          accepted_invitations: number
          expired_invitations: number
          pending_invitations: number
          total_invitations: number
        }[]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      increment_group_view_count: {
        Args: { _group_id: string }
        Returns: undefined
      }
      is_admin: { Args: { _user_id: string }; Returns: boolean }
      is_current_user_email: { Args: { _email: string }; Returns: boolean }
      is_group_member: {
        Args: { _group_id: string; _user_id: string }
        Returns: boolean
      }
      link_member_by_whatsapp: {
        Args: { _whatsapp: string }
        Returns: {
          group_id: string
          group_name: string
          member_id: string
        }[]
      }
      notify_group_leader: {
        Args: {
          _actor_name: string
          _details?: Json
          _event_type: string
          _group_id: string
        }
        Returns: undefined
      }
      reject_join_request: { Args: { _request_id: string }; Returns: undefined }
      renew_invitation: { Args: { _invitation_id: string }; Returns: string }
      revoke_invitation: {
        Args: { _invitation_id: string }
        Returns: undefined
      }
      validate_invite_code: {
        Args: { _invite_code: string }
        Returns: {
          group_id: string
          group_name: string
          is_valid: boolean
        }[]
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
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
    Enums: {
      app_role: ["admin", "moderator", "user"],
    },
  },
} as const
