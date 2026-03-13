import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { X, CheckCircle, Banknote, Shield, User, Users, Trash2, Plus } from 'lucide-react';
import { apiClient } from '../services/apiClient';
import type { UserProfile, PortfolioIntegration, BankAccount, Plan, PlanShare } from '../types/models';

interface Props {
    isOpen: boolean;
    onClose: () => void;
}

export function AccountProfileModal({ isOpen, onClose }: Props) {
    const queryClient = useQueryClient();
    const [activeTab, setActiveTab] = useState<'General' | 'Sharing' | 'Integrations' | 'Bank Accounts'>('General');

    // General Tab State
    const [accountName, setAccountName] = useState('');
    const [friendlyName, setFriendlyName] = useState('');

    // Change Password State
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [passwordSuccess, setPasswordSuccess] = useState('');

    const [sharePlanId, setSharePlanId] = useState('');
    const [planShareEmail, setPlanShareEmail] = useState('');

    // Integrations Tab State
    const [nickname, setNickname] = useState('');
    const [apiToken, setApiToken] = useState('');
    const [integrationPlanId, setIntegrationPlanId] = useState('');

    // Bank Accounts Tab State
    const [bankName, setBankName] = useState('');
    const [bankAccountName, setBankAccountName] = useState('');
    const [accountType, setAccountType] = useState('Checking');

    // Queries
    const { data: profile } = useQuery<UserProfile>({
        queryKey: ['profile'],
        queryFn: apiClient.getProfile,
        enabled: isOpen,
    });

    // Use an effect to sync data to form once it loads, rather than onSuccess in v5
    React.useEffect(() => {
        if (profile) {
            setAccountName(profile.accountName || '');
            setFriendlyName(profile.friendlyName || '');
        }
    }, [profile]);

    const { data: integrations = [] } = useQuery<PortfolioIntegration[]>({
        queryKey: ['integrations'],
        queryFn: apiClient.getIntegrations,
        enabled: isOpen && activeTab === 'Integrations'
    });

    const { data: bankAccounts = [] } = useQuery<BankAccount[]>({
        queryKey: ['bankAccounts'],
        queryFn: apiClient.getBankAccounts,
        enabled: isOpen && activeTab === 'Bank Accounts'
    });

    const { data: plans = [] } = useQuery<Plan[]>({
        queryKey: ['plans'],
        queryFn: apiClient.getPlans,
        enabled: isOpen && activeTab === 'Integrations',
    });

    React.useEffect(() => {
        if (plans.length > 0 && !integrationPlanId) {
            setIntegrationPlanId(plans[0].id);
        }
        if (plans.length > 0 && !sharePlanId) {
            setSharePlanId(plans[0].id);
        }
    }, [plans, integrationPlanId, sharePlanId]);

    const { data: planShares = [] } = useQuery<PlanShare[]>({
        queryKey: ['planShares', sharePlanId],
        queryFn: () => apiClient.getPlanShares(sharePlanId),
        enabled: isOpen && activeTab === 'General' && !!sharePlanId
    });

    // Mutations - Profile
    const updateProfileMutation = useMutation({
        mutationFn: () => apiClient.updateProfile({
            id: profile?.id,
            accountName,
            friendlyName
        }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['profile'] });
        }
    });

    const createPlanShareMutation = useMutation({
        mutationFn: () => apiClient.createPlanShare(sharePlanId, planShareEmail),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['planShares', sharePlanId] });
            queryClient.invalidateQueries({ queryKey: ['plans'] }); // Refresh main plans to update navigation
            setPlanShareEmail('');
        }
    });

    const deletePlanShareMutation = useMutation({
        mutationFn: (id: string) => apiClient.deletePlanShare(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['planShares', sharePlanId] });
            queryClient.invalidateQueries({ queryKey: ['plans'] });
        }
    });

    // Mutations - Security
    const changePasswordMutation = useMutation({
        mutationFn: () => apiClient.changePassword({
            oldPassword,
            newPassword
        }),
        onSuccess: (data) => {
            setPasswordSuccess(data.message || 'Password changed successfully!');
            setPasswordError('');
            setOldPassword('');
            setNewPassword('');
            setConfirmPassword('');
            setTimeout(() => setPasswordSuccess(''), 5000);
        },
        onError: (error: Error) => {
            setPasswordError(error.message);
            setPasswordSuccess('');
        }
    });

    // Mutations - Integrations
    const createIntegrationMutation = useMutation({
        mutationFn: () => apiClient.createIntegration({
            nickname,
            encryptedApiAccessToken: apiToken,
            planId: integrationPlanId
        }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['integrations'] });
            setNickname('');
            setApiToken('');
        }
    });

    const deleteIntegrationMutation = useMutation({
        mutationFn: (id: string) => apiClient.deleteIntegration(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['integrations'] });
        }
    });

    // Mutations - Bank Accounts
    const createBankAccountMutation = useMutation({
        mutationFn: () => apiClient.createBankAccount({
            bankName,
            accountName: bankAccountName,
            accountType
        }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['bankAccounts'] });
            setBankName('');
            setBankAccountName('');
            setAccountType('Checking');
        }
    });

    const deleteBankAccountMutation = useMutation({
        mutationFn: (id: string) => apiClient.deleteBankAccount(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['bankAccounts'] });
        }
    });


    // Handlers
    const handleProfileSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        updateProfileMutation.mutate();
    };

    const handlePasswordSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            setPasswordError('New passwords do not match');
            return;
        }
        if (newPassword.length < 6) {
            setPasswordError('New password must be at least 6 characters');
            return;
        }
        changePasswordMutation.mutate();
    };

    const handleInviteSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (sharePlanId && planShareEmail) {
            createPlanShareMutation.mutate();
        }
    };

    const handleIntegrationSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (nickname && apiToken && integrationPlanId) {
            createIntegrationMutation.mutate();
        }
    };

    const handleBankAccountSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (bankName) {
            createBankAccountMutation.mutate();
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-color-surface rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
                {/* Header */}
                <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-900/50">
                    <h2 className="text-xl font-semibold text-color-text-main flex items-center gap-2">
                        <User className="w-5 h-5 text-indigo-600" />
                        Account Profile
                    </h2>
                    <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200 dark:hover:bg-slate-800/50 rounded-xl transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Tabs Container */}
                <div className="flex border-b border-slate-200 dark:border-slate-800 px-6">
                    <button
                        onClick={() => setActiveTab('General')}
                        className={`flex-1 py-4 text-center text-sm font-medium border-b-2 transition-colors flex items-center justify-center gap-2 ${activeTab === 'General'
                            ? 'border-indigo-600 text-indigo-600'
                            : 'border-transparent text-slate-500 hover:text-slate-700'
                            }`}
                    >
                        <User className="w-4 h-4" />
                        General
                    </button>
                    <button
                        onClick={() => setActiveTab('Sharing')}
                        className={`flex-1 py-4 text-center text-sm font-medium border-b-2 transition-colors flex items-center justify-center gap-2 ${activeTab === 'Sharing'
                            ? 'border-indigo-600 text-indigo-600'
                            : 'border-transparent text-slate-500 hover:text-slate-700'
                            }`}
                    >
                        <Users className="w-4 h-4" />
                        Sharing
                    </button>
                    <button
                        onClick={() => setActiveTab('Integrations')}
                        className={`flex-1 py-4 text-center text-sm font-medium border-b-2 transition-colors flex items-center justify-center gap-2 ${activeTab === 'Integrations'
                            ? 'border-indigo-600 text-indigo-600'
                            : 'border-transparent text-slate-500 hover:text-slate-700'
                            }`}
                    >
                        <Shield className="w-4 h-4" />
                        Integrations
                    </button>
                    <button
                        onClick={() => setActiveTab('Bank Accounts')}
                        className={`flex-1 py-4 text-center text-sm font-medium border-b-2 transition-colors flex items-center justify-center gap-2 ${activeTab === 'Bank Accounts'
                            ? 'border-indigo-600 text-indigo-600'
                            : 'border-transparent text-slate-500 hover:text-slate-700'
                            }`}
                    >
                        <Banknote className="w-4 h-4" />
                        Bank Accounts
                    </button>
                </div>

                {/* Tab Contents */}
                <div className="p-6 overflow-y-auto flex-1">

                    {/* GENERAL TAB */}
                    {activeTab === 'General' && (
                        <div className="space-y-8">
                            {/* Base Profile Details */}
                            <form onSubmit={handleProfileSubmit} className="space-y-4">
                                <h3 className="text-sm font-semibold text-color-text-main border-b border-slate-100 dark:border-slate-800 pb-2">Profile Information</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-color-text-main mb-1">Account Name</label>
                                        <input
                                            type="text"
                                            value={accountName}
                                            onChange={(e) => setAccountName(e.target.value)}
                                            className="w-full bg-transparent border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-color-text-main focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                            placeholder="Enter your account name"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-color-text-main mb-1">Friendly Name / Nickname</label>
                                        <input
                                            type="text"
                                            value={friendlyName}
                                            onChange={(e) => setFriendlyName(e.target.value)}
                                            className="w-full bg-transparent border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-color-text-main focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                            placeholder="What should we call you?"
                                        />
                                    </div>
                                </div>
                                <button
                                    type="submit"
                                    disabled={updateProfileMutation.isPending}
                                    className="w-full flex justify-center items-center gap-2 bg-slate-100 dark:bg-slate-800/50 text-color-text-main px-4 py-2 rounded-lg text-sm font-medium border border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700/50 transition duration-200"
                                >
                                    {updateProfileMutation.isPending ? 'Saving...' : 'Update Profile'}
                                </button>
                            </form>

                            {/* Security / Change Password */}
                            <div className="space-y-4 pt-2">
                                <h3 className="text-sm font-semibold text-color-text-main border-b border-slate-100 dark:border-slate-800 pb-2 flex items-center gap-2">
                                    <Shield className="w-4 h-4 text-slate-500" />
                                    Security
                                </h3>
                                <form onSubmit={handlePasswordSubmit} className="bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 p-4 rounded-xl space-y-4">

                                    {passwordError && (
                                        <div className="text-sm text-rose-600 bg-rose-50 dark:bg-rose-900/20 dark:text-rose-400 p-3 rounded-lg border border-rose-100 dark:border-rose-800/50">
                                            {passwordError}
                                        </div>
                                    )}
                                    {passwordSuccess && (
                                        <div className="text-sm text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 dark:text-emerald-400 p-3 rounded-lg border border-emerald-100 dark:border-emerald-800/50 flex items-center gap-2">
                                            <CheckCircle className="w-4 h-4" />
                                            {passwordSuccess}
                                        </div>
                                    )}

                                    <div>
                                        <label className="block text-xs font-medium text-color-text-main mb-1">Current Password</label>
                                        <input
                                            type="password"
                                            value={oldPassword}
                                            onChange={(e) => setOldPassword(e.target.value)}
                                            className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-color-text-main focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                            required
                                        />
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-medium text-color-text-main mb-1">New Password</label>
                                            <input
                                                type="password"
                                                value={newPassword}
                                                onChange={(e) => setNewPassword(e.target.value)}
                                                className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-color-text-main focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                                required
                                                minLength={6}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-color-text-main mb-1">Confirm New Password</label>
                                            <input
                                                type="password"
                                                value={confirmPassword}
                                                onChange={(e) => setConfirmPassword(e.target.value)}
                                                className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-color-text-main focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                                required
                                                minLength={6}
                                            />
                                        </div>
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={changePasswordMutation.isPending}
                                        className="w-full bg-slate-800 dark:bg-slate-700 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-900 dark:hover:bg-slate-600 transition duration-200"
                                    >
                                        {changePasswordMutation.isPending ? 'Updating...' : 'Change Password'}
                                    </button>
                                </form>
                            </div>
                        </div>
                    )}

                    {/* SHARING TAB */}
                    {activeTab === 'Sharing' && (
                        <div className="space-y-6">
                            {/* Plan Sharing Details */}
                            <div className="space-y-4">
                                <h3 className="text-sm font-semibold text-color-text-main border-b border-slate-100 dark:border-slate-800 pb-2">Plan Access Control</h3>
                                <div>
                                    <label className="block text-sm font-medium text-color-text-main mb-1">Select Plan Scope</label>
                                    <select
                                        value={sharePlanId}
                                        onChange={(e) => setSharePlanId(e.target.value)}
                                        className="w-full border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-color-text-main focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-slate-900"
                                    >
                                        {plans.map(p => (
                                            <option key={p.id} value={p.id}>{p.name}</option>
                                        ))}
                                    </select>
                                </div>

                                {planShares.length > 0 && (
                                    <div className="space-y-2">
                                        <div className="text-xs font-semibold text-color-text-muted uppercase tracking-wider mb-2">Active Invites</div>
                                        {planShares.map(share => (
                                            <div key={share.id} className="flex flex-row justify-between items-center bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 p-2 rounded-lg">
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-medium text-color-text-main">{share.sharedWithEmail}</span>
                                                    <span className="text-xs text-color-text-muted flex items-center gap-1">
                                                        <CheckCircle className="w-3 h-3 text-emerald-500" /> {share.status}
                                                    </span>
                                                </div>
                                                <button
                                                    onClick={() => share.id && deletePlanShareMutation.mutate(share.id)}
                                                    className="p-1.5 text-rose-500 hover:bg-rose-100 rounded-md transition-colors"
                                                    title="Revoke Access"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                <form onSubmit={handleInviteSubmit} className="flex flex-row gap-2">
                                    <input
                                        type="email"
                                        value={planShareEmail}
                                        onChange={(e) => setPlanShareEmail(e.target.value)}
                                        className="flex-1 bg-transparent border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-color-text-main focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                        placeholder="collaborator@example.com"
                                        required
                                    />
                                    <button
                                        type="submit"
                                        disabled={createPlanShareMutation.isPending || plans.length === 0}
                                        className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors whitespace-nowrap flex items-center gap-1"
                                    >
                                        <Plus className="w-4 h-4" />
                                        Share
                                    </button>
                                </form>
                            </div>
                        </div>
                    )}

                    {/* INTEGRATIONS TAB */}
                    {activeTab === 'Integrations' && (
                        <div className="space-y-6">

                            {/* Vault List */}
                            {integrations.length > 0 && (
                                <div className="space-y-3">
                                    <h3 className="text-sm font-semibold text-color-text-main">Active Integrations</h3>
                                    <div className="space-y-2">
                                        {integrations.map((integration) => (
                                            <div key={integration.id} className="flex items-center justify-between p-3 border border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                                                <div>
                                                    <div className="font-medium text-color-text-main">{integration.nickname}</div>
                                                    <div className="text-xs text-color-text-muted font-mono tracking-widest">{integration.encryptedApiAccessToken}</div>
                                                </div>
                                                <button
                                                    onClick={() => integration.id && deleteIntegrationMutation.mutate(integration.id)}
                                                    className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                                                    title="Remove Integration"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Add New Integration */}
                            <form onSubmit={handleIntegrationSubmit} className="bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 p-4 rounded-xl space-y-4">
                                <h3 className="text-sm font-semibold text-color-text-main flex items-center gap-2">
                                    <Plus className="w-4 h-4 text-indigo-600" />
                                    Portfolio Manager Add-On
                                </h3>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-medium text-color-text-main mb-1">Nickname</label>
                                        <input
                                            type="text"
                                            value={nickname}
                                            onChange={(e) => setNickname(e.target.value)}
                                            className="w-full bg-transparent border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-color-text-main focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                            placeholder="e.g. Robinhood API"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-color-text-main mb-1">Select Planner</label>
                                        <select
                                            value={integrationPlanId}
                                            onChange={(e) => setIntegrationPlanId(e.target.value)}
                                            className="w-full border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-color-text-main focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-slate-900"
                                            required
                                        >
                                            {plans.map(p => (
                                                <option key={p.id} value={p.id}>{p.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="block text-xs font-medium text-color-text-main mb-1">Secure API Access Token</label>
                                        <input
                                            type="password"
                                            value={apiToken}
                                            autoComplete="new-password"
                                            onChange={(e) => setApiToken(e.target.value)}
                                            className="w-full bg-transparent border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-color-text-main focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 font-mono"
                                            placeholder="Paste secret token..."
                                            required
                                        />
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={createIntegrationMutation.isPending || plans.length === 0}
                                    className="w-full bg-slate-800 dark:bg-slate-700 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-900 dark:hover:bg-slate-600 transition duration-200"
                                >
                                    {createIntegrationMutation.isPending ? 'Securing...' : 'Encrypt & Save Token'}
                                </button>
                            </form>
                        </div>
                    )}

                    {/* BANK ACCOUNTS TAB */}
                    {activeTab === 'Bank Accounts' && (
                        <div className="space-y-6">

                            {/* Existing Banks List */}
                            {bankAccounts.length > 0 && (
                                <div className="space-y-3">
                                    <h3 className="text-sm font-semibold text-color-text-main">Linked Accounts</h3>
                                    <div className="space-y-2">
                                        {bankAccounts.map((account) => (
                                            <div key={account.id} className="flex items-center justify-between p-3 border border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                                                <div className="flex items-center gap-3">
                                                    <div className="bg-indigo-100 text-indigo-700 p-2 rounded-lg">
                                                        <Banknote className="w-4 h-4" />
                                                    </div>
                                                    <div>
                                                        <div className="font-medium text-color-text-main">{account.bankName}</div>
                                                        {account.accountName && <div className="text-sm text-color-text-muted">{account.accountName}</div>}
                                                        <div className="text-xs text-color-text-muted">{account.accountType}</div>
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => account.id && deleteBankAccountMutation.mutate(account.id)}
                                                    className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                                                    title="Remove Account"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <form onSubmit={handleBankAccountSubmit} className="bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 p-4 rounded-xl space-y-4">
                                <h3 className="text-sm font-semibold text-color-text-main flex items-center gap-2">
                                    <Plus className="w-4 h-4 text-indigo-600" />
                                    Add Bank Account
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="md:col-span-2">
                                        <label className="block text-xs font-medium text-color-text-main mb-1">Bank Name</label>
                                        <input
                                            type="text"
                                            value={bankName}
                                            onChange={(e) => setBankName(e.target.value)}
                                            className="w-full bg-transparent border border-slate-300 dark:border-slate-700 text-color-text-main rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                            placeholder="e.g. Chase Bank"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-color-text-main mb-1">Account Name</label>
                                        <input
                                            type="text"
                                            value={bankAccountName}
                                            onChange={(e) => setBankAccountName(e.target.value)}
                                            className="w-full bg-transparent border border-slate-300 dark:border-slate-700 text-color-text-main rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                            placeholder="e.g. Joint Checking"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-color-text-main mb-1">Account Type</label>
                                        <select
                                            value={accountType}
                                            onChange={(e) => setAccountType(e.target.value)}
                                            className="w-full border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-color-text-main focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-slate-900"
                                            required
                                        >
                                            <option value="Checking">Checking</option>
                                            <option value="Savings">Savings</option>
                                            <option value="Business Checking">Business Checking</option>
                                            <option value="Line of Credit">Line of Credit</option>
                                            <option value="Credit Card">Credit Card</option>
                                        </select>
                                    </div>
                                </div>
                                <button
                                    type="submit"
                                    disabled={createBankAccountMutation.isPending}
                                    className="w-full bg-slate-800 dark:bg-slate-700 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-900 dark:hover:bg-slate-600 transition duration-200"
                                >
                                    {createBankAccountMutation.isPending ? 'Adding...' : 'Add Account'}
                                </button>
                            </form>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
