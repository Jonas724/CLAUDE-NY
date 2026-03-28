import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Header } from '@/components/layout/Header'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatDate } from '@/lib/utils'
import { FileText, Image as ImageIcon, Upload, ExternalLink } from 'lucide-react'

const DOC_STATUS: Record<string, { label: string; variant: 'secondary' | 'warning' | 'success' | 'destructive' | 'info' }> = {
  UPLOADED: { label: 'Uppladdad', variant: 'secondary' },
  PROCESSING: { label: 'Bearbetar...', variant: 'warning' },
  REVIEWED: { label: 'Granskad', variant: 'success' },
  FAILED: { label: 'Misslyckad', variant: 'destructive' },
}

export default async function DocumentsPage() {
  const session = await getSession()
  if (!session?.companyId) redirect('/onboarding')

  const documents = await prisma.document.findMany({
    where: { companyId: session.companyId },
    include: { transaction: { select: { id: true, status: true, grossAmount: true, supplierName: true } } },
    orderBy: { uploadedAt: 'desc' },
  })

  return (
    <>
      <Header
        title="Dokumentarkiv"
        description={`${documents.length} dokument`}
        action={
          <Link href="/upload">
            <Button size="sm">
              <Upload className="h-4 w-4 mr-1" />
              Ladda upp
            </Button>
          </Link>
        }
      />

      <div className="flex-1 p-6">
        {documents.length === 0 ? (
          <div className="bg-white rounded-xl border border-border p-12 text-center">
            <FileText className="h-10 w-10 text-muted-foreground mx-auto mb-4" />
            <p className="font-medium text-foreground">Inga dokument ännu</p>
            <p className="text-sm text-muted-foreground mt-1">
              Ladda upp kvitton och fakturor för att komma igång
            </p>
            <Link href="/upload">
              <Button className="mt-4">
                <Upload className="h-4 w-4 mr-2" />
                Ladda upp ditt första dokument
              </Button>
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-border overflow-hidden">
            {/* Header row */}
            <div className="hidden md:grid grid-cols-[auto_1fr_auto_auto_auto_auto] gap-4 items-center px-5 py-3 border-b border-border bg-secondary/30">
              <div className="w-9" />
              <span className="text-xs font-medium text-muted-foreground">FILNAMN</span>
              <span className="text-xs font-medium text-muted-foreground">LEVERANTÖR</span>
              <span className="text-xs font-medium text-muted-foreground">DATUM</span>
              <span className="text-xs font-medium text-muted-foreground">STATUS</span>
              <div className="w-8" />
            </div>

            <div className="divide-y divide-border">
              {documents.map(doc => {
                const isImage = doc.fileType.startsWith('image/')
                const Icon = isImage ? ImageIcon : FileText
                const statusInfo = DOC_STATUS[doc.status] || { label: doc.status, variant: 'secondary' as const }

                return (
                  <div key={doc.id} className="flex md:grid md:grid-cols-[auto_1fr_auto_auto_auto_auto] gap-4 items-center px-5 py-3.5">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-secondary shrink-0">
                      <Icon className="h-4 w-4 text-muted-foreground" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{doc.originalFileName}</p>
                      <p className="text-xs text-muted-foreground">{doc.fileType}</p>
                    </div>

                    <span className="hidden md:block text-sm text-muted-foreground truncate max-w-32">
                      {doc.transaction?.supplierName || '–'}
                    </span>

                    <span className="hidden md:block text-sm text-muted-foreground whitespace-nowrap">
                      {formatDate(doc.uploadedAt)}
                    </span>

                    <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>

                    <div className="flex items-center gap-1.5">
                      <a
                        href={doc.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                        title="Öppna original"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                      {doc.transaction && (
                        <Link
                          href={`/transactions/${doc.transaction.id}`}
                          className="p-1.5 rounded-md text-primary hover:bg-primary/10 transition-colors"
                          title="Granska transaktion"
                        >
                          <FileText className="h-3.5 w-3.5" />
                        </Link>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </>
  )
}
