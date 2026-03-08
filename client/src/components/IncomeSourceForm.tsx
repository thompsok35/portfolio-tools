import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../services/apiClient';
import { useState } from 'react';
import type { IncomeSource, IncomeFrequency } from '../types/models';
import { PlusCircle } from 'lucide-react';

interface IncomeSourceFormProps {
    initialData?: IncomeSource;
    onSuccess?: () => void;
    onCancel?: () => void;
}

export const IncomeSourceForm = ({ initialData, onSuccess, onCancel }: IncomeSourceFormProps) => {
    const queryClient = useQueryClient();
    const isEditMode = !!initialData;
    const [isOpen, setIsOpen] = useState(isEditMode);

    const [formData, setFormData] = useState({
        amount: initialData?.amount.toString() || '',
        source: initialData?.source || '',
        type: initialData?.type || 'Dividend',
        frequency: initialData?.frequency ?? (1 as IncomeFrequency),
        targetDate: initialData?.targetDate
            ? new Date(initialData.targetDate).toISOString().split('T')[0]
            : new Date().toISOString().split('T')[0],
        description: initialData?.description || ''
    });

    // Fetch dynamic categories
    const { data: incomeTypes } = useQuery({
        queryKey: ['config', 'IncomeType'],
        queryFn: () => apiClient.getConfigByGroup('IncomeType')
    });

    const mutation = useMutation({
        mutationFn: async (data: any) => {
            if (isEditMode && initialData) {
                await apiClient.updateIncomeSource(initialData.id, { ...data, id: initialData.id });
                return null;
            }
            return apiClient.createIncomeSource(data);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['monthlySummary'] });
            if (onSuccess) onSuccess();

            if (!isEditMode) {
                setIsOpen(false);
                setFormData({ ...formData, amount: '', source: '', description: '' });
            }
        }
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        mutation.mutate({
            ...formData,
            amount: parseFloat(formData.amount),
            targetDate: new Date(formData.targetDate).toISOString()
        });
    };

    if (!isOpen && !isEditMode) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                className="flex items-center gap-2 bg-color-primary hover:bg-color-primary-hover text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
                <PlusCircle className="h-4 w-4" />
                Add Expected Income
            </button>
        );
    }

    const handleCancelClick = () => {
        if (onCancel) onCancel();
        if (!isEditMode) setIsOpen(false);
    };

    return (
        <form onSubmit={handleSubmit} className="bg-color-surface p-6 rounded-xl border border-slate-200 shadow-sm mb-6">
            <h3 className="text-lg font-semibold mb-4 text-color-text-main">
                {isEditMode ? 'Edit Income Source' : 'Record New Income Source'}
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-color-text-main mb-1">Source Name</label>
                    <input
                        type="text" required
                        placeholder="e.g. Apple Dividends"
                        className="w-full border border-slate-300 rounded-lg px-3 py-2"
                        value={formData.source}
                        onChange={e => setFormData({ ...formData, source: e.target.value })}
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-color-text-main mb-1">Expected Amount</label>
                    <input
                        type="number" step="0.01" required
                        className="w-full border border-slate-300 rounded-lg px-3 py-2"
                        value={formData.amount}
                        onChange={e => setFormData({ ...formData, amount: e.target.value })}
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-color-text-main mb-1">Income Type</label>
                    <select
                        className="w-full border border-slate-300 rounded-lg px-3 py-2 bg-white"
                        value={formData.type}
                        onChange={e => setFormData({ ...formData, type: e.target.value })}
                    >
                        <option value="Dividend">Dividend</option>
                        <option value="Option Premium">Option Premium</option>
                        <option value="IT Contract">IT Contract</option>
                        <option value="Rental">Rental</option>
                        {/* Render dynamic ones fetched from backend */}
                        {incomeTypes?.map(type => (
                            <option key={type.id} value={type.value}>{type.value}</option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-color-text-main mb-1">Frequency</label>
                    <select
                        className="w-full border border-slate-300 rounded-lg px-3 py-2 bg-white"
                        value={formData.frequency}
                        onChange={e => setFormData({ ...formData, frequency: parseInt(e.target.value) as IncomeFrequency })}
                    >
                        <option value={0}>Bi-Weekly</option>
                        <option value={1}>Monthly</option>
                        <option value={2}>Quarterly</option>
                        <option value={3}>Yearly</option>
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-color-text-main mb-1">Target Date</label>
                    <input
                        type="date" required
                        className="w-full border border-slate-300 rounded-lg px-3 py-2"
                        value={formData.targetDate}
                        onChange={e => setFormData({ ...formData, targetDate: e.target.value })}
                    />
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
                    className="bg-color-primary hover:bg-color-primary-hover text-white px-6 py-2 rounded-lg font-medium transition-colors"
                >
                    {mutation.isPending ? 'Saving...' : (isEditMode ? 'Update Income' : 'Save Income')}
                </button>
            </div>
        </form>
    );
};
