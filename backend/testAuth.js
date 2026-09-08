import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './src/models/User.js';
import { generateToken } from './src/utils/generateToken.js';
import { protect, authorize } from './src/middleware/authMiddleware.js';

dotenv.config();

const runTests = async () => {
  console.log('=== Starting Stage 1 Authentication & Authorization Tests ===');

  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB Atlas for testing.');

    // Clean up test users
    await User.deleteMany({ email: { $in: ['admin@sms.edu', 'teacher@sms.edu', 'student@sms.edu', 'testuser@sms.edu'] } });

    // TEST 1: Register Users with Different Roles
    console.log('\n--- Test 1: User Registration ---');
    const adminUser = await User.create({
      name: 'System Administrator',
      email: 'admin@sms.edu',
      password: 'password123',
      role: 'ADMIN',
    });
    console.log('Registered ADMIN:', adminUser.email, '| Role:', adminUser.role);

    const teacherUser = await User.create({
      name: 'Prof. Rajesh Verma',
      email: 'teacher@sms.edu',
      password: 'password123',
      role: 'TEACHER',
    });
    console.log('Registered TEACHER:', teacherUser.email, '| Role:', teacherUser.role);

    const studentUser = await User.create({
      name: 'Aarav Sharma',
      email: 'student@sms.edu',
      password: 'password123',
      role: 'STUDENT',
    });
    console.log('Registered STUDENT:', studentUser.email, '| Role:', studentUser.role);

    // TEST 2: Verify Password Hashing with bcrypt
    console.log('\n--- Test 2: Password Hashing Verification ---');
    const userInDb = await User.findOne({ email: 'admin@sms.edu' }).select('+password');
    if (userInDb.password === 'password123') {
      throw new Error('FAIL: Password was stored as plaintext!');
    }
    if (!userInDb.password.startsWith('$2')) {
      throw new Error('FAIL: Password is not a valid bcrypt hash!');
    }
    console.log('PASS: Password is securely bcrypt-hashed:', userInDb.password.substring(0, 20) + '...');

    // TEST 3: Password Comparison Method
    console.log('\n--- Test 3: Password Matching Method ---');
    const isCorrect = await userInDb.matchPassword('password123');
    const isWrong = await userInDb.matchPassword('wrongpassword');
    if (!isCorrect || isWrong) {
      throw new Error('FAIL: matchPassword method returned incorrect result!');
    }
    console.log('PASS: Password comparison correctly validated right & wrong credentials.');

    // TEST 4: Duplicate Email Rejection
    console.log('\n--- Test 4: Duplicate Email Handling ---');
    try {
      await User.create({
        name: 'Duplicate Admin',
        email: 'admin@sms.edu',
        password: 'password123',
        role: 'ADMIN',
      });
      throw new Error('FAIL: Allowed duplicate email creation!');
    } catch (err) {
      if (err.code === 11000) {
        console.log('PASS: Duplicate email correctly rejected with code 11000.');
      } else {
        throw err;
      }
    }

    // TEST 5: JWT Generation
    console.log('\n--- Test 5: JWT Token Generation ---');
    const adminToken = generateToken({ id: adminUser._id, role: adminUser.role });
    const studentToken = generateToken({ id: studentUser._id, role: studentUser.role });
    console.log('PASS: Successfully generated valid JWT tokens.');

    // TEST 6: Auth Middleware - Missing Token
    console.log('\n--- Test 6: Auth Middleware (No Token) ---');
    let mockReq = { headers: {} };
    let mockRes = {
      statusCode: 200,
      status(code) { this.statusCode = code; return this; },
      json(data) { this.data = data; return this; },
    };
    let nextCalled = false;

    await protect(mockReq, mockRes, () => { nextCalled = true; });
    if (mockRes.statusCode === 401 && !nextCalled) {
      console.log('PASS: Missing token returns 401 Unauthorized.');
    } else {
      throw new Error('FAIL: Auth middleware did not reject missing token!');
    }

    // TEST 7: Auth Middleware - Valid Token
    console.log('\n--- Test 7: Auth Middleware (Valid Token) ---');
    mockReq = { headers: { authorization: `Bearer ${adminToken}` } };
    mockRes = { status(code) { this.statusCode = code; return this; }, json(data) { this.data = data; } };
    nextCalled = false;

    await protect(mockReq, mockRes, () => { nextCalled = true; });
    if (nextCalled && mockReq.user && mockReq.user.role === 'ADMIN') {
      console.log('PASS: Valid token successfully attaches req.user (Role:', mockReq.user.role + ')');
    } else {
      throw new Error('FAIL: Valid token failed to authenticate!');
    }

    // TEST 8: Role Authorization Middleware
    console.log('\n--- Test 8: Role-Based Authorization ---');
    // Admin checking admin route
    const adminAuthCheck = authorize('ADMIN');
    mockReq = { user: adminUser };
    nextCalled = false;
    adminAuthCheck(mockReq, mockRes, () => { nextCalled = true; });
    if (!nextCalled) throw new Error('FAIL: Admin was blocked from admin route!');
    console.log('PASS: Admin granted access to ADMIN route.');

    // Student checking admin route
    mockReq = { user: studentUser };
    mockRes = { statusCode: 200, status(code) { this.statusCode = code; return this; }, json(data) { this.data = data; } };
    nextCalled = false;
    adminAuthCheck(mockReq, mockRes, () => { nextCalled = true; });
    if (mockRes.statusCode === 403 && !nextCalled) {
      console.log('PASS: Student correctly forbidden (403) from ADMIN route.');
    } else {
      throw new Error('FAIL: Student was not blocked from admin route!');
    }

    console.log('\n=== ALL STAGE 1 BACKEND TESTS PASSED SUCCESSFULLY! ===\n');
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('Test Suite Failure:', error.message);
    await mongoose.disconnect();
    process.exit(1);
  }
};

runTests();