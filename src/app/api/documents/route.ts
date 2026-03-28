import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { prisma } from '@/lib/db'
import { getSessionFromRequest } from '@/lib/auth'
import { extractDocument } from '@/lib/ai/extractDocument'
import { suggestBookkeeping } from '@/lib/ai/suggestBookkeeping'

export async function GET(req: NextRequest) {
  const session = await getSessionFromRequest(req)
  if (!session || !session.companyId) return NextResponse.json({ error: 'Ej auktoriserad' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const status = searchParams.get('status')

  const where: Record<string, unknown> = { companyId: session.companyId }
  if (status) where.status = status

  const documents = await prisma.document.findMany({
    where,
    include: { transaction: true },
    orderBy: { uploadedAt: 'desc' },
  })

  return NextResponse.json({ documents })
}

export async function POST(req: NextRequest) {
  const session = await getSessionFromRequest(req)
  if (!session || !session.companyId) return NextResponse.json({ error: 'Ej auktoriserad' }, { status: 401 })

  try {
    const formData = await req.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json({ error: 'Ingen fil bifogad' }, { status: 400 })
    }

    // Store file locally (production: use S3/Cloudflare R2)
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const uploadsDir = join(process.cwd(), 'public', 'uploads')
    await mkdir(uploadsDir, { recursive: true })

    const timestamp = Date.now()
    const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_')
    const fileName = `${timestamp}_${safeName}`
    const filePath = join(uploadsDir, fileName)
    await writeFile(filePath, buffer)

    const fileUrl = `/uploads/${fileName}`

    // Create document record
    const document = await prisma.document.create({
      data: {
        companyId: session.companyId,
        fileUrl,
        fileType: file.type,
        originalFileName: file.name,
        status: 'PROCESSING',
      },
    })

    // Run OCR + AI suggestion pipeline asynchronously
    // In production: push to a queue (e.g. BullMQ, AWS SQS)
    processDocument(document.id, fileUrl, file.type, file.name, session.id).catch(console.error)

    return NextResponse.json({ document }, { status: 201 })
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json({ error: 'Uppladdning misslyckades' }, { status: 500 })
  }
}

async function processDocument(
  documentId: string,
  fileUrl: string,
  fileType: string,
  fileName: string,
  userId: string
) {
  try {
    // Step 1: OCR extraction
    const extracted = await extractDocument(fileUrl, fileType, fileName)

    // Step 2: AI bookkeeping suggestion
    const suggestion = await suggestBookkeeping(extracted)

    // Step 3: Update document with extracted data
    await prisma.document.update({
      where: { id: documentId },
      data: {
        status: 'REVIEWED',
        ocrText: extracted.rawText,
        extractedJson: JSON.parse(JSON.stringify(extracted)),
      },
    })

    // Step 4: Create transaction with AI suggestion
    const doc = await prisma.document.findUnique({ where: { id: documentId } })
    if (!doc) return

    await prisma.transaction.create({
      data: {
        companyId: doc.companyId,
        documentId,
        date: new Date(suggestion.date),
        supplierName: suggestion.supplierName,
        description: `${suggestion.documentType === 'invoice' ? 'Faktura' : 'Kvitto'} från ${suggestion.supplierName}`,
        grossAmount: suggestion.grossAmount,
        netAmount: suggestion.netAmount,
        vatAmount: suggestion.vatAmount,
        currency: suggestion.currency,
        suggestedAccount: suggestion.suggestedAccount,
        category: suggestion.category,
        status: 'AI_SUGGESTED',
        confidenceScore: suggestion.confidenceScore,
        aiReasoningSummary: suggestion.reasoningSummary,
      },
    })
  } catch (error) {
    console.error('Process document error:', error)
    await prisma.document.update({
      where: { id: documentId },
      data: { status: 'FAILED' },
    }).catch(() => {})
  }
}
