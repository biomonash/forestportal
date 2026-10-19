import { useState, useRef } from 'react'
import { uploadCSV, type ImportResult } from '../../../apis/manager.api'

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null)
  const [status, setStatus] = useState<
    'idle' | 'uploading' | 'success' | 'error'
  >('idle')
  const [message, setMessage] = useState('')
  const [result, setResult] = useState<ImportResult | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0]
    if (selected) setFile(selected)
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    const dropped = e.dataTransfer.files[0]
    if (dropped) setFile(dropped)
  }

  const handleUpload = async () => {
    if (!file) return

    setStatus('uploading')
    setMessage('')
    setResult(null)

    try {
      const data = await uploadCSV(file)
      setStatus('success')
      setResult(data)
    } catch (err) {
      setStatus('error')
      setMessage(err instanceof Error ? err.message : 'Upload failed')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center -mt-20">
      <div className="max-w-xl w-full px-4">
        <h2 className="text-lg font-semibold text-white text-center">Upload CSV</h2>

        {/* Drop zone */}
        <div
          onClick={() => inputRef.current?.click()}
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          className="border-2 border-dashed border-muted-foreground rounded-xl p-12 text-center cursor-pointer hover:border-sidebar transition-colors mt-6"
        >
          <p className="text-muted-foreground text-sm">
            {file
              ? file.name
              : 'Drag and drop a CSV file here, or click to browse'}
          </p>
          <input
            ref={inputRef}
            type="file"
            accept=".csv"
            className="hidden"
            onChange={handleFileChange}
          />
        </div>

        {/* Upload button */}
        {file && (
          <button
            onClick={handleUpload}
            disabled={status === 'uploading'}
            className="mt-4 w-full bg-sidebar text-white py-2 rounded-lg font-semibold hover:bg-sidebar-hover disabled:opacity-50 transition-colors"
          >
            {status === 'uploading' ? 'Uploading...' : 'Upload'}
          </button>
        )}

        {/* Status message */}
        {message && (
          <p
            className={`mt-3 text-sm text-center ${status === 'success' ? 'text-green-600' : 'text-red-500'}`}
          >
            {message}
          </p>
        )}

        {result && (
          <div className="mt-4 rounded-xl bg-white/10 p-4 text-sm">
            <p className="text-white font-semibold mb-2">Import complete</p>
            <ul className="text-muted-foreground space-y-1">
              <li>{result.observationsInserted.toLocaleString()} observations inserted</li>
              <li>{result.observationsSkipped.toLocaleString()} observations skipped as duplicates</li>
              <li>{result.sitesCreated} new sites</li>
              <li>{result.speciesCreated} new species</li>
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}
