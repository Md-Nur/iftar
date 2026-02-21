'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { IFTAR_TYPES, AUDIENCES } from '@/lib/constants'

interface Props {
    lat: number
    lng: number
    onClose: () => void
    onAdded: () => void
}

export default function AddLocationForm({ lat, lng, onClose, onAdded }: Props) {
    const [name, setName] = useState('')
    const [area, setArea] = useState('')
    const [iftarType, setIftarType] = useState<string>(IFTAR_TYPES[0])
    const [audience, setAudience] = useState<string>(AUDIENCES[0])

    const getDefaultDate = () => {
        const now = new Date()
        if (now.getHours() >= 19) {
            now.setDate(now.getDate() + 1)
        }
        return now.toLocaleDateString('en-CA')
    }
    const [date, setDate] = useState(getDefaultDate())

    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!name.trim()) { setError('নাম দেওয়া আবশ্যক'); return }
        setLoading(true); setError('')
        const { error: err } = await supabase.from('locations').insert({
            name: name.trim(),
            area: area.trim() || null,
            iftar_type: iftarType,
            target_audience: audience,
            lat,
            lng,
            date,
        })
        setLoading(false)
        if (err) { console.error(err); setError('সংরক্ষণ করতে সমস্যা হয়েছে। আবার চেষ্টা করুন।') }
        else { onAdded(); onClose() }
    }

    return (
        <div className="modal modal-open" style={{ zIndex: 1100 }}>
            <div className="modal-box bg-base-300 border border-primary/30 max-w-sm rounded-2xl shadow-2xl max-h-[85vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-start justify-between mb-5">
                    <div>
                        <p className="text-2xl">📍</p>
                        <h2 className="text-lg font-bold text-primary mt-1">ইফতার স্পট যোগ করুন</h2>
                        <p className="text-xs text-neutral-content mt-0.5 font-mono">
                            {lat.toFixed(5)}, {lng.toFixed(5)}
                        </p>
                    </div>
                    <button className="btn btn-ghost btn-sm btn-circle text-neutral-content" onClick={onClose}>✕</button>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    {/* Name */}
                    <label className="form-control w-full">
                        <div className="label pb-1">
                            <span className="label-text text-neutral-content text-sm">সংস্থার নাম *</span>
                        </div>
                        <input
                            className="input input-bordered w-full bg-base-200 border-base-content/20 focus:border-primary text-base-content"
                            placeholder="যেমন: রাবি মসজিদ, স্বেচ্ছাসেবী গ্রুপ..."
                            value={name}
                            onChange={e => setName(e.target.value)}
                        />
                    </label>

                    {/* Area */}
                    <label className="form-control w-full">
                        <div className="label pb-1">
                            <span className="label-text text-neutral-content text-sm">এলাকা (ঐচ্ছিক)</span>
                        </div>
                        <input
                            className="input input-bordered w-full bg-base-200 border-base-content/20 focus:border-primary text-base-content"
                            placeholder="যেমন: কাজলা, তালাইমারি..."
                            value={area}
                            onChange={e => setArea(e.target.value)}
                        />
                    </label>

                    {/* Iftar Type */}
                    <label className="form-control w-full">
                        <div className="label pb-1">
                            <span className="label-text text-neutral-content text-sm">ইফতারের ধরন</span>
                        </div>
                        <select
                            className="select select-bordered w-full bg-base-200 border-base-content/20 focus:border-primary text-base-content"
                            value={iftarType}
                            onChange={e => setIftarType(e.target.value)}
                        >
                            {IFTAR_TYPES.map(t => <option key={t}>{t}</option>)}
                        </select>
                    </label>

                    {/* Audience */}
                    <label className="form-control w-full">
                        <div className="label pb-1">
                            <span className="label-text text-neutral-content text-sm">লক্ষ্য দর্শক</span>
                        </div>
                        <select
                            className="select select-bordered w-full bg-base-200 border-base-content/20 focus:border-primary text-base-content"
                            value={audience}
                            onChange={e => setAudience(e.target.value)}
                        >
                            {AUDIENCES.map(a => <option key={a}>{a}</option>)}
                        </select>
                    </label>

                    {/* Date */}
                    <label className="form-control w-full">
                        <div className="label pb-1">
                            <span className="label-text text-neutral-content text-sm">তারিখ *</span>
                        </div>
                        <div className="relative group min-h-[44px]">
                            <div className="px-3 py-3 rounded-lg bg-base-200 border border-base-content/20 text-base-content text-sm flex items-center gap-1.5 shadow-inner group-hover:border-primary/50 transition-colors pointer-events-none">
                                📅 {date.split('-').reverse().join('-')}
                            </div>
                            <input
                                type="date"
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-50 block"
                                value={date}
                                min={getDefaultDate()}
                                onChange={e => setDate(e.target.value)}
                                onClick={(e) => { try { e.currentTarget.showPicker(); } catch (err) { } }}
                                onFocus={(e) => { try { e.currentTarget.showPicker(); } catch (err) { } }}
                            />
                        </div>
                    </label>

                    {error && (
                        <div className="alert alert-error py-2">
                            <span className="text-sm">{error}</span>
                        </div>
                    )}

                    <button type="submit" disabled={loading} className="btn btn-primary w-full font-bold text-base mt-1">
                        {loading ? <span className="loading loading-spinner loading-sm" /> : '✅ সংরক্ষণ করুন'}
                    </button>
                </form>
            </div>
            <div className="modal-backdrop" onClick={onClose} />
        </div>
    )
}
