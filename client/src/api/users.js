import api from './axiosInstance'
export const getMe = () => api.get('/users/me')
export const updateMe = (data) => api.patch('/users/me', data)
export const changePassword = (data) => api.patch('/users/me/change-password', data)
export const getReorderRules = (params) => api.get('/reorder-rules', { params })
export const upsertReorderRule = (data) => api.post('/reorder-rules', data)
export const deleteReorderRule = (id) => api.delete(`/reorder-rules/${id}`)
