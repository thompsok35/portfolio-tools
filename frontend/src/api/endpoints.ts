import api from './client';
import type {
  AuthResponse,
  CreateExpenseCategoryRequest,
  CreateIncomeSourceRequest,
  ExpenseCategory,
  IncomeSource,
  IncomeType,
  MonthlySummary,
  QuarterlySummary,
  UpdateExpenseCategoryRequest,
  UpdateIncomeSourceRequest,
} from '../types';

// Auth
export const register = (data: { email: string; password: string; username: string }) =>
  api.post<AuthResponse>('/auth/register', data).then((r) => r.data);

export const login = (data: { email: string; password: string }) =>
  api.post<AuthResponse>('/auth/login', data).then((r) => r.data);

export const getMe = () => api.get<AuthResponse>('/auth/me').then((r) => r.data);

export const regenerateApiToken = () =>
  api.post<{ apiToken: string }>('/auth/regenerate-api-token').then((r) => r.data);

// Income Types
export const getIncomeTypes = () =>
  api.get<IncomeType[]>('/incometypes').then((r) => r.data);

export const createIncomeType = (name: string) =>
  api.post<IncomeType>('/incometypes', { name }).then((r) => r.data);

export const deleteIncomeType = (id: string) =>
  api.delete(`/incometypes/${id}`);

// Income Sources
export const getIncomeSources = () =>
  api.get<IncomeSource[]>('/incomesources').then((r) => r.data);

export const getIncomeSource = (id: string) =>
  api.get<IncomeSource>(`/incomesources/${id}`).then((r) => r.data);

export const createIncomeSource = (data: CreateIncomeSourceRequest) =>
  api.post<IncomeSource>('/incomesources', data).then((r) => r.data);

export const updateIncomeSource = (id: string, data: UpdateIncomeSourceRequest) =>
  api.put<IncomeSource>(`/incomesources/${id}`, data).then((r) => r.data);

export const deleteIncomeSource = (id: string) =>
  api.delete(`/incomesources/${id}`);

// Expense Categories
export const getExpenseCategories = () =>
  api.get<ExpenseCategory[]>('/expensecategories').then((r) => r.data);

export const getExpenseCategory = (id: string) =>
  api.get<ExpenseCategory>(`/expensecategories/${id}`).then((r) => r.data);

export const createExpenseCategory = (data: CreateExpenseCategoryRequest) =>
  api.post<ExpenseCategory>('/expensecategories', data).then((r) => r.data);

export const updateExpenseCategory = (id: string, data: UpdateExpenseCategoryRequest) =>
  api.put<ExpenseCategory>(`/expensecategories/${id}`, data).then((r) => r.data);

export const deleteExpenseCategory = (id: string) =>
  api.delete(`/expensecategories/${id}`);

// Summary
export const getMonthlySummary = (year: number, month: number) =>
  api.get<MonthlySummary>(`/summary/monthly/${year}/${month}`).then((r) => r.data);

export const getQuarterlySummary = (year: number, quarter: number) =>
  api.get<QuarterlySummary>(`/summary/quarterly/${year}/${quarter}`).then((r) => r.data);
