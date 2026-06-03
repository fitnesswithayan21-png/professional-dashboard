# NexusAI CRM Dashboard

A production-ready SaaS CRM Dashboard for AI-powered lead qualification, appointment booking, follow-ups, and business intelligence.

![Dashboard Preview](./screenshot.png)

## 🚀 Features

- **Executive Dashboard** — KPI cards, lead growth charts, appointment trends, conversion funnel
- **Lead Management** — Full CRM table with search, filters, sorting, pagination, CSV export
- **Lead Details** — Complete profile with conversations, AI memory, appointments, follow-ups
- **Appointment Booking** — Table & calendar views with status tracking and meeting links
- **Follow-Up System** — Automated follow-up tracking with response monitoring
- **Conversation History** — ChatGPT-style interface with lead-grouped message threads
- **AI Memory** — View, search, edit, and delete AI-remembered lead context
- **Business Knowledge** — Editable business info, services, pricing, FAQs, and policies
- **Advanced Analytics** — Source distribution, score distribution, conversion charts, growth trends
- **Settings** — API key management, Google Sheets connection, business configuration
- **Multi-AI Support** — Grok, OpenAI, Gemini, and Claude integration
- **Dark/Light Mode** — Premium glassmorphism dark theme with light mode toggle

## 🛠 Tech Stack

| Category | Technology |
|----------|-----------|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript |
| Styling | TailwindCSS v4 |
| State Management | Zustand |
| Charts | Recharts |
| Icons | Lucide React |
| Database | Google Sheets API |
| AI | Grok / OpenAI / Gemini / Claude |
| Auth | Local Admin Authentication |
| Deployment | Vercel |

## 📦 Quick Start

### Prerequisites
- Node.js 18+ installed
- A Google Cloud service account (for Google Sheets integration)
- At least one AI API key (Grok recommended)

### Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd working-dashboard

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env.local

# Start development server
npm run dev
```

### Environment Variables

Edit `.env.local` with your credentials:

```env
GOOGLE_SHEETS_ID=your_spreadsheet_id
GOOGLE_SERVICE_ACCOUNT_KEY={"type":"service_account",...}
GROK_API_KEY=your_grok_key
```

### Default Login Credentials

| Field | Value |
|-------|-------|
| Email | admin@nexusai.com |
| Password | admin123 |

## 📊 Google Sheets Setup

Create a Google Spreadsheet with these sheets (tabs):

1. **Leads** — Columns: ID, Full Name, Email, Phone, Source, Business Type, Lead Score, Intent, Urgency, Status, Booked Call, Reminder Sent, Created Date, Last Contact, Notes
2. **Conversation History** — Columns: ID, Lead ID, Lead Name, User Message, AI Response, Timestamp, Channel, Message Type
3. **AI Memory** — Columns: ID, Lead ID, Lead Name, Memory Type, Memory Value, Last Updated
4. **Appointments** — Columns: ID, Lead ID, Lead Name, Date, Time, Meeting Link, Status, Reminder Sent, Notes
5. **Follow-Up Queue** — Columns: ID, Lead ID, Lead Name, Follow-Up #, Message, Scheduled Time, Status, Message Sent, Response Received
6. **Business Knowledge** — Columns: ID, Business Name, Services, Pricing, FAQs, Hours, Policies, Booking Link

Share the spreadsheet with your service account email address.

## 🚀 Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set environment variables in Vercel dashboard
```

Or click the button below:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

## 📁 Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── ai/route.ts          # Multi-provider AI endpoint
│   │   └── refresh/route.ts     # Data refresh endpoint
│   ├── dashboard/
│   │   ├── leads/
│   │   │   ├── [id]/page.tsx    # Lead details
│   │   │   └── page.tsx         # Leads table
│   │   ├── appointments/page.tsx
│   │   ├── follow-ups/page.tsx
│   │   ├── conversations/page.tsx
│   │   ├── ai-memory/page.tsx
│   │   ├── business/page.tsx
│   │   ├── analytics/page.tsx
│   │   ├── settings/page.tsx
│   │   ├── layout.tsx           # Dashboard layout with sidebar
│   │   └── page.tsx             # Dashboard home
│   ├── globals.css
│   ├── layout.tsx               # Root layout
│   └── page.tsx                 # Login page
├── components/
│   ├── dashboard/
│   │   ├── charts.tsx
│   │   ├── kpi-cards.tsx
│   │   └── recent-activity.tsx
│   ├── layout/
│   │   ├── header.tsx
│   │   ├── page-header.tsx
│   │   └── sidebar.tsx
│   └── ui/
│       ├── avatar.tsx
│       ├── badge.tsx
│       ├── button.tsx
│       ├── card.tsx
│       ├── input.tsx
│       ├── modal.tsx
│       └── skeleton.tsx
├── lib/
│   ├── google-sheets.ts         # Google Sheets service
│   ├── mock-data.ts             # Demo data
│   └── utils.ts                 # Utilities
├── store/
│   └── crm-store.ts             # Zustand state
└── types/
    └── index.ts                 # TypeScript types
```

## 📄 License

MIT License — feel free to use for commercial projects.
