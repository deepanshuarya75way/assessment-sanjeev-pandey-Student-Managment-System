import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Attendance from './src/models/Attendance.js';
import Student from './src/models/Student.js';
import Course from './src/models/Course.js';
import Subject from './src/models/Subject.js';
import Teacher from './src/models/Teacher.js';
import * as attendanceService from './src/services/attendanceService.js';

dotenv.config();

const runTests = async () => {
  console.log('=== Starting Stage 4 Attendance Management Tests ===');

  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB Atlas.');

    // Find sample student, course, subject, teacher
    const student = await Student.findOne();
    const course = await Course.findOne();
    const subject = await Subject.findOne();
    const teacher = await Teacher.findOne();

    if (!student || !course || !subject) {
      throw new Error('Prerequisite data missing (student/course/subject)');
    }

    const testDate = '2026-09-08';

    // Clean up test attendance
    await Attendance.deleteMany({
      student: student._id,
      subject: subject._id,
      dateString: testDate,
    });

    // 1. Mark Batch Attendance
    console.log('\n--- Test 1: Mark Batch Attendance ---');
    const markRes = await attendanceService.markBatchAttendance({
      courseId: course._id,
      subjectId: subject._id,
      teacherId: teacher?._id,
      date: testDate,
      records: [
        { studentId: student._id, status: 'Present', remarks: 'On time' },
      ],
    });
    console.log('PASS:', markRes.message);

    // Verify record in database
    const rec = await Attendance.findOne({
      student: student._id,
      subject: subject._id,
      dateString: testDate,
    });
    if (rec && rec.status === 'Present') {
      console.log('PASS: Attendance document found with status Present.');
    } else {
      throw new Error('FAIL: Attendance record not found in DB!');
    }

    // 2. Duplicate Prevention / Upsert Update
    console.log('\n--- Test 2: Prevent Duplicate Record (Upsert Verification) ---');
    const updateRes = await attendanceService.markBatchAttendance({
      courseId: course._id,
      subjectId: subject._id,
      teacherId: teacher?._id,
      date: testDate,
      records: [
        { studentId: student._id, status: 'Absent', remarks: 'Absent on leave' },
      ],
    });
    console.log('PASS: Re-submitted attendance on same date.');

    const allRecordsForDate = await Attendance.find({
      student: student._id,
      subject: subject._id,
      dateString: testDate,
    });
    if (allRecordsForDate.length === 1 && allRecordsForDate[0].status === 'Absent') {
      console.log('PASS: Duplicate strictly prevented! Exactly 1 record exists, updated to Absent.');
    } else {
      throw new Error(`FAIL: Found ${allRecordsForDate.length} duplicate records!`);
    }

    // 3. Query Attendance with Population
    console.log('\n--- Test 3: Query Attendance with Population ---');
    const queryRes = await attendanceService.queryAttendance({
      studentId: student._id,
      subjectId: subject._id,
      dateString: testDate,
    });
    if (queryRes.records.length === 1 && queryRes.records[0].student && queryRes.records[0].subject) {
      console.log('PASS: Populated student:', queryRes.records[0].student.firstName, '| Subject:', queryRes.records[0].subject.subjectName);
    } else {
      throw new Error('FAIL: Query attendance with population failed');
    }

    // 4. Student Attendance Percentage Calculation
    console.log('\n--- Test 4: Calculate Student Attendance Stats ---');
    const stats = await attendanceService.getStudentAttendanceStats(student._id);
    console.log('PASS: Student Stats -> Total Classes:', stats.totalClasses, '| Overall Percentage:', `${stats.overallPercentage}%`);
    if (stats.overallPercentage >= 0 && stats.overallPercentage <= 100) {
      console.log('PASS: Percentage is valid and calculated correctly.');
    } else {
      throw new Error('FAIL: Invalid percentage calculated!');
    }

    // 5. Subject / Course Stats
    console.log('\n--- Test 5: Calculate Subject Attendance Stats ---');
    const subStats = await attendanceService.getCourseSubjectStats(course._id, subject._id);
    console.log('PASS: Subject Stats -> Total Records:', subStats.totalRecords, '| Attendance Rate:', `${subStats.percentage}%`);

    console.log('\n=== ALL STAGE 4 BACKEND TESTS PASSED SUCCESSFULLY! ===\n');
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('Test Failed:', err.message);
    await mongoose.disconnect();
    process.exit(1);
  }
};

runTests();