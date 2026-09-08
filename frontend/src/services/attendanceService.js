import api from './api';

export const markAttendance = async (payload) => {
  const response = await api.post('/attendance', payload);
  return response.data;
};

export const getAttendance = async (params = {}) => {
  const response = await api.get('/attendance', { params });
  return response.data;
};

export const getMyAttendance = async () => {
  const response = await api.get('/attendance/my-attendance');
  return response.data;
};

export const getAttendanceStats = async (params = {}) => {
  const response = await api.get('/attendance/stats', { params });
  return response.data;
};

export const getEnrolledStudents = async (params = {}) => {
  const queryParams = typeof params === 'string' ? { courseId: params } : params;
  const response = await api.get('/attendance/enrolled-students', {
    params: queryParams,
  });
  return response.data;
};