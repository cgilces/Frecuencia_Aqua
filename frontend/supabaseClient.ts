
import { createClient } from '@supabase/supabase-js';

// Credenciales del proyecto 'grupoaqua'
const supabaseUrl = 'https://qmaihngpqttcsyfontpo.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFtYWlobmdwcXR0Y3N5Zm9udHBvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM0Nzk2NTMsImV4cCI6MjA3OTA1NTY1M30.w4ONxt_WyfjnWeLkZ6LAX6s8eaYfk7k1tuaEVeKQzJs';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
