import { createClient } from '@supabase/supabase-js';

const supabaseUrl = VITE_SUPABASE_URL=https://bcuenxddnuswvnubccaf.supabase.co
const supabaseAnonKey = VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJjdWVueGRkbnVzd3ZudWJjY2FmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI3NDY3NzcsImV4cCI6MjA5ODMyMjc3N30.YUIB2R5iFoxhnNVU8Mt2-LH3dLDG_yFbArYWERfS2fU

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
