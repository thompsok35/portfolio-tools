import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../services/apiClient';
import { Zap, Loader2, Coins } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export const LinkedIncomeButton = () => {
    const { activePlanId } = useAuth();
    const queryClient = useQueryClient();

    // Only fetch integrations if user is authenticated and we have an active plan
    const { data: integrations = [] } = useQuery({
        queryKey: ['integrations'],
        queryFn: apiClient.getIntegrations,
        enabled: !!activePlanId
    });

    const activeIntegration = integrations.find(i => i.planId === activePlanId);

    const syncOptionsMutation = useMutation({
        mutationFn: () => apiClient.syncLinkedExpectedIncome(activePlanId as string),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['monthlySummary'] });
            queryClient.invalidateQueries({ queryKey: ['incomeSources'] });
            alert(data.message + (data.expectedIncome > 0 ? ` Found: $${data.expectedIncome}` : ''));
        },
        onError: (err: any) => {
            alert(err.message || 'Failed to sync linked account.');
        }
    });

    const syncDividendsMutation = useMutation({
        mutationFn: () => apiClient.syncLinkedExpectedDividends(activePlanId as string),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['monthlySummary'] });
            queryClient.invalidateQueries({ queryKey: ['incomeSources'] });
            alert(data.message + (data.expectedIncome > 0 ? ` Found: $${data.expectedIncome.toFixed(2)}/mo` : ''));
        },
        onError: (err: any) => {
            alert(err.message || 'Failed to sync linked expected dividends.');
        }
    });

    if (!activePlanId || !activeIntegration) {
        return null;
    }

    return (
        <div className="flex items-center gap-0.5">
            <button
                onClick={() => syncOptionsMutation.mutate()}
                disabled={syncOptionsMutation.isPending || syncDividendsMutation.isPending}
                className="p-1.5 rounded-md transition-colors text-slate-500 hover:text-amber-600 hover:bg-amber-50 dark:text-slate-400 dark:hover:text-amber-400 dark:hover:bg-amber-900/20 disabled:opacity-50 disabled:cursor-not-allowed"
                title="Fetch expected option premium income from your linked Portfolio Manager"
            >
                {syncOptionsMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                    <Zap className="h-4 w-4" />
                )}
            </button>
            <button
                onClick={() => syncDividendsMutation.mutate()}
                disabled={syncDividendsMutation.isPending || syncOptionsMutation.isPending}
                className="p-1.5 rounded-md transition-colors text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 dark:text-slate-400 dark:hover:text-emerald-400 dark:hover:bg-emerald-900/20 disabled:opacity-50 disabled:cursor-not-allowed"
                title="Fetch expected monthly dividend payout from your linked Portfolio Manager"
            >
                {syncDividendsMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                    <Coins className="h-4 w-4" />
                )}
            </button>
        </div>
    );
};
