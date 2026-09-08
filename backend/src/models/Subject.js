import mongoose from 'mongoose';

const subjectSchema = new mongoose.Schema(
  {
    subjectCode: {
      type: String,
      required: [true, 'Subject code is required'],
      unique: true,
      trim: true,
      uppercase: true,
    },
    subjectName: {
      type: String,
      required: [true, 'Subject name is required'],
      trim: true,
    },
    department: {
      type: String,
      required: [true, 'Department is required'],
      trim: true,
    },
    credits: {
      type: Number,
      default: 3,
      min: [1, 'Credits must be at least 1'],
      max: [8, 'Credits cannot exceed 8'],
    },
    semester: {
      type: Number,
      default: 1,
      min: [1, 'Semester must be at least 1'],
      max: [12, 'Semester cannot exceed 12'],
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
    },
    teacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Teacher',
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    status: {
      type: String,
      enum: ['Active', 'Inactive'],
      default: 'Active',
    },
  },
  {
    timestamps: true,
  }
);

subjectSchema.index({ subjectCode: 1, subjectName: 1 });
subjectSchema.index({ department: 1, course: 1 });

const Subject = mongoose.model('Subject', subjectSchema);

export default Subject;