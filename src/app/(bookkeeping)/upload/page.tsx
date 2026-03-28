'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useDropzone } from 'react-dropzone'
import { Upload, FileText, X, CheckCircle2, Loader2, Image as ImageIcon } from 'lucide-react'
import { Header } from '@/components/layout/Header'
import { Button } from '@/components/ui/button'

interface UploadFile {
  file: File
  id: string
  status: 'waiting' | 'uploading' | 'done' | 'error'
  error?: string
  documentId?: string
}

export default function UploadPage() {
  const router = useRouter()
  const [files, setFiles] = useState<UploadFile[]>([])
  const [uploading, setUploading] = useState(false)

  const onDrop = useCallback((accepted: File[]) => {
    const newFiles: UploadFile[] = accepted.map(file => ({
      file,
      id: Math.random().toString(36).slice(2),
      status: 'waiting',
    }))
    setFiles(prev => [...prev, ...newFiles])
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpg', '.jpeg', '.png', '.webp'],
      'application/pdf': ['.pdf'],
    },
    maxSize: 20 * 1024 * 1024, // 20MB
  })

  function removeFile(id: string) {
    setFiles(prev => prev.filter(f => f.id !== id))
  }

  async function uploadAll() {
    const waiting = files.filter(f => f.status === 'waiting')
    if (waiting.length === 0) return

    setUploading(true)

    for (const uf of waiting) {
      setFiles(prev => prev.map(f => f.id === uf.id ? { ...f, status: 'uploading' } : f))

      try {
        const formData = new FormData()
        formData.append('file', uf.file)

        const res = await fetch('/api/documents', { method: 'POST', body: formData })
        const data = await res.json()

        if (!res.ok) {
          setFiles(prev => prev.map(f => f.id === uf.id ? { ...f, status: 'error', error: data.error } : f))
        } else {
          setFiles(prev => prev.map(f => f.id === uf.id ? { ...f, status: 'done', documentId: data.document.id } : f))
        }
      } catch {
        setFiles(prev => prev.map(f => f.id === uf.id ? { ...f, status: 'error', error: 'Nätverksfel' } : f))
      }
    }

    setUploading(false)
  }

  const allDone = files.length > 0 && files.every(f => f.status === 'done')
  const hasWaiting = files.some(f => f.status === 'waiting')

  function getFileIcon(file: File) {
    if (file.type === 'application/pdf') return FileText
    return ImageIcon
  }

  function formatSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  return (
    <>
      <Header title="Ladda upp underlag" description="Kvitton, fakturor eller andra affärsdokument" />

      <div className="flex-1 p-6 max-w-2xl mx-auto w-full">
        <div className="space-y-6">
          {/* Upload zone */}
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-colors ${
              isDragActive
                ? 'border-primary bg-primary/5'
                : 'border-border hover:border-primary/50 hover:bg-secondary/30'
            }`}
          >
            <input {...getInputProps()} />
            <div className="flex flex-col items-center gap-4">
              <div className={`flex h-16 w-16 items-center justify-center rounded-2xl transition-colors ${
                isDragActive ? 'bg-primary text-white' : 'bg-secondary text-muted-foreground'
              }`}>
                <Upload className="h-8 w-8" />
              </div>
              <div>
                <p className="text-base font-medium text-foreground">
                  {isDragActive ? 'Släpp filerna här' : 'Dra och släpp filer här'}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  eller klicka för att välja från datorn
                </p>
              </div>
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1"><ImageIcon className="h-3 w-3" /> JPG, PNG, WEBP</span>
                <span>•</span>
                <span className="flex items-center gap-1"><FileText className="h-3 w-3" /> PDF</span>
                <span>•</span>
                <span>Max 20 MB</span>
              </div>
            </div>
          </div>

          {/* File list */}
          {files.length > 0 && (
            <div className="space-y-2">
              {files.map(uf => {
                const Icon = getFileIcon(uf.file)
                return (
                  <div
                    key={uf.id}
                    className="flex items-center gap-3 bg-white rounded-xl border border-border px-4 py-3"
                  >
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-secondary shrink-0">
                      <Icon className="h-4 w-4 text-muted-foreground" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{uf.file.name}</p>
                      <p className="text-xs text-muted-foreground">{formatSize(uf.file.size)}</p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {uf.status === 'waiting' && (
                        <button onClick={() => removeFile(uf.id)} className="text-muted-foreground hover:text-destructive">
                          <X className="h-4 w-4" />
                        </button>
                      )}
                      {uf.status === 'uploading' && (
                        <Loader2 className="h-4 w-4 text-primary animate-spin" />
                      )}
                      {uf.status === 'done' && (
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                      )}
                      {uf.status === 'error' && (
                        <span className="text-xs text-destructive">{uf.error}</span>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {/* Actions */}
          {files.length > 0 && (
            <div className="flex gap-3">
              {!allDone && (
                <Button
                  className="flex-1"
                  size="lg"
                  onClick={uploadAll}
                  loading={uploading}
                  disabled={!hasWaiting}
                >
                  {uploading ? 'Laddar upp...' : `Ladda upp ${files.filter(f => f.status === 'waiting').length} fil(er)`}
                </Button>
              )}

              {allDone && (
                <Button
                  className="flex-1"
                  size="lg"
                  variant="success"
                  onClick={() => router.push('/transactions?status=AI_SUGGESTED')}
                >
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Granska AI-förslag →
                </Button>
              )}

              <Button variant="outline" size="lg" onClick={() => setFiles([])}>
                Rensa
              </Button>
            </div>
          )}

          {/* Info box */}
          <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4">
            <p className="text-sm font-medium text-indigo-700 mb-1">Vad händer när du laddar upp?</p>
            <ol className="text-sm text-indigo-600 space-y-1 list-decimal list-inside">
              <li>AI läser av texten i ditt underlag (OCR)</li>
              <li>Leverantör, belopp och datum extraheras</li>
              <li>BAS-konto och kategori föreslås automatiskt</li>
              <li>Du granskar och godkänner med ett klick</li>
            </ol>
          </div>
        </div>
      </div>
    </>
  )
}
