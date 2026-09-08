import api from './api';

export const getAnnouncements = async (params = {}) => {
  const response = await api.get('/announcements', { params });
  return response.data;
};

export const getAnnouncementById = async (id) => {
  const response = await api.get(`/announcements/${id}`);
  return response.data;
};

export const createAnnouncement = async (data) => {
  const response = await api.post('/announcements', data);
  return response.data;
};

export const updateAnnouncement = async (id, data) => {
  const response = await api.put(`/announcements/${id}`, data);
  return response.data;
};

export const deleteAnnouncement = async (id) => {
  const response = await api.delete(`/announcements/${id}`);
  return response.data;
};

export const markAsRead = async (id) => {
  const response = await api.patch(`/announcements/${id}/read`);
  return response.data;
};

export const markAllAsRead = async () => {
  const response = await api.post('/announcements/mark-all-read');
  return response.data;
};

