import * as dashboardService from '../services/dashboardService.js';

export const getDashboardStats = async (req, res, next) => {
  try {
    const { role, email } = req.user;
    const viewAs = req.query.viewAs;

    let data;
    const effectiveRole = (role === 'ADMIN' && viewAs) ? viewAs : role;

    if (effectiveRole === 'ADMIN') {
      data = await dashboardService.getAdminDashboardData();
    } else if (effectiveRole === 'TEACHER') {
      data = await dashboardService.getTeacherDashboardData(email);
    } else if (effectiveRole === 'STUDENT') {
      data = await dashboardService.getStudentDashboardData(email);
    } else {
      data = await dashboardService.getAdminDashboardData();
    }

    res.status(200).json({
      success: true,
      role: effectiveRole,
      data,
    });
  } catch (error) {
    next(error);
  }
};
