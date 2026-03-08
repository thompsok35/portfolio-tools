import { format, addMonths, subMonths } from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useState } from 'react';
import { MonthlySummaryDashboard } from './components/MonthlySummaryDashboard';
import { IncomeSourceForm } from './components/IncomeSourceForm';
import { ExpectedIncomeSchedule } from './components/ExpectedIncomeSchedule';

function App() {
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
            <h1 className="text-3xl font-bold tracking-tight text-color-text-main">Income & Expense Planner</h1>
            <p className="text-color-text-muted mt-1">Track expected income against foundational expenses.</p>
          </div>

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
        </header>

        {/* Dashboard Widgets */}
        <MonthlySummaryDashboard year={year} month={month} />

        {/* Action Area */}
        <div className="mb-8">
          <IncomeSourceForm />
        </div>

        {/* The Planner View */}
        <div className="mb-8">
          <ExpectedIncomeSchedule year={year} month={month} />
        </div>

      </div>
    </div>
  );
}

export default App;
