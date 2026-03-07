export interface IncomeSource {
  id: string;
  amount: number;
  source: string;
  incomeTypeId: string;
  incomeTypeName?: string;
  frequency: number;
  targetDate: string;
  description: string;
  isActive: boolean;
}

export const IncomeFrequency = {
  BiMonthly: 0,
  Monthly: 1,
  Quarterly: 2,
  Yearly: 3,
} as const;

export type IncomeFrequency = (typeof IncomeFrequency)[keyof typeof IncomeFrequency];

export const IncomeFrequencyLabels: Record<number, string> = {
  [IncomeFrequency.BiMonthly]: 'Bi-Monthly',
  [IncomeFrequency.Monthly]: 'Monthly',
  [IncomeFrequency.Quarterly]: 'Quarterly',
  [IncomeFrequency.Yearly]: 'Yearly',
};

export interface IncomeType {
  id: string;
  name: string;
}

export interface ExpenseCategory {
  id: string;
  name: string;
  isFixed: boolean;
  plannedAmount: number;
  isActive: boolean;
}

export interface MonthlySummary {
  year: number;
  month: number;
  totalIncome: number;
  totalExpenses: number;
  netSurplusDeficit: number;
  incomeSources: IncomeSource[];
  expenseCategories: ExpenseCategory[];
  incomeByType: Record<string, number>;
}

export interface QuarterlySummary {
  year: number;
  quarter: number;
  totalIncome: number;
  totalExpenses: number;
  netSurplusDeficit: number;
  monthlyBreakdown: MonthlySummary[];
}

export interface AuthResponse {
  token: string;
  apiToken: string;
  userId: string;
  email: string;
  username: string;
  expiresAt: string;
}

export interface CreateIncomeSourceRequest {
  amount: number;
  source: string;
  incomeTypeId: string;
  frequency: number;
  targetDate: string;
  description: string;
}

export interface UpdateIncomeSourceRequest extends CreateIncomeSourceRequest {
  isActive: boolean;
}

export interface CreateExpenseCategoryRequest {
  name: string;
  isFixed: boolean;
  plannedAmount: number;
}

export interface UpdateExpenseCategoryRequest extends CreateExpenseCategoryRequest {
  isActive: boolean;
}

