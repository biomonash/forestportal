import { useState } from 'react'

export interface FieldConfig {
    label: string
    key: string
    type: 'select' | 'text'
    options?: { label: string; value: string }[]
}

interface Props<T> {
    title: string
    subtitle?: string
    fields: FieldConfig[]
    initialValues: Record<string, unknown>
    onClose: () => void
    onSave: (values: Record<string, unknown>) => Promise<T>
    onSaved: (updated: T) => void
}

export default function EditForm<T>({
    title,
    subtitle,
    fields,
    initialValues,
    onClose,
    onSave,
    onSaved,
}: Props<T>) {
    const [form, setForm] = useState<Record<string, unknown>>(initialValues)
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState('')

    const handleSave = async () => {
        setSaving(true)
        setError('')
        try {
            const updated = await onSave(form)
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
                <h2 className="text-white font-semibold text-lg mb-1">{title}</h2>
                {subtitle && <p className="text-[var(--muted-foreground)] text-sm italic mb-6">{subtitle}</p>}

                {fields.map((field) => (
                    <label key={field.key} className="block mb-4">
                        <span className="text-[var(--muted-foreground)] text-xs uppercase tracking-wide">{field.label}</span>
                        {field.type === 'select' ? (
                            <select
                                value={String(form[field.key] ?? '')}
                                onChange={(e) => setForm({ ...form, [field.key]: e.target.value })}
                                className="mt-1 w-full px-3 py-2 rounded-lg bg-white/10 text-white border border-white/10 focus:outline-none focus:border-[#216869]"
                            >
                                {field.options?.map((opt) => (
                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                ))}
                            </select>
                        ) : (
                            <input
                                type="text"
                                value={String(form[field.key] ?? '')}
                                onChange={(e) => setForm({ ...form, [field.key]: e.target.value || null })}
                                className="mt-1 w-full px-3 py-2 rounded-lg bg-white/10 text-white placeholder-[var(--muted-foreground)] border border-white/10 focus:outline-none focus:border-[#216869]"
                            />
                        )}
                    </label>
                ))}

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