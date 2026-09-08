import User from '../models/User.js';
import Student from '../models/Student.js';
import Teacher from '../models/Teacher.js';
import { generateToken } from '../utils/generateToken.js';

export const registerUser = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, email, and password',
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long',
      });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'A user with this email address already exists',
      });
    }

    const validRoles = ['ADMIN', 'TEACHER', 'STUDENT'];
    const assignedRole = role && validRoles.includes(role.toUpperCase())
      ? role.toUpperCase()
      : 'STUDENT';

    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password,
      role: assignedRole,
    });

    if (assignedRole === 'STUDENT') {
      try {
        const existingStudent = await Student.findOne({ email: user.email });
        if (!existingStudent) {
          const nameParts = name.trim().split(/\s+/);
          const firstName = nameParts[0];
          const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : 'Learner';

          let studentId;
          let isUnique = false;
          let attempts = 0;
          while (!isUnique && attempts < 10) {
            attempts++;
            const randomNum = Math.floor(1000 + Math.random() * 9000);
            studentId = `STU-${new Date().getFullYear()}-${randomNum}`;
            const exists = await Student.findOne({ studentId });
            if (!exists) isUnique = true;
          }

          await Student.create({
            studentId,
            firstName,
            lastName,
            email: user.email,
            phone: req.body.phone?.trim() || '9876543210',
            department: req.body.department?.trim() || 'Computer Science & Engineering',
            course: req.body.course?.trim() || 'B.Tech Computer Science',
            semester: req.body.semester ? Number(req.body.semester) : 1,
            gender: req.body.gender || 'Male',
            status: 'Active',
            address: req.body.address || '',
          });
        }
      } catch (studentErr) {
        console.error('Auto student profile creation note:', studentErr.message);
      }
    } else if (assignedRole === 'TEACHER') {
      try {
        const existingTeacher = await Teacher.findOne({ email: user.email });
        if (!existingTeacher) {
          const nameParts = name.trim().split(/\s+/);
          const firstName = nameParts[0];
          const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : 'Faculty';

          let teacherId;
          let isUnique = false;
          let attempts = 0;
          while (!isUnique && attempts < 10) {
            attempts++;
            const randomNum = Math.floor(100 + Math.random() * 900);
            teacherId = `TCH-${new Date().getFullYear()}-${randomNum}`;
            const exists = await Teacher.findOne({ teacherId });
            if (!exists) isUnique = true;
          }

          await Teacher.create({
            teacherId,
            firstName,
            lastName,
            email: user.email,
            phone: req.body.phone?.trim() || '9876543210',
            department: req.body.department?.trim() || 'Computer Science & Engineering',
            qualification: req.body.qualification || 'Post Graduate',
            experience: req.body.experience ? Number(req.body.experience) : 2,
            status: 'Active',
          });
        }
      } catch (teacherErr) {
        console.error('Auto teacher profile creation note:', teacherErr.message);
      }
    }

    const token = generateToken({ id: user._id, role: user.role });

    res.status(201).json({
      success: true,
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email and password',
      });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Account is deactivated. Please contact an administrator.',
      });
    }

    const token = generateToken({ id: user._id, role: user.role });

    res.status(200).json({
      success: true,
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getMe = async (req, res, next) => {
  try {
    res.status(200).json({
      success: true,
      user: req.user,
    });
  } catch (error) {
    next(error);
  }
};