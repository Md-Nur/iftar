'use client'

import { useState, useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, useMap } from 'react-leaflet'
import L from 'leaflet'
import { IftarLocation } from '@/types'
import { IFTAR_TYPE_COLOR, IFTAR_TYPE_EMOJI, RAJSHAHI_CENTER, DEFAULT_ZOOM } from '@/lib/constants'
import AddLocationForm from './AddLocationForm'
import LocationPopup from './LocationPopup'

// ── Fix Next.js default icon paths ──────────────────────────────────
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

// ── Icon factories ───────────────────────────────────────────────────
function createIftarIcon(type: string) {
    const color = IFTAR_TYPE_COLOR[type] ?? '#d4af37'
    const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="36" height="44" viewBox="0 0 36 44">
      <defs>
        <filter id="sh"><feDropShadow dx="0" dy="2" stdDeviation="2" flood-color="rgba(0,0,0,0.4)"/></filter>
      </defs>
      <path d="M18 0C8.059 0 0 8.059 0 18c0 6.5 4.5 14 13.5 25.5L18 44l4.5-.5
               C31.5 32 36 24.5 36 18 36 8.059 27.941 0 18 0z"
            fill="${color}" filter="url(#sh)"/>
      <circle cx="18" cy="17" r="7" fill="rgba(0,0,0,0.25)"/>
      <text x="18" y="21.5" text-anchor="middle" font-size="11" fill="white">☪</text>
    </svg>`
    return L.divIcon({ html: svg, className: '', iconSize: [36, 44], iconAnchor: [18, 44], popupAnchor: [0, -44] })
}

const PENDING_ICON = L.divIcon({
    html: `<div style="width:28px;height:28px;background:rgba(212,175,55,0.9);border-radius:50%;
    border:3px solid white;box-shadow:0 0 12px rgba(212,175,55,0.6);display:flex;
    align-items:center;justify-content:center;font-size:14px;
    animation:pingPin 1s infinite;">📍</div>
    <style>@keyframes pingPin{0%,100%{transform:scale(1)}50%{transform:scale(1.1)}}</style>`,
    className: '', iconSize: [28, 28], iconAnchor: [14, 28],
})

const GPS_ICON = L.divIcon({
    html: `<div style="width:20px;height:20px;background:#3b82f6;border-radius:50%;
    border:3px solid white;box-shadow:0 0 0 6px rgba(59,130,246,0.25);"></div>`,
    className: '', iconSize: [20, 20], iconAnchor: [10, 10],
})

// ── Inner map helpers ────────────────────────────────────────────────
function MapClickHandler({ active, onMapClick }: {
    active: boolean
    onMapClick: (lat: number, lng: number) => void
}) {
    useMapEvents({ click: e => { if (active) onMapClick(e.latlng.lat, e.latlng.lng) } })
    return null
}

function FlyTo({ coords }: { coords: [number, number] | null }) {
    const map = useMap()
    if (coords) map.flyTo(coords, 17, { animate: true, duration: 1.2 })
    return null
}

// ── Types ────────────────────────────────────────────────────────────
interface MapProps {
    locations: IftarLocation[]
    onLocationAdded: () => void
    focusLocation?: IftarLocation | null
    onGpsLoadingChange?: (loading: boolean) => void
}

type GpsState = 'idle' | 'loading' | 'error'

// ── Component ────────────────────────────────────────────────────────
export default function MapView({ locations, onLocationAdded, focusLocation, onGpsLoadingChange }: MapProps) {
    const [pendingPin, setPendingPin] = useState<{ lat: number; lng: number } | null>(null)
    const [showForm, setShowForm] = useState(false)
    const [selectedLoc, setSelectedLoc] = useState<IftarLocation | null>(null)
    const [clickMode, setClickMode] = useState(false)
    const [menuOpen, setMenuOpen] = useState(false)
    const [gpsCoords, setGpsCoords] = useState<[number, number] | null>(null)
    const [flyTarget, setFlyTarget] = useState<[number, number] | null>(null)
    const [gpsState, setGpsState] = useState<GpsState>('idle')

    // Handle incoming focusLocation from sidebar click
    useEffect(() => {
        if (focusLocation) {
            setFlyTarget([focusLocation.lat, focusLocation.lng])
            setSelectedLoc(focusLocation)
            // Reset after flight
            const t = setTimeout(() => setFlyTarget(null), 1500)
            return () => clearTimeout(t)
        }
    }, [focusLocation])

    // Sync GPS loading state to parent
    useEffect(() => {
        if (onGpsLoadingChange) onGpsLoadingChange(gpsState === 'loading')
    }, [gpsState, onGpsLoadingChange])

    const openFormAt = (lat: number, lng: number) => {
        setPendingPin({ lat, lng })
        setShowForm(true)
        setClickMode(false)
        setMenuOpen(false)
    }

    const closeForm = () => { setShowForm(false); setPendingPin(null) }
    const formAdded = () => { onLocationAdded(); setPendingPin(null) }

    const toggleMenu = () => {
        if (clickMode) { setClickMode(false); setMenuOpen(false) } // cancel click mode
        else setMenuOpen(o => !o)
    }

    const startClickMode = () => { setMenuOpen(false); setClickMode(true) }

    const handleGps = () => {
        setMenuOpen(false)
        if (!('geolocation' in navigator)) {
            setGpsState('error'); setTimeout(() => setGpsState('idle'), 3000); return
        }

        // Trigger loading state immediately
        setGpsState('loading')
        if (onGpsLoadingChange) onGpsLoadingChange(true)

        navigator.geolocation.getCurrentPosition(
            ({ coords }) => {
                const pos: [number, number] = [coords.latitude, coords.longitude]
                setGpsCoords(pos)
                setFlyTarget(pos)
                openFormAt(pos[0], pos[1])
                // Delay hiding the loading screen so the fly animation is covered
                // and the user lands directly on the map with the popup open.
                setTimeout(() => {
                    setGpsState('idle')
                    if (onGpsLoadingChange) onGpsLoadingChange(false)
                    setFlyTarget(null)
                }, 1200) // Matches flyTo duration
            },
            () => {
                setGpsState('error');
                if (onGpsLoadingChange) onGpsLoadingChange(false)
                setTimeout(() => setGpsState('idle'), 3000)
            },
            { enableHighAccuracy: true, timeout: 8000 },
        )
    }

    const isActiveMode = clickMode || menuOpen
    const fabClass = `btn btn-circle btn-lg shadow-2xl border-none text-2xl transition-all duration-200
    ${isActiveMode ? 'bg-error hover:bg-error text-white' : 'bg-primary hover:bg-primary/90 text-primary-content'}`

    return (
        <div className="relative w-full h-full">
            {/* ── Leaflet Map ── */}
            <MapContainer
                center={RAJSHAHI_CENTER}
                zoom={DEFAULT_ZOOM}
                style={{ width: '100%', height: '100%' }}
                zoomControl={false}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                />
                <MapClickHandler active={clickMode} onMapClick={openFormAt} />
                <FlyTo coords={flyTarget} />

                {locations.map(loc => (
                    <Marker key={loc.id} position={[loc.lat, loc.lng]} icon={createIftarIcon(loc.iftar_type)}
                        eventHandlers={{ click: () => setSelectedLoc(loc) }}>
                        <Popup>
                            <div style={{ fontFamily: 'Hind Siliguri, sans-serif', minWidth: 160 }}>
                                <strong style={{ color: '#d4af37', fontSize: 15 }}>{loc.name}</strong>
                                {loc.area && (
                                    <div style={{ marginTop: 2, color: '#d4af37', opacity: 0.9, fontSize: 12 }}>
                                        🏙️ {loc.area}
                                    </div>
                                )}
                                <div style={{ marginTop: 6, color: '#94a3b8', fontSize: 13 }}>
                                    {IFTAR_TYPE_EMOJI[loc.iftar_type]} {loc.iftar_type}
                                </div>
                                <div style={{ marginTop: 4, color: '#64748b', fontSize: 12 }}>{loc.target_audience}</div>
                            </div>
                        </Popup>
                    </Marker>
                ))}

                {pendingPin && <Marker position={[pendingPin.lat, pendingPin.lng]} icon={PENDING_ICON} />}
                {gpsCoords && !pendingPin && <Marker position={gpsCoords} icon={GPS_ICON} />}
            </MapContainer>

            {/* ── Click-mode hint ── */}
            {clickMode && (
                <div className="absolute inset-0 z-[1000] pointer-events-none flex items-center justify-center">
                    <div className="badge badge-lg bg-base-300/90 border-primary/50 text-primary font-semibold px-5 py-3 text-sm shadow-xl backdrop-blur">
                        ম্যাপে ক্লিক করে পিন করুন
                    </div>
                </div>
            )}

            {/* ── GPS error toast ── */}
            {gpsState === 'error' && (
                <div className="absolute bottom-28 left-1/2 -translate-x-1/2 z-[1000] pointer-events-none">
                    <div className="alert alert-error py-2 px-4 text-sm shadow-xl whitespace-nowrap">
                        ⚠️ লোকেশন অ্যাক্সেস করা যায়নি
                    </div>
                </div>
            )}

            {/* ── Speed-dial FAB ── */}
            <div className="absolute bottom-7 right-4 z-[1000] flex flex-col items-end gap-3">
                {/* Sub-options */}
                {menuOpen && (
                    <div className="flex flex-col items-end gap-2 mb-1" style={{ animation: 'fadeUp 0.2s ease-out' }}>
                        {/* GPS option */}
                        <div className="flex items-center gap-2">
                            <span className="badge bg-base-300 border-base-content/20 text-base-content text-xs shadow">
                                আমার অবস্থান ব্যবহার করুন
                            </span>
                            <button
                                onClick={handleGps}
                                disabled={gpsState === 'loading'}
                                className="btn btn-circle btn-info btn-sm shadow-lg"
                            >
                                {gpsState === 'loading' ? <span className="loading loading-spinner loading-xs" /> : '📡'}
                            </button>
                        </div>
                        {/* Map-click option */}
                        <div className="flex items-center gap-2">
                            <span className="badge bg-base-300 border-base-content/20 text-base-content text-xs shadow">
                                ম্যাপে ক্লিক করে পিন করুন
                            </span>
                            <button onClick={startClickMode} className="btn btn-circle btn-secondary btn-sm shadow-lg">
                                🗺️
                            </button>
                        </div>
                    </div>
                )}

                {/* Main FAB */}
                <button onClick={toggleMenu} className={fabClass}>
                    {isActiveMode ? '✕' : '+'}
                </button>
            </div>

            <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>

            {showForm && pendingPin && (
                <AddLocationForm lat={pendingPin.lat} lng={pendingPin.lng} onClose={closeForm} onAdded={formAdded} />
            )}
            {selectedLoc && (
                <LocationPopup location={selectedLoc} onClose={() => setSelectedLoc(null)} />
            )}
        </div>
    )
}
