import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Marks from './src/models/Marks.js';
import Student from './src/models/Student.js';
import Course from './src/models/Course.js';
import Subject from './src/models/Subject.js';
import Teacher from './src/models/Teacher.js';
import { calculateGrade } from './src/utils/gradeCalculator.js';

dotenv.config();

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB Atlas for marks seeding.');

    const students = await Student.find();
    const course = await Course.findOne();
    const subjects = await Subject.find();
    const teacher = await Teacher.findOne();

    if (!students.length || !course || !subjects.length) {
      console.log('Prerequisites missing. Skipping.');
      await mongoose.disconnect();
      return;
    }

    const sampleScores = [
      { internal: 27, external: 64 }, // 91% -> A+
      { internal: 24, external: 58 }, // 82% -> A
      { internal: 22, external: 51 }, // 73% -> B+
      { internal: 20, external: 46 }, // 66% -> B
      { internal: 17, external: 39 }, // 56% -> C
    ];

    const records = [];

    students.forEach((stu, stuIdx) => {
      subjects.forEach((sub, subIdx) => {
        const score = sampleScores[(stuIdx + subIdx) % sampleScores.length];
        const calc = calculateGrade(score.internal, score.external);
        records.push({
          student: stu._id,
          course: course._id,
          subject: sub._id,
          teacher: teacher?._id,
          internalMarks: calc.internalMarks,
          externalMarks: calc.externalMarks,
          totalMarks: calc.totalMarks,
          maxInternal: 30,
          maxExternal: 70,
          maxTotal: 100,
          percentage: calc.percentage,
          grade: calc.grade,
          gradePoint: calc.gradePoint,
          isPassed: calc.isPassed,
          semester: 3,
          academicYear: '2025-2026',
          remarks: 'Regular academic assessment',
        });
      });
    });

    for (const r of records) {
      await Marks.findOneAndUpdate(
        { student: r.student, subject: r.subject, semester: r.semester },
        { $set: r },
        { upsert: true, runValidators: true }
      );
    }

    console.log(`Seeded ${records.length} marks records into MongoDB Atlas across all subjects and students.`);
    await mongoose.disconnect();
  } catch (err) {
    console.error('Marks seed failed:', err.message);
    process.exit(1);
  }
};

seed();