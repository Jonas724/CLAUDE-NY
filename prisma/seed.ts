import { PrismaClient } from '../node_modules/.prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Create demo company
  const company = await prisma.company.upsert({
    where: { id: 'demo-company-001' },
    update: {},
    create: {
      id: 'demo-company-001',
      name: 'Demo Företag AB',
      orgNumber: '556789-1234',
      vatType: 'STANDARD',
      accountingMethod: 'ACCRUAL',
      baseCurrency: 'SEK',
    },
  })

  console.log('✓ Company created:', company.name)

  // Create demo user
  const passwordHash = await bcrypt.hash('demo1234', 12)
  const user = await prisma.user.upsert({
    where: { email: 'demo@bokforai.se' },
    update: { passwordHash, companyId: company.id },
    create: {
      email: 'demo@bokforai.se',
      name: 'Anna Demo',
      passwordHash,
      role: 'ADMIN',
      companyId: company.id,
    },
  })

  console.log('✓ User created:', user.email)

  // Sample documents + transactions
  const sampleData = [
    {
      doc: {
        id: 'doc-001',
        fileUrl: '/uploads/sample_invoice_spotify.pdf',
        fileType: 'application/pdf',
        originalFileName: 'faktura_spotify_mars.pdf',
        status: 'REVIEWED' as const,
        ocrText: 'FAKTURA\nSpotify AB\nINV-2024-0891\n2024-03-15\nNetto: 396,00 SEK\nMoms 25%: 99,00 SEK\nTotalt: 495,00 SEK',
      },
      tx: {
        id: 'tx-001',
        date: new Date('2024-03-15'),
        supplierName: 'Spotify AB',
        description: 'Faktura från Spotify AB',
        grossAmount: 495.00,
        netAmount: 396.00,
        vatAmount: 99.00,
        currency: 'SEK',
        suggestedAccount: '6540',
        finalAccount: '6540',
        category: 'IT & Programvara',
        status: 'APPROVED' as const,
        confidenceScore: 0.94,
        aiReasoningSummary: 'Streamingtjänst klassificeras som IT-kostnad (konto 6540).',
      },
    },
    {
      doc: {
        id: 'doc-002',
        fileUrl: '/uploads/sample_receipt_ikea.jpg',
        fileType: 'image/jpeg',
        originalFileName: 'kvitto_ikea_kontorsstol.jpg',
        status: 'REVIEWED' as const,
        ocrText: 'KVITTO\nIKEA Sverige\n2024-03-12\nKontorsstol MARKUS: 3490\nMoms: 747,80\nTotalt: 3739,00 SEK',
      },
      tx: {
        id: 'tx-002',
        date: new Date('2024-03-12'),
        supplierName: 'IKEA Sverige',
        description: 'Kvitto från IKEA Sverige',
        grossAmount: 3739.00,
        netAmount: 2991.20,
        vatAmount: 747.80,
        currency: 'SEK',
        suggestedAccount: '6110',
        finalAccount: null,
        category: 'Kontorsmaterial',
        status: 'AI_SUGGESTED' as const,
        confidenceScore: 0.88,
        aiReasoningSummary: 'Kontorsinventarier och material bokförs på konto 6110.',
      },
    },
    {
      doc: {
        id: 'doc-003',
        fileUrl: '/uploads/sample_invoice_telia.pdf',
        fileType: 'application/pdf',
        originalFileName: 'faktura_telia_mars.pdf',
        status: 'REVIEWED' as const,
        ocrText: 'FAKTURA\nTelia Company AB\n20240315-001\nMobil Business 20GB: 399,00\nMoms 25%: 99,75\nSumma: 498,75 SEK',
      },
      tx: {
        id: 'tx-003',
        date: new Date('2024-03-15'),
        supplierName: 'Telia Company AB',
        description: 'Faktura från Telia Company AB',
        grossAmount: 498.75,
        netAmount: 399.00,
        vatAmount: 99.75,
        currency: 'SEK',
        suggestedAccount: '6210',
        finalAccount: '6210',
        category: 'Telefon & Internet',
        status: 'APPROVED' as const,
        confidenceScore: 0.96,
        aiReasoningSummary: 'Telefonabonnemang eller bredband bokförs på konto 6210.',
      },
    },
    {
      doc: {
        id: 'doc-004',
        fileUrl: '/uploads/sample_receipt_pressbyran.jpg',
        fileType: 'image/jpeg',
        originalFileName: 'kvitto_pressbyran_kaffe.jpg',
        status: 'REVIEWED' as const,
        ocrText: 'KVITTO\nPressbyrån\n2024-03-20\nKaffe: 45 SEK\nSmörgås: 65 SEK\nMoms 12%: 13,20\nTotalt: 110,00 SEK',
      },
      tx: {
        id: 'tx-004',
        date: new Date('2024-03-20'),
        supplierName: 'Pressbyrån',
        description: 'Kvitto från Pressbyrån',
        grossAmount: 110.00,
        netAmount: 96.80,
        vatAmount: 13.20,
        currency: 'SEK',
        suggestedAccount: '6230',
        finalAccount: null,
        category: 'Representation',
        status: 'AI_SUGGESTED' as const,
        confidenceScore: 0.82,
        aiReasoningSummary: 'Mat och dryck vid affärsmöte kan bokföras som avdragsgill representation (konto 6230). Max 300 kr exkl. moms per person.',
      },
    },
    {
      doc: {
        id: 'doc-005',
        fileUrl: '/uploads/sample_invoice_google.pdf',
        fileType: 'application/pdf',
        originalFileName: 'faktura_google_workspace.pdf',
        status: 'REVIEWED' as const,
        ocrText: 'INVOICE\nGoogle Ireland Limited\n2024-03-01\nGoogle Workspace Business\nTotal: EUR 28.75',
      },
      tx: {
        id: 'tx-005',
        date: new Date('2024-03-01'),
        supplierName: 'Google Ireland Limited',
        description: 'Faktura från Google Ireland Limited',
        grossAmount: 28.75,
        netAmount: 28.75,
        vatAmount: 0,
        currency: 'EUR',
        suggestedAccount: '6540',
        finalAccount: '6540',
        category: 'IT & Programvara',
        status: 'APPROVED' as const,
        confidenceScore: 0.91,
        aiReasoningSummary: 'Molntjänst/SaaS-prenumeration klassificeras som IT-tjänst (konto 6540).',
      },
    },
  ]

  for (const { doc, tx } of sampleData) {
    const document = await prisma.document.upsert({
      where: { id: doc.id },
      update: {},
      create: { ...doc, companyId: company.id },
    })

    await prisma.transaction.upsert({
      where: { id: tx.id },
      update: {},
      create: {
        ...tx,
        companyId: company.id,
        documentId: document.id,
      },
    })
  }

  console.log('✓ Sample documents and transactions created')
  console.log('')
  console.log('🎉 Seed complete!')
  console.log('')
  console.log('Demo credentials:')
  console.log('  Email:    demo@bokforai.se')
  console.log('  Password: demo1234')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
