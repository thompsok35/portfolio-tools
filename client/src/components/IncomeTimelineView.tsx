import { useState, useMemo } from 'react';
import { Calendar, Edit2, Trash2, CheckCircle2, AlertCircle } from 'lucide-react';
import { useQueryClient, useMutation } from '@tanstack/react-query';
import { apiClient } from '../services/apiClient';
import { useAuth } from '../contexts/AuthContext';
import { IncomeSourceForm } from './IncomeSourceForm';
import type { ExpectedIncomeItem, IncomeFrequency } from '../types/models';

interface IncomeTimelineViewProps {
    year: number;
    month: number;
    expectedIncomes: ExpectedIncomeItem[];
}

interface ProjectedOccurrence {
    id: string;
    income: ExpectedIncomeItem;
    date: Date;
    day: number;
}

const frequencyMap: Record<IncomeFrequency, string> = {
    0: 'Bi-Weekly',
    1: 'Monthly',
    2: 'Quarterly',
    3: 'Yearly'
};

export const IncomeTimelineView = ({ year, month, expectedIncomes }: IncomeTimelineViewProps) => {
    const { activePlanId } = useAuth();
    const queryClient = useQueryClient();
    const [selectedDay, setSelectedDay] = useState<number | null>(null);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [deletingId, setDeletingId] = useState<string | null>(null);

    const deleteMutation = useMutation({
        mutationFn: (id: string) => apiClient.deleteIncomeSource(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['monthlySummary', year, month, activePlanId] });
            setDeletingId(null);
        },
        onError: (err) => {
            console.error("Delete mutation failed:", err);
            alert("Failed to delete record. See console for details.");
        }
    });

    const handleConfirmDelete = (id: string) => {
        deleteMutation.mutate(id);
    };

    // Calculate all occurrences of expected income in the target month
    const allOccurrences = useMemo(() => {
        const occurrences: ProjectedOccurrence[] = [];
        
        // Target month boundaries in UTC
        const startOfMonth = new Date(Date.UTC(year, month - 1, 1));
        const endOfMonth = new Date(Date.UTC(year, month, 0));
        const maxDays = endOfMonth.getUTCDate();

        expectedIncomes.forEach((income) => {
            const baseDate = new Date(income.targetDate);
            const baseYear = baseDate.getUTCFullYear();
            const baseMonth = baseDate.getUTCMonth() + 1;
            const baseDay = baseDate.getUTCDate();

            // If income starts after the target month, skip
            if (baseYear > year || (baseYear === year && baseMonth > month)) {
                return;
            }

            if (income.frequency === 0) {
                // Bi-weekly: project every 14 days starting from baseDate
                let current = new Date(Date.UTC(baseYear, baseDate.getUTCMonth(), baseDay));
                let occIndex = 0;

                while (current <= endOfMonth) {
                    if (current >= startOfMonth) {
                        occurrences.push({
                            id: `${income.id}-occ-${occIndex}`,
                            income,
                            date: new Date(current),
                            day: current.getUTCDate()
                        });
                        occIndex++;
                    }
                    current.setUTCDate(current.getUTCDate() + 14);
                }

                // Fallback: If no occurrences fell inside the calendar month, project at least one based on day
                if (occIndex === 0) {
                    const projectedDay1 = Math.min(baseDay, maxDays);
                    occurrences.push({
                        id: `${income.id}-occ-0`,
                        income,
                        date: new Date(Date.UTC(year, month - 1, projectedDay1)),
                        day: projectedDay1
                    });
                    
                    const projectedDay2 = projectedDay1 + 14;
                    if (projectedDay2 <= maxDays) {
                        occurrences.push({
                            id: `${income.id}-occ-1`,
                            income,
                            date: new Date(Date.UTC(year, month - 1, projectedDay2)),
                            day: projectedDay2
                        });
                    }
                }
            } else {
                // Monthly, Quarterly, Yearly: project on baseDate day of target month (capped to max days)
                const projectedDay = Math.min(baseDay, maxDays);
                occurrences.push({
                    id: `${income.id}-occ-0`,
                    income,
                    date: new Date(Date.UTC(year, month - 1, projectedDay)),
                    day: projectedDay
                });
            }
        });

        return occurrences.sort((a, b) => a.day - b.day);
    }, [expectedIncomes, year, month]);

    // Group occurrences by day for indicators
    const occurrencesByDay = useMemo(() => {
        const map: Record<number, ProjectedOccurrence[]> = {};
        allOccurrences.forEach((occ) => {
            if (!map[occ.day]) {
                map[occ.day] = [];
            }
            map[occ.day].push(occ);
        });
        return map;
    }, [allOccurrences]);

    // Filter occurrences based on selection
    const filteredOccurrences = useMemo(() => {
        if (selectedDay === null) return allOccurrences;
        return allOccurrences.filter((occ) => occ.day === selectedDay);
    }, [allOccurrences, selectedDay]);

    // Calculate days of the month
    const daysInMonth = useMemo(() => {
        const lastDay = new Date(year, month, 0).getDate();
        return Array.from({ length: lastDay }, (_, i) => i + 1);
    }, [year, month]);

    const getDayName = (dayNum: number) => {
        const date = new Date(Date.UTC(year, month - 1, dayNum));
        return date.toLocaleDateString(undefined, { weekday: 'short', timeZone: 'UTC' });
    };

    // Calculate totals for summary info
    const selectedDayTotal = useMemo(() => {
        if (selectedDay === null) return 0;
        const dayOccs = occurrencesByDay[selectedDay] || [];
        return dayOccs.reduce((sum, occ) => sum + (occ.income.isReconciled ? occ.income.realizedAmount : occ.income.amount), 0);
    }, [selectedDay, occurrencesByDay]);

    return (
        <div className="space-y-6">
            {/* Calendar Day-Selector Strip */}
            <div>
                <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-color-text-muted">
                        Select a day to filter schedule
                    </span>
                    {selectedDay !== null && (
                        <button
                            onClick={() => setSelectedDay(null)}
                            className="text-xs font-semibold text-color-primary hover:text-color-primary-hover transition-colors"
                        >
                            View All Days
                        </button>
                    )}
                </div>
                <div className="flex gap-2 overflow-x-auto pb-3 pt-1 px-0.5 no-scrollbar scroll-smooth">
                    <button
                        onClick={() => setSelectedDay(null)}
                        className={`flex flex-col items-center justify-center min-w-[54px] h-[68px] rounded-xl border transition-all shrink-0 ${
                            selectedDay === null
                                ? 'bg-color-primary text-white border-color-primary shadow-sm scale-102 font-bold'
                                : 'bg-slate-50 dark:bg-slate-800/40 text-color-text-main border-slate-200 dark:border-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-800 hover:shadow-xs'
                        }`}
                    >
                        <span className="text-[10px] uppercase tracking-wider opacity-85 font-semibold">All</span>
                        <span className="text-lg font-bold leading-none mt-1">Days</span>
                        <span className="text-[9px] mt-1 opacity-75">{allOccurrences.length} items</span>
                    </button>

                    {daysInMonth.map((day) => {
                        const dayOccs = occurrencesByDay[day] || [];
                        const hasIncome = dayOccs.length > 0;
                        const isReconciled = hasIncome && dayOccs.every((occ) => occ.income.isReconciled);
                        const isSelected = selectedDay === day;

                        return (
                            <button
                                key={day}
                                onClick={() => setSelectedDay(isSelected ? null : day)}
                                className={`flex flex-col items-center justify-center min-w-[54px] h-[68px] rounded-xl border transition-all shrink-0 relative ${
                                    isSelected
                                        ? 'bg-color-primary text-white border-color-primary shadow-sm scale-102 font-bold'
                                        : 'bg-slate-50 dark:bg-slate-800/40 text-color-text-main border-slate-200 dark:border-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-800 hover:shadow-xs'
                                }`}
                            >
                                <span className={`text-[10px] uppercase tracking-wider ${isSelected ? 'opacity-85 font-semibold' : 'text-color-text-muted font-medium'}`}>
                                    {getDayName(day)}
                                </span>
                                <span className="text-xl font-bold leading-none mt-1">{day}</span>
                                
                                {hasIncome && (
                                    <span className={`absolute bottom-2 w-1.5 h-1.5 rounded-full ${
                                        isSelected 
                                            ? 'bg-white' 
                                            : isReconciled 
                                                ? 'bg-emerald-500' 
                                                : 'bg-color-primary'
                                    }`} />
                                )}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Selected Day Header Details */}
            {selectedDay !== null && (
                <div className="bg-slate-50 dark:bg-slate-800/20 border border-slate-200/50 dark:border-slate-800/50 rounded-lg p-3 flex justify-between items-center text-sm">
                    <span className="font-semibold text-color-text-main">
                        Day {selectedDay} Schedule: <span className="text-color-text-muted">({occurrencesByDay[selectedDay]?.length || 0} events)</span>
                    </span>
                    <span className="font-bold text-color-success">
                        Total Day Income: ${selectedDayTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                </div>
            )}

            {/* Timeline List */}
            {filteredOccurrences.length === 0 ? (
                <div className="text-center p-12 text-color-text-muted border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-lg">
                    No expected income scheduled for this selection.
                </div>
            ) : (
                <div className="relative pl-6 border-l-2 border-slate-200 dark:border-slate-800 ml-4 py-2 space-y-6">
                    {filteredOccurrences.map((occ) => {
                        const { income, day, id: occId } = occ;
                        const isReconciled = income.isReconciled;
                        
                        return (
                            <div key={occId} className="relative">
                                {/* Timeline Bullet Indicator */}
                                <div className={`absolute -left-[31px] top-1.5 h-4 w-4 rounded-full border-2 bg-color-surface flex items-center justify-center transition-all ${
                                    isReconciled 
                                        ? 'border-emerald-500 text-emerald-500' 
                                        : 'border-color-primary text-color-primary'
                                }`}>
                                    <div className={`h-1.5 w-1.5 rounded-full ${isReconciled ? 'bg-emerald-500' : 'bg-color-primary'}`} />
                                </div>

                                {/* Tile Content */}
                                {deletingId === income.id ? (
                                    <div className="border border-red-200 bg-red-50 dark:bg-red-950/20 dark:border-red-900/40 rounded-lg p-4 flex flex-col items-center justify-center text-center shadow-inner animate-in fade-in duration-200 ml-2">
                                        <Trash2 className="h-6 w-6 text-red-500 mb-2" />
                                        <h4 className="font-semibold text-color-text-main text-sm mb-1">Delete "{income.source}"?</h4>
                                        <p className="text-xs text-color-text-muted mb-4">This action cannot be undone.</p>
                                        <div className="flex gap-3">
                                            <button
                                                onClick={() => setDeletingId(null)}
                                                className="px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded hover:bg-slate-50 transition-colors"
                                                disabled={deleteMutation.isPending}
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                onClick={() => handleConfirmDelete(income.id)}
                                                className="px-3 py-1.5 text-xs font-medium text-white bg-red-600 rounded hover:bg-red-700 transition-colors"
                                                disabled={deleteMutation.isPending}
                                            >
                                                {deleteMutation.isPending ? 'Deleting...' : 'Yes, Delete'}
                                            </button>
                                        </div>
                                    </div>
                                ) : editingId === income.id ? (
                                    <div className="mt-2 mb-4 ml-2">
                                        <IncomeSourceForm
                                            initialData={income}
                                            onSuccess={() => setEditingId(null)}
                                            onCancel={() => setEditingId(null)}
                                        />
                                    </div>
                                ) : (
                                    <div className="border border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 rounded-lg p-4 hover:shadow-md transition-all ml-2 relative flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                        <div className="flex-1">
                                            <div className="flex flex-wrap items-center gap-2 mb-2">
                                                <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-slate-200 dark:bg-slate-700 text-color-text-main">
                                                    Day {day}
                                                </span>
                                                <h4 className="font-semibold text-color-text-main text-base inline-block">{income.source}</h4>
                                                {isReconciled ? (
                                                    <span className="flex items-center gap-0.5 text-[9px] font-bold tracking-wider text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/30 px-2 py-0.5 rounded-sm uppercase">
                                                        <CheckCircle2 className="h-3 w-3" /> Reconciled
                                                    </span>
                                                ) : (
                                                    <span className="flex items-center gap-0.5 text-[9px] font-bold tracking-wider text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30 px-2 py-0.5 rounded-sm uppercase">
                                                        <AlertCircle className="h-3 w-3" /> Expected
                                                    </span>
                                                )}
                                            </div>

                                            <div className="flex flex-wrap items-center gap-3 text-xs text-color-text-muted mb-2">
                                                <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 px-2 py-0.5 rounded-full text-[10px] font-medium">
                                                    {income.type}
                                                </span>
                                                <span>•</span>
                                                <span className="flex items-center gap-1">
                                                    <Calendar className="h-3 w-3" />
                                                    {frequencyMap[income.frequency]}
                                                </span>
                                                <span>•</span>
                                                <span>Target: {new Date(income.targetDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' })}</span>
                                            </div>

                                            {income.description && (
                                                <p className="text-xs text-color-text-muted italic border-l-2 border-slate-200 dark:border-slate-700 pl-2 py-0.5">
                                                    {income.description}
                                                </p>
                                            )}
                                        </div>

                                        <div className="flex items-center justify-between sm:justify-end gap-6 border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-200/50 dark:border-slate-800/50 shrink-0">
                                            <div className="text-right flex flex-col">
                                                <span className="text-[10px] text-color-text-muted">Income Amount</span>
                                                <span className={`text-lg font-bold ${isReconciled ? 'text-slate-400 dark:text-slate-500 line-through text-sm' : 'text-color-text-main'}`}>
                                                    ${income.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                </span>
                                                {isReconciled && (
                                                    <span className="text-emerald-500 font-bold text-base">
                                                        ${income.realizedAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                    </span>
                                                )}
                                            </div>

                                            <div className="flex gap-1">
                                                <button
                                                    onClick={() => setEditingId(income.id)}
                                                    className="p-1.5 text-slate-400 hover:text-color-primary hover:bg-slate-200 dark:hover:bg-slate-700 rounded-md transition-all"
                                                    title="Edit Income"
                                                >
                                                    <Edit2 className="h-3.5 w-3.5" />
                                                </button>
                                                <button
                                                    onClick={() => setDeletingId(income.id)}
                                                    className="p-1.5 text-slate-400 hover:text-color-danger hover:bg-slate-200 dark:hover:bg-slate-700 rounded-md transition-all"
                                                    title="Delete Income"
                                                >
                                                    <Trash2 className="h-3.5 w-3.5" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};
