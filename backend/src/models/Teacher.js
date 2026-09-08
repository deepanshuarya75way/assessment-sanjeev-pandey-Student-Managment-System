import mongoose from 'mongoose';

const teacherSchema = new mongoose.Schema(
  {
    teacherId: {
      type: String,
      required: [true, 'Teacher ID is required'],
      unique: true,
      trim: true,
      uppercase: true,
    },
    firstName: {
      type: String,
      required: [true, 'First name is required'],
      trim: true,
    },
    lastName: {
      type: String,
      required: [true, 'Last name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
        'Please enter a valid email address',
      ],
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true,
    },
    department: {
      type: String,
      required: [true, 'Department is required'],
      trim: true,
    },
    qualification: {
      type: String,
      trim: true,
      default: 'Post Graduate',
    },
    experience: {
      type: Number,
      default: 0,
      min: [0, 'Experience cannot be negative'],
    },
    specialization: {
      type: String,
      trim: true,
      default: '',
    },
    profileImage: {
      type: String,
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

teacherSchema.index({ firstName: 1, lastName: 1, teacherId: 1, email: 1 });
teacherSchema.index({ department: 1, status: 1 });

const Teacher = mongoose.model('Teacher', teacherSchema);

export default Teacher;