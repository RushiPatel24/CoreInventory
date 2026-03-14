import api from './axiosInstance'
export const getProducts = (params) => api.get('/products', { params })
export const getProduct = (id) => api.get(`/products/${id}`)
export const createProduct = (data) => api.post('/products', data)
export const updateProduct = (id, data) => api.put(`/products/${id}`, data)
export const archiveProduct = (id) => api.patch(`/products/${id}/archive`)
export const unarchiveProduct = (id) => api.patch(`/products/${id}/unarchive`)
export const deleteProduct = (id) => api.delete(`/products/${id}`)
