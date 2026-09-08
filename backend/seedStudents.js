import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Student from './src/models/Student.js';

dotenv.config();

const initialStudents = [
  {
    studentId: 'STU-2026-001',
    firstName: 'Aarav',
    lastName: 'Sharma',
    email: 'aarav.sharma@sms.edu',
    phone: '+91 9811223344',
    gender: 'Male',
    department: 'Computer Science & Engineering',
    course: 'B.Tech Computer Science',
    semester: 4,
    city: 'New Delhi',
    state: 'Delhi',
    status: 'Active',
  },
  {
    studentId: 'STU-2026-002',
    firstName: 'Diya',
    lastName: 'Patel',
    email: 'diya.patel@sms.edu',
    phone: '+91 9822334455',
    gender: 'Female',
    department: 'Information Technology',
    course: 'B.Tech IT',
    semester: 2,
    city: 'Ahmedabad',
    state: 'Gujarat',
    status: 'Active',
  },
  {
    studentId: 'STU-2026-003',
    firstName: 'Rohan',
    lastName: 'Gupta',
    email: 'rohan.gupta@sms.edu',
    phone: '+91 9833445566',
    gender: 'Male',
    department: 'Mechanical Engineering',
    course: 'B.Tech Mechanical',
    semester: 6,
    city: 'Pune',
    state: 'Maharashtra',
    status: 'Active',
  },
  {
    studentId: 'STU-2026-004',
    firstName: 'Ananya',
    lastName: 'Iyer',
    email: 'ananya.iyer@sms.edu',
    phone: '+91 9844556677',
    gender: 'Female',
    department: 'Electronics & Communication',
    course: 'B.Tech ECE',
    semester: 4,
    city: 'Bengaluru',
    state: 'Karnataka',
    status: 'Active',
  },
  {
    studentId: 'STU-2026-005',
    firstName: 'Karan',
    lastName: 'Singh',
    email: 'karan.singh@sms.edu',
    phone: '+91 9855667788',
    gender: 'Male',
    department: 'Civil Engineering',
    course: 'B.Tech Civil',
    semester: 8,
    city: 'Chandigarh',
    state: 'Punjab',
    status: 'Graduated',
  },
];

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const count = await Student.countDocuments();
    if (count === 0) {
      await Student.insertMany(initialStudents);
      console.log(`Seeded ${initialStudents.length} real student records into MongoDB Atlas.`);
    } else {
      console.log(`Database already has ${count} student records. Skipping seed.`);
    }
    await mongoose.disconnect();
  } catch (err) {
    console.error('Seed error:', err.message);
  }
};

seed();