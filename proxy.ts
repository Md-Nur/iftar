import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function proxy(request: NextRequest) {
    const { pathname } = request.nextUrl

    // Protect all /admin routes except /admin/login
    if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
        const adminToken = request.cookies.get('admin_token')

        if (!adminToken || adminToken.value !== 'authenticated') {
            const loginUrl = new URL('/admin/login', request.url)
            return NextResponse.redirect(loginUrl)
        }
    }

    // Redirect authenticated admin away from login page
    if (pathname === '/admin/login') {
        const adminToken = request.cookies.get('admin_token')
        if (adminToken && adminToken.value === 'authenticated') {
            const adminDashboardUrl = new URL('/admin', request.url)
            return NextResponse.redirect(adminDashboardUrl)
        }
    }
}

export const config = {
    matcher: ['/admin/:path*'],
}
