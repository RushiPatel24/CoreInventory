import api from './axiosInstance'
export const getAdjustments = (params) => api.get('/adjustments', { params })
export const getAdjustment = (id) => api.get(`/adjustments/${id}`)
export const createAdjustment = (data) => api.post('/adjustments', data)
export const validateAdjustment = (id) => api.post(`/adjustments/${id}/validate`)
export const cancelAdjustment = (id) => api.post(`/adjustments/${id}/cancel`)
