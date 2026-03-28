import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Header } from '@/components/layout/Header'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatCurrency, formatDate } from '@/lib/utils'
import { ArrowRight, FileText, ChevronRight } from 'lucide-react'

const STATUS_LABELS: Record<string, string> = {
  DRAFT: 'Utkast',
  AI_SUGGESTED: 'AI-förslag',
  APPROVED: 'Godkänd',
  EDITED: 'Redigerad',
  REJECTED: 'Avvisad',
}

const STATUS_VARIANTS: Record<string, 'secondary' | 'warning' | 'success' | 'info' | 'destructive'> = {
  DRAFT: 'secondary',
  AI_SUGGESTED: 'warning',
  APPROVED: 'success',
  EDITED: 'info',
  REJECTED: 'destructive',
}

const TABS = [
  { value: '', label: 'Alla' },
  { value: 'AI_SUGGESTED', label: 'Väntar på granskning' },
  { value: 'APPROVED', label: 'Godkända' },
  { value: 'EDITED', label: 'Redigerade' },
  { value: 'REJECTED', label: 'Avvisade' },
]

interface PageProps {
  searchParams: { status?: string }
}

export default async function TransactionsPage({ searchParams }: PageProps) {
  const session = await getSession()
  if (!session?.companyId) redirect('/onboarding')

  const statusFilter = searchParams.status

  const transactions = await prisma.transaction.findMany({
    where: {
      companyId: session.companyId,
      ...(statusFilter ? { status: statusFilter as never } : {}),
    },
    include: { document: { select: { originalFileName: true } } },
    orderBy: { createdAt: 'desc' },
  })

  const pendingCount = await prisma.transaction.count({
    where: { companyId: session.companyId, status: 'AI_SUGGESTED' },
  })

  return (
    <>
      <Header
        title="Transaktioner"
        description={`${transactions.length} poster${statusFilter ? ` · ${STATUS_LABELS[statusFilter] || statusFilter}` : ''}`}
      />

      <div className="flex-1 p-6 space-y-4">
        {/* Filter tabs */}
        <div className="flex items-center gap-1 bg-white border border-border rounded-xl p-1 w-fit">
          {TABS.map(tab => {
            const isActive = (statusFilter || '') === tab.value
            return (
              <Link
                key={tab.value}
                href={tab.value ? `/transactions?status=${tab.value}` : '/transactions'}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                  isActive
                    ? 'bg-primary text-white shadow-sm'
                    : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
                }`}
              >
                {tab.label}
                {tab.value === 'AI_SUGGESTED' && pendingCount > 0 && (
                  <span className={`ml-1.5 text-xs rounded-full px-1.5 py-0.5 ${isActive ? 'bg-white/20 text-white' : 'bg-orange-100 text-orange-700'}`}>
                    {pendingCount}
                  </span>
                )}
              </Link>
            )
          })}
        </div>

        {/* Transactions list */}
        {transactions.length === 0 ? (
          <div className="bg-white rounded-xl border border-border p-12 text-center">
            <FileText className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground text-sm">Inga transaktioner att visa</p>
            <Link href="/upload">
              <Button variant="outline" size="sm" className="mt-3">Ladda upp underlag</Button>
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-border overflow-hidden">
            {/* Table header */}
            <div className="hidden md:grid grid-cols-[1fr_auto_auto_auto_auto] gap-4 px-5 py-3 border-b border-border bg-secondary/30">
              <span className="text-xs font-medium text-muted-foreground">LEVERANTÖR</span>
              <span className="text-xs font-medium text-muted-foreground">DATUM</span>
              <span className="text-xs font-medium text-muted-foreground">KONTO</span>
              <span className="text-xs font-medium text-muted-foreground text-right">BELOPP</span>
              <span className="text-xs font-medium text-muted-foreground">STATUS</span>
            </div>

            <div className="divide-y divide-border">
              {transactions.map(tx => (
                <Link
                  key={tx.id}
                  href={`/transactions/${tx.id}`}
                  className="flex md:grid md:grid-cols-[1fr_auto_auto_auto_auto] items-center gap-4 px-5 py-4 hover:bg-secondary/30 transition-colors group"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm text-foreground">{tx.supplierName || 'Okänd leverantör'}</p>
                    <p className="text-xs text-muted-foreground truncate">{tx.document?.originalFileName}</p>
                  </div>
                  <span className="hidden md:block text-sm text-muted-foreground whitespace-nowrap">
                    {tx.date ? formatDate(tx.date) : '–'}
                  </span>
                  <span className="hidden md:block text-sm text-muted-foreground font-mono">
                    {tx.finalAccount || tx.suggestedAccount || '–'}
                  </span>
                  <span className="text-sm font-semibold text-right whitespace-nowrap">
                    {tx.grossAmount != null ? formatCurrency(tx.grossAmount, tx.currency) : '–'}
                  </span>
                  <div className="flex items-center gap-2">
                    <Badge variant={STATUS_VARIANTS[tx.status] || 'secondary'}>
                      {STATUS_LABELS[tx.status] || tx.status}
                    </Badge>
                    <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  )
}
