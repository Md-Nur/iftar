import { createAdminClient } from '@/lib/supabase'
import AdminLocationsTable from './AdminLocationsTable'
import { logout } from '@/app/actions/auth'

export const dynamic = 'force-dynamic' // Ensure page is rendered dynamically to stay fresh

export default async function AdminDashboard() {
    const supabase = createAdminClient()

    // Fetch all locations, sorted by newest first
    const { data: locations, error } = await supabase
        .from('locations')
        .select('*')
        .order('created_at', { ascending: false })

    if (error) {
        console.error('Error fetching locations:', error)
    }

    return (
        <div className="min-h-screen bg-base-300">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-primary">অ্যাডমিন ড্যাশবোর্ড</h1>
                        <p className="text-neutral-content mt-1">সব ইফতার লোকেশন পরিচালনা করুন</p>
                    </div>
                    <form action={logout}>
                        <button
                            type="submit"
                            className="btn btn-outline btn-error"
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
