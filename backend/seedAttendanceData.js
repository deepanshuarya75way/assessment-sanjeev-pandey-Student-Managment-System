import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Attendance from './src/models/Attendance.js';
import Student from './src/models/Student.js';
import Course from './src/models/Course.js';
import Subject from './src/models/Subject.js';
import Teacher from './src/models/Teacher.js';

dotenv.config();

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB Atlas for attendance seeding.');

    const students = await Student.find();
    const course = await Course.findOne();
    const subjects = await Subject.find();
    const teacher = await Teacher.findOne();

    if (!students.length || !course || !subjects.length) {
      console.log('Prerequisites missing. Skipping.');
      await mongoose.disconnect();
      return;
    }

    const dates = [
      '2026-09-01',
      '2026-09-02',
      '2026-09-03',
      '2026-09-04',
      '2026-09-05',
    ];

    const records = [];
    const statuses = ['Present', 'Present', 'Present', 'Late', 'Absent'];

    for (const dateString of dates) {
      for (const sub of subjects) {
        for (let i = 0; i < students.length; i++) {
          const student = students[i];
          const status = statuses[(i + dateString.charCodeAt(dateString.length - 1)) % statuses.length];
          records.push({
            student: student._id,
            course: course._id,
            subject: sub._id,
            teacher: teacher?._id,
            date: new Date(dateString),
            dateString,
            status,
            remarks: status === 'Late' ? 'Late entry by 15 mins' : '',
          });
        }
      }
    }

    // Bulk upsert to avoid duplicate errors
    const ops = records.map((r) => ({
      updateOne: {
        filter: { student: r.student, subject: r.subject, dateString: r.dateString },
        update: { $set: r },
        upsert: true,
      },
    }));

    await Attendance.bulkWrite(ops);
    console.log(`Seeded ${records.length} realistic attendance records across 5 sessions into MongoDB Atlas.`);
    await mongoose.disconnect();
  } catch (err) {
    console.error('Attendance seed failed:', err.message);
    process.exit(1);
  }
};

seed();