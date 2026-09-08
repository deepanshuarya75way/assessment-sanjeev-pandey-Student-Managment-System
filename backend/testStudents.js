import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Student from './src/models/Student.js';
import * as studentService from './src/services/studentService.js';

dotenv.config();

const runStudentTests = async () => {
  console.log('=== Starting Stage 2 Student Management Service Tests ===');

  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB Atlas.');

    // Clean up test students
    await Student.deleteMany({
      studentId: { $in: ['TEST-STU-001', 'TEST-STU-002', 'TEST-STU-003'] },
    });

    // 1. Create Student
    console.log('\n--- Test 1: Create Student ---');
    const created = await studentService.createStudent({
      studentId: 'TEST-STU-001',
      firstName: 'Rahul',
      lastName: 'Sharma',
      email: 'rahul.sharma@sms.edu',
      phone: '+91 9876543210',
      gender: 'Male',
      department: 'Computer Science',
      course: 'B.Tech CSE',
      semester: 3,
      status: 'Active',
      city: 'Delhi',
      state: 'Delhi',
    });
    console.log('PASS: Created student:', created.studentId, '|', created.firstName, created.lastName);

    // 2. Prevent duplicate studentId
    console.log('\n--- Test 2: Prevent Duplicate Student ID ---');
    try {
      await studentService.createStudent({
        studentId: 'TEST-STU-001',
        firstName: 'Another',
        lastName: 'Student',
        email: 'another@sms.edu',
        phone: '+91 9999999999',
        department: 'Information Technology',
        course: 'B.Tech IT',
        semester: 1,
      });
      throw new Error('FAIL: Allowed duplicate studentId!');
    } catch (err) {
      if (err.message.includes('already exists')) {
        console.log('PASS: Correctly rejected duplicate studentId.');
      } else {
        throw err;
      }
    }

    // 3. Prevent duplicate email
    console.log('\n--- Test 3: Prevent Duplicate Email ---');
    try {
      await studentService.createStudent({
        studentId: 'TEST-STU-002',
        firstName: 'Duplicate',
        lastName: 'Email',
        email: 'rahul.sharma@sms.edu',
        phone: '+91 8888888888',
        department: 'Civil Engineering',
        course: 'B.Tech Civil',
        semester: 2,
      });
      throw new Error('FAIL: Allowed duplicate email!');
    } catch (err) {
      if (err.message.includes('already exists')) {
        console.log('PASS: Correctly rejected duplicate email.');
      } else {
        throw err;
      }
    }

    // Create second student for pagination & filter tests
    await studentService.createStudent({
      studentId: 'TEST-STU-002',
      firstName: 'Priya',
      lastName: 'Verma',
      email: 'priya.verma@sms.edu',
      phone: '+91 9876543211',
      gender: 'Female',
      department: 'Mechanical Engineering',
      course: 'B.Tech ME',
      semester: 5,
      status: 'Inactive',
      city: 'Mumbai',
      state: 'Maharashtra',
    });

    // 4. Query with Search
    console.log('\n--- Test 4: Search Students ---');
    const searchResult = await studentService.queryStudents({ search: 'Priya' });
    if (searchResult.students.length >= 1 && searchResult.students[0].firstName === 'Priya') {
      console.log('PASS: Search by firstName found:', searchResult.students[0].firstName);
    } else {
      throw new Error('FAIL: Search failed to find student.');
    }

    // 5. Query with Department Filter
    console.log('\n--- Test 5: Filter by Department ---');
    const deptResult = await studentService.queryStudents({ department: 'Computer Science' });
    const match = deptResult.students.find((s) => s.studentId === 'TEST-STU-001');
    if (match) {
      console.log('PASS: Filter returned student matching department "Computer Science".');
    } else {
      throw new Error('FAIL: Department filter failed.');
    }

    // 6. Pagination
    console.log('\n--- Test 6: Pagination ---');
    const paginated = await studentService.queryStudents({ page: 1, limit: 1 });
    if (paginated.students.length === 1 && paginated.pagination.limit === 1) {
      console.log('PASS: Pagination correctly limited results to 1. Total in DB:', paginated.pagination.total);
    } else {
      throw new Error('FAIL: Pagination limit not respected.');
    }

    // 7. Get by ID
    console.log('\n--- Test 7: Get Student by ID ---');
    const fetched = await studentService.getStudentById(created._id.toString());
    if (fetched.email === 'rahul.sharma@sms.edu') {
      console.log('PASS: Retrieved student by _id successfully.');
    } else {
      throw new Error('FAIL: getStudentById failed.');
    }

    // 8. Update Student
    console.log('\n--- Test 8: Update Student ---');
    const updated = await studentService.updateStudent(created._id.toString(), {
      semester: 4,
      status: 'Graduated',
    });
    if (updated.semester === 4 && updated.status === 'Graduated') {
      console.log('PASS: Student updated successfully. New semester:', updated.semester, '| Status:', updated.status);
    } else {
      throw new Error('FAIL: Update student failed.');
    }

    // 9. Delete Student
    console.log('\n--- Test 9: Delete Student ---');
    await studentService.deleteStudent(created._id.toString());
    await studentService.deleteStudent('TEST-STU-002');
    try {
      await studentService.getStudentById(created._id.toString());
      throw new Error('FAIL: Student still exists after deletion!');
    } catch (err) {
      if (err.message.includes('not found')) {
        console.log('PASS: Student confirmed deleted.');
      } else {
        throw err;
      }
    }

    console.log('\n=== ALL STAGE 2 BACKEND TESTS PASSED SUCCESSFULLY! ===\n');
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('Test failed:', err.message);
    await mongoose.disconnect();
    process.exit(1);
  }
};

runStudentTests();