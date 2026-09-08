import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Marks from './src/models/Marks.js';
import Student from './src/models/Student.js';
import Course from './src/models/Course.js';
import Subject from './src/models/Subject.js';
import Teacher from './src/models/Teacher.js';
import { calculateGrade } from './src/utils/gradeCalculator.js';
import * as marksService from './src/services/marksService.js';

dotenv.config();

const runTests = async () => {
  console.log('=== Starting Stage 5 Marks and Result Management Tests ===');

  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB Atlas.');

    // 1. Grade Calculation Unit Verification
    console.log('\n--- Test 1: Grade Calculation Scale Verification ---');
    const g1 = calculateGrade(28, 65); // 93% -> A+
    const g2 = calculateGrade(24, 58); // 82% -> A
    const g3 = calculateGrade(22, 52); // 74% -> B+
    const g4 = calculateGrade(18, 45); // 63% -> B
    const g5 = calculateGrade(15, 38); // 53% -> C
    const g6 = calculateGrade(12, 30); // 42% -> D
    const g7 = calculateGrade(8, 20);  // 28% -> F

    if (g1.grade === 'A+' && g2.grade === 'A' && g3.grade === 'B+' && g4.grade === 'B' &&
        g5.grade === 'C' && g6.grade === 'D' && g7.grade === 'F') {
      console.log('PASS: All 7 grade boundaries (A+ to F) calculated accurately.');
    } else {
      throw new Error('FAIL: Grade calculation failed threshold test!');
    }

    // Find sample student, course, subject, teacher
    const student = await Student.findOne();
    const course = await Course.findOne();
    const subject = await Subject.findOne();
    const teacher = await Teacher.findOne();

    if (!student || !course || !subject) {
      throw new Error('Prerequisite data missing (student/course/subject)');
    }

    // Clean up test student marks for isolated test run
    await Marks.deleteMany({ student: student._id, semester: 3 });

    // 2. Marks Upsert & Auto Calculation in MongoDB Atlas
    console.log('\n--- Test 2: Marks Creation with Auto Computation ---');
    const m1 = await marksService.upsertMarks({
      studentId: student._id,
      courseId: course._id,
      subjectId: subject._id,
      teacherId: teacher?._id,
      internalMarks: 26,
      externalMarks: 62,
      semester: 3,
      academicYear: '2025-2026',
      remarks: 'Outstanding performance',
    });

    console.log(`PASS: Marks saved: Total = ${m1.totalMarks}/100 | Percentage = ${m1.percentage}% | Grade = ${m1.grade} (GP: ${m1.gradePoint})`);
    if (m1.totalMarks !== 88 || m1.percentage !== 88 || m1.grade !== 'A') {
      throw new Error('FAIL: Auto calculated values do not match expected numbers!');
    }

    // 3. Duplicate Prevention / Update Test
    console.log('\n--- Test 3: Duplicate Prevention & Re-grading ---');
    const mUpdated = await marksService.upsertMarks({
      studentId: student._id,
      courseId: course._id,
      subjectId: subject._id,
      teacherId: teacher?._id,
      internalMarks: 29,
      externalMarks: 66,
      semester: 3,
      academicYear: '2025-2026',
    });

    const marksCount = await Marks.countDocuments({
      student: student._id,
      subject: subject._id,
      semester: 3,
    });

    if (marksCount === 1 && mUpdated.grade === 'A+') {
      console.log('PASS: Duplicate prevented! Exactly 1 record exists, re-graded to A+ (95%).');
    } else {
      throw new Error(`FAIL: Duplicate marks record created! Count = ${marksCount}`);
    }

    // 4. Semester Report / Transcript Calculation
    console.log('\n--- Test 4: Semester Report & SGPA Calculation ---');
    const report = await marksService.getStudentSemesterReport(student._id, 3);
    console.log('PASS: Student Report Generated:');
    console.log(`      - Student: ${report.student.name}`);
    console.log(`      - Total Subjects: ${report.totalSubjects}`);
    console.log(`      - SGPA: ${report.sgpa}`);
    console.log(`      - Overall Percentage: ${report.overallPercentage}%`);
    console.log(`      - Status: ${report.resultStatus}`);

    if (report.overallPercentage === 95 && report.sgpa === 10) {
      console.log('PASS: SGPA and Overall Result accurately computed.');
    } else {
      throw new Error('FAIL: SGPA or percentage calculation mismatch!');
    }

    console.log('\n=== ALL STAGE 5 BACKEND TESTS PASSED SUCCESSFULLY! ===\n');
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('Test Failed:', err.message);
    await mongoose.disconnect();
    process.exit(1);
  }
};

runTests();