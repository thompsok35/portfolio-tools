import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../services/apiClient';
import { useAuth } from '../contexts/AuthContext';
import { useState, useEffect } from 'react';
import { Folder, Plus } from 'lucide-react';

export const PlanSelector = () => {
    const { activePlanId, setActivePlan } = useAuth();
    const queryClient = useQueryClient();
    const [isCreating, setIsCreating] = useState(false);
    const [newPlanName, setNewPlanName] = useState('');

    const { data: plans, isLoading } = useQuery({
        queryKey: ['plans'],
        queryFn: apiClient.getPlans
    });

    const createMutation = useMutation({
        mutationFn: (name: string) => apiClient.createPlan({ name }),
        onSuccess: (newPlan) => {
            queryClient.invalidateQueries({ queryKey: ['plans'] });
            setActivePlan(newPlan.id);
            setIsCreating(false);
            setNewPlanName('');
        }
    });

    // Auto-select the Default Plan if activePlanId is missing and plans exist
    useEffect(() => {
        if (!activePlanId && plans && plans.length > 0) {
            // Find default plan or first plan
            const defaultPlan = plans.find(p => p.name === 'Default Plan') || plans[0];
            setActivePlan(defaultPlan.id);
        }
    }, [plans, activePlanId, setActivePlan]);

    const handleCreateSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newPlanName.trim()) return;
        createMutation.mutate(newPlanName.trim());
    };

    if (isLoading) {
        return <div className="animate-pulse h-10 bg-slate-100 dark:bg-slate-800 rounded-lg w-48 border border-slate-200 dark:border-slate-700" />;
    }

    if (isCreating) {
        return (
            <form onSubmit={handleCreateSubmit} className="flex items-center gap-2 bg-white dark:bg-slate-900 rounded-lg p-1 border border-color-primary shadow-sm">
                <input
                    autoFocus
                    type="text"
                    value={newPlanName}
                    onChange={(e) => setNewPlanName(e.target.value)}
                    placeholder="New Plan Name..."
                    className="bg-transparent border-none text-sm px-3 py-1.5 focus:ring-0 w-40 text-color-text-main"
                    disabled={createMutation.isPending}
                />
                <button
                    type="button"
                    onClick={() => setIsCreating(false)}
                    className="px-2 py-1.5 text-xs text-color-text-muted hover:text-color-text-main"
                    disabled={createMutation.isPending}
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    className="bg-color-primary text-white px-3 py-1.5 rounded-md text-xs font-medium hover:bg-color-primary-hover disabled:opacity-50"
                    disabled={createMutation.isPending || !newPlanName.trim()}
                >
                    {createMutation.isPending ? '...' : 'Save'}
                </button>
            </form>
        );
    }

    return (
        <div className="flex items-center gap-3 bg-color-surface border border-slate-200 dark:border-slate-700 rounded-lg p-1.5 shadow-sm">
            <div className="flex items-center gap-2 pl-3">
                <Folder className="h-4 w-4 text-color-primary" />
                <span className="text-sm font-medium text-color-text-muted hidden sm:inline">Active Plan:</span>
            </div>

            <select
                value={activePlanId || ''}
                onChange={(e) => setActivePlan(e.target.value)}
                className="bg-transparent border-none text-sm font-semibold text-color-text-main pr-8 focus:ring-0 cursor-pointer [&>option]:bg-color-surface [&>option]:text-color-text-main"
            >
                {plans?.map((plan) => (
                    <option key={plan.id} value={plan.id}>
                        {plan.name}
                    </option>
                ))}
            </select>

            <div className="border-l border-slate-200 dark:border-slate-700 pl-1.5">
                <button
                    onClick={() => setIsCreating(true)}
                    className="p-1.5 text-slate-400 hover:text-color-primary hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-md transition-colors"
                    title="Create New Plan"
                >
                    <Plus className="h-4 w-4" />
                </button>
            </div>
        </div>
    );
};
