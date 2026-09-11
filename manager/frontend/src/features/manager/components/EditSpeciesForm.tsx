import { useState } from 'react'
import { updateSpecies, type Species, type UpdateSpeciesBody } from '../../../apis/manager.api'

interface Props {
    species: Species
    onClose: () => void
    onSaved: (updated: Species) => void
}

export default function EditSpeciesForm({ species, onClose, onSaved }: Props) {
    const [form, setForm] = useState<UpdateSpeciesBody>({
        native: species.native,
        taxa: species.taxa,
        indicator: species.indicator,
        reportable: species.reportable,
        iucnStatus: species.iucnStatus,
    })
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState('')

    const handleSave = async () => {
        setSaving(true)
        setError('')
        try {
            const updated = await updateSpecies(species.id, form)
            onSaved(updated)
            onClose()
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to save')
        } finally {
            setSaving(false)
        }
    }

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
            <div className="bg-[#1f2421] border border-white/10 rounded-xl p-6 w-full max-w-md">
                <h2 className="text-white font-semibold text-lg mb-1">{species.commonName}</h2>
                <p className="text-[var(--muted-foreground)] text-sm italic mb-6">{species.scientificName}</p>

                <label className="block mb-4">
                    <span className="text-[var(--muted-foreground)] text-xs uppercase tracking-wide">Native</span>
                    <select
                        value={form.native ? 'true' : 'false'}
                        onChange={(e) => setForm({ ...form, native: e.target.value === 'true' })}
                        className="mt-1 w-full px-3 py-2 rounded-lg bg-white/10 text-white border border-white/10 focus:outline-none focus:border-[#216869]"
                    >
                        <option value="true">Native</option>
                        <option value="false">Non-native</option>
                    </select>
                </label>

                <label className="block mb-4">
                    <span className="text-[var(--muted-foreground)] text-xs uppercase tracking-wide">Taxa</span>
                    <select
                        value={form.taxa}
                        onChange={(e) => setForm({ ...form, taxa: e.target.value })}
                        className="mt-1 w-full px-3 py-2 rounded-lg bg-white/10 text-white border border-white/10 focus:outline-none focus:border-[#216869]"
                    >
                        <option value="bird">Bird</option>
                        <option value="mammal">Mammal</option>
                        <option value="reptile">Reptile</option>
                    </select>
                </label>

                <label className="block mb-4">
                    <span className="text-[var(--muted-foreground)] text-xs uppercase tracking-wide">Indicator</span>
                    <select
                        value={form.indicator ? 'true' : 'false'}
                        onChange={(e) => setForm({ ...form, indicator: e.target.value === 'true' })}
                        className="mt-1 w-full px-3 py-2 rounded-lg bg-white/10 text-white border border-white/10 focus:outline-none focus:border-[#216869]"
                    >
                        <option value="true">Yes</option>
                        <option value="false">No</option>
                    </select>
                </label>

                <label className="block mb-4">
                    <span className="text-[var(--muted-foreground)] text-xs uppercase tracking-wide">Reportable</span>
                    <select
                        value={form.reportable ? 'true' : 'false'}
                        onChange={(e) => setForm({ ...form, reportable: e.target.value === 'true' })}
                        className="mt-1 w-full px-3 py-2 rounded-lg bg-white/10 text-white border border-white/10 focus:outline-none focus:border-[#216869]"
                    >
                        <option value="true">Yes</option>
                        <option value="false">No</option>
                    </select>
                </label>

                <label className="block mb-6">
                    <span className="text-[var(--muted-foreground)] text-xs uppercase tracking-wide">IUCN Status</span>
                    <input
                        type="text"
                        value={form.iucnStatus ?? ''}
                        onChange={(e) => setForm({ ...form, iucnStatus: e.target.value || null })}
                        className="mt-1 w-full px-3 py-2 rounded-lg bg-white/10 text-white placeholder-[var(--muted-foreground)] border border-white/10 focus:outline-none focus:border-[#216869]"
                    />
                </label>

                {error && <p className="text-red-400 text-sm mb-4">{error}</p>}

                <div className="flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 py-2 rounded-lg bg-white/10 text-[var(--muted-foreground)] hover:bg-white/20 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="flex-1 py-2 rounded-lg bg-[#216869] text-white hover:bg-[#1a5254] disabled:opacity-50 transition-colors"
                    >
                        {saving ? 'Saving...' : 'Save'}
                    </button>
                </div>
            </div>
        </div>
    )
}