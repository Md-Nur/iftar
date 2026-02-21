'use client'

import { IftarLocation } from '@/types'
import { IFTAR_TYPE_EMOJI, AUDIENCE_BADGE } from '@/lib/constants'

interface Props {
    location: IftarLocation
    onClose: () => void
}

interface DetailRowProps {
    label: string
    value: React.ReactNode
}

function DetailRow({ label, value }: DetailRowProps) {
    return (
        <div className="flex items-center justify-between bg-base-200 rounded-xl px-4 py-2.5">
            <span className="text-neutral-content text-sm">{label}</span>
            <span className="text-sm font-medium">{value}</span>
        </div>
    )
}

export default function LocationPopup({ location, onClose }: Props) {
    const emoji = IFTAR_TYPE_EMOJI[location.iftar_type] ?? '🍽️'
    const badgeCls = AUDIENCE_BADGE[location.target_audience] ?? 'badge-ghost'
    const addedDate = new Date(location.created_at).toLocaleDateString('bn-BD', {
        day: 'numeric', month: 'long',
    })

    return (
        <div className="modal modal-open" style={{ zIndex: 900, alignItems: 'flex-end' }} onClick={onClose}>
            <div
                className="modal-box bg-base-300 border border-primary/30 max-w-sm w-full rounded-t-2xl rounded-b-none
                   mx-2 mb-0 pb-8 shadow-2xl"
                style={{ animation: 'slideUp 0.3s ease-out' }}
                onClick={e => e.stopPropagation()}
            >
                {/* Drag handle */}
                <div className="flex justify-center mb-4">
                    <div className="w-10 h-1 rounded-full bg-base-content/20" />
                </div>

                {/* Title row */}
                <div className="flex items-center gap-4 mb-4">
                    <div className="w-14 h-14 rounded-xl bg-primary/10 border border-primary/30
                          flex items-center justify-center text-3xl flex-shrink-0">
                        {emoji}
                    </div>
                    <div>
                        <h2 className="text-base-content font-bold text-lg leading-snug">{location.name}</h2>
                        <p className="text-neutral-content text-xs mt-0.5">{addedDate} যোগ করা হয়েছে</p>
                    </div>
                </div>

                {/* Details */}
                <div className="flex flex-col gap-2">
                    {location.area && (
                        <DetailRow
                            label="🏙️ এলাকা"
                            value={<span className="text-base-content font-medium">{location.area}</span>}
                        />
                    )}
                    <DetailRow
                        label="🍽️ ইফতারের ধরন"
                        value={<span className="text-primary">{emoji} {location.iftar_type}</span>}
                    />
                    <DetailRow
                        label="👥 লক্ষ্য দর্শক"
                        value={<span className={`badge badge-sm ${badgeCls}`}>{location.target_audience}</span>}
                    />
                    <DetailRow
                        label="📍 স্থানাঙ্ক"
                        value={
                            <span className="text-neutral-content font-mono text-xs">
                                {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
                            </span>
                        }
                    />
                </div>

                <div className="modal-action mt-4">
                    <button className="btn btn-ghost btn-sm w-full" onClick={onClose}>বন্ধ করুন</button>
                </div>
            </div>

            <style>{`
        @keyframes slideUp {
          from { transform: translateY(30px); opacity: 0; }
          to   { transform: translateY(0);    opacity: 1; }
        }
      `}</style>
        </div>
    )
}
