'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { login } from '@/app/actions/auth'

export default function AdminLogin() {
    const [error, setError] = useState<string | null>(null)
    const [isLoading, setIsLoading] = useState(false)
    const router = useRouter()

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setIsLoading(true)
        setError(null)

        const formData = new FormData(e.currentTarget)
        const result = await login(formData)

        if (result?.error) {
            setError(result.error)
            setIsLoading(false)
        } else {
            // Successful login will redirect via the action, but just in case
            router.push('/admin')
            router.refresh()
        }
    }

    return (
        <div className="min-h-screen bg-base-300 flex items-center justify-center p-4">
            <div className="bg-base-100 p-8 rounded-2xl shadow-sm border border-primary/20 w-full max-w-md">
                <div className="text-center mb-8">
                    <h1 className="text-2xl font-bold text-primary">অ্যাডমিন লগইন</h1>
                    <p className="text-neutral-content mt-2">ইফতার ম্যাপ পরিচালনা করতে লগইন করুন</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-base-content mb-1">
                            ইউজারনেম (Username)
                        </label>
                        <input
                            type="text"
                            name="username"
                            required
                            className="input input-bordered input-primary w-full bg-base-200 text-base-content"
                            placeholder="md.nur"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-base-content mb-1">
                            পাসওয়ার্ড (Password)
                        </label>
                        <input
                            type="password"
                            name="password"
                            required
                            className="input input-bordered input-primary w-full bg-base-200 text-base-content"
                            placeholder="••••••••"
                        />
                    </div>

                    {error && (
                        <div className="p-3 bg-error/20 text-error rounded-xl text-sm text-center">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="btn btn-primary w-full"
                    >
                        {isLoading ? (
                            <span className="loading loading-spinner"></span>
                        ) : (
                            'লগইন করুন'
                        )}
                    </button>
                </form>
            </div>
        </div>
    )
}
