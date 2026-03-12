import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../services/apiClient';
import { DollarSign, WalletCards, Edit2, Trash2, Link, Key, User } from 'lucide-react';
import { useState } from 'react';
import { ExpenseForm } from './ExpenseForm';
import { useAuth } from '../contexts/AuthContext';
import { LayoutGrid, List as ListIcon } from 'lucide-react';

export const ExpenseSchedule = () => {
    const { activePlanId } = useAuth();
    const queryClient = useQueryClient();
    const [editingId, setEditingId] = useState<string | null>(null);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [viewMode, setViewMode] = useState<'cards' | 'list'>('cards');
    const [revealingPasswordId, setRevealingPasswordId] = useState<string | null>(null);
    const [revealedPasswords, setRevealedPasswords] = useState<Record<string, string>>({});

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

    const handleRevealPassword = async (id: string) => {
        if (revealedPasswords[id] !== undefined) {
            // Toggle off
            const next = { ...revealedPasswords };
            delete next[id];
            setRevealedPasswords(next);
            return;
        }

        try {
            setRevealingPasswordId(id);
            const res = await apiClient.getExpensePassword(id);
            setRevealedPasswords(prev => ({ ...prev, [id]: res.password }));
        } catch (err) {
            console.error(err);
            alert("Failed to retrieve decrypted password.");
        } finally {
            setRevealingPasswordId(null);
        }
    };

    if (isLoading) return <div className="text-center p-8 text-color-text-muted">Loading expenses...</div>;
    if (error) return <div className="text-center p-8 text-color-danger">Failed to load expenses.</div>;

    const expenseList = expenses || [];

    return (
        <div className="bg-color-surface rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-6 min-h-[400px]">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-color-text-main flex items-center gap-2">
                    <WalletCards className="h-5 w-5 text-color-danger" />
                    Expenses Schedule
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
                        <ListIcon className="h-4 w-4" />
                    </button>
                </div>
            </div>

            {expenseList.length === 0 ? (
                <div className="text-center p-12 text-color-text-muted border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-lg">
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
                                <div className="border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 rounded-lg p-4 hover:shadow-md transition-shadow relative h-full">
                                    <div className="flex justify-between items-start mb-3">
                                        <h4 className="font-semibold text-color-text-main pr-16">{expense.name}</h4>
                                        <div className="absolute top-4 right-4 flex gap-1">
                                            <button
                                                onClick={() => setEditingId(expense.id)}
                                                className="p-1.5 text-slate-400 hover:text-color-primary hover:bg-slate-200 dark:hover:bg-slate-700 rounded-md transition-all"
                                                title="Edit Expense"
                                            >
                                                <Edit2 className="h-4 w-4" />
                                            </button>
                                            <button
                                                onClick={() => setDeletingId(expense.id)}
                                                className="p-1.5 text-slate-400 hover:text-color-danger hover:bg-slate-200 dark:hover:bg-slate-700 rounded-md transition-all"
                                                title="Delete Expense"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </div>

                                    <div className="mb-3 flex flex-wrap gap-2">
                                        <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${expense.isFixed ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' : 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300'}`}>
                                            {expense.isFixed ? 'Fixed' : 'Variable'}
                                        </span>
                                        <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
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

                                    {(expense.websiteUrl || expense.userName || expense.encryptedPassword === "***") && (
                                        <div className="flex items-center gap-3 mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex-wrap">
                                            {expense.websiteUrl && (
                                                <a
                                                    href={expense.websiteUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex items-center gap-1.5 text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors mr-2"
                                                >
                                                    <Link className="h-3.5 w-3.5" />
                                                    Visit Site
                                                </a>
                                            )}
                                            {expense.userName && (
                                                <div className="flex items-center gap-1.5 text-sm font-medium text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800/50 px-2 py-0.5 rounded mr-2">
                                                    <User className="h-3.5 w-3.5" />
                                                    {expense.userName}
                                                </div>
                                            )}
                                            {expense.encryptedPassword === "***" && (
                                                <div className="flex items-center gap-2 ml-auto">
                                                    <button
                                                        onClick={() => handleRevealPassword(expense.id)}
                                                        disabled={revealingPasswordId === expense.id}
                                                        className="flex items-center gap-1 text-xs font-medium text-slate-500 hover:text-slate-700 transition-colors"
                                                    >
                                                        <Key className="h-3 w-3" />
                                                        {revealedPasswords[expense.id] !== undefined ? 'Hide Key' : 'Reveal Key'}
                                                    </button>
                                                    {revealedPasswords[expense.id] !== undefined && (
                                                        <span className="text-xs font-mono bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-color-text-main border border-slate-200 dark:border-slate-700">
                                                            {revealedPasswords[expense.id] || '(empty)'}
                                                        </span>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 rounded-lg p-3 hover:shadow-md transition-shadow flex items-center justify-between gap-4">
                                    <div className="flex-1 font-semibold text-color-text-main min-w-0 pr-4 flex items-center gap-2">
                                        <span className="truncate">{expense.name}</span>
                                        {expense.websiteUrl && (
                                            <a
                                                href={expense.websiteUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-blue-500 hover:text-blue-700 shrink-0"
                                                title="Open Website"
                                            >
                                                <Link className="h-4 w-4" />
                                            </a>
                                        )}
                                        {expense.userName && (
                                            <span
                                                className="text-slate-500 shrink-0 flex items-center gap-1"
                                                title={`Username: ${expense.userName}`}
                                            >
                                                <User className="h-4 w-4" />
                                            </span>
                                        )}
                                        {expense.encryptedPassword === "***" && (
                                            <button
                                                onClick={() => handleRevealPassword(expense.id)}
                                                className={`shrink-0 transition-colors ${revealedPasswords[expense.id] !== undefined ? 'text-green-600' : 'text-slate-400 hover:text-slate-600'}`}
                                                title={revealedPasswords[expense.id] !== undefined ? "Hide Password" : "Retrieve Password"}
                                            >
                                                <Key className="h-4 w-4" />
                                            </button>
                                        )}
                                        {revealedPasswords[expense.id] !== undefined && (
                                            <span className="text-xs font-mono bg-color-surface px-2 py-0.5 rounded text-color-text-main border border-slate-200 dark:border-slate-700 shrink-0 shadow-sm ml-2">
                                                {revealedPasswords[expense.id] || '(empty)'}
                                            </span>
                                        )}
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
                                            className="p-1.5 text-slate-400 hover:text-color-primary hover:bg-slate-200 dark:hover:bg-slate-700 rounded-md transition-all"
                                            title="Edit Expense"
                                        >
                                            <Edit2 className="h-4 w-4" />
                                        </button>
                                        <button
                                            onClick={() => setDeletingId(expense.id)}
                                            className="p-1.5 text-slate-400 hover:text-color-danger hover:bg-slate-200 dark:hover:bg-slate-700 rounded-md transition-all"
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
