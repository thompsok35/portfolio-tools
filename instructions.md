Project Blueprint: Income & Expense Planner (Antigravity)

Project Overview
A specialized financial planning application designed to track diverse income streams (Investments, Freelance, Rental) against foundational monthly expenses. The goal is to provide a clear "Net Monthly Summary" to visualize cash flow.

Technical Stack
Backend: ASP.NET Core 8.0 Web API

Frontend: React (TypeScript) with Vite

Pattern: MVC (Model-View-Controller) / RESTful API

Database: Entity Framework Core (PostgreSQL for local dev and production deployment)

Core Data Models
Income Source
Id: Guid
Amount: Decimal

Source: String (e.g., "Apple Dividends", "Main St Rental")

Type: Enum/Configurable Category (Dividend, Option Premium, Stock Sale, IT Contract, Rental)

Frequency: Enum (Bi-Monthly, Monthly, Quarterly, Yearly)

TargetDate: DateTime (The specific date in the month this income is expected)

Description: String

Expense Category
Id: Guid

Name: String (e.g., Rent/Mortgage, Taxes, Healthcare, Groceries)

IsFixed: Boolean

PlannedAmount: Decimal

Implementation Requirements
Phase 1: Backend API (ASP.NET)
CRUD Controllers: Build endpoints for IncomeSources and ExpenseCategories.
Logic Layer: Implement a SummaryService that aggregates all income and expenses for a specific MM/YYYY period.

Configuration System: Allow the "Income Types" and "Expense Categories" to be fetched from a configuration table rather than hard-coded enums, allowing for user-defined categories.

Phase 2: Frontend (React)
Dynamic Forms: Create a form to add income that dynamically loads "Types" from the API.

The Planner View: A calendar or list-based view where users can apply income to specific dates.

Monthly Summary Dashboard:

Total Income (Sum of all types)

Total Foundational Expenses

Net Surplus/Deficit

State Management: Use TanStack Query (React Query) for data fetching and synchronization with the ASP.NET backend.

User Interface Goals
Clean Inputs: Quick-add buttons for recurring income like "Monthly IT Contract."
Visual Totals: High-level cards at the top of the screen showing "Expected vs. Actual" for the current month.

Timeframe Filtering: Toggle between monthly and quarterly views to see dividend clusters.

User accounts will need to authenticate with a secure logon so all income and expense plans are totally
private.
An account key or token must be generated for each user so other portfolio management tools
can import and export information.

Antigravity Execution Instructions
Step 1: Initialize the ASP.NET Core Web API project with Swagger support.
Step 2: Scaffold the Entity Framework context and migrations for the models defined above.

Step 3: Generate the React frontend using the Antigravity React-MVC template.

Step 4: Map the IncomeSource frequency logic to ensure "Quarterly" items appear correctly in the relevant monthly summaries.