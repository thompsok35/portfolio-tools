import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../services/apiClient';
import { Calendar, DollarSign, CalendarDays, Edit2, Trash2 } from 'lucide-react';
import type { IncomeFrequency } from '../types/models';
import { useState } from 'react';
import { IncomeSourceForm } from './IncomeSourceForm';
import { useAuth } from '../contexts/AuthContext';
import { LayoutGrid, List } from 'lucide-react';

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
    const { activePlanId } = useAuth();
    const queryClient = useQueryClient();
    const [editingId, setEditingId] = useState<string | null>(null);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [viewMode, setViewMode] = useState<'cards' | 'list'>('cards');

    const { data: summary, isLoading, error } = useQuery({
        queryKey: ['monthlySummary', year, month, activePlanId],
        queryFn: () => activePlanId ? apiClient.getMonthlySummary(year, month, activePlanId) : Promise.resolve(null),
        enabled: !!activePlanId,
    });

    const deleteMutation = useMutation({
        mutationFn: (id: string) => apiClient.deleteIncomeSource(id),
        onSuccess: (_, deletedId) => {
            console.log(`Successfully deleted income source: ${deletedId}`);
            queryClient.invalidateQueries({ queryKey: ['monthlySummary', year, month, activePlanId] });
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
        <div className="bg-color-surface rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-6 min-h-[400px]">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-color-text-main flex items-center gap-2">
                    <CalendarDays className="h-5 w-5 text-color-primary" />
                    Expected Income Schedule
                </h2>
                <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-lg p-1">
                    <button
                        onClick={() => setViewMode('cards')}
                        className={`p-1.5 rounded-md transition-colors ${viewMode === 'cards' ? 'bg-color-surface shadow-sm text-color-primary' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'}`}
                        title="Card View"
                    >
                        <LayoutGrid className="h-4 w-4" />
                    </button>
                    <button
                        onClick={() => setViewMode('list')}
                        className={`p-1.5 rounded-md transition-colors ${viewMode === 'list' ? 'bg-color-surface shadow-sm text-color-primary' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'}`}
                        title="List View"
                    >
                        <List className="h-4 w-4" />
                    </button>
                </div>
            </div>

            {expectedIncomes.length === 0 ? (
                <div className="text-center p-12 text-color-text-muted border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-lg">
                    No expected income for this period. Use the form above to register recurring items.
                </div>
            ) : (
                <div className={viewMode === 'cards' ? "grid gap-4 items-start md:grid-cols-2 lg:grid-cols-3" : "flex flex-col gap-3"}>
                    {expectedIncomes.map((income) => (
                        <div key={income.id} className={editingId === income.id ? "col-span-full" : ""}>
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
                            ) : viewMode === 'cards' ? (
                                <div className="border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 rounded-lg p-4 hover:shadow-md transition-shadow relative h-full">
                                    <div className="flex justify-between items-start mb-3">
                                        <h4 className="font-semibold text-color-text-main pr-16">{income.source}</h4>
                                        <div className="absolute top-4 right-4 flex gap-1">
                                            <button
                                                onClick={() => setEditingId(income.id)}
                                                className="p-1.5 text-slate-400 hover:text-color-primary hover:bg-slate-200 dark:hover:bg-slate-700 rounded-md transition-all"
                                                title="Edit Income"
                                            >
                                                <Edit2 className="h-4 w-4" />
                                            </button>
                                            <button
                                                onClick={() => setDeletingId(income.id)}
                                                className="p-1.5 text-slate-400 hover:text-color-danger hover:bg-slate-200 dark:hover:bg-slate-700 rounded-md transition-all"
                                                title="Delete Income"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </div>

                                    <div className="mb-3">
                                        <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 text-xs font-medium px-2.5 py-0.5 rounded-full inline-block">
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
                                        <p className="text-sm text-color-text-muted mt-3 pt-3 border-t border-slate-200 dark:border-slate-700">
                                            {income.description}
                                        </p>
                                    )}
                                </div>
                            ) : (
                                <div className="border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 rounded-lg p-3 hover:shadow-md transition-shadow flex items-center justify-between gap-4">
                                    <div className="flex-1 font-semibold text-color-text-main truncate pr-4">
                                        {income.source}
                                        {income.description && (
                                            <span className="ml-2 text-xs font-normal text-color-text-muted hidden xl:inline">
                                                - {income.description}
                                            </span>
                                        )}
                                    </div>
                                    <div className="w-28 shrink-0 text-right font-bold text-color-text-main">
                                        ${income.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                    </div>
                                    <div className="flex gap-1 shrink-0 ml-2">
                                        <button
                                            onClick={() => setEditingId(income.id)}
                                            className="p-1.5 text-slate-400 hover:text-color-primary hover:bg-slate-200 dark:hover:bg-slate-700 rounded-md transition-all"
                                            title="Edit Income"
                                        >
                                            <Edit2 className="h-4 w-4" />
                                        </button>
                                        <button
                                            onClick={() => setDeletingId(income.id)}
                                            className="p-1.5 text-slate-400 hover:text-color-danger hover:bg-slate-200 dark:hover:bg-slate-700 rounded-md transition-all"
                                            title="Delete Income"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
