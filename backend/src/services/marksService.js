import Marks from '../models/Marks.js';
import Student from '../models/Student.js';
import { calculateGrade } from '../utils/gradeCalculator.js';

export const upsertMarks = async ({
  studentId,
  courseId,
  subjectId,
  teacherId,
  internalMarks,
  externalMarks,
  semester,
  academicYear = '2025-2026',
  remarks = '',
}) => {
  if (!studentId || !courseId || !subjectId || semester === undefined) {
    const error = new Error('Student, Course, Subject, and Semester are required');
    error.statusCode = 400;
    throw error;
  }

  const calc = calculateGrade(internalMarks, externalMarks, 30, 70);

  const filter = {
    student: studentId,
    subject: subjectId,
    semester: Number(semester),
  };

  const update = {
    $set: {
      student: studentId,
      course: courseId,
      subject: subjectId,
      teacher: teacherId || undefined,
      internalMarks: calc.internalMarks,
      externalMarks: calc.externalMarks,
      totalMarks: calc.totalMarks,
      maxInternal: 30,
      maxExternal: 70,
      maxTotal: 100,
      percentage: calc.percentage,
      grade: calc.grade,
      gradePoint: calc.gradePoint,
      isPassed: calc.isPassed,
      semester: Number(semester),
      academicYear,
      remarks,
    },
  };

  const record = await Marks.findOneAndUpdate(filter, update, {
    upsert: true,
    new: true,
    runValidators: true,
  })
    .populate('student', 'studentId firstName lastName email')
    .populate('subject', 'subjectCode subjectName credits')
    .populate('course', 'courseCode courseName');

  return record;
};

export const queryMarks = async ({
  courseId = '',
  subjectId = '',
  studentId = '',
  semester = '',
  grade = '',
  isPassed = '',
  search = '',
  sortBy = 'createdAt',
  sortOrder = 'desc',
  page = 1,
  limit = 20,
}) => {
  const query = {};

  if (courseId) query.course = courseId;
  if (subjectId) query.subject = subjectId;
  if (studentId) query.student = studentId;
  if (semester) query.semester = Number(semester);
  if (grade) query.grade = grade.toUpperCase();
  if (isPassed !== '') {
    query.isPassed = isPassed === 'true' || isPassed === true;
  }

  if (search) {
    const searchRegex = new RegExp(search.trim(), 'i');
    const matchedStudents = await Student.find({
      $or: [
        { firstName: searchRegex },
        { lastName: searchRegex },
        { studentId: searchRegex },
      ],
    }).select('_id');
    const studentIds = matchedStudents.map((s) => s._id);
    query.student = { $in: studentIds };
  }

  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.max(1, parseInt(limit, 10) || 20);
  const skip = (pageNum - 1) * limitNum;
  const sortDirection = sortOrder === 'asc' ? 1 : -1;

  const [marks, total] = await Promise.all([
    Marks.find(query)
      .populate('student', 'studentId firstName lastName email department')
      .populate('course', 'courseCode courseName')
      .populate('subject', 'subjectCode subjectName credits')
      .populate('teacher', 'teacherId firstName lastName')
      .sort({ [sortBy]: sortDirection })
      .skip(skip)
      .limit(limitNum),
    Marks.countDocuments(query),
  ]);

  return {
    marks,
    pagination: {
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum) || 1,
    },
  };
};

export const getStudentSemesterReport = async (studentId, semester = null) => {
  const student = await Student.findById(studentId);
  if (!student) {
    const error = new Error('Student not found');
    error.statusCode = 404;
    throw error;
  }

  const query = { student: studentId };
  if (semester) query.semester = Number(semester);

  const marksList = await Marks.find(query)
    .populate('subject', 'subjectCode subjectName credits')
    .populate('course', 'courseCode courseName')
    .sort({ semester: 1 });

  let totalMaxMarks = 0;
  let totalMarksObtained = 0;
  let totalCredits = 0;
  let totalCreditPoints = 0;
  let anyFailed = false;

  const subjectResults = marksList.map((m) => {
    const credits = m.subject?.credits || 3;
    const subjectMaxTotal = m.maxTotal || (m.maxInternal || 30) + (m.maxExternal || 70) || 100;
    totalCredits += credits;
    totalCreditPoints += (m.gradePoint || 0) * credits;
    totalMaxMarks += subjectMaxTotal;
    totalMarksObtained += m.totalMarks || 0;

    if (!m.isPassed) anyFailed = true;

    return {
      _id: m._id,
      subjectCode: m.subject?.subjectCode || 'N/A',
      subjectName: m.subject?.subjectName || 'General Subject',
      credits,
      internalMarks: m.internalMarks,
      externalMarks: m.externalMarks,
      totalMarks: m.totalMarks,
      maxTotal: subjectMaxTotal,
      percentage: m.percentage,
      grade: m.grade,
      gradePoint: m.gradePoint,
      isPassed: m.isPassed,
      semester: m.semester,
      academicYear: m.academicYear,
    };
  });

  const sgpa = totalCredits > 0 ? Math.round((totalCreditPoints / totalCredits) * 100) / 100 : 0;
  const overallPercentage = totalMaxMarks > 0 ? Math.round((totalMarksObtained / totalMaxMarks) * 100) : 0;

  let resultStatus = 'PASSED';
  if (subjectResults.length === 0) {
    resultStatus = 'PENDING';
  } else if (anyFailed) {
    resultStatus = 'NEEDS IMPROVEMENT (FAIL)';
  } else if (overallPercentage >= 75) {
    resultStatus = 'FIRST CLASS WITH DISTINCTION';
  } else if (overallPercentage >= 60) {
    resultStatus = 'FIRST CLASS';
  } else {
    resultStatus = 'SECOND CLASS';
  }

  return {
    student: {
      _id: student._id,
      studentId: student.studentId,
      name: `${student.firstName} ${student.lastName}`,
      department: student.department,
      course: student.course,
      semester: student.semester,
    },
    semester: semester || 'All Semesters',
    totalSubjects: subjectResults.length,
    totalCredits,
    totalMarksObtained,
    totalMaxMarks,
    overallPercentage,
    sgpa,
    resultStatus,
    subjectResults,
  };
};