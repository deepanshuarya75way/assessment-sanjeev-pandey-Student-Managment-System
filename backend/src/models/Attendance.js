import mongoose from 'mongoose';

const attendanceSchema = new mongoose.Schema(
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
    date: {
      type: Date,
      required: [true, 'Attendance date is required'],
    },
    dateString: {
      type: String,
      required: [true, 'Date string is required'],
      index: true,
    },
    status: {
      type: String,
      enum: {
        values: ['Present', 'Absent', 'Late'],
        message: 'Status must be Present, Absent, or Late',
      },
      default: 'Present',
      required: true,
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

attendanceSchema.index(
  { student: 1, subject: 1, dateString: 1 },
  { unique: true }
);

attendanceSchema.index({ course: 1, dateString: 1 });
attendanceSchema.index({ subject: 1, dateString: 1 });

const Attendance = mongoose.model('Attendance', attendanceSchema);

export default Attendance;