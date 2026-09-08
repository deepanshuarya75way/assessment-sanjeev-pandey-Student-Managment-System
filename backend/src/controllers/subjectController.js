import * as subjectService from '../services/subjectService.js';

export const getSubjects = async (req, res, next) => {
  try {
    const result = await subjectService.querySubjects(req.query);
    res.status(200).json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
};

export const getSubject = async (req, res, next) => {
  try {
    const subject = await subjectService.getSubjectById(req.params.id);
    res.status(200).json({ success: true, subject });
  } catch (error) {
    next(error);
  }
};

export const createSubject = async (req, res, next) => {
  try {
    const { subjectCode, subjectName, department } = req.body;
    if (!subjectCode || !subjectName || !department) {
      return res.status(400).json({
        success: false,
        message: 'Please provide subjectCode, subjectName, and department',
      });
    }

    const subject = await subjectService.createSubject(req.body);
    res.status(201).json({
      success: true,
      message: 'Subject registered successfully',
      subject,
    });
  } catch (error) {
    next(error);
  }
};

export const updateSubject = async (req, res, next) => {
  try {
    const subject = await subjectService.updateSubject(req.params.id, req.body);
    res.status(200).json({
      success: true,
      message: 'Subject record updated successfully',
      subject,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteSubject = async (req, res, next) => {
  try {
    const result = await subjectService.deleteSubject(req.params.id);
    res.status(200).json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    next(error);
  }
};