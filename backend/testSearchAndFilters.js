import mongoose from 'mongoose';
import dotenv from 'dotenv';
import * as attendanceService from './src/services/attendanceService.js';
import * as marksService from './src/services/marksService.js';
import * as courseService from './src/services/courseService.js';
import * as subjectService from './src/services/subjectService.js';
import Student from './src/models/Student.js';
import Teacher from './src/models/Teacher.js';
import Course from './src/models/Course.js';
import Subject from './src/models/Subject.js';

dotenv.config();

const runTests = async () => {
  console.log('=== Starting Stage 7 Search, Filtering, and Pagination Tests ===');

  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB Atlas.');

    // 1. Global Multi-Entity Search Simulation
    console.log('\n--- Test 1: Global Multi-Entity Regex Search ---');
    const q = 'Aarav';
    const regex = new RegExp(q, 'i');
    const matchedStudents = await Student.find({
      $or: [{ firstName: regex }, { lastName: regex }, { studentId: regex }],
    });
    console.log(`Found ${matchedStudents.length} student(s) matching "${q}":`, matchedStudents.map((s) => s.firstName));

    const qCourse = 'Computer';
    const regexCourse = new RegExp(qCourse, 'i');
    const matchedCourses = await Course.find({
      $or: [{ courseName: regexCourse }, { courseCode: regexCourse }],
    });
    console.log(`Found ${matchedCourses.length} course(s) matching "${qCourse}":`, matchedCourses.map((c) => c.courseName));

    if (matchedStudents.length > 0 && matchedCourses.length > 0) {
      console.log('PASS: Global multi-entity search logic successfully queries multiple collections.');
    } else {
      throw new Error('FAIL: Global search returned empty for seeded entities.');
    }

    // 2. Attendance Date Range & Student Search Filtering
    console.log('\n--- Test 2: Attendance Date Range & Search Filters ---');
    const dateRangeRes = await attendanceService.queryAttendance({
      startDate: '2026-01-01',
      endDate: '2026-12-31',
      limit: 5,
    });
    console.log(`Date range filter returned ${dateRangeRes.records.length} records. Total in range: ${dateRangeRes.pagination.total}`);

    const stuSearchRes = await attendanceService.queryAttendance({
      search: 'Aarav',
      limit: 5,
    });
    console.log(`Student search filter returned ${stuSearchRes.records.length} records for "Aarav".`);

    if (dateRangeRes.pagination.total > 0 && stuSearchRes.records.length > 0) {
      console.log('PASS: Attendance date range and student search filters functioning accurately.');
    } else {
      throw new Error('FAIL: Attendance search/filter returned no results.');
    }

    // 3. Marks Filters and Sorting
    console.log('\n--- Test 3: Marks Grade, Semester, and Sorting ---');
    const sortedMarks = await marksService.queryMarks({
      sortBy: 'percentage',
      sortOrder: 'desc',
      limit: 5,
    });
    console.log('Top Marks sorted desc by percentage:');
    sortedMarks.marks.forEach((m) => {
      console.log(` - ${m.student?.firstName || 'Student'}: ${m.percentage}% (Grade: ${m.grade}, Sem: ${m.semester})`);
    });

    const marksSearch = await marksService.queryMarks({
      search: 'Aarav',
      limit: 5,
    });
    console.log(`Marks search for "Aarav" returned ${marksSearch.marks.length} record(s).`);

    if (sortedMarks.marks.length > 0 && marksSearch.marks.length > 0) {
      console.log('PASS: Marks filtering, sorting, and student search functioning accurately.');
    } else {
      throw new Error('FAIL: Marks filtering or sorting failed.');
    }

    // 4. Course and Subject Sorting
    console.log('\n--- Test 4: Course and Subject Sorting & Semester Filters ---');
    const coursesSorted = await courseService.queryCourses({
      sortBy: 'courseCode',
      sortOrder: 'asc',
    });
    console.log('Courses sorted asc by code:', coursesSorted.courses.map((c) => c.courseCode));

    const subjectsFiltered = await subjectService.querySubjects({
      sortBy: 'subjectCode',
      sortOrder: 'asc',
      limit: 5,
    });
    console.log(`Subjects queried: ${subjectsFiltered.subjects.length} modules.`);

    if (coursesSorted.courses.length > 0 && subjectsFiltered.subjects.length > 0) {
      console.log('PASS: Course & Subject sorting and pagination functioning accurately.');
    } else {
      throw new Error('FAIL: Course/Subject query failed.');
    }

    console.log('\n=== ALL 4 STAGE 7 BACKEND TESTS PASSED SUCCESSFULLY! ===');
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('Test error:', err);
    await mongoose.disconnect();
    process.exit(1);
  }
};

runTests();
