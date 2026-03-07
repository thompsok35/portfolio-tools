import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getIncomeTypes, createIncomeType, deleteIncomeType } from '../api/endpoints';
import { useAuth } from '../context/AuthContext';
import { regenerateApiToken } from '../api/endpoints';

const SettingsPage: React.FC = () => {
  const { user, logout } = useAuth();
  const qc = useQueryClient();
  const [newTypeName, setNewTypeName] = useState('');
  const [apiToken, setApiToken] = useState(user?.apiToken ?? '');
  const [tokenVisible, setTokenVisible] = useState(false);

  const typesQuery = useQuery({ queryKey: ['incomeTypes'], queryFn: getIncomeTypes });

  const createMutation = useMutation({
    mutationFn: () => createIncomeType(newTypeName),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['incomeTypes'] });
      setNewTypeName('');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteIncomeType,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['incomeTypes'] }),
  });

  const regenMutation = useMutation({
    mutationFn: regenerateApiToken,
    onSuccess: (data) => {
      setApiToken(data.apiToken);
    },
  });

  return (
    <div className="page">
      <div className="page-header">
        <h2>⚙️ Settings</h2>
      </div>

      <div className="settings-section">
        <h3>Account</h3>
        <div className="settings-info">
          <div><strong>Username:</strong> {user?.username}</div>
          <div><strong>Email:</strong> {user?.email}</div>
        </div>
        <button className="btn-danger-outline" onClick={logout}>Sign Out</button>
      </div>

      <div className="settings-section">
        <h3>API Token</h3>
        <p className="settings-description">
          Use this token to integrate with other portfolio management tools.
        </p>
        <div className="api-token-row">
          <input
            type={tokenVisible ? 'text' : 'password'}
            value={apiToken}
            readOnly
            className="api-token-input"
          />
          <button className="btn-secondary btn-sm" onClick={() => setTokenVisible(!tokenVisible)}>
            {tokenVisible ? 'Hide' : 'Show'}
          </button>
          <button
            className="btn-secondary btn-sm"
            onClick={() => navigator.clipboard.writeText(apiToken)}
          >
            Copy
          </button>
        </div>
        <button
          className="btn-danger-outline btn-sm"
          onClick={() => { if (confirm('Regenerate API token? All existing integrations will need to be updated.')) regenMutation.mutate(); }}
          disabled={regenMutation.isPending}
        >
          {regenMutation.isPending ? 'Regenerating…' : 'Regenerate Token'}
        </button>
      </div>

      <div className="settings-section">
        <h3>Income Types Configuration</h3>
        <p className="settings-description">
          Manage your income type categories. These will appear in the income source form.
        </p>
        <form
          onSubmit={(e) => { e.preventDefault(); if (newTypeName.trim()) createMutation.mutate(); }}
          className="inline-form"
        >
          <input
            type="text"
            value={newTypeName}
            onChange={(e) => setNewTypeName(e.target.value)}
            placeholder="e.g., Dividend, Option Premium, Rental"
            required
          />
          <button type="submit" className="btn-primary btn-sm" disabled={createMutation.isPending}>
            Add Type
          </button>
        </form>

        {typesQuery.isLoading && <div className="loading">Loading…</div>}

        {typesQuery.data && typesQuery.data.length === 0 && (
          <div className="empty-state">No income types yet. Add some to get started.</div>
        )}

        {typesQuery.data && typesQuery.data.length > 0 && (
          <ul className="type-list">
            {typesQuery.data.map((t) => (
              <li key={t.id} className="type-list-item">
                <span>{t.name}</span>
                <button
                  className="btn-icon btn-danger"
                  onClick={() => { if (confirm(`Delete type "${t.name}"?`)) deleteMutation.mutate(t.id); }}
                  title="Delete"
                >
                  🗑️
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default SettingsPage;
