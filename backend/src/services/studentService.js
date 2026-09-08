import Student from '../models/Student.js';

export const queryStudents = async ({
  search = '',
  department = '',
  course = '',
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
      { studentId: searchRegex },
      { email: searchRegex },
      { phone: searchRegex },
    ];
  }

  if (department) {
    query.department = department;
  }

  if (course) {
    query.course = course;
  }

  if (status) {
    query.status = status;
  }

  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.max(1, parseInt(limit, 10) || 10);
  const skip = (pageNum - 1) * limitNum;

  const sortDirection = sortOrder === 'asc' ? 1 : -1;
  const sort = { [sortBy]: sortDirection };

  const [students, total] = await Promise.all([
    Student.find(query).sort(sort).skip(skip).limit(limitNum),
    Student.countDocuments(query),
  ]);

  return {
    students,
    pagination: {
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum) || 1,
    },
  };
};

export const getStudentById = async (id) => {
  let student;
  if (id.match(/^[0-9a-fA-F]{24}$/)) {
    student = await Student.findById(id);
  } else {
    student = await Student.findOne({ studentId: id.toUpperCase() });
  }

  if (!student) {
    const error = new Error('Student not found');
    error.statusCode = 404;
    throw error;
  }
  return student;
};

export const createStudent = async (data) => {
  const existingId = await Student.findOne({
    studentId: data.studentId.trim().toUpperCase(),
  });
  if (existingId) {
    const error = new Error(`Student with ID '${data.studentId}' already exists`);
    error.statusCode = 400;
    throw error;
  }

  const existingEmail = await Student.findOne({
    email: data.email.trim().toLowerCase(),
  });
  if (existingEmail) {
    const error = new Error(`Student with email '${data.email}' already exists`);
    error.statusCode = 400;
    throw error;
  }

  const student = await Student.create({
    ...data,
    studentId: data.studentId.trim().toUpperCase(),
    email: data.email.trim().toLowerCase(),
  });

  return student;
};

export const updateStudent = async (id, updateData) => {
  const student = await getStudentById(id);

  if (updateData.studentId && updateData.studentId.trim().toUpperCase() !== student.studentId) {
    const conflict = await Student.findOne({
      studentId: updateData.studentId.trim().toUpperCase(),
      _id: { $ne: student._id },
    });
    if (conflict) {
      const error = new Error(`Student ID '${updateData.studentId}' is already in use`);
      error.statusCode = 400;
      throw error;
    }
    updateData.studentId = updateData.studentId.trim().toUpperCase();
  }

  if (updateData.email && updateData.email.trim().toLowerCase() !== student.email) {
    const conflict = await Student.findOne({
      email: updateData.email.trim().toLowerCase(),
      _id: { $ne: student._id },
    });
    if (conflict) {
      const error = new Error(`Email '${updateData.email}' is already in use by another student`);
      error.statusCode = 400;
      throw error;
    }
    updateData.email = updateData.email.trim().toLowerCase();
  }

  Object.assign(student, updateData);
  await student.save();
  return student;
};

export const deleteStudent = async (id) => {
  const student = await getStudentById(id);
  await Student.findByIdAndDelete(student._id);
  return { message: `Student '${student.firstName} ${student.lastName}' (${student.studentId}) successfully deleted` };
};

export const getStudentByEmail = async (email) => {
  if (!email) return null;
  return await Student.findOne({ email: email.trim().toLowerCase() });
};