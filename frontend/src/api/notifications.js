import api from './axios'

export const getNotifications = (params) => api.get('/notifications', { params })
export const getNotification = (id) => api.get(`/notifications/${id}`)
export const getNotificationDashboard = () => api.get('/notifications/dashboard')
export const getUnreadCount = () => api.get('/notifications/unread-count')
export const markRead = (id) => api.put(`/notifications/${id}/read`)
export const markAllRead = () => api.put('/notifications/read-all')
export const deleteNotification = (id) => api.delete(`/notifications/${id}`)
