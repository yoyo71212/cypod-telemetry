// cypod-telemetry

import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:3000',
    timeout: 5000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// note: add authentication header if logged in
api.interceptors.request.use((config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// note: authentication
export const registerUser = (userData) => api.post('/auth/register', userData);
export const loginUser = (credentials) => api.post('/auth/login', credentials);

// note: devices & telemetry
export const getDevices = () => api.get('/devices');
export const registerDevice = (deviceData) => api.post('/devices', deviceData);
export const addTelemetry = (deviceId, telemetryData) => api.post(`/devices/${deviceId}/telemetry`, telemetryData);
export const getLatestDeviceTelemetry = (deviceId) => api.get(`/devices/${deviceId}/latest`);
export const getDeviceHistory = (deviceId, from, to, page, pageSize) => {
    const params = new URLSearchParams();
    if (from) params.append('from', from);
    if (to) params.append('to', to);
    if (page) params.append('page', page);
    if (pageSize) params.append('pageSize', pageSize);

    return api.get(`/devices/${deviceId}/history?${params.toString()}`);
};

// note: alerts
export const getAlerts = () => api.get('/alerts');