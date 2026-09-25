import { useEffect, useState } from 'react'
import { listSites, type Site } from '../../../apis/manager.api'
import DataTable from './Table'

interface Props {
    onEdit: (site: Site) => void
}

export default function SitesTable({ onEdit }: Props) {
    const [sites, setSites] = useState<Site[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        listSites().then(setSites).finally(() => setLoading(false))
    }, [])

    const columns = [
        { header: 'Code', render: (s: Site) => <span className="text-white">{s.code}</span> },
        { header: 'Name', render: (s: Site) => <span className="text-[var(--muted-foreground)]">{s.name ?? '—'}</span> },
        { header: 'Block', render: (s: Site) => <span className="text-[var(--muted-foreground)]">{s.block}</span> },
        { header: 'Forest', render: (s: Site) => <span className="capitalize text-[var(--muted-foreground)]">{s.forest}</span> },
        { header: 'Tenure', render: (s: Site) => <span className="capitalize text-[var(--muted-foreground)]">{s.tenure}</span> },
        { header: 'Location', render: (s: Site) => <span className="text-[var(--muted-foreground)]">{s.location ?? '—'}</span> },
    ]

    return <DataTable data={sites} columns={columns} searchKeys={['code', 'name']} loading={loading} onEdit={onEdit} />
}