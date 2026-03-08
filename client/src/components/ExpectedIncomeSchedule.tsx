import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../services/apiClient';
import { Calendar, DollarSign, CalendarDays, Edit2, Trash2 } from 'lucide-react';
import type { IncomeFrequency } from '../types/models';
import { useState } from 'react';
import { IncomeSourceForm } from './IncomeSourceForm';

interface ExpectedIncomeScheduleProps {
    year: number;
    month: number;
}

const frequencyMap: Record<IncomeFrequency, string> = {
    0: 'Bi-Weekly',
    1: 'Monthly',
    2: 'Quarterly',
    3: 'Yearly'
};

export const ExpectedIncomeSchedule = ({ year, month }: ExpectedIncomeScheduleProps) => {
    const queryClient = useQueryClient();
    const [editingId, setEditingId] = useState<string | null>(null);
    const [deletingId, setDeletingId] = useState<string | null>(null);

    const { data: summary, isLoading, error } = useQuery({
        queryKey: ['monthlySummary', year, month],
        queryFn: () => apiClient.getMonthlySummary(year, month),
    });

    const deleteMutation = useMutation({
        mutationFn: (id: string) => apiClient.deleteIncomeSource(id),
        onSuccess: (_, deletedId) => {
            console.log(`Successfully deleted income source: ${deletedId}`);
            queryClient.invalidateQueries({ queryKey: ['monthlySummary', year, month] });
        },
        onError: (err) => {
            console.error("Delete mutation failed:", err);
            alert("Failed to delete record. See console for details.");
        }
    });

    const handleConfirmDelete = (id: string) => {
        deleteMutation.mutate(id);
        setDeletingId(null);
    };

    if (isLoading) return <div className="text-center p-8 text-color-text-muted">Loading schedule...</div>;
    if (error) return <div className="text-center p-8 text-color-danger">Failed to load schedule.</div>;

    const expectedIncomes = summary?.expectedIncomes || [];

    return (
        <div className="bg-color-surface rounded-xl shadow-sm border border-slate-200 p-6 min-h-[400px]">
            <h2 className="text-xl font-semibold mb-6 text-color-text-main flex items-center gap-2">
                <CalendarDays className="h-5 w-5 text-color-primary" />
                Expected Income Schedule
            </h2>

            {expectedIncomes.length === 0 ? (
                <div className="text-center p-12 text-color-text-muted border-2 border-dashed border-slate-200 rounded-lg">
                    No expected income for this period. Use the form above to register recurring items.
                </div>
            ) : (
                <div className="grid gap-4 items-start md:grid-cols-2 lg:grid-cols-3">
                    {expectedIncomes.map((income) => (
                        <div key={income.id}>
                            {deletingId === income.id ? (
                                <div className="border border-red-200 bg-red-50 rounded-lg p-6 flex flex-col items-center justify-center text-center shadow-inner h-full animate-in fade-in duration-200">
                                    <Trash2 className="h-8 w-8 text-red-500 mb-3" />
                                    <h4 className="font-semibold text-color-text-main mb-1">Delete "{income.source}"?</h4>
                                    <p className="text-sm text-color-text-muted mb-6">This action cannot be undone.</p>
                                    <div className="flex gap-3">
                                        <button
                                            onClick={() => setDeletingId(null)}
                                            className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded hover:bg-slate-50 transition-colors"
                                            disabled={deleteMutation.isPending}
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={() => handleConfirmDelete(income.id)}
                                            className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded hover:bg-red-700 transition-colors"
                                            disabled={deleteMutation.isPending}
                                        >
                                            {deleteMutation.isPending ? 'Deleting...' : 'Yes, Delete'}
                                        </button>
                                    </div>
                                </div>
                            ) : editingId === income.id ? (
                                <IncomeSourceForm
                                    initialData={income}
                                    onSuccess={() => setEditingId(null)}
                                    onCancel={() => setEditingId(null)}
                                />
                            ) : (
                                <div className="border border-slate-100 bg-slate-50 rounded-lg p-4 hover:shadow-md transition-shadow relative">
                                    <div className="flex justify-between items-start mb-3">
                                        <h4 className="font-semibold text-color-text-main pr-16">{income.source}</h4>
                                        <div className="absolute top-4 right-4 flex gap-1">
                                            <button
                                                onClick={() => setEditingId(income.id)}
                                                className="p-1.5 text-slate-400 hover:text-color-primary hover:bg-slate-200 rounded-md transition-all"
                                                title="Edit Income"
                                            >
                                                <Edit2 className="h-4 w-4" />
                                            </button>
                                            <button
                                                onClick={() => setDeletingId(income.id)}
                                                className="p-1.5 text-slate-400 hover:text-color-danger hover:bg-slate-200 rounded-md transition-all"
                                                title="Delete Income"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </div>

                                    <div className="mb-3">
                                        <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full inline-block">
                                            {income.type}
                                        </span>
                                    </div>

                                    <div className="flex items-center gap-2 mb-2 text-color-text-muted">
                                        <DollarSign className="h-4 w-4" />
                                        <span className="text-lg font-bold text-color-text-main">
                                            ${income.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                        </span>
                                    </div>

                                    <div className="flex items-center gap-2 text-sm text-color-text-muted">
                                        <Calendar className="h-4 w-4" />
                                        <span>{frequencyMap[income.frequency]}</span>
                                    </div>

                                    {income.description && (
                                        <p className="text-sm text-color-text-muted mt-3 pt-3 border-t border-slate-200">
                                            {income.description}
                                        </p>
                                    )}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
