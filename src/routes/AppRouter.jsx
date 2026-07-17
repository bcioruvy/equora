import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthPage } from '../components/auth/AuthPage';
import { AppLayout } from '../components/layout/AppLayout';
import { ProtectedRoute, PublicOnlyRoute } from './ProtectedRoute';
import { DashboardPage } from '../components/dashboard/DashboardPage';
import { TransactionsPage } from '../components/transactions/TransactionsPage';
import { AnalyticsPage } from '../components/analytics/AnalyticsPage';
import { BudgetsPage } from '../components/budgets/BudgetsPage';
import { GoalsPage } from '../components/goals/GoalsPage';
import { ReportsPage } from '../components/reports/ReportsPage';
import { SettingsPage } from '../components/settings/SettingsPage';
import { DataProvider, useData } from '../context/DataContext';
import { useFinancialAutomation } from '../hooks/useFinancialAutomation';
import { PageSpinner } from '../components/ui/Misc';

function AppRoot() {
  return (
    <DataProvider>
      <AppGate />
    </DataProvider>
  );
}

function AppGate() {
  const { loading } = useData();

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
        <PageSpinner label="Loading your data…" />
      </div>
    );
  }

  return (
    <>
      <AutomationRunner />
      <AppLayout />
    </>
  );
}

function AutomationRunner() {
  useFinancialAutomation();
  return null;
}

export function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/app/dashboard" replace />} />
      <Route
        path="/auth"
        element={
          <PublicOnlyRoute>
            <AuthPage />
          </PublicOnlyRoute>
        }
      />
      <Route
        path="/app"
        element={
          <ProtectedRoute>
            <AppRoot />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="transactions" element={<TransactionsPage />} />
        <Route path="analytics" element={<AnalyticsPage />} />
        <Route path="budgets" element={<BudgetsPage />} />
        <Route path="goals" element={<GoalsPage />} />
        <Route path="reports" element={<ReportsPage />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

function NotFoundPage() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', gap: 12, padding: 24, textAlign: 'center' }}>
      <h1 style={{ fontSize: 28, fontWeight: 800, color: 'var(--text-primary)' }}>Page not found</h1>
      <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>The page you're looking for doesn't exist.</p>
      <a href="/app/dashboard" style={{ color: 'var(--brand-emerald)', fontWeight: 600, fontSize: 14 }}>Back to Dashboard</a>
    </div>
  );
}
