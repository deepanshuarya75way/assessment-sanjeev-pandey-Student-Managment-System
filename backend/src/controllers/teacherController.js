import * as teacherService from '../services/teacherService.js';

export const getTeachers = async (req, res, next) => {
  try {
    const result = await teacherService.queryTeachers(req.query);
    res.status(200).json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
};

export const getTeacher = async (req, res, next) => {
  try {
    const teacher = await teacherService.getTeacherById(req.params.id);
    res.status(200).json({ success: true, teacher });
  } catch (error) {
    next(error);
  }
};

export const createTeacher = async (req, res, next) => {
  try {
    const { teacherId, firstName, lastName, email, phone, department } = req.body;
    if (!teacherId || !firstName || !lastName || !email || !phone || !department) {
      return res.status(400).json({
        success: false,
        message: 'Please provide teacherId, firstName, lastName, email, phone, and department',
      });
    }

    const teacher = await teacherService.createTeacher(req.body);
    res.status(201).json({
      success: true,
      message: 'Teacher profile created successfully',
      teacher,
    });
  } catch (error) {
    next(error);
  }
};

export const updateTeacher = async (req, res, next) => {
  try {
    const teacher = await teacherService.updateTeacher(req.params.id, req.body);
    res.status(200).json({
      success: true,
      message: 'Teacher record updated successfully',
      teacher,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteTeacher = async (req, res, next) => {
  try {
    const result = await teacherService.deleteTeacher(req.params.id);
    res.status(200).json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    next(error);
  }
};