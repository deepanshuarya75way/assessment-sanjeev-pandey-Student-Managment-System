import * as attendanceService from '../services/attendanceService.js';
import Student from '../models/Student.js';
import Teacher from '../models/Teacher.js';

export const recordAttendance = async (req, res, next) => {
  try {
    const { courseId, subjectId, teacherId, date, records } = req.body;
    let teacherRef = teacherId;

    if (!teacherRef && req.user?.email) {
      const teacherProfile = await Teacher.findOne({ email: req.user.email });
      if (teacherProfile) {
        teacherRef = teacherProfile._id;
      }
    }

    const result = await attendanceService.markBatchAttendance({
      courseId,
      subjectId,
      teacherId: teacherRef,
      date,
      records,
    });

    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const getAttendance = async (req, res, next) => {
  try {
    const result = await attendanceService.queryAttendance(req.query);
    res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    next(error);
  }
};

export const getMyAttendance = async (req, res, next) => {
  try {
    const student = await Student.findOne({ email: req.user.email });
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'No student profile linked to your user account',
      });
    }

    const stats = await attendanceService.getStudentAttendanceStats(student._id);
    const history = await attendanceService.queryAttendance({
      studentId: student._id,
      limit: 50,
    });

    res.status(200).json({
      success: true,
      student: {
        _id: student._id,
        studentId: student.studentId,
        firstName: student.firstName,
        lastName: student.lastName,
      },
      stats,
      history: history.records,
    });
  } catch (error) {
    next(error);
  }
};

export const getAttendanceStats = async (req, res, next) => {
  try {
    const { studentId, courseId, subjectId } = req.query;

    if (studentId) {
      const stats = await attendanceService.getStudentAttendanceStats(studentId);
      return res.status(200).json({ success: true, stats });
    }

    const stats = await attendanceService.getCourseSubjectStats(courseId, subjectId);
    res.status(200).json({ success: true, stats });
  } catch (error) {
    next(error);
  }
};

export const getStudentsForMarking = async (req, res, next) => {
  try {
    let courseId = req.query.courseId;
    if (courseId && typeof courseId === 'object') {
      courseId = courseId.courseId || courseId._id;
    }
    const students = await attendanceService.getEnrolledStudents(courseId);
    res.status(200).json({ success: true, students });
  } catch (error) {
    next(error);
  }
};