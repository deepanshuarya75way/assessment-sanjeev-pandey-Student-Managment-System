import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Announcement from './src/models/Announcement.js';

dotenv.config();

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB Atlas for announcement seeding.');

    await Announcement.deleteMany({});
    console.log('Cleared existing announcements.');

    const announcements = [
      {
        title: 'Mid-Term Examination Schedule Released',
        description: 'The Semester IV and Semester VI mid-term theory and lab examination schedule has been officially published. Students are advised to verify their subject timings and seat allocations.',
        category: 'Exam',
        targetAudience: 'Everyone',
        priority: 'Urgent',
        status: 'Published',
        publishDate: new Date(),
        expiryDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        authorName: 'Office of the Controller of Examinations',
      },
      {
        title: 'Faculty Academic Council Meeting',
        description: 'All department heads and faculty members are requested to assemble in Conference Hall A for the curriculum review meeting on Friday at 3:00 PM.',
        category: 'Academic',
        targetAudience: 'Teachers',
        priority: 'High',
        status: 'Published',
        publishDate: new Date(),
        expiryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        authorName: 'Dean of Academics',
      },
      {
        title: 'Annual Inter-College Tech Symposium "INNOVATE 2026"',
        description: 'Registration is now open for our annual technical symposium INNOVATE 2026. Events include Hackathon, Coding Marathon, Robotics Display, and Tech Paper Presentations.',
        category: 'Event',
        targetAudience: 'Students',
        priority: 'Normal',
        status: 'Published',
        publishDate: new Date(),
        expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        authorName: 'Student Affairs Council',
      },
      {
        title: 'Central Library Digital Portal Upgrade',
        description: 'The IEEE and Springer digital journal access portal will undergo scheduled maintenance this Sunday between 01:00 AM and 05:00 AM IST. Offline reading access remains unaffected.',
        category: 'General',
        targetAudience: 'Everyone',
        priority: 'Normal',
        status: 'Published',
        publishDate: new Date(),
        expiryDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000),
        authorName: 'Chief Librarian',
      },
      {
        title: '75% Minimum Attendance Compliance Reminder',
        description: 'Students with attendance lower than 75% in any registered subject are required to consult their respective faculty advisors immediately to resolve debarment risks.',
        category: 'Academic',
        targetAudience: 'Students',
        priority: 'High',
        status: 'Published',
        publishDate: new Date(),
        expiryDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
        authorName: 'Academic Directorate',
      },
    ];

    for (const ann of announcements) {
      await Announcement.create(ann);
    }
    console.log(`Successfully seeded ${announcements.length} announcements.`);

    await mongoose.disconnect();
    console.log('MongoDB connection closed.');
  } catch (err) {
    console.error('Seeding error:', err);
    process.exit(1);
  }
};

seed();
