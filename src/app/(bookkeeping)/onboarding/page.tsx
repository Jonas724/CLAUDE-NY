'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Sparkles, Building2, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const steps = [
  { id: 1, title: 'Välkommen' },
  { id: 2, title: 'Ditt företag' },
  { id: 3, title: 'Klart!' },
]

export default function OnboardingPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [companyName, setCompanyName] = useState('')
  const [orgNumber, setOrgNumber] = useState('')
  const [vatType, setVatType] = useState('STANDARD')
  const [accountingMethod, setAccountingMethod] = useState('ACCRUAL')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleCreateCompany() {
    if (!companyName) { setError('Företagsnamn krävs'); return }
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/companies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: companyName, orgNumber, vatType, accountingMethod }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Något gick fel'); return }
      setStep(3)
    } catch {
      setError('Nätverksfel. Försök igen.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#f8f9fc] flex items-center justify-center p-6">
      <div className="w-full max-w-lg">
        {/* Logo */}
        <div className="flex items-center gap-3 mb-8 justify-center">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary">
            <Sparkles className="h-6 w-6 text-white" />
          </div>
          <span className="text-xl font-bold">BokförAI</span>
        </div>

        {/* Progress */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {steps.map((s, i) => (
            <div key={s.id} className="flex items-center gap-2">
              <div className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold transition-colors ${
                step > s.id ? 'bg-green-500 text-white' :
                step === s.id ? 'bg-primary text-white' :
                'bg-secondary text-muted-foreground'
              }`}>
                {step > s.id ? '✓' : s.id}
              </div>
              <span className={`text-sm hidden sm:block ${step === s.id ? 'font-medium text-foreground' : 'text-muted-foreground'}`}>
                {s.title}
              </span>
              {i < steps.length - 1 && <div className="w-8 h-px bg-border mx-1" />}
            </div>
          ))}
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-border p-8">
          {/* Step 1: Welcome */}
          {step === 1 && (
            <div className="text-center space-y-6">
              <div className="flex justify-center">
                <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center">
                  <Sparkles className="h-8 w-8 text-primary" />
                </div>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">Välkommen till BokförAI!</h1>
                <p className="text-muted-foreground mt-2 leading-relaxed">
                  Vi sätter upp ditt konto på bara ett par minuter. 
                  Sedan kan du börja ladda upp kvitton och fakturor direkt.
                </p>
              </div>
              <div className="space-y-3 text-left">
                {[
                  'AI läser av dina underlag automatiskt',
                  'Förslag på BAS-konto och kategori',
                  'Du godkänner med ett enda klick',
                ].map(item => (
                  <div key={item} className="flex items-center gap-3 bg-secondary rounded-lg px-4 py-3">
                    <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                    <span className="text-sm">{item}</span>
                  </div>
                ))}
              </div>
              <Button className="w-full" size="lg" onClick={() => setStep(2)}>
                Sätt igång →
              </Button>
            </div>
          )}

          {/* Step 2: Company */}
          {step === 2 && (
            <div className="space-y-6">
              <div>
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 mb-4">
                  <Building2 className="h-6 w-6 text-primary" />
                </div>
                <h2 className="text-xl font-bold">Berätta om ditt företag</h2>
                <p className="text-muted-foreground text-sm mt-1">
                  Vi behöver bara det viktigaste för att komma igång.
                </p>
              </div>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="companyName">Företagsnamn *</Label>
                  <Input
                    id="companyName"
                    placeholder="Mitt Företag AB"
                    value={companyName}
                    onChange={e => setCompanyName(e.target.value)}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="orgNumber">Organisationsnummer</Label>
                  <Input
                    id="orgNumber"
                    placeholder="556123-4567"
                    value={orgNumber}
                    onChange={e => setOrgNumber(e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label>Momsredovisning</Label>
                    <select
                      className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                      value={vatType}
                      onChange={e => setVatType(e.target.value)}
                    >
                      <option value="STANDARD">25% (standard)</option>
                      <option value="REDUCED">12% / 6% (reducerad)</option>
                      <option value="EXEMPT">Momsfri</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <Label>Bokföringsmetod</Label>
                    <select
                      className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                      value={accountingMethod}
                      onChange={e => setAccountingMethod(e.target.value)}
                    >
                      <option value="ACCRUAL">Faktura (löpande)</option>
                      <option value="CASH">Kontant</option>
                    </select>
                  </div>
                </div>
              </div>

              {error && <p className="text-sm text-destructive bg-red-50 rounded-lg px-3 py-2">{error}</p>}

              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setStep(1)}>Tillbaka</Button>
                <Button className="flex-1" onClick={handleCreateCompany} loading={loading}>
                  Fortsätt
                </Button>
              </div>
            </div>
          )}

          {/* Step 3: Done */}
          {step === 3 && (
            <div className="text-center space-y-6">
              <div className="flex justify-center">
                <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center">
                  <CheckCircle2 className="h-9 w-9 text-green-600" />
                </div>
              </div>
              <div>
                <h2 className="text-2xl font-bold">Allt är klart!</h2>
                <p className="text-muted-foreground mt-2">
                  Ditt konto är redo. Ladda nu upp ditt första underlag och se hur AI:n arbetar.
                </p>
              </div>
              <div className="flex flex-col gap-3">
                <Button size="lg" onClick={() => router.push('/upload')}>
                  Ladda upp ditt första underlag →
                </Button>
                <Button variant="ghost" onClick={() => router.push('/dashboard')}>
                  Ta mig till instrumentpanelen
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
