import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getExpenseCategories,
  createExpenseCategory,
  updateExpenseCategory,
  deleteExpenseCategory,
} from '../api/endpoints';
import type { ExpenseCategory, CreateExpenseCategoryRequest } from '../types';

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);

const emptyForm: CreateExpenseCategoryRequest = {
  name: '',
  isFixed: true,
  plannedAmount: 0,
};

const ExpensesPage: React.FC = () => {
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState<ExpenseCategory | null>(null);
  const [form, setForm] = useState<CreateExpenseCategoryRequest>(emptyForm);

  const categoriesQuery = useQuery({ queryKey: ['expenseCategories'], queryFn: getExpenseCategories });

  const createMutation = useMutation({
    mutationFn: createExpenseCategory,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['expenseCategories'] });
      qc.invalidateQueries({ queryKey: ['summary'] });
      resetForm();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: CreateExpenseCategoryRequest & { isActive: boolean } }) =>
      updateExpenseCategory(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['expenseCategories'] });
      qc.invalidateQueries({ queryKey: ['summary'] });
      resetForm();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteExpenseCategory,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['expenseCategories'] });
      qc.invalidateQueries({ queryKey: ['summary'] });
    },
  });

  const resetForm = () => {
    setForm(emptyForm);
    setEditItem(null);
    setShowForm(false);
  };

  const handleEdit = (item: ExpenseCategory) => {
    setEditItem(item);
    setForm({ name: item.name, isFixed: item.isFixed, plannedAmount: item.plannedAmount });
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

  const totalFixed = categoriesQuery.data?.filter((c) => c.isFixed).reduce((s, c) => s + c.plannedAmount, 0) ?? 0;
  const totalVariable = categoriesQuery.data?.filter((c) => !c.isFixed).reduce((s, c) => s + c.plannedAmount, 0) ?? 0;

  return (
    <div className="page">
      <div className="page-header">
        <h2>🏦 Expense Categories</h2>
        <button className="btn-primary" onClick={() => { resetForm(); setShowForm(true); }}>
          + Add Category
        </button>
      </div>

      {categoriesQuery.data && categoriesQuery.data.length > 0 && (
        <div className="summary-cards" style={{ marginBottom: '1.5rem' }}>
          <div className="summary-card expenses">
            <div className="card-label">Fixed Expenses</div>
            <div className="card-value">{formatCurrency(totalFixed)}</div>
          </div>
          <div className="summary-card">
            <div className="card-label">Variable Expenses</div>
            <div className="card-value">{formatCurrency(totalVariable)}</div>
          </div>
          <div className="summary-card deficit">
            <div className="card-label">Total Planned</div>
            <div className="card-value">{formatCurrency(totalFixed + totalVariable)}</div>
          </div>
        </div>
      )}

      {showForm && (
        <div className="modal-overlay" onClick={resetForm}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>{editItem ? 'Edit Expense Category' : 'Add Expense Category'}</h3>
            <form onSubmit={handleSubmit} className="income-form">
              <label>
                Category Name
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g., Rent/Mortgage, Healthcare"
                  required
                />
              </label>
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={form.isFixed}
                  onChange={(e) => setForm({ ...form, isFixed: e.target.checked })}
                />
                Fixed Monthly Expense
              </label>
              <label>
                Planned Amount ($)
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={form.plannedAmount}
                  onChange={(e) => setForm({ ...form, plannedAmount: parseFloat(e.target.value) })}
                  required
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

      {categoriesQuery.isLoading && <div className="loading">Loading…</div>}
      {categoriesQuery.error && <div className="error-banner">Failed to load expense categories.</div>}

      {categoriesQuery.data && categoriesQuery.data.length === 0 && (
        <div className="empty-state">No expense categories yet. Click "Add Category" to get started.</div>
      )}

      {categoriesQuery.data && categoriesQuery.data.length > 0 && (
        <table className="data-table">
          <thead>
            <tr>
              <th>Category</th>
              <th>Type</th>
              <th>Planned Amount</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {categoriesQuery.data.map((c) => (
              <tr key={c.id} className={c.isActive ? '' : 'row-inactive'}>
                <td><strong>{c.name}</strong></td>
                <td>
                  <span className={`badge ${c.isFixed ? 'badge-info' : 'badge-warning'}`}>
                    {c.isFixed ? '🔒 Fixed' : '🔄 Variable'}
                  </span>
                </td>
                <td>{formatCurrency(c.plannedAmount)}</td>
                <td>
                  <span className={`badge ${c.isActive ? 'badge-success' : 'badge-muted'}`}>
                    {c.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="action-cell">
                  <button className="btn-icon" onClick={() => handleEdit(c)} title="Edit">✏️</button>
                  <button
                    className="btn-icon btn-danger"
                    onClick={() => { if (confirm('Delete this expense category?')) deleteMutation.mutate(c.id); }}
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

export default ExpensesPage;
