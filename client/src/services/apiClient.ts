import type { AppConfigCategory, ExpenseCategory, IncomeSource, SummaryDashboardStats, Plan, UserProfile, PortfolioIntegration, BankAccount } from '../types/models';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';
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

    groupExpenses: async (planId: string, expenseIds: string[], groupName: string): Promise<{ count: number, groupName: string }> => {
        const res = await fetchWithAuth(`${API_BASE_URL}/ExpenseCategories/group`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ planId, expenseIds, groupName })
        });
        if (!res.ok) throw new Error('Failed to group expenses');
        return res.json();
    },

    ungroupExpenses: async (planId: string, expenseIds: string[]): Promise<{ count: number }> => {
        const res = await fetchWithAuth(`${API_BASE_URL}/ExpenseCategories/ungroup`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ planId, expenseIds })
        });
        if (!res.ok) throw new Error('Failed to ungroup expenses');
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
    },

    // Account Profile (General)
    getProfile: async (): Promise<UserProfile> => {
        const res = await fetchWithAuth(`${API_BASE_URL}/Profile`);
        if (!res.ok) throw new Error('Failed to fetch user profile');
        return res.json();
    },

    updateProfile: async (data: UserProfile): Promise<void> => {
        const res = await fetchWithAuth(`${API_BASE_URL}/Profile`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        if (!res.ok) throw new Error('Failed to update user profile');
    },

    changePassword: async (data: any): Promise<{ message: string }> => {
        const res = await fetchWithAuth(`${API_BASE_URL}/Profile/change-password`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        if (!res.ok) {
            const errorData = await res.json().catch(() => ({}));
            throw new Error(errorData.message || 'Failed to change password');
        }
        return res.json();
    },

    verifySharedEmail: async (): Promise<{ status: string }> => {
        const res = await fetchWithAuth(`${API_BASE_URL}/Profile/verify-email`, {
            method: 'POST'
        });
        if (!res.ok) throw new Error('Failed to verify shared email');
        return res.json();
    },

    // Plan Shares
    getPlanShares: async (planId: string): Promise<any[]> => {
        const res = await fetchWithAuth(`${API_BASE_URL}/PlanShares/${planId}`);
        if (!res.ok) throw new Error('Failed to fetch plan shares');
        return res.json();
    },

    createPlanShare: async (planId: string, sharedWithEmail: string): Promise<any> => {
        const res = await fetchWithAuth(`${API_BASE_URL}/PlanShares`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ planId, sharedWithEmail, status: 'Active' })
        });
        if (!res.ok) throw new Error('Failed to create plan share');
        return res.json();
    },

    deletePlanShare: async (id: string): Promise<void> => {
        const res = await fetchWithAuth(`${API_BASE_URL}/PlanShares/${id}`, {
            method: 'DELETE',
        });
        if (!res.ok) throw new Error('Failed to delete plan share');
    },

    // Integrations
    getIntegrations: async (): Promise<PortfolioIntegration[]> => {
        const res = await fetchWithAuth(`${API_BASE_URL}/Integrations`);
        if (!res.ok) throw new Error('Failed to fetch integrations');
        return res.json();
    },

    createIntegration: async (data: Omit<PortfolioIntegration, 'id'>): Promise<PortfolioIntegration> => {
        const res = await fetchWithAuth(`${API_BASE_URL}/Integrations`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        if (!res.ok) throw new Error('Failed to create integration');
        return res.json();
    },

    deleteIntegration: async (id: string): Promise<void> => {
        const res = await fetchWithAuth(`${API_BASE_URL}/Integrations/${id}`, { method: 'DELETE' });
        if (!res.ok) throw new Error('Failed to delete integration');
    },

    // Bank Accounts
    getBankAccounts: async (): Promise<BankAccount[]> => {
        const res = await fetchWithAuth(`${API_BASE_URL}/BankAccounts`);
        if (!res.ok) throw new Error('Failed to fetch bank accounts');
        return res.json();
    },

    createBankAccount: async (data: Omit<BankAccount, 'id'>): Promise<BankAccount> => {
        const res = await fetchWithAuth(`${API_BASE_URL}/BankAccounts`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        if (!res.ok) throw new Error('Failed to create bank account');
        return res.json();
    },

    deleteBankAccount: async (id: string): Promise<void> => {
        const res = await fetchWithAuth(`${API_BASE_URL}/BankAccounts/${id}`, { method: 'DELETE' });
        if (!res.ok) throw new Error('Failed to delete bank account');
    }
};
