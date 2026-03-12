import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../services/apiClient';
import { useState } from 'react';
import type { ExpenseCategory } from '../types/models';
import { PlusCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface ExpenseFormProps {
    initialData?: ExpenseCategory;
    onSuccess?: () => void;
    onCancel?: () => void;
}

export const ExpenseForm = ({ initialData, onSuccess, onCancel }: ExpenseFormProps) => {
    const { activePlanId } = useAuth();
    const queryClient = useQueryClient();
    const isEditMode = !!initialData;
    const [isOpen, setIsOpen] = useState(isEditMode);

    const [formData, setFormData] = useState({
        name: initialData?.name || '',
        plannedAmount: initialData?.plannedAmount.toString() || '',
        isFixed: initialData?.isFixed ?? true,
        frequency: initialData?.frequency ?? 1, // Default Monthly
        targetDate: initialData?.targetDate
            ? new Date(initialData.targetDate).toISOString().split('T')[0]
            : new Date().toISOString().split('T')[0],
        websiteUrl: initialData?.websiteUrl || '',
        userName: initialData?.userName || '',
        encryptedPassword: initialData?.encryptedPassword || '',
        planId: initialData?.planId || activePlanId || '',
    });

    const { data: plans } = useQuery({
        queryKey: ['plans'],
        queryFn: apiClient.getPlans
    });

    const mutation = useMutation({
        mutationFn: async (data: any) => {
            if (isEditMode && initialData) {
                await apiClient.updateExpenseCategory(initialData.id, { ...data, id: initialData.id });
                return null;
            }
            return apiClient.createExpenseCategory(data);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['expenseCategories'] });
            queryClient.invalidateQueries({ queryKey: ['monthlySummary'] });
            if (onSuccess) onSuccess();

            if (!isEditMode) {
                setIsOpen(false);
                setFormData({
                    name: '',
                    plannedAmount: '',
                    isFixed: true,
                    frequency: 1,
                    targetDate: new Date().toISOString().split('T')[0],
                    websiteUrl: '',
                    userName: '',
                    encryptedPassword: '',
                    planId: activePlanId || ''
                });
            }
        }
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!activePlanId) {
            alert("No active plan selected.");
            return;
        }

        mutation.mutate({
            ...formData,
            planId: formData.planId || activePlanId,
            plannedAmount: parseFloat(formData.plannedAmount),
            frequency: parseInt(formData.frequency.toString()),
            targetDate: new Date(formData.targetDate).toISOString()
        });
    };

    if (!isOpen && !isEditMode) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                disabled={!activePlanId}
                className="flex items-center gap-2 bg-color-danger hover:bg-red-600 text-white px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
                <PlusCircle className="h-4 w-4" />
                Add Expense
            </button>
        );
    }

    const handleCancelClick = () => {
        if (onCancel) onCancel();
        if (!isEditMode) setIsOpen(false);
    };

    return (
        <form onSubmit={handleSubmit} className="bg-color-surface p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm mb-6">
            <h3 className="text-lg font-semibold mb-4 text-color-text-main">
                {isEditMode ? 'Edit Expense' : 'Record New Expense'}
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-color-text-main mb-1">Expense Name</label>
                    <input
                        type="text" required
                        placeholder="e.g. Groceries"
                        className="w-full bg-transparent border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-color-text-main"
                        value={formData.name}
                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-color-text-main mb-1">Amount</label>
                    <input
                        type="number" step="0.01" required
                        className="w-full bg-transparent border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-color-text-main"
                        value={formData.plannedAmount}
                        onChange={e => setFormData({ ...formData, plannedAmount: e.target.value })}
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-color-text-main mb-1">Type</label>
                    <select
                        className="w-full border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 bg-white dark:bg-slate-900 text-color-text-main"
                        value={formData.isFixed ? 'true' : 'false'}
                        onChange={e => setFormData({ ...formData, isFixed: e.target.value === 'true' })}
                    >
                        <option value="true">Fixed</option>
                        <option value="false">Variable</option>
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-color-text-main mb-1">Frequency</label>
                    <select
                        className="w-full border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 bg-white dark:bg-slate-900 text-color-text-main"
                        value={formData.frequency.toString()}
                        onChange={e => setFormData({ ...formData, frequency: parseInt(e.target.value) as any })}
                    >
                        <option value="0">One-Time</option>
                        <option value="1">Monthly</option>
                        <option value="2">Quarterly</option>
                        <option value="3">Yearly</option>
                    </select>
                </div>

                {isEditMode && plans && plans.length > 0 && (
                    <div>
                        <label className="block text-sm font-medium text-color-text-main mb-1">Assigned Plan</label>
                        <select
                            className="w-full border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 bg-white dark:bg-slate-900 text-color-text-main"
                            value={formData.planId}
                            onChange={e => setFormData({ ...formData, planId: e.target.value })}
                        >
                            {plans.map(p => (
                                <option key={p.id} value={p.id}>{p.name}</option>
                            ))}
                        </select>
                    </div>
                )}

                <div>
                    <label className="block text-sm font-medium text-color-text-main mb-1">Start Date</label>
                    <input
                        type="date" required
                        className="w-full bg-transparent border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-color-text-main"
                        value={formData.targetDate}
                        onChange={e => setFormData({ ...formData, targetDate: e.target.value })}
                    />
                </div>

                <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-4 border-t border-slate-100 dark:border-slate-800 pt-4 mt-2">
                    <div className="min-w-0">
                        <label className="block text-sm font-medium text-color-text-main mb-1 truncate" title="Website URL (Optional)">Website URL (Opt)</label>
                        <input
                            type="url"
                            placeholder="https://..."
                            className="w-full bg-transparent border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-color-text-main"
                            value={formData.websiteUrl}
                            onChange={e => setFormData({ ...formData, websiteUrl: e.target.value })}
                        />
                    </div>

                    <div className="min-w-0">
                        <label className="block text-sm font-medium text-color-text-main mb-1 truncate" title="User Name (Optional)">User Name (Opt)</label>
                        <input
                            type="text"
                            placeholder="Login ID or Email"
                            className="w-full bg-transparent border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-color-text-main"
                            value={formData.userName}
                            onChange={e => setFormData({ ...formData, userName: e.target.value })}
                        />
                    </div>

                    <div className="min-w-0">
                        <label className="block text-sm font-medium text-color-text-main mb-1 truncate" title="Account Password (Optional)">Password (Opt)</label>
                        <input
                            type="password"
                            autoComplete="new-password"
                            placeholder={isEditMode && initialData?.encryptedPassword === "***" ? "********" : "Enter password"}
                            className="w-full bg-transparent border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-color-text-main"
                            value={formData.encryptedPassword === "***" ? "" : formData.encryptedPassword}
                            onChange={e => setFormData({ ...formData, encryptedPassword: e.target.value })}
                        />
                        {isEditMode && initialData?.encryptedPassword === "***" && (
                            <p className="text-xs text-slate-500 mt-1 truncate" title="Leave blank to keep existing password.">Leave blank to keep existing.</p>
                        )}
                    </div>
                </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
                <button
                    type="button"
                    onClick={handleCancelClick}
                    className="px-4 py-2 text-color-text-muted hover:text-color-text-main font-medium"
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    disabled={mutation.isPending}
                    className="bg-color-danger hover:bg-red-600 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                >
                    {mutation.isPending ? 'Saving...' : (isEditMode ? 'Update Expense' : 'Save Expense')}
                </button>
            </div>
        </form>
    );
};
