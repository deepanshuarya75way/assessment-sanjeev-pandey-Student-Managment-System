import * as courseService from '../services/courseService.js';

export const getCourses = async (req, res, next) => {
  try {
    const result = await courseService.queryCourses(req.query);
    res.status(200).json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
};

export const getCourse = async (req, res, next) => {
  try {
    const course = await courseService.getCourseById(req.params.id);
    res.status(200).json({ success: true, course });
  } catch (error) {
    next(error);
  }
};

export const createCourse = async (req, res, next) => {
  try {
    const { courseCode, courseName, department, duration } = req.body;
    if (!courseCode || !courseName || !department || !duration) {
      return res.status(400).json({
        success: false,
        message: 'Please provide courseCode, courseName, department, and duration',
      });
    }

    const course = await courseService.createCourse(req.body);
    res.status(201).json({
      success: true,
      message: 'Course created successfully',
      course,
    });
  } catch (error) {
    next(error);
  }
};

export const updateCourse = async (req, res, next) => {
  try {
    const course = await courseService.updateCourse(req.params.id, req.body);
    res.status(200).json({
      success: true,
      message: 'Course updated successfully',
      course,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteCourse = async (req, res, next) => {
  try {
    const result = await courseService.deleteCourse(req.params.id);
    res.status(200).json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    next(error);
  }
};