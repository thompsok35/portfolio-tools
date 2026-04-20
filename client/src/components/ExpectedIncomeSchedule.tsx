import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../services/apiClient';
import { Calendar, DollarSign, CalendarDays, Edit2, Trash2 } from 'lucide-react';
import type { IncomeFrequency } from '../types/models';
import { useState } from 'react';
import { IncomeSourceForm } from './IncomeSourceForm';
import { LinkedIncomeButton } from './LinkedIncomeButton';
import { useAuth } from '../contexts/AuthContext';
import { LayoutGrid, List } from 'lucide-react';
import { ImportStatementWizard } from './ImportStatementWizard';

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
    const [isWizardOpen, setIsWizardOpen] = useState(false);

    const now = new Date();
    const isPastOrCurrentMonth = year < now.getFullYear() || (year === now.getFullYear() && month <= now.getMonth() + 1);

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
                <div className="flex items-center gap-2">
                    <div className="flex items-center gap-0.5 bg-slate-100 dark:bg-slate-800 rounded-lg p-1">
                        <IncomeSourceForm />
                        <LinkedIncomeButton />
                        {isPastOrCurrentMonth && (
                            <button
                                onClick={() => setIsWizardOpen(true)}
                                className="p-1.5 rounded-md transition-colors text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 dark:text-slate-400 dark:hover:text-indigo-400 dark:hover:bg-indigo-900/20"
                                title="Import past statements to reconcile actual income"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><path d="M12 18v-6"/><path d="m9 15 3 3 3-3"/></svg>
                            </button>
                        )}
                    </div>
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
                                <div className="mt-6 mb-8 col-span-full">
                                    <IncomeSourceForm
                                        initialData={income}
                                        onSuccess={() => setEditingId(null)}
                                        onCancel={() => setEditingId(null)}
                                    />
                                </div>
                            ) : viewMode === 'cards' ? (
                                <div className="border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 rounded-lg p-4 hover:shadow-md transition-shadow relative h-full">
                                    <div className="flex justify-between items-start mb-3">
                                        <div className="pr-16 flex flex-col gap-1">
                                            <h4 className="font-semibold text-color-text-main">{income.source}</h4>
                                            {income.isReconciled && (
                                                <span className="text-[10px] font-bold tracking-wider text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/30 px-2 py-0.5 rounded-sm uppercase w-max">
                                                    Reconciled
                                                </span>
                                            )}
                                        </div>
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
                                        <DollarSign className="h-4 w-4 shrink-0" />
                                        <div className="flex flex-col">
                                            <span className={`text-lg font-bold ${income.isReconciled ? 'text-slate-400 dark:text-slate-500 line-through text-sm' : 'text-color-text-main'}`}>
                                                ${income.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                            </span>
                                            {income.isReconciled && (
                                                <span className="text-emerald-500 font-bold">
                                                    ${income.realizedAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                </span>
                                            )}
                                        </div>
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
                                        <div className="flex items-center gap-2">
                                            <span>{income.source}</span>
                                            {income.isReconciled && (
                                                <span className="text-[10px] font-bold tracking-wider text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/30 px-1.5 py-0.5 rounded-sm uppercase align-middle shrink-0">
                                                    Reconciled
                                                </span>
                                            )}
                                        </div>
                                        {income.description && (
                                            <span className="text-xs font-normal text-color-text-muted hidden xl:block truncate mt-0.5">
                                                {income.description}
                                            </span>
                                        )}
                                    </div>
                                    <div className="w-28 shrink-0 text-right flex flex-col items-end justify-center">
                                        <div className={`font-bold ${income.isReconciled ? 'text-slate-400 dark:text-slate-500 text-xs line-through' : 'text-color-text-main'}`}>
                                            ${income.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                        </div>
                                        {income.isReconciled && (
                                            <div className="text-emerald-500 font-bold text-sm">
                                                ${income.realizedAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                            </div>
                                        )}
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
            
            <ImportStatementWizard 
                isOpen={isWizardOpen} 
                onClose={() => setIsWizardOpen(false)} 
                year={year} 
                month={month} 
                expectedIncomes={expectedIncomes}
            />
        </div>
    );
};
