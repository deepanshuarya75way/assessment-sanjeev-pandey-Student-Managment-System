import * as marksService from '../services/marksService.js';
import Student from '../models/Student.js';

export const saveMarks = async (req, res, next) => {
  try {
    const { studentId, courseId, subjectId, internalMarks, externalMarks, semester, academicYear, remarks } = req.body;
    const teacherId = req.user?._id;

    const record = await marksService.upsertMarks({
      studentId,
      courseId,
      subjectId,
      teacherId,
      internalMarks,
      externalMarks,
      semester,
      academicYear,
      remarks,
    });

    res.status(200).json({
      success: true,
      message: 'Marks recorded and graded successfully',
      marks: record,
    });
  } catch (error) {
    next(error);
  }
};

export const getMarksList = async (req, res, next) => {
  try {
    const result = await marksService.queryMarks(req.query);
    res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    next(error);
  }
};

export const getStudentResult = async (req, res, next) => {
  try {
    const { studentId } = req.params;
    const { semester } = req.query;

    const result = await marksService.getStudentSemesterReport(studentId, semester);
    res.status(200).json({
      success: true,
      report: result,
    });
  } catch (error) {
    next(error);
  }
};

export const getMyResults = async (req, res, next) => {
  try {
    const student = await Student.findOne({ email: req.user.email });
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'No student profile linked to your user account',
      });
    }

    const { semester } = req.query;
    const report = await marksService.getStudentSemesterReport(student._id, semester);

    res.status(200).json({
      success: true,
      report,
    });
  } catch (error) {
    next(error);
  }
};