import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../services/apiClient';
import { DollarSign, WalletCards, Edit2, Trash2, Link, Key, User, LayoutGrid, List as ListIcon, ChevronDown, ChevronRight, CheckSquare, Square, FolderPlus, FolderMinus } from 'lucide-react';
import { useState } from 'react';
import { ExpenseForm } from './ExpenseForm';
import { useAuth } from '../contexts/AuthContext';

interface ExpenseScheduleProps {
    year: number;
    month: number;
}

export const ExpenseSchedule = ({ year, month }: ExpenseScheduleProps) => {
    const { activePlanId } = useAuth();
    const queryClient = useQueryClient();
    const [editingId, setEditingId] = useState<string | null>(null);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [viewMode, setViewMode] = useState<'cards' | 'list'>('list');
    const [revealingPasswordId, setRevealingPasswordId] = useState<string | null>(null);
    const [revealedPasswords, setRevealedPasswords] = useState<Record<string, string>>({});

    // Grouping State
    const [selectedExpenseIds, setSelectedExpenseIds] = useState<string[]>([]);
    const [expandedGroups, setExpandedGroups] = useState<string[]>([]);
    const [isGrouping, setIsGrouping] = useState(false);
    const [groupNameInput, setGroupNameInput] = useState('');

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

    const groupMutation = useMutation({
        mutationFn: () => apiClient.groupExpenses(activePlanId!, selectedExpenseIds, groupNameInput),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['expenseCategories', activePlanId] });
            setSelectedExpenseIds([]);
            setIsGrouping(false);
            setGroupNameInput('');
        },
        onError: (err) => {
            console.error("Group mutation failed:", err);
            alert("Failed to group expenses.");
        }
    });

    const ungroupMutation = useMutation({
        mutationFn: (expenseIds: string[]) => apiClient.ungroupExpenses(activePlanId!, expenseIds),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['expenseCategories', activePlanId] });
        },
        onError: (err) => {
            console.error("Ungroup mutation failed:", err);
            alert("Failed to ungroup expenses.");
        }
    });

    const handleConfirmDelete = (id: string) => {
        deleteMutation.mutate(id);
        setDeletingId(null);
    };

    const handleRevealPassword = async (id: string) => {
        if (revealedPasswords[id] !== undefined) {
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

    const toggleSelection = (id: string) => {
        setSelectedExpenseIds(prev =>
            prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
        );
    };

    const toggleGroupExpansion = (groupName: string) => {
        setExpandedGroups(prev =>
            prev.includes(groupName) ? prev.filter(g => g !== groupName) : [...prev, groupName]
        );
    };

    if (isLoading) return <div className="text-center p-8 text-color-text-muted">Loading expenses...</div>;
    if (error) return <div className="text-center p-8 text-color-danger">Failed to load expenses.</div>;

    const isExpenseExpectedInMonth = (expense: any, targetYear: number, targetMonth: number) => {
        if (!expense.targetDate) return true; // Just in case data is missing
        const targetDate = new Date(expense.targetDate);
        const expYear = targetDate.getUTCFullYear();
        const expMonth = targetDate.getUTCMonth() + 1; // 1-indexed

        if (expYear > targetYear || (expYear === targetYear && expMonth > targetMonth)) {
            return false;
        }

        switch (expense.frequency) {
            case 0: // OneTime
                return expYear === targetYear && expMonth === targetMonth;
            case 1: // Monthly
                return true;
            case 2: // Quarterly
                const monthsDiff = ((targetYear - expYear) * 12) + targetMonth - expMonth;
                return monthsDiff % 3 === 0;
            case 3: // Yearly
                return expMonth === targetMonth;
            default:
                return false;
        }
    };

    const expenseList = (expenses || []).filter(e => isExpenseExpectedInMonth(e, year, month));

    // Organize expenses into groups
    const groupedExpenses: Record<string, typeof expenseList> = {};
    const ungroupedExpenses: typeof expenseList = [];

    expenseList.forEach(exp => {
        if (exp.categoryGroup) {
            if (!groupedExpenses[exp.categoryGroup]) groupedExpenses[exp.categoryGroup] = [];
            groupedExpenses[exp.categoryGroup].push(exp);
        } else {
            ungroupedExpenses.push(exp);
        }
    });

    const renderExpenseItem = (expense: any, isNested: boolean = false) => {
        const isSelected = selectedExpenseIds.includes(expense.id);

        return (
            <div key={expense.id} className={`${editingId === expense.id ? "col-span-full" : ""} ${isNested ? "ml-4 border-l-2 border-indigo-200 dark:border-indigo-900/50 pl-2 md:pl-4 py-1.5" : ""}`}>
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
                    <div className={`border bg-slate-50 dark:bg-slate-800/50 rounded-lg p-4 transition-all relative h-full flex flex-col ${isSelected ? 'border-primary ring-1 ring-primary/20 shadow-sm' : 'border-slate-100 dark:border-slate-800 hover:shadow-md'}`}>
                        <div className="flex justify-between items-start mb-3">
                            <div className="flex items-center gap-3 pr-16">
                                <button onClick={() => toggleSelection(expense.id)} className="text-slate-400 hover:text-color-primary mt-0.5 transition-colors">
                                    {isSelected ? <CheckSquare className="h-5 w-5 text-color-primary" /> : <Square className="h-5 w-5" />}
                                </button>
                                <h4 className="font-semibold text-color-text-main leading-tight">{expense.name}</h4>
                            </div>
                            <div className="absolute top-4 right-4 flex gap-1 bg-slate-50 dark:bg-slate-800/80 p-1 rounded-md shadow-sm">
                                <button
                                    onClick={() => setEditingId(expense.id)}
                                    className="p-1.5 text-slate-400 hover:text-color-primary hover:bg-slate-200 dark:hover:bg-slate-700 rounded transition-all"
                                    title="Edit Expense"
                                >
                                    <Edit2 className="h-4 w-4" />
                                </button>
                                <button
                                    onClick={() => setDeletingId(expense.id)}
                                    className="p-1.5 text-slate-400 hover:text-color-danger hover:bg-slate-200 dark:hover:bg-slate-700 rounded transition-all"
                                    title="Delete Expense"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </button>
                            </div>
                        </div>

                        <div className="mb-3 flex flex-wrap gap-2">
                            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${expense.isFixed ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' : 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300'}`}>
                                {expense.isFixed ? 'Fixed' : 'Variable'}
                            </span>
                            <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                                {expense.frequency === 0 ? 'One-Time' :
                                    expense.frequency === 1 ? 'Monthly' :
                                        expense.frequency === 2 ? 'Quarterly' : 'Yearly'}
                            </span>
                        </div>

                        <div className="flex items-center gap-2 mb-2 text-color-text-muted text-sm mt-auto">
                            Starts: {new Date(expense.targetDate).toLocaleDateString()}
                        </div>

                        <div className="flex items-center gap-2 mb-2 text-color-text-muted">
                            <DollarSign className="h-4 w-4" />
                            <span className="text-lg font-bold text-color-text-main">
                                ${expense.plannedAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </span>
                        </div>

                        {(expense.websiteUrl || expense.userName || expense.encryptedPassword === "***") && (
                            <div className="flex items-center gap-3 mt-3 pt-3 border-t border-slate-200 dark:border-slate-800 flex-wrap bg-white/50 dark:bg-slate-900/20 -mx-4 -mb-4 px-4 pb-4">
                                {expense.websiteUrl && (
                                    <a href={expense.websiteUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors mr-2">
                                        <Link className="h-3.5 w-3.5" /> Site
                                    </a>
                                )}
                                {expense.userName && (
                                    <div className="flex items-center gap-1.5 text-sm font-medium text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded shadow-sm mr-2 border border-slate-200 dark:border-slate-700">
                                        <User className="h-3 w-3" />
                                        {expense.userName}
                                    </div>
                                )}
                                {expense.encryptedPassword === "***" && (
                                    <div className="flex items-center gap-2 ml-auto">
                                        <button onClick={() => handleRevealPassword(expense.id)} disabled={revealingPasswordId === expense.id} className="flex items-center gap-1 text-xs font-medium text-slate-500 hover:text-slate-700 transition-colors">
                                            <Key className="h-3 w-3" />
                                            {revealedPasswords[expense.id] !== undefined ? 'Hide Key' : 'Reveal Key'}
                                        </button>
                                        {revealedPasswords[expense.id] !== undefined && (
                                            <span className="text-xs font-mono bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-color-text-main border border-slate-300 dark:border-slate-600 shadow-inner">
                                                {revealedPasswords[expense.id] || '(empty)'}
                                            </span>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                ) : (
                    <div className={`border bg-slate-50 dark:bg-slate-800/50 rounded-lg p-2 md:p-3 flex items-center justify-between gap-3 transition-all ${isSelected ? 'border-primary ring-1 ring-primary/20 shadow-sm' : 'border-slate-100 dark:border-slate-800 hover:shadow-sm'}`}>
                        <div className="flex items-center gap-3 shrink-0">
                            <button onClick={() => toggleSelection(expense.id)} className="text-slate-400 hover:text-color-primary transition-colors">
                                {isSelected ? <CheckSquare className="h-5 w-5 text-color-primary" /> : <Square className="h-5 w-5" />}
                            </button>
                            {(expense.websiteUrl || expense.userName || expense.encryptedPassword === "***") && (
                                <div className="flex items-center gap-1 shrink-0 bg-slate-100/50 dark:bg-slate-800 p-1 rounded-md">
                                    {expense.websiteUrl && (
                                        <a href={expense.websiteUrl} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:text-blue-700 shrink-0 hover:bg-white dark:hover:bg-slate-700 p-1.5 rounded transition-colors" title="Open Website">
                                            <Link className="h-4 w-4" />
                                        </a>
                                    )}
                                    {expense.userName && (
                                        <span className="text-slate-500 shrink-0 flex items-center gap-1 hover:bg-white dark:hover:bg-slate-700 p-1.5 rounded" title={`Username: ${expense.userName}`}>
                                            <User className="h-4 w-4" />
                                        </span>
                                    )}
                                    {expense.encryptedPassword === "***" && (
                                        <button onClick={() => handleRevealPassword(expense.id)} className={`shrink-0 transition-colors p-1.5 rounded ${revealedPasswords[expense.id] !== undefined ? 'text-green-600 bg-green-50 dark:bg-green-900/30' : 'text-slate-400 hover:text-slate-600 hover:bg-white dark:hover:bg-slate-700'}`} title={revealedPasswords[expense.id] !== undefined ? "Hide Password" : "Retrieve Password"}>
                                            <Key className="h-4 w-4" />
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                        
                        <div className="flex-1 min-w-0 flex flex-col justify-center border-l border-slate-200 dark:border-slate-700 pl-3 md:pl-4">
                            <div className="font-semibold text-color-text-main text-sm truncate" title={expense.name}>
                                {expense.name}
                            </div>
                            <div className="text-xs text-color-text-muted truncate mt-0.5 mt-0.5">
                                Starts: {new Date(expense.targetDate).toLocaleDateString()}
                            </div>
                            {revealedPasswords[expense.id] !== undefined && (
                                <div className="mt-1.5">
                                    <span className="text-xs font-mono bg-white dark:bg-slate-900 px-2 py-0.5 rounded text-color-text-main border border-slate-300 dark:border-slate-600 shadow-sm font-semibold">
                                        {revealedPasswords[expense.id] || '(empty)'}
                                    </span>
                                </div>
                            )}
                        </div>

                        <div className="w-20 lg:w-24 shrink-0 text-right font-bold text-color-text-main border-l border-slate-200 dark:border-slate-700 pl-3">
                            ${expense.plannedAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </div>
                        
                        <div className="flex gap-1 shrink-0 ml-1 border-l border-slate-200 dark:border-slate-700 pl-2">
                            <button onClick={() => setEditingId(expense.id)} className="p-1.5 text-slate-400 hover:text-color-primary hover:bg-white dark:hover:bg-slate-700 rounded-md transition-all shadow-sm" title="Edit Expense">
                                <Edit2 className="h-4 w-4" />
                            </button>
                            <button onClick={() => setDeletingId(expense.id)} className="p-1.5 text-slate-400 hover:text-color-danger hover:bg-white dark:hover:bg-slate-700 rounded-md transition-all shadow-sm" title="Delete Expense">
                                <Trash2 className="h-4 w-4" />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="bg-color-surface rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-6 min-h-[400px]">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-color-text-main flex items-center gap-2">
                    <WalletCards className="h-6 w-6 text-color-danger" />
                    Expenses Schedule
                </h2>
                <div className="flex items-center gap-2">
                    <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-lg p-1 shadow-inner border border-slate-200 dark:border-slate-700">
                        <ExpenseForm />
                    </div>
                    <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-lg p-1 shadow-inner border border-slate-200 dark:border-slate-700">
                        <button
                            onClick={() => setViewMode('cards')}
                            className={`p-1.5 rounded-md transition-all ${viewMode === 'cards' ? 'bg-white dark:bg-slate-700 shadow-sm text-color-primary font-bold' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'}`}
                            title="Card View"
                        >
                            <LayoutGrid className="h-4 w-4" />
                        </button>
                        <button
                            onClick={() => setViewMode('list')}
                            className={`p-1.5 rounded-md transition-all ${viewMode === 'list' ? 'bg-white dark:bg-slate-700 shadow-sm text-color-primary font-bold' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'}`}
                            title="List View"
                        >
                            <ListIcon className="h-4 w-4" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Selection ActionBar */}
            {selectedExpenseIds.length > 0 && (
                <div className="my-4 p-4 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 rounded-lg flex flex-wrap items-center justify-between gap-4 animate-in fade-in slide-in-from-top-4">
                    <div className="flex items-center gap-2 text-indigo-800 dark:text-indigo-300 font-medium">
                        <CheckSquare className="h-5 w-5" />
                        {selectedExpenseIds.length} item{selectedExpenseIds.length > 1 ? 's' : ''} selected
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setSelectedExpenseIds([])}
                            className="px-3 py-1.5 text-sm text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 rounded-md transition-colors"
                        >
                            Clear
                        </button>

                        {isGrouping ? (
                            <form onSubmit={(e) => { e.preventDefault(); groupMutation.mutate(); }} className="flex items-center gap-2">
                                <input
                                    type="text"
                                    placeholder="Group Name..."
                                    required
                                    autoFocus
                                    className="px-3 py-1.5 text-sm rounded bg-white dark:bg-slate-900 border border-indigo-300 dark:border-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-color-text-main"
                                    value={groupNameInput}
                                    onChange={e => setGroupNameInput(e.target.value)}
                                />
                                <button
                                    type="submit"
                                    disabled={groupMutation.isPending || !groupNameInput.trim()}
                                    className="px-3 py-1.5 text-sm bg-indigo-600 text-white rounded hover:bg-indigo-700 transition-colors disabled:opacity-50"
                                >
                                    Save
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setIsGrouping(false)}
                                    className="px-3 py-1.5 text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 rounded transition-colors"
                                >
                                    Cancel
                                </button>
                            </form>
                        ) : (
                            <>
                                <button
                                    onClick={() => ungroupMutation.mutate(selectedExpenseIds)}
                                    disabled={ungroupMutation.isPending}
                                    className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-md hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shrink-0"
                                >
                                    <FolderMinus className="h-4 w-4 text-orange-500" />
                                    Ungroup
                                </button>
                                <button
                                    onClick={() => setIsGrouping(true)}
                                    className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 transition-colors shrink-0"
                                >
                                    <FolderPlus className="h-4 w-4" />
                                    Group Selected
                                </button>
                            </>
                        )}
                    </div>
                </div>
            )}

            {expenseList.length === 0 ? (
                <div className="text-center p-14 text-color-text-muted border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-900/50">
                    <WalletCards className="h-10 w-10 mx-auto text-slate-300 dark:text-slate-700 mb-3" />
                    <p className="font-medium text-slate-600 dark:text-slate-400">No expected expenses.</p>
                    <p className="text-sm mt-1">Use the form above to add your monthly expenses.</p>
                </div>
            ) : (
                <div className={viewMode === 'cards' ? "grid gap-4 items-start md:grid-cols-2 lg:grid-cols-3" : "flex flex-col gap-3"}>
                    
                    {/* Render Grouped Expenses */}
                    {Object.entries(groupedExpenses).map(([groupName, groupItems]) => {
                        const isExpanded = expandedGroups.includes(groupName);
                        const groupTotal = groupItems.reduce((sum, item) => sum + item.plannedAmount, 0);

                        return (
                            <div key={groupName} className={`col-span-full border border-indigo-200 dark:border-indigo-900/50 bg-indigo-50/50 dark:bg-indigo-900/10 rounded-xl overflow-hidden transition-all duration-300 ${isExpanded ? 'shadow-md' : 'shadow-sm hover:shadow-md hover:bg-indigo-50 dark:hover:bg-indigo-900/20'}`}>
                                <div 
                                    className="flex items-center justify-between p-4 cursor-pointer select-none"
                                    onClick={() => toggleGroupExpansion(groupName)}
                                >
                                    <div className="flex items-center gap-3">
                                        <button className="text-indigo-500 hover:text-indigo-700 dark:text-indigo-400 transition-colors shrink-0 p-1 hover:bg-indigo-100 dark:hover:bg-indigo-800 rounded-full">
                                            {isExpanded ? <ChevronDown className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
                                        </button>
                                        <h3 className="font-bold text-lg text-indigo-900 dark:text-indigo-100">{groupName}</h3>
                                        <span className="text-xs font-semibold bg-indigo-100 dark:bg-indigo-800 text-indigo-700 dark:text-indigo-300 px-2 py-0.5 rounded-full border border-indigo-200 dark:border-indigo-700">
                                            {groupItems.length} items
                                        </span>
                                    </div>
                                    <div className="text-right font-black text-indigo-700 dark:text-indigo-300 flex items-center gap-1 text-lg">
                                        <DollarSign className="h-5 w-5" />
                                        {groupTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                    </div>
                                </div>
                                
                                {isExpanded && (
                                    <div className={`border-t border-indigo-100 dark:border-indigo-900/50 bg-white/50 dark:bg-slate-900/30 p-4 ${viewMode === 'cards' ? "grid gap-4 items-start md:grid-cols-2 lg:grid-cols-3" : "flex flex-col gap-3"}`}>
                                        {groupItems.map(expense => renderExpenseItem(expense, true))}
                                    </div>
                                )}
                            </div>
                        );
                    })}

                    {/* Render Ungrouped Expenses */}
                    {ungroupedExpenses.map(expense => renderExpenseItem(expense, false))}

                </div>
            )}
        </div>
    );
};
