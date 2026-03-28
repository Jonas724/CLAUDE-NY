import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getSessionFromRequest } from '@/lib/auth'
import { generateInsights } from '@/lib/ai/generateInsights'

export async function GET(req: NextRequest) {
  const session = await getSessionFromRequest(req)
  if (!session || !session.companyId) return NextResponse.json({ error: 'Ej auktoriserad' }, { status: 401 })

  const companyId = session.companyId

  // Date range for current month
  const now = new Date()
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0)

  const [transactions, pendingCount, documents, recentDocuments] = await Promise.all([
    prisma.transaction.findMany({
      where: {
        companyId,
        status: 'APPROVED',
        date: { gte: monthStart, lte: monthEnd },
      },
    }),
    prisma.transaction.count({
      where: { companyId, status: 'AI_SUGGESTED' },
    }),
    prisma.document.count({ where: { companyId } }),
    prisma.document.findMany({
      where: { companyId },
      orderBy: { uploadedAt: 'desc' },
      take: 5,
      include: { transaction: { select: { status: true, grossAmount: true } } },
    }),
  ])

  const expenses = transactions
    .filter(t => (t.grossAmount ?? 0) > 0)
    .reduce((sum, t) => sum + (t.grossAmount ?? 0), 0)

  const vatAmount = transactions
    .reduce((sum, t) => sum + (t.vatAmount ?? 0), 0)

  const stats = {
    totalExpensesThisMonth: expenses,
    totalIncomeThisMonth: 0, // Expand when income tracking is added
    vatEstimate: vatAmount,
    pendingReviewCount: pendingCount,
    approvedCount: transactions.length,
    totalDocuments: documents,
  }

  const insights = await generateInsights(stats)

  return NextResponse.json({ stats, insights, recentDocuments })
}
