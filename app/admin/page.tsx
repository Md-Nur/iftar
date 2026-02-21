import { createAdminClient } from '@/lib/supabase'
import AdminLocationsTable from './AdminLocationsTable'
import { logout } from '@/app/actions/auth'

export const dynamic = 'force-dynamic' // Ensure page is rendered dynamically to stay fresh

export default async function AdminDashboard() {
    const supabase = createAdminClient()

    // Fetch all locations for today, sorted by newest first
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const { data: locations, error } = await supabase
        .from('locations')
        .select('*')
        .gte('created_at', today.toISOString())
        .order('created_at', { ascending: false })

    if (error) {
        // Error is handled by rendering empty or null
    }

    return (
        <div className="min-h-screen bg-base-300">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold text-primary">অ্যাডমিন ড্যাশবোর্ড</h1>
                        <p className="text-sm sm:text-base text-neutral-content mt-1">সব ইফতার লোকেশন পরিচালনা করুন</p>
                    </div>
                    <form action={logout} className="w-full sm:w-auto">
                        <button
                            type="submit"
                            className="btn btn-outline btn-error w-full sm:w-auto"
                        >
                            লগআউট
                        </button>
                    </form>
                </div>

                <AdminLocationsTable initialLocations={locations || []} />
            </div>
        </div>
    )
}
