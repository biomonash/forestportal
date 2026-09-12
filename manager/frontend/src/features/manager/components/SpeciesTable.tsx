import { useEffect, useState } from 'react'
import { listSpecies, type Species } from '../../../apis/manager.api'
import DataTable from './Table'

interface Props {
    onEdit: (species: Species) => void
}

export default function SpeciesTable({ onEdit }: Props) {
    const [species, setSpecies] = useState<Species[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        listSpecies().then(setSpecies).finally(() => setLoading(false))
    }, [])

    const columns = [
        { header: 'Scientific Name', render: (s: Species) => <span className="italic text-[var(--muted-foreground)]">{s.scientificName}</span> },
        { header: 'Common Name', render: (s: Species) => <span className="text-white">{s.commonName}</span> },
        { header: 'Taxa', render: (s: Species) => <span className="capitalize text-[var(--muted-foreground)]">{s.taxa}</span> },
        {
            header: 'Native', render: (s: Species) => (
                <span className={`px-2 py-0.5 rounded-full text-xs ${s.native ? 'bg-green-900 text-green-300' : 'bg-red-900 text-red-300'}`}>
                    {s.native ? 'Native' : 'Non-native'}
                </span>
            )
        },
        {
            header: 'Indicator', render: (s: Species) => (
                <span className={`px-2 py-0.5 rounded-full text-xs ${s.indicator ? 'bg-purple-900 text-purple-300' : 'bg-white/10 text-[var(--muted-foreground)]'}`}>
                    {s.indicator ? 'Yes' : 'No'}
                </span>
            )
        },
        { header: 'IUCN', render: (s: Species) => <span className="text-[var(--muted-foreground)]">{s.iucnStatus ?? '—'}</span> },
    ]

    return <DataTable data={species} columns={columns} searchKeys={['commonName', 'scientificName']} loading={loading} onEdit={onEdit} />
}