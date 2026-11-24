import React, { useMemo } from 'react';
import { CssBaseline, ThemeProvider } from '@mui/material';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider, useAuth } from './auth/AuthContext';
import { ProtectedRoute } from './auth/ProtectedRoute';
import { createSkillBridgeTheme } from './theme/skillBridgeTheme';

import { LandingPage } from './pages/shared/LandingPage';
import { LoginPage } from './pages/shared/LoginPage';
import { SignUpPage } from './pages/shared/SignUpPage';
import { ForgotPasswordPage } from './pages/shared/ForgotPasswordPage';

import { EmployeeDashboardPage } from './pages/employee/EmployeeDashboardPage';
import { MySkillsPage } from './pages/employee/MySkillsPage';
import { AssessmentsPage } from './pages/employee/AssessmentsPage';
import { AiLearningPlanPage } from './pages/employee/AiLearningPlanPage';
import { TrainingResourcesPage } from './pages/employee/TrainingResourcesPage';
import { ProgressPage } from './pages/employee/ProgressPage';
import { AiAssistantPage } from './pages/employee/AiAssistantPage';
import { NotificationsPage } from './pages/employee/NotificationsPage';
import { EmployeeSettingsPage } from './pages/employee/EmployeeSettingsPage';

import { ManagerDashboardPage } from './pages/manager/ManagerDashboardPage';
import { CandidateManagementPage } from './pages/manager/CandidateManagementPage';
import { EmployeeAccessManagementPage } from './pages/manager/EmployeeAccessManagementPage';
import { LearningPlanManagementPage } from './pages/manager/LearningPlanManagementPage';
import { TrainingMonitoringPage } from './pages/manager/TrainingMonitoringPage';
import { SkillGapAnalyticsPage } from './pages/manager/SkillGapAnalyticsPage';
import { ManagerProfilePage } from './pages/manager/ManagerProfilePage';
import { ManagerReportsPage } from './pages/manager/ManagerReportsPage';
import { ManagerSettingsPage } from './pages/manager/ManagerSettingsPage';
import { AdminApprovalsPage } from './pages/admin/AdminApprovalsPage';

function ThemedRoutes() {
  const { themeMode } = useAuth();
  const theme = useMemo(() => createSkillBridgeTheme(themeMode), [themeMode]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignUpPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ForgotPasswordPage />} />

          {/* Employee Module */}
          <Route path="/employee/dashboard" element={<ProtectedRoute allowedRoles={['Employee']}><EmployeeDashboardPage /></ProtectedRoute>} />
          <Route path="/employee/skills" element={<ProtectedRoute allowedRoles={['Employee']}><MySkillsPage /></ProtectedRoute>} />
          <Route path="/employee/assessments" element={<ProtectedRoute allowedRoles={['Employee']}><AssessmentsPage /></ProtectedRoute>} />
          <Route path="/employee/learning-plan" element={<ProtectedRoute allowedRoles={['Employee']}><AiLearningPlanPage /></ProtectedRoute>} />
          <Route path="/employee/resources" element={<ProtectedRoute allowedRoles={['Employee']}><TrainingResourcesPage /></ProtectedRoute>} />
          <Route path="/employee/progress" element={<ProtectedRoute allowedRoles={['Employee']}><ProgressPage /></ProtectedRoute>} />
          <Route path="/employee/ai-assistant" element={<ProtectedRoute allowedRoles={['Employee']}><AiAssistantPage /></ProtectedRoute>} />
          <Route path="/employee/notifications" element={<ProtectedRoute allowedRoles={['Employee']}><NotificationsPage /></ProtectedRoute>} />
          <Route path="/employee/settings" element={<ProtectedRoute allowedRoles={['Employee']}><EmployeeSettingsPage /></ProtectedRoute>} />

          {/* Manager & Admin Module */}
          <Route path="/manager/dashboard" element={<ProtectedRoute allowedRoles={['Manager', 'Admin']}><ManagerDashboardPage /></ProtectedRoute>} />
          <Route path="/manager/candidates" element={<ProtectedRoute allowedRoles={['Manager', 'Admin']}><CandidateManagementPage /></ProtectedRoute>} />
          <Route path="/manager/employee-approvals" element={<ProtectedRoute allowedRoles={['Manager', 'Admin']}><EmployeeAccessManagementPage /></ProtectedRoute>} />
          <Route path="/manager/learning-plans" element={<ProtectedRoute allowedRoles={['Manager', 'Admin']}><LearningPlanManagementPage /></ProtectedRoute>} />
          <Route path="/manager/training-monitoring" element={<ProtectedRoute allowedRoles={['Manager', 'Admin']}><TrainingMonitoringPage /></ProtectedRoute>} />
          <Route path="/manager/skill-gap-analytics" element={<ProtectedRoute allowedRoles={['Manager', 'Admin']}><SkillGapAnalyticsPage /></ProtectedRoute>} />
          <Route path="/manager/profile" element={<ProtectedRoute allowedRoles={['Manager', 'Admin']}><ManagerProfilePage /></ProtectedRoute>} />
          <Route path="/manager/reports" element={<ProtectedRoute allowedRoles={['Manager', 'Admin']}><ManagerReportsPage /></ProtectedRoute>} />
          <Route path="/manager/settings" element={<ProtectedRoute allowedRoles={['Manager', 'Admin']}><ManagerSettingsPage /></ProtectedRoute>} />
          <Route path="/admin/approvals" element={<ProtectedRoute allowedRoles={['Admin']}><AdminApprovalsPage /></ProtectedRoute>} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <ThemedRoutes />
    </AuthProvider>
  );
}
