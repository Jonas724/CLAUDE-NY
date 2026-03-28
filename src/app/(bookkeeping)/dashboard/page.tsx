import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getSession } from '@/lib/auth'
import { Header } from '@/components/layout/Header'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  TrendingDown, TrendingUp, Clock, CheckCircle2,
  Upload, Lightbulb, AlertTriangle, Info, ArrowRight,
  FileText, Sparkles
} from 'lucide-react'
import { formatCurrency, formatDate } from '@/lib/utils'

interface DashboardStats {
  totalExpensesThisMonth: number
  totalIncomeThisMonth: number
  vatEstimate: number
  pendingReviewCount: number
  approvedCount: number
  totalDocuments: number
}

interface AiInsight {
  id: string
  type: 'tip' | 'warning' | 'info' | 'success'
  title: string
  description: string
  action?: string
  actionUrl?: string
}

interface RecentDocument {
  id: string
  originalFileName: string
  status: string
  uploadedAt: string | Date
  transaction: { status: string; grossAmount: number | null } | null
}

async function getDashboardData(companyId: string) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    // Direct DB query instead of fetch to avoid circular auth in server component
    const { prisma } = await import('@/lib/db')
    const { generateInsights } = await import('@/lib/ai/generateInsights')

    const now = new Date()
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0)

    const [transactions, pendingCount, totalDocs, recentDocuments] = await Promise.all([
      prisma.transaction.findMany({
        where: { companyId, status: 'APPROVED', date: { gte: monthStart, lte: monthEnd } },
      }),
      prisma.transaction.count({ where: { companyId, status: 'AI_SUGGESTED' } }),
      prisma.document.count({ where: { companyId } }),
      prisma.document.findMany({
        where: { companyId },
        orderBy: { uploadedAt: 'desc' },
        take: 5,
        include: { transaction: { select: { status: true, grossAmount: true } } },
      }),
    ])

    const expenses = transactions.reduce((s, t) => s + (t.grossAmount ?? 0), 0)
    const vatAmount = transactions.reduce((s, t) => s + (t.vatAmount ?? 0), 0)

    const stats: DashboardStats = {
      totalExpensesThisMonth: expenses,
      totalIncomeThisMonth: 0,
      vatEstimate: vatAmount,
      pendingReviewCount: pendingCount,
      approvedCount: transactions.length,
      totalDocuments: totalDocs,
    }

    const insights = await generateInsights(stats)
    return { stats, insights, recentDocuments }
  } catch {
    return {
      stats: { totalExpensesThisMonth: 0, totalIncomeThisMonth: 0, vatEstimate: 0, pendingReviewCount: 0, approvedCount: 0, totalDocuments: 0 },
      insights: [],
      recentDocuments: [],
    }
  }
}

const statusConfig: Record<string, { label: string; variant: 'success' | 'warning' | 'info' | 'secondary' | 'destructive' }> = {
  APPROVED: { label: 'Godkänd', variant: 'success' },
  AI_SUGGESTED: { label: 'Väntar', variant: 'warning' },
  DRAFT: { label: 'Utkast', variant: 'secondary' },
  EDITED: { label: 'Redigerad', variant: 'info' },
  REJECTED: { label: 'Avvisad', variant: 'destructive' },
}

const insightIcon: Record<string, React.ElementType> = {
  tip: Lightbulb,
  warning: AlertTriangle,
  info: Info,
  success: CheckCircle2,
}

const insightColors: Record<string, string> = {
  tip: 'bg-blue-50 border-blue-100 text-blue-700',
  warning: 'bg-yellow-50 border-yellow-100 text-yellow-700',
  info: 'bg-indigo-50 border-indigo-100 text-indigo-700',
  success: 'bg-green-50 border-green-100 text-green-700',
}

export default async function DashboardPage() {
  const session = await getSession()
  if (!session?.companyId) redirect('/onboarding')

  const { stats, insights, recentDocuments } = await getDashboardData(session.companyId)

  const statCards = [
    {
      label: 'Kostnader denna månad',
      value: formatCurrency(stats.totalExpensesThisMonth),
      icon: TrendingDown,
      iconColor: 'text-red-500',
      iconBg: 'bg-red-50',
      description: 'Godkända transaktioner',
    },
    {
      label: 'Inkomster denna månad',
      value: formatCurrency(stats.totalIncomeThisMonth),
      icon: TrendingUp,
      iconColor: 'text-green-500',
      iconBg: 'bg-green-50',
      description: 'Fakturerade belopp',
    },
    {
      label: 'Ingående moms',
      value: formatCurrency(stats.vatEstimate),
      icon: Sparkles,
      iconColor: 'text-indigo-500',
      iconBg: 'bg-indigo-50',
      description: 'Att redovisa',
    },
    {
      label: 'Väntar på granskning',
      value: stats.pendingReviewCount.toString(),
      icon: Clock,
      iconColor: 'text-orange-500',
      iconBg: 'bg-orange-50',
      description: 'AI-förslag att godkänna',
      href: '/transactions?status=AI_SUGGESTED',
    },
  ]

  return (
    <>
      <Header
        title="Instrumentpanel"
        description={`Hej ${session.name} — här är en översikt av ditt företag`}
        action={
          <Link href="/upload">
            <Button size="sm">
              <Upload className="h-4 w-4 mr-1" />
              Ladda upp
            </Button>
          </Link>
        }
      />

      <div className="flex-1 p-6 space-y-6">
        {/* Stats grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {statCards.map(card => {
            const Icon = card.icon
            const content = (
              <div className="bg-white rounded-xl border border-border p-5 hover:shadow-sm transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-sm text-muted-foreground">{card.label}</p>
                    <p className="text-2xl font-bold mt-1 text-foreground">{card.value}</p>
                    <p className="text-xs text-muted-foreground mt-1">{card.description}</p>
                  </div>
                  <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${card.iconBg}`}>
                    <Icon className={`h-5 w-5 ${card.iconColor}`} />
                  </div>
                </div>
              </div>
            )
            return card.href ? (
              <Link key={card.label} href={card.href}>{content}</Link>
            ) : (
              <div key={card.label}>{content}</div>
            )
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* AI Insights */}
          <div className="lg:col-span-1 space-y-3">
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="h-4 w-4 text-primary" />
              <h2 className="font-semibold text-sm">AI-insikter</h2>
            </div>
            {insights.length === 0 ? (
              <div className="bg-white rounded-xl border border-border p-5 text-center text-muted-foreground text-sm">
                Inga insikter just nu.
              </div>
            ) : (
              insights.map((insight: AiInsight) => {
                const Icon = insightIcon[insight.type] || Lightbulb
                return (
                  <div
                    key={insight.id}
                    className={`rounded-xl border p-4 ${insightColors[insight.type]}`}
                  >
                    <div className="flex items-start gap-3">
                      <Icon className="h-4 w-4 mt-0.5 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm">{insight.title}</p>
                        <p className="text-xs mt-0.5 opacity-80 leading-relaxed">{insight.description}</p>
                        {insight.action && insight.actionUrl && (
                          <Link href={insight.actionUrl} className="text-xs font-medium underline mt-1 inline-block">
                            {insight.action} →
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })
            )}
          </div>

          {/* Recent Documents */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl border border-border">
              <div className="flex items-center justify-between px-5 py-4 border-b border-border">
                <h2 className="font-semibold text-sm">Senaste underlag</h2>
                <Link href="/documents" className="text-xs text-primary hover:underline flex items-center gap-1">
                  Se alla <ArrowRight className="h-3 w-3" />
                </Link>
              </div>

              {recentDocuments.length === 0 ? (
                <div className="p-8 text-center">
                  <FileText className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground">Inga underlag uppladdade ännu</p>
                  <Link href="/upload">
                    <Button size="sm" variant="outline" className="mt-3">
                      <Upload className="h-3 w-3 mr-1" />
                      Ladda upp ditt första underlag
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {recentDocuments.map((doc: RecentDocument) => {
                    const txStatus = doc.transaction?.status
                    const statusInfo = txStatus ? statusConfig[txStatus] : null
                    return (
                      <Link
                        key={doc.id}
                        href={doc.transaction ? `/transactions/${doc.transaction ? 'review' : ''}` : `/documents`}
                        className="flex items-center gap-4 px-5 py-3.5 hover:bg-secondary/50 transition-colors group"
                      >
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-secondary shrink-0">
                          <FileText className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{doc.originalFileName}</p>
                          <p className="text-xs text-muted-foreground">{formatDate(doc.uploadedAt)}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          {doc.transaction?.grossAmount && (
                            <span className="text-sm font-medium">
                              {formatCurrency(doc.transaction.grossAmount)}
                            </span>
                          )}
                          {statusInfo && (
                            <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
                          )}
                          <ArrowRight className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                      </Link>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
