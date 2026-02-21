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
  const [initFade, setInitFade] = useState(false)
  const [dataLoaded, setDataLoaded] = useState(false)
  const [gpsSettled, setGpsSettled] = useState(false)
  const [showGpsError, setShowGpsError] = useState(false)
  const [locations, setLocations] = useState<IftarLocation[]>([])
  const [fetchError, setFetchError] = useState(false)
  const [drawerOpen, setDrawerOpen] = useState(false)

  // Passed to MapView to fly to a clicked sidebar location
  const [focusLocation, setFocusLocation] = useState<IftarLocation | null>(null)
  const [gpsCoords, setGpsCoords] = useState<[number, number] | null>(null)

  const fetchLocations = useCallback(async (dateStr?: string) => {
    setFetchError(false)
    const targetDate = dateStr || selectedDate

    // Try filtering by the new 'date' column first
    const { data: resultData, error } = await supabase
      .from('locations')
      .select('*')
      .eq('date', targetDate)
      .order('created_at', { ascending: false })

    if (error) {
      const start = new Date(targetDate)
      start.setHours(0, 0, 0, 0)
      const end = new Date(targetDate)
      end.setHours(23, 59, 59, 999)

      const { data: fallbackData, error: fallbackError } = await supabase
        .from('locations')
        .select('*')
        .gte('created_at', start.toISOString())
        .lte('created_at', end.toISOString())
        .order('created_at', { ascending: false })

      if (fallbackError) {
        setFetchError(true)
      } else {
        setLocations(fallbackData as IftarLocation[])
      }
    } else {
      setLocations(resultData as IftarLocation[])
    }
  }, [selectedDate])

  useEffect(() => {
    fetchLocations().then(() => {
      setDataLoaded(true)
    })
  }, [fetchLocations, selectedDate])

  // Dismiss full loading screen as soon as data (spots) is ready
  useEffect(() => {
    if (dataLoaded) {
      setTimeout(() => setInitFade(true), 600)
    }
  }, [dataLoaded])

  // Safety Timeout for GPS (now just internal cleanup, doesn't block UI)
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!gpsSettled) {
        setGpsSettled(true)
      }
    }, 6000)
    return () => clearTimeout(timer)
  }, [gpsSettled])

  // Click handler for sidebar items
  const handleLocationClick = (loc: IftarLocation) => {
    setFocusLocation({ ...loc })
    setDrawerOpen(false) // Close sidebar to see the map
  }

  // To trigger Loading screen during GPS (we handle this via prop inside MapView, but global Loading can be used here)
  const [gpsLoading, setGpsLoading] = useState(false)

  return (
    <>
      {/* Show full loading screen on initial load */}
      {loading && (
        <LoadingScreen
          manual
          shouldFade={initFade}
          onDone={() => setLoading(false)}
        />
      )}

      {/* Background GPS Indicator (non-blocking) */}
      {gpsLoading && !loading && (
        <div className="pointer-events-none">
          <LoadingScreen minimal manual shouldFade={false} onDone={() => { }} />
        </div>
      )}

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
            <div className="flex items-center gap-2 sm:gap-3 overflow-hidden">
              <div className="avatar shrink-0">
                <div className="w-8 sm:w-9 rounded-full ring ring-primary/50 ring-offset-base-100 ring-offset-1">
                  <Image src="/logo.jpg" alt="লোগো" width={36} height={36} className="object-cover" />
                </div>
              </div>
              <div className="min-w-0">
                <h1 className="text-[12px] sm:text-sm font-bold text-primary leading-tight tracking-wide truncate">
                  রাজশাহী ইফতার ম্যাপ
                </h1>
                <p className="text-[10px] sm:text-xs text-neutral-content leading-none mt-0.5 truncate">রমজানের বিশেষ উদ্যোগ ☪️</p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 sm:gap-2">
              <div className="relative group shrink-0 min-w-[100px] sm:min-w-[120px]">
                <div className="px-2 sm:px-3 py-1.5 rounded-lg bg-base-200 border border-primary/30 text-primary font-bold text-[10px] sm:text-xs flex items-center gap-1.5 shadow-sm group-hover:border-primary/60 transition-colors pointer-events-none">
                  📅 {selectedDate.split('-').reverse().join('-')}
                </div>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  onClick={(e) => { try { e.currentTarget.showPicker(); } catch (err) { } }}
                  onFocus={(e) => { try { e.currentTarget.showPicker(); } catch (err) { } }}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-50 block"
                  aria-label="Select Date"
                />
              </div>
              <div className="badge badge-primary badge-outline font-semibold hidden md:inline-flex">
                📍 {locations.length} স্পট
              </div>
              <label htmlFor="iftar-drawer" className="btn btn-ghost btn-xs sm:btn-sm btn-square">
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
              /* Render map immediately so GPS and data fetch run in parallel */
              <MapView
                locations={locations}
                onLocationAdded={fetchLocations}
                focusLocation={focusLocation}
                onGpsLoadingChange={setGpsLoading}
                initialLocate={true}
                gpsCoords={gpsCoords}
                onGpsCoordsChange={setGpsCoords}
                onGpsResult={(status) => {
                  setGpsSettled(true)
                  if (status === 'error') setShowGpsError(true)
                }}
              />
            )}
          </div>

          {/* GPS Error Toast */}
          {showGpsError && (
            <div className="fixed bottom-28 left-1/2 -translate-x-1/2 z-[100] animate-bounce">
              <div className="bg-error text-error-content px-4 py-2 rounded-full shadow-lg text-xs font-bold flex items-center gap-2 whitespace-nowrap">
                ⚠️ লোকেশন পাওয়া যায়নি
                <button onClick={() => setShowGpsError(false)} className="hover:opacity-70">✕</button>
              </div>
            </div>
          )}

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
