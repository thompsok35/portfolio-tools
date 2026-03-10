export type IncomeFrequency = 0 | 1 | 2 | 3; // BiWeekly, Monthly, Quarterly, Yearly
export type ExpenseFrequency = 0 | 1 | 2 | 3; // OneTime, Monthly, Quarterly, Yearly

export interface Plan {
    id: string;
    name: string;
    createdAt: string;
}

export interface IncomeSource {
    id: string;
    amount: number;
    source: string;
    type: string;
    frequency: IncomeFrequency;
    targetDate: string; // ISO 8601 string from backend
    description: string;
    planId: string;
}

export interface ExpenseCategory {
    id: string;
    name: string;
    isFixed: boolean;
    plannedAmount: number;
    frequency: ExpenseFrequency;
    targetDate: string; // ISO 8601 string
    websiteUrl?: string;
    userName?: string;
    encryptedPassword?: string;
    planId: string;
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
