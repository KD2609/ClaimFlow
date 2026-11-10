import axios from 'axios';

// Create Axios client; in development Vite proxies /api to http://localhost:8080
const api = axios.create({
  baseURL: '',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach token if present
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Auth Endpoints
export const authApi = {
  login: (credentials) => api.post('/api/auth/login', credentials),
};

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
  getLogs: (params = {}) => api.get('/api/rpa/logs', { params }),
  getRecentLogs: () => api.get('/api/rpa/recent-logs'),
};

// Operations Research Simulation Endpoints
export const simulationApi = {
  runSimulation: (config) => api.post('/api/simulation/run', config),
  getExperiments: () => api.get('/api/simulation/experiments'),
  getEngineStatus: () => api.get('/api/simulation/engine-status'),
};

export default api;
