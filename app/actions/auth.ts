'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

const ADMIN_USERNAME = 'md.nur'
const ADMIN_PASSWORD = 'khelahobe0iftar'

export async function login(formData: FormData) {
    const username = formData.get('username')
    const password = formData.get('password')

    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
        const cookieStore = await cookies()
        // In a real app, use a secure encrypted session or JWT.
        // For this simple case with hardcoded credentials, a basic token works.
        cookieStore.set('admin_token', 'authenticated', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 60 * 60 * 24 // 1 day
        })

        redirect('/admin')
    }

    return { error: 'Invalid credentials' }
}

export async function logout() {
    const cookieStore = await cookies()
    cookieStore.delete('admin_token')
    redirect('/admin/login')
}
