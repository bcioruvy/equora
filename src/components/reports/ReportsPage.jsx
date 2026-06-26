import { useState } from 'react';
import { CalendarRange, TrendingUp, TrendingDown, PiggyBank, Target, FileBarChart } from 'lucide-react';
import { PageShell } from '../layout/PageShell';
import { Card, CardHeader } from '../ui/Card';
import { ReportCard } from './ReportCard';
import { EmptyState } from '../ui/Misc';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../ui/Toast';
import {
  buildMonthlySummaryReport,
  buildIncomeReport,
  buildExpenseReport,
  buildBudgetReport,
  buildSavingsReport,
  exportRowsToCSV,
  exportRowsToExcel,
  exportReportToPDF,
} from '../../lib/exporters';
import './ReportsPage.css';

export function ReportsPage() {
  const { transactions, accounts, activeBudgets, goals, monthsTrend } = useData();
  const { profile } = useAuth();
  const { showToast } = useToast();
  const currency = profile?.currency || 'USD';

  const [activeReport, setActiveReport] = useState('monthly');

  const reportBuilders = {
    monthly: () => buildMonthlySummaryReport(monthsTrend, currency),
    income: () => buildIncomeReport(transactions, accounts, currency),
    expense: () => buildExpenseReport(transactions, accounts, currency),
    budget: () => buildBudgetReport(activeBudgets, currency),
    savings: () => buildSavingsReport(goals, currency),
  };

  const reports = [
    { id: 'monthly', icon: <CalendarRange size={18} />, title: 'Monthly Summary', description: 'Income, expenses, and net savings for each of the last 6 months.' },
    { id: 'income', icon: <TrendingUp size={18} />, title: 'Income Report', description: 'Every income transaction, broken down by category and account.' },
    { id: 'expense', icon: <TrendingDown size={18} />, title: 'Expense Report', description: 'Every expense transaction, broken down by category and account.' },
    { id: 'budget', icon: <PiggyBank size={18} />, title: 'Budget Report', description: 'How each of your budgets is tracking against its limit this period.' },
    { id: 'savings', icon: <Target size={18} />, title: 'Savings Report', description: 'Progress on every savings goal, including deadlines and completion percentage.' },
  ];

  function handleExport(reportId, format) {
    const { heading, columns, rows } = reportBuilders[reportId]();
    if (rows.length === 0) {
      showToast('Nothing to export for this report yet.', { tone: 'info' });
      return;
    }
    const filenameBase = `equora-${reportId}-report`;
    if (format === 'csv') exportRowsToCSV(columns, rows, `${filenameBase}.csv`);
    if (format === 'excel') exportRowsToExcel(columns, rows, heading, `${filenameBase}.xlsx`);
    if (format === 'pdf') exportReportToPDF({ title: heading, sections: [{ heading, columns, rows }] }, `${filenameBase}.pdf`);
    showToast('Report ready — check your downloads', { tone: 'success' });
  }

  const preview = reportBuilders[activeReport]();

  return (
    <PageShell title="Reports" subtitle="Generate and export professional financial reports.">
      <div className="eq-grid eq-grid--reports">
        {reports.map((r) => (
          <div key={r.id} onClick={() => setActiveReport(r.id)} className={activeReport === r.id ? 'eq-report-selected' : ''}>
            <ReportCard
              icon={r.icon}
              title={r.title}
              description={r.description}
              onExportCSV={() => handleExport(r.id, 'csv')}
              onExportExcel={() => handleExport(r.id, 'excel')}
              onExportPDF={() => handleExport(r.id, 'pdf')}
            />
          </div>
        ))}
      </div>

      <Card style={{ marginTop: 24 }}>
        <CardHeader title={`Preview — ${reports.find((r) => r.id === activeReport)?.title}`} icon={<FileBarChart size={16} />} />
        {preview.rows.length === 0 ? (
          <EmptyState icon={<FileBarChart size={28} />} title="No data yet" description="Once you have data for this report, it will appear here." />
        ) : (
          <div className="eq-report-table-wrap">
            <table className="eq-report-table">
              <thead>
                <tr>
                  {preview.columns.map((c) => <th key={c}>{c}</th>)}
                </tr>
              </thead>
              <tbody>
                {preview.rows.slice(0, 12).map((row, idx) => (
                  <tr key={idx}>
                    {row.map((cell, cidx) => <td key={cidx} className={cidx > 1 && cidx < row.length - 1 ? 'mono-num' : ''}>{cell}</td>)}
                  </tr>
                ))}
              </tbody>
            </table>
            {preview.rows.length > 12 && (
              <p className="eq-report-table__more">+ {preview.rows.length - 12} more rows — export to see the full report.</p>
            )}
          </div>
        )}
      </Card>
    </PageShell>
  );
}
