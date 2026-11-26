import React, { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/layout/Layout';

const HomePage = lazy(() => import('./pages/HomePage'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const ClaimsManagement = lazy(() => import('./pages/ClaimsManagement'));
const ManualProcessing = lazy(() => import('./pages/ManualProcessing'));
const AutomatedProcessing = lazy(() => import('./pages/AutomatedProcessing'));
const SimulationLab = lazy(() => import('./pages/SimulationLab'));

function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={
        <div className="min-h-screen grid place-items-center bg-[#F7F8F6]">
          <div className="flex flex-col items-center space-y-3">
            <div className="w-8 h-8 border-3 border-teal-600 border-t-transparent rounded-full animate-spin" />
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Loading ClaimFlow…</span>
          </div>
        </div>
      }>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route element={<Layout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/claims" element={<ClaimsManagement />} />
            <Route path="/manual-processing" element={<ManualProcessing />} />
            <Route path="/automated-processing" element={<AutomatedProcessing />} />
            <Route path="/simulation-lab" element={<SimulationLab />} />
            <Route path="/app" element={<Navigate to="/dashboard" replace />} />
            <Route path="/login" element={<Navigate to="/dashboard" replace />} />
            <Route path="/signup" element={<Navigate to="/dashboard" replace />} />
            <Route path="/simulation-config" element={<Navigate to="/simulation-lab" replace />} />
            <Route path="/simulation-results" element={<Navigate to="/simulation-lab" replace />} />
            <Route path="/performance-comparison" element={<Navigate to="/simulation-lab" replace />} />
            <Route path="/roi-analysis" element={<Navigate to="/simulation-lab" replace />} />
            <Route path="/rpa-logs" element={<Navigate to="/automated-processing" replace />} />
            <Route path="/settings" element={<Navigate to="/simulation-lab" replace />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;