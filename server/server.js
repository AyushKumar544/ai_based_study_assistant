import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { createTransport } from 'nodemailer';
import cors from 'cors';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import { body, validationResult } from 'express-validator';

// Import database manager
import dbManager from './database.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(helmet({
  crossOriginEmbedderPolicy: false,
  contentSecurityPolicy: false
}));

app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '10mb' }));

// Rate limiting - more lenient for development
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // Increased limit for development
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', limiter);

// Email transporter (optional)
let transporter = null;
if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
  transporter = createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
}

// JWT middleware with better error handling
const authenticateToken = (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      console.log('❌ No token provided');
      return res.status(401).json({ message: 'Access token required' });
    }

    const jwtSecret = process.env.JWT_SECRET || 'fallback_secret_key_12345678901234567890';
    
    jwt.verify(token, jwtSecret, (err, user) => {
      if (err) {
        console.error('❌ JWT verification error:', err.message);
        if (err.name === 'TokenExpiredError') {
          return res.status(401).json({ message: 'Token expired' });
        }
        if (err.name === 'JsonWebTokenError') {
          return res.status(401).json({ message: 'Invalid token' });
        }
        return res.status(403).json({ message: 'Token verification failed' });
      }
      
      console.log('✅ Token verified for user:', user.userId);
      req.user = user;
      next();
    });
  } catch (error) {
    console.error('❌ Auth middleware error:', error);
    return res.status(500).json({ message: 'Authentication error' });
  }
};

// Initialize database
async function initializeDatabase() {
  try {
    console.log('🗄️  Initializing database...');
    await dbManager.connect();
    await dbManager.createTables();
    console.log('✅ Database initialized successfully');
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    throw error;
  }
}

// Auth routes
app.post('/api/auth/register', [
  body('name').trim().isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
  body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
], async (req, res) => {
  try {
    console.log('📝 Registration attempt for:', req.body.email);
    
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('❌ Validation errors:', errors.array());
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    const { name, email, password } = req.body;

    // Ensure database is connected
    if (!dbManager.isConnected) {
      console.log('🔄 Database not connected, attempting to connect...');
      await dbManager.connect();
    }

    // Check if user already exists
    console.log('🔍 Checking if user exists...');
    const existingUser = await dbManager.get('SELECT id FROM users WHERE email = ?', [email]);

    if (existingUser) {
      console.log('❌ User already exists:', email);
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    // Hash password
    console.log('🔐 Hashing password...');
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Generate JWT secret
    const jwtSecret = process.env.JWT_SECRET || 'fallback_secret_key_12345678901234567890';
    
    // Generate verification token
    const verificationToken = jwt.sign({ email }, jwtSecret, { expiresIn: '24h' });

    // Insert user into database
    console.log('💾 Inserting user into database...');
    const result = await dbManager.run(
      `INSERT INTO users (
        name, email, password, verification_token, email_verified, 
        setup_complete, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
      [name, email, hashedPassword, verificationToken, true, false]
    );

    console.log('✅ User created successfully with ID:', result.lastID);

    // Generate JWT token for authentication
    const authToken = jwt.sign(
      { userId: result.lastID, email },
      jwtSecret,
      { expiresIn: '7d' }
    );

    // Return success response
    res.status(201).json({
      message: 'User created successfully',
      token: authToken,
      user: {
        id: result.lastID,
        name,
        email,
        setupComplete: false,
        emailVerified: true
      }
    });

  } catch (error) {
    console.error('❌ Registration error:', error);
    
    // Handle specific database errors
    if (error.message.includes('UNIQUE constraint failed')) {
      return res.status(400).json({ 
        message: 'User already exists with this email address' 
      });
    }
    
    if (error.message.includes('database')) {
      return res.status(500).json({ 
        message: 'Database error occurred. Please try again.' 
      });
    }
    
    // Generic error response
    res.status(500).json({ 
      message: 'Registration failed. Please try again.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

app.post('/api/auth/login', [
  body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email'),
  body('password').notEmpty().withMessage('Password is required')
], async (req, res) => {
  try {
    console.log('🔑 Login attempt:', req.body.email);
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('❌ Validation errors:', errors.array());
      return res.status(400).json({ 
        message: 'Invalid email or password',
        errors: errors.array()
      });
    }

    const { email, password } = req.body;

    if (!email || !password) {
      console.log('❌ Missing email or password');
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // Ensure database is connected
    if (!dbManager.isConnected) {
      console.log('🔄 Database not connected, attempting to connect...');
      await dbManager.connect();
    }

    // Find user
    console.log('🔍 Looking up user:', email);
    const user = await dbManager.get('SELECT * FROM users WHERE email = ?', [email]);

    if (!user) {
      console.log('❌ User not found:', email);
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    console.log('✅ User found:', user.id);

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      console.log('❌ Invalid password for user:', email);
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    console.log('✅ Password valid for user:', email);

    // Generate JWT token
    const jwtSecret = process.env.JWT_SECRET || 'fallback_secret_key_12345678901234567890';
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      jwtSecret,
      { expiresIn: '7d' }
    );

    console.log('✅ Login successful for user:', email);

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        category: user.category,
        branch: user.branch,
        domain: user.domain,
        currentGpa: user.current_gpa,
        expectedGpa: user.expected_gpa,
        currentStudyHours: user.current_study_hours,
        expectedStudyHours: user.expected_study_hours,
        currentSelfRating: user.current_self_rating,
        expectedSelfRating: user.expected_self_rating,
        targetDate: user.target_date,
        improvementAreas: user.improvement_areas,
        motivation: user.motivation,
        goalStartDate: user.goal_start_date,
        goalEndDate: user.goal_end_date,
        aiStudyPlan: user.ai_study_plan ? JSON.parse(user.ai_study_plan) : null,
        setupComplete: user.setup_complete
      }
    });
  } catch (error) {
    console.error('❌ Login error:', error);
    res.status(500).json({ 
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

app.get('/api/auth/me', authenticateToken, async (req, res) => {
  try {
    console.log('👤 Fetching user profile for ID:', req.user.userId);

    // Ensure database is connected
    if (!dbManager.isConnected) {
      await dbManager.connect();
    }

    const user = await dbManager.get('SELECT * FROM users WHERE id = ?', [req.user.userId]);

    if (!user) {
      console.log('❌ User not found in database:', req.user.userId);
      return res.status(404).json({ message: 'User not found' });
    }

    console.log('✅ User profile fetched successfully:', user.email);

    res.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        category: user.category,
        branch: user.branch,
        domain: user.domain,
        currentGpa: user.current_gpa,
        expectedGpa: user.expected_gpa,
        currentStudyHours: user.current_study_hours,
        expectedStudyHours: user.expected_study_hours,
        currentSelfRating: user.current_self_rating,
        expectedSelfRating: user.expected_self_rating,
        targetDate: user.target_date,
        improvementAreas: user.improvement_areas,
        motivation: user.motivation,
        goalStartDate: user.goal_start_date,
        goalEndDate: user.goal_end_date,
        aiStudyPlan: user.ai_study_plan ? JSON.parse(user.ai_study_plan) : null,
        setupComplete: user.setup_complete
      }
    });
  } catch (error) {
    console.error('❌ Get user error:', error);
    res.status(500).json({ 
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});






// app.put('/api/auth/update-profile', authenticateToken, async (req, res) => {
//   try {
//     console.log('🔄 Updating profile for user:', req.user.userId);
//     console.log('📊 Update data:', req.body);

//     const {
//       category,
//       branch,
//       domain,
//       currentGpa,
//       expectedGpa,
//       currentStudyHours,
//       expectedStudyHours,
//       currentSelfRating,
//       expectedSelfRating,
//       targetDate,
//       improvementAreas,
//       motivation,
//       goalStartDate,
//       goalEndDate,
//       aiStudyPlan,
//       setupComplete
//     } = req.body;

//     // Ensure database is connected
//     if (!dbManager.isConnected) {
//       await dbManager.connect();
//     }

//     // Fixed SQL query with correct column names (snake_case)
//     await dbManager.run(
//       `UPDATE users SET 
//         category = COALESCE(?, category),
//         branch = COALESCE(?, branch),
//         domain = COALESCE(?, domain),
//         current_gpa = COALESCE(?, current_gpa),
//         expected_gpa = COALESCE(?, expected_gpa),
//         current_study_hours = COALESCE(?, current_study_hours),
//         expected_study_hours = COALESCE(?, expected_study_hours),
//         current_self_rating = COALESCE(?, current_self_rating),
//         expected_self_rating = COALESCE(?, expected_self_rating),
//         target_date = COALESCE(?, target_date),
//         improvement_areas = COALESCE(?, improvement_areas),
//         motivation = COALESCE(?, motivation),
//         goal_start_date = COALESCE(?, goal_start_date),
//         goal_end_date = COALESCE(?, goal_end_date),
//         ai_study_plan = COALESCE(?, ai_study_plan),
//         setup_complete = COALESCE(?, setup_complete),
//         updated_at = CURRENT_TIMESTAMP
//       WHERE id = ?`,
//       [
//         category, branch, domain, currentGpa, expectedGpa,
//         currentStudyHours, expectedStudyHours, currentSelfRating,
//         expectedSelfRating, targetDate, improvementAreas, motivation,
//         goalStartDate, goalEndDate, 
//         aiStudyPlan ? JSON.stringify(aiStudyPlan) : null,
//         setupComplete, req.user.userId
//       ]
//     );

//     console.log('✅ Profile updated successfully');

//     // Get updated user
//     const user = await dbManager.get('SELECT * FROM users WHERE id = ?', [req.user.userId]);

//     res.json({
//       message: 'Profile updated successfully',
//       user: {
//         id: user.id,
//         name: user.name,
//         email: user.email,
//         category: user.category,
//         branch: user.branch,
//         domain: user.domain,
//         currentGpa: user.current_gpa,
//         expectedGpa: user.expected_gpa,
//         currentStudyHours: user.current_study_hours,
//         expectedStudyHours: user.expected_study_hours,
//         currentSelfRating: user.current_self_rating,
//         expectedSelfRating: user.expected_self_rating,
//         targetDate: user.target_date,
//         improvementAreas: user.improvement_areas,
//         motivation: user.motivation,
//         goalStartDate: user.goal_start_date,
//         goalEndDate: user.goal_end_date,
//         aiStudyPlan: user.ai_study_plan ? JSON.parse(user.ai_study_plan) : null,
//         setupComplete: user.setup_complete
//       }
//     });
//   } catch (error) {
//     console.error('❌ Update profile error:', error);
//     res.status(500).json({ 
//       message: 'Internal server error ',
//       error: process.env.NODE_ENV === 'development' ? error.message : undefined
//     });
//   }
// });





app.put('/api/auth/update-profile', authenticateToken, async (req, res) => {
  try {
    console.log('🔄 Updating profile for user:', req.user.userId);
    console.log('📊 Update data:', req.body);

    const {
      category,
      branch,
      domain,
      currentGpa,
      expectedGpa,
      currentStudyHours,
      expectedStudyHours,
      currentSelfRating,
      expectedSelfRating,
      targetDate,
      improvementAreas,
      motivation,
      goalStartDate,
      goalEndDate,
      aiStudyPlan,
      setupComplete
    } = req.body;

    // Optional: Basic validation
    if (!req.user?.userId) {
      return res.status(401).json({ message: 'Unauthorized: Invalid token' });
    }

    // Ensure database is connected
    if (!dbManager.isConnected) {
      await dbManager.connect();
    }

    // Debug: print parameter array
    // const updateParams = [
    //   category,
    //   branch,
    //   domain,
    //   currentGpa,
    //   expectedGpa,
    //   currentStudyHours,
    //   expectedStudyHours,
    //   currentSelfRating,
    //   expectedSelfRating,
    //   targetDate,
    //   improvementAreas,
    //   motivation,
    //   goalStartDate,
    //   goalEndDate,
    //   aiStudyPlan ? JSON.stringify(aiStudyPlan) : null,
    //   setupComplete,
    //   req.user.userId
    // ];

    const updateParams = [
  category ?? null,
  branch ?? null,
  domain ?? null,
  currentGpa ?? null,
  expectedGpa ?? null,
  currentStudyHours ?? null,
  expectedStudyHours ?? null,
  currentSelfRating ?? null,
  expectedSelfRating ?? null,
  targetDate ?? null,
  improvementAreas ?? null,
  motivation ?? null,
  goalStartDate ?? null,
  goalEndDate ?? null,
  aiStudyPlan ? JSON.stringify(aiStudyPlan) : null,
  setupComplete ?? null,
  req.user.userId
];



    console.log('🧾 SQL Params:', updateParams);

    // Run update query
    // await dbManager.run(
    //   `UPDATE users SET 
    //     category = COALESCE(?, category),
    //     branch = COALESCE(?, branch),
    //     domain = COALESCE(?, domain),
    //     current_gpa = COALESCE(?, current_gpa),
    //     expected_gpa = COALESCE(?, expected_gpa),
    //     current_study_hours = COALESCE(?, current_study_hours),
    //     expected_study_hours = COALESCE(?, expected_study_hours),
    //     current_self_rating = COALESCE(?, current_self_rating),
    //     expected_self_rating = COALESCE(?, expected_self_rating),
    //     target_date = COALESCE(?, target_date),
    //     improvement_areas = COALESCE(?, improvement_areas),
    //     motivation = COALESCE(?, motivation),
    //     goal_start_date = COALESCE(?, goal_start_date),
    //     goal_end_date = COALESCE(?, goal_end_date),
    //     ai_study_plan = COALESCE(?, ai_study_plan),
    //     setup_complete = COALESCE(?, setup_complete),
    //     updated_at = CURRENT_TIMESTAMP
    //   WHERE id = ?`,
    //   updateParams
    // );




    await dbManager.run(
  `UPDATE users SET 
    category = COALESCE(?, category),
    branch = COALESCE(?, branch),
    domain = COALESCE(?, domain),
    currentGpa = COALESCE(?, currentGpa),
    expectedGpa = COALESCE(?, expectedGpa),
    currentStudyHours = COALESCE(?, currentStudyHours),
    expectedStudyHours = COALESCE(?, expectedStudyHours),
    currentSelfRating = COALESCE(?, currentSelfRating),
    expectedSelfRating = COALESCE(?, expectedSelfRating),
    targetDate = COALESCE(?, targetDate),
    improvementAreas = COALESCE(?, improvementAreas),
    motivation = COALESCE(?, motivation),
    goalStartDate = COALESCE(?, goalStartDate),
    goalEndDate = COALESCE(?, goalEndDate),
    ai_study_plan = COALESCE(?, ai_study_plan),
    setup_complete = COALESCE(?, setup_complete),
    updated_at = CURRENT_TIMESTAMP
  WHERE id = ?`,
  updateParams
);


    console.log('✅ Profile updated successfully');

    // Fetch updated user
    const user = await dbManager.get('SELECT * FROM users WHERE id = ?', [req.user.userId]);

    res.json({
      message: 'Profile updated successfully',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        category: user.category,
        branch: user.branch,
        domain: user.domain,
        currentGpa: user.current_gpa,
        expectedGpa: user.expected_gpa,
        currentStudyHours: user.current_study_hours,
        expectedStudyHours: user.expected_study_hours,
        currentSelfRating: user.current_self_rating,
        expectedSelfRating: user.expected_self_rating,
        targetDate: user.target_date,
        improvementAreas: user.improvement_areas,
        motivation: user.motivation,
        goalStartDate: user.goal_start_date,
        goalEndDate: user.goal_end_date,
        aiStudyPlan: user.ai_study_plan ? JSON.parse(user.ai_study_plan) : null,
        setupComplete: user.setup_complete
      }
    });

  } catch (error) {
    console.error('❌ Update profile error:', error);
    res.status(500).json({
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});






























// Study Session Tracking Routes
app.post('/api/study-sessions', authenticateToken, async (req, res) => {
  try {
    const { subject, duration, sessionType, notes, goalProgress } = req.body;

    // Ensure database is connected
    if (!dbManager.isConnected) {
      await dbManager.connect();
    }

    const result = await dbManager.run(
      'INSERT INTO study_sessions (user_id, subject, duration, session_type, notes, goal_progress) VALUES (?, ?, ?, ?, ?, ?)',
      [req.user.userId, subject, duration, sessionType || 'focus', notes || '', goalProgress || 0]
    );

    res.json({
      message: 'Study session recorded successfully',
      sessionId: result.lastID
    });
  } catch (error) {
    console.error('❌ Record study session error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Analytics Routes
app.get('/api/analytics/overview', authenticateToken, async (req, res) => {
  try {
    const { timeRange = 'week' } = req.query;
    const userId = req.user.userId;

    // Ensure database is connected
    if (!dbManager.isConnected) {
      await dbManager.connect();
    }

    // Calculate date range
    const now = new Date();
    let startDate;
    
    switch (timeRange) {
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case 'year':
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    }

    // Get total study time
    const totalStudyTime = await dbManager.get(
      'SELECT COALESCE(SUM(duration), 0) as total FROM study_sessions WHERE user_id = ? AND created_at >= ?',
      [userId, startDate.toISOString()]
    );

    // Get daily average
    const daysDiff = Math.ceil((now - startDate) / (1000 * 60 * 60 * 24));
    const dailyAverage = totalStudyTime.total / daysDiff;

    // Get study streak
    const studyStreak = await calculateStudyStreak(userId);

    // Get completed sessions
    const completedSessions = await dbManager.get(
      'SELECT COUNT(*) as count FROM study_sessions WHERE user_id = ? AND created_at >= ?',
      [userId, startDate.toISOString()]
    );

    // Get weekly goal progress
    const user = await dbManager.get('SELECT expected_study_hours FROM users WHERE id = ?', [userId]);
    const weeklyTarget = (user?.expected_study_hours || 5) * 7 * 60; // Convert to minutes
    const weeklyProgress = Math.min((totalStudyTime.total / weeklyTarget) * 100, 100);

    // Calculate improvement rate
    const previousPeriodStart = new Date(startDate.getTime() - (now.getTime() - startDate.getTime()));
    const previousPeriodStudyTime = await dbManager.get(
      'SELECT COALESCE(SUM(duration), 0) as total FROM study_sessions WHERE user_id = ? AND created_at >= ? AND created_at < ?',
      [userId, previousPeriodStart.toISOString(), startDate.toISOString()]
    );

    const improvementRate = previousPeriodStudyTime.total > 0 
      ? Math.round(((totalStudyTime.total - previousPeriodStudyTime.total) / previousPeriodStudyTime.total) * 100)
      : 0;

    res.json({
      totalStudyTime: Math.round(totalStudyTime.total / 60), // Convert to hours
      averageDaily: Math.round(dailyAverage / 60 * 10) / 10, // Convert to hours with 1 decimal
      completedSessions: completedSessions.count,
      streakDays: studyStreak,
      weeklyGoalProgress: Math.round(weeklyProgress),
      improvementRate
    });
  } catch (error) {
    console.error('❌ Analytics overview error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.get('/api/analytics/study-trend', authenticateToken, async (req, res) => {
  try {
    const { timeRange = 'week' } = req.query;
    const userId = req.user.userId;

    // Ensure database is connected
    if (!dbManager.isConnected) {
      await dbManager.connect();
    }

    let days;
    switch (timeRange) {
      case 'week':
        days = 7;
        break;
      case 'month':
        days = 30;
        break;
      case 'year':
        days = 12;
        break;
      default:
        days = 7;
    }

    const studyData = await dbManager.all(`
      SELECT 
        DATE(created_at) as date,
        SUM(duration) as totalMinutes,
        COUNT(*) as sessions
      FROM study_sessions 
      WHERE user_id = ? 
        AND created_at >= datetime('now', '-${days} ${timeRange === 'year' ? 'months' : 'days'}')
      GROUP BY DATE(created_at)
      ORDER BY date ASC
    `, [userId]);

    // Fill in missing dates with zero values
    const result = [];
    const now = new Date();
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now);
      if (timeRange === 'year') {
        date.setMonth(date.getMonth() - i);
      } else {
        date.setDate(date.getDate() - i);
      }
      
      const dateStr = date.toISOString().split('T')[0];
      const existingData = studyData.find(d => d.date === dateStr);
      
      result.push({
        date: dateStr,
        hours: existingData ? Math.round(existingData.totalMinutes / 60 * 10) / 10 : 0,
        sessions: existingData ? existingData.sessions : 0
      });
    }

    res.json(result);
  } catch (error) {
    console.error('❌ Study trend error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.get('/api/analytics/subject-distribution', authenticateToken, async (req, res) => {
  try {
    const { timeRange = 'week' } = req.query;
    const userId = req.user.userId;

    // Ensure database is connected
    if (!dbManager.isConnected) {
      await dbManager.connect();
    }

    const days = timeRange === 'week' ? 7 : timeRange === 'month' ? 30 : 365;

    const subjectData = await dbManager.all(`
      SELECT 
        subject,
        SUM(duration) as totalMinutes,
        COUNT(*) as sessions
      FROM study_sessions 
      WHERE user_id = ? 
        AND created_at >= datetime('now', '-${days} days')
      GROUP BY subject
      ORDER BY totalMinutes DESC
    `, [userId]);

    const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'];

    const result = subjectData.map((item, index) => ({
      subject: item.subject,
      hours: Math.round(item.totalMinutes / 60 * 10) / 10,
      sessions: item.sessions,
      color: colors[index % colors.length]
    }));

    res.json(result);
  } catch (error) {
    console.error('❌ Subject distribution error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.get('/api/analytics/performance-score', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;

    // Ensure database is connected
    if (!dbManager.isConnected) {
      await dbManager.connect();
    }

    // Get weekly performance data for the last 7 weeks
    const performanceData = await dbManager.all(`
      SELECT 
        strftime('%Y-%W', created_at) as week,
        AVG(goal_progress) as avgProgress,
        SUM(duration) as totalMinutes,
        COUNT(*) as sessions
      FROM study_sessions 
      WHERE user_id = ? 
        AND created_at >= datetime('now', '-7 weeks')
      GROUP BY strftime('%Y-%W', created_at)
      ORDER BY week ASC
    `, [userId]);

    // Calculate performance score based on multiple factors
    const result = performanceData.map((item, index) => {
      const consistencyScore = Math.min(item.sessions * 10, 100); // Max 100 for 10+ sessions
      const progressScore = item.avgProgress || 0;
      const volumeScore = Math.min((item.totalMinutes / 60) * 5, 100); // Max 100 for 20+ hours
      
      const overallScore = Math.round((consistencyScore + progressScore + volumeScore) / 3);
      
      return {
        week: `Week ${index + 1}`,
        score: Math.min(overallScore, 100)
      };
    });

    // Fill in missing weeks
    while (result.length < 7) {
      result.unshift({
        week: `Week ${result.length + 1}`,
        score: 0
      });
    }

    res.json(result.slice(-7));
  } catch (error) {
    console.error('❌ Performance score error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Helper function to calculate study streak
async function calculateStudyStreak(userId) {
  try {
    // Ensure database is connected
    if (!dbManager.isConnected) {
      await dbManager.connect();
    }

    const sessions = await dbManager.all(`
      SELECT DATE(created_at) as date
      FROM study_sessions 
      WHERE user_id = ?
      GROUP BY DATE(created_at)
      ORDER BY date DESC
    `, [userId]);

    if (sessions.length === 0) return 0;

    let streak = 0;
    const today = new Date().toISOString().split('T')[0];
    let currentDate = new Date();

    for (const session of sessions) {
      const sessionDate = session.date;
      const expectedDate = currentDate.toISOString().split('T')[0];

      if (sessionDate === expectedDate) {
        streak++;
        currentDate.setDate(currentDate.getDate() - 1);
      } else if (sessionDate === today && streak === 0) {
        // If today has a session, start the streak
        streak++;
        currentDate.setDate(currentDate.getDate() - 1);
      } else {
        break;
      }
    }

    return streak;
  } catch (error) {
    console.error('Error calculating study streak:', error);
    return 0;
  }
}

// Enhanced Mock AI service functions with improved study plan generation
const mockAIService = {
  generateStudyPlan: (userProfile) => {
    console.log('🤖 Generating enhanced study plan for profile:', userProfile);
    
    const category = userProfile.category || 'student';
    const domain = userProfile.domain || userProfile.branch || 'General Studies';
    const currentGpa = userProfile.currentGpa || 7.0;
    const expectedGpa = userProfile.expectedGpa || 8.5;
    const currentHours = userProfile.currentStudyHours || 4;
    const expectedHours = userProfile.expectedStudyHours || 6;
    const currentRating = userProfile.currentSelfRating || 6;
    const expectedRating = userProfile.expectedSelfRating || 8;
    
    // Generate personalized plan based on user data
    const basePlan = [
      {
        id: '1',
        title: 'Morning Review Session',
        description: 'Review previous day\'s concepts and prepare for new topics',
        duration: '30 minutes',
        priority: 'high',
        category: 'Review',
        completed: false
      },
      {
        id: '2',
        title: `Core ${domain} Study`,
        description: `Deep dive into ${domain} areas with focused learning`,
        duration: '2 hours',
        priority: 'high',
        category: 'Study',
        completed: false
      },
      {
        id: '3',
        title: 'Practice Problems',
        description: 'Solve practice questions and work on problem-solving skills',
        duration: '1 hour',
        priority: 'medium',
        category: 'Practice',
        completed: false
      },
      {
        id: '4',
        title: 'Flashcard Review',
        description: 'Review flashcards using spaced repetition technique',
        duration: '20 minutes',
        priority: 'medium',
        category: 'Review',
        completed: false
      },
      {
        id: '5',
        title: 'Note Taking & Organization',
        description: 'Organize and summarize today\'s learning materials',
        duration: '30 minutes',
        priority: 'low',
        category: 'Organization',
        completed: false
      }
    ];

    // Add extra tasks based on user goals
    if (expectedHours > currentHours) {
      basePlan.push({
        id: '6',
        title: 'Extended Study Session',
        description: 'Additional focused study time to reach your target hours',
        duration: `${Math.round((expectedHours - currentHours) * 60)} minutes`,
        priority: 'medium',
        category: 'Study',
        completed: false
      });
    }

    // Add improvement-focused task if GPA gap is significant
    if (expectedGpa > currentGpa + 0.5) {
      basePlan.push({
        id: '7',
        title: 'Performance Improvement Focus',
        description: 'Targeted study on weak areas to improve GPA',
        duration: '45 minutes',
        priority: 'high',
        category: 'Improvement',
        completed: false
      });
    }

    // Add confidence building if self-rating gap is large
    if (expectedRating > currentRating + 2) {
      basePlan.push({
        id: '8',
        title: 'Confidence Building Exercises',
        description: 'Practice easier problems to build confidence and momentum',
        duration: '30 minutes',
        priority: 'medium',
        category: 'Confidence',
        completed: false
      });
    }

    // Add category-specific tasks
    if (category === 'professional') {
      basePlan.push({
        id: '9',
        title: 'Industry Application Study',
        description: 'Study real-world applications and case studies',
        duration: '45 minutes',
        priority: 'medium',
        category: 'Application',
        completed: false
      });
    }

    if (category === 'researcher') {
      basePlan.push({
        id: '10',
        title: 'Research Paper Review',
        description: 'Read and analyze recent research papers in your field',
        duration: '1 hour',
        priority: 'high',
        category: 'Research',
        completed: false
      });
    }

    console.log(`✅ Generated enhanced study plan with ${basePlan.length} items`);
    return basePlan;
  },

  summarizeText: (text, options = {}) => {
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const wordCount = text.split(/\s+/).length;
    
    let summaryLength;
    switch (options.length) {
      case 'short': summaryLength = Math.max(1, Math.floor(sentences.length * 0.25)); break;
      case 'medium': summaryLength = Math.max(1, Math.floor(sentences.length * 0.5)); break;
      case 'long': summaryLength = Math.max(1, Math.floor(sentences.length * 0.75)); break;
      default: summaryLength = Math.max(1, Math.floor(sentences.length * 0.5));
    }
    
    const summarySentences = sentences.slice(0, summaryLength);
    const summary = summarySentences.join('. ') + '.';
    
    const paragraphs = text.split(/\n\s*\n/);
    const keyPoints = paragraphs
      .map(p => p.split(/[.!?]/)[0].trim())
      .filter(point => point.length > 20)
      .slice(0, 5);

    const summaryWordCount = summary.split(/\s+/).length;
    
    return {
      originalText: text,
      summary,
      keyPoints,
      wordCount: {
        original: wordCount,
        summary: summaryWordCount
      },
      readingTime: {
        original: Math.ceil(wordCount / 200),
        summary: Math.ceil(summaryWordCount / 200)
      }
    };
  },

  generateDoubtSolution: (question, context) => {
    return {
      explanation: `This is a comprehensive explanation for your question: "${question}". The solution involves understanding the core concepts and applying them systematically.`,
      steps: [
        "Analyze the question to understand what's being asked",
        "Identify the key concepts and principles involved",
        "Apply the appropriate method or formula",
        "Work through the solution step by step",
        "Verify the answer and check for reasonableness"
      ],
      concepts: ["Problem Analysis", "Conceptual Understanding", "Solution Methodology"],
      examples: [
        "Similar problems you might encounter",
        "Real-world applications of this concept",
        "Practice exercises to reinforce learning"
      ],
      tips: "Practice regularly with similar problems to build confidence and understanding. Break complex problems into smaller, manageable parts.",
      relatedTopics: ["Related Topic 1", "Related Topic 2", "Related Topic 3"],
      difficulty: "intermediate",
      subject: "General"
    };
  }
};

// Enhanced AI routes with better error handling and logging
// app.post('/api/ai/generate-study-plan', authenticateToken, async (req, res) => {
//   try {
//     console.log('📚 Study plan generation request from user:', req.user.userId);
//     console.log('📊 Request body:', req.body);

//     const userProfile = {
//       ...req.body,
//       userId: req.user.userId
//     };

//     // Validate required fields
//     if (!userProfile.category) {
//       userProfile.category = 'student';
//     }

//     const plan = mockAIService.generateStudyPlan(userProfile);
    
//     console.log('✅ Study plan generated successfully:', plan.length, 'items');
    
//     res.json({ 
//       plan,
//       message: 'Study plan generated successfully',
//       userProfile: userProfile
//     });
//   } catch (error) {
//     console.error('❌ Generate study plan error:', error);
//     res.status(500).json({ 
//       message: 'Failed to generate study plan',
//       error: process.env.NODE_ENV === 'development' ? error.message : undefined
//     });
//   }
// });


app.post('/api/ai/generate-study-plan', authenticateToken, async (req, res) => {
  try {
    console.log('📚 Study plan generation request from user:', req.user.userId);

    const userProfile = {
      ...req.body,
      userId: req.user.userId
    };

    const plan = mockAIService.generateStudyPlan(userProfile);

    // ✅ Save AI study plan to DB
    if (!dbManager.isConnected) await dbManager.connect();
    await dbManager.run(
      `UPDATE users SET ai_study_plan = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
      [JSON.stringify(plan), req.user.userId]
    );

    console.log('✅ Study plan generated and saved to DB');

    res.json({
      plan,
      message: 'Study plan generated successfully',
      userProfile: userProfile
    });

  } catch (error) {
    console.error('❌ Generate study plan error:', error);
    res.status(500).json({
      message: 'Failed to generate study plan',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});


app.get('/api/auth/profile', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    if (!dbManager.isConnected) await dbManager.connect();

    const user = await dbManager.get('SELECT * FROM users WHERE id = ?', [userId]);

    if (!user) return res.status(404).json({ message: 'User not found' });

    res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      category: user.category,
      branch: user.branch,
      domain: user.domain,
      currentGpa: user.currentGpa,
      expectedGpa: user.expectedGpa,
      currentStudyHours: user.currentStudyHours,
      expectedStudyHours: user.expectedStudyHours,
      currentSelfRating: user.currentSelfRating,
      expectedSelfRating: user.expectedSelfRating,
      aiStudyPlan: user.ai_study_plan ? JSON.parse(user.ai_study_plan) : [],
      setupComplete: user.setup_complete
    });
  } catch (error) {
    console.error('❌ Profile fetch error:', error);
    res.status(500).json({ message: 'Failed to fetch profile' });
  }
});









app.post('/api/ai/summarize', async (req, res) => {
  try {
    const { text, length, type } = req.body;

    if (!text || text.trim().length === 0) {
      return res.status(400).json({ message: 'Text is required' });
    }

    const result = mockAIService.summarizeText(text, { length, type });
    res.json(result);
  } catch (error) {
    console.error('❌ Summarize error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Doubt solver routes
app.post('/api/doubts/ask', authenticateToken, [
  body('question').trim().isLength({ min: 5 }).withMessage('Question must be at least 5 characters'),
  body('subject').optional().trim(),
  body('context').optional().trim()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: 'Validation failed', errors: errors.array() });
    }

    const { question, subject, context } = req.body;

    // Ensure database is connected
    if (!dbManager.isConnected) {
      await dbManager.connect();
    }

    // Generate AI solution
    const solution = mockAIService.generateDoubtSolution(question, context);

    // Save doubt to database
    const result = await dbManager.run(
      'INSERT INTO doubts (user_id, question, context, subject, solution, status) VALUES (?, ?, ?, ?, ?, ?)',
      [req.user.userId, question, context || '', subject || 'General', JSON.stringify(solution), 'solved']
    );

    res.json({
      id: result.lastID,
      question,
      solution,
      status: 'solved'
    });
  } catch (error) {
    console.error('❌ Ask doubt error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.get('/api/doubts/history', authenticateToken, async (req, res) => {
  try {
    // Ensure database is connected
    if (!dbManager.isConnected) {
      await dbManager.connect();
    }

    const doubts = await dbManager.all(
      'SELECT id, question, subject, status, created_at FROM doubts WHERE user_id = ? ORDER BY created_at DESC LIMIT 50',
      [req.user.userId]
    );

    res.json({ doubts });
  } catch (error) {
    console.error('❌ Get doubts history error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.get('/api/doubts/:id', authenticateToken, async (req, res) => {
  try {
    // Ensure database is connected
    if (!dbManager.isConnected) {
      await dbManager.connect();
    }

    const doubt = await dbManager.get(
      'SELECT * FROM doubts WHERE id = ? AND user_id = ?',
      [req.params.id, req.user.userId]
    );

    if (!doubt) {
      return res.status(404).json({ message: 'Doubt not found' });
    }

    res.json({
      ...doubt,
      solution: JSON.parse(doubt.solution)
    });
  } catch (error) {
    console.error('❌ Get doubt error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Health check
app.get('/api/health', async (req, res) => {
  try {
    const dbHealth = await dbManager.healthCheck();
    res.json({ 
      status: 'OK', 
      timestamp: new Date().toISOString(),
      aiProvider: 'mock',
      database: dbHealth,
      features: {
        authentication: true,
        aiStudyPlans: true,
        textSummarization: true,
        doubtSolver: true,
        analytics: true,
        studyTracking: true,
        emailNotifications: !!transporter
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'ERROR',
      timestamp: new Date().toISOString(),
      error: error.message
    });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('🚨 Server error:', err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Shutting down gracefully...');
  await dbManager.close();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n🛑 Shutting down gracefully...');
  await dbManager.close();
  process.exit(0);
});

// Start server
async function startServer() {
  try {
    await initializeDatabase();
    
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
      console.log(`🤖 AI Provider: mock`);
      console.log(`💾 Database: ${dbManager.dbType}`);
      console.log(`📧 Email notifications: ${transporter ? 'Enabled' : 'Disabled'}`);
      console.log(`📈 Analytics: Enabled`);
      console.log('✅ Server ready for connections!');
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

startServer();