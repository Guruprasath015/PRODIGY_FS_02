export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          username: string;
          email: string;
          role: string;
          created_at: string;
        };
        Insert: {
          id: string;
          username: string;
          email: string;
          role?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          username?: string;
          email?: string;
          role?: string;
          created_at?: string;
        };
      };
      employees: {
        Row: {
          id: string;
          employee_id: string;
          full_name: string;
          email: string;
          phone: string;
          department: string;
          designation: string;
          salary: number;
          joining_date: string;
          address: string;
          profile_image: string;
          status: string;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          employee_id?: string;
          full_name: string;
          email: string;
          phone: string;
          department: string;
          designation: string;
          salary: number;
          joining_date: string;
          address?: string;
          profile_image?: string;
          status?: string;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          employee_id?: string;
          full_name?: string;
          email?: string;
          phone?: string;
          department?: string;
          designation?: string;
          salary?: number;
          joining_date?: string;
          address?: string;
          profile_image?: string;
          status?: string;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
}

export type Employee = Database['public']['Tables']['employees']['Row'];
export type EmployeeInsert = Database['public']['Tables']['employees']['Insert'];
export type EmployeeUpdate = Database['public']['Tables']['employees']['Update'];
export type Profile = Database['public']['Tables']['profiles']['Row'];
