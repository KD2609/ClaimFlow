import axios from 'axios';

// Create Axios client; in development Vite proxies /api to http://localhost:8080
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL
    || (import.meta.env.PROD ? 'https://claimflow-4.onrender.com' : ''),
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

// Expired or invalid bearer tokens require the user to authenticate again.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && localStorage.getItem('token')) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      if (window.location.pathname !== '/login') {
        window.location.assign('/login');
      }
    }
    return Promise.reject(error);
  }
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
};

export default api;
