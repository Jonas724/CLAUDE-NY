import { SignJWT, jwtVerify } from 'jose'
import { cookies } from 'next/headers'
import { NextRequest } from 'next/server'

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'dev-jwt-secret-bookkeeping-2024'
)

export interface SessionUser {
  id: string
  email: string
  name: string
  role: string
  companyId: string | null
}

export async function createToken(user: SessionUser): Promise<string> {
  return await new SignJWT({ ...user })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(JWT_SECRET)
}

export async function verifyToken(token: string): Promise<SessionUser | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET)
    return payload as unknown as SessionUser
  } catch {
    return null
  }
}

export async function getSession(): Promise<SessionUser | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get('auth-token')?.value
  if (!token) return null
  return verifyToken(token)
}

export async function getSessionFromRequest(req: NextRequest): Promise<SessionUser | null> {
  const token = req.cookies.get('auth-token')?.value
  if (!token) return null
  return verifyToken(token)
}

// Swedish BAS account chart suggestions
export const BAS_ACCOUNTS: Record<string, { account: string; name: string }> = {
  'mat_dryck': { account: '6230', name: 'Representation, avdragsgill' },
  'kontorsmaterial': { account: '6110', name: 'Kontorsmaterial' },
  'tele_internet': { account: '6210', name: 'Telefon och internetabonnemang' },
  'resa_transport': { account: '7310', name: 'Resekostnader, anställda' },
  'programvara': { account: '6540', name: 'IT-tjänster' },
  'marknadsföring': { account: '6420', name: 'Annonsering och reklam' },
  'bokföring_revision': { account: '6530', name: 'Redovisningskonsult och revision' },
  'hyra_lokal': { account: '5010', name: 'Lokalhyra' },
  'el_vatten': { account: '5020', name: 'El, värme, vatten' },
  'övrigt': { account: '6990', name: 'Övriga externa tjänster' },
}
