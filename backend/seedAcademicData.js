import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Teacher from './src/models/Teacher.js';
import Course from './src/models/Course.js';
import Subject from './src/models/Subject.js';

dotenv.config();

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB Atlas for academic seeding.');

    const teacherCount = await Teacher.countDocuments();
    if (teacherCount > 0) {
      console.log('Academic data already exists. Skipping seed.');
      await mongoose.disconnect();
      return;
    }

    // 1. Create Teachers
    const t1 = await Teacher.create({
      teacherId: 'TCH-2026-001',
      firstName: 'Rajesh',
      lastName: 'Khanna',
      email: 'rajesh.khanna@sms.edu',
      phone: '+91 9811002233',
      department: 'Computer Science & Engineering',
      qualification: 'Ph.D in Computer Science',
      experience: 14,
      specialization: 'Artificial Intelligence & Data Mining',
      status: 'Active',
    });

    const t2 = await Teacher.create({
      teacherId: 'TCH-2026-002',
      firstName: 'Sunita',
      lastName: 'Rao',
      email: 'sunita.rao@sms.edu',
      phone: '+91 9822003344',
      department: 'Information Technology',
      qualification: 'Ph.D in Cybersecurity',
      experience: 10,
      specialization: 'Cloud Security & Distributed Systems',
      status: 'Active',
    });

    const t3 = await Teacher.create({
      teacherId: 'TCH-2026-003',
      firstName: 'Amit',
      lastName: 'Verma',
      email: 'amit.verma@sms.edu',
      phone: '+91 9833004455',
      department: 'Mechanical Engineering',
      qualification: 'M.Tech Machine Design',
      experience: 8,
      specialization: 'Thermodynamics & Robotics',
      status: 'Active',
    });

    console.log('Seeded 3 Teachers.');

    // 2. Create Courses
    const c1 = await Course.create({
      courseCode: 'BTECH-CSE',
      courseName: 'B.Tech Computer Science & Engineering',
      department: 'Computer Science & Engineering',
      duration: '4 Years',
      semester: 8,
      assignedTeachers: [t1._id, t2._id],
      description: 'Comprehensive curriculum covering core algorithms, software systems, and AI.',
      status: 'Active',
    });

    const c2 = await Course.create({
      courseCode: 'BTECH-IT',
      courseName: 'B.Tech Information Technology',
      department: 'Information Technology',
      duration: '4 Years',
      semester: 8,
      assignedTeachers: [t2._id],
      description: 'Applied computing, network architectures, cybersecurity, and enterprise systems.',
      status: 'Active',
    });

    console.log('Seeded 2 Courses.');

    // 3. Create Subjects
    const s1 = await Subject.create({
      subjectCode: 'CS301',
      subjectName: 'Data Structures & Algorithms',
      department: 'Computer Science & Engineering',
      credits: 4,
      semester: 3,
      course: c1._id,
      teacher: t1._id,
      description: 'Fundamental linear and non-linear data structures, complexity analysis, and algorithms.',
    });

    const s2 = await Subject.create({
      subjectCode: 'CS302',
      subjectName: 'Database Management Systems',
      department: 'Computer Science & Engineering',
      credits: 4,
      semester: 3,
      course: c1._id,
      teacher: t2._id,
      description: 'Relational algebra, SQL, normalization, concurrency control, and indexing.',
    });

    const s3 = await Subject.create({
      subjectCode: 'IT401',
      subjectName: 'Computer Networks & Protocols',
      department: 'Information Technology',
      credits: 3,
      semester: 4,
      course: c2._id,
      teacher: t2._id,
      description: 'OSI and TCP/IP stack, socket programming, routing protocols, and network security.',
    });

    // Link subjects to Courses
    await Course.findByIdAndUpdate(c1._id, { $addToSet: { subjects: { $each: [s1._id, s2._id] } } });
    await Course.findByIdAndUpdate(c2._id, { $addToSet: { subjects: s3._id } });

    console.log('Seeded 3 Subjects linked to Courses and Teachers successfully.');
    await mongoose.disconnect();
  } catch (err) {
    console.error('Seed error:', err.message);
    process.exit(1);
  }
};

seed();