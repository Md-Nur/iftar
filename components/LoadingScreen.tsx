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

const STUDENT_QUOTES = [
    "ইফতারের মেনু কী? নাকি আজকেও মেস-এর খিচুড়ি? 🍛",
    "সেহরিতে ঘুম থেকে ওঠা পৃথিবীর কঠিনতম কাজ! 😴",
    "সবাই খেজুর খোঁজে, আর আমরা খুঁজি পেয়াজু! 🧅",
    "পড়াশোনা থাক দূরে, এখন শুধু ইফতারের স্বপ্নে বিভোর। 📚✨",
    "ইফতারের ১ মিনিট পরেই রাতের খাবারের চিন্তা শুরু! 🥘",
    "পকেটে টাকা নাই, কিন্তু ইফতারের বাজেটে কোনো আপস নেই! 💸",
]

export default function LoadingScreen({ onDone, minimal = false, manual = false, shouldFade = false }: {
    onDone: () => void,
    minimal?: boolean,
    manual?: boolean,
    shouldFade?: boolean
}) {
    const [internalFade, setInternalFade] = useState(false)
    const [quote, setQuote] = useState('')
    const fade = manual ? shouldFade : internalFade

    useEffect(() => {
        setQuote(STUDENT_QUOTES[Math.floor(Math.random() * STUDENT_QUOTES.length)])
    }, [])

    useEffect(() => {
        if (manual) return // Parent handles visibility
        const t1 = setTimeout(() => setInternalFade(true), 1800)
        const t2 = setTimeout(() => onDone(), 2400)
        return () => { clearTimeout(t1); clearTimeout(t2) }
    }, [onDone, manual])

    // Handle manual fade completion
    useEffect(() => {
        if (manual && shouldFade) {
            const timer = setTimeout(() => onDone(), minimal ? 400 : 800)
            return () => clearTimeout(timer)
        }
    }, [manual, shouldFade, onDone, minimal])

    return (
        <div
            className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center transition-opacity ${minimal ? 'duration-300' : 'duration-600'} ${minimal ? 'backdrop-blur-sm bg-black/20' : ''}`}
            style={{
                background: minimal ? 'none' : 'linear-gradient(135deg, #0a1628 0%, #064e3b 100%)',
                opacity: fade ? 0 : 1,
                pointerEvents: fade ? 'none' : 'all',
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
            <p className={`${minimal ? 'mt-1 text-xs' : 'mt-4 text-sm px-6 text-center italic'} text-neutral-content/90`}>
                {minimal ? 'লোকেশন পাওয়া যাচ্ছে...' : quote}
            </p>
        </div>
    )
}
