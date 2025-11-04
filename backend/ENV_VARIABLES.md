# Environment Variables Reference

Copy this file to `.env` in the backend directory and fill in your values.

```env
# Server Configuration
PORT=8080
NODE_ENV=development

# MongoDB Configuration
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database?retryWrites=true&w=majority

# JWT Secret (use a strong random string in production)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Backend URL (for production, set this to your Render backend URL)
# Example: https://your-backend-name.onrender.com
BACKEND_URL=http://localhost:8080

# Frontend URL (for CORS and email links)
# Example: https://your-frontend-name.netlify.app
FRONTEND_URL=http://localhost:5173

# CORS Origins (comma-separated list, optional)
# If not set, defaults to FRONTEND_URL and localhost
# Example: https://your-frontend.netlify.app,https://your-frontend.vercel.app
CORS_ORIGINS=

# Email Configuration (for password reset emails)
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-specific-password

# Gemini API Key (for content moderation)
GEMINI_API_KEY=your-gemini-api-key
```

## Required for Production

When deploying to Render, you MUST set these environment variables:

1. **MONGODB_URI** - Your MongoDB connection string
2. **JWT_SECRET** - A strong random string (use `openssl rand -base64 32` to generate)
3. **BACKEND_URL** - Your Render service URL (e.g., `https://your-backend-name.onrender.com`)
4. **FRONTEND_URL** - Your frontend URL (e.g., `https://your-frontend-name.netlify.app`)

## Optional

- **CORS_ORIGINS** - Additional allowed origins (comma-separated)
- **EMAIL_USER** - Gmail address for sending emails
- **EMAIL_PASS** - Gmail app-specific password
- **GEMINI_API_KEY** - For content moderation features

## Generating JWT Secret

On Linux/Mac:
```bash
openssl rand -base64 32
```

On Windows (PowerShell):
```powershell
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Minimum 0 -Maximum 256 }))
```

## Gmail App Password

To get a Gmail app password:
1. Go to your Google Account settings
2. Security → 2-Step Verification → App passwords
3. Generate a new app password for "Mail"
4. Use this password in `EMAIL_PASS`

