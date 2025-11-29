# TradeSafe

TradeSafe is an advanced **agentic AI-powered** cryptocurrency arbitrage and trading platform. It leverages a multi-agent system to autonomously detect, analyze, and execute profitable arbitrage opportunities across multiple exchanges in real-time.

## Features

### 🤖 Agentic AI System
- **Multi-Agent Architecture:** Coordinated AI agents working together for optimal trading decisions
  - **Price Discovery Agent:** Continuously monitors 50+ exchanges for price discrepancies
  - **Risk Assessment Agent:** Evaluates trade safety and capital protection
  - **Capital Allocation Agent:** Intelligently distributes capital across opportunities
  - **Debate Agent:** AI agents debate trade decisions to ensure optimal outcomes
  - **Execution Engine:** Ultra-low latency trade execution with partial fill support

### 📊 Core Features
- **Real-Time Arbitrage Detection:** Automatically identifies profitable spreads across exchanges
- **Dynamic Market Data:** Live price tracking with WebSocket support for instant updates
- **Advanced Charting:** Interactive candlestick charts with technical indicators
- **Portfolio Management:** Track holdings, positions, and P&L across all exchanges
- **Risk Management:** AI-driven risk controls with automated stop-loss and position sizing
- **Audit Trail:** Complete execution logs and agent decision history

### 🎯 Trading Capabilities
- **Cross-Exchange Arbitrage:** Execute simultaneous trades on multiple exchanges
- **Indian Market Support:** Integration with NSE and Indian crypto exchanges
- **Mock Trading:** Test strategies with simulated exchanges before going live
- **Customizable Parameters:** Fine-tune risk levels, spreads, and execution settings
- **Modern UI:** Built with Next.js, Tailwind CSS, and Radix UI for seamless experience

## Project Structure

- `app/` - Next.js app directory with pages and API routes
  - `api/agents/` - AI agent endpoints (allocate, debate, risk assessment)
  - `api/arbitrage/` - Arbitrage detection and execution APIs
  - `api/prices/` - Real-time price feed endpoints
- `components/` - Reusable React components
  - `charts/` - Advanced charting components (candlestick, line charts)
  - `tables/` - Data tables for trades, assets, and positions
  - `ui/` - Shadcn UI components
- `lib/` - Core business logic
  - `agents/` - **AI Agent implementations** (capital allocation, debate, execution, risk)
  - `arbitrage/` - Arbitrage detection and spread calculation
  - `exchanges/` - Exchange integrations (Binance, NSE, Indian markets)
  - `state/` - Global state management and audit logging
- `hooks/` - Custom React hooks for data fetching and real-time updates
- `backend/` - Backend services (if applicable)
- `public/` - Static assets and images

## Getting Started

### Prerequisites

- Node.js (v18+ recommended)
- Binance API keys (optional, for live trading)
- Exchange API keys for other platforms (optional)

### Installation

1. **Clone the repository:**
   ```sh
   git clone https://github.com/AyushGupta45/mumbaihacks-tradesafe.git
   cd TradeSafe
   ```

2. **Install dependencies:**
   ```sh
   npm install
   ```

3. **Configure environment variables:**
   - Copy `sample .env.local` to `.env.local` in the root directory
   - Add your Binance API keys and other exchange credentials (optional for testing)
   ```env
   NEXT_PUBLIC_BINANCE_API_KEY=your_api_key
   NEXT_PUBLIC_BINANCE_SECRET=your_secret_key
   ```

4. **Run the development server:**
   ```sh
   npm run dev
   ```

5. **Open the app:**
   - Visit [http://localhost:3000](http://localhost:3000) in your browser
   - Start with the Dashboard or Arbitrage page to see AI agents in action

## Scripts

- `npm run dev` - Start the development server with hot reload
- `npm run build` - Build the Next.js app for production
- `npm start` - Start the production server
- `npm run lint` - Run ESLint to check code quality

## AI Agent Architecture

TradeSafe uses a **multi-agent system** where specialized AI agents collaborate to make optimal trading decisions:

### 🧠 Agent Workflow
1. **Price Discovery Agent** scans all exchanges for price differences
2. **Risk Assessment Agent** evaluates each opportunity for safety
3. **Capital Allocation Agent** determines optimal position sizing
4. **Debate Agent** facilitates AI-to-AI discussion for complex decisions
5. **Execution Engine** executes trades with sub-second latency

### 📍 Agent Endpoints
- `/api/agents/risk` - Risk assessment for trade opportunities
- `/api/agents/allocate` - Capital allocation decisions
- `/api/agents/debate` - Multi-agent debate and consensus
- `/api/agents/runner/start` - Start autonomous agent execution
- `/api/agents/runner/stop` - Stop autonomous agent execution

### 🔄 Arbitrage System
- `/api/arbitrage/detect` - Real-time arbitrage opportunity detection
- `/api/arbitrage/execute` - Execute arbitrage trades across exchanges
- `/api/prices` - Live price feed from multiple sources

## Technology Stack

### Frontend
- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **Shadcn UI** - Accessible component library
- **Lucide Icons** - Modern icon set
- **KlineCharts** - Advanced trading charts
- **Recharts** - Data visualization

### Backend & AI
- **Next.js API Routes** - Serverless API endpoints
- **AI Agent System** - Custom multi-agent framework
- **WebSocket** - Real-time data streaming
- **State Management** - Global state with persistent storage

### Exchanges
- Binance (live trading)
- Indian crypto exchanges (mock/simulation)
- NSE (National Stock Exchange simulation)

## Configuration

### Trading Parameters
- Navigate to `/settings` to configure:
  - Risk tolerance levels
  - Minimum spread requirements
  - Maximum position sizes
  - Exchange enablement
  - Auto-trading mode

### Agent Tuning
- Adjust agent parameters in `lib/agents/` files
- Modify debate thresholds in `lib/agents/debateAgent.ts`
- Configure risk models in `lib/agents/riskAssessment.ts`

## Key Pages

- `/dashboard` - Overview of portfolio and active agents
- `/arbitrage` - Real-time arbitrage opportunities with AI analysis
- `/agents` - Agent activity, debates, and decision logs
- `/markets` - Market data and price charts
- `/portfolio` - Holdings and position management
- `/settings` - System configuration and agent parameters

## Features in Action

### Arbitrage Detection
The system continuously monitors price differences across exchanges and automatically:
1. Detects profitable spreads
2. Assesses execution risk
3. Allocates optimal capital
4. Executes trades if auto-mode is enabled
5. Logs all decisions for audit

### AI Debate System
When facing complex trading decisions, agents can enter a debate mode where:
- Multiple AI perspectives are considered
- Risk vs. reward is thoroughly analyzed
- Consensus is reached through structured discussion
- All debates are logged and can be reviewed

---

**TradeSafe** - *Intelligent Arbitrage, Automated by AI*