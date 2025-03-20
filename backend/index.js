//mongodb+srv://udaymore742:campus742@cluster0.owa1u.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0

const express = require('express');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
require('dotenv').config();
const http = require('http');
const socketService = require('./services/socketService');

const User = require('./models/User');
const auth = require('./middleware/auth');
const upload = require('./middleware/upload');
const collegeRoutes = require('./routes/collegeRoutes');
const enrollmentRoutes = require('./routes/enrollment');
const questionRoutes = require('./routes/questions');
const answerRoutes = require('./routes/answers');

const app = express();

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
const profilesDir = path.join(uploadsDir, 'profiles');
const collegesDir = path.join(uploadsDir, 'colleges');

[uploadsDir, profilesDir, collegesDir].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(cors({
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
  credentials: true
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
mongoose.connect(process.env.MONGODB_URI, {
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
app.post('/api/register', async (req, res) => {
  try {
    const { email, password, name, role, department, currentYear, passoutYear, position, grade } = req.body;
    
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
    if (role === 'student' && (!department || !currentYear || !passoutYear)) {
      return res.status(400).json({ 
        message: 'Missing required student fields',
        required: ['department', 'currentYear', 'passoutYear']
      });
    }

    if (role === 'faculty' && !position) {
      return res.status(400).json({ 
        message: 'Missing required faculty field',
        required: ['position']
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
        currentYear: parseInt(currentYear), 
        passoutYear: parseInt(passoutYear)
      }),
      ...(role === 'faculty' && { position }),
      ...(role === 'visitor' && { grade })
    };

    const user = new User(userData);
    await user.save();

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '24h' });
    res.cookie('token', token, { 
      httpOnly: true, 
      maxAge: 24 * 60 * 60 * 1000,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict'
    });
    
    res.status(201).json({ 
      message: 'User registered successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        profilePicture: user.profilePicture
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ 
        message: 'Validation error', 
        errors: Object.values(error.errors).map(err => err.message)
      });
    }
    res.status(500).json({ 
      message: 'Error registering user',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
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
      isAdmin: user.isAdmin
    }, process.env.JWT_SECRET, { expiresIn: '24h' });

    res.cookie('token', token, { 
      httpOnly: true, 
      maxAge: 24 * 60 * 60 * 1000,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict'
    });
    
    res.json({ 
      message: 'Logged in successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isAdmin: user.isAdmin,
        profilePicture: user.profilePicture ? `http://localhost:8080${user.profilePicture}` : ''
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Error logging in' });
  }
});

app.post('/api/logout', auth, (req, res) => {
  res.clearCookie('token');
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
      userData.profilePicture = `http://localhost:8080${userData.profilePicture}`;
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
      userData.profilePicture = `http://localhost:8080${userData.profilePicture}`;
    }

    res.json(userData);
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ message: 'Error updating profile' });
  }
});

// Check auth status
app.get('/api/auth/status', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password');
    if (!user) {
      return res.status(401).json({ authenticated: false });
    }
    res.json({
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
    res.status(401).json({ authenticated: false });
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
        userData.profilePicture = `http://localhost:8080${userData.profilePicture}`;
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
socketService.initializeSocket(server);

// Update the server listen call
server.listen(process.env.PORT || 8080, () => {
  console.log(`Server is running on port ${process.env.PORT || 8080}`);
});