import Course from '../models/Course.js';

export const queryCourses = async ({
  search = '',
  department = '',
  status = '',
  sortBy = 'courseName',
  sortOrder = 'asc',
  page = 1,
  limit = 10,
}) => {
  const query = {};

  if (search) {
    const searchRegex = new RegExp(search.trim(), 'i');
    query.$or = [
      { courseCode: searchRegex },
      { courseName: searchRegex },
      { department: searchRegex },
    ];
  }

  if (department) query.department = department;
  if (status) query.status = status;

  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.max(1, parseInt(limit, 10) || 10);
  const skip = (pageNum - 1) * limitNum;
  const sortDirection = sortOrder === 'desc' ? -1 : 1;

  const [courses, total] = await Promise.all([
    Course.find(query)
      .populate('subjects', 'subjectCode subjectName credits semester')
      .populate('assignedTeachers', 'teacherId firstName lastName email department')
      .sort({ [sortBy]: sortDirection })
      .skip(skip)
      .limit(limitNum),
    Course.countDocuments(query),
  ]);

  return {
    courses,
    pagination: {
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum) || 1,
    },
  };
};

export const getCourseById = async (id) => {
  let course;
  if (id.match(/^[0-9a-fA-F]{24}$/)) {
    course = await Course.findById(id)
      .populate('subjects')
      .populate('assignedTeachers', 'teacherId firstName lastName email department');
  } else {
    course = await Course.findOne({ courseCode: id.toUpperCase() })
      .populate('subjects')
      .populate('assignedTeachers', 'teacherId firstName lastName email department');
  }

  if (!course) {
    const error = new Error('Course not found');
    error.statusCode = 404;
    throw error;
  }
  return course;
};

export const createCourse = async (data) => {
  const existing = await Course.findOne({ courseCode: data.courseCode.trim().toUpperCase() });
  if (existing) {
    const error = new Error(`Course with code '${data.courseCode}' already exists`);
    error.statusCode = 400;
    throw error;
  }

  return await Course.create({
    ...data,
    courseCode: data.courseCode.trim().toUpperCase(),
  });
};

export const updateCourse = async (id, updateData) => {
  const course = await getCourseById(id);

  if (updateData.courseCode && updateData.courseCode.trim().toUpperCase() !== course.courseCode) {
    const conflict = await Course.findOne({
      courseCode: updateData.courseCode.trim().toUpperCase(),
      _id: { $ne: course._id },
    });
    if (conflict) {
      const error = new Error(`Course code '${updateData.courseCode}' is already in use`);
      error.statusCode = 400;
      throw error;
    }
    updateData.courseCode = updateData.courseCode.trim().toUpperCase();
  }

  Object.assign(course, updateData);
  await course.save();
  return course;
};

export const deleteCourse = async (id) => {
  const course = await getCourseById(id);
  await Course.findByIdAndDelete(course._id);
  return { message: `Course '${course.courseName}' (${course.courseCode}) successfully deleted` };
};