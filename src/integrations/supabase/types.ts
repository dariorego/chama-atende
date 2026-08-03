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
      ai_prompts: {
        Row: {
          created_at: string
          id: string
          is_active: boolean
          parent_id: string | null
          prompt: string
          restaurant_id: string
          title: string
          updated_at: string
          version: number
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean
          parent_id?: string | null
          prompt: string
          restaurant_id: string
          title: string
          updated_at?: string
          version?: number
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean
          parent_id?: string | null
          prompt?: string
          restaurant_id?: string
          title?: string
          updated_at?: string
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "ai_prompts_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "ai_prompts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_prompts_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_settings: {
        Row: {
          abandon_minutes: number
          created_at: string
          enabled: boolean
          fallback_message: string
          id: string
          max_tokens: number
          model: string
          reply_delay_ms: number
          restaurant_id: string
          retry: number
          temperature: number
          timeout_ms: number
          top_p: number
          updated_at: string
          welcome_message: string | null
        }
        Insert: {
          abandon_minutes?: number
          created_at?: string
          enabled?: boolean
          fallback_message?: string
          id?: string
          max_tokens?: number
          model?: string
          reply_delay_ms?: number
          restaurant_id: string
          retry?: number
          temperature?: number
          timeout_ms?: number
          top_p?: number
          updated_at?: string
          welcome_message?: string | null
        }
        Update: {
          abandon_minutes?: number
          created_at?: string
          enabled?: boolean
          fallback_message?: string
          id?: string
          max_tokens?: number
          model?: string
          reply_delay_ms?: number
          restaurant_id?: string
          retry?: number
          temperature?: number
          timeout_ms?: number
          top_p?: number
          updated_at?: string
          welcome_message?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_settings_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: true
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
        ]
      }
      comandas: {
        Row: {
          bill_requested_at: string | null
          closed_at: string | null
          code: string
          created_at: string
          customer_name: string | null
          id: string
          notes: string | null
          opened_at: string
          restaurant_id: string
          sequence: number
          status: string
          table_id: string | null
          table_session_id: string | null
          total_amount: number
          updated_at: string
          waiter_id: string | null
        }
        Insert: {
          bill_requested_at?: string | null
          closed_at?: string | null
          code: string
          created_at?: string
          customer_name?: string | null
          id?: string
          notes?: string | null
          opened_at?: string
          restaurant_id: string
          sequence?: number
          status?: string
          table_id?: string | null
          table_session_id?: string | null
          total_amount?: number
          updated_at?: string
          waiter_id?: string | null
        }
        Update: {
          bill_requested_at?: string | null
          closed_at?: string | null
          code?: string
          created_at?: string
          customer_name?: string | null
          id?: string
          notes?: string | null
          opened_at?: string
          restaurant_id?: string
          sequence?: number
          status?: string
          table_id?: string | null
          table_session_id?: string | null
          total_amount?: number
          updated_at?: string
          waiter_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "comandas_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comandas_table_id_fkey"
            columns: ["table_id"]
            isOneToOne: false
            referencedRelation: "tables"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comandas_table_session_id_fkey"
            columns: ["table_session_id"]
            isOneToOne: false
            referencedRelation: "table_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comandas_waiter_id_fkey"
            columns: ["waiter_id"]
            isOneToOne: false
            referencedRelation: "waiters"
            referencedColumns: ["id"]
          },
        ]
      }
      coupon_redemptions: {
        Row: {
          applied_at: string
          comanda_id: string | null
          coupon_id: string
          customer_id: string | null
          customer_phone: string | null
          discount_value: number
          id: string
          order_id: string | null
          pre_order_id: string | null
          restaurant_id: string
        }
        Insert: {
          applied_at?: string
          comanda_id?: string | null
          coupon_id: string
          customer_id?: string | null
          customer_phone?: string | null
          discount_value?: number
          id?: string
          order_id?: string | null
          pre_order_id?: string | null
          restaurant_id: string
        }
        Update: {
          applied_at?: string
          comanda_id?: string | null
          coupon_id?: string
          customer_id?: string | null
          customer_phone?: string | null
          discount_value?: number
          id?: string
          order_id?: string | null
          pre_order_id?: string | null
          restaurant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "coupon_redemptions_coupon_id_fkey"
            columns: ["coupon_id"]
            isOneToOne: false
            referencedRelation: "coupons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "coupon_redemptions_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "coupon_redemptions_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
        ]
      }
      coupons: {
        Row: {
          apply_to: string
          auto_apply: boolean
          code: string
          created_at: string
          description: string | null
          id: string
          is_first_order_only: boolean
          max_discount_value: number | null
          min_order_value: number
          restaurant_id: string
          status: string
          target_ids: string[] | null
          type: string
          updated_at: string
          usage_count: number
          usage_limit: number | null
          usage_limit_per_customer: number | null
          valid_from: string | null
          valid_until: string | null
          value: number
        }
        Insert: {
          apply_to?: string
          auto_apply?: boolean
          code: string
          created_at?: string
          description?: string | null
          id?: string
          is_first_order_only?: boolean
          max_discount_value?: number | null
          min_order_value?: number
          restaurant_id: string
          status?: string
          target_ids?: string[] | null
          type?: string
          updated_at?: string
          usage_count?: number
          usage_limit?: number | null
          usage_limit_per_customer?: number | null
          valid_from?: string | null
          valid_until?: string | null
          value?: number
        }
        Update: {
          apply_to?: string
          auto_apply?: boolean
          code?: string
          created_at?: string
          description?: string | null
          id?: string
          is_first_order_only?: boolean
          max_discount_value?: number | null
          min_order_value?: number
          restaurant_id?: string
          status?: string
          target_ids?: string[] | null
          type?: string
          updated_at?: string
          usage_count?: number
          usage_limit?: number | null
          usage_limit_per_customer?: number | null
          valid_from?: string | null
          valid_until?: string | null
          value?: number
        }
        Relationships: [
          {
            foreignKeyName: "coupons_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
        ]
      }
      customer_loyalty_balances: {
        Row: {
          customer_id: string
          id: string
          points_balance: number
          restaurant_id: string
          tier_id: string | null
          total_earned_lifetime: number
          total_redeemed_lifetime: number
          updated_at: string
        }
        Insert: {
          customer_id: string
          id?: string
          points_balance?: number
          restaurant_id: string
          tier_id?: string | null
          total_earned_lifetime?: number
          total_redeemed_lifetime?: number
          updated_at?: string
        }
        Update: {
          customer_id?: string
          id?: string
          points_balance?: number
          restaurant_id?: string
          tier_id?: string | null
          total_earned_lifetime?: number
          total_redeemed_lifetime?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "customer_loyalty_balances_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "customer_loyalty_balances_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "customer_loyalty_balances_tier_id_fkey"
            columns: ["tier_id"]
            isOneToOne: false
            referencedRelation: "loyalty_tiers"
            referencedColumns: ["id"]
          },
        ]
      }
      customer_reviews: {
        Row: {
          admin_response: string | null
          ambiente_rating: number | null
          atendimento_rating: number | null
          comida_rating: number | null
          created_at: string | null
          customer_name: string
          id: string
          is_featured: boolean | null
          observations: string | null
          overall_rating: number | null
          phone: string | null
          responded_at: string | null
          responded_by: string | null
          restaurant_id: string
          status: string
          updated_at: string | null
        }
        Insert: {
          admin_response?: string | null
          ambiente_rating?: number | null
          atendimento_rating?: number | null
          comida_rating?: number | null
          created_at?: string | null
          customer_name: string
          id?: string
          is_featured?: boolean | null
          observations?: string | null
          overall_rating?: number | null
          phone?: string | null
          responded_at?: string | null
          responded_by?: string | null
          restaurant_id: string
          status?: string
          updated_at?: string | null
        }
        Update: {
          admin_response?: string | null
          ambiente_rating?: number | null
          atendimento_rating?: number | null
          comida_rating?: number | null
          created_at?: string | null
          customer_name?: string
          id?: string
          is_featured?: boolean | null
          observations?: string | null
          overall_rating?: number | null
          phone?: string | null
          responded_at?: string | null
          responded_by?: string | null
          restaurant_id?: string
          status?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "customer_reviews_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
        ]
      }
      customers: {
        Row: {
          created_at: string
          email: string | null
          id: string
          name: string | null
          phone: string
          restaurant_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          id?: string
          name?: string | null
          phone: string
          restaurant_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string | null
          id?: string
          name?: string | null
          phone?: string
          restaurant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "customers_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
        ]
      }
      employee_shifts: {
        Row: {
          created_at: string
          employee_id: string
          end_time: string
          id: string
          notes: string | null
          restaurant_id: string
          role: string | null
          shift_date: string
          start_time: string
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          employee_id: string
          end_time: string
          id?: string
          notes?: string | null
          restaurant_id: string
          role?: string | null
          shift_date: string
          start_time: string
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          employee_id?: string
          end_time?: string
          id?: string
          notes?: string | null
          restaurant_id?: string
          role?: string | null
          shift_date?: string
          start_time?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "employee_shifts_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "employee_shifts_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
        ]
      }
      employee_time_off: {
        Row: {
          created_at: string
          employee_id: string
          end_date: string
          id: string
          reason: string | null
          restaurant_id: string
          reviewed_at: string | null
          reviewed_by: string | null
          start_date: string
          status: string
          type: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          employee_id: string
          end_date: string
          id?: string
          reason?: string | null
          restaurant_id: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          start_date: string
          status?: string
          type?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          employee_id?: string
          end_date?: string
          id?: string
          reason?: string | null
          restaurant_id?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          start_date?: string
          status?: string
          type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "employee_time_off_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "employee_time_off_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
        ]
      }
      employees: {
        Row: {
          created_at: string
          email: string | null
          full_name: string
          hire_date: string | null
          hourly_rate: number | null
          id: string
          is_active: boolean
          notes: string | null
          phone: string | null
          restaurant_id: string
          role: string | null
          updated_at: string
          user_id: string | null
          weekly_hours: number | null
        }
        Insert: {
          created_at?: string
          email?: string | null
          full_name: string
          hire_date?: string | null
          hourly_rate?: number | null
          id?: string
          is_active?: boolean
          notes?: string | null
          phone?: string | null
          restaurant_id: string
          role?: string | null
          updated_at?: string
          user_id?: string | null
          weekly_hours?: number | null
        }
        Update: {
          created_at?: string
          email?: string | null
          full_name?: string
          hire_date?: string | null
          hourly_rate?: number | null
          id?: string
          is_active?: boolean
          notes?: string | null
          phone?: string | null
          restaurant_id?: string
          role?: string | null
          updated_at?: string
          user_id?: string | null
          weekly_hours?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "employees_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
        ]
      }
      event_bookings: {
        Row: {
          admin_response: string | null
          booking_code: string
          budget_range: string | null
          cancelled_at: string | null
          confirmed_at: string | null
          created_at: string
          customer_email: string | null
          customer_name: string
          customer_phone: string
          description: string | null
          event_date: string
          event_time: string | null
          event_type: string
          guest_count: number
          id: string
          quote_amount: number | null
          quote_details: string | null
          quoted_at: string | null
          restaurant_id: string
          status: string
          updated_at: string
        }
        Insert: {
          admin_response?: string | null
          booking_code: string
          budget_range?: string | null
          cancelled_at?: string | null
          confirmed_at?: string | null
          created_at?: string
          customer_email?: string | null
          customer_name: string
          customer_phone: string
          description?: string | null
          event_date: string
          event_time?: string | null
          event_type: string
          guest_count: number
          id?: string
          quote_amount?: number | null
          quote_details?: string | null
          quoted_at?: string | null
          restaurant_id: string
          status?: string
          updated_at?: string
        }
        Update: {
          admin_response?: string | null
          booking_code?: string
          budget_range?: string | null
          cancelled_at?: string | null
          confirmed_at?: string | null
          created_at?: string
          customer_email?: string | null
          customer_name?: string
          customer_phone?: string
          description?: string | null
          event_date?: string
          event_time?: string | null
          event_type?: string
          guest_count?: number
          id?: string
          quote_amount?: number | null
          quote_details?: string | null
          quoted_at?: string | null
          restaurant_id?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_bookings_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
        ]
      }
      keep_alive: {
        Row: {
          created_at: string
          id: number
        }
        Insert: {
          created_at?: string
          id?: number
        }
        Update: {
          created_at?: string
          id?: number
        }
        Relationships: []
      }
      loyalty_programs: {
        Row: {
          created_at: string
          currency_value_per_point: number
          id: string
          is_active: boolean
          points_per_currency: number
          restaurant_id: string
          status: string
          updated_at: string
          welcome_points: number
        }
        Insert: {
          created_at?: string
          currency_value_per_point?: number
          id?: string
          is_active?: boolean
          points_per_currency?: number
          restaurant_id: string
          status?: string
          updated_at?: string
          welcome_points?: number
        }
        Update: {
          created_at?: string
          currency_value_per_point?: number
          id?: string
          is_active?: boolean
          points_per_currency?: number
          restaurant_id?: string
          status?: string
          updated_at?: string
          welcome_points?: number
        }
        Relationships: [
          {
            foreignKeyName: "loyalty_programs_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: true
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
        ]
      }
      loyalty_rewards: {
        Row: {
          created_at: string
          description: string | null
          discount_type: string
          discount_value: number
          display_order: number
          id: string
          is_active: boolean
          name: string
          points_cost: number
          restaurant_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          discount_type?: string
          discount_value?: number
          display_order?: number
          id?: string
          is_active?: boolean
          name: string
          points_cost?: number
          restaurant_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          discount_type?: string
          discount_value?: number
          display_order?: number
          id?: string
          is_active?: boolean
          name?: string
          points_cost?: number
          restaurant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "loyalty_rewards_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
        ]
      }
      loyalty_tiers: {
        Row: {
          color: string | null
          created_at: string
          display_order: number
          icon: string | null
          id: string
          is_active: boolean
          min_points: number
          multiplier: number
          name: string
          restaurant_id: string
          updated_at: string
        }
        Insert: {
          color?: string | null
          created_at?: string
          display_order?: number
          icon?: string | null
          id?: string
          is_active?: boolean
          min_points?: number
          multiplier?: number
          name: string
          restaurant_id: string
          updated_at?: string
        }
        Update: {
          color?: string | null
          created_at?: string
          display_order?: number
          icon?: string | null
          id?: string
          is_active?: boolean
          min_points?: number
          multiplier?: number
          name?: string
          restaurant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "loyalty_tiers_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
        ]
      }
      loyalty_transactions: {
        Row: {
          coupon_id: string | null
          created_at: string
          created_by: string | null
          customer_id: string
          description: string | null
          id: string
          order_id: string | null
          points: number
          referral_id: string | null
          restaurant_id: string
          reward_id: string | null
          type: string
        }
        Insert: {
          coupon_id?: string | null
          created_at?: string
          created_by?: string | null
          customer_id: string
          description?: string | null
          id?: string
          order_id?: string | null
          points?: number
          referral_id?: string | null
          restaurant_id: string
          reward_id?: string | null
          type: string
        }
        Update: {
          coupon_id?: string | null
          created_at?: string
          created_by?: string | null
          customer_id?: string
          description?: string | null
          id?: string
          order_id?: string | null
          points?: number
          referral_id?: string | null
          restaurant_id?: string
          reward_id?: string | null
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "loyalty_transactions_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "loyalty_transactions_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "loyalty_transactions_reward_id_fkey"
            columns: ["reward_id"]
            isOneToOne: false
            referencedRelation: "loyalty_rewards"
            referencedColumns: ["id"]
          },
        ]
      }
      menu_categories: {
        Row: {
          created_at: string | null
          description: string | null
          display_order: number | null
          id: string
          is_active: boolean | null
          name: string
          restaurant_id: string
          slug: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          id?: string
          is_active?: boolean | null
          name: string
          restaurant_id: string
          slug: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          id?: string
          is_active?: boolean | null
          name?: string
          restaurant_id?: string
          slug?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "menu_categories_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
        ]
      }
      menu_products: {
        Row: {
          category_id: string
          created_at: string | null
          description: string | null
          display_order: number | null
          id: string
          image_url: string | null
          is_active: boolean | null
          is_highlight: boolean | null
          is_orderable: boolean | null
          name: string
          price: number
          promotional_price: number | null
          restaurant_id: string
          show_on_display: boolean
          updated_at: string | null
        }
        Insert: {
          category_id: string
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          is_highlight?: boolean | null
          is_orderable?: boolean | null
          name: string
          price: number
          promotional_price?: number | null
          restaurant_id: string
          show_on_display?: boolean
          updated_at?: string | null
        }
        Update: {
          category_id?: string
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          is_highlight?: boolean | null
          is_orderable?: boolean | null
          name?: string
          price?: number
          promotional_price?: number | null
          restaurant_id?: string
          show_on_display?: boolean
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "menu_products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "menu_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "menu_products_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
        ]
      }
      order_combination_groups: {
        Row: {
          created_at: string | null
          description: string | null
          display_order: number | null
          id: string
          is_active: boolean | null
          is_required: boolean | null
          max_selections: number | null
          min_selections: number | null
          name: string
          restaurant_id: string
          selection_type: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          id?: string
          is_active?: boolean | null
          is_required?: boolean | null
          max_selections?: number | null
          min_selections?: number | null
          name: string
          restaurant_id: string
          selection_type?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          id?: string
          is_active?: boolean | null
          is_required?: boolean | null
          max_selections?: number | null
          min_selections?: number | null
          name?: string
          restaurant_id?: string
          selection_type?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "order_combination_groups_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
        ]
      }
      order_combination_options: {
        Row: {
          additional_price: number | null
          created_at: string | null
          description: string | null
          display_order: number | null
          emoji: string | null
          group_id: string
          id: string
          is_active: boolean | null
          name: string
          updated_at: string | null
        }
        Insert: {
          additional_price?: number | null
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          emoji?: string | null
          group_id: string
          id?: string
          is_active?: boolean | null
          name: string
          updated_at?: string | null
        }
        Update: {
          additional_price?: number | null
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          emoji?: string | null
          group_id?: string
          id?: string
          is_active?: boolean | null
          name?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "order_combination_options_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "order_combination_groups"
            referencedColumns: ["id"]
          },
        ]
      }
      order_item_groups: {
        Row: {
          combination_group_id: string
          created_at: string | null
          display_order: number | null
          id: string
          is_required: boolean | null
          order_item_id: string
        }
        Insert: {
          combination_group_id: string
          created_at?: string | null
          display_order?: number | null
          id?: string
          is_required?: boolean | null
          order_item_id: string
        }
        Update: {
          combination_group_id?: string
          created_at?: string | null
          display_order?: number | null
          id?: string
          is_required?: boolean | null
          order_item_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "order_item_groups_combination_group_id_fkey"
            columns: ["combination_group_id"]
            isOneToOne: false
            referencedRelation: "order_combination_groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_item_groups_order_item_id_fkey"
            columns: ["order_item_id"]
            isOneToOne: false
            referencedRelation: "order_items"
            referencedColumns: ["id"]
          },
        ]
      }
      order_items: {
        Row: {
          created_at: string | null
          description: string | null
          display_order: number | null
          id: string
          image_url: string | null
          is_active: boolean | null
          name: string
          price: number | null
          restaurant_id: string
          tags: Json | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          name: string
          price?: number | null
          restaurant_id: string
          tags?: Json | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          name?: string
          price?: number | null
          restaurant_id?: string
          tags?: Json | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "order_items_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
        ]
      }
      order_line_item_selections: {
        Row: {
          additional_price: number | null
          combination_option_id: string
          created_at: string | null
          id: string
          line_item_id: string
          option_name: string
          quantity: number | null
        }
        Insert: {
          additional_price?: number | null
          combination_option_id: string
          created_at?: string | null
          id?: string
          line_item_id: string
          option_name: string
          quantity?: number | null
        }
        Update: {
          additional_price?: number | null
          combination_option_id?: string
          created_at?: string | null
          id?: string
          line_item_id?: string
          option_name?: string
          quantity?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "order_line_item_selections_combination_option_id_fkey"
            columns: ["combination_option_id"]
            isOneToOne: false
            referencedRelation: "order_combination_options"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_line_item_selections_line_item_id_fkey"
            columns: ["line_item_id"]
            isOneToOne: false
            referencedRelation: "order_line_items"
            referencedColumns: ["id"]
          },
        ]
      }
      order_line_items: {
        Row: {
          comanda_id: string | null
          created_at: string | null
          id: string
          item_name: string
          observations: string | null
          order_id: string
          order_item_id: string
          quantity: number | null
          unit_price: number | null
        }
        Insert: {
          comanda_id?: string | null
          created_at?: string | null
          id?: string
          item_name: string
          observations?: string | null
          order_id: string
          order_item_id: string
          quantity?: number | null
          unit_price?: number | null
        }
        Update: {
          comanda_id?: string | null
          created_at?: string | null
          id?: string
          item_name?: string
          observations?: string | null
          order_id?: string
          order_item_id?: string
          quantity?: number | null
          unit_price?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "order_line_items_comanda_id_fkey"
            columns: ["comanda_id"]
            isOneToOne: false
            referencedRelation: "comandas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_line_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_line_items_order_item_id_fkey"
            columns: ["order_item_id"]
            isOneToOne: false
            referencedRelation: "order_items"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          cancelled_at: string | null
          confirmed_at: string | null
          created_at: string | null
          customer_name: string | null
          delivered_at: string | null
          id: string
          observations: string | null
          order_number: number
          preparing_at: string | null
          ready_at: string | null
          restaurant_id: string
          status: string | null
          table_id: string | null
          table_number: string | null
          total_amount: number | null
          updated_at: string | null
        }
        Insert: {
          cancelled_at?: string | null
          confirmed_at?: string | null
          created_at?: string | null
          customer_name?: string | null
          delivered_at?: string | null
          id?: string
          observations?: string | null
          order_number?: number
          preparing_at?: string | null
          ready_at?: string | null
          restaurant_id: string
          status?: string | null
          table_id?: string | null
          table_number?: string | null
          total_amount?: number | null
          updated_at?: string | null
        }
        Update: {
          cancelled_at?: string | null
          confirmed_at?: string | null
          created_at?: string | null
          customer_name?: string | null
          delivered_at?: string | null
          id?: string
          observations?: string | null
          order_number?: number
          preparing_at?: string | null
          ready_at?: string | null
          restaurant_id?: string
          status?: string | null
          table_id?: string | null
          table_number?: string | null
          total_amount?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "orders_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_table_id_fkey"
            columns: ["table_id"]
            isOneToOne: false
            referencedRelation: "tables"
            referencedColumns: ["id"]
          },
        ]
      }
      pre_order_items: {
        Row: {
          created_at: string | null
          id: string
          observations: string | null
          pre_order_id: string
          product_id: string
          product_name: string
          quantity: number
          unit_price: number
        }
        Insert: {
          created_at?: string | null
          id?: string
          observations?: string | null
          pre_order_id: string
          product_id: string
          product_name: string
          quantity?: number
          unit_price: number
        }
        Update: {
          created_at?: string | null
          id?: string
          observations?: string | null
          pre_order_id?: string
          product_id?: string
          product_name?: string
          quantity?: number
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "pre_order_items_pre_order_id_fkey"
            columns: ["pre_order_id"]
            isOneToOne: false
            referencedRelation: "pre_orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pre_order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "menu_products"
            referencedColumns: ["id"]
          },
        ]
      }
      pre_orders: {
        Row: {
          admin_response: string | null
          cancelled_at: string | null
          confirmed_at: string | null
          created_at: string | null
          customer_name: string
          customer_phone: string
          delivered_at: string | null
          id: string
          observations: string | null
          order_number: number
          payment_method: string | null
          pickup_date: string
          pickup_time: string
          preparing_at: string | null
          ready_at: string | null
          restaurant_id: string
          status: string
          total_amount: number | null
          updated_at: string | null
        }
        Insert: {
          admin_response?: string | null
          cancelled_at?: string | null
          confirmed_at?: string | null
          created_at?: string | null
          customer_name: string
          customer_phone: string
          delivered_at?: string | null
          id?: string
          observations?: string | null
          order_number?: number
          payment_method?: string | null
          pickup_date: string
          pickup_time: string
          preparing_at?: string | null
          ready_at?: string | null
          restaurant_id: string
          status?: string
          total_amount?: number | null
          updated_at?: string | null
        }
        Update: {
          admin_response?: string | null
          cancelled_at?: string | null
          confirmed_at?: string | null
          created_at?: string | null
          customer_name?: string
          customer_phone?: string
          delivered_at?: string | null
          id?: string
          observations?: string | null
          order_number?: number
          payment_method?: string | null
          pickup_date?: string
          pickup_time?: string
          preparing_at?: string | null
          ready_at?: string | null
          restaurant_id?: string
          status?: string
          total_amount?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pre_orders_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string | null
          email: string
          full_name: string | null
          id: string
          is_active: boolean | null
          restaurant_id: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          full_name?: string | null
          id: string
          is_active?: boolean | null
          restaurant_id?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          full_name?: string | null
          id?: string
          is_active?: boolean | null
          restaurant_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
        ]
      }
      queue_entries: {
        Row: {
          called_at: string | null
          cancelled_at: string | null
          created_at: string | null
          customer_name: string
          estimated_wait_minutes: number | null
          id: string
          joined_at: string | null
          notes: string | null
          notifications_enabled: boolean | null
          party_size: number
          phone: string | null
          position: number | null
          queue_code: string
          restaurant_id: string | null
          seated_at: string | null
          status: string
          updated_at: string | null
        }
        Insert: {
          called_at?: string | null
          cancelled_at?: string | null
          created_at?: string | null
          customer_name: string
          estimated_wait_minutes?: number | null
          id?: string
          joined_at?: string | null
          notes?: string | null
          notifications_enabled?: boolean | null
          party_size?: number
          phone?: string | null
          position?: number | null
          queue_code: string
          restaurant_id?: string | null
          seated_at?: string | null
          status?: string
          updated_at?: string | null
        }
        Update: {
          called_at?: string | null
          cancelled_at?: string | null
          created_at?: string | null
          customer_name?: string
          estimated_wait_minutes?: number | null
          id?: string
          joined_at?: string | null
          notes?: string | null
          notifications_enabled?: boolean | null
          party_size?: number
          phone?: string | null
          position?: number | null
          queue_code?: string
          restaurant_id?: string | null
          seated_at?: string | null
          status?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "queue_entries_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
        ]
      }
      referral_codes: {
        Row: {
          code: string
          created_at: string
          customer_id: string
          id: string
          referral_link: string | null
          restaurant_id: string
          updated_at: string
          usage_count: number
        }
        Insert: {
          code: string
          created_at?: string
          customer_id: string
          id?: string
          referral_link?: string | null
          restaurant_id: string
          updated_at?: string
          usage_count?: number
        }
        Update: {
          code?: string
          created_at?: string
          customer_id?: string
          id?: string
          referral_link?: string | null
          restaurant_id?: string
          updated_at?: string
          usage_count?: number
        }
        Relationships: [
          {
            foreignKeyName: "referral_codes_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "referral_codes_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
        ]
      }
      referral_programs: {
        Row: {
          created_at: string
          id: string
          is_active: boolean
          referred_discount_type: string
          referred_discount_value: number
          referrer_reward_type: string
          referrer_reward_value: number
          restaurant_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean
          referred_discount_type?: string
          referred_discount_value?: number
          referrer_reward_type?: string
          referrer_reward_value?: number
          restaurant_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean
          referred_discount_type?: string
          referred_discount_value?: number
          referrer_reward_type?: string
          referrer_reward_value?: number
          restaurant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "referral_programs_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: true
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
        ]
      }
      referral_referrals: {
        Row: {
          converted_at: string | null
          created_at: string
          id: string
          referred_comanda_id: string | null
          referred_customer_id: string | null
          referred_customer_phone: string | null
          referred_order_id: string | null
          referred_pre_order_id: string | null
          referrer_code_id: string
          restaurant_id: string
          reward_applied: boolean
          status: string
          updated_at: string
        }
        Insert: {
          converted_at?: string | null
          created_at?: string
          id?: string
          referred_comanda_id?: string | null
          referred_customer_id?: string | null
          referred_customer_phone?: string | null
          referred_order_id?: string | null
          referred_pre_order_id?: string | null
          referrer_code_id: string
          restaurant_id: string
          reward_applied?: boolean
          status?: string
          updated_at?: string
        }
        Update: {
          converted_at?: string | null
          created_at?: string
          id?: string
          referred_comanda_id?: string | null
          referred_customer_id?: string | null
          referred_customer_phone?: string | null
          referred_order_id?: string | null
          referred_pre_order_id?: string | null
          referrer_code_id?: string
          restaurant_id?: string
          reward_applied?: boolean
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "referral_referrals_referred_customer_id_fkey"
            columns: ["referred_customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "referral_referrals_referrer_code_id_fkey"
            columns: ["referrer_code_id"]
            isOneToOne: false
            referencedRelation: "referral_codes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "referral_referrals_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
        ]
      }
      reservations: {
        Row: {
          admin_notes: string | null
          cancelled_at: string | null
          completed_at: string | null
          confirmed_at: string | null
          created_at: string | null
          customer_name: string
          id: string
          notes: string | null
          party_size: number
          phone: string
          reservation_code: string
          reservation_date: string
          reservation_time: string
          restaurant_id: string | null
          status: string
          updated_at: string | null
        }
        Insert: {
          admin_notes?: string | null
          cancelled_at?: string | null
          completed_at?: string | null
          confirmed_at?: string | null
          created_at?: string | null
          customer_name: string
          id?: string
          notes?: string | null
          party_size?: number
          phone: string
          reservation_code: string
          reservation_date: string
          reservation_time: string
          restaurant_id?: string | null
          status?: string
          updated_at?: string | null
        }
        Update: {
          admin_notes?: string | null
          cancelled_at?: string | null
          completed_at?: string | null
          confirmed_at?: string | null
          created_at?: string | null
          customer_name?: string
          id?: string
          notes?: string | null
          party_size?: number
          phone?: string
          reservation_code?: string
          reservation_date?: string
          reservation_time?: string
          restaurant_id?: string | null
          status?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "reservations_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
        ]
      }
      restaurant_modules: {
        Row: {
          created_at: string | null
          id: string
          is_active: boolean | null
          module_name: string
          restaurant_id: string
          settings: Json | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          module_name: string
          restaurant_id: string
          settings?: Json | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          module_name?: string
          restaurant_id?: string
          settings?: Json | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "restaurant_modules_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
        ]
      }
      restaurants: {
        Row: {
          address: string | null
          business_hours: Json | null
          closing_time: string | null
          cover_image_url: string | null
          created_at: string | null
          custom_domain: string | null
          email: string | null
          features: Json | null
          google_maps_url: string | null
          id: string
          identification_type: string | null
          is_active: boolean | null
          location_coordinates: Json | null
          logo_url: string | null
          max_users: number | null
          name: string
          notification_settings: Json | null
          opening_time: string | null
          owner_id: string | null
          phone: string | null
          plan: string | null
          slug: string
          social_links: Json | null
          status: string | null
          subtitle: string | null
          theme_colors: Json | null
          theme_settings: Json | null
          timezone: string | null
          updated_at: string | null
          wifi_info: Json | null
        }
        Insert: {
          address?: string | null
          business_hours?: Json | null
          closing_time?: string | null
          cover_image_url?: string | null
          created_at?: string | null
          custom_domain?: string | null
          email?: string | null
          features?: Json | null
          google_maps_url?: string | null
          id?: string
          identification_type?: string | null
          is_active?: boolean | null
          location_coordinates?: Json | null
          logo_url?: string | null
          max_users?: number | null
          name: string
          notification_settings?: Json | null
          opening_time?: string | null
          owner_id?: string | null
          phone?: string | null
          plan?: string | null
          slug: string
          social_links?: Json | null
          status?: string | null
          subtitle?: string | null
          theme_colors?: Json | null
          theme_settings?: Json | null
          timezone?: string | null
          updated_at?: string | null
          wifi_info?: Json | null
        }
        Update: {
          address?: string | null
          business_hours?: Json | null
          closing_time?: string | null
          cover_image_url?: string | null
          created_at?: string | null
          custom_domain?: string | null
          email?: string | null
          features?: Json | null
          google_maps_url?: string | null
          id?: string
          identification_type?: string | null
          is_active?: boolean | null
          location_coordinates?: Json | null
          logo_url?: string | null
          max_users?: number | null
          name?: string
          notification_settings?: Json | null
          opening_time?: string | null
          owner_id?: string | null
          phone?: string | null
          plan?: string | null
          slug?: string
          social_links?: Json | null
          status?: string | null
          subtitle?: string | null
          theme_colors?: Json | null
          theme_settings?: Json | null
          timezone?: string | null
          updated_at?: string | null
          wifi_info?: Json | null
        }
        Relationships: []
      }
      service_calls: {
        Row: {
          acknowledged_at: string | null
          call_type: string
          called_at: string | null
          completed_at: string | null
          created_at: string | null
          id: string
          response_time_seconds: number | null
          restaurant_id: string | null
          status: string | null
          table_id: string
          table_session_id: string | null
          updated_at: string | null
          waiter_id: string | null
        }
        Insert: {
          acknowledged_at?: string | null
          call_type: string
          called_at?: string | null
          completed_at?: string | null
          created_at?: string | null
          id?: string
          response_time_seconds?: number | null
          restaurant_id?: string | null
          status?: string | null
          table_id: string
          table_session_id?: string | null
          updated_at?: string | null
          waiter_id?: string | null
        }
        Update: {
          acknowledged_at?: string | null
          call_type?: string
          called_at?: string | null
          completed_at?: string | null
          created_at?: string | null
          id?: string
          response_time_seconds?: number | null
          restaurant_id?: string | null
          status?: string | null
          table_id?: string
          table_session_id?: string | null
          updated_at?: string | null
          waiter_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "service_calls_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_calls_table_id_fkey"
            columns: ["table_id"]
            isOneToOne: false
            referencedRelation: "tables"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_calls_table_session_id_fkey"
            columns: ["table_session_id"]
            isOneToOne: false
            referencedRelation: "table_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_calls_waiter_id_fkey"
            columns: ["waiter_id"]
            isOneToOne: false
            referencedRelation: "waiters"
            referencedColumns: ["id"]
          },
        ]
      }
      table_sessions: {
        Row: {
          bill_requested_at: string | null
          closed_at: string | null
          created_at: string | null
          customer_count: number | null
          id: string
          notes: string | null
          opened_at: string | null
          restaurant_id: string | null
          session_token: string | null
          status: string | null
          table_id: string
          updated_at: string | null
          waiter_id: string | null
        }
        Insert: {
          bill_requested_at?: string | null
          closed_at?: string | null
          created_at?: string | null
          customer_count?: number | null
          id?: string
          notes?: string | null
          opened_at?: string | null
          restaurant_id?: string | null
          session_token?: string | null
          status?: string | null
          table_id: string
          updated_at?: string | null
          waiter_id?: string | null
        }
        Update: {
          bill_requested_at?: string | null
          closed_at?: string | null
          created_at?: string | null
          customer_count?: number | null
          id?: string
          notes?: string | null
          opened_at?: string | null
          restaurant_id?: string | null
          session_token?: string | null
          status?: string | null
          table_id?: string
          updated_at?: string | null
          waiter_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "table_sessions_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "table_sessions_table_id_fkey"
            columns: ["table_id"]
            isOneToOne: false
            referencedRelation: "tables"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "table_sessions_waiter_id_fkey"
            columns: ["waiter_id"]
            isOneToOne: false
            referencedRelation: "waiters"
            referencedColumns: ["id"]
          },
        ]
      }
      tables: {
        Row: {
          area: string
          capacity: number | null
          created_at: string | null
          id: string
          is_active: boolean | null
          name: string | null
          number: number
          position_x: number
          position_y: number
          restaurant_id: string | null
          shape: string
          status: string | null
          updated_at: string | null
        }
        Insert: {
          area?: string
          capacity?: number | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          name?: string | null
          number: number
          position_x?: number
          position_y?: number
          restaurant_id?: string | null
          shape?: string
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          area?: string
          capacity?: number | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          name?: string | null
          number?: number
          position_x?: number
          position_y?: number
          restaurant_id?: string | null
          shape?: string
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tables_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
        ]
      }
      tenant_user_modules: {
        Row: {
          created_at: string
          id: string
          module_name: string
          restaurant_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          module_name: string
          restaurant_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          module_name?: string
          restaurant_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tenant_user_modules_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
        ]
      }
      tenant_user_roles: {
        Row: {
          created_at: string | null
          id: string
          restaurant_id: string
          role: Database["public"]["Enums"]["tenant_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          restaurant_id: string
          role: Database["public"]["Enums"]["tenant_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          restaurant_id?: string
          role?: Database["public"]["Enums"]["tenant_role"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tenant_user_roles_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
        ]
      }
      time_clock_entries: {
        Row: {
          break_minutes: number
          clock_in: string
          clock_out: string | null
          created_at: string
          employee_id: string
          id: string
          notes: string | null
          restaurant_id: string
          shift_id: string | null
          source: string
          updated_at: string
        }
        Insert: {
          break_minutes?: number
          clock_in?: string
          clock_out?: string | null
          created_at?: string
          employee_id: string
          id?: string
          notes?: string | null
          restaurant_id: string
          shift_id?: string | null
          source?: string
          updated_at?: string
        }
        Update: {
          break_minutes?: number
          clock_in?: string
          clock_out?: string | null
          created_at?: string
          employee_id?: string
          id?: string
          notes?: string | null
          restaurant_id?: string
          shift_id?: string | null
          source?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "time_clock_entries_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "time_clock_entries_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "time_clock_entries_shift_id_fkey"
            columns: ["shift_id"]
            isOneToOne: false
            referencedRelation: "employee_shifts"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      waiters: {
        Row: {
          created_at: string | null
          employee_id: string | null
          id: string
          is_active: boolean | null
          is_available: boolean | null
          name: string
          restaurant_id: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          employee_id?: string | null
          id?: string
          is_active?: boolean | null
          is_available?: boolean | null
          name: string
          restaurant_id?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          employee_id?: string | null
          id?: string
          is_active?: boolean | null
          is_available?: boolean | null
          name?: string
          restaurant_id?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "waiters_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "waiters_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "waiters_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      whatsapp_contacts: {
        Row: {
          created_at: string
          id: string
          instance_id: string
          last_message: string | null
          last_seen: string | null
          name: string | null
          phone: string
          photo_url: string | null
          restaurant_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          instance_id: string
          last_message?: string | null
          last_seen?: string | null
          name?: string | null
          phone: string
          photo_url?: string | null
          restaurant_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          instance_id?: string
          last_message?: string | null
          last_seen?: string | null
          name?: string | null
          phone?: string
          photo_url?: string | null
          restaurant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "whatsapp_contacts_instance_id_fkey"
            columns: ["instance_id"]
            isOneToOne: false
            referencedRelation: "whatsapp_instances"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "whatsapp_contacts_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
        ]
      }
      whatsapp_conversations: {
        Row: {
          assigned_to: string | null
          contact_id: string
          created_at: string
          id: string
          instance_id: string
          last_message_at: string | null
          mode: string
          restaurant_id: string
          status: string
          unread_count: number
          updated_at: string
        }
        Insert: {
          assigned_to?: string | null
          contact_id: string
          created_at?: string
          id?: string
          instance_id: string
          last_message_at?: string | null
          mode?: string
          restaurant_id: string
          status?: string
          unread_count?: number
          updated_at?: string
        }
        Update: {
          assigned_to?: string | null
          contact_id?: string
          created_at?: string
          id?: string
          instance_id?: string
          last_message_at?: string | null
          mode?: string
          restaurant_id?: string
          status?: string
          unread_count?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "whatsapp_conversations_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "whatsapp_contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "whatsapp_conversations_instance_id_fkey"
            columns: ["instance_id"]
            isOneToOne: false
            referencedRelation: "whatsapp_instances"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "whatsapp_conversations_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
        ]
      }
      whatsapp_instances: {
        Row: {
          connected_at: string | null
          created_at: string
          id: string
          instance_name: string
          last_error: string | null
          name: string
          phone: string | null
          qr_code: string | null
          restaurant_id: string
          status: string
          updated_at: string
        }
        Insert: {
          connected_at?: string | null
          created_at?: string
          id?: string
          instance_name: string
          last_error?: string | null
          name: string
          phone?: string | null
          qr_code?: string | null
          restaurant_id: string
          status?: string
          updated_at?: string
        }
        Update: {
          connected_at?: string | null
          created_at?: string
          id?: string
          instance_name?: string
          last_error?: string | null
          name?: string
          phone?: string | null
          qr_code?: string | null
          restaurant_id?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "whatsapp_instances_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
        ]
      }
      whatsapp_logs: {
        Row: {
          action: string
          created_at: string
          duration_ms: number | null
          error: string | null
          id: string
          instance_id: string | null
          kind: string
          request: Json | null
          response: Json | null
          restaurant_id: string | null
          status_code: number | null
        }
        Insert: {
          action: string
          created_at?: string
          duration_ms?: number | null
          error?: string | null
          id?: string
          instance_id?: string | null
          kind: string
          request?: Json | null
          response?: Json | null
          restaurant_id?: string | null
          status_code?: number | null
        }
        Update: {
          action?: string
          created_at?: string
          duration_ms?: number | null
          error?: string | null
          id?: string
          instance_id?: string | null
          kind?: string
          request?: Json | null
          response?: Json | null
          restaurant_id?: string | null
          status_code?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "whatsapp_logs_instance_id_fkey"
            columns: ["instance_id"]
            isOneToOne: false
            referencedRelation: "whatsapp_instances"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "whatsapp_logs_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
        ]
      }
      whatsapp_messages: {
        Row: {
          conversation_id: string | null
          created_at: string
          direction: string
          external_id: string | null
          id: string
          instance_id: string
          media_url: string | null
          message: string | null
          phone: string
          response_ms: number | null
          restaurant_id: string
          source: string
          status: string
          tokens_completion: number
          tokens_prompt: number
          type: string
        }
        Insert: {
          conversation_id?: string | null
          created_at?: string
          direction: string
          external_id?: string | null
          id?: string
          instance_id: string
          media_url?: string | null
          message?: string | null
          phone: string
          response_ms?: number | null
          restaurant_id: string
          source?: string
          status?: string
          tokens_completion?: number
          tokens_prompt?: number
          type?: string
        }
        Update: {
          conversation_id?: string | null
          created_at?: string
          direction?: string
          external_id?: string | null
          id?: string
          instance_id?: string
          media_url?: string | null
          message?: string | null
          phone?: string
          response_ms?: number | null
          restaurant_id?: string
          source?: string
          status?: string
          tokens_completion?: number
          tokens_prompt?: number
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "whatsapp_messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "whatsapp_conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "whatsapp_messages_instance_id_fkey"
            columns: ["instance_id"]
            isOneToOne: false
            referencedRelation: "whatsapp_instances"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "whatsapp_messages_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      generate_comanda_code: {
        Args: { _restaurant_id: string; _table_id: string }
        Returns: {
          code: string
          sequence: number
        }[]
      }
      get_user_restaurant_id: { Args: never; Returns: string }
      has_module_access: {
        Args: { _module_name: string; _restaurant_id: string }
        Returns: boolean
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      has_tenant_access: { Args: { _restaurant_id: string }; Returns: boolean }
      has_tenant_admin: { Args: { _restaurant_id: string }; Returns: boolean }
      has_tenant_role: {
        Args: {
          _restaurant_id: string
          _role: Database["public"]["Enums"]["tenant_role"]
        }
        Returns: boolean
      }
      search_pre_orders_by_phone: {
        Args: { search_phone: string }
        Returns: {
          admin_response: string
          created_at: string
          customer_name: string
          customer_phone: string
          id: string
          observations: string
          order_number: number
          payment_method: string
          pickup_date: string
          pickup_time: string
          status: string
          total_amount: number
        }[]
      }
      search_reservations_by_phone: {
        Args: { search_phone: string }
        Returns: {
          created_at: string
          customer_name: string
          id: string
          notes: string
          party_size: number
          phone: string
          reservation_code: string
          reservation_date: string
          reservation_time: string
          status: string
        }[]
      }
      verify_admin_access: { Args: never; Returns: boolean }
    }
    Enums: {
      app_role: "admin" | "manager" | "staff"
      tenant_role:
        | "owner"
        | "admin"
        | "manager"
        | "staff"
        | "kitchen"
        | "waiter"
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
      app_role: ["admin", "manager", "staff"],
      tenant_role: ["owner", "admin", "manager", "staff", "kitchen", "waiter"],
    },
  },
} as const
