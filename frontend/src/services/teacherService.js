import api from './api';

export const getTeachers = async (params = {}) => {
  const response = await api.get('/teachers', { params });
  return response.data;
};

export const getTeacherById = async (id) => {
  const response = await api.get(`/teachers/${id}`);
  return response.data;
};

export const createTeacher = async (data) => {
  const response = await api.post('/teachers', data);
  return response.data;
};

export const updateTeacher = async (id, data) => {
  const response = await api.put(`/teachers/${id}`, data);
  return response.data;
};

export const deleteTeacher = async (id) => {
  const response = await api.delete(`/teachers/${id}`);
  return response.data;
};