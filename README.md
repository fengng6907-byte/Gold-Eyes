# GOLD Eyes 🪙

A real-time gold price analytics platform focused on Malaysia & Singapore. Track XAU/USD spot prices, analyze market trends, estimate retail jewelry costs, and convert currencies — all in a premium, dashboard-style interface.

![Next.js](https://img.shields.io/badge/Next.js-15-black?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4-38bdf8?style=flat-square&logo=tailwindcss)

## Features

### 📊 Real-Time Gold Dashboard
- Live XAU/USD spot price with 24h change tracking
- Interactive price chart (1D, 7D, 1M, 1Y) powered by TradingView Lightweight Charts
- 24h price range indicator

### 🇲🇾 Malaysia Gold Insight
- Automatic MYR conversion from global spot price
- 999 Gold (24K) and 916 Gold (22K) per-gram pricing
- Trend indicators (Bullish / Bearish / Neutral)
- AI-generated market commentary based on SMA and momentum analysis

### 💎 Jewelry Retail Price Estimator
- Estimate retail jewelry prices for Malaysia (MYR) and Singapore (SGD)
- Configurable inputs: weight, purity (999/916/750), crafting fee, retail markup
- Visual price breakdown with stacked bar chart

### 💱 Multi-Currency Calculator
- Supports 50+ world currencies
- Searchable currency dropdown with country flags
- Live exchange rates with swap functionality
- Popular currency quick picks

### 🎨 Premium UI/UX
- Apple-inspired minimalist design
- Dark and light mode with smooth transitions
- Glass morphism cards with gold accents
- Responsive layout (mobile, tablet, desktop)
- Staggered fade-in animations

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 |
| Charts | TradingView Lightweight Charts |
| Data Fetching | SWR (Stale-While-Revalidate) |
| State | React hooks |
| APIs | GoldAPI.io, ExchangeRate-API |

## Getting Started

### Prerequisites
- Node.js 18+
- npm

### Installation

```bash
# Clone the repository
git clone https://github.com/your-username/gold-eyes.git
cd gold-eyes

# Install dependencies
npm install

# Copy environment file
cp .env.example .env.local

# (Optional) Add your API keys to .env.local
# The app runs in demo mode without keys

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

### Environment Variables

| Variable | Required | Description |
|---|---|---|
| `GOLD_API_KEY` | No | Free key from [GoldAPI.io](https://goldapi.io) |
| `EXCHANGE_RATE_API_KEY` | No | Free key from [ExchangeRate-API](https://exchangerate-api.com) |

> **Demo Mode**: Without API keys, the app uses realistic simulated data that mimics live market behavior. All features work fully in demo mode.

## Project Structure

```
src/
├── app/               # Next.js App Router pages & API routes
│   ├── api/           # Backend API proxies with caching
│   │   ├── gold/      # Gold price & historical data
│   │   └── exchange/  # Exchange rate data
│   ├── estimator/     # Jewelry estimator page
│   ├── calculator/    # Currency calculator page
│   └── page.tsx       # Dashboard (home)
├── components/        # React components
│   ├── layout/        # Header, Footer
│   ├── dashboard/     # SpotPriceCard, PriceChart, MalaysiaInsight
│   ├── estimator/     # EstimatorForm with PriceBreakdown
│   ├── calculator/    # CurrencyCalculator
│   └── ui/            # Reusable primitives (Badge, Skeleton, etc.)
├── hooks/             # Custom React hooks (useGoldPrice, useExchangeRates, useTheme)
├── lib/               # Utilities (calculations, cache, market analysis, demo data)
└── types/             # TypeScript interfaces
```

## API Integration Guide

### Gold Price API
- **Endpoint**: `GET /api/gold`
- **Response**: `{ price, change24h, changePercent24h, high24h, low24h, timestamp }`
- **Cache**: 5-minute TTL, polls every 60 seconds on frontend

### Gold History API
- **Endpoint**: `GET /api/gold/history?range=1D|7D|1M|1Y`
- **Response**: `Array<{ time: string, value: number }>`
- **Cache**: 5-15 minute TTL depending on range

### Exchange Rate API
- **Endpoint**: `GET /api/exchange`
- **Response**: `{ base: "USD", rates: { MYR: 4.425, SGD: 1.335, ... } }`
- **Cache**: 1-hour TTL, polls every 30 minutes on frontend

## Build & Production

```bash
# Production build
npm run build

# Start production server
npm start
```

## Wireframe Layout

### Dashboard (Home)
```
┌─────────────────────────────────────────────┐
│  [Logo] GOLD Eyes     [Nav]    [Theme] [☰]  │
├─────────────────────────────────────────────┤
│  Gold Price Dashboard                        │
│  Real-time analytics...                      │
├──────┬──────┬──────┬──────┬─────────────────┤
│XAU/  │MYR/g │SGD/g │24h   │                 │
│USD   │      │      │Change │                 │
├──────┴──────┴──────┴──────┤                 │
│                            │ 🇲🇾 Malaysia     │
│  ┌──────────────────────┐  │    Gold         │
│  │                      │  │                 │
│  │   Price Chart        │  │  999: RM xxx    │
│  │   (Area Chart)       │  │  916: RM xxx    │
│  │                      │  │                 │
│  │  [1D][7D][1M][1Y]   │  │  ┌─ Market ──┐  │
│  └──────────────────────┘  │  │ Insight    │  │
│                            │  └────────────┘  │
│  ┌──────────────────────┐  │                 │
│  │  Spot Price Card     │  │  [Tools]       │
│  │  $xxxx.xx ▲+x.xx%   │  │  > Estimator   │
│  │  ████████░░ Range    │  │  > Calculator   │
│  └──────────────────────┘  │                 │
├────────────────────────────┴─────────────────┤
│  Footer: TradingView attribution | Disclaimer │
└──────────────────────────────────────────────┘
```

## License

MIT

## Acknowledgements

- Charts powered by [TradingView Lightweight Charts](https://www.tradingview.com/lightweight-charts/)
- Gold data from [GoldAPI.io](https://goldapi.io)
- Exchange rates from [ExchangeRate-API](https://exchangerate-api.com)
