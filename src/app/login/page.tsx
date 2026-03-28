'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Sparkles, Eye, EyeOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function LoginPage() {
  const router = useRouter()
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const endpoint = mode === 'login' ? '/api/auth/login' : '/api/auth/register'
      const body = mode === 'login' ? { email, password } : { name, email, password }

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Något gick fel')
        return
      }

      // Redirect based on company
      if (data.user.companyId) {
        router.push('/dashboard')
      } else {
        router.push('/onboarding')
      }
      router.refresh()
    } catch {
      setError('Nätverksfel. Försök igen.')
    } finally {
      setLoading(false)
    }
  }

  // Demo login shortcut
  async function demoLogin() {
    setEmail('demo@bokforai.se')
    setPassword('demo1234')
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'demo@bokforai.se', password: 'demo1234' }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error); return }
      if (data.user.companyId) router.push('/dashboard')
      else router.push('/onboarding')
      router.refresh()
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left panel - branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary to-indigo-800 flex-col justify-between p-12 text-white">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20">
            <Sparkles className="h-6 w-6" />
          </div>
          <span className="text-xl font-bold">BokförAI</span>
        </div>
        <div className="space-y-6">
          <h2 className="text-4xl font-bold leading-tight">
            Smart bokföring<br />för dig som driver<br />eget företag
          </h2>
          <p className="text-indigo-200 text-lg leading-relaxed">
            Ladda upp ditt kvitto eller din faktura – AI:n sköter resten. 
            Ingen bokföringskunskap behövs.
          </p>
          <div className="space-y-3">
            {[
              'Automatisk utläsning av kvitton & fakturor',
              'AI föreslår rätt konto i BAS-kontoplanen',
              'Godkänn med ett klick – klart!',
            ].map(feature => (
              <div key={feature} className="flex items-center gap-3">
                <div className="h-5 w-5 rounded-full bg-white/20 flex items-center justify-center text-xs">✓</div>
                <span className="text-indigo-100">{feature}</span>
              </div>
            ))}
          </div>
        </div>
        <p className="text-indigo-300 text-sm">© 2024 BokförAI – Smart bokföring för Sverige</p>
      </div>

      {/* Right panel - form */}
      <div className="flex flex-1 items-center justify-center p-8 bg-[#f8f9fc]">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="flex items-center gap-3 mb-8 lg:hidden">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold">BokförAI</span>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-border p-8">
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-foreground">
                {mode === 'login' ? 'Välkommen tillbaka' : 'Skapa konto'}
              </h1>
              <p className="text-muted-foreground mt-1">
                {mode === 'login'
                  ? 'Logga in för att fortsätta'
                  : 'Kom igång gratis idag'}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === 'register' && (
                <div className="space-y-1.5">
                  <Label htmlFor="name">Ditt namn</Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="Anna Svensson"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    required
                  />
                </div>
              )}

              <div className="space-y-1.5">
                <Label htmlFor="email">E-postadress</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="anna@exempel.se"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="password">Lösenord</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {error && (
                <p className="text-sm text-destructive bg-red-50 rounded-lg px-3 py-2">{error}</p>
              )}

              <Button type="submit" className="w-full" loading={loading}>
                {mode === 'login' ? 'Logga in' : 'Skapa konto'}
              </Button>
            </form>

            <div className="mt-4">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-2 text-muted-foreground">eller</span>
                </div>
              </div>
              <Button variant="outline" className="w-full mt-4" onClick={demoLogin} loading={loading}>
                Prova demo-konto
              </Button>
            </div>

            <p className="text-center text-sm text-muted-foreground mt-6">
              {mode === 'login' ? 'Inget konto? ' : 'Har du redan konto? '}
              <button
                className="text-primary font-medium hover:underline"
                onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError('') }}
              >
                {mode === 'login' ? 'Skapa konto' : 'Logga in'}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
