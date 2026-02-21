'use server'

import { createAdminClient } from '@/lib/supabase'
import { revalidatePath } from 'next/cache'

export async function deleteLocation(id: string) {
    const supabase = createAdminClient()

    const { error, data } = await supabase
        .from('locations')
        .delete()
        .eq('id', id)
        .select()

    if (error) {
        console.error('Error deleting location:', error)
        return { error: error.message }
    }

    if (!data || data.length === 0) {
        return { error: 'লোকেশনটি ডিলিট করা যায়নি। হয়তো পারমিশন নেই বা আইডি ভুল।' }
    }

    revalidatePath('/admin')
    revalidatePath('/')
    return { success: true }
}

export async function updateLocation(id: string, data: any) {
    const supabase = createAdminClient()

    const { error, data: resultData } = await supabase
        .from('locations')
        .update(data)
        .eq('id', id)
        .select()

    if (error) {
        console.error('Error updating location:', error)
        return { error: error.message }
    }

    if (!resultData || resultData.length === 0) {
        return { error: 'লোকেশনটি আপডেট করা যায়নি। হয়তো পারমিশন নেই।' }
    }

    revalidatePath('/admin')
    revalidatePath('/')
    return { success: true }
}
