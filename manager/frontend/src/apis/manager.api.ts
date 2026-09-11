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