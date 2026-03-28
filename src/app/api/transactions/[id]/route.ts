import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getSessionFromRequest } from '@/lib/auth'

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSessionFromRequest(req)
  if (!session || !session.companyId) return NextResponse.json({ error: 'Ej auktoriserad' }, { status: 401 })

  const transaction = await prisma.transaction.findFirst({
    where: { id: params.id, companyId: session.companyId },
    include: { document: true },
  })

  if (!transaction) return NextResponse.json({ error: 'Transaktion hittades inte' }, { status: 404 })

  return NextResponse.json({ transaction })
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSessionFromRequest(req)
  if (!session || !session.companyId) return NextResponse.json({ error: 'Ej auktoriserad' }, { status: 401 })

  try {
    const data = await req.json()

    const existing = await prisma.transaction.findFirst({
      where: { id: params.id, companyId: session.companyId },
    })
    if (!existing) return NextResponse.json({ error: 'Transaktion hittades inte' }, { status: 404 })

    const transaction = await prisma.transaction.update({
      where: { id: params.id },
      data: {
        ...data,
        date: data.date ? new Date(data.date) : undefined,
        updatedAt: new Date(),
      },
    })

    // Log the change
    await prisma.auditLog.create({
      data: {
        userId: session.id,
        transactionId: params.id,
        action: data.status === 'APPROVED' ? 'APPROVED' : 'EDITED',
        oldValue: existing as unknown as never,
        newValue: data as unknown as never,
      },
    })

    return NextResponse.json({ transaction })
  } catch (error) {
    console.error('Transaction update error:', error)
    return NextResponse.json({ error: 'Serverfel' }, { status: 500 })
  }
}
