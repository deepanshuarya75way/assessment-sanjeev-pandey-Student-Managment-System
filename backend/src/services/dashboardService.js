import Student from '../models/Student.js';
import Teacher from '../models/Teacher.js';
import Course from '../models/Course.js';
import Subject from '../models/Subject.js';
import Attendance from '../models/Attendance.js';
import Marks from '../models/Marks.js';
import Announcement from '../models/Announcement.js';

export const getAdminDashboardData = async () => {
  const [totalStudents, totalTeachers, totalCourses, totalSubjects] = await Promise.all([
    Student.countDocuments(),
    Teacher.countDocuments(),
    Course.countDocuments(),
    Subject.countDocuments(),
  ]);

  const studentDistribution = await Student.aggregate([
    { $group: { _id: '$department', count: { $sum: 1 } } },
    { $project: { department: '$_id', count: 1, _id: 0 } },
    { $sort: { count: -1 } },
  ]);

  const courseDistribution = await Course.aggregate([
    { $group: { _id: '$department', count: { $sum: 1 } } },
    { $project: { department: '$_id', count: 1, _id: 0 } },
    { $sort: { count: -1 } },
  ]);

  const attendanceAgg = await Attendance.aggregate([
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
      },
    },
  ]);

  let totalAttendanceRecords = 0;
  let presentCount = 0;
  let absentCount = 0;
  let lateCount = 0;
  attendanceAgg.forEach((item) => {
    totalAttendanceRecords += item.count;
    if (item._id === 'Present') presentCount = item.count;
    if (item._id === 'Absent') absentCount = item.count;
    if (item._id === 'Late') lateCount = item.count;
  });

  const attendanceRate = totalAttendanceRecords > 0
    ? Math.round(((presentCount + (lateCount * 0.5)) / totalAttendanceRecords) * 100)
    : 0;

  const recentStudents = await Student.find()
    .sort({ createdAt: -1 })
    .limit(5)
    .select('studentId firstName lastName email department semester status createdAt');

  const [recentMarksList, recentAttendanceList] = await Promise.all([
    Marks.find()
      .sort({ createdAt: -1 })
      .limit(4)
      .populate('student', 'firstName lastName studentId')
      .populate('subject', 'name code'),
    Attendance.find()
      .sort({ createdAt: -1 })
      .limit(4)
      .populate('subject', 'name code')
      .populate('student', 'firstName lastName'),
  ]);

  const recentActivity = [];

  recentStudents.slice(0, 3).forEach((s) => {
    recentActivity.push({
      type: 'STUDENT_ENROLLED',
      title: `Student Enrolled: ${s.firstName} ${s.lastName}`,
      description: `${s.studentId} enrolled in ${s.department} (Sem ${s.semester})`,
      timestamp: s.createdAt,
    });
  });

  recentMarksList.forEach((m) => {
    recentActivity.push({
      type: 'MARKS_PUBLISHED',
      title: `Marks Graded: ${m.student?.firstName || 'Student'} ${m.student?.lastName || ''}`,
      description: `${m.subject?.name || 'Subject'} - Scored ${m.totalMarks} (${m.grade})`,
      timestamp: m.createdAt,
    });
  });

  const seenDateSubj = new Set();
  recentAttendanceList.forEach((a) => {
    const key = `${a.dateString}_${a.subject?._id}`;
    if (!seenDateSubj.has(key)) {
      seenDateSubj.add(key);
      recentActivity.push({
        type: 'ATTENDANCE_RECORDED',
        title: `Attendance Session: ${a.subject?.name || 'Subject'}`,
        description: `Class attendance logged for ${a.dateString}`,
        timestamp: a.createdAt,
      });
    }
  });

  recentActivity.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

  const announcements = await Announcement.find()
    .sort({ createdAt: -1 })
    .limit(5);

  return {
    metrics: {
      totalStudents,
      totalTeachers,
      totalCourses,
      totalSubjects,
    },
    attendanceOverview: {
      totalRecords: totalAttendanceRecords,
      presentCount,
      absentCount,
      lateCount,
      rate: attendanceRate,
    },
    studentDistribution,
    courseDistribution,
    recentStudents,
    recentActivity: recentActivity.slice(0, 8),
    announcements,
  };
};

export const getTeacherDashboardData = async (userEmail) => {
  let teacher = await Teacher.findOne({ email: userEmail });
  if (!teacher) {
    teacher = await Teacher.findOne({ status: 'Active' });
  }
  
  let assignedCourses = [];
  let teacherId = null;
  if (teacher) {
    teacherId = teacher._id;
    assignedCourses = await Course.find({ assignedTeachers: teacher._id }).populate('subjects');
  }

  if (assignedCourses.length === 0 && teacher?.department) {
    assignedCourses = await Course.find({ department: teacher.department }).populate('subjects');
  }

  const assignedCourseIds = assignedCourses.map((c) => c._id);
  const assignedCourseNames = assignedCourses.map((c) => c.courseName);

  const assignedStudentsCount = await Student.countDocuments({
    $or: [
      { course: { $in: assignedCourseNames } },
      { department: teacher?.department || '' },
    ],
  });

  const todayStr = new Date().toISOString().split('T')[0];
  const todayAttendanceQuery = { dateString: todayStr };
  if (teacherId) {
    todayAttendanceQuery.$or = [
      { teacher: teacherId },
      { course: { $in: assignedCourseIds } },
    ];
  }
  const todayAttendanceRecords = await Attendance.find(todayAttendanceQuery)
    .populate('subject', 'name code')
    .populate('student', 'firstName lastName studentId');

  const todayPresent = todayAttendanceRecords.filter((r) => r.status === 'Present').length;
  const todayAbsent = todayAttendanceRecords.filter((r) => r.status === 'Absent').length;
  const todayLate = todayAttendanceRecords.filter((r) => r.status === 'Late').length;

  const marksQuery = teacherId
    ? { teacher: teacherId }
    : assignedCourseIds.length > 0
    ? { course: { $in: assignedCourseIds } }
    : {};

  const recentMarks = await Marks.find(marksQuery)
    .sort({ createdAt: -1 })
    .limit(5)
    .populate('student', 'firstName lastName studentId')
    .populate('subject', 'name code');

  const recentActivity = [];
  todayAttendanceRecords.slice(0, 3).forEach((a) => {
    recentActivity.push({
      type: 'ATTENDANCE_RECORDED',
      title: `Attendance Marked: ${a.student?.firstName} ${a.student?.lastName}`,
      description: `${a.subject?.name || 'Class'} marked ${a.status}`,
      timestamp: a.createdAt,
    });
  });

  recentMarks.forEach((m) => {
    recentActivity.push({
      type: 'MARKS_PUBLISHED',
      title: `Graded: ${m.student?.firstName} ${m.student?.lastName}`,
      description: `${m.subject?.name || 'Subject'} - ${m.grade} (${m.percentage}%)`,
      timestamp: m.createdAt,
    });
  });
  recentActivity.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

  const announcements = await Announcement.find({
    targetRole: { $in: ['ALL', 'TEACHER'] },
  })
    .sort({ createdAt: -1 })
    .limit(5);

  return {
    teacherProfile: teacher,
    metrics: {
      assignedCoursesCount: assignedCourses.length,
      assignedStudentsCount,
      todayAttendanceCount: todayAttendanceRecords.length,
      recentMarksCount: recentMarks.length,
    },
    assignedCourses,
    todayAttendance: {
      date: todayStr,
      total: todayAttendanceRecords.length,
      present: todayPresent,
      absent: todayAbsent,
      late: todayLate,
      records: todayAttendanceRecords.slice(0, 5),
    },
    recentMarks,
    recentActivity: recentActivity.slice(0, 6),
    announcements,
  };
};

export const getStudentDashboardData = async (userEmail) => {
  let student = await Student.findOne({ email: userEmail });
  if (!student) {
    student = await Student.findOne({ status: 'Active' });
  }
  if (!student) {
    const announcements = await Announcement.find({
      targetRole: { $in: ['ALL', 'STUDENT'] },
    })
      .sort({ createdAt: -1 })
      .limit(5);

    return {
      studentProfile: null,
      metrics: { attendanceRate: 0, totalClasses: 0, cgpa: '0.00', overallPercentage: 0 },
      recentMarks: [],
      announcements,
    };
  }

  const courseDoc = await Course.findOne({
    $or: [{ courseName: student.course }, { courseCode: student.course }],
  }).populate('subjects');

  const attendanceRecords = await Attendance.find({ student: student._id }).populate('subject', 'name code');
  let presentCount = 0;
  let lateCount = 0;
  let absentCount = 0;
  attendanceRecords.forEach((att) => {
    if (att.status === 'Present') presentCount += 1;
    else if (att.status === 'Late') lateCount += 1;
    else if (att.status === 'Absent') absentCount += 1;
  });
  const totalClasses = attendanceRecords.length;
  const attendanceRate = totalClasses > 0
    ? Math.round(((presentCount + (lateCount * 0.5)) / totalClasses) * 100)
    : 0;

  const marks = await Marks.find({ student: student._id })
    .sort({ semester: -1, createdAt: -1 })
    .populate('subject', 'name code credits');

  let totalGradePoints = 0;
  let totalCredits = 0;
  let totalMarksObtained = 0;
  let totalMaxMarks = 0;

  marks.forEach((m) => {
    const credits = m.subject?.credits || 3;
    totalCredits += credits;
    totalGradePoints += (m.gradePoint || 0) * credits;
    totalMarksObtained += m.totalMarks || 0;
    totalMaxMarks += m.maxTotal || (m.maxInternal + m.maxExternal) || 100;
  });

  const cgpa = totalCredits > 0 ? (totalGradePoints / totalCredits).toFixed(2) : '0.00';
  const overallPercentage = totalMaxMarks > 0 ? Math.round((totalMarksObtained / totalMaxMarks) * 100) : 0;

  const announcements = await Announcement.find({
    targetRole: { $in: ['ALL', 'STUDENT'] },
  })
    .sort({ createdAt: -1 })
    .limit(5);

  return {
    studentProfile: student,
    currentCourse: courseDoc || { courseName: student.course, department: student.department },
    metrics: {
      attendanceRate,
      totalClasses,
      presentCount,
      absentCount,
      lateCount,
      cgpa,
      overallPercentage,
      subjectsGraded: marks.length,
    },
    recentMarks: marks.slice(0, 6),
    attendanceHistory: attendanceRecords.slice(0, 6),
    announcements,
  };
};
