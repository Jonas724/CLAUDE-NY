/**
 * AI insights generation service.
 * Currently: mock insights based on transaction data patterns.
 * Production: replace with Anthropic API call for dynamic analysis.
 */

export interface AiInsight {
  id: string
  type: 'tip' | 'warning' | 'info' | 'success'
  title: string
  description: string
  action?: string
  actionUrl?: string
}

export interface DashboardStats {
  totalExpensesThisMonth: number
  totalIncomeThisMonth: number
  vatEstimate: number
  pendingReviewCount: number
  approvedCount: number
  totalDocuments: number
}

export async function generateInsights(stats: DashboardStats): Promise<AiInsight[]> {
  await new Promise(resolve => setTimeout(resolve, 300))

  const insights: AiInsight[] = []

  // VAT reminder
  if (stats.vatEstimate > 0) {
    insights.push({
      id: 'vat-reminder',
      type: 'info',
      title: 'Momsdekl. nästa månad',
      description: `Du har ungefär ${Math.round(stats.vatEstimate).toLocaleString('sv-SE')} SEK i ingående moms att rapportera.`,
      action: 'Granska transaktioner',
      actionUrl: '/transactions',
    })
  }

  // Pending review alert
  if (stats.pendingReviewCount > 3) {
    insights.push({
      id: 'pending-alert',
      type: 'warning',
      title: `${stats.pendingReviewCount} underlag väntar`,
      description: 'Granska och godkänn dina AI-förslag för att hålla bokföringen aktuell.',
      action: 'Granska nu',
      actionUrl: '/transactions?status=AI_SUGGESTED',
    })
  }

  // Spending trend
  if (stats.totalExpensesThisMonth > 10000) {
    insights.push({
      id: 'spending-trend',
      type: 'tip',
      title: 'Månadens kostnader',
      description: `Dina kostnader denna månad är ${Math.round(stats.totalExpensesThisMonth).toLocaleString('sv-SE')} SEK. Jämför med förra månaden för att se trender.`,
    })
  }

  // All caught up
  if (stats.pendingReviewCount === 0 && stats.totalDocuments > 0) {
    insights.push({
      id: 'all-good',
      type: 'success',
      title: 'Allt är uppfört!',
      description: 'Inga underlag väntar på granskning. Bra jobbat – bokföringen är à jour.',
    })
  }

  // First upload encouragement
  if (stats.totalDocuments === 0) {
    insights.push({
      id: 'first-upload',
      type: 'tip',
      title: 'Ladda upp ditt första underlag',
      description: 'Fotografera ett kvitto eller ladda upp en faktura så sköter AI:n resten.',
      action: 'Ladda upp',
      actionUrl: '/upload',
    })
  }

  return insights
}

/*
 * NEXT STEP – Anthropic API for dynamic insights:
 *
 * const prompt = `
 *   Analysera dessa bokföringsdata för ett svenskt litet företag och ge 3-4 praktiska insikter:
 *   - Kostnader denna månad: ${stats.totalExpensesThisMonth} SEK
 *   - Inkomster: ${stats.totalIncomeThisMonth} SEK
 *   - Moms att redovisa: ${stats.vatEstimate} SEK
 *   Svara på svenska och var konkret.
 * `
 */
