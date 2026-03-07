import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getIncomeSources,
  getIncomeTypes,
  createIncomeSource,
  updateIncomeSource,
  deleteIncomeSource,
} from '../api/endpoints';
import type { IncomeSource, CreateIncomeSourceRequest } from '../types';
import { IncomeFrequency, IncomeFrequencyLabels } from '../types';

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);

const emptyForm: CreateIncomeSourceRequest = {
  amount: 0,
  source: '',
  incomeTypeId: '',
  frequency: IncomeFrequency.Monthly,
  targetDate: new Date().toISOString().split('T')[0],
  description: '',
};

const IncomePage: React.FC = () => {
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState<IncomeSource | null>(null);
  const [form, setForm] = useState<CreateIncomeSourceRequest>(emptyForm);

  const sourcesQuery = useQuery({ queryKey: ['incomeSources'], queryFn: getIncomeSources });
  const typesQuery = useQuery({ queryKey: ['incomeTypes'], queryFn: getIncomeTypes });

  const createMutation = useMutation({
    mutationFn: createIncomeSource,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['incomeSources'] });
      qc.invalidateQueries({ queryKey: ['summary'] });
      resetForm();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: CreateIncomeSourceRequest & { isActive: boolean } }) =>
      updateIncomeSource(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['incomeSources'] });
      qc.invalidateQueries({ queryKey: ['summary'] });
      resetForm();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteIncomeSource,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['incomeSources'] });
      qc.invalidateQueries({ queryKey: ['summary'] });
    },
  });

  const resetForm = () => {
    setForm(emptyForm);
    setEditItem(null);
    setShowForm(false);
  };

  const handleEdit = (item: IncomeSource) => {
    setEditItem(item);
    setForm({
      amount: item.amount,
      source: item.source,
      incomeTypeId: item.incomeTypeId,
      frequency: item.frequency,
      targetDate: item.targetDate.split('T')[0],
      description: item.description,
    });
    setShowForm(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editItem) {
      updateMutation.mutate({ id: editItem.id, data: { ...form, isActive: editItem.isActive } });
    } else {
      createMutation.mutate(form);
    }
  };

  // Quick-add for Monthly IT Contract
  const quickAddMonthlyContract = () => {
    const monthlyType = typesQuery.data?.find((t) => t.name.toLowerCase().includes('contract') || t.name.toLowerCase().includes('it'));
    setForm({
      amount: 0,
      source: 'Monthly IT Contract',
      incomeTypeId: monthlyType?.id ?? typesQuery.data?.[0]?.id ?? '',
      frequency: IncomeFrequency.Monthly,
      targetDate: new Date().toISOString().split('T')[0],
      description: 'Recurring monthly IT contract income',
    });
    setShowForm(true);
  };

  return (
    <div className="page">
      <div className="page-header">
        <h2>💰 Income Sources</h2>
        <div className="header-actions">
          <button className="btn-secondary" onClick={quickAddMonthlyContract}>
            ⚡ Quick Add: Monthly IT Contract
          </button>
          <button className="btn-primary" onClick={() => { resetForm(); setShowForm(true); }}>
            + Add Income
          </button>
        </div>
      </div>

      {showForm && (
        <div className="modal-overlay" onClick={resetForm}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>{editItem ? 'Edit Income Source' : 'Add Income Source'}</h3>
            <form onSubmit={handleSubmit} className="income-form">
              <label>
                Source Name
                <input
                  type="text"
                  value={form.source}
                  onChange={(e) => setForm({ ...form, source: e.target.value })}
                  placeholder="e.g., Apple Dividends"
                  required
                />
              </label>
              <label>
                Income Type
                <select
                  value={form.incomeTypeId}
                  onChange={(e) => setForm({ ...form, incomeTypeId: e.target.value })}
                  required
                >
                  <option value="">-- Select Type --</option>
                  {typesQuery.data?.map((t) => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
              </label>
              <label>
                Amount ($)
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={form.amount}
                  onChange={(e) => setForm({ ...form, amount: parseFloat(e.target.value) })}
                  required
                />
              </label>
              <label>
                Frequency
                <select
                  value={form.frequency}
                  onChange={(e) => setForm({ ...form, frequency: Number(e.target.value) as IncomeFrequency })}
                >
                  {Object.entries(IncomeFrequencyLabels).map(([key, label]) => (
                    <option key={key} value={key}>{label}</option>
                  ))}
                </select>
              </label>
              <label>
                Target Date
                <input
                  type="date"
                  value={form.targetDate}
                  onChange={(e) => setForm({ ...form, targetDate: e.target.value })}
                  required
                />
              </label>
              <label>
                Description
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={2}
                />
              </label>
              <div className="form-actions">
                <button type="button" className="btn-secondary" onClick={resetForm}>Cancel</button>
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={createMutation.isPending || updateMutation.isPending}
                >
                  {editItem ? 'Update' : 'Add'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {sourcesQuery.isLoading && <div className="loading">Loading…</div>}
      {sourcesQuery.error && <div className="error-banner">Failed to load income sources.</div>}

      {sourcesQuery.data && sourcesQuery.data.length === 0 && (
        <div className="empty-state">No income sources yet. Click "Add Income" to get started.</div>
      )}

      {sourcesQuery.data && sourcesQuery.data.length > 0 && (
        <table className="data-table">
          <thead>
            <tr>
              <th>Source</th>
              <th>Type</th>
              <th>Amount</th>
              <th>Frequency</th>
              <th>Target Date</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {sourcesQuery.data.map((s) => (
              <tr key={s.id} className={s.isActive ? '' : 'row-inactive'}>
                <td>
                  <strong>{s.source}</strong>
                  {s.description && <div className="cell-subtitle">{s.description}</div>}
                </td>
                <td>{s.incomeTypeName}</td>
                <td>{formatCurrency(s.amount)}</td>
                <td>{IncomeFrequencyLabels[s.frequency]}</td>
                <td>{new Date(s.targetDate).toLocaleDateString()}</td>
                <td>
                  <span className={`badge ${s.isActive ? 'badge-success' : 'badge-muted'}`}>
                    {s.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="action-cell">
                  <button className="btn-icon" onClick={() => handleEdit(s)} title="Edit">✏️</button>
                  <button
                    className="btn-icon btn-danger"
                    onClick={() => { if (confirm('Delete this income source?')) deleteMutation.mutate(s.id); }}
                    title="Delete"
                  >
                    🗑️
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default IncomePage;
