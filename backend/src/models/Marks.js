import mongoose from 'mongoose';
import { calculateGrade } from '../utils/gradeCalculator.js';

const marksSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: [true, 'Student reference is required'],
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: [true, 'Course reference is required'],
    },
    subject: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subject',
      required: [true, 'Subject reference is required'],
    },
    teacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Teacher',
    },
    internalMarks: {
      type: Number,
      required: [true, 'Internal marks are required'],
      min: [0, 'Internal marks cannot be negative'],
      default: 0,
    },
    externalMarks: {
      type: Number,
      required: [true, 'External marks are required'],
      min: [0, 'External marks cannot be negative'],
      default: 0,
    },
    maxInternal: {
      type: Number,
      default: 30,
    },
    maxExternal: {
      type: Number,
      default: 70,
    },
    totalMarks: {
      type: Number,
      required: true,
    },
    maxTotal: {
      type: Number,
      default: 100,
    },
    percentage: {
      type: Number,
      required: true,
    },
    grade: {
      type: String,
      enum: ['A+', 'A', 'B+', 'B', 'C', 'D', 'F'],
      required: true,
    },
    gradePoint: {
      type: Number,
      default: 0,
    },
    isPassed: {
      type: Boolean,
      default: true,
    },
    semester: {
      type: Number,
      required: [true, 'Semester is required'],
      min: 1,
      max: 12,
    },
    academicYear: {
      type: String,
      default: '2025-2026',
    },
    remarks: {
      type: String,
      trim: true,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

marksSchema.pre('validate', function (next) {
  const result = calculateGrade(
    this.internalMarks,
    this.externalMarks,
    this.maxInternal || 30,
    this.maxExternal || 70
  );

  this.totalMarks = result.totalMarks;
  this.percentage = result.percentage;
  this.grade = result.grade;
  this.gradePoint = result.gradePoint;
  this.isPassed = result.isPassed;
  next();
});

marksSchema.index(
  { student: 1, subject: 1, semester: 1 },
  { unique: true }
);

marksSchema.index({ course: 1, semester: 1 });
marksSchema.index({ subject: 1, semester: 1 });

const Marks = mongoose.model('Marks', marksSchema);

export default Marks;