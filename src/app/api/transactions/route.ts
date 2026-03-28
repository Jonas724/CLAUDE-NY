import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getSessionFromRequest } from '@/lib/auth'

export async function GET(req: NextRequest) {
  const session = await getSessionFromRequest(req)
  if (!session || !session.companyId) return NextResponse.json({ error: 'Ej auktoriserad' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const status = searchParams.get('status')

  const where: Record<string, unknown> = { companyId: session.companyId }
  if (status) where.status = status

  const transactions = await prisma.transaction.findMany({
    where,
    include: { document: { select: { fileUrl: true, originalFileName: true } } },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json({ transactions })
}
