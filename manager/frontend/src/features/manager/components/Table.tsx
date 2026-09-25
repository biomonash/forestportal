import { useState } from "react"

interface Column<T> {
    header: string
    render: (row: T) => React.ReactNode
}

interface Props<T> {
    data: T[]
    columns: Column<T>[]
    searchKeys: (keyof T)[]
    loading: boolean
    onEdit?: (row: T) => void
}

export default function DataTable<T extends { id: number }>({
    data, columns, searchKeys, loading, onEdit
}: Props<T>) {
    const [search, setSearch] = useState('')

    const filtered = data.filter((row) =>
        searchKeys.some((key) =>
            String(row[key]).toLowerCase().includes(search.toLowerCase())
        )
    )

    if (loading) return <p className="text-[var(--muted-foreground)] text-sm">Loading...</p>

    return (
        <div>
            <input
                type="text"
                placeholder="Search..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full mb-4 px-4 py-2 rounded-lg bg-white/10 text-white placeholder-[var(--muted-foreground)] border border-white/10 focus:outline-none focus:border-[#216869]"
            />
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead>
                        <tr className="text-[var(--muted-foreground)] border-b border-white/10">
                            {columns.map((col) => (
                                <th key={col.header} className="pb-3 pr-4">{col.header}</th>
                            ))}
                            {onEdit && <th className="pb-3"></th>}
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.map((row) => (
                            <tr key={row.id} className="border-b border-white/5 hover:bg-white/5">
                                {columns.map((col) => (
                                    <td key={col.header} className="py-3 pr-4">{col.render(row)}</td>
                                ))}
                                {onEdit && (
                                    <td className="py-3">
                                        <button
                                            onClick={() => onEdit(row)}
                                            className="px-3 py-1 text-xs rounded-lg bg-[#216869] text-white hover:bg-[#1a5254] transition-colors"
                                        >
                                            Edit
                                        </button>
                                    </td>
                                )}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}