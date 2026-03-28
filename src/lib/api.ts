import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

// Threshold (ms) before we assume the server is cold-starting on Render free tier
const SLOW_REQUEST_THRESHOLD_MS = 4000;

// Track in-flight slow-request timers keyed by request id
let requestCounter = 0;
const slowTimers = new Map<number, ReturnType<typeof setTimeout>>();
let wakeCount = 0; // how many requests are currently "slow"

function emitWake(active: boolean) {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent('server-wake', { detail: { active } }));
}

function startSlowTimer(id: number) {
  const timer = setTimeout(() => {
    slowTimers.delete(id); // remove so clearSlowTimer knows the timer already fired
    wakeCount++;
    if (wakeCount === 1) emitWake(true);
  }, SLOW_REQUEST_THRESHOLD_MS);
  slowTimers.set(id, timer);
}

function clearSlowTimer(id: number) {
  const timer = slowTimers.get(id);
  if (timer !== undefined) {
    clearTimeout(timer);
    slowTimers.delete(id);
  } else {
    // Timer already fired — this request was slow, decrement counter
    wakeCount = Math.max(0, wakeCount - 1);
    if (wakeCount === 0) emitWake(false);
  }
}

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor — attach access token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    // Assign a unique id to track this request
    const id = ++requestCounter;
    (config as typeof config & { _wakeId: number })._wakeId = id;
    startSlowTimer(id);
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor — handle token refresh on 401
api.interceptors.response.use(
  (response) => {
    const id = (response.config as typeof response.config & { _wakeId?: number })._wakeId;
    if (id !== undefined) clearSlowTimer(id);
    return response;
  },
  async (error) => {
    const id = (error.config as (typeof error.config & { _wakeId?: number }) | undefined)?._wakeId;
    if (id !== undefined) clearSlowTimer(id);
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) {
          throw new Error('No refresh token');
        }

        const { data } = await axios.post(`${API_URL}/auth/refresh-token`, {
          refreshToken,
        });

        const { accessToken, refreshToken: newRefreshToken } = data.data;

        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', newRefreshToken);

        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return api(originalRequest);
      } catch {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
        return Promise.reject(error);
      }
    }

    return Promise.reject(error);
  }
);

// ========================
// Wishlist API
// ========================

export const fetchWishlist = () => api.get('/wishlist');
export const toggleWishlistItem = (productId: string) => api.post(`/wishlist/${productId}`);
export const removeWishlistItem = (productId: string) => api.delete(`/wishlist/${productId}`);
export const clearWishlistApi = () => api.delete('/wishlist');
export const checkWishlistStatus = (productId: string) => api.get(`/wishlist/check/${productId}`);

export default api;
