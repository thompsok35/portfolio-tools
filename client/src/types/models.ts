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
    categoryGroup?: string;
    planId: string;
}

export interface AppConfigCategory {
    id: string;
    group: string;
    value: string;
}

export interface ExpectedIncomeItem extends IncomeSource {
    isReconciled: boolean;
    realizedAmount: number;
}

export interface SummaryDashboardStats {
    totalIncome: number;
    totalExpenses: number;
    netSurplusDeficit: number;
    ytdIncome: number;
    ytdExpenses: number;
    ytdNetSurplusDeficit: number;
    expectedIncomes: ExpectedIncomeItem[];
}

export interface CsvImportProfile {
    id?: string;
    planId: string;
    brokerName: string;
    dateColumn: string;
    dateFormat: string;
    symbolColumn: string;
    actionColumn: string;
    amountColumn: string;
    dividendKeyword: string;
    optionKeyword: string;
}

export interface ReconcileRequest {
    planId: string;
    incomeSourceId: string;
    year: number;
    month: number;
    realizedIncome: number;
}

export interface UserProfile {
    id?: string;
    userId?: string;
    accountName?: string;
    friendlyName?: string;
}

export interface PlanShare {
    id?: string;
    planId: string;
    sharedWithEmail: string;
    status: string;
    createdAt?: string;
}

export interface PortfolioIntegration {
    id?: string;
    userId?: string;
    planId: string;
    nickname: string;
    encryptedApiAccessToken: string;
    portfolioEndpointUrl: string;
    accountNumber?: string;
}

export interface BankAccount {
    id?: string;
    userId?: string;
    bankName: string;
    accountName?: string;
    accountType: string;
}
