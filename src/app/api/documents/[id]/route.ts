import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getSessionFromRequest } from '@/lib/auth'

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSessionFromRequest(req)
  if (!session || !session.companyId) return NextResponse.json({ error: 'Ej auktoriserad' }, { status: 401 })

  const document = await prisma.document.findFirst({
    where: { id: params.id, companyId: session.companyId },
    include: { transaction: true },
  })

  if (!document) return NextResponse.json({ error: 'Dokument hittades inte' }, { status: 404 })

  return NextResponse.json({ document })
}
