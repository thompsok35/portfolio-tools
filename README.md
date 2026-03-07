# Portfolio Tools — Income & Expense Planner

A specialized financial planning application to track diverse income streams (Investments, Freelance, Rental) against foundational monthly expenses and generate a clear **Net Monthly Summary**.

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | ASP.NET Core 8.0 Web API |
| Frontend | React 19 + TypeScript + Vite |
| Database | Entity Framework Core + PostgreSQL |
| State Management | TanStack Query (React Query) |
| Authentication | ASP.NET Core Identity + JWT |
| API Docs | Swagger / OpenAPI |

## Features

- **Income Sources** — Track multiple income streams with configurable types (Dividend, Option Premium, IT Contract, Rental, etc.) and frequencies (Monthly, Bi-Monthly, Quarterly, Yearly)
- **Expense Categories** — Define fixed and variable monthly expenses
- **Net Monthly Summary** — Aggregated income vs expenses dashboard for any MM/YYYY period
- **Quarterly View** — See dividend clusters and quarterly income across Q1–Q4
- **Quick-Add Buttons** — Rapid entry for recurring income like Monthly IT Contracts
- **Secure Accounts** — JWT auth ensures all plans are private per user
- **API Token** — Per-user integration token for importing/exporting data with other portfolio tools

## Quick Start (Docker)

```bash
# 1. Set a strong JWT secret
export JWT_KEY="$(openssl rand -base64 48)"

# 2. Start all services (PostgreSQL + API + Frontend)
docker-compose up --build

# 3. Open the app
open http://localhost:5173
# Swagger UI available at http://localhost:5000/swagger
```

## Local Development

### Backend

```bash
cd src/PortfolioTools.API

# Configure secrets (do NOT put the real key in appsettings.json)
dotnet user-secrets set "Jwt:Key" "$(openssl rand -base64 48)"

# Start the API (requires PostgreSQL on localhost:5432)
dotnet run --launch-profile http
# → http://localhost:5000/swagger
```

### Frontend

```bash
cd frontend
cp .env.example .env        # VITE_API_URL=http://localhost:5000
npm install
npm run dev                 # → http://localhost:5173
```

### Tests

```bash
dotnet test tests/PortfolioTools.Tests
```

## Project Structure

```
portfolio-tools/
├── src/
│   └── PortfolioTools.API/
│       ├── Controllers/        # Auth, IncomeSources, ExpenseCategories, IncomeTypes, Summary
│       ├── Data/               # AppDbContext + EF Migrations
│       ├── DTOs/               # Request/Response shapes
│       ├── Models/             # Domain entities
│       └── Services/           # SummaryService (monthly/quarterly aggregation)
├── tests/
│   └── PortfolioTools.Tests/  # xUnit tests for SummaryService
├── frontend/
│   └── src/
│       ├── api/               # Axios client + endpoint functions
│       ├── components/        # Layout, ProtectedRoute
│       ├── context/           # AuthContext
│       ├── pages/             # Dashboard, Income, Expenses, Settings, Login, Register
│       └── types/             # Shared TypeScript types
└── docker-compose.yml
```

## Income Frequency Logic

| Frequency | Applies in month? |
|---|---|
| Monthly | Every month |
| Bi-Monthly | Every other month starting from TargetDate month |
| Quarterly | Same position in each 3-month cycle (e.g., March → Mar/Jun/Sep/Dec) |
| Yearly | Only in TargetDate month |

