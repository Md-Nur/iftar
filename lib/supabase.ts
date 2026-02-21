import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_PROJECT_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_PUBLISH_KEY!
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

// Client for public operations (respects RLS)
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Client for admin operations (bypasses RLS - only use on server)
export const createAdminClient = () => {
    if (!supabaseServiceRoleKey) {
        console.warn("SUPABASE_SERVICE_ROLE_KEY is not set. Admin operations might fail if RLS is enforced.")
    }
    return createClient(supabaseUrl, supabaseServiceRoleKey || supabaseAnonKey)
}
