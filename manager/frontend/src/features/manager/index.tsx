import React, { type JSX, useState } from 'react'
import UploadPage from './components/UploadPage'
import SpeciesTable from './components/SpeciesTable'
import type { Species } from '../../apis/manager.api'
import EditSpeciesForm from './components/EditSpeciesForm'

const Manager: React.FC = (): JSX.Element => {
  const [tab, setTab] = useState<'upload' | 'species'>('upload')
  const [editingSpecies, setEditingSpecies] = useState<Species | null>(null)

  return (
    <div className="min-h-screen p-8">
      <div className="flex gap-4 mb-8">
        <button
          onClick={() => setTab('upload')}
          className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${tab === 'upload' ? 'bg-[#216869] text-white' : 'bg-white/10 text-[var(--muted-foreground)] hover:bg-white/20'}`}
        >
          Upload CSV
        </button>
        <button
          onClick={() => setTab('species')}
          className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${tab === 'species' ? 'bg-[#216869] text-white' : 'bg-white/10 text-[var(--muted-foreground)] hover:bg-white/20'}`}
        >
          Species
        </button>
      </div>

      {tab === 'upload' && <UploadPage />}
      {tab === 'species' && (
        <SpeciesTable onEdit={(s) => setEditingSpecies(s)} />
      )}
      {editingSpecies && (
        <EditSpeciesForm
          species={editingSpecies}
          onClose={() => setEditingSpecies(null)}
          onSaved={() => {
            setEditingSpecies(null)
          }}
        />
      )}
    </div>
  )
}

export default Manager