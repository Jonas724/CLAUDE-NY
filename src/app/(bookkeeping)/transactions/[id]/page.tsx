'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Header } from '@/components/layout/Header'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { formatCurrency, formatDate, getConfidenceColor, getConfidenceLabel, getConfidenceBg, cn } from '@/lib/utils'
import {
  CheckCircle2, X, Edit2, Save, Sparkles, FileText,
  Calendar, Building2, Hash, Tag, ArrowLeft, Loader2
} from 'lucide-react'

interface Transaction {
  id: string
  supplierName: string | null
  date: string | null
  grossAmount: number | null
  netAmount: number | null
  vatAmount: number | null
  currency: string
  suggestedAccount: string | null
  finalAccount: string | null
  category: string | null
  status: string
  confidenceScore: number | null
  aiReasoningSummary: string | null
  description: string | null
  document: {
    originalFileName: string
    fileUrl: string
    fileType: string
  } | null
}

const BAS_ACCOUNTS = [
  { value: '5010', label: '5010 – Lokalhyra' },
  { value: '5020', label: '5020 – El, värme, vatten' },
  { value: '6110', label: '6110 – Kontorsmaterial' },
  { value: '6210', label: '6210 – Telefon och internet' },
  { value: '6230', label: '6230 – Representation, avdragsgill' },
  { value: '6420', label: '6420 – Annonsering och reklam' },
  { value: '6530', label: '6530 – Redovisningskonsult' },
  { value: '6540', label: '6540 – IT-tjänster och programvara' },
  { value: '6990', label: '6990 – Övriga externa tjänster' },
  { value: '7310', label: '7310 – Resekostnader' },
  { value: '7321', label: '7321 – Resekostnader, anställda' },
]

export default function ReviewTransactionPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [tx, setTx] = useState<Transaction | null>(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState<Partial<Transaction>>({})

  useEffect(() => {
    fetch(`/api/transactions/${params.id}`)
      .then(r => r.json())
      .then(data => {
        setTx(data.transaction)
        setForm(data.transaction)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [params.id])

  async function handleApprove() {
    setSaving(true)
    try {
      const res = await fetch(`/api/transactions/${params.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'APPROVED',
          finalAccount: form.finalAccount || tx?.suggestedAccount,
        }),
      })
      if (res.ok) router.push('/transactions?status=APPROVED')
    } finally {
      setSaving(false)
    }
  }

  async function handleReject() {
    setSaving(true)
    try {
      const res = await fetch(`/api/transactions/${params.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'REJECTED' }),
      })
      if (res.ok) router.push('/transactions')
    } finally {
      setSaving(false)
    }
  }

  async function handleSaveEdit() {
    setSaving(true)
    try {
      const res = await fetch(`/api/transactions/${params.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, status: 'EDITED' }),
      })
      const data = await res.json()
      if (res.ok) {
        setTx(data.transaction)
        setForm(data.transaction)
        setEditing(false)
      }
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <>
        <Header title="Granska bokföringsförslag" />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </>
    )
  }

  if (!tx) {
    return (
      <>
        <Header title="Transaktion hittades inte" />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-muted-foreground">Transaktionen kunde inte hittas.</p>
        </div>
      </>
    )
  }

  const confidence = tx.confidenceScore ?? 0
  const isApproved = tx.status === 'APPROVED'

  return (
    <>
      <Header
        title="Granska bokföringsförslag"
        description={tx.document?.originalFileName}
        action={
          <Button variant="ghost" size="sm" onClick={() => router.push('/transactions')}>
            <ArrowLeft className="h-4 w-4 mr-1" />
            Tillbaka
          </Button>
        }
      />

      <div className="flex-1 p-6">
        <div className="max-w-3xl mx-auto space-y-5">

          {/* AI confidence banner */}
          <div className={cn('rounded-xl border p-4', getConfidenceBg(confidence))}>
            <div className="flex items-start gap-3">
              <Sparkles className={`h-5 w-5 shrink-0 mt-0.5 ${getConfidenceColor(confidence)}`} />
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className={`font-semibold text-sm ${getConfidenceColor(confidence)}`}>
                    {getConfidenceLabel(confidence)} ({Math.round(confidence * 100)}%)
                  </span>
                </div>
                <p className="text-sm leading-relaxed">{tx.aiReasoningSummary || 'AI har analyserat dokumentet.'}</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Left: Transaction details */}
            <div className="bg-white rounded-xl border border-border p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="font-semibold text-sm">Bokföringsdetaljer</h2>
                {!isApproved && !editing && (
                  <Button variant="ghost" size="sm" onClick={() => setEditing(true)}>
                    <Edit2 className="h-3.5 w-3.5 mr-1" />
                    Redigera
                  </Button>
                )}
                {editing && (
                  <Button variant="ghost" size="sm" onClick={() => { setEditing(false); setForm(tx) }}>
                    Avbryt
                  </Button>
                )}
              </div>

              <div className="space-y-3">
                <FieldRow
                  icon={Building2}
                  label="Leverantör"
                  value={form.supplierName || ''}
                  editing={editing}
                  onChange={v => setForm(p => ({ ...p, supplierName: v }))}
                />
                <FieldRow
                  icon={Calendar}
                  label="Datum"
                  value={form.date ? form.date.split('T')[0] : ''}
                  editing={editing}
                  type="date"
                  onChange={v => setForm(p => ({ ...p, date: v }))}
                />
                <FieldRow
                  icon={Tag}
                  label="Kategori"
                  value={form.category || ''}
                  editing={editing}
                  onChange={v => setForm(p => ({ ...p, category: v }))}
                />
                <div className="flex items-start gap-3">
                  <Hash className="h-4 w-4 text-muted-foreground mt-2.5 shrink-0" />
                  <div className="flex-1">
                    <Label className="text-xs text-muted-foreground">BAS-konto</Label>
                    {editing ? (
                      <select
                        className="mt-1 flex h-9 w-full rounded-lg border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                        value={form.finalAccount || form.suggestedAccount || ''}
                        onChange={e => setForm(p => ({ ...p, finalAccount: e.target.value }))}
                      >
                        {BAS_ACCOUNTS.map(a => (
                          <option key={a.value} value={a.value}>{a.label}</option>
                        ))}
                      </select>
                    ) : (
                      <div className="mt-1 flex items-center gap-2">
                        <span className="font-mono text-sm font-semibold">
                          {tx.finalAccount || tx.suggestedAccount || '–'}
                        </span>
                        {!tx.finalAccount && <Badge variant="warning" className="text-xs">AI-förslag</Badge>}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {editing && (
                <Button className="w-full" onClick={handleSaveEdit} loading={saving}>
                  <Save className="h-4 w-4 mr-1" />
                  Spara ändringar
                </Button>
              )}
            </div>

            {/* Right: Amounts + document */}
            <div className="space-y-4">
              {/* Amounts */}
              <div className="bg-white rounded-xl border border-border p-5">
                <h2 className="font-semibold text-sm mb-4">Belopp</h2>
                <div className="space-y-2">
                  <div className="flex justify-between items-center py-2 border-b border-border">
                    <span className="text-sm text-muted-foreground">Netto</span>
                    <span className="text-sm font-medium">
                      {tx.netAmount != null ? formatCurrency(tx.netAmount, tx.currency) : '–'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-border">
                    <span className="text-sm text-muted-foreground">Moms</span>
                    <span className="text-sm font-medium">
                      {tx.vatAmount != null ? formatCurrency(tx.vatAmount, tx.currency) : '–'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center pt-2">
                    <span className="text-sm font-semibold">Totalt</span>
                    <span className="text-lg font-bold text-foreground">
                      {tx.grossAmount != null ? formatCurrency(tx.grossAmount, tx.currency) : '–'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Document preview */}
              {tx.document && (
                <div className="bg-white rounded-xl border border-border p-5">
                  <h2 className="font-semibold text-sm mb-3">Dokument</h2>
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary">
                      <FileText className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{tx.document.originalFileName}</p>
                      <a
                        href={tx.document.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-primary hover:underline"
                      >
                        Visa original →
                      </a>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Action buttons */}
          {!isApproved && !editing && (
            <div className="flex gap-3 pt-2">
              <Button
                className="flex-1"
                size="lg"
                variant="success"
                onClick={handleApprove}
                loading={saving}
              >
                <CheckCircle2 className="h-5 w-5 mr-2" />
                Godkänn bokföringen
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={handleReject}
                loading={saving}
                className="text-destructive border-destructive/30 hover:bg-destructive/5"
              >
                <X className="h-4 w-4 mr-1" />
                Avvisa
              </Button>
            </div>
          )}

          {isApproved && (
            <div className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-xl p-4">
              <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0" />
              <div>
                <p className="font-medium text-green-800 text-sm">Bokföring godkänd</p>
                <p className="text-xs text-green-600">Denna transaktion är bokförd och klar.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}

function FieldRow({
  icon: Icon, label, value, editing, onChange, type = 'text'
}: {
  icon: React.ElementType
  label: string
  value: string
  editing: boolean
  onChange: (v: string) => void
  type?: string
}) {
  return (
    <div className="flex items-start gap-3">
      <Icon className="h-4 w-4 text-muted-foreground mt-2.5 shrink-0" />
      <div className="flex-1">
        <Label className="text-xs text-muted-foreground">{label}</Label>
        {editing ? (
          <Input
            type={type}
            value={value}
            onChange={e => onChange(e.target.value)}
            className="mt-1 h-9"
          />
        ) : (
          <p className="text-sm mt-0.5 font-medium">{value || '–'}</p>
        )}
      </div>
    </div>
  )
}
