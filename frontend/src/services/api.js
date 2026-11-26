import axios from 'axios';

// Create Axios client; in development Vite proxies /api to http://localhost:8080
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL
    || (import.meta.env.PROD ? 'https://claimflow-4.onrender.com' : ''),
  headers: {
    'Content-Type': 'application/json',
  },
});

// Dashboard Endpoints
export const dashboardApi = {
  getStats: () => api.get('/api/dashboard/stats'),
};

// Claims Endpoints
export const claimApi = {
  getClaims: (params = {}) => api.get('/api/claims', { params }),
  getClaimById: (id) => api.get(`/api/claims/${id}`),
  createClaim: (claimData) => api.post('/api/claims', claimData),
  deleteClaim: (id) => api.delete(`/api/claims/${id}`),
};

// Manual Processing Endpoints
export const manualProcessingApi = {
  progressStage: (stageData) => api.post('/api/manual/progress', stageData),
  submitDecision: (decisionData) => api.post('/api/manual/decision', decisionData),
  getHistory: (claimId) => api.get(`/api/manual/history/${claimId}`),
};

// RPA Bot Endpoints
export const rpaApi = {
  executeBatch: (batchData = {}) => api.post('/api/rpa/batch', batchData),
  executeSingle: (claimId, params = {}) => api.post(`/api/rpa/run/${claimId}`, null, { params }),
  processSingle: (claimId, botData = {}) => api.post(`/api/rpa/process/${claimId}`, botData),
  getLogs: (params = {}) => api.get('/api/rpa/logs', { params }),
  getRecentLogs: () => api.get('/api/rpa/recent-logs'),
};

// Simulation Endpoints (Communicates through Spring Boot proxy to Python SimPy service)
export const simulationApi = {
  runSimulation: (config) => api.post('/api/simulation/run', config),
  getExperiments: (params = {}) => api.get('/api/simulation/experiments', { params }),
  runExperiments: (params = {}) => api.get('/api/simulation/experiments', { params }),
  getEngineStatus: () => api.get('/api/simulation/engine-status'),
  calculateRoiTrajectory: (params) => api.post('/api/simulation/roi-trajectory', params),
};

export default api;
