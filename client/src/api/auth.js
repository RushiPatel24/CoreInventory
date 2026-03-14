import api from './axiosInstance'

export const login = (data) => api.post('/auth/login', data)
export const signup = (data) => api.post('/auth/signup', data)
export const forgotPassword = (data) => api.post('/auth/forgot-password', data)
export const verifyOTP = (data) => api.post('/auth/verify-otp', data)
export const resetPassword = (data) => api.post('/auth/reset-password', data)
