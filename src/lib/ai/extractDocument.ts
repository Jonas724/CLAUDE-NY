/**
 * OCR extraction service.
 * Currently: mock implementation returning realistic extracted data.
 * Production: swap mockExtract() for a real OCR provider call
 *   (e.g. Google Document AI, Azure Form Recognizer, or Anthropic Vision).
 */

export interface ExtractedDocument {
  rawText: string
  supplierName: string | null
  documentType: 'invoice' | 'receipt' | 'unknown'
  date: string | null
  grossAmount: number | null
  netAmount: number | null
  vatAmount: number | null
  currency: string
  invoiceNumber: string | null
  confidence: number
}

const MOCK_DOCUMENTS: ExtractedDocument[] = [
  {
    rawText: 'FAKTURA\nLeverantör: Spotify AB\nFakturanr: INV-2024-0891\nDatum: 2024-03-15\nTjänst: Premium Business\nNetto: 396,00 SEK\nMoms 25%: 99,00 SEK\nTotalt: 495,00 SEK',
    supplierName: 'Spotify AB',
    documentType: 'invoice',
    date: '2024-03-15',
    grossAmount: 495.00,
    netAmount: 396.00,
    vatAmount: 99.00,
    currency: 'SEK',
    invoiceNumber: 'INV-2024-0891',
    confidence: 0.94,
  },
  {
    rawText: 'KVITTO\nIKEA Sverige\n2024-03-12 14:32\nKontorsstol MARKUS: 3 490,00\nSkrivlampa FORSÅ: 249,00\nMoms ingår (25%): 747,80\nTotalt: 3 739,00 SEK',
    supplierName: 'IKEA Sverige',
    documentType: 'receipt',
    date: '2024-03-12',
    grossAmount: 3739.00,
    netAmount: 2991.20,
    vatAmount: 747.80,
    currency: 'SEK',
    invoiceNumber: null,
    confidence: 0.88,
  },
  {
    rawText: 'FAKTURA\nGoogle Ireland Limited\nDate: 2024-03-01\nGoogle Workspace Business Starter\nQty 5 x EUR 5,75 = EUR 28,75\nVAT 0%: EUR 0,00\nTotal: EUR 28,75',
    supplierName: 'Google Ireland Limited',
    documentType: 'invoice',
    date: '2024-03-01',
    grossAmount: 28.75,
    netAmount: 28.75,
    vatAmount: 0,
    currency: 'EUR',
    invoiceNumber: null,
    confidence: 0.91,
  },
  {
    rawText: 'KVITTO\nPressbyrån Sthlm Central\n2024-03-20 09:15\nKaffe: 45 SEK\nSmörgås: 65 SEK\nMoms 12%: 13,20\nTotalt: 110,00 SEK',
    supplierName: 'Pressbyrån',
    documentType: 'receipt',
    date: '2024-03-20',
    grossAmount: 110.00,
    netAmount: 96.80,
    vatAmount: 13.20,
    currency: 'SEK',
    invoiceNumber: null,
    confidence: 0.82,
  },
  {
    rawText: 'FAKTURA\nTelia Company AB\nKundnummer: 5891234\nFakturanummer: 20240315-001\nPeriod: 2024-03-01 till 2024-03-31\nMobil Business 20GB: 399,00\nMoms 25%: 99,75\nSumma: 498,75 SEK',
    supplierName: 'Telia Company AB',
    documentType: 'invoice',
    date: '2024-03-15',
    grossAmount: 498.75,
    netAmount: 399.00,
    vatAmount: 99.75,
    currency: 'SEK',
    invoiceNumber: '20240315-001',
    confidence: 0.96,
  },
]

/**
 * Mock OCR extraction. Returns different results based on file name for demo variety.
 * Production: replace with actual OCR API call using fileUrl or fileBuffer.
 */
export async function extractDocument(
  fileUrl: string,
  fileType: string,
  fileName: string
): Promise<ExtractedDocument> {
  // Simulate processing delay
  await new Promise(resolve => setTimeout(resolve, 800))

  // Return deterministic mock based on filename hash for consistent demos
  const index = fileName.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0) % MOCK_DOCUMENTS.length
  return MOCK_DOCUMENTS[index]
}

/*
 * NEXT STEP – Real OCR integration:
 *
 * Option A: Anthropic Vision API
 *   const response = await anthropic.messages.create({
 *     model: 'claude-opus-4-5',
 *     messages: [{ role: 'user', content: [
 *       { type: 'image', source: { type: 'url', url: fileUrl } },
 *       { type: 'text', text: 'Extract all text and structured data from this receipt/invoice...' }
 *     ]}]
 *   })
 *
 * Option B: Google Document AI
 *   const client = new DocumentProcessorServiceClient()
 *   const [result] = await client.processDocument({ name: processorName, rawDocument: { content, mimeType } })
 *
 * Option C: Azure Form Recognizer
 *   const client = new DocumentAnalysisClient(endpoint, new AzureKeyCredential(key))
 *   const poller = await client.beginAnalyzeDocument('prebuilt-invoice', fileBuffer)
 */
