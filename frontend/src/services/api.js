import axios from 'axios';

// Create Axios client; in development Vite proxies /api to http://localhost:8080
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL
    || (import.meta.env.PROD ? 'https://claimflow-4.onrender.com' : ''),
  timeout: 20000,
  headers: {
    'Content-Type': 'application/json',
  },
});

const CACHE_TTL_MS = 15000;
const responseCache = new Map();
const inflightRequests = new Map();

const buildCacheKey = (url, params = {}) => {
  const sortedKeys = Object.keys(params || {})
    .filter((k) => params[k] !== undefined && params[k] !== null && params[k] !== '')
    .sort();
  const query = sortedKeys.map((k) => `${k}=${params[k]}`).join('&');
  return `${url}?${query}`;
};

export const invalidateApiCache = (prefix) => {
  if (!prefix) {
    responseCache.clear();
    return;
  }
  for (const key of responseCache.keys()) {
    if (key.startsWith(prefix)) {
      responseCache.delete(key);
    }
  }
};

const cachedGet = (url, { params = {}, cache = true, timeout } = {}) => {
  const key = buildCacheKey(url, params);
  const now = Date.now();

  if (cache) {
    const cached = responseCache.get(key);
    if (cached && now - cached.timestamp < CACHE_TTL_MS) {
      return Promise.resolve(cached.response);
    }
  }

  if (inflightRequests.has(key)) {
    return inflightRequests.get(key);
  }

  const requestPromise = api
    .get(url, { params, ...(timeout ? { timeout } : {}) })
    .then((res) => {
      if (cache) {
        responseCache.set(key, { response: res, timestamp: Date.now() });
      }
      return res;
    })
    .finally(() => {
      inflightRequests.delete(key);
    });

  inflightRequests.set(key, requestPromise);
  return requestPromise;
};

// Dashboard Endpoints
export const dashboardApi = {
  getStats: (options = {}) => cachedGet('/api/dashboard/stats', options),
};

// Claims Endpoints
export const claimApi = {
  getClaims: (params = {}, options = {}) => cachedGet('/api/claims', { params, ...options }),
  getClaimById: (id, options = {}) => cachedGet(`/api/claims/${id}`, options),
  createClaim: (claimData) => api.post('/api/claims', claimData).then((res) => {
    invalidateApiCache();
    return res;
  }),
  deleteClaim: (id) => api.delete(`/api/claims/${id}`).then((res) => {
    invalidateApiCache();
    return res;
  }),
};

// Manual Processing Endpoints
export const manualProcessingApi = {
  progressStage: (stageData) => api.post('/api/manual/progress', stageData).then((res) => {
    invalidateApiCache();
    return res;
  }),
  submitDecision: (decisionData) => api.post('/api/manual/decision', decisionData).then((res) => {
    invalidateApiCache();
    return res;
  }),
  getHistory: (claimId, options = {}) => cachedGet(`/api/manual/history/${claimId}`, options),
};

// RPA Bot Endpoints
export const rpaApi = {
  executeBatch: (batchData = {}) => api.post('/api/rpa/batch', batchData).then((res) => {
    invalidateApiCache();
    return res;
  }),
  executeSingle: (claimId, params = {}) => api.post(`/api/rpa/run/${claimId}`, null, { params }).then((res) => {
    invalidateApiCache();
    return res;
  }),
  processSingle: (claimId, botData = {}) => api.post(`/api/rpa/process/${claimId}`, botData).then((res) => {
    invalidateApiCache();
    return res;
  }),
  getLogs: (params = {}, options = {}) => cachedGet('/api/rpa/logs', { params, ...options }),
  getRecentLogs: (options = {}) => cachedGet('/api/rpa/recent-logs', options),
};

// Simulation Endpoints (Communicates through Spring Boot proxy to Python SimPy service)
export const simulationApi = {
  runSimulation: (config) => api.post('/api/simulation/run', config, { timeout: 45000 }),
  getExperiments: (params = {}) => api.get('/api/simulation/experiments', { params, timeout: 45000 }),
  runExperiments: (params = {}) => api.get('/api/simulation/experiments', { params, timeout: 45000 }),
  getEngineStatus: () => api.get('/api/simulation/engine-status'),
  calculateRoiTrajectory: (params) => api.post('/api/simulation/roi-trajectory', params),
};

// Demo Data Endpoints
export const demoApi = {
  seedDemoData: (params = {}) => api.post('/api/demo/seed', null, { params, timeout: 45000 }).then((res) => {
    invalidateApiCache();
    return res;
  }),
  getStatus: () => api.get('/api/demo/status'),
};

export default api;
