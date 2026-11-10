import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/layout/Layout';

// Pages
import HomePage from './pages/HomePage';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import ClaimsManagement from './pages/ClaimsManagement';
import ManualProcessing from './pages/ManualProcessing';
import AutomatedProcessing from './pages/AutomatedProcessing';
import SimulationLab from './pages/SimulationLab';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Home Page: Open to all visitors without requiring login */}
          <Route path="/" element={<HomePage />} />

          {/* Public Login Route */}
          <Route path="/login" element={<Login />} />

          {/* Authenticated Application Shell (ClaimFlow Console) */}
          <Route
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/claims" element={<ClaimsManagement />} />
            <Route path="/manual-processing" element={<ManualProcessing />} />
            <Route path="/automated-processing" element={<AutomatedProcessing />} />
            <Route path="/simulation-lab" element={<SimulationLab />} />

            {/* Backward-compatibility and convenience aliases */}
            <Route path="/app" element={<Navigate to="/dashboard" replace />} />
            <Route path="/simulation-config" element={<Navigate to="/simulation-lab" replace />} />
            <Route path="/simulation-results" element={<Navigate to="/simulation-lab" replace />} />
            <Route path="/performance-comparison" element={<Navigate to="/simulation-lab" replace />} />
            <Route path="/roi-analysis" element={<Navigate to="/simulation-lab" replace />} />
            <Route path="/rpa-logs" element={<Navigate to="/automated-processing" replace />} />
            <Route path="/settings" element={<Navigate to="/simulation-lab" replace />} />
          </Route>

          {/* Catch-all redirect to public Home Page */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
