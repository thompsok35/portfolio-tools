import { format, addMonths, subMonths } from 'date-fns';
import { ChevronLeft, ChevronRight, LogOut } from 'lucide-react';
import { useState } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { MonthlySummaryDashboard } from './components/MonthlySummaryDashboard';
import { IncomeSourceForm } from './components/IncomeSourceForm';
import { ExpectedIncomeSchedule } from './components/ExpectedIncomeSchedule';
import { useAuth } from './contexts/AuthContext';
import { Login } from './components/Login';
import { PlanSelector } from './components/PlanSelector';
import { ExpenseForm } from './components/ExpenseForm';
import { ExpenseSchedule } from './components/ExpenseSchedule';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

function Dashboard() {
  const { logout, email } = useAuth();
  const [currentDate, setCurrentDate] = useState(new Date());

  const handlePreviousMonth = () => setCurrentDate(subMonths(currentDate, 1));
  const handleNextMonth = () => setCurrentDate(addMonths(currentDate, 1));

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth() + 1; // 1-indexed for backend

  return (
    <div className="min-h-screen bg-color-background p-4 md:p-8">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <header className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-color-text-main flex items-center gap-3">
              Income & Expense Planner
            </h1>
            <p className="text-color-text-muted mt-1">Track expected income against foundational expenses.</p>
          </div>

          <div className="flex items-center gap-6">
            <PlanSelector />

            <div className="flex items-center gap-4 bg-color-surface px-4 py-2 rounded-lg shadow-sm border border-slate-200">
              <button onClick={handlePreviousMonth} className="p-1 hover:bg-slate-100 rounded-full transition-colors">
                <ChevronLeft className="h-5 w-5 text-color-text-main" />
              </button>
              <span className="font-semibold text-lg min-w-[140px] text-center">
                {format(currentDate, 'MMMM yyyy')}
              </span>
              <button onClick={handleNextMonth} className="p-1 hover:bg-slate-100 rounded-full transition-colors">
                <ChevronRight className="h-5 w-5 text-color-text-main" />
              </button>
            </div>

            <div className="flex items-center gap-3 border-l pl-6 border-slate-200">
              <span className="text-sm font-medium text-color-text-muted hidden md:block">{email}</span>
              <button
                onClick={logout}
                className="p-2 text-color-text-muted hover:text-color-danger hover:bg-red-50 rounded-full transition-colors"
                title="Sign out"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          </div>
        </header>

        {/* Dashboard Widgets */}
        <MonthlySummaryDashboard year={year} month={month} />

        {/* Action Area */}
        <div className="mb-8 flex gap-4">
          <IncomeSourceForm />
          <ExpenseForm />
        </div>

        {/* The Planner View */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <ExpectedIncomeSchedule year={year} month={month} />
          <ExpenseSchedule />
        </div>

      </div>
    </div>
  );
}

function App() {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      <Route
        path="/login"
        element={isAuthenticated ? <Navigate to="/" replace /> : <Login />}
      />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default App;
