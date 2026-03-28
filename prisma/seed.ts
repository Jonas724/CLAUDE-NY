import { PrismaClient } from '../node_modules/.prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import pg from 'pg'
import bcrypt from 'bcryptjs'

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://bokforai:bokforai123@localhost:5432/bokforai_db',
})
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter } as never)

async function main() {
  console.log('🌱 Seeding database...')

  const company = await (prisma as any).company.upsert({
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
  console.log('✓ Company:', company.name)

  const passwordHash = await bcrypt.hash('demo1234', 12)
  const user = await (prisma as any).user.upsert({
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
  console.log('✓ User:', user.email)

  const sampleData = [
    {
      doc: { id: 'doc-001', fileUrl: '/uploads/sample.pdf', fileType: 'application/pdf', originalFileName: 'faktura_spotify_mars.pdf', status: 'REVIEWED', ocrText: 'Spotify AB faktura 495 SEK' },
      tx: { id: 'tx-001', date: new Date('2024-03-15'), supplierName: 'Spotify AB', description: 'Faktura från Spotify AB', grossAmount: 495.00, netAmount: 396.00, vatAmount: 99.00, currency: 'SEK', suggestedAccount: '6540', finalAccount: '6540', category: 'IT & Programvara', status: 'APPROVED', confidenceScore: 0.94, aiReasoningSummary: 'Streamingtjänst klassificeras som IT-kostnad (konto 6540).' },
    },
    {
      doc: { id: 'doc-002', fileUrl: '/uploads/sample.jpg', fileType: 'image/jpeg', originalFileName: 'kvitto_ikea_kontorsstol.jpg', status: 'REVIEWED', ocrText: 'IKEA kvitto 3739 SEK' },
      tx: { id: 'tx-002', date: new Date('2024-03-12'), supplierName: 'IKEA Sverige', description: 'Kvitto från IKEA Sverige', grossAmount: 3739.00, netAmount: 2991.20, vatAmount: 747.80, currency: 'SEK', suggestedAccount: '6110', finalAccount: null, category: 'Kontorsmaterial', status: 'AI_SUGGESTED', confidenceScore: 0.88, aiReasoningSummary: 'Kontorsinventarier och material bokförs på konto 6110.' },
    },
    {
      doc: { id: 'doc-003', fileUrl: '/uploads/sample.pdf', fileType: 'application/pdf', originalFileName: 'faktura_telia_mars.pdf', status: 'REVIEWED', ocrText: 'Telia Company AB 498.75 SEK' },
      tx: { id: 'tx-003', date: new Date('2024-03-15'), supplierName: 'Telia Company AB', description: 'Faktura från Telia', grossAmount: 498.75, netAmount: 399.00, vatAmount: 99.75, currency: 'SEK', suggestedAccount: '6210', finalAccount: '6210', category: 'Telefon & Internet', status: 'APPROVED', confidenceScore: 0.96, aiReasoningSummary: 'Telefonabonnemang bokförs på konto 6210.' },
    },
    {
      doc: { id: 'doc-004', fileUrl: '/uploads/sample.jpg', fileType: 'image/jpeg', originalFileName: 'kvitto_pressbyran.jpg', status: 'REVIEWED', ocrText: 'Pressbyrån kaffe 110 SEK' },
      tx: { id: 'tx-004', date: new Date('2024-03-20'), supplierName: 'Pressbyrån', description: 'Kvitto från Pressbyrån', grossAmount: 110.00, netAmount: 96.80, vatAmount: 13.20, currency: 'SEK', suggestedAccount: '6230', finalAccount: null, category: 'Representation', status: 'AI_SUGGESTED', confidenceScore: 0.82, aiReasoningSummary: 'Mat och dryck bokförs som representation (konto 6230).' },
    },
    {
      doc: { id: 'doc-005', fileUrl: '/uploads/sample.pdf', fileType: 'application/pdf', originalFileName: 'faktura_google_workspace.pdf', status: 'REVIEWED', ocrText: 'Google Workspace EUR 28.75' },
      tx: { id: 'tx-005', date: new Date('2024-03-01'), supplierName: 'Google Ireland Limited', description: 'Faktura från Google', grossAmount: 28.75, netAmount: 28.75, vatAmount: 0, currency: 'EUR', suggestedAccount: '6540', finalAccount: '6540', category: 'IT & Programvara', status: 'APPROVED', confidenceScore: 0.91, aiReasoningSummary: 'Molntjänst/SaaS-prenumeration klassificeras som IT-tjänst (konto 6540).' },
    },
  ]

  for (const { doc, tx } of sampleData) {
    const document = await (prisma as any).document.upsert({
      where: { id: doc.id },
      update: {},
      create: { ...doc, companyId: company.id },
    })
    await (prisma as any).transaction.upsert({
      where: { id: tx.id },
      update: {},
      create: { ...tx, companyId: company.id, documentId: document.id },
    })
  }

  console.log('✓ 5 sample transactions seeded')
  console.log('\n🎉 Done! Login: demo@bokforai.se / demo1234')
}

main().catch(console.error).finally(() => prisma.$disconnect())
