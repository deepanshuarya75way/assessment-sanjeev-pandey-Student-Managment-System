import mongoose from 'mongoose';

const courseSchema = new mongoose.Schema(
  {
    courseCode: {
      type: String,
      required: [true, 'Course code is required'],
      unique: true,
      trim: true,
      uppercase: true,
    },
    courseName: {
      type: String,
      required: [true, 'Course name is required'],
      trim: true,
    },
    department: {
      type: String,
      required: [true, 'Department is required'],
      trim: true,
    },
    duration: {
      type: String,
      required: [true, 'Duration is required'],
      default: '4 Years',
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    semester: {
      type: Number,
      required: [true, 'Total semesters is required'],
      default: 8,
      min: [1, 'Semester must be at least 1'],
      max: [12, 'Semester cannot exceed 12'],
    },
    subjects: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Subject',
      },
    ],
    assignedTeachers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Teacher',
      },
    ],
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

courseSchema.index({ courseCode: 1, courseName: 1 });
courseSchema.index({ department: 1, status: 1 });

const Course = mongoose.model('Course', courseSchema);

export default Course;