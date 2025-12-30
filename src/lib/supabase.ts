import { createClient } from '@supabase/supabase-js'
import { Database } from '../types/database.types'

// В CRA (Create React App) используйте process.env вместо import.meta.env
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || ''
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY || ''

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables')
  console.log('Supabase URL:', supabaseUrl ? 'SET' : 'MISSING')
  console.log('Supabase Key:', supabaseAnonKey ? 'SET' : 'MISSING')
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
})