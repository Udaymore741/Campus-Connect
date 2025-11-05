//mongodb+srv://udaymore742:campus742@cluster0.owa1u.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0

import express from 'express';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { config } from 'dotenv';
import http from 'http';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

import { initializeSocket } from './services/socketService.js';
import User from './models/User.js';
import { auth } from './middleware/auth.js';
import upload from './middleware/upload.js';
import { errorHandler } from './utils/errorHandler.js';
import { normalizeUrl, getFrontendUrl } from './utils/urlHelper.js';
import collegeRoutes from './routes/collegeRoutes.js';
import enrollmentRoutes from './routes/enrollment.js';
import questionRoutes from './routes/questions.js';
import answerRoutes from './routes/answers.js';
import adminRoutes from './routes/admin.js';
import authRoutes from './routes/auth.js';
import profileRoutes from './routes/profile.js';
import userRoutes from './routes/user.js';
import reportRoutes from './routes/reportRoutes.js';

// Load environment variables from .env file
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
config({ path: path.join(__dirname, '.env') });

const app = express();
// Behind Render/Vercel proxies, trust proxy so secure cookies work
app.set('trust proxy', 1);

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
const profilesDir = path.join(uploadsDir, 'profiles');
const collegesDir = path.join(uploadsDir, 'colleges');
const verificationDir = path.join(uploadsDir, 'verification');

[uploadsDir, profilesDir, collegesDir, verificationDir].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Middleware
app.use(express.json());
app.use(cookieParser());

// Configure CORS based on environment
const frontendUrl = getFrontendUrl();
const allowedOrigins = process.env.CORS_ORIGINS 
  ? process.env.CORS_ORIGINS.split(',').map(origin => origin.trim())
  : [
      frontendUrl,
      'http://localhost:5173',
      'http://127.0.0.1:5173',
      'http://localhost:3000'
    ];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like server-to-server, mobile apps, or curl requests)
    if (!origin) {
      return callback(null, true);
    }
    
    // In development, allow all origins for easier testing
    if (process.env.NODE_ENV === 'development') {
      return callback(null, true);
    }
    
    // In production, only allow origins from the allowed list or trusted hosts
    const isExplicitlyAllowed = allowedOrigins.indexOf(origin) !== -1;
    const isTrustedHost = /https?:\/\/([a-zA-Z0-9-]+\.)*netlify\.app$/.test(origin);
    if (isExplicitlyAllowed || isTrustedHost) {
      callback(null, true);
    } else {
      console.warn(`CORS: Blocked request from origin: ${origin}`);
      callback(new Error(`CORS: Origin ${origin} not allowed`));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
  exposedHeaders: ['Set-Cookie']
}));

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads'), {
  setHeaders: (res, path) => {
    res.set('Cross-Origin-Resource-Policy', 'cross-origin');
  }
}));

// Use college routes
app.use('/api/colleges', collegeRoutes);

// Use enrollment routes
app.use('/api/enrollment', enrollmentRoutes);

// Use question and answer routes
app.use('/api/questions', questionRoutes);
app.use('/api/answers', answerRoutes);

// Use admin routes
app.use('/api/admin', adminRoutes);

// Use auth routes
app.use('/api/auth', authRoutes);

// Use profile routes
app.use('/api/profile', profileRoutes);

// Use user routes
app.use('/api/user', userRoutes);

// Use report routes
app.use('/api/reports', reportRoutes);

// Error handling middleware (should be last)
app.use(errorHandler);

// Create admin user if it doesn't exist
const createAdminUser = async () => {
  try {
    const adminEmail = 'admin@collegial.com';
    const existingAdmin = await User.findOne({ email: adminEmail });
    
    if (!existingAdmin) {
      const adminUser = new User({
        name: 'Admin',
        email: adminEmail,
        password: 'admin123',
        role: 'admin',
        isAdmin: true
      });
      
      await adminUser.save();
      console.log('Admin user created successfully');
    }
  } catch (error) {
    console.error('Error creating admin user:', error);
  }
};

// Connect to MongoDB
mongoose.set('strictQuery', false);
mongoose.connect(process.env.MONGODB_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(async () => {
  console.log('Connected to MongoDB');
  await createAdminUser();
  // Drop the username index if it exists
  try {
    const collections = await mongoose.connection.db.collections();
    const usersCollection = collections.find(c => c.collectionName === 'users');
    if (usersCollection) {
      await usersCollection.dropIndex('username_1');
      console.log('Dropped username index');
    }
  } catch (error) {
    // Ignore if index doesn't exist
    if (!error.message.includes('index not found')) {
      console.error('Error dropping index:', error);
    }
  }
})
.catch(err => {
  console.error('MongoDB connection error:', err);
  // Don't exit the process, just log the error
  console.error('Failed to connect to MongoDB. Please check your connection string and try again.');
});

// Handle MongoDB connection events
mongoose.connection.on('error', err => {
  console.error('MongoDB connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('MongoDB disconnected');
});

// Add process error handlers
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  // Don't exit the process
});

process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err);
  // Don't exit the process
});

// Auth Routes
app.post('/api/register', upload.fields([
  { name: 'studentIdCard', maxCount: 1 },
  { name: 'facultyIdCard', maxCount: 1 }
]), async (req, res) => {
  try {
    const { email, password, name, role, department, degree, year, passoutYear, position, grade, linkedinProfile, aictcNumber } = req.body;
    
    // Validate required fields
    if (!email || !password || !name || !role) {
      return res.status(400).json({ 
        message: 'Missing required fields',
        required: ['email', 'password', 'name', 'role']
      });
    }

    // Prevent creation of admin users through regular registration
    if (role === 'admin') {
      return res.status(403).json({ message: 'Cannot create admin users through registration' });
    }

    // Validate role-specific fields
    if (role === 'student') {
      if (!department || !degree || !year || !passoutYear || !linkedinProfile || !req.files?.studentIdCard) {
        return res.status(400).json({ 
          message: 'Missing required student fields',
          required: ['department', 'degree', 'year', 'passoutYear', 'linkedinProfile', 'studentIdCard']
        });
      }
    }

    if (role === 'faculty' && (!position || !aictcNumber || !req.files?.facultyIdCard)) {
      return res.status(400).json({ 
        message: 'Missing required faculty fields',
        required: ['position', 'aictcNumber', 'facultyIdCard']
      });
    }

    if (role === 'visitor' && !grade) {
      return res.status(400).json({ 
        message: 'Missing required visitor field',
        required: ['grade']
      });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    // Create user with validated data
    const userData = {
      email,
      password,
      name,
      role,
      ...(role === 'student' && { 
        department, 
        degree,
        year: parseInt(year), 
        passoutYear: parseInt(passoutYear),
        linkedinProfile,
        studentIdCard: req.files.studentIdCard[0].path
      }),
      ...(role === 'faculty' && { 
        position,
        aictcNumber,
        facultyIdCard: req.files.facultyIdCard[0].path
      }),
      ...(role === 'visitor' && { grade })
    };

    const user = new User(userData);
    await user.save();

    // Generate token
    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error during registration',
      error: error.message 
    });
  }
});

app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ 
      userId: user._id,
      role: user.role,
      isAdmin: user.role === 'admin'
    }, process.env.JWT_SECRET, { expiresIn: '24h' });

    res.cookie('token', token, { 
      httpOnly: true, 
      maxAge: 24 * 60 * 60 * 1000,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
    });
    
    res.json({ 
      message: 'Logged in successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isAdmin: user.role === 'admin',
        profilePicture: user.profilePicture ? normalizeUrl(user.profilePicture) : ''
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Error logging in' });
  }
});

app.post('/api/logout', auth, (req, res) => {
  res.clearCookie('token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
  });
  res.json({ message: 'Logged out successfully' });
});

// Profile Routes
app.get('/api/profile', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Add full URL to profile picture
    const userData = user.toObject();
    if (userData.profilePicture) {
      userData.profilePicture = normalizeUrl(userData.profilePicture);
    }
    
    res.json(userData);
  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({ message: 'Error fetching profile' });
  }
});

app.patch('/api/profile', auth, upload.single('profilePicture'), async (req, res) => {
  try {
    const updates = { ...req.body };
    
    // If a new profile picture was uploaded
    if (req.file) {
      updates.profilePicture = `/uploads/profiles/${req.file.filename}`;
    }

    // Remove undefined or empty fields
    Object.keys(updates).forEach(key => {
      if (updates[key] === undefined || updates[key] === '') {
        delete updates[key];
      }
    });

    const user = await User.findByIdAndUpdate(
      req.userId,
      { $set: updates },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Add full URL to profile picture in response
    const userData = user.toObject();
    if (userData.profilePicture) {
      userData.profilePicture = normalizeUrl(userData.profilePicture);
    }

    res.json(userData);
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ message: 'Error updating profile' });
  }
});

// Check auth status (gracefully handle unauthenticated without 401)
app.get('/api/auth/status', async (req, res) => {
  try {
    const token = req.cookies?.token;
    if (!token) {
      return res.status(200).json({ authenticated: false });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (e) {
      return res.status(200).json({ authenticated: false });
    }

    const user = await User.findById(decoded.userId).select('-password');
    if (!user) {
      return res.status(200).json({ authenticated: false });
    }

    return res.json({
      authenticated: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        profilePicture: user.profilePicture
      }
    });
  } catch (error) {
    return res.status(200).json({ authenticated: false });
  }
});

// Get all users (admin only)
app.get('/api/users', auth, async (req, res) => {
  try {
    if (!req.user) {
      console.error('User not found in request');
      return res.status(401).json({ message: 'User not found' });
    }

    if (!req.user.isAdmin) {
      console.error('User is not admin:', req.user.role);
      return res.status(403).json({ message: 'Access denied. Admin only.' });
    }

    const users = await User.find({}, '-password');
    
    // Add full URL to profile pictures
    const usersWithFullUrls = users.map(user => {
      const userData = user.toObject();
      if (userData.profilePicture) {
        userData.profilePicture = normalizeUrl(userData.profilePicture);
      }
      return userData;
    });

    res.json(usersWithFullUrls);
  } catch (error) {
    console.error('Error in /api/users endpoint:', error);
    res.status(500).json({ 
      message: 'Error fetching users',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Create HTTP server
const server = http.createServer(app);

// Initialize Socket.IO
initializeSocket(server);

// Update the server listen call
server.listen(process.env.PORT || 8080, () => {
  console.log(`Server is running on port ${process.env.PORT || 8080}`);
});