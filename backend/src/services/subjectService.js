import Subject from '../models/Subject.js';
import Course from '../models/Course.js';

export const querySubjects = async ({
  search = '',
  department = '',
  course = '',
  teacher = '',
  semester = '',
  status = '',
  sortBy = 'subjectCode',
  sortOrder = 'asc',
  page = 1,
  limit = 20,
}) => {
  const query = {};

  if (search) {
    const searchRegex = new RegExp(search.trim(), 'i');
    query.$or = [
      { subjectCode: searchRegex },
      { subjectName: searchRegex },
      { department: searchRegex },
    ];
  }

  if (department) query.department = department;
  if (course) query.course = course;
  if (teacher) query.teacher = teacher;
  if (semester) query.semester = Number(semester);
  if (status) query.status = status;

  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.max(1, parseInt(limit, 10) || 20);
  const skip = (pageNum - 1) * limitNum;
  const sortDirection = sortOrder === 'desc' ? -1 : 1;

  const [subjects, total] = await Promise.all([
    Subject.find(query)
      .populate('course', 'courseCode courseName')
      .populate('teacher', 'teacherId firstName lastName email department')
      .sort({ [sortBy]: sortDirection })
      .skip(skip)
      .limit(limitNum),
    Subject.countDocuments(query),
  ]);

  return {
    subjects,
    pagination: {
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum) || 1,
    },
  };
};

export const getSubjectById = async (id) => {
  let subject;
  if (id.match(/^[0-9a-fA-F]{24}$/)) {
    subject = await Subject.findById(id)
      .populate('course', 'courseCode courseName')
      .populate('teacher', 'teacherId firstName lastName email department');
  } else {
    subject = await Subject.findOne({ subjectCode: id.toUpperCase() })
      .populate('course', 'courseCode courseName')
      .populate('teacher', 'teacherId firstName lastName email department');
  }

  if (!subject) {
    const error = new Error('Subject not found');
    error.statusCode = 404;
    throw error;
  }
  return subject;
};

export const createSubject = async (data) => {
  const existing = await Subject.findOne({ subjectCode: data.subjectCode.trim().toUpperCase() });
  if (existing) {
    const error = new Error(`Subject with code '${data.subjectCode}' already exists`);
    error.statusCode = 400;
    throw error;
  }

  const subject = await Subject.create({
    ...data,
    subjectCode: data.subjectCode.trim().toUpperCase(),
  });

  if (subject.course) {
    await Course.findByIdAndUpdate(subject.course, {
      $addToSet: { subjects: subject._id },
    });
  }

  return subject;
};

export const updateSubject = async (id, updateData) => {
  const subject = await getSubjectById(id);

  if (updateData.subjectCode && updateData.subjectCode.trim().toUpperCase() !== subject.subjectCode) {
    const conflict = await Subject.findOne({
      subjectCode: updateData.subjectCode.trim().toUpperCase(),
      _id: { $ne: subject._id },
    });
    if (conflict) {
      const error = new Error(`Subject code '${updateData.subjectCode}' is already in use`);
      error.statusCode = 400;
      throw error;
    }
    updateData.subjectCode = updateData.subjectCode.trim().toUpperCase();
  }

  if (updateData.course && updateData.course !== subject.course?._id?.toString()) {
    if (subject.course) {
      await Course.findByIdAndUpdate(subject.course._id, { $pull: { subjects: subject._id } });
    }
    await Course.findByIdAndUpdate(updateData.course, { $addToSet: { subjects: subject._id } });
  }

  Object.assign(subject, updateData);
  await subject.save();
  return subject;
};

export const deleteSubject = async (id) => {
  const subject = await getSubjectById(id);
  if (subject.course) {
    await Course.findByIdAndUpdate(subject.course._id, { $pull: { subjects: subject._id } });
  }
  await Subject.findByIdAndDelete(subject._id);
  return { message: `Subject '${subject.subjectName}' (${subject.subjectCode}) successfully deleted` };
};