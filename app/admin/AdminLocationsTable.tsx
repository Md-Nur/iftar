'use client'

import { useState } from 'react'
import { IftarLocation } from '@/types'
import { deleteLocation, updateLocation } from '@/app/actions/admin'
import { IFTAR_TYPES, AUDIENCES } from '@/lib/constants'

export default function AdminLocationsTable({ initialLocations }: { initialLocations: IftarLocation[] }) {
    const [locations, setLocations] = useState<IftarLocation[]>(initialLocations)
    const [editingLocation, setEditingLocation] = useState<IftarLocation | null>(null)
    const [isDeleting, setIsDeleting] = useState<string | null>(null)

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this location?')) return
        setIsDeleting(id)
        const result = await deleteLocation(id)
        if (result.success) {
            setLocations(locations.filter(loc => loc.id !== id))
        } else {
            alert('Error deleting location: ' + result.error)
        }
        setIsDeleting(null)
    }

    const handleUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        if (!editingLocation) return

        const formData = new FormData(e.currentTarget)
        const data = {
            name: formData.get('name') as string,
            area: formData.get('area') as string,
            iftar_type: formData.get('iftar_type') as string,
            target_audience: formData.get('target_audience') as string,
            lat: parseFloat(formData.get('lat') as string),
            lng: parseFloat(formData.get('lng') as string),
            date: formData.get('date') as string,
        }

        const result = await updateLocation(editingLocation.id, data)
        if (result.success) {
            setLocations(locations.map(loc => loc.id === editingLocation.id ? { ...editingLocation, ...data } : loc))
            setEditingLocation(null)
        } else {
            alert('Error updating location: ' + result.error)
        }
    }

    return (
        <div className="bg-base-200 rounded-xl shadow-sm border border-primary/20 overflow-hidden">
            <div className="overflow-x-auto">
                <table className="table w-full">
                    <thead className="bg-base-300 text-base-content uppercase">
                        <tr>
                            <th scope="col" className="px-6 py-3">নাম</th>
                            <th scope="col" className="px-6 py-3">এলাকা</th>
                            <th scope="col" className="px-6 py-3">ধরন</th>
                            <th scope="col" className="px-6 py-3">তারিখ</th>
                            <th scope="col" className="px-6 py-3">কার জন্য</th>
                            <th scope="col" className="px-6 py-3">অ্যাকশন</th>
                        </tr>
                    </thead>
                    <tbody className="text-base-content">
                        {locations.map((loc) => (
                            <tr key={loc.id} className="border-b border-primary/10 hover:bg-base-300/50">
                                <td className="px-6 py-4 font-medium text-primary">{loc.name}</td>
                                <td className="px-6 py-4">{loc.area || '-'}</td>
                                <td className="px-6 py-4">{loc.iftar_type}</td>
                                <td className="px-6 py-4">{loc.date ? new Date(loc.date).toLocaleDateString('en-CA').split('-').reverse().join('-') : '-'}</td>
                                <td className="px-6 py-4">{loc.target_audience}</td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <button
                                        onClick={() => setEditingLocation(loc)}
                                        className="text-primary hover:text-primary-focus font-medium mr-3"
                                    >
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => handleDelete(loc.id)}
                                        disabled={isDeleting === loc.id}
                                        className="text-error hover:text-error/80 font-medium"
                                    >
                                        {isDeleting === loc.id ? 'Deleting...' : 'Delete'}
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {locations.length === 0 && (
                            <tr>
                                <td colSpan={6} className="px-6 py-4 text-center text-neutral-content">
                                    কোন লোকেশন পাওয়া যায়নি
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {editingLocation && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
                    <div className="bg-base-100 rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto border border-primary/20">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold text-primary">Edit Location</h2>
                            <button
                                onClick={() => setEditingLocation(null)}
                                className="btn btn-ghost"
                            >
                                ✕
                            </button>
                        </div>
                        <form onSubmit={handleUpdate} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-base-content mb-1">নাম (Name)</label>
                                <input
                                    type="text"
                                    name="name"
                                    defaultValue={editingLocation.name}
                                    required
                                    className="input input-bordered input-primary w-full bg-base-200 text-base-content"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-base-content mb-1">এলাকা (Area)</label>
                                <input
                                    type="text"
                                    name="area"
                                    defaultValue={editingLocation.area}
                                    className="input input-bordered input-primary w-full bg-base-200 text-base-content"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-base-content mb-1">ইফতারের ধরন</label>
                                    <select
                                        name="iftar_type"
                                        defaultValue={editingLocation.iftar_type}
                                        className="select select-bordered select-primary w-full bg-base-200 text-base-content"
                                    >
                                        {IFTAR_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-base-content mb-1">কার জন্য</label>
                                    <select
                                        name="target_audience"
                                        defaultValue={editingLocation.target_audience}
                                        className="select select-bordered select-primary w-full bg-base-200 text-base-content"
                                    >
                                        {AUDIENCES.map(a => <option key={a} value={a}>{a}</option>)}
                                    </select>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-base-content mb-1">Latitude</label>
                                    <input
                                        type="number"
                                        step="any"
                                        name="lat"
                                        defaultValue={editingLocation.lat}
                                        required
                                        className="input input-bordered input-primary w-full bg-base-200 text-base-content"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-base-content mb-1">Longitude</label>
                                    <input
                                        type="number"
                                        step="any"
                                        name="lng"
                                        defaultValue={editingLocation.lng}
                                        required
                                        className="input input-bordered input-primary w-full bg-base-200 text-base-content"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-base-content mb-1">তারিখ (Date)</label>
                                <div className="relative group">
                                    <div className="px-3 py-3 rounded-lg bg-base-200 border border-primary/30 text-base-content text-sm flex items-center gap-1.5 shadow-inner group-hover:border-primary/50 transition-colors pointer-events-none">
                                        📅 {(editingLocation.date || new Date().toLocaleDateString('en-CA')).split('-').reverse().join('-')}
                                    </div>
                                    <input
                                        type="date"
                                        name="date"
                                        defaultValue={editingLocation.date || new Date().toLocaleDateString('en-CA')}
                                        required
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-50 block"
                                        onClick={(e) => { try { e.currentTarget.showPicker(); } catch (err) { } }}
                                        onFocus={(e) => { try { e.currentTarget.showPicker(); } catch (err) { } }}
                                    />
                                </div>
                            </div>
                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setEditingLocation(null)}
                                    className="btn flex-1"
                                >
                                    ক্যানসেল
                                </button>
                                <button
                                    type="submit"
                                    className="btn btn-primary flex-1"
                                >
                                    সেভ করুন
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
