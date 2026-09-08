import Announcement from '../models/Announcement.js';

export const queryAnnouncements = async ({
  userId = null,
  userRole = '',
  targetRole = '',
  targetAudience = '',
  status = '',
  category = '',
  priority = '',
  search = '',
  page = 1,
  limit = 20,
  sortBy = 'createdAt',
  sortOrder = 'desc',
}) => {
  const query = {};
  const now = new Date();

  const effectiveRole = userRole || (targetRole === 'STUDENT' ? 'STUDENT' : targetRole === 'TEACHER' ? 'TEACHER' : '');

  if (effectiveRole === 'STUDENT') {
    query.status = 'Published';
    query.publishDate = { $lte: now };
    query.targetAudience = { $in: ['Everyone', 'Students'] };
  } else if (effectiveRole === 'TEACHER') {
    query.status = 'Published';
    query.publishDate = { $lte: now };
    query.targetAudience = { $in: ['Everyone', 'Teachers'] };
  } else if (effectiveRole === 'ADMIN') {
    if (status && status !== 'All Statuses' && status !== 'All') {
      query.status = status;
    }
    if (targetAudience && targetAudience !== 'All') {
      query.targetAudience = targetAudience;
    }
  }

  if (category && category !== 'All Categories' && category !== 'All') {
    query.category = category;
  }

  if (priority && priority !== 'All Priorities' && priority !== 'All') {
    query.priority = priority;
  }

  if (search) {
    const searchRegex = new RegExp(search.trim(), 'i');
    query.$or = [
      { title: searchRegex },
      { description: searchRegex },
      { content: searchRegex },
      { authorName: searchRegex },
    ];
  }

  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.max(1, parseInt(limit, 10) || 20);
  const skip = (pageNum - 1) * limitNum;
  const sortDirection = sortOrder === 'asc' ? 1 : -1;

  const [rawAnnouncements, total] = await Promise.all([
    Announcement.find(query)
      .sort({ [sortBy]: sortDirection })
      .skip(skip)
      .limit(limitNum),
    Announcement.countDocuments(query),
  ]);

  const announcements = rawAnnouncements.map((ann) => {
    const obj = ann.toObject();
    const isRead = userId ? (ann.readBy || []).some((id) => id.toString() === userId.toString()) : false;
    return {
      ...obj,
      isRead,
      readCount: (ann.readBy || []).length,
    };
  });

  let unreadCount = 0;
  if (userId) {
    const unreadQuery = { ...query, readBy: { $ne: userId } };
    unreadCount = await Announcement.countDocuments(unreadQuery);
  }

  announcements.announcements = announcements;
  announcements.data = announcements;
  announcements.unreadCount = unreadCount;
  announcements.pagination = {
    total,
    page: pageNum,
    limit: limitNum,
    totalPages: Math.ceil(total / limitNum) || 1,
  };

  return announcements;
};

export const getAnnouncementById = async (id, userId = null) => {
  const ann = await Announcement.findById(id);
  if (!ann) {
    const error = new Error('Announcement not found');
    error.statusCode = 404;
    throw error;
  }

  const obj = ann.toObject();
  const isRead = userId ? (ann.readBy || []).some((id) => id.toString() === userId.toString()) : false;

  return {
    ...obj,
    isRead,
    readCount: (ann.readBy || []).length,
  };
};

export const createAnnouncement = async (data, user = null) => {
  const title = (data.title || '').trim();
  const description = (data.description || data.content || '').trim();

  if (!title || !description) {
    const error = new Error('Title and description are required');
    error.statusCode = 400;
    throw error;
  }

  let audience = data.targetAudience || data.targetRole || 'Everyone';
  if (audience === 'ALL') audience = 'Everyone';
  if (audience === 'STUDENT') audience = 'Students';
  if (audience === 'TEACHER') audience = 'Teachers';

  const announcement = await Announcement.create({
    title,
    description,
    content: description,
    targetAudience: audience,
    targetRole: audience === 'Students' ? 'STUDENT' : audience === 'Teachers' ? 'TEACHER' : 'ALL',
    priority: data.priority || 'Normal',
    status: data.status || 'Published',
    publishDate: data.publishDate ? new Date(data.publishDate) : new Date(),
    expiryDate: data.expiryDate ? new Date(data.expiryDate) : null,
    expiresAt: data.expiryDate ? new Date(data.expiryDate) : null,
    category: data.category || 'General',
    author: user?._id || data.author,
    authorName: user?.name || data.authorName || 'Administration',
    readBy: user?._id ? [user._id] : [],
  });

  return announcement;
};

export const updateAnnouncement = async (id, data) => {
  const ann = await Announcement.findById(id);
  if (!ann) {
    const error = new Error('Announcement not found');
    error.statusCode = 404;
    throw error;
  }

  if (data.title) ann.title = data.title.trim();
  if (data.description || data.content) {
    const desc = (data.description || data.content).trim();
    ann.description = desc;
    ann.content = desc;
  }
  if (data.targetAudience) {
    let aud = data.targetAudience;
    if (aud === 'ALL') aud = 'Everyone';
    if (aud === 'STUDENT') aud = 'Students';
    if (aud === 'TEACHER') aud = 'Teachers';
    ann.targetAudience = aud;
    ann.targetRole = aud === 'Students' ? 'STUDENT' : aud === 'Teachers' ? 'TEACHER' : 'ALL';
  }
  if (data.priority) ann.priority = data.priority;
  if (data.status) ann.status = data.status;
  if (data.publishDate) ann.publishDate = new Date(data.publishDate);
  if (data.expiryDate !== undefined) {
    ann.expiryDate = data.expiryDate ? new Date(data.expiryDate) : null;
    ann.expiresAt = ann.expiryDate;
  }
  if (data.category) ann.category = data.category;

  await ann.save();
  return ann;
};

export const deleteAnnouncement = async (id) => {
  const ann = await Announcement.findByIdAndDelete(id);
  if (!ann) {
    const error = new Error('Announcement not found');
    error.statusCode = 404;
    throw error;
  }
  return { message: 'Announcement deleted successfully' };
};

export const markAsRead = async (id, userId) => {
  if (!userId) return null;
  const ann = await Announcement.findByIdAndUpdate(
    id,
    { $addToSet: { readBy: userId } },
    { new: true }
  );
  if (!ann) {
    const error = new Error('Announcement not found');
    error.statusCode = 404;
    throw error;
  }
  return { success: true, message: 'Marked as read', isRead: true };
};

export const markAllAsRead = async (userId, userRole) => {
  if (!userId) return null;
  const now = new Date();

  const query = { status: 'Published', publishDate: { $lte: now } };
  if (userRole === 'STUDENT') {
    query.targetAudience = { $in: ['Everyone', 'Students'] };
  } else if (userRole === 'TEACHER') {
    query.targetAudience = { $in: ['Everyone', 'Teachers'] };
  }

  await Announcement.updateMany(query, { $addToSet: { readBy: userId } });
  return { success: true, message: 'All announcements marked as read' };
};