import { useEffect, useState } from 'react'
import { listSpecies, type Species } from '../../../apis/manager.api'

interface Props {
    onEdit: (species: Species) => void
}

export default function SpeciesTable({ onEdit }: Props) {
    const [species, setSpecies] = useState<Species[]>([])
    const [search, setSearch] = useState('')
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        listSpecies()
            .then(setSpecies)
            .finally(() => setLoading(false))
    }, [])

    const filtered = species.filter(
        (s) =>
            s.commonName.toLowerCase().includes(search.toLowerCase()) ||
            s.scientificName.toLowerCase().includes(search.toLowerCase())
    )

    if (loading) return <p className="text-[var(--muted-foreground)] text-sm">Loading...</p>

    return (
        <div>
            <input
                type="text"
                placeholder="Search species..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full mb-4 px-4 py-2 rounded-lg bg-white/10 text-white placeholder-[var(--muted-foreground)] border border-white/10 focus:outline-none focus:border-[#216869]"
            />

            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead>
                        <tr className="text-[var(--muted-foreground)] border-b border-white/10">
                            <th className="pb-3 pr-4">Scientific Name</th>
                            <th className="pb-3 pr-4">Common Name</th>
                            <th className="pb-3 pr-4">Taxa</th>
                            <th className="pb-3 pr-4">Native</th>
                            <th className="pb-3 pr-4">Indicator</th>
                            <th className="pb-3 pr-4">IUCN</th>
                            <th className="pb-3"></th>
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.map((s) => (
                            <tr key={s.id} className="border-b border-white/5 hover:bg-white/5">
                                <td className="py-3 pr-4 italic text-[var(--muted-foreground)]">{s.scientificName}</td>
                                <td className="py-3 pr-4 text-white">{s.commonName}</td>
                                <td className="py-3 pr-4 text-[var(--muted-foreground)] capitalize">{s.taxa}</td>
                                <td className="py-3 pr-4">
                                    <span className={`px-2 py-0.5 rounded-full text-xs ${s.native ? 'bg-green-900 text-green-300' : 'bg-red-900 text-red-300'}`}>
                                        {s.native ? 'Native' : 'Non-native'}
                                    </span>
                                </td>
                                <td className="py-3 pr-4">
                                    <span className={`px-2 py-0.5 rounded-full text-xs ${s.indicator ? 'bg-purple-900 text-purple-300' : 'bg-white/10 text-[var(--muted-foreground)]'}`}>
                                        {s.indicator ? 'Yes' : 'No'}
                                    </span>
                                </td>
                                <td className="py-3 pr-4 text-[var(--muted-foreground)]">{s.iucnStatus ?? '—'}</td>
                                <td className="py-3">
                                    <button
                                        onClick={() => onEdit(s)}
                                        className="px-3 py-1 text-xs rounded-lg bg-[#216869] text-white hover:bg-[#1a5254] transition-colors"
                                    >
                                        Edit
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}