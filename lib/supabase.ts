import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('⚠️ Supabase credentials missing!');
    console.error('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl);
    console.error('NEXT_PUBLIC_SUPABASE_ANON_KEY:', supabaseAnonKey ? '(set)' : '(missing)');
}

if (!supabaseUrl || supabaseUrl.includes('seu-projeto')) {
    throw new Error('Configure NEXT_PUBLIC_SUPABASE_URL no arquivo .env.local');
}

if (!supabaseAnonKey || supabaseAnonKey.includes('sua-anon-key')) {
    throw new Error('Configure NEXT_PUBLIC_SUPABASE_ANON_KEY no arquivo .env.local');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default supabase;
