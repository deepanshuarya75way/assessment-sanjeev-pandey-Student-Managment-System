import api from './api';

export const saveMarks = async (marksData) => {
  const response = await api.post('/marks', marksData);
  return response.data;
};

export const getMarks = async (params = {}) => {
  const response = await api.get('/marks', { params });
  return response.data;
};

export const getStudentResult = async (studentId, semester) => {
  const response = await api.get(`/marks/student-result/${studentId}`, {
    params: { semester },
  });
  return response.data;
};

export const getMyResults = async (semester) => {
  const response = await api.get('/marks/my-results', {
    params: { semester },
  });
  return response.data;
};