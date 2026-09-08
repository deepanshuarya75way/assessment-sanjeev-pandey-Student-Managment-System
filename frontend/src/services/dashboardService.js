import api from './api';

export const getDashboardStats = async (viewAs = '') => {
  const url = viewAs ? `/dashboard/stats?viewAs=${viewAs}` : '/dashboard/stats';
  const response = await api.get(url);
  return response.data;
};
