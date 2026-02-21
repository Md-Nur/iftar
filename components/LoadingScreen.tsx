'use client'
import Image from 'next/image'
import { useEffect, useState } from 'react'

const STARS = [
    { top: '8%', left: '15%', op: 0.7 },
    { top: '14%', left: '72%', op: 0.5 },
    { top: '22%', left: '40%', op: 0.6 },
    { top: '35%', left: '88%', op: 0.4 },
    { top: '45%', left: '5%', op: 0.8 },
    { top: '55%', left: '60%', op: 0.5 },
    { top: '63%', left: '28%', op: 0.7 },
    { top: '70%', left: '82%', op: 0.4 },
    { top: '78%', left: '48%', op: 0.6 },
    { top: '85%', left: '12%', op: 0.5 },
    { top: '90%', left: '65%', op: 0.7 },
    { top: '5%', left: '90%', op: 0.4 },
]

export default function LoadingScreen({ onDone, minimal = false, manual = false }: {
    onDone: () => void,
    minimal?: boolean,
    manual?: boolean
}) {
    const [fade, setFade] = useState(false)

    useEffect(() => {
        if (manual) return // Parent handles visibility
        const t1 = setTimeout(() => setFade(true), 1800)
        const t2 = setTimeout(() => onDone(), 2400)
        return () => { clearTimeout(t1); clearTimeout(t2) }
    }, [onDone, manual])

    return (
        <div
            className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center transition-opacity duration-600 ${minimal ? 'backdrop-blur-sm bg-black/20' : ''}`}
            style={{
                background: minimal ? 'none' : 'linear-gradient(135deg, #0a1628 0%, #064e3b 100%)',
                opacity: (fade && !manual) ? 0 : 1,
                pointerEvents: (fade && !manual) ? 'none' : 'all',
            }}
        >
            {!minimal && (
                <>
                    {/* Crescent decorations */}
                    <span className="absolute top-8 right-10 text-7xl opacity-15 select-none">☪</span>
                    <span className="absolute bottom-8 left-10 text-5xl opacity-10 select-none">☪</span>

                    {/* Static stars */}
                    {STARS.map((s, i) => (
                        <span
                            key={i}
                            className="absolute w-1 h-1 rounded-full bg-primary"
                            style={{ top: s.top, left: s.left, opacity: s.op }}
                        />
                    ))}
                </>
            )}

            {/* Logo ring */}
            <div
                className="rounded-full p-1 animate-pulse"
                style={{
                    background: 'linear-gradient(135deg, #d4af37, #064e3b)',
                    boxShadow: minimal ? '0 0 20px rgba(212,175,55,0.3)' : '0 0 40px rgba(212,175,55,0.4)',
                }}
            >
                <div className={`rounded-full overflow-hidden bg-base-100 ${minimal ? 'w-16 h-16' : 'w-28 h-28'}`}>
                    <Image src="/logo.jpg" alt="লোগো" width={minimal ? 64 : 112} height={minimal ? 64 : 112} className="object-cover" />
                </div>
            </div>

            <h1 className={`${minimal ? 'mt-3 text-lg' : 'mt-6 text-2xl'} font-bold text-primary tracking-wide`}
                style={{ textShadow: '0 2px 12px rgba(212,175,55,0.4)' }}>
                রাজশাহী ইফতার ম্যাপ
            </h1>
            <p className={`${minimal ? 'mt-1 text-xs' : 'mt-2 text-sm'} text-neutral-content`}>লোড হচ্ছে...</p>
        </div>
    )
}
