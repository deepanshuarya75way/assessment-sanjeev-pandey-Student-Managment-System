import * as studentService from '../services/studentService.js';

export const getStudents = async (req, res, next) => {
  try {
    const result = await studentService.queryStudents(req.query);
    res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    next(error);
  }
};

export const getStudent = async (req, res, next) => {
  try {
    const student = await studentService.getStudentById(req.params.id);
    res.status(200).json({
      success: true,
      student,
    });
  } catch (error) {
    next(error);
  }
};

export const createStudent = async (req, res, next) => {
  try {
    const { studentId, firstName, lastName, email, phone, course, department, semester } = req.body;

    if (!studentId || !firstName || !lastName || !email || !phone || !course || !department) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields: studentId, firstName, lastName, email, phone, course, and department',
      });
    }

    const student = await studentService.createStudent(req.body);
    res.status(201).json({
      success: true,
      message: 'Student registered successfully',
      student,
    });
  } catch (error) {
    next(error);
  }
};

export const updateStudent = async (req, res, next) => {
  try {
    const student = await studentService.updateStudent(req.params.id, req.body);
    res.status(200).json({
      success: true,
      message: 'Student record updated successfully',
      student,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteStudent = async (req, res, next) => {
  try {
    const result = await studentService.deleteStudent(req.params.id);
    res.status(200).json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    next(error);
  }
};

export const getMyStudentProfile = async (req, res, next) => {
  try {
    const student = await studentService.getStudentByEmail(req.user?.email);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student profile not found for the logged-in user',
      });
    }
    res.status(200).json({
      success: true,
      student,
    });
  } catch (error) {
    next(error);
  }
};