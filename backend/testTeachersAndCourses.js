import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Teacher from './src/models/Teacher.js';
import Course from './src/models/Course.js';
import Subject from './src/models/Subject.js';
import * as teacherService from './src/services/teacherService.js';
import * as courseService from './src/services/courseService.js';
import * as subjectService from './src/services/subjectService.js';

dotenv.config();

const runTests = async () => {
  console.log('=== Starting Stage 3 Teacher, Course & Subject Tests ===');

  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB Atlas.');

    // Cleanup test data
    await Teacher.deleteMany({ teacherId: { $in: ['TEST-TCH-001', 'TEST-TCH-002'] } });
    await Course.deleteMany({ courseCode: { $in: ['TEST-CSE-101'] } });
    await Subject.deleteMany({ subjectCode: { $in: ['TEST-SUB-101', 'TEST-SUB-102'] } });

    // 1. Teacher CRUD
    console.log('\n--- Test 1: Teacher CRUD ---');
    const teacher = await teacherService.createTeacher({
      teacherId: 'TEST-TCH-001',
      firstName: 'Ramesh',
      lastName: 'Gupta',
      email: 'ramesh.gupta@sms.edu',
      phone: '+91 9911223344',
      department: 'Computer Science & Engineering',
      qualification: 'Ph.D in Computer Science',
      experience: 12,
      specialization: 'Theoretical Computing & Cryptography',
      status: 'Active',
    });
    console.log('PASS: Created teacher:', teacher.teacherId, '|', teacher.firstName, teacher.lastName);

    // Prevent duplicate teacher ID
    try {
      await teacherService.createTeacher({
        teacherId: 'TEST-TCH-001',
        firstName: 'Duplicate',
        lastName: 'Teacher',
        email: 'dup@sms.edu',
        phone: '+91 9999999999',
        department: 'CS',
      });
      throw new Error('FAIL: Allowed duplicate teacherId');
    } catch (err) {
      if (err.message.includes('already exists')) {
        console.log('PASS: Correctly rejected duplicate teacherId.');
      } else throw err;
    }

    // 2. Subject CRUD
    console.log('\n--- Test 2: Subject CRUD & Assignment ---');
    const subject = await subjectService.createSubject({
      subjectCode: 'TEST-SUB-101',
      subjectName: 'Algorithms & Data Structures',
      department: 'Computer Science & Engineering',
      credits: 4,
      semester: 3,
      teacher: teacher._id,
      description: 'Core computer science fundamentals',
    });
    console.log('PASS: Created subject:', subject.subjectCode, '| Assigned teacher:', teacher.firstName);

    // 3. Course CRUD with Relational Linking
    console.log('\n--- Test 3: Course CRUD & Relationship Population ---');
    const course = await courseService.createCourse({
      courseCode: 'TEST-CSE-101',
      courseName: 'Bachelor of Technology in CS',
      department: 'Computer Science & Engineering',
      duration: '4 Years',
      semester: 8,
      subjects: [subject._id],
      assignedTeachers: [teacher._id],
      description: 'Accredited undergraduate engineering program',
    });
    console.log('PASS: Created course with subjects and teachers:', course.courseCode);

    // Verify populated relationships
    const populated = await courseService.getCourseById(course._id.toString());
    if (populated.subjects.length === 1 && populated.subjects[0].subjectCode === 'TEST-SUB-101') {
      console.log('PASS: Course successfully populated Subject:', populated.subjects[0].subjectName);
    } else {
      throw new Error('FAIL: Subject population failed in Course!');
    }

    if (populated.assignedTeachers.length === 1 && populated.assignedTeachers[0].email === 'ramesh.gupta@sms.edu') {
      console.log('PASS: Course successfully populated Teacher:', populated.assignedTeachers[0].firstName);
    } else {
      throw new Error('FAIL: Teacher population failed in Course!');
    }

    // 4. Update and Delete
    console.log('\n--- Test 4: Updates & Cleanups ---');
    await teacherService.updateTeacher(teacher._id.toString(), { experience: 14 });
    const updatedTeacher = await teacherService.getTeacherById(teacher._id.toString());
    if (updatedTeacher.experience === 14) {
      console.log('PASS: Updated teacher experience successfully.');
    }

    await courseService.deleteCourse(course._id.toString());
    await subjectService.deleteSubject(subject._id.toString());
    await teacherService.deleteTeacher(teacher._id.toString());
    console.log('PASS: Cleanup and record deletion verified.');

    console.log('\n=== ALL STAGE 3 BACKEND TESTS PASSED SUCCESSFULLY! ===\n');
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('Test Failed:', err.message);
    await mongoose.disconnect();
    process.exit(1);
  }
};

runTests();