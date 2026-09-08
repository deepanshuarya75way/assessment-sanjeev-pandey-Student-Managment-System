import Teacher from '../models/Teacher.js';

export const queryTeachers = async ({
  search = '',
  department = '',
  status = '',
  page = 1,
  limit = 10,
  sortBy = 'createdAt',
  sortOrder = 'desc',
}) => {
  const query = {};

  if (search) {
    const searchRegex = new RegExp(search.trim(), 'i');
    query.$or = [
      { firstName: searchRegex },
      { lastName: searchRegex },
      { teacherId: searchRegex },
      { email: searchRegex },
      { phone: searchRegex },
      { specialization: searchRegex },
    ];
  }

  if (department) query.department = department;
  if (status) query.status = status;

  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.max(1, parseInt(limit, 10) || 10);
  const skip = (pageNum - 1) * limitNum;
  const sortDirection = sortOrder === 'asc' ? 1 : -1;

  const [teachers, total] = await Promise.all([
    Teacher.find(query).sort({ [sortBy]: sortDirection }).skip(skip).limit(limitNum),
    Teacher.countDocuments(query),
  ]);

  return {
    teachers,
    pagination: {
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum) || 1,
    },
  };
};

export const getTeacherById = async (id) => {
  let teacher;
  if (id.match(/^[0-9a-fA-F]{24}$/)) {
    teacher = await Teacher.findById(id);
  } else {
    teacher = await Teacher.findOne({ teacherId: id.toUpperCase() });
  }

  if (!teacher) {
    const error = new Error('Teacher not found');
    error.statusCode = 404;
    throw error;
  }
  return teacher;
};

export const createTeacher = async (data) => {
  const existingId = await Teacher.findOne({ teacherId: data.teacherId.trim().toUpperCase() });
  if (existingId) {
    const error = new Error(`Teacher with ID '${data.teacherId}' already exists`);
    error.statusCode = 400;
    throw error;
  }

  const existingEmail = await Teacher.findOne({ email: data.email.trim().toLowerCase() });
  if (existingEmail) {
    const error = new Error(`Teacher with email '${data.email}' already exists`);
    error.statusCode = 400;
    throw error;
  }

  return await Teacher.create({
    ...data,
    teacherId: data.teacherId.trim().toUpperCase(),
    email: data.email.trim().toLowerCase(),
  });
};

export const updateTeacher = async (id, updateData) => {
  const teacher = await getTeacherById(id);

  if (updateData.teacherId && updateData.teacherId.trim().toUpperCase() !== teacher.teacherId) {
    const conflict = await Teacher.findOne({
      teacherId: updateData.teacherId.trim().toUpperCase(),
      _id: { $ne: teacher._id },
    });
    if (conflict) {
      const error = new Error(`Teacher ID '${updateData.teacherId}' is already in use`);
      error.statusCode = 400;
      throw error;
    }
    updateData.teacherId = updateData.teacherId.trim().toUpperCase();
  }

  if (updateData.email && updateData.email.trim().toLowerCase() !== teacher.email) {
    const conflict = await Teacher.findOne({
      email: updateData.email.trim().toLowerCase(),
      _id: { $ne: teacher._id },
    });
    if (conflict) {
      const error = new Error(`Email '${updateData.email}' is already in use by another teacher`);
      error.statusCode = 400;
      throw error;
    }
    updateData.email = updateData.email.trim().toLowerCase();
  }

  Object.assign(teacher, updateData);
  await teacher.save();
  return teacher;
};

export const deleteTeacher = async (id) => {
  const teacher = await getTeacherById(id);
  await Teacher.findByIdAndDelete(teacher._id);
  return { message: `Teacher '${teacher.firstName} ${teacher.lastName}' successfully deleted` };
};