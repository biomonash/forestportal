import React, { type JSX, useState } from 'react'
import UploadPage from './components/UploadPage'
import SpeciesTable from './components/SpeciesTable'
import type { Site, Species } from '../../apis/manager.api'
import EditSpeciesForm from './components/EditSpeciesForm'
import SitesTable from './components/SitesTable'
import EditSiteForm from './components/EditSiteForm'

const Manager: React.FC = (): JSX.Element => {
  const [tab, setTab] = useState<'upload' | 'species' | 'sites'>('upload')
  const [editingSpecies, setEditingSpecies] = useState<Species | null>(null)
  const [editingSite, setEditingSite] = useState<Site | null>(null)

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
        <button
          onClick={() => setTab('sites')}
          className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${tab === 'sites' ? 'bg-[#216869] text-white' : 'bg-white/10 text-[var(--muted-foreground)] hover:bg-white/20'}`}
        >
          Sites
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
      {tab === 'sites' && <SitesTable onEdit={(s) => setEditingSite(s)} />}

      {editingSite && (
        <EditSiteForm
          site={editingSite}
          onClose={() => setEditingSite(null)}
          onSaved={() => setEditingSite(null)}
        />
      )}
    </div>
  )
}

export default Manager