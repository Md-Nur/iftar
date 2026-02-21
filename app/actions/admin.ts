'use server'

import { createAdminClient } from '@/lib/supabase'
import { revalidatePath } from 'next/cache'

export async function deleteLocation(id: string) {
    const supabase = createAdminClient()

    const { error } = await supabase
        .from('locations')
        .delete()
        .eq('id', id)

    if (error) {
        console.error('Error deleting location:', error)
        return { error: error.message }
    }

    revalidatePath('/admin')
    revalidatePath('/')
    return { success: true }
}

export async function updateLocation(id: string, data: any) {
    const supabase = createAdminClient()

    const { error } = await supabase
        .from('locations')
        .update(data)
        .eq('id', id)

    if (error) {
        console.error('Error updating location:', error)
        return { error: error.message }
    }

    revalidatePath('/admin')
    revalidatePath('/')
    return { success: true }
}
