# BokförAI – Smart AI Bookkeeping for Swedish Small Businesses

An MVP SaaS application where Swedish small business owners can upload receipts and invoices, have AI extract the key fields, get a bookkeeping suggestion (with BAS account), and approve it with one click.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS + CSS Variables |
| Components | Custom UI components (Radix UI primitives) |
| Database ORM | Prisma |
| Database | PostgreSQL |
| Auth | JWT (jose) + httpOnly cookies |
| AI Layer | Mocked (ready for Anthropic API) |
| File Upload | Local filesystem (ready for S3/R2) |

---

## Quick Start

### Prerequisites

- Node.js 18+
- PostgreSQL (local or hosted, e.g. Neon, Supabase, Railway)

### 1. Clone and install

```bash
git clone <repo>
cd CLAUDE-NY
npm install
```

### 2. Configure environment

```bash
cp .env.example .env.local
```

Edit `.env.local`:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/bokforai_db"
JWT_SECRET="your-secure-random-secret-min-32-chars"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### 3. Set up the database

```bash
# Push schema to database
npm run db:push

# OR run migrations (recommended for production)
npm run db:migrate

# Seed with demo data
npm run db:seed
```

### 4. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### 5. Demo login

```
Email:    demo@bokforai.se
Password: demo1234
```

---

## Project Structure

```
src/
├── app/
│   ├── (bookkeeping)/           # Protected app routes
│   │   ├── layout.tsx           # Auth guard + AppShell wrapper
│   │   ├── dashboard/           # Instrumentpanel
│   │   ├── upload/              # Ladda upp underlag
│   │   ├── transactions/        # Transaktionslista
│   │   │   └── [id]/            # Granska bokföringsförslag
│   │   ├── documents/           # Dokumentarkiv
│   │   ├── settings/            # Inställningar
│   │   └── onboarding/          # Första-gång-flöde
│   ├── login/                   # Inloggningssida
│   └── api/
│       ├── auth/login|logout|register
│       ├── companies/
│       ├── documents/
│       ├── transactions/[id]
│       └── dashboard/
├── components/
│   ├── ui/                      # Button, Card, Badge, Input, Label, Select, ...
│   └── layout/                  # Sidebar, Header, AppShell
└── lib/
    ├── db.ts                    # Prisma client singleton
    ├── auth.ts                  # JWT helpers + BAS account map
    ├── utils.ts                 # cn(), formatCurrency(), formatDate(), confidence helpers
    └── ai/
        ├── extractDocument.ts   # OCR extraction (mock → real provider)
        ├── suggestBookkeeping.ts # BAS account suggestion (mock → Anthropic API)
        └── generateInsights.ts  # Dashboard insights (mock → Anthropic API)
```

---

## What Is Mocked vs Production-Ready

| Feature | Status | Notes |
|---------|--------|-------|
| Auth (JWT + cookies) | ✅ Production-ready | Swap to NextAuth for OAuth |
| File storage | ⚠️ Local filesystem | Replace with S3/Cloudflare R2 |
| OCR extraction | 🟡 Mocked | See integration guide below |
| AI bookkeeping suggestion | 🟡 Mocked rule-based | See Anthropic integration below |
| AI insights | 🟡 Mocked | See Anthropic integration below |
| Database models | ✅ Production-ready | PostgreSQL via Prisma |
| Async document processing | ⚠️ In-process | Replace with BullMQ/SQS queue |
| Audit log | ✅ Implemented | Tracks all approvals/edits |

---

## Integration Next Steps

### 1. OCR Provider (replace `src/lib/ai/extractDocument.ts`)

**Option A – Anthropic Vision (recommended)**
```typescript
import Anthropic from '@anthropic-ai/sdk'
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const response = await anthropic.messages.create({
  model: 'claude-opus-4-5',
  messages: [{
    role: 'user',
    content: [
      { type: 'image', source: { type: 'url', url: fileUrl } },
      { type: 'text', text: 'Extract all text and structured data from this Swedish receipt/invoice. Return: supplier_name, date, amounts, currency, invoice_number.' }
    ]
  }]
})
```

**Option B – Google Document AI**
```typescript
import { DocumentProcessorServiceClient } from '@google-cloud/documentai'
const client = new DocumentProcessorServiceClient()
const [result] = await client.processDocument({ name: processorName, rawDocument: { content, mimeType } })
```

**Option C – Azure Form Recognizer**
```typescript
import { DocumentAnalysisClient, AzureKeyCredential } from '@azure/ai-form-recognizer'
const client = new DocumentAnalysisClient(endpoint, new AzureKeyCredential(key))
const poller = await client.beginAnalyzeDocument('prebuilt-invoice', fileBuffer)
```

---

### 2. Anthropic API for AI Suggestions (replace `src/lib/ai/suggestBookkeeping.ts`)

```typescript
import Anthropic from '@anthropic-ai/sdk'

const response = await anthropic.messages.create({
  model: 'claude-opus-4-5',
  max_tokens: 1024,
  tools: [{
    name: 'suggest_bookkeeping',
    description: 'Suggest Swedish BAS account and category for a business expense',
    input_schema: {
      type: 'object',
      properties: {
        suggested_account: { type: 'string' },
        category: { type: 'string' },
        confidence_score: { type: 'number' },
        reasoning_summary: { type: 'string' }
      }
    }
  }],
  messages: [{
    role: 'user',
    content: `Du är en svensk bokföringsexpert. Analysera detta underlag och föreslå BAS-konto:
    Leverantör: ${extracted.supplierName}
    Typ: ${extracted.documentType}
    Belopp: ${extracted.grossAmount} ${extracted.currency}`
  }]
})
```

---

### 3. Fortnox Integration

```typescript
// POST approved transaction to Fortnox Voucher API
const res = await fetch('https://api.fortnox.se/3/vouchers', {
  method: 'POST',
  headers: {
    'Access-Token': process.env.FORTNOX_ACCESS_TOKEN,
    'Client-Secret': process.env.FORTNOX_CLIENT_SECRET,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    Voucher: {
      VoucherSeries: 'A',
      TransactionDate: transaction.date,
      Description: transaction.supplierName,
      VoucherRows: [
        { Account: parseInt(transaction.finalAccount), Debit: transaction.netAmount },
        { Account: 2640, Debit: transaction.vatAmount },   // Ingående moms
        { Account: 2440, Credit: transaction.grossAmount }, // Leverantörsskulder
      ]
    }
  })
})
```

---

### 4. Open Banking / Bank Feed

Use **Tink** or **Nordigen (GoCardless)** to fetch bank transactions and auto-match with uploaded documents:

```typescript
// Tink API – fetch transactions
const transactions = await tink.transactions.list({
  accountIds: [bankAccountId],
  dateFrom: monthStart,
  dateTo: monthEnd,
})
// Match against our Transaction records by amount + date
```

---

## Database Models

```
User ──────── Company ──── Document ──── Transaction
  |                                          |
  └──────────────────── AuditLog ────────────┘
```

## License

MIT – built as an MVP / proof of concept.
