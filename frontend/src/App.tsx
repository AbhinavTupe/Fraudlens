import { BrowserRouter, Navigate, Outlet, Route, Routes } from 'react-router-dom';
import { LoginPage } from './components/auth/LoginPage';
import { WorkspaceShell } from './components/shell/WorkspaceShell';
import { getStoredToken } from './lib/auth';
import { OperationsDashboard } from './pages/OperationsDashboard';
import { TransactionWorkspace } from './pages/TransactionWorkspace';
import { ReviewQueue } from './pages/ReviewQueue';
import { EvaluationHistory } from './pages/EvaluationHistory';
import { DecisionIntelligence } from './pages/DecisionIntelligence';
import { BusinessAnalytics } from './pages/BusinessAnalytics';
import { ReportsCenter } from './pages/ReportsCenter';
import { Administration } from './pages/Administration';
import { ProfileSettings } from './pages/ProfileSettings';
import { InvestigationsListPage } from './pages/InvestigationsList';
import { InvestigationDetailPage } from './pages/InvestigationDetailPage';

function ProtectedLayout() {
  const token = getStoredToken();
  return token ? <Outlet /> : <Navigate to="/login" replace />;
}

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route element={<ProtectedLayout />}>
          <Route element={<WorkspaceShell />}>
            <Route path="/" element={<OperationsDashboard />} />
            <Route path="/transactions" element={<TransactionWorkspace />} />
            <Route path="/investigations" element={<InvestigationsListPage />} />
            <Route path="/investigations/:caseId" element={<InvestigationDetailPage />} />
            <Route path="/review-queue" element={<ReviewQueue />} />
            <Route path="/evaluation-history" element={<EvaluationHistory />} />
            <Route path="/decision-intelligence" element={<DecisionIntelligence />} />
            <Route path="/analytics" element={<BusinessAnalytics />} />
            <Route path="/reports" element={<ReportsCenter />} />
            <Route path="/administration" element={<Administration />} />
            <Route path="/settings" element={<ProfileSettings />} />
          </Route>
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>);

}