import api from './axiosInstance'
export const getTransfers = (params) => api.get('/transfers', { params })
export const getTransfer = (id) => api.get(`/transfers/${id}`)
export const createTransfer = (data) => api.post('/transfers', data)
export const updateTransfer = (id, data) => api.put(`/transfers/${id}`, data)
export const validateTransfer = (id) => api.post(`/transfers/${id}/validate`)
export const cancelTransfer = (id) => api.post(`/transfers/${id}/cancel`)
