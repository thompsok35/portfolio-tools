import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../services/apiClient';
import { Wallet, TrendingUp, TrendingDown } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface MonthlySummaryProps {
    year: number;
    month: number;
}

export const MonthlySummaryDashboard = ({ year, month }: MonthlySummaryProps) => {
    const { activePlanId } = useAuth();

    const { data: summary, isLoading, error } = useQuery({
        queryKey: ['monthlySummary', year, month, activePlanId],
        queryFn: () => activePlanId ? apiClient.getMonthlySummary(year, month, activePlanId) : Promise.resolve(null),
        enabled: !!activePlanId,
    });

    if (isLoading) return <div className="text-center p-8 text-color-text-muted">Loading summary...</div>;
    if (error) return <div className="text-center p-8 text-color-danger">Failed to load summary.</div>;

    const netValue = summary?.netSurplusDeficit || 0;
    const isSurplus = netValue >= 0;

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* Total Income */}
            <div className="bg-color-surface rounded-xl p-6 shadow-sm border border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div>
                    <p className="text-sm font-medium text-color-text-muted mb-1">Total Expected Income</p>
                    <h3 className="text-3xl font-bold text-color-text-main">
                        ${summary?.totalIncome.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </h3>
                </div>
                <div className="h-12 w-12 rounded-full bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center">
                    <TrendingUp className="text-color-primary h-6 w-6" />
                </div>
            </div>

            {/* Expenses */}
            <div className="bg-color-surface rounded-xl p-6 shadow-sm border border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div>
                    <p className="text-sm font-medium text-color-text-muted mb-1">Expenses</p>
                    <h3 className="text-3xl font-bold text-color-text-main">
                        ${summary?.totalExpenses.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </h3>
                </div>
                <div className="h-12 w-12 rounded-full bg-red-50 dark:bg-red-900/30 flex items-center justify-center">
                    <TrendingDown className="text-color-danger h-6 w-6" />
                </div>
            </div>

            {/* Net Surplus/Deficit */}
            <div className="bg-color-surface rounded-xl p-6 shadow-sm border border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div>
                    <p className="text-sm font-medium text-color-text-muted mb-1">Net Monthly Summary</p>
                    <h3 className={`text-3xl font-bold ${isSurplus ? 'text-color-success' : 'text-color-danger'}`}>
                        {isSurplus ? '+' : ''}${netValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </h3>
                </div>
                <div className={`h-12 w-12 rounded-full flex items-center justify-center ${isSurplus ? 'bg-green-50 dark:bg-green-900/30' : 'bg-red-50 dark:bg-red-900/30'}`}>
                    <Wallet className={`${isSurplus ? 'text-color-success' : 'text-color-danger'} h-6 w-6`} />
                </div>
            </div>
        </div>
    );
};
