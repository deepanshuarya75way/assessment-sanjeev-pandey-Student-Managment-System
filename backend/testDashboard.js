import mongoose from 'mongoose';
import dotenv from 'dotenv';
import * as dashboardService from './src/services/dashboardService.js';
import * as announcementService from './src/services/announcementService.js';
import Announcement from './src/models/Announcement.js';

dotenv.config();

const runTests = async () => {
  console.log('=== Starting Stage 6 Dashboard & Analytics Tests ===');

  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB Atlas.');

    // 1. Admin Dashboard Metrics Verification
    console.log('\n--- Test 1: Admin Dashboard Real Data Aggregation ---');
    const adminData = await dashboardService.getAdminDashboardData();
    console.log('Admin Metrics:', adminData.metrics);
    console.log('Attendance Overview:', adminData.attendanceOverview);
    console.log('Student Distribution Count:', adminData.studentDistribution.length);
    console.log('Course Distribution Count:', adminData.courseDistribution.length);
    console.log('Recent Students Count:', adminData.recentStudents.length);
    console.log('Recent Activity Count:', adminData.recentActivity.length);
    console.log('Announcements Count:', adminData.announcements.length);

    if (
      adminData.metrics.totalStudents > 0 &&
      adminData.metrics.totalTeachers > 0 &&
      adminData.metrics.totalCourses > 0 &&
      adminData.metrics.totalSubjects > 0 &&
      adminData.attendanceOverview.totalRecords > 0 &&
      adminData.recentStudents.length > 0 &&
      adminData.recentActivity.length > 0 &&
      adminData.announcements.length > 0
    ) {
      console.log('PASS: Admin dashboard aggregated 100% real database metrics successfully.');
    } else {
      throw new Error('FAIL: Admin dashboard data missing expected aggregates.');
    }

    // 2. Teacher Dashboard Data Verification
    console.log('\n--- Test 2: Teacher Dashboard Verification ---');
    const teacherData = await dashboardService.getTeacherDashboardData('teacher@sms.edu');
    console.log('Teacher Profile:', teacherData.teacherProfile ? teacherData.teacherProfile.firstName : 'None');
    console.log('Teacher Metrics:', teacherData.metrics);
    console.log('Assigned Courses Count:', teacherData.assignedCourses.length);
    console.log('Teacher Announcements:', teacherData.announcements.length);

    if (teacherData.teacherProfile && teacherData.metrics.assignedStudentsCount >= 0) {
      console.log('PASS: Teacher dashboard loaded personalized faculty context successfully.');
    } else {
      throw new Error('FAIL: Teacher dashboard failed to load valid data.');
    }

    // 3. Student Dashboard Data Verification
    console.log('\n--- Test 3: Student Dashboard Verification ---');
    const studentData = await dashboardService.getStudentDashboardData('student@sms.edu');
    console.log('Student Profile:', studentData.studentProfile ? studentData.studentProfile.firstName : 'None');
    console.log('Student Metrics:', studentData.metrics);
    console.log('Current Course:', studentData.currentCourse?.courseName);
    console.log('Student Recent Marks Count:', studentData.recentMarks.length);

    if (studentData.studentProfile && studentData.metrics.attendanceRate >= 0) {
      console.log('PASS: Student dashboard computed attendance rate and academic summary successfully.');
    } else {
      throw new Error('FAIL: Student dashboard data aggregation failed.');
    }

    // 4. Role-based Announcement Querying
    console.log('\n--- Test 4: Role-based Announcement Filtering ---');
    const studentAnnouncements = await announcementService.queryAnnouncements({ targetRole: 'STUDENT' });
    const hasTeacherExclusive = studentAnnouncements.some((a) => a.targetRole === 'TEACHER');
    if (!hasTeacherExclusive && studentAnnouncements.length > 0) {
      console.log(`PASS: Student received ${studentAnnouncements.length} announcements with zero TEACHER-exclusive leaks.`);
    } else {
      throw new Error('FAIL: Role isolation leaked in announcements query.');
    }

    // 5. Announcement Creation & Deletion
    console.log('\n--- Test 5: Announcement Lifecycle (Create & Delete) ---');
    const testAnn = await announcementService.createAnnouncement({
      title: 'Automated Test Notification',
      content: 'This announcement verifies automated creation and deletion pipelines.',
      category: 'General',
      targetRole: 'ALL',
      priority: 'Normal',
      authorName: 'Test Suite',
    });
    console.log('Created test announcement ID:', testAnn._id);

    const deleteRes = await announcementService.deleteAnnouncement(testAnn._id);
    const checkDeleted = await Announcement.findById(testAnn._id);
    if (deleteRes && !checkDeleted) {
      console.log('PASS: Announcement created and deleted cleanly.');
    } else {
      throw new Error('FAIL: Announcement lifecycle test failed.');
    }

    console.log('\n=== ALL 5 STAGE 6 TESTS PASSED SUCCESSFULLY! ===');
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('Test error:', err);
    await mongoose.disconnect();
    process.exit(1);
  }
};

runTests();
