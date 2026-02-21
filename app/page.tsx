'use client'

import dynamic from 'next/dynamic'
import { useEffect, useState, useCallback } from 'react'
import Image from 'next/image'
import LoadingScreen from '@/components/LoadingScreen'
import { supabase } from '@/lib/supabase'
import { IftarLocation } from '@/types'

const MapView = dynamic(() => import('@/components/MapView'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-base-200 text-neutral-content text-sm">
      ম্যাপ লোড হচ্ছে...
    </div>
  ),
})

export default function Home() {
  const getDefaultDate = () => {
    const now = new Date()
    // After 7:00 PM (19:00), automatically show next day's spots
    if (now.getHours() >= 19) {
      now.setDate(now.getDate() + 1)
    }
    return now.toLocaleDateString('en-CA')
  }

  const [selectedDate, setSelectedDate] = useState<string>(getDefaultDate())
  const [loading, setLoading] = useState(true)
  const [locations, setLocations] = useState<IftarLocation[]>([])
  const [fetchError, setFetchError] = useState(false)
  const [drawerOpen, setDrawerOpen] = useState(false)

  // Passed to MapView to fly to a clicked sidebar location
  const [focusLocation, setFocusLocation] = useState<IftarLocation | null>(null)

  const fetchLocations = useCallback(async (dateStr?: string) => {
    setFetchError(false)
    const targetDate = dateStr || selectedDate

    const { data: resultData, error } = await supabase
      .from('locations')
      .select('*')
      .eq('date', targetDate)
      .order('created_at', { ascending: false })

    if (error) {
      console.error(error)
      setFetchError(true)
    } else {
      setLocations(resultData as IftarLocation[])
    }
  }, [selectedDate])

  useEffect(() => {
    fetchLocations()
  }, [fetchLocations, selectedDate])

  // Click handler for sidebar items
  const handleLocationClick = (loc: IftarLocation) => {
    setFocusLocation(loc)
    setDrawerOpen(false) // Close sidebar to see the map
  }

  // To trigger Loading screen during GPS (we handle this via prop inside MapView, but global Loading can be used here)
  const [gpsLoading, setGpsLoading] = useState(false)

  return (
    <>
      {/* Show full loading screen on initial load */}
      {loading && <LoadingScreen onDone={() => setLoading(false)} />}

      {/* Show minimal loading screen during GPS ping */}
      {gpsLoading && !loading && <LoadingScreen minimal manual onDone={() => { }} />}

      {/* DaisyUI drawer layout — sidebar on right */}
      <div className="drawer drawer-end h-dvh">
        <input
          id="iftar-drawer"
          type="checkbox"
          className="drawer-toggle"
          checked={drawerOpen}
          onChange={() => setDrawerOpen(o => !o)}
        />

        {/* ── MAIN PAGE ── */}
        <div className="drawer-content flex flex-col h-full overflow-hidden">

          {/* HEADER */}
          <header className="flex items-center justify-between px-4 py-2.5 z-[1000]
                             bg-base-300/85 backdrop-blur border-b border-primary/20 flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="avatar">
                <div className="w-9 rounded-full ring ring-primary/50 ring-offset-base-100 ring-offset-1">
                  <Image src="/logo.jpg" alt="লোগো" width={36} height={36} className="object-cover" />
                </div>
              </div>
              <div>
                <h1 className="text-sm font-bold text-primary leading-tight tracking-wide">
                  রাজশাহী ইফতার ম্যাপ
                </h1>
                <p className="text-xs text-neutral-content leading-none mt-0.5">রমজানের বিশেষ উদ্যোগ ☪️</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative">
                <div className="pointer-events-none px-2 py-1 rounded-lg bg-base-200 border border-primary/30 text-primary font-bold text-xs flex items-center gap-1.5 shadow-inner">
                  📅 {selectedDate.split('-').reverse().join('-')}
                </div>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                />
              </div>
              <div className="badge badge-primary badge-outline font-semibold hidden xs:inline-flex">
                📍 {locations.length} স্পট
              </div>
              <label htmlFor="iftar-drawer" className="btn btn-ghost btn-sm btn-square">
                ☰
              </label>
            </div>
          </header>

          {/* MAP AREA */}
          <div className="flex-1 relative overflow-hidden">
            {fetchError ? (
              <div className="h-full flex flex-col items-center justify-center gap-3 text-error">
                <span className="text-5xl">⚠️</span>
                <p className="text-sm">ডেটা লোড করতে সমস্যা হয়েছে</p>
                <button className="btn btn-outline btn-error btn-sm" onClick={() => fetchLocations()}>
                  আবার চেষ্টা করুন
                </button>
              </div>
            ) : (
              <MapView
                locations={locations}
                onLocationAdded={fetchLocations}
                focusLocation={focusLocation}
                onGpsLoadingChange={setGpsLoading}
              />
            )}
          </div>

          {/* HINT BAR */}
          <div className="flex items-center justify-center gap-2 py-2 text-xs text-neutral-content
                          bg-base-300/80 border-t border-base-content/10 flex-shrink-0">
            <span>☪️</span>
            <span>+ বাটন চাপুন এবং ইফতার স্পট যোগ করুন</span>
          </div>
        </div>

        {/* ── DRAWER SIDEBAR ── */}
        <div className="drawer-side z-[1000]">
          <label htmlFor="iftar-drawer" className="drawer-overlay" />
          <aside className="w-72 h-full bg-base-300 border-l border-primary/20 flex flex-col">
            <div className="flex items-center justify-between px-4 py-3 border-b border-base-content/10">
              <h2 className="font-bold text-primary text-sm">🕌 সকল ইফতার স্পট</h2>
              <label htmlFor="iftar-drawer" className="btn btn-ghost btn-xs btn-square">✕</label>
            </div>

            <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-2">
              {locations.length === 0 ? (
                <div className="flex flex-col items-center justify-center gap-2 pt-16 text-neutral-content text-sm text-center">
                  <span className="text-4xl">🌙</span>
                  <p>এখনো কোনো স্পট নেই।<br />+ বাটন দিয়ে প্রথমটি যোগ করুন!</p>
                </div>
              ) : (
                locations.map(loc => (
                  <div key={loc.id}
                    onClick={() => handleLocationClick(loc)}
                    className="card bg-base-200 border border-base-content/10 hover:border-primary/50 transition-colors cursor-pointer active:scale-[0.98]">
                    <div className="card-body p-3">
                      <div className="flex justify-between items-start">
                        <p className="font-semibold text-base-content text-sm leading-snug">{loc.name}</p>
                      </div>

                      {loc.area && (
                        <p className="text-[11px] text-primary/80 mt-0.5 leading-none">🏙️ {loc.area}</p>
                      )}

                      <p className="text-[11px] text-neutral-content mt-1.5 flex flex-wrap gap-x-2 gap-y-1">
                        <span>🍽️ {loc.iftar_type}</span>
                        <span className="opacity-50">•</span>
                        <span>👥 {loc.target_audience}</span>
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </aside>
        </div>
      </div>
    </>
  )
}
