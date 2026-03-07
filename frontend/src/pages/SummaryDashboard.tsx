import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getMonthlySummary, getQuarterlySummary } from '../api/endpoints';
import type { MonthlySummary, QuarterlySummary } from '../types';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);

const SummaryDashboard: React.FC = () => {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [viewMode, setViewMode] = useState<'monthly' | 'quarterly'>('monthly');
  const [quarter, setQuarter] = useState(Math.ceil((now.getMonth() + 1) / 3));

  const monthlyQuery = useQuery<MonthlySummary>({
    queryKey: ['summary', 'monthly', year, month],
    queryFn: () => getMonthlySummary(year, month),
    enabled: viewMode === 'monthly',
  });

  const quarterlyQuery = useQuery<QuarterlySummary>({
    queryKey: ['summary', 'quarterly', year, quarter],
    queryFn: () => getQuarterlySummary(year, quarter),
    enabled: viewMode === 'quarterly',
  });

  const renderMonthlySummary = (summary: MonthlySummary) => (
    <div>
      <div className="summary-cards">
        <div className="summary-card income">
          <div className="card-label">Total Income</div>
          <div className="card-value">{formatCurrency(summary.totalIncome)}</div>
        </div>
        <div className="summary-card expenses">
          <div className="card-label">Total Expenses</div>
          <div className="card-value">{formatCurrency(summary.totalExpenses)}</div>
        </div>
        <div className={`summary-card ${summary.netSurplusDeficit >= 0 ? 'surplus' : 'deficit'}`}>
          <div className="card-label">Net {summary.netSurplusDeficit >= 0 ? 'Surplus' : 'Deficit'}</div>
          <div className="card-value">{formatCurrency(summary.netSurplusDeficit)}</div>
        </div>
      </div>

      {Object.keys(summary.incomeByType).length > 0 && (
        <div className="breakdown-section">
          <h3>Income by Type</h3>
          <div className="breakdown-list">
            {Object.entries(summary.incomeByType).map(([type, amount]) => (
              <div key={type} className="breakdown-row">
                <span>{type}</span>
                <span>{formatCurrency(amount)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {summary.incomeSources.length > 0 && (
        <div className="breakdown-section">
          <h3>Income Sources</h3>
          <table className="data-table">
            <thead>
              <tr>
                <th>Source</th>
                <th>Type</th>
                <th>Frequency</th>
                <th>Amount</th>
                <th>Target Date</th>
              </tr>
            </thead>
            <tbody>
              {summary.incomeSources.map((s) => (
                <tr key={s.id}>
                  <td>{s.source}</td>
                  <td>{s.incomeTypeName}</td>
                  <td>{getFrequencyLabel(s.frequency)}</td>
                  <td>{formatCurrency(s.amount)}</td>
                  <td>{new Date(s.targetDate).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {summary.expenseCategories.length > 0 && (
        <div className="breakdown-section">
          <h3>Expense Categories</h3>
          <table className="data-table">
            <thead>
              <tr>
                <th>Category</th>
                <th>Fixed?</th>
                <th>Planned Amount</th>
              </tr>
            </thead>
            <tbody>
              {summary.expenseCategories.map((e) => (
                <tr key={e.id}>
                  <td>{e.name}</td>
                  <td>{e.isFixed ? '✅ Fixed' : '🔄 Variable'}</td>
                  <td>{formatCurrency(e.plannedAmount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h2>📊 Financial Summary</h2>
        <div className="view-controls">
          <div className="toggle-group">
            <button
              className={viewMode === 'monthly' ? 'active' : ''}
              onClick={() => setViewMode('monthly')}
            >
              Monthly
            </button>
            <button
              className={viewMode === 'quarterly' ? 'active' : ''}
              onClick={() => setViewMode('quarterly')}
            >
              Quarterly
            </button>
          </div>
          <div className="date-controls">
            <select value={year} onChange={(e) => setYear(Number(e.target.value))}>
              {Array.from({ length: 5 }, (_, i) => now.getFullYear() - 2 + i).map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
            {viewMode === 'monthly' ? (
              <select value={month} onChange={(e) => setMonth(Number(e.target.value))}>
                {MONTH_NAMES.map((name, i) => (
                  <option key={i + 1} value={i + 1}>{name}</option>
                ))}
              </select>
            ) : (
              <select value={quarter} onChange={(e) => setQuarter(Number(e.target.value))}>
                <option value={1}>Q1 (Jan–Mar)</option>
                <option value={2}>Q2 (Apr–Jun)</option>
                <option value={3}>Q3 (Jul–Sep)</option>
                <option value={4}>Q4 (Oct–Dec)</option>
              </select>
            )}
          </div>
        </div>
      </div>

      {viewMode === 'monthly' && (
        <>
          {monthlyQuery.isLoading && <div className="loading">Loading summary…</div>}
          {monthlyQuery.error && <div className="error-banner">Failed to load summary.</div>}
          {monthlyQuery.data && renderMonthlySummary(monthlyQuery.data)}
          {monthlyQuery.data?.incomeSources.length === 0 && monthlyQuery.data?.expenseCategories.length === 0 && (
            <div className="empty-state">No income or expense data for {MONTH_NAMES[month - 1]} {year}.</div>
          )}
        </>
      )}

      {viewMode === 'quarterly' && (
        <>
          {quarterlyQuery.isLoading && <div className="loading">Loading summary…</div>}
          {quarterlyQuery.error && <div className="error-banner">Failed to load summary.</div>}
          {quarterlyQuery.data && (
            <div>
              <div className="summary-cards">
                <div className="summary-card income">
                  <div className="card-label">Q{quarter} Total Income</div>
                  <div className="card-value">{formatCurrency(quarterlyQuery.data.totalIncome)}</div>
                </div>
                <div className="summary-card expenses">
                  <div className="card-label">Q{quarter} Total Expenses</div>
                  <div className="card-value">{formatCurrency(quarterlyQuery.data.totalExpenses)}</div>
                </div>
                <div className={`summary-card ${quarterlyQuery.data.netSurplusDeficit >= 0 ? 'surplus' : 'deficit'}`}>
                  <div className="card-label">Q{quarter} Net {quarterlyQuery.data.netSurplusDeficit >= 0 ? 'Surplus' : 'Deficit'}</div>
                  <div className="card-value">{formatCurrency(quarterlyQuery.data.netSurplusDeficit)}</div>
                </div>
              </div>
              <div className="quarterly-breakdown">
                {quarterlyQuery.data.monthlyBreakdown.map((ms) => (
                  <details key={ms.month} className="month-accordion">
                    <summary>
                      {MONTH_NAMES[ms.month - 1]} {ms.year} — Net: {formatCurrency(ms.netSurplusDeficit)}
                    </summary>
                    {renderMonthlySummary(ms)}
                  </details>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

function getFrequencyLabel(freq: number): string {
  const labels: Record<number, string> = { 0: 'Bi-Monthly', 1: 'Monthly', 2: 'Quarterly', 3: 'Yearly' };
  return labels[freq] ?? 'Unknown';
}

export default SummaryDashboard;
