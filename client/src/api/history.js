import api from './axiosInstance'
export const getHistory = (params) => api.get('/history', { params })
