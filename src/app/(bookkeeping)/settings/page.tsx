'use client'

import { useState, useEffect } from 'react'
import { Header } from '@/components/layout/Header'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { Building2, Plug, CheckCircle2, Loader2, Save } from 'lucide-react'

interface Company {
  id: string
  name: string
  orgNumber: string | null
  vatType: string
  accountingMethod: string
  baseCurrency: string
}

const INTEGRATIONS = [
  {
    id: 'fortnox',
    name: 'Fortnox',
    description: 'Synkronisera transaktioner direkt till ditt Fortnox-konto.',
    status: 'coming_soon',
  },
  {
    id: 'swish',
    name: 'Open Banking / Swish',
    description: 'Koppla ditt bankkonto för automatisk transaktionsimport.',
    status: 'coming_soon',
  },
  {
    id: 'anthropic',
    name: 'Anthropic Claude (AI)',
    description: 'Aktivera avancerad AI-analys med Claude för mer exakta förslag.',
    status: 'coming_soon',
  },
  {
    id: 'visma',
    name: 'Visma eEkonomi',
    description: 'Export till Visma-format för redovisning.',
    status: 'coming_soon',
  },
]

export default function SettingsPage() {
  const [company, setCompany] = useState<Company | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const [name, setName] = useState('')
  const [orgNumber, setOrgNumber] = useState('')
  const [vatType, setVatType] = useState('STANDARD')
  const [accountingMethod, setAccountingMethod] = useState('ACCRUAL')

  useEffect(() => {
    fetch('/api/companies')
      .then(r => r.json())
      .then(data => {
        if (data.company) {
          setCompany(data.company)
          setName(data.company.name)
          setOrgNumber(data.company.orgNumber || '')
          setVatType(data.company.vatType)
          setAccountingMethod(data.company.accountingMethod)
        }
        setLoading(false)
      })
  }, [])

  async function handleSave() {
    setSaving(true)
    try {
      const res = await fetch('/api/companies', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, orgNumber: orgNumber || null, vatType, accountingMethod }),
      })
      if (res.ok) {
        setSaved(true)
        setTimeout(() => setSaved(false), 3000)
      }
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <>
        <Header title="Inställningar" />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      </>
    )
  }

  return (
    <>
      <Header title="Inställningar" description="Hantera ditt företag och integrationer" />

      <div className="flex-1 p-6 max-w-2xl space-y-6">
        {/* Company settings */}
        <div className="bg-white rounded-xl border border-border p-6 space-y-5">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
              <Building2 className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="font-semibold">Företagsinformation</h2>
              <p className="text-xs text-muted-foreground">Grundläggande uppgifter om ditt företag</p>
            </div>
          </div>

          <Separator />

          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="companyName">Företagsnamn</Label>
              <Input
                id="companyName"
                value={name}
                onChange={e => setName(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="orgNumber">Organisationsnummer</Label>
              <Input
                id="orgNumber"
                value={orgNumber}
                onChange={e => setOrgNumber(e.target.value)}
                placeholder="556123-4567"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Momstyp</Label>
                <select
                  className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  value={vatType}
                  onChange={e => setVatType(e.target.value)}
                >
                  <option value="STANDARD">25% Standard</option>
                  <option value="REDUCED">12% / 6% Reducerad</option>
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

          <div className="flex items-center gap-3">
            <Button onClick={handleSave} loading={saving}>
              <Save className="h-4 w-4 mr-1" />
              Spara ändringar
            </Button>
            {saved && (
              <div className="flex items-center gap-1.5 text-green-600 text-sm">
                <CheckCircle2 className="h-4 w-4" />
                Sparat!
              </div>
            )}
          </div>
        </div>

        {/* Integrations */}
        <div className="bg-white rounded-xl border border-border p-6 space-y-5">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-secondary">
              <Plug className="h-5 w-5 text-muted-foreground" />
            </div>
            <div>
              <h2 className="font-semibold">Integrationer</h2>
              <p className="text-xs text-muted-foreground">Koppla BokförAI till dina befintliga system</p>
            </div>
          </div>

          <Separator />

          <div className="space-y-3">
            {INTEGRATIONS.map(integration => (
              <div
                key={integration.id}
                className="flex items-center justify-between py-3 px-4 rounded-xl bg-secondary/40 border border-border"
              >
                <div>
                  <p className="font-medium text-sm">{integration.name}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{integration.description}</p>
                </div>
                <Badge variant="secondary" className="shrink-0 ml-4 text-xs">
                  Kommer snart
                </Badge>
              </div>
            ))}
          </div>

          <p className="text-xs text-muted-foreground">
            Vi jobbar aktivt med att lägga till fler integrationer. 
            Kontakta oss om du önskar en specifik integration.
          </p>
        </div>

        {/* Danger zone */}
        <div className="bg-white rounded-xl border border-destructive/20 p-6 space-y-4">
          <h2 className="font-semibold text-destructive text-sm">Farlig zon</h2>
          <p className="text-xs text-muted-foreground">
            Dessa åtgärder kan inte ångras. Tänk noggrant innan du fortsätter.
          </p>
          <Button variant="outline" className="text-destructive border-destructive/30 hover:bg-destructive/5 text-sm" disabled>
            Ta bort konto (ej tillgängligt i MVP)
          </Button>
        </div>
      </div>
    </>
  )
}
