import { useState } from 'react';
import Papa from 'papaparse';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../services/apiClient';
import { useAuth } from '../contexts/AuthContext';
import { FileUp, Upload, X, ChevronRight, Calculator, CheckCircle2 } from 'lucide-react';
import type { CsvImportProfile, ExpectedIncomeItem } from '../types/models';

interface ImportStatementWizardProps {
    isOpen: boolean;
    onClose: () => void;
    year: number;
    month: number;
    expectedIncomes: ExpectedIncomeItem[];
}

type WizardStep = 'upload' | 'mapping' | 'selection' | 'preview' | 'apply';

export const ImportStatementWizard = ({ isOpen, onClose, year, month, expectedIncomes }: ImportStatementWizardProps) => {
    const { activePlanId } = useAuth();
    const queryClient = useQueryClient();
    
    const [step, setStep] = useState<WizardStep>('upload');
    const [headers, setHeaders] = useState<string[]>([]);
    const [previewData, setPreviewData] = useState<any[]>([]);
    
    // Mapping state
    const [targetSourceId, setTargetSourceId] = useState<string>('');
    const [selectedProfileId, setSelectedProfileId] = useState<string>('new');
    const [brokerName, setBrokerName] = useState('');
    const [dateColumn, setDateColumn] = useState('');
    const [symbolColumn, setSymbolColumn] = useState('');
    const [actionColumn, setActionColumn] = useState('');
    const [amountColumn, setAmountColumn] = useState('');
    const [dividendKeyword, setDividendKeyword] = useState('');

    // Computation
    const [totalRealized, setTotalRealized] = useState(0);
    const [symbolTotals, setSymbolTotals] = useState<Record<string, number>>({});

    const [selectedRowIndexes, setSelectedRowIndexes] = useState<Set<number>>(new Set());
    const [symbolFilter, setSymbolFilter] = useState('');

    const targetType = expectedIncomes.find(i => i.id === targetSourceId)?.type || '';
    const isOptionMode = targetType === 'Option Premium';

    const { data: profiles = [] } = useQuery({
        queryKey: ['csvProfiles', activePlanId],
        queryFn: () => apiClient.getCsvImportProfiles(activePlanId as string),
        enabled: !!activePlanId && isOpen
    });

    const reconcileMutation = useMutation({
        mutationFn: (amount: number) => apiClient.reconcileMonth({
            planId: activePlanId as string,
            incomeSourceId: targetSourceId,
            year,
            month,
            realizedIncome: amount
        }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['monthlySummary'] });
            onClose();
            resetState();
        }
    });

    const saveProfileMutation = useMutation({
        mutationFn: (profile: Omit<CsvImportProfile, 'id'>) => apiClient.createCsvImportProfile(profile),
        onSuccess: () => {
             queryClient.invalidateQueries({ queryKey: ['csvProfiles'] });
        }
    });

    const resetState = () => {
        setStep('upload');
        setHeaders([]);
        setPreviewData([]);
        setTargetSourceId('');
        setSelectedProfileId('new');
        setBrokerName('');
        setDateColumn('');
        setSymbolColumn('');
        setActionColumn('');
        setAmountColumn('');
        setDividendKeyword('');
        setTotalRealized(0);
        setSymbolTotals({});
        setSelectedRowIndexes(new Set());
        setSymbolFilter('');
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (!selectedFile) return;

        Papa.parse(selectedFile, {
            header: true,
            skipEmptyLines: true,
            preview: 1000, 
            complete: (results) => {
                if (results.meta.fields) {
                    setHeaders(results.meta.fields);
                }
                setPreviewData(results.data);
                setStep('mapping');
            }
        });
    };

    const loadProfile = (profileId: string) => {
        setSelectedProfileId(profileId);
        if (profileId === 'new') {
            setBrokerName('');
            setDateColumn('');
            setSymbolColumn('');
            setActionColumn('');
            setAmountColumn('');
            setDividendKeyword('');
            return;
        }

        const profile = profiles.find(p => p.id === profileId);
        if (profile) {
            setBrokerName(profile.brokerName);
            setDateColumn(profile.dateColumn);
            setSymbolColumn(profile.symbolColumn);
            setActionColumn(profile.actionColumn);
            setAmountColumn(profile.amountColumn);
            setDividendKeyword(profile.dividendKeyword);
        }
    };

    const handleMappingSubmit = () => {
        // Compute the actuals
        let sum = 0;
        const symTots: Record<string, number> = {};

        previewData.forEach(row => {
            const actionStr = String(row[actionColumn] || '').toLowerCase();
            const keywordStr = dividendKeyword.toLowerCase();
            
            // Basic matching
            if (actionStr.includes(keywordStr) && keywordStr !== '') {
                const amountStr = row[amountColumn];
                if (amountStr) {
                    // Extract numbers, could be "$50.00" or "50"
                    const val = parseFloat(amountStr.replace(/[^0-9.-]+/g, ""));
                    if (!isNaN(val)) {
                        sum += val;
                        const sym = row[symbolColumn] || 'Unknown';
                        symTots[sym] = (symTots[sym] || 0) + val;
                    }
                }
            }
        });

        setTotalRealized(sum);
        setSymbolTotals(symTots);

        if (selectedProfileId === 'new' && brokerName) {
            saveProfileMutation.mutate({
                planId: activePlanId as string,
                brokerName,
                dateColumn,
                dateFormat: 'auto',
                symbolColumn,
                actionColumn,
                amountColumn,
                dividendKeyword,
                optionKeyword: ''
            });
        }

        setStep('preview');
    };

    const handleApply = () => {
        reconcileMutation.mutate(totalRealized);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
            <div className="bg-color-surface w-full max-w-2xl rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 flex flex-col max-h-[90vh]">
                <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800">
                    <h3 className="text-xl font-bold text-color-text-main flex items-center gap-2">
                        <Upload className="h-5 w-5 text-indigo-500" />
                        Broker Statement Import
                    </h3>
                    <button onClick={() => { resetState(); onClose(); }} className="text-slate-400 hover:text-color-text-main">
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <div className="p-6 overflow-y-auto flex-1">
                    {/* Stepper */}
                    <div className="flex items-center justify-between mb-8 opacity-80">
                        <div className={`flex flex-col items-center ${step === 'upload' ? 'text-indigo-500' : 'text-slate-400'}`}>
                            <div className="h-8 w-8 rounded-full border-2 border-current flex items-center justify-center font-bold mb-1">1</div>
                            <span className="text-xs font-semibold uppercase tracking-wide">Upload</span>
                        </div>
                        <div className="flex-1 h-0.5 bg-slate-200 mx-4"></div>
                        <div className={`flex flex-col items-center ${step === 'mapping' ? 'text-indigo-500' : 'text-slate-400'}`}>
                            <div className="h-8 w-8 rounded-full border-2 border-current flex items-center justify-center font-bold mb-1">2</div>
                            <span className="text-xs font-semibold uppercase tracking-wide">Map</span>
                        </div>
                        <div className="flex-1 h-0.5 bg-slate-200 mx-4"></div>
                        <div className={`flex flex-col items-center ${(step === 'preview' || step === 'selection') ? 'text-indigo-500' : 'text-slate-400'}`}>
                            <div className="h-8 w-8 rounded-full border-2 border-current flex items-center justify-center font-bold mb-1">3</div>
                            <span className="text-xs font-semibold uppercase tracking-wide">Verify</span>
                        </div>
                    </div>

                    {step === 'upload' && (
                        <div className="space-y-6">
                            <p className="text-color-text-muted text-sm">Select a CSV statement exported from your brokerage for {month}/{year}.</p>
                            
                            <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-indigo-300 dark:border-indigo-900/50 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/30 cursor-pointer transition-colors bg-white dark:bg-slate-900">
                                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                    <FileUp className="w-10 h-10 mb-3 text-indigo-500" />
                                    <p className="mb-2 text-sm text-color-text-main"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                                    <p className="text-xs text-color-text-muted">CSV files only</p>
                                </div>
                                <input type="file" className="hidden" accept=".csv" onChange={handleFileUpload} />
                            </label>
                        </div>
                    )}

                    {step === 'mapping' && (
                        <div className="space-y-5 animate-in fade-in duration-300">
                             <div>
                                <label className="block text-sm font-semibold text-color-text-main mb-1">Target Income Source</label>
                                <select 
                                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-color-text-main rounded-lg p-2.5 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 mb-4"
                                    value={targetSourceId}
                                    onChange={(e) => setTargetSourceId(e.target.value)}
                                >
                                    <option value="">-- Select an Expected Income Account --</option>
                                    {expectedIncomes.map(inc => (
                                        <option key={inc.id} value={inc.id}>{inc.source}</option>
                                    ))}
                                </select>
                            </div>

                             <div>
                                <label className="block text-sm font-semibold text-color-text-main mb-1">Import Profile</label>
                                <select 
                                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-color-text-main rounded-lg p-2.5 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                                    value={selectedProfileId}
                                    onChange={(e) => loadProfile(e.target.value)}
                                >
                                    <option value="new">-- Create New Profile --</option>
                                    {profiles.map(p => (
                                        <option key={p.id} value={p.id}>{p.brokerName}</option>
                                    ))}
                                </select>
                            </div>

                            {selectedProfileId === 'new' && (
                                <div className="pt-2">
                                    <label className="block text-sm font-semibold text-color-text-main mb-1">New Broker Name</label>
                                    <input 
                                        type="text" 
                                        value={brokerName}
                                        onChange={e => setBrokerName(e.target.value)}
                                        placeholder="e.g., Charles Schwab"
                                        className="w-full bg-color-surface border border-slate-300 dark:border-slate-700 text-color-text-main rounded-lg p-2.5 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                                    />
                                </div>
                            )}

                            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                                <div>
                                    <label className="block text-xs font-semibold text-color-text-muted uppercase mb-1">Action Column</label>
                                    <select value={actionColumn} onChange={e => setActionColumn(e.target.value)} className="w-full bg-color-surface border border-slate-300 dark:border-slate-700 text-color-text-main rounded-lg p-2 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500">
                                        <option value="">Select column...</option>
                                        {headers.map(h => <option key={h} value={h}>{h}</option>)}
                                    </select>
                                </div>
                                {!isOptionMode && (
                                    <div>
                                        <label className="block text-xs font-semibold text-color-text-muted uppercase mb-1">Dividend Keyword</label>
                                        <input type="text" value={dividendKeyword} onChange={e => setDividendKeyword(e.target.value)} placeholder="e.g., 'Dividend'" className="w-full bg-color-surface border border-slate-300 dark:border-slate-700 text-color-text-main rounded-lg p-2 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500" />
                                    </div>
                                )}
                                <div>
                                    <label className="block text-xs font-semibold text-color-text-muted uppercase mb-1">Amount Column</label>
                                    <select value={amountColumn} onChange={e => setAmountColumn(e.target.value)} className="w-full bg-color-surface border border-slate-300 dark:border-slate-700 text-color-text-main rounded-lg p-2 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500">
                                        <option value="">Select column...</option>
                                        {headers.map(h => <option key={h} value={h}>{h}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-color-text-muted uppercase mb-1">Symbol Column</label>
                                    <select value={symbolColumn} onChange={e => setSymbolColumn(e.target.value)} className="w-full bg-color-surface border border-slate-300 dark:border-slate-700 text-color-text-main rounded-lg p-2 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500">
                                        <option value="">Select column...</option>
                                        {headers.map(h => <option key={h} value={h}>{h}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-color-text-muted uppercase mb-1">Date Column (Optional)</label>
                                    <select value={dateColumn} onChange={e => setDateColumn(e.target.value)} className="w-full bg-color-surface border border-slate-300 dark:border-slate-700 text-color-text-main rounded-lg p-2 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500">
                                        <option value="">Select column...</option>
                                        {headers.map(h => <option key={h} value={h}>{h}</option>)}
                                    </select>
                                </div>
                            </div>
                        </div>
                    )}

                    {step === 'selection' && (
                        <div className="space-y-4 animate-in fade-in duration-300 h-full flex flex-col">
                            <div className="flex gap-4 mb-4 shrink-0">
                                <div className="flex-1">
                                    <label className="block text-xs font-semibold text-color-text-muted uppercase mb-1">Filter by Symbol</label>
                                    <input 
                                        type="text" 
                                        value={symbolFilter} 
                                        onChange={e => setSymbolFilter(e.target.value.toUpperCase())}
                                        placeholder="e.g., AAPL"
                                        className="w-full bg-color-surface border border-slate-300 dark:border-slate-700 text-color-text-main rounded-lg p-2 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                                    />
                                </div>
                            </div>
                            
                            <div className="flex-1 overflow-auto border border-slate-200 dark:border-slate-700 rounded-lg">
                                <table className="w-full text-sm text-left text-color-text-main">
                                    <thead className="text-xs text-color-text-muted uppercase bg-slate-50 dark:bg-slate-800 sticky top-0">
                                        <tr>
                                            <th className="px-4 py-3 w-10">
                                                <input type="checkbox" onChange={(e) => {
                                                    const newVisibleSet = new Set(selectedRowIndexes);
                                                    previewData.forEach((row, i) => {
                                                        const sym = (String(row[symbolColumn]) || '').toUpperCase();
                                                        if (symbolFilter === '' || sym.includes(symbolFilter)) {
                                                            if (e.target.checked) newVisibleSet.add(i);
                                                            else newVisibleSet.delete(i);
                                                        }
                                                    });
                                                    setSelectedRowIndexes(newVisibleSet);
                                                }} />
                                            </th>
                                            <th className="px-4 py-3">Date</th>
                                            <th className="px-4 py-3">Symbol</th>
                                            <th className="px-4 py-3">Action</th>
                                            <th className="px-4 py-3 text-right">Amount</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {previewData.map((row, i) => {
                                            const sym = (String(row[symbolColumn]) || '').toUpperCase();
                                            if (symbolFilter !== '' && !sym.includes(symbolFilter)) return null;

                                            return (
                                                <tr key={i} className={`border-b dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50 ${selectedRowIndexes.has(i) ? 'bg-indigo-50/50 dark:bg-indigo-900/20' : ''}`}>
                                                    <td className="px-4 py-3">
                                                        <input 
                                                            type="checkbox" 
                                                            checked={selectedRowIndexes.has(i)}
                                                            onChange={(e) => {
                                                                const newSet = new Set(selectedRowIndexes);
                                                                if (e.target.checked) newSet.add(i);
                                                                else newSet.delete(i);
                                                                setSelectedRowIndexes(newSet);
                                                            }}
                                                        />
                                                    </td>
                                                    <td className="px-4 py-3">{dateColumn ? row[dateColumn] : '-'}</td>
                                                    <td className="px-4 py-3 font-semibold">{row[symbolColumn]}</td>
                                                    <td className="px-4 py-3">{row[actionColumn]}</td>
                                                    <td className="px-4 py-3 text-right font-mono">
                                                        {row[amountColumn]}
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                            
                            <div className="shrink-0 pt-4 flex justify-between items-center border-t border-slate-100 dark:border-slate-800">
                                <span className="text-sm text-color-text-muted">{selectedRowIndexes.size} items selected</span>
                                <div className="text-right flex items-center">
                                    <span className="text-xs uppercase tracking-wider font-semibold text-color-text-muted mr-3">Calculated PnL:</span>
                                    <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                                        ${Array.from(selectedRowIndexes).reduce((sum, i) => {
                                            const valStr = String(previewData[i][amountColumn] || '').replace(/[^0-9.-]+/g, "");
                                            const val = parseFloat(valStr);
                                            return sum + (isNaN(val) ? 0 : val);
                                        }, 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}

                    {step === 'preview' && (
                        <div className="space-y-6 animate-in fade-in duration-300">
                             <div className="text-center p-6 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700">
                                <h4 className="text-sm font-semibold text-color-text-muted uppercase tracking-wider mb-2">Calculated Realized Income</h4>
                                <div className="text-4xl font-extrabold text-emerald-600 dark:text-emerald-400 mb-2">
                                    ${totalRealized.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </div>
                            </div>

                            <div>
                                <h4 className="text-md font-bold mb-3 flex items-center gap-2 border-b pb-2 dark:border-slate-700"><Calculator className="w-4 h-4 text-indigo-500" /> By Symbol Summary</h4>
                                <div className="max-h-48 overflow-y-auto pr-2 grid grid-cols-2 gap-x-8 gap-y-2">
                                    {Object.entries(symbolTotals).filter(([_,v]) => v > 0).map(([sym, val]) => (
                                        <div key={sym} className="flex justify-between items-center text-sm py-1 border-b border-slate-100 dark:border-slate-800 border-dashed border-spacing-2">
                                            <span className="font-semibold">{sym}</span>
                                            <span className="text-emerald-600 dark:text-emerald-400 font-mono">${val.toFixed(2)}</span>
                                        </div>
                                    ))}
                                    {Object.keys(symbolTotals).length === 0 && (
                                        <div className="col-span-2 text-sm text-color-text-muted text-center pt-4">No dividends found with current settings.</div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                </div>

                <div className="p-4 bg-slate-50 dark:bg-slate-800/30 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-3 rounded-b-2xl">
                    <button onClick={() => { resetState(); onClose(); }} className="px-5 py-2 font-medium text-slate-600 hover:bg-slate-200 dark:text-slate-300 dark:hover:bg-slate-700 rounded-lg transition-colors">
                        Cancel
                    </button>
                    {step === 'mapping' && (
                        <button 
                            disabled={!targetSourceId || !actionColumn || !amountColumn || (!isOptionMode && !dividendKeyword)}
                            onClick={() => {
                                if (selectedProfileId === 'new' && brokerName) {
                                    saveProfileMutation.mutate({
                                        planId: activePlanId as string,
                                        brokerName,
                                        dateColumn,
                                        dateFormat: 'auto',
                                        symbolColumn,
                                        actionColumn,
                                        amountColumn,
                                        dividendKeyword: isOptionMode ? '' : dividendKeyword,
                                        optionKeyword: ''
                                    });
                                }

                                if (isOptionMode) {
                                    setStep('selection');
                                } else {
                                    handleMappingSubmit();
                                }
                            }} 
                            className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-lg font-medium shadow-sm transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Next Step <ChevronRight className="w-4 h-4" />
                        </button>
                    )}
                    {step === 'selection' && (
                        <button 
                            disabled={selectedRowIndexes.size === 0 || reconcileMutation.isPending}
                            onClick={() => {
                                const sum = Array.from(selectedRowIndexes).reduce((s, i) => {
                                    const valStr = String(previewData[i][amountColumn] || '').replace(/[^0-9.-]+/g, "");
                                    const val = parseFloat(valStr);
                                    return s + (isNaN(val) ? 0 : val);
                                }, 0);
                                reconcileMutation.mutate(sum);
                            }} 
                            className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2 rounded-lg font-medium shadow-sm transition-colors flex items-center gap-2 disabled:opacity-50"
                        >
                            <CheckCircle2 className="w-4 h-4" /> 
                            {reconcileMutation.isPending ? 'Saving...' : 'Reconcile Options'}
                        </button>
                    )}
                    {step === 'preview' && (
                        <button 
                            disabled={reconcileMutation.isPending || totalRealized <= 0}
                            onClick={handleApply} 
                            className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2 rounded-lg font-medium shadow-sm transition-colors flex items-center gap-2 disabled:opacity-50"
                        >
                            <CheckCircle2 className="w-4 h-4" /> 
                            {reconcileMutation.isPending ? 'Saving...' : 'Reconcile Month'}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};
