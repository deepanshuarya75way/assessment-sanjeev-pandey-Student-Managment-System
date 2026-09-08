import api from './api';

export const globalSearch = async (query) => {
  if (!query || query.trim().length < 2) {
    return { results: { students: [], teachers: [], courses: [], subjects: [] }, totalMatches: 0 };
  }
  const response = await api.get('/search', { params: { q: query.trim() } });
  return response.data;
};
