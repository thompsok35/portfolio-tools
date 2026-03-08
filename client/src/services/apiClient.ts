import type { AppConfigCategory, ExpenseCategory, IncomeSource, SummaryDashboardStats } from '../types/models';

const API_BASE_URL = 'http://localhost:5031/api'; // Standard ASP.NET Core dev port, can adjust based on launchSettings

export const apiClient = {
    // Income Sources
    getIncomeSources: async (): Promise<IncomeSource[]> => {
        const res = await fetch(`${API_BASE_URL}/IncomeSources`);
        if (!res.ok) throw new Error('Failed to fetch income sources');
        return res.json();
    },

    createIncomeSource: async (data: Omit<IncomeSource, 'id'>): Promise<IncomeSource> => {
        const res = await fetch(`${API_BASE_URL}/IncomeSources`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        if (!res.ok) throw new Error('Failed to create income source');
        return res.json();
    },

    updateIncomeSource: async (id: string, data: IncomeSource): Promise<void> => {
        const res = await fetch(`${API_BASE_URL}/IncomeSources/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        if (!res.ok) throw new Error('Failed to update income source');
    },

    deleteIncomeSource: async (id: string): Promise<void> => {
        const res = await fetch(`${API_BASE_URL}/IncomeSources/${id}`, { method: 'DELETE' });
        if (!res.ok) throw new Error('Failed to delete income source');
    },

    // Expense Categories
    getExpenseCategories: async (): Promise<ExpenseCategory[]> => {
        const res = await fetch(`${API_BASE_URL}/ExpenseCategories`);
        if (!res.ok) throw new Error('Failed to fetch expense categories');
        return res.json();
    },

    createExpenseCategory: async (data: Omit<ExpenseCategory, 'id'>): Promise<ExpenseCategory> => {
        const res = await fetch(`${API_BASE_URL}/ExpenseCategories`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        if (!res.ok) throw new Error('Failed to create expense category');
        return res.json();
    },

    // Summaries
    getMonthlySummary: async (year: number, month: number): Promise<SummaryDashboardStats> => {
        const res = await fetch(`${API_BASE_URL}/Summary/${year}/${month}`);
        if (!res.ok) throw new Error('Failed to fetch monthly summary');
        return res.json();
    },

    // Configurations
    getConfigByGroup: async (group: string): Promise<AppConfigCategory[]> => {
        const res = await fetch(`${API_BASE_URL}/AppConfig/${group}`);
        if (!res.ok) throw new Error(`Failed to fetch config group: ${group}`);
        return res.json();
    }
};
