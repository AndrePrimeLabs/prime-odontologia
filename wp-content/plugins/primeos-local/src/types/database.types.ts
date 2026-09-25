// Database Types for PrimeOS & OmniOS
// Auto-generated TypeScript types for Supabase entities & 9 BMC Microservices

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      customers: {
        Row: {
          id: string
          name: string
          email: string | null
          phone: string | null
          address: string | null
          city: string | null
          state: string | null
          zip_code: string | null
          country: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          email?: string | null
          phone?: string | null
          address?: string | null
          city?: string | null
          state?: string | null
          zip_code?: string | null
          country?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          email?: string | null
          phone?: string | null
          address?: string | null
          city?: string | null
          state?: string | null
          zip_code?: string | null
          country?: string | null
          created_at?: string
          updated_at?: string
        }
      }

      patients: {
        Row: {
          id: string;
          tenant_id: string;
          name: string;
          cpf: string | null;
          email: string | null;
          phone: string | null;
          birth_date: string | null;
          gender: string | null;
          address: Json;
          status: "active" | "inactive" | "archived" | "in_treatment";
          medical_history: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          tenant_id: string;
          name: string;
          cpf?: string | null;
          email?: string | null;
          phone?: string | null;
          birth_date?: string | null;
          gender?: string | null;
          address?: Json;
          status?: "active" | "inactive" | "archived" | "in_treatment";
          medical_history?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          name?: string;
          cpf?: string | null;
          email?: string | null;
          phone?: string | null;
          birth_date?: string | null;
          gender?: string | null;
          address?: Json;
          status?: "active" | "inactive" | "archived" | "in_treatment";
          medical_history?: Json;
          created_at?: string;
          updated_at?: string;
        };
      };

      patient_records: {
        Row: {
          id: string
          patient_id: string | null
          medical_history: Json | null
          allergies: Json | null
          medications: Json | null
          prescriptions: Json | null
          family_history: Json | null
          x_rays: Json | null
          documents: Json | null
          checkup_schedule: Json | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          patient_id?: string | null
          medical_history?: Json | null
          allergies?: Json | null
          medications?: Json | null
          prescriptions?: Json | null
          family_history?: Json | null
          x_rays?: Json | null
          documents?: Json | null
          checkup_schedule?: Json | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          patient_id?: string | null
          medical_history?: Json | null
          allergies?: Json | null
          medications?: Json | null
          prescriptions?: Json | null
          family_history?: Json | null
          x_rays?: Json | null
          documents?: Json | null
          checkup_schedule?: Json | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }

      appointments: {
        Row: {
          id: string;
          tenant_id: string;
          patient_id: string | null;
          dentist_id: string | null;
          start_time: string;
          end_time: string;
          procedure: string | null;
          status: "scheduled" | "confirmed" | "completed" | "cancelled" | "no_show";
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          tenant_id: string;
          patient_id?: string | null;
          dentist_id?: string | null;
          start_time: string;
          end_time: string;
          procedure?: string | null;
          status?: "scheduled" | "confirmed" | "completed" | "cancelled" | "no_show";
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          patient_id?: string | null;
          dentist_id?: string | null;
          start_time?: string;
          end_time?: string;
          procedure?: string | null;
          status?: "scheduled" | "confirmed" | "completed" | "cancelled" | "no_show";
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };

      products: {
        Row: {
          id: string
          name: string
          description: string | null
          price: number | null
          category: string | null
          sku: string | null
          stock_quantity: number
          image_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          price?: number | null
          category?: string | null
          sku?: string | null
          stock_quantity?: number
          image_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          price?: number | null
          category?: string | null
          sku?: string | null
          stock_quantity?: number
          image_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }

      sales: {
        Row: {
          id: string
          customer_id: string | null
          product_id: string | null
          quantity: number
          unit_price: number | null
          total_amount: number | null
          sale_date: string
          payment_method: string | null
          status: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          customer_id?: string | null
          product_id?: string | null
          quantity: number
          unit_price?: number | null
          total_amount?: number | null
          sale_date?: string
          payment_method?: string | null
          status?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          customer_id?: string | null
          product_id?: string | null
          quantity?: number
          unit_price?: number | null
          total_amount?: number | null
          sale_date?: string
          payment_method?: string | null
          status?: string
          created_at?: string
          updated_at?: string
        }
      }

      leads: {
        Row: {
          id: string;
          tenant_id: string;
          name: string;
          email: string | null;
          phone: string | null;
          source: string | null;
          stage: "new" | "contacted" | "qualified" | "scheduled" | "closed_won" | "closed_lost";
          treatment_interest: string | null;
          estimated_value: number;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          tenant_id: string;
          name: string;
          email?: string | null;
          phone?: string | null;
          source?: string | null;
          stage?: "new" | "contacted" | "qualified" | "scheduled" | "closed_won" | "closed_lost";
          treatment_interest?: string | null;
          estimated_value?: number;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          name?: string;
          email?: string | null;
          phone?: string | null;
          source?: string | null;
          stage?: "new" | "contacted" | "qualified" | "scheduled" | "closed_won" | "closed_lost";
          treatment_interest?: string | null;
          estimated_value?: number;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };

      tasks: {
        Row: {
          id: string
          title: string
          description: string | null
          assigned_to: string | null
          due_date: string | null
          priority: string
          status: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          assigned_to?: string | null
          due_date?: string | null
          priority?: string
          status?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          assigned_to?: string | null
          due_date?: string | null
          priority?: string
          status?: string
          created_at?: string
          updated_at?: string
        }
      }

      documents: {
        Row: {
          id: string
          patient_id: string | null
          document_type: string | null
          document_url: string
          description: string | null
          created_date: string
          updated_at: string
        }
        Insert: {
          id?: string
          patient_id?: string | null
          document_type?: string | null
          document_url: string
          description?: string | null
          created_date?: string
          updated_at?: string
        }
        Update: {
          id?: string
          patient_id?: string | null
          document_type?: string | null
          document_url?: string
          description?: string | null
          created_date?: string
          updated_at?: string
        }
      }

      activities: {
        Row: {
          id: string
          user_id: string | null
          activity_type: string | null
          description: string | null
          entity_id: string | null
          entity_type: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          activity_type?: string | null
          description?: string | null
          entity_id?: string | null
          entity_type?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          activity_type?: string | null
          description?: string | null
          entity_id?: string | null
          entity_type?: string | null
          created_at?: string
        }
      }

      expenses: {
        Row: {
          id: string
          category: string | null
          amount: number | null
          description: string | null
          date: string
          payment_method: string | null
          status: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          category?: string | null
          amount?: number | null
          description?: string | null
          date?: string
          payment_method?: string | null
          status?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          category?: string | null
          amount?: number | null
          description?: string | null
          date?: string
          payment_method?: string | null
          status?: string
          created_at?: string
          updated_at?: string
        }
      }

      user_engagement: {
        Row: {
          id: string
          user_id: string | null
          event_type: string | null
          page: string | null
          duration_seconds: number | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          event_type?: string | null
          page?: string | null
          duration_seconds?: number | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          event_type?: string | null
          page?: string | null
          duration_seconds?: number | null
          created_at?: string
        }
      }

      pop: {
        Row: {
          id: string
          name: string
          description: string | null
          config: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          config?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          config?: Json | null
          created_at?: string
          updated_at?: string
        }
      }

      tenants: {
        Row: {
          id: string;
          name: string;
          segment: string;
          settings: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          segment?: string;
          settings?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          segment?: string;
          settings?: Json;
          created_at?: string;
          updated_at?: string;
        };
      };

      tenant_users: {
        Row: {
          tenant_id: string;
          user_id: string;
          role: "owner" | "admin" | "member";
          created_at: string;
        };
        Insert: {
          tenant_id: string;
          user_id: string;
          role?: "owner" | "admin" | "member";
          created_at?: string;
        };
        Update: {
          tenant_id?: string;
          user_id?: string;
          role?: "owner" | "admin" | "member";
          created_at?: string;
        };
      };

      canvases: {
        Row: {
          id: string;
          tenant_id: string;
          name: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          tenant_id: string;
          name?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          name?: string;
          created_at?: string;
          updated_at?: string;
        };
      };

      canvas_block_items: {
        Row: {
          id: string;
          canvas_id: string;
          tenant_id: string;
          block_type:
            | "key_partners"
            | "key_activities"
            | "key_resources"
            | "value_propositions"
            | "customer_relationships"
            | "channels"
            | "customer_segments"
            | "cost_structure"
            | "revenue_streams";
          content: string;
          metadata: Json;
          position: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          canvas_id: string;
          tenant_id: string;
          block_type:
            | "key_partners"
            | "key_activities"
            | "key_resources"
            | "value_propositions"
            | "customer_relationships"
            | "channels"
            | "customer_segments"
            | "cost_structure"
            | "revenue_streams";
          content: string;
          metadata?: Json;
          position?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          canvas_id?: string;
          tenant_id?: string;
          block_type?:
            | "key_partners"
            | "key_activities"
            | "key_resources"
            | "value_propositions"
            | "customer_relationships"
            | "channels"
            | "customer_segments"
            | "cost_structure"
            | "revenue_streams";
          content?: string;
          metadata?: Json;
          position?: number;
          created_at?: string;
          updated_at?: string;
        };
      };

      financial_transactions: {
        Row: {
          id: string;
          tenant_id: string;
          patient_id: string | null;
          type: "revenue" | "expense";
          category: string;
          amount: number;
          due_date: string;
          payment_date: string | null;
          status: "pending" | "paid" | "overdue" | "cancelled";
          payment_method: string | null;
          description: string | null;
          metadata: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          tenant_id: string;
          patient_id?: string | null;
          type: "revenue" | "expense";
          category: string;
          amount: number;
          due_date: string;
          payment_date?: string | null;
          status?: "pending" | "paid" | "overdue" | "cancelled";
          payment_method?: string | null;
          description?: string | null;
          metadata?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          patient_id?: string | null;
          type?: "revenue" | "expense";
          category?: string;
          amount?: number;
          due_date?: string;
          payment_date?: string | null;
          status?: "pending" | "paid" | "overdue" | "cancelled";
          payment_method?: string | null;
          description?: string | null;
          metadata?: Json;
          created_at?: string;
          updated_at?: string;
        };
      };

      operational_tasks: {
        Row: {
          id: string;
          tenant_id: string;
          title: string;
          description: string | null;
          assigned_to: string | null;
          priority: "low" | "medium" | "high" | "urgent";
          status: "todo" | "in_progress" | "completed" | "blocked";
          due_date: string | null;
          sop_reference: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          tenant_id: string;
          title: string;
          description?: string | null;
          assigned_to?: string | null;
          priority?: "low" | "medium" | "high" | "urgent";
          status?: "todo" | "in_progress" | "completed" | "blocked";
          due_date?: string | null;
          sop_reference?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          title?: string;
          description?: string | null;
          assigned_to?: string | null;
          priority?: "low" | "medium" | "high" | "urgent";
          status?: "todo" | "in_progress" | "completed" | "blocked";
          due_date?: string | null;
          sop_reference?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
    Views: {};
    Functions: {};
    Enums: {};
  };
}
