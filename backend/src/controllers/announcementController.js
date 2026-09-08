import * as announcementService from '../services/announcementService.js';

export const getAnnouncements = async (req, res, next) => {
  try {
    const result = await announcementService.queryAnnouncements({
      userId: req.user?._id,
      userRole: req.user?.role,
      targetAudience: req.query.targetAudience,
      status: req.query.status,
      category: req.query.category,
      priority: req.query.priority,
      search: req.query.search,
      page: req.query.page,
      limit: req.query.limit || 20,
      sortBy: req.query.sortBy || 'publishDate',
      sortOrder: req.query.sortOrder || 'desc',
    });

    res.status(200).json({
      success: true,
      data: result.announcements,
      announcements: result.announcements,
      unreadCount: result.unreadCount,
      pagination: result.pagination,
    });
  } catch (error) {
    next(error);
  }
};

export const getAnnouncementById = async (req, res, next) => {
  try {
    const announcement = await announcementService.getAnnouncementById(
      req.params.id,
      req.user?._id
    );

    res.status(200).json({
      success: true,
      announcement,
    });
  } catch (error) {
    next(error);
  }
};

export const createAnnouncement = async (req, res, next) => {
  try {
    const announcement = await announcementService.createAnnouncement(req.body, req.user);

    res.status(201).json({
      success: true,
      message: 'Announcement published successfully',
      announcement,
    });
  } catch (error) {
    next(error);
  }
};

export const updateAnnouncement = async (req, res, next) => {
  try {
    const announcement = await announcementService.updateAnnouncement(
      req.params.id,
      req.body
    );

    res.status(200).json({
      success: true,
      message: 'Announcement updated successfully',
      announcement,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteAnnouncement = async (req, res, next) => {
  try {
    const result = await announcementService.deleteAnnouncement(req.params.id);
    res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    next(error);
  }
};

export const markAnnouncementAsRead = async (req, res, next) => {
  try {
    const result = await announcementService.markAsRead(req.params.id, req.user?._id);
    res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    next(error);
  }
};

export const markAllAnnouncementsAsRead = async (req, res, next) => {
  try {
    const result = await announcementService.markAllAsRead(
      req.user?._id,
      req.user?.role
    );
    res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    next(error);
  }
};
