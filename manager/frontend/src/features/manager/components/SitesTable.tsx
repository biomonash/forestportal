import { useEffect, useState } from 'react'
import { listSites, type Site } from '../../../apis/manager.api'
import DataTable from './Table'
import EditSiteForm from './EditSiteForm'

export default function SitesTable() {
    const [sites, setSites] = useState<Site[]>([])
    const [loading, setLoading] = useState(true)
    const [editing, setEditing] = useState<Site | null>(null)

    useEffect(() => {
        listSites().then(setSites).finally(() => setLoading(false))
    }, [])

    const columns = [
        { header: 'Code', render: (s: Site) => <span className="text-white">{s.code}</span> },
        { header: 'Name', render: (s: Site) => <span className="text-muted-foreground">{s.name ?? '—'}</span> },
        { header: 'Block', render: (s: Site) => <span className="text-muted-foreground">{s.block}</span> },
        { header: 'Forest', render: (s: Site) => <span className="capitalize text-muted-foreground">{s.forest}</span> },
        { header: 'Tenure', render: (s: Site) => <span className="capitalize text-muted-foreground">{s.tenure}</span> },
        { header: 'Location', render: (s: Site) => <span className="text-muted-foreground">{s.location ?? '—'}</span> },
    ]

    return (
    <>
        <DataTable data={sites} columns={columns} searchKeys={['code', 'name']} loading={loading} onEdit={setEditing} />
        {editing && (
            <EditSiteForm
                site={editing}
                onClose={() => setEditing(null)}
                onSaved={(updated) => {
                    setSites((prev) => prev.map((s) => (s.id === updated.id ? updated : s)))
                    setEditing(null)
                }}
            />
        )}
    </>
)
}