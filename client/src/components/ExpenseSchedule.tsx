import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../services/apiClient';
import { DollarSign, WalletCards, Edit2, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { ExpenseForm } from './ExpenseForm';
import { useAuth } from '../contexts/AuthContext';
import { LayoutGrid, List } from 'lucide-react';

export const ExpenseSchedule = () => {
    const { activePlanId } = useAuth();
    const queryClient = useQueryClient();
    const [editingId, setEditingId] = useState<string | null>(null);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [viewMode, setViewMode] = useState<'cards' | 'list'>('cards');

    const { data: expenses, isLoading, error } = useQuery({
        queryKey: ['expenseCategories', activePlanId],
        queryFn: () => activePlanId ? apiClient.getExpenseCategories(activePlanId) : Promise.resolve([]),
        enabled: !!activePlanId,
    });

    const deleteMutation = useMutation({
        mutationFn: (id: string) => apiClient.deleteExpenseCategory(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['expenseCategories', activePlanId] });
            queryClient.invalidateQueries({ queryKey: ['monthlySummary'] });
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

    if (isLoading) return <div className="text-center p-8 text-color-text-muted">Loading expenses...</div>;
    if (error) return <div className="text-center p-8 text-color-danger">Failed to load expenses.</div>;

    const expenseList = expenses || [];

    return (
        <div className="bg-color-surface rounded-xl shadow-sm border border-slate-200 p-6 min-h-[400px]">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-color-text-main flex items-center gap-2">
                    <WalletCards className="h-5 w-5 text-color-danger" />
                    Expenses Schedule
                </h2>
                <div className="flex items-center bg-slate-100 rounded-lg p-1">
                    <button
                        onClick={() => setViewMode('cards')}
                        className={`p-1.5 rounded-md transition-colors ${viewMode === 'cards' ? 'bg-white shadow-sm text-color-primary' : 'text-slate-500 hover:text-slate-700'}`}
                        title="Card View"
                    >
                        <LayoutGrid className="h-4 w-4" />
                    </button>
                    <button
                        onClick={() => setViewMode('list')}
                        className={`p-1.5 rounded-md transition-colors ${viewMode === 'list' ? 'bg-white shadow-sm text-color-primary' : 'text-slate-500 hover:text-slate-700'}`}
                        title="List View"
                    >
                        <List className="h-4 w-4" />
                    </button>
                </div>
            </div>

            {expenseList.length === 0 ? (
                <div className="text-center p-12 text-color-text-muted border-2 border-dashed border-slate-200 rounded-lg">
                    No expected expenses. Use the form above to add your monthly expenses.
                </div>
            ) : (
                <div className={viewMode === 'cards' ? "grid gap-4 items-start md:grid-cols-2 lg:grid-cols-3" : "flex flex-col gap-3"}>
                    {expenseList.map((expense) => (
                        <div key={expense.id} className={editingId === expense.id ? "col-span-full" : ""}>
                            {deletingId === expense.id ? (
                                <div className="border border-red-200 bg-red-50 rounded-lg p-6 flex flex-col items-center justify-center text-center shadow-inner h-full animate-in fade-in duration-200">
                                    <Trash2 className="h-8 w-8 text-red-500 mb-3" />
                                    <h4 className="font-semibold text-color-text-main mb-1">Delete "{expense.name}"?</h4>
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
                                            onClick={() => handleConfirmDelete(expense.id)}
                                            className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded hover:bg-red-700 transition-colors"
                                            disabled={deleteMutation.isPending}
                                        >
                                            {deleteMutation.isPending ? 'Deleting...' : 'Yes, Delete'}
                                        </button>
                                    </div>
                                </div>
                            ) : editingId === expense.id ? (
                                <ExpenseForm
                                    initialData={expense}
                                    onSuccess={() => setEditingId(null)}
                                    onCancel={() => setEditingId(null)}
                                />
                            ) : viewMode === 'cards' ? (
                                <div className="border border-slate-100 bg-slate-50 rounded-lg p-4 hover:shadow-md transition-shadow relative h-full">
                                    <div className="flex justify-between items-start mb-3">
                                        <h4 className="font-semibold text-color-text-main pr-16">{expense.name}</h4>
                                        <div className="absolute top-4 right-4 flex gap-1">
                                            <button
                                                onClick={() => setEditingId(expense.id)}
                                                className="p-1.5 text-slate-400 hover:text-color-primary hover:bg-slate-200 rounded-md transition-all"
                                                title="Edit Expense"
                                            >
                                                <Edit2 className="h-4 w-4" />
                                            </button>
                                            <button
                                                onClick={() => setDeletingId(expense.id)}
                                                className="p-1.5 text-slate-400 hover:text-color-danger hover:bg-slate-200 rounded-md transition-all"
                                                title="Delete Expense"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </div>

                                    <div className="mb-3 flex flex-wrap gap-2">
                                        <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${expense.isFixed ? 'bg-red-100 text-red-800' : 'bg-orange-100 text-orange-800'}`}>
                                            {expense.isFixed ? 'Fixed' : 'Variable'}
                                        </span>
                                        <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800">
                                            {expense.frequency === 0 ? 'One-Time' :
                                                expense.frequency === 1 ? 'Monthly' :
                                                    expense.frequency === 2 ? 'Quarterly' : 'Yearly'}
                                        </span>
                                    </div>

                                    <div className="flex items-center gap-2 mb-2 text-color-text-muted text-sm">
                                        Starts: {new Date(expense.targetDate).toLocaleDateString()}
                                    </div>

                                    <div className="flex items-center gap-2 mb-2 text-color-text-muted">
                                        <DollarSign className="h-4 w-4" />
                                        <span className="text-lg font-bold text-color-text-main">
                                            ${expense.plannedAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                        </span>
                                    </div>
                                </div>
                            ) : (
                                <div className="border border-slate-100 bg-slate-50 rounded-lg p-3 hover:shadow-md transition-shadow flex items-center justify-between gap-4">
                                    <div className="flex-1 font-semibold text-color-text-main truncate pr-4">
                                        {expense.name}
                                    </div>
                                    <div className="text-sm text-color-text-muted hidden md:block w-32 shrink-0">
                                        Starts: {new Date(expense.targetDate).toLocaleDateString()}
                                    </div>
                                    <div className="w-24 shrink-0 text-right font-bold text-color-text-main">
                                        ${expense.plannedAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                    </div>
                                    <div className="flex gap-1 shrink-0 ml-2">
                                        <button
                                            onClick={() => setEditingId(expense.id)}
                                            className="p-1.5 text-slate-400 hover:text-color-primary hover:bg-slate-200 rounded-md transition-all"
                                            title="Edit Expense"
                                        >
                                            <Edit2 className="h-4 w-4" />
                                        </button>
                                        <button
                                            onClick={() => setDeletingId(expense.id)}
                                            className="p-1.5 text-slate-400 hover:text-color-danger hover:bg-slate-200 rounded-md transition-all"
                                            title="Delete Expense"
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
