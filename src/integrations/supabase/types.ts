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
      admin_debug_logs: {
        Row: {
          attached_images_count: number | null
          autofix_history: Json | null
          created_at: string
          design_system_info: Json | null
          error_message: string | null
          errors: Json | null
          files_diff: Json | null
          id: string
          mode: string | null
          model_calls: Json | null
          phase_timings: Json | null
          phases: Json | null
          project_id: string | null
          prompt_full: string | null
          session_id: string
          stack_trace: string | null
          success: boolean | null
          tokens_by_phase: Json | null
          tool_executions: Json | null
          total_duration_ms: number | null
          total_input_tokens: number | null
          total_output_tokens: number | null
          user_id: string | null
          validation_details: Json | null
        }
        Insert: {
          attached_images_count?: number | null
          autofix_history?: Json | null
          created_at?: string
          design_system_info?: Json | null
          error_message?: string | null
          errors?: Json | null
          files_diff?: Json | null
          id?: string
          mode?: string | null
          model_calls?: Json | null
          phase_timings?: Json | null
          phases?: Json | null
          project_id?: string | null
          prompt_full?: string | null
          session_id: string
          stack_trace?: string | null
          success?: boolean | null
          tokens_by_phase?: Json | null
          tool_executions?: Json | null
          total_duration_ms?: number | null
          total_input_tokens?: number | null
          total_output_tokens?: number | null
          user_id?: string | null
          validation_details?: Json | null
        }
        Update: {
          attached_images_count?: number | null
          autofix_history?: Json | null
          created_at?: string
          design_system_info?: Json | null
          error_message?: string | null
          errors?: Json | null
          files_diff?: Json | null
          id?: string
          mode?: string | null
          model_calls?: Json | null
          phase_timings?: Json | null
          phases?: Json | null
          project_id?: string | null
          prompt_full?: string | null
          session_id?: string
          stack_trace?: string | null
          success?: boolean | null
          tokens_by_phase?: Json | null
          tool_executions?: Json | null
          total_duration_ms?: number | null
          total_input_tokens?: number | null
          total_output_tokens?: number | null
          user_id?: string | null
          validation_details?: Json | null
        }
        Relationships: []
      }
      agent_execution_logs: {
        Row: {
          completed_at: string | null
          complexity_score: number | null
          content: string | null
          created_at: string
          duration_ms: number | null
          error_message: string | null
          files_affected: Json | null
          id: string
          metadata: Json | null
          model_id: string | null
          packages_affected: Json | null
          parent_message_id: string | null
          phase: string | null
          project_id: string
          prompt_snippet: string | null
          session_id: string
          step_index: number
          step_type: string
          success: boolean | null
          tokens_used: number | null
          tool_args: Json | null
          tool_name: string | null
          tool_result: Json | null
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          complexity_score?: number | null
          content?: string | null
          created_at?: string
          duration_ms?: number | null
          error_message?: string | null
          files_affected?: Json | null
          id?: string
          metadata?: Json | null
          model_id?: string | null
          packages_affected?: Json | null
          parent_message_id?: string | null
          phase?: string | null
          project_id: string
          prompt_snippet?: string | null
          session_id: string
          step_index?: number
          step_type: string
          success?: boolean | null
          tokens_used?: number | null
          tool_args?: Json | null
          tool_name?: string | null
          tool_result?: Json | null
          user_id: string
        }
        Update: {
          completed_at?: string | null
          complexity_score?: number | null
          content?: string | null
          created_at?: string
          duration_ms?: number | null
          error_message?: string | null
          files_affected?: Json | null
          id?: string
          metadata?: Json | null
          model_id?: string | null
          packages_affected?: Json | null
          parent_message_id?: string | null
          phase?: string | null
          project_id?: string
          prompt_snippet?: string | null
          session_id?: string
          step_index?: number
          step_type?: string
          success?: boolean | null
          tokens_used?: number | null
          tool_args?: Json | null
          tool_name?: string | null
          tool_result?: Json | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "agent_execution_logs_parent_message_id_fkey"
            columns: ["parent_message_id"]
            isOneToOne: false
            referencedRelation: "chat_messages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agent_execution_logs_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      agent_session_summary: {
        Row: {
          completed_at: string | null
          complexity: string | null
          failed_steps: number | null
          files_created: number | null
          files_deleted: number | null
          files_modified: number | null
          final_status: string | null
          id: string
          metadata: Json | null
          project_id: string
          prompt_type: string | null
          session_id: string
          started_at: string
          successful_steps: number | null
          total_duration_ms: number | null
          total_steps: number | null
          total_tokens: number | null
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          complexity?: string | null
          failed_steps?: number | null
          files_created?: number | null
          files_deleted?: number | null
          files_modified?: number | null
          final_status?: string | null
          id?: string
          metadata?: Json | null
          project_id: string
          prompt_type?: string | null
          session_id: string
          started_at?: string
          successful_steps?: number | null
          total_duration_ms?: number | null
          total_steps?: number | null
          total_tokens?: number | null
          user_id: string
        }
        Update: {
          completed_at?: string | null
          complexity?: string | null
          failed_steps?: number | null
          files_created?: number | null
          files_deleted?: number | null
          files_modified?: number | null
          final_status?: string | null
          id?: string
          metadata?: Json | null
          project_id?: string
          prompt_type?: string | null
          session_id?: string
          started_at?: string
          successful_steps?: number | null
          total_duration_ms?: number | null
          total_steps?: number | null
          total_tokens?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "agent_session_summary_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_messages: {
        Row: {
          content: string
          created_at: string
          id: string
          metadata: Json | null
          project_id: string
          role: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          metadata?: Json | null
          project_id: string
          role: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          metadata?: Json | null
          project_id?: string
          role?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      debug_metrics: {
        Row: {
          attempt_count: number
          classification_ms: number | null
          created_at: string
          error_category: string
          error_message: string | null
          error_severity: string
          escalation_count: number
          execution_ms: number | null
          files_changed: number
          fix_strategy: string
          id: string
          input_tokens: number
          metadata: Json | null
          model_tier: string
          output_tokens: number
          planning_ms: number | null
          project_id: string | null
          session_id: string
          success: boolean
          total_ms: number | null
          user_id: string | null
        }
        Insert: {
          attempt_count?: number
          classification_ms?: number | null
          created_at?: string
          error_category: string
          error_message?: string | null
          error_severity: string
          escalation_count?: number
          execution_ms?: number | null
          files_changed?: number
          fix_strategy: string
          id?: string
          input_tokens?: number
          metadata?: Json | null
          model_tier: string
          output_tokens?: number
          planning_ms?: number | null
          project_id?: string | null
          session_id: string
          success?: boolean
          total_ms?: number | null
          user_id?: string | null
        }
        Update: {
          attempt_count?: number
          classification_ms?: number | null
          created_at?: string
          error_category?: string
          error_message?: string | null
          error_severity?: string
          escalation_count?: number
          execution_ms?: number | null
          files_changed?: number
          fix_strategy?: string
          id?: string
          input_tokens?: number
          metadata?: Json | null
          model_tier?: string
          output_tokens?: number
          planning_ms?: number | null
          project_id?: string | null
          session_id?: string
          success?: boolean
          total_ms?: number | null
          user_id?: string | null
        }
        Relationships: []
      }
      debug_snapshots: {
        Row: {
          created_at: string
          expires_at: string | null
          file_count: number
          files: Json
          id: string
          packages: Json
          project_id: string
          restored_at: string | null
          status: string
          total_size_bytes: number
          trigger_error: string | null
          trigger_session_id: string | null
          trigger_type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          expires_at?: string | null
          file_count?: number
          files?: Json
          id?: string
          packages?: Json
          project_id: string
          restored_at?: string | null
          status?: string
          total_size_bytes?: number
          trigger_error?: string | null
          trigger_session_id?: string | null
          trigger_type?: string
          user_id: string
        }
        Update: {
          created_at?: string
          expires_at?: string | null
          file_count?: number
          files?: Json
          id?: string
          packages?: Json
          project_id?: string
          restored_at?: string | null
          status?: string
          total_size_bytes?: number
          trigger_error?: string | null
          trigger_session_id?: string | null
          trigger_type?: string
          user_id?: string
        }
        Relationships: []
      }
      job_logs: {
        Row: {
          created_at: string
          id: string
          job_id: string
          level: string
          message: string
          metadata: Json | null
        }
        Insert: {
          created_at?: string
          id?: string
          job_id: string
          level?: string
          message: string
          metadata?: Json | null
        }
        Update: {
          created_at?: string
          id?: string
          job_id?: string
          level?: string
          message?: string
          metadata?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "job_logs_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "job_queue"
            referencedColumns: ["id"]
          },
        ]
      }
      job_queue: {
        Row: {
          attempts: number
          completed_at: string | null
          created_at: string
          error_message: string | null
          id: string
          job_type: string
          max_attempts: number
          payload: Json
          priority: number
          project_id: string | null
          result: Json | null
          scheduled_for: string
          started_at: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          attempts?: number
          completed_at?: string | null
          created_at?: string
          error_message?: string | null
          id?: string
          job_type: string
          max_attempts?: number
          payload?: Json
          priority?: number
          project_id?: string | null
          result?: Json | null
          scheduled_for?: string
          started_at?: string | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          attempts?: number
          completed_at?: string | null
          created_at?: string
          error_message?: string | null
          id?: string
          job_type?: string
          max_attempts?: number
          payload?: Json
          priority?: number
          project_id?: string | null
          result?: Json | null
          scheduled_for?: string
          started_at?: string | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "job_queue_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      migration_log: {
        Row: {
          created_at: string
          error_message: string | null
          executed_at: string
          id: string
          migration_id: string
          project_id: string | null
          results: Json | null
          sql: string
          status: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          error_message?: string | null
          executed_at?: string
          id?: string
          migration_id: string
          project_id?: string | null
          results?: Json | null
          sql: string
          status?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          error_message?: string | null
          executed_at?: string
          id?: string
          migration_id?: string
          project_id?: string | null
          results?: Json | null
          sql?: string
          status?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "migration_log_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      model_usage_metrics: {
        Row: {
          created_at: string
          duration_ms: number | null
          id: string
          input_tokens: number
          metadata: Json | null
          model_id: string
          model_tier: string
          output_tokens: number
          project_id: string | null
          prompt_complexity: string | null
          request_type: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          duration_ms?: number | null
          id?: string
          input_tokens?: number
          metadata?: Json | null
          model_id: string
          model_tier: string
          output_tokens?: number
          project_id?: string | null
          prompt_complexity?: string | null
          request_type: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          duration_ms?: number | null
          id?: string
          input_tokens?: number
          metadata?: Json | null
          model_id?: string
          model_tier?: string
          output_tokens?: number
          project_id?: string | null
          prompt_complexity?: string | null
          request_type?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "model_usage_metrics_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          is_admin: boolean | null
          provider: string | null
          provider_id: string | null
          telegram_username: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          is_admin?: boolean | null
          provider?: string | null
          provider_id?: string | null
          telegram_username?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          is_admin?: boolean | null
          provider?: string | null
          provider_id?: string | null
          telegram_username?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      project_versions: {
        Row: {
          created_at: string
          diff: Json | null
          files: Json
          files_changed: number
          id: string
          is_published: boolean
          lines_added: number
          lines_removed: number
          message: string | null
          parent_version_id: string | null
          project_id: string
          published_at: string | null
          user_id: string
          version_number: number
        }
        Insert: {
          created_at?: string
          diff?: Json | null
          files?: Json
          files_changed?: number
          id?: string
          is_published?: boolean
          lines_added?: number
          lines_removed?: number
          message?: string | null
          parent_version_id?: string | null
          project_id: string
          published_at?: string | null
          user_id: string
          version_number: number
        }
        Update: {
          created_at?: string
          diff?: Json | null
          files?: Json
          files_changed?: number
          id?: string
          is_published?: boolean
          lines_added?: number
          lines_removed?: number
          message?: string | null
          parent_version_id?: string | null
          project_id?: string
          published_at?: string | null
          user_id?: string
          version_number?: number
        }
        Relationships: [
          {
            foreignKeyName: "project_versions_parent_version_id_fkey"
            columns: ["parent_version_id"]
            isOneToOne: false
            referencedRelation: "project_versions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_versions_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      projects: {
        Row: {
          config: Json | null
          created_at: string
          dependencies: Json | null
          id: string
          name: string
          preview_html: string | null
          published_url: string | null
          react_files: Json | null
          sections: Json | null
          slug: string
          status: string
          type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          config?: Json | null
          created_at?: string
          dependencies?: Json | null
          id?: string
          name: string
          preview_html?: string | null
          published_url?: string | null
          react_files?: Json | null
          sections?: Json | null
          slug: string
          status?: string
          type?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          config?: Json | null
          created_at?: string
          dependencies?: Json | null
          id?: string
          name?: string
          preview_html?: string | null
          published_url?: string | null
          react_files?: Json | null
          sections?: Json | null
          slug?: string
          status?: string
          type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      section_cache: {
        Row: {
          created_at: string
          hit_count: number
          html: string
          id: string
          last_hit_at: string | null
          prompt_hash: string
          section_type: string | null
          usage_input_tokens: number | null
          usage_output_tokens: number | null
        }
        Insert: {
          created_at?: string
          hit_count?: number
          html: string
          id?: string
          last_hit_at?: string | null
          prompt_hash: string
          section_type?: string | null
          usage_input_tokens?: number | null
          usage_output_tokens?: number | null
        }
        Update: {
          created_at?: string
          hit_count?: number
          html?: string
          id?: string
          last_hit_at?: string | null
          prompt_hash?: string
          section_type?: string | null
          usage_input_tokens?: number | null
          usage_output_tokens?: number | null
        }
        Relationships: []
      }
      user_credits: {
        Row: {
          created_at: string
          credits: number
          id: string
          total_used: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          credits?: number
          id?: string
          total_used?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          credits?: number
          id?: string
          total_used?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      claim_next_job: {
        Args: { worker_id: string }
        Returns: {
          attempts: number
          completed_at: string | null
          created_at: string
          error_message: string | null
          id: string
          job_type: string
          max_attempts: number
          payload: Json
          priority: number
          project_id: string | null
          result: Json | null
          scheduled_for: string
          started_at: string | null
          status: string
          updated_at: string
          user_id: string
        }
        SetofOptions: {
          from: "*"
          to: "job_queue"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      cleanup_expired_snapshots: { Args: never; Returns: number }
      complete_job: {
        Args: {
          p_error?: string
          p_job_id: string
          p_result?: Json
          p_success: boolean
        }
        Returns: undefined
      }
      create_debug_snapshot: {
        Args: {
          p_files: Json
          p_packages?: Json
          p_project_id: string
          p_session_id?: string
          p_trigger_error?: string
          p_trigger_type?: string
          p_user_id: string
        }
        Returns: {
          created_at: string
          expires_at: string | null
          file_count: number
          files: Json
          id: string
          packages: Json
          project_id: string
          restored_at: string | null
          status: string
          total_size_bytes: number
          trigger_error: string | null
          trigger_session_id: string | null
          trigger_type: string
          user_id: string
        }
        SetofOptions: {
          from: "*"
          to: "debug_snapshots"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      create_project_version: {
        Args: {
          p_files: Json
          p_message?: string
          p_project_id: string
          p_user_id: string
        }
        Returns: {
          created_at: string
          diff: Json | null
          files: Json
          files_changed: number
          id: string
          is_published: boolean
          lines_added: number
          lines_removed: number
          message: string | null
          parent_version_id: string | null
          project_id: string
          published_at: string | null
          user_id: string
          version_number: number
        }
        SetofOptions: {
          from: "*"
          to: "project_versions"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      get_next_version_number: {
        Args: { p_project_id: string }
        Returns: number
      }
      restore_debug_snapshot: {
        Args: { p_snapshot_id: string; p_user_id: string }
        Returns: {
          created_at: string
          expires_at: string | null
          file_count: number
          files: Json
          id: string
          packages: Json
          project_id: string
          restored_at: string | null
          status: string
          total_size_bytes: number
          trigger_error: string | null
          trigger_session_id: string | null
          trigger_type: string
          user_id: string
        }
        SetofOptions: {
          from: "*"
          to: "debug_snapshots"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      restore_project_version: {
        Args: { p_user_id: string; p_version_id: string }
        Returns: {
          created_at: string
          diff: Json | null
          files: Json
          files_changed: number
          id: string
          is_published: boolean
          lines_added: number
          lines_removed: number
          message: string | null
          parent_version_id: string | null
          project_id: string
          published_at: string | null
          user_id: string
          version_number: number
        }
        SetofOptions: {
          from: "*"
          to: "project_versions"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      retry_job: { Args: { p_job_id: string }; Returns: boolean }
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
