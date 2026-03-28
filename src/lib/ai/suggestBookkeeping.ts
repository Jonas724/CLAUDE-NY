/**
 * AI bookkeeping suggestion service.
 * Currently: rule-based mock logic that returns realistic Swedish BAS account suggestions.
 * Production: swap suggestBookkeeping() to call Anthropic API with structured output.
 */

import { ExtractedDocument } from './extractDocument'

export interface BookkeepingSuggestion {
  supplierName: string
  documentType: string
  date: string
  grossAmount: number
  netAmount: number
  vatAmount: number
  currency: string
  suggestedAccount: string
  category: string
  confidenceScore: number
  reasoningSummary: string
}

interface SupplierRule {
  keywords: string[]
  account: string
  category: string
  reasoning: string
}

// Rule-based supplier classification for Swedish small businesses
const SUPPLIER_RULES: SupplierRule[] = [
  {
    keywords: ['spotify', 'apple music', 'netflix', 'hbo', 'viaplay'],
    account: '6540',
    category: 'IT & Programvara',
    reasoning: 'Streamingtjänst klassificeras som IT-kostnad (konto 6540).',
  },
  {
    keywords: ['google', 'microsoft', 'adobe', 'dropbox', 'slack', 'notion', 'zoom', 'github'],
    account: '6540',
    category: 'IT & Programvara',
    reasoning: 'Molntjänst/SaaS-prenumeration klassificeras som IT-tjänst (konto 6540).',
  },
  {
    keywords: ['telia', 'telenor', 'tre', 'comviq', 'halebop', 'bredband'],
    account: '6210',
    category: 'Telefon & Internet',
    reasoning: 'Telefonabonnemang eller bredband bokförs på konto 6210.',
  },
  {
    keywords: ['ikea', 'kontorsmaterial', 'staples', 'office depot'],
    account: '6110',
    category: 'Kontorsmaterial',
    reasoning: 'Kontorsinventarier och material bokförs på konto 6110.',
  },
  {
    keywords: ['sj', 'flyg', 'airport', 'arlanda', 'uber', 'taxi', 'transport', 'resa'],
    account: '7321',
    category: 'Resor & Transport',
    reasoning: 'Resor och transport klassificeras under anställdas resekostnader (konto 7321).',
  },
  {
    keywords: ['restaurang', 'café', 'pressbyrån', '7-eleven', 'ica', 'coop', 'lunch', 'kaffe'],
    account: '6230',
    category: 'Representation',
    reasoning: 'Mat och dryck vid affärsmöte kan bokföras som avdragsgill representation (konto 6230). Max 300 kr exkl. moms per person.',
  },
  {
    keywords: ['facebook', 'instagram', 'linkedin', 'meta', 'google ads', 'reklam', 'annons'],
    account: '6420',
    category: 'Marknadsföring',
    reasoning: 'Annonsering och marknadsföring bokförs på konto 6420.',
  },
  {
    keywords: ['pwc', 'kpmg', 'deloitte', 'ey', 'fortnox', 'bokföring', 'revisor', 'redovisning'],
    account: '6530',
    category: 'Redovisning & Revision',
    reasoning: 'Redovisnings- och revisionstjänster bokförs på konto 6530.',
  },
  {
    keywords: ['hyra', 'lokalhyra', 'fastighet', 'kontor'],
    account: '5010',
    category: 'Lokalhyra',
    reasoning: 'Hyra för lokal eller kontor bokförs på konto 5010.',
  },
  {
    keywords: ['el', 'vattenfall', 'fortum', 'eon', 'värme', 'fjärrvärme'],
    account: '5020',
    category: 'El & Energi',
    reasoning: 'El, värme och energikostnader bokförs på konto 5020.',
  },
]

function classifySupplier(supplierName: string): SupplierRule {
  const nameLower = supplierName.toLowerCase()
  const match = SUPPLIER_RULES.find(rule =>
    rule.keywords.some(kw => nameLower.includes(kw))
  )
  return match ?? {
    keywords: [],
    account: '6990',
    category: 'Övriga kostnader',
    reasoning: 'Leverantören kunde inte klassificeras automatiskt. Vänligen kontrollera kontot manuellt.',
  }
}

function calculateConfidence(extracted: ExtractedDocument, rule: SupplierRule): number {
  let score = extracted.confidence

  // Penalize if no supplier match
  if (rule.account === '6990') score -= 0.15

  // Penalize if amounts look inconsistent
  if (extracted.grossAmount && extracted.netAmount && extracted.vatAmount) {
    const expectedGross = extracted.netAmount + extracted.vatAmount
    const diff = Math.abs(expectedGross - extracted.grossAmount) / extracted.grossAmount
    if (diff > 0.02) score -= 0.1
  }

  // Penalize unknown currency
  if (extracted.currency !== 'SEK' && extracted.currency !== 'EUR') score -= 0.05

  return Math.max(0.1, Math.min(1.0, score))
}

/**
 * Generate bookkeeping suggestion from extracted document data.
 */
export async function suggestBookkeeping(extracted: ExtractedDocument): Promise<BookkeepingSuggestion> {
  // Simulate AI processing time
  await new Promise(resolve => setTimeout(resolve, 600))

  const supplierName = extracted.supplierName ?? 'Okänd leverantör'
  const rule = classifySupplier(supplierName)
  const confidence = calculateConfidence(extracted, rule)

  return {
    supplierName,
    documentType: extracted.documentType,
    date: extracted.date ?? new Date().toISOString().split('T')[0],
    grossAmount: extracted.grossAmount ?? 0,
    netAmount: extracted.netAmount ?? 0,
    vatAmount: extracted.vatAmount ?? 0,
    currency: extracted.currency,
    suggestedAccount: rule.account,
    category: rule.category,
    confidenceScore: confidence,
    reasoningSummary: rule.reasoning,
  }
}

/*
 * NEXT STEP – Anthropic API integration:
 *
 * import Anthropic from '@anthropic-ai/sdk'
 * const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
 *
 * const response = await anthropic.messages.create({
 *   model: 'claude-opus-4-5',
 *   max_tokens: 1024,
 *   tools: [{ name: 'suggest_bookkeeping', input_schema: { ... } }],
 *   messages: [{
 *     role: 'user',
 *     content: `Du är en svensk bokföringsexpert. Analysera detta underlag och föreslå korrekt bokföring enligt BAS-kontoplanen.
 *     Underlag: ${JSON.stringify(extracted)}`
 *   }]
 * })
 */
