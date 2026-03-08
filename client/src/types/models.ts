export type IncomeFrequency = 0 | 1 | 2 | 3; // BiWeekly, Monthly, Quarterly, Yearly

export interface IncomeSource {
    id: string;
    amount: number;
    source: string;
    type: string;
    frequency: IncomeFrequency;
    targetDate: string; // ISO 8601 string from backend
    description: string;
}

export interface ExpenseCategory {
    id: string;
    name: string;
    isFixed: boolean;
    plannedAmount: number;
}

export interface AppConfigCategory {
    id: string;
    group: string;
    value: string;
}

export interface SummaryDashboardStats {
    totalIncome: number;
    totalExpenses: number;
    netSurplusDeficit: number;
    expectedIncomes: IncomeSource[];
}
