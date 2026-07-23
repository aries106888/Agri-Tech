import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://hwhebeixeflsdshmgowc.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh3aGViZWl4ZWZsc2RzaG1nb3djIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM3OTA1MzUsImV4cCI6MjA5OTM2NjUzNX0.xUYqGvtKjdgaaJzregi6dbnZav8w3zoYTTCbjPsC5v8'

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    '[Agri-Tech] VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY is missing. ' +
    'Set these in your .env file or Vercel environment variables.'
  )
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// ── Supabase Helper Functions ──

/**
 * Fetch products from Supabase database
 */
export async function getProductsFromSupabase() {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error
    return { data, error: null }
  } catch (error) {
    console.error('Supabase getProducts error:', error)
    return { data: null, error }
  }
}

/**
 * Upload product image to Supabase Storage bucket 'products'
 */
export async function uploadProductImage(file, fileName) {
  try {
    const path = `product_images/${Date.now()}_${fileName}`
    const { data, error } = await supabase.storage
      .from('products')
      .upload(path, file, { upsert: true })

    if (error) throw error

    const { data: publicUrlData } = supabase.storage
      .from('products')
      .getPublicUrl(data.path)

    return { url: publicUrlData.publicUrl, error: null }
  } catch (error) {
    console.error('Supabase uploadProductImage error:', error)
    return { url: null, error }
  }
}

/**
 * Sign up user via Supabase Auth
 */
export async function supabaseSignUp({ email, password, name, phone, role }) {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
          phone,
          role: role?.toLowerCase() || 'buyer'
        }
      }
    })
    if (error) throw error
    return { data, error: null }
  } catch (error) {
    return { data: null, error }
  }
}

/**
 * Sign in user via Supabase Auth
 */
export async function supabaseSignIn({ email, password }) {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })
    if (error) throw error
    return { data, error: null }
  } catch (error) {
    return { data: null, error }
  }
}

export default supabase
