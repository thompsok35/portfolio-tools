import type { AppConfigCategory, ExpenseCategory, IncomeSource, SummaryDashboardStats, Plan } from '../types/models';

const API_BASE_URL = 'http://localhost:5031/api'; // Standard ASP.NET Core dev port, can adjust based on launchSettings

async function fetchWithAuth(url: string, options: RequestInit = {}) {
    const token = localStorage.getItem('token');

    const headers = new Headers(options.headers || {});
    if (token) {
        headers.set('Authorization', `Bearer ${token}`);
    }

    const response = await fetch(url, { ...options, headers });

    if (response.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('email');
        window.location.href = '/login';
        throw new Error('Session expired. Please log in again.');
    }

    return response;
}

export const apiClient = {
    // Auth
    register: async (email: string, password: string) => {
        const res = await fetch(`${API_BASE_URL}/Auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        if (!res.ok) {
            const errorData = await res.json().catch(() => ({}));
            throw new Error(errorData.message || 'Registration failed');
        }
        return res.json();
    },

    login: async (email: string, password: string) => {
        const res = await fetch(`${API_BASE_URL}/Auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        if (!res.ok) {
            const errorData = await res.json().catch(() => ({}));
            throw new Error(errorData.message || 'Invalid email or password');
        }
        return res.json();
    },

    // Plans
    getPlans: async (): Promise<Plan[]> => {
        const res = await fetchWithAuth(`${API_BASE_URL}/Plans`);
        if (!res.ok) throw new Error('Failed to fetch plans');
        return res.json();
    },

    createPlan: async (data: Omit<Plan, 'id' | 'createdAt'>): Promise<Plan> => {
        const res = await fetchWithAuth(`${API_BASE_URL}/Plans`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        if (!res.ok) throw new Error('Failed to create plan');
        return res.json();
    },

    // Income Sources
    getIncomeSources: async (planId: string): Promise<IncomeSource[]> => {
        const res = await fetchWithAuth(`${API_BASE_URL}/IncomeSources?planId=${planId}`);
        if (!res.ok) throw new Error('Failed to fetch income sources');
        return res.json();
    },

    createIncomeSource: async (data: Omit<IncomeSource, 'id'>): Promise<IncomeSource> => {
        const res = await fetchWithAuth(`${API_BASE_URL}/IncomeSources`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        if (!res.ok) throw new Error('Failed to create income source');
        return res.json();
    },

    updateIncomeSource: async (id: string, data: IncomeSource): Promise<void> => {
        const res = await fetchWithAuth(`${API_BASE_URL}/IncomeSources/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        if (!res.ok) throw new Error('Failed to update income source');
    },

    deleteIncomeSource: async (id: string): Promise<void> => {
        const res = await fetchWithAuth(`${API_BASE_URL}/IncomeSources/${id}`, { method: 'DELETE' });
        if (!res.ok) throw new Error('Failed to delete income source');
    },

    getExpenseCategories: async (planId: string): Promise<ExpenseCategory[]> => {
        const res = await fetchWithAuth(`${API_BASE_URL}/ExpenseCategories?planId=${planId}`);
        if (!res.ok) throw new Error('Failed to fetch expense categories');
        return res.json();
    },

    createExpenseCategory: async (data: Omit<ExpenseCategory, 'id'>): Promise<ExpenseCategory> => {
        const res = await fetchWithAuth(`${API_BASE_URL}/ExpenseCategories`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        if (!res.ok) throw new Error('Failed to create expense category');
        return res.json();
    },

    updateExpenseCategory: async (id: string, data: ExpenseCategory): Promise<void> => {
        const res = await fetchWithAuth(`${API_BASE_URL}/ExpenseCategories/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        if (!res.ok) throw new Error('Failed to update expense category');
    },

    deleteExpenseCategory: async (id: string): Promise<void> => {
        const res = await fetchWithAuth(`${API_BASE_URL}/ExpenseCategories/${id}`, { method: 'DELETE' });
        if (!res.ok) throw new Error('Failed to delete expense category');
    },

    getExpensePassword: async (id: string): Promise<{ password: string }> => {
        const res = await fetchWithAuth(`${API_BASE_URL}/ExpenseCategories/${id}/password`);
        if (!res.ok) throw new Error('Failed to retrieve decrypted password');
        return res.json();
    },

    // Summaries
    getMonthlySummary: async (year: number, month: number, planId: string): Promise<SummaryDashboardStats> => {
        const res = await fetchWithAuth(`${API_BASE_URL}/Summary/${year}/${month}?planId=${planId}`);
        if (!res.ok) throw new Error('Failed to fetch monthly summary');
        return res.json();
    },

    // Configurations
    getConfigByGroup: async (group: string): Promise<AppConfigCategory[]> => {
        const res = await fetchWithAuth(`${API_BASE_URL}/AppConfig/${group}`);
        if (!res.ok) throw new Error(`Failed to fetch config group: ${group}`);
        return res.json();
    }
};
