import { MANAGER_API_URL } from "../constants/api"

export async function uploadCSV(file: File): Promise<{ message: string }> {
    const formData = new FormData()
    formData.append('file', file)

    const res = await fetch(`${MANAGER_API_URL}/api/manager/upload`, {
        method: 'POST',
        body: formData,
    })

    const data = await res.json()
    if (!res.ok) throw new Error(data.detail || 'Upload failed')
    return data
}

export type Species = {
    id: number
    scientificName: string
    commonName: string
    native: boolean
    taxa: string
    indicator: boolean
    reportable: boolean
    iucnStatus: string | null
    images: string[]
}

export type Site = {
    id: number
    code: string
    block: number
    name: string | null
    location: string | null
    tenure: string
    forest: string
}

export type UpdateSiteBody = {
    block: number
    name: string | null
    location: string | null
    tenure: string
    forest: string
}

export type UpdateSpeciesBody = {
    native: boolean
    taxa: string
    indicator: boolean
    reportable: boolean
    iucnStatus: string | null
}

export async function listSpecies(): Promise<Species[]> {
    const res = await fetch(`${MANAGER_API_URL}/api/manager/species`)
    const data = await res.json()
    if (!res.ok) throw new Error(data.detail || 'Failed to fetch species')
    return data
}

export async function updateSpecies(id: number, body: UpdateSpeciesBody): Promise<Species> {
    const res = await fetch(`${MANAGER_API_URL}/api/manager/species/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.detail || 'Failed to update species')
    return data
}

export async function listSites(): Promise<Site[]> {
    const res = await fetch(`${MANAGER_API_URL}/api/manager/sites`)
    const data = await res.json()
    if (!res.ok) throw new Error(data.detail || 'Failed to fetch sites')
    return data
}

export async function updateSite(code: string, body: UpdateSiteBody): Promise<Site> {
    const res = await fetch(`${MANAGER_API_URL}/api/manager/sites/${code}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.detail || 'Failed to update site')
    return data
}