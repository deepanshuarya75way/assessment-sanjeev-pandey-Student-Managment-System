import mongoose from 'mongoose';
import Attendance from '../models/Attendance.js';
import Student from '../models/Student.js';
import Course from '../models/Course.js';

export const markBatchAttendance = async ({
  courseId,
  subjectId,
  teacherId,
  date,
  records = [],
}) => {
  if (!courseId || !subjectId || !date) {
    const error = new Error('Course, Subject, and Date are required to mark attendance');
    error.statusCode = 400;
    throw error;
  }

  if (!Array.isArray(records) || records.length === 0) {
    const error = new Error('Please provide at least one student attendance record');
    error.statusCode = 400;
    throw error;
  }

  const dateObj = new Date(date);
  const dateString = dateObj.toISOString().split('T')[0];

  const operations = records.map((rec) => {
    const validStatus = ['Present', 'Absent', 'Late'].includes(rec.status)
      ? rec.status
      : 'Present';

    const updateDoc = {
      student: rec.studentId,
      course: courseId,
      subject: subjectId,
      date: dateObj,
      dateString,
      status: validStatus,
      remarks: rec.remarks || '',
    };

    if (teacherId && mongoose.Types.ObjectId.isValid(teacherId)) {
      updateDoc.teacher = teacherId;
    }

    return {
      updateOne: {
        filter: {
          student: rec.studentId,
          subject: subjectId,
          dateString,
        },
        update: {
          $set: updateDoc,
        },
        upsert: true,
      },
    };
  });

  const bulkResult = await Attendance.bulkWrite(operations);

  return {
    success: true,
    message: `Attendance marked successfully for ${records.length} students on ${dateString}`,
    upsertedCount: bulkResult.upsertedCount,
    modifiedCount: bulkResult.modifiedCount,
    dateString,
  };
};

export const queryAttendance = async ({
  courseId = '',
  subjectId = '',
  studentId = '',
  dateString = '',
  startDate = '',
  endDate = '',
  status = '',
  search = '',
  sortBy = 'date',
  sortOrder = 'desc',
  page = 1,
  limit = 20,
}) => {
  const query = {};

  if (courseId) query.course = courseId;
  if (subjectId) query.subject = subjectId;
  if (studentId) query.student = studentId;
  if (status) query.status = status;

  if (startDate && endDate) {
    query.dateString = { $gte: startDate, $lte: endDate };
  } else if (startDate) {
    query.dateString = { $gte: startDate };
  } else if (endDate) {
    query.dateString = { $lte: endDate };
  } else if (dateString) {
    query.dateString = dateString;
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

  const [records, total] = await Promise.all([
    Attendance.find(query)
      .populate('student', 'studentId firstName lastName email department')
      .populate('course', 'courseCode courseName')
      .populate('subject', 'subjectCode subjectName')
      .populate('teacher', 'teacherId firstName lastName')
      .sort({ [sortBy]: sortDirection })
      .skip(skip)
      .limit(limitNum),
    Attendance.countDocuments(query),
  ]);

  return {
    records,
    pagination: {
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum) || 1,
    },
  };
};

export const getStudentAttendanceStats = async (studentId) => {
  const records = await Attendance.find({ student: studentId })
    .populate('subject', 'subjectCode subjectName')
    .populate('course', 'courseCode courseName');

  const subjectStats = {};
  let totalClasses = 0;
  let totalPresent = 0;
  let totalAbsent = 0;
  let totalLate = 0;

  records.forEach((rec) => {
    const subId = rec.subject?._id?.toString() || 'unknown';
    const subCode = rec.subject?.subjectCode || 'N/A';
    const subName = rec.subject?.subjectName || 'General Subject';

    if (!subjectStats[subId]) {
      subjectStats[subId] = {
        subjectId: subId,
        subjectCode: subCode,
        subjectName: subName,
        total: 0,
        present: 0,
        absent: 0,
        late: 0,
      };
    }

    subjectStats[subId].total += 1;
    totalClasses += 1;

    if (rec.status === 'Present') {
      subjectStats[subId].present += 1;
      totalPresent += 1;
    } else if (rec.status === 'Late') {
      subjectStats[subId].late += 1;
      totalLate += 1;
    } else {
      subjectStats[subId].absent += 1;
      totalAbsent += 1;
    }
  });

  const subjectsList = Object.values(subjectStats).map((sub) => {
    const percentage = sub.total > 0
      ? Math.round(((sub.present + sub.late * 0.5) / sub.total) * 100)
      : 0;
    return {
      ...sub,
      percentage,
      isLowAttendance: percentage < 75,
    };
  });

  const overallPercentage = totalClasses > 0
    ? Math.round(((totalPresent + totalLate * 0.5) / totalClasses) * 100)
    : 0;

  return {
    totalClasses,
    totalPresent,
    totalAbsent,
    totalLate,
    presentCount: totalPresent,
    lateCount: totalLate,
    absentCount: totalAbsent,
    overallPercentage,
    isLowAttendance: overallPercentage < 75,
    subjects: subjectsList,
  };
};

export const getCourseSubjectStats = async (courseId, subjectId) => {
  const query = {};
  if (courseId) query.course = courseId;
  if (subjectId) query.subject = subjectId;

  const records = await Attendance.find(query);
  const totalRecords = records.length;
  const presentCount = records.filter((r) => r.status === 'Present').length;
  const lateCount = records.filter((r) => r.status === 'Late').length;
  const absentCount = records.filter((r) => r.status === 'Absent').length;

  const percentage = totalRecords > 0
    ? Math.round(((presentCount + lateCount * 0.5) / totalRecords) * 100)
    : 0;

  const distinctDates = [...new Set(records.map((r) => r.dateString))].length;

  return {
    totalRecords,
    sessionsConducted: distinctDates,
    presentCount,
    lateCount,
    absentCount,
    percentage,
  };
};

export const getEnrolledStudents = async (courseId) => {
  let course;
  if (courseId && mongoose.Types.ObjectId.isValid(courseId)) {
    course = await Course.findById(courseId);
  }

  const query = { status: 'Active' };
  if (course) {
    query.$or = [
      { course: course.courseName },
      { course: course.courseCode },
      { department: course.department },
      { department: new RegExp(course.department.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i') },
      { course: new RegExp(course.courseName.split(' ')[0], 'i') },
    ];
  }

  let students = await Student.find(query).sort({ studentId: 1 });
  if (students.length === 0) {
    students = await Student.find({ status: 'Active' }).sort({ studentId: 1 });
  }
  return students;
};