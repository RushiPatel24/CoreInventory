import api from './axiosInstance'
export const getStock = (params) => api.get('/stock', { params })
