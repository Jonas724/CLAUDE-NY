import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getSessionFromRequest, createToken } from '@/lib/auth'
import { cookies } from 'next/headers'
import { SignJWT } from 'jose'

export async function POST(req: NextRequest) {
  const session = await getSessionFromRequest(req)
  if (!session) return NextResponse.json({ error: 'Ej auktoriserad' }, { status: 401 })

  try {
    const { name, orgNumber, vatType, accountingMethod } = await req.json()

    if (!name) {
      return NextResponse.json({ error: 'Företagsnamn krävs' }, { status: 400 })
    }

    const company = await prisma.company.create({
      data: { name, orgNumber: orgNumber || null, vatType, accountingMethod },
    })

    // Link user to company
    await prisma.user.update({
      where: { id: session.id },
      data: { companyId: company.id },
    })

    // Re-issue token with companyId
    const newToken = await createToken({ ...session, companyId: company.id })
    const response = NextResponse.json({ company })
    response.cookies.set('auth-token', newToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    })
    return response
  } catch (error) {
    console.error('Company create error:', error)
    return NextResponse.json({ error: 'Serverfel' }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  const session = await getSessionFromRequest(req)
  if (!session) return NextResponse.json({ error: 'Ej auktoriserad' }, { status: 401 })
  if (!session.companyId) return NextResponse.json({ company: null })

  const company = await prisma.company.findUnique({ where: { id: session.companyId } })
  return NextResponse.json({ company })
}

export async function PATCH(req: NextRequest) {
  const session = await getSessionFromRequest(req)
  if (!session || !session.companyId) return NextResponse.json({ error: 'Ej auktoriserad' }, { status: 401 })

  try {
    const data = await req.json()
    const company = await prisma.company.update({
      where: { id: session.companyId },
      data,
    })
    return NextResponse.json({ company })
  } catch (error) {
    return NextResponse.json({ error: 'Serverfel' }, { status: 500 })
  }
}
