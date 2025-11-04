# Deployment Guide for Campus Connect Backend

This guide will help you deploy the Campus Connect backend to Render.

## Prerequisites

1. A Render account (sign up at https://render.com)
2. A MongoDB database (MongoDB Atlas recommended)
3. Your environment variables ready

## Step 1: Prepare Your MongoDB Database

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a cluster (or use existing)
3. Get your connection string
4. Replace `<password>` and `<dbname>` with your actual credentials

## Step 2: Set Up Environment Variables

You'll need to set these environment variables in Render:

### Required Variables:
- `MONGODB_URI` - Your MongoDB connection string
- `JWT_SECRET` - A strong random string for JWT token signing
- `BACKEND_URL` - Your Render backend URL (e.g., `https://your-backend-name.onrender.com`)
- `FRONTEND_URL` - Your frontend URL (e.g., `https://your-frontend-name.netlify.app`)

### Optional Variables:
- `CORS_ORIGINS` - Comma-separated list of allowed origins (defaults to FRONTEND_URL)
- `EMAIL_USER` - Gmail address for sending emails
- `EMAIL_PASS` - Gmail app-specific password
- `GEMINI_API_KEY` - API key for content moderation
- `PORT` - Port number (defaults to 10000 on Render, already set)

### NODE_ENV
- Set to `production` (automatically set by Render if using render.yaml)

## Step 3: Deploy to Render

### Option A: Using Render Dashboard

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Configure the service:
   - **Name**: `campus-connect-backend`
   - **Environment**: `Node`
   - **Build Command**: `cd backend && npm install`
   - **Start Command**: `cd backend && npm start`
   - **Root Directory**: Leave empty (or set to `backend` if you prefer)
5. Add all environment variables from Step 2
6. Click "Create Web Service"
7. Wait for deployment to complete

### Option B: Using render.yaml (Recommended)

1. Make sure `render.yaml` is in your repository root
2. Go to [Render Dashboard](https://dashboard.render.com)
3. Click "New +" → "Blueprint"
4. Connect your GitHub repository
5. Render will automatically detect `render.yaml` and create the service
6. Add environment variables in the Render dashboard (they're marked as `sync: false` for security)

## Step 4: Configure Environment Variables in Render

After creating the service, go to the "Environment" tab and add:

1. **MONGODB_URI**: Your MongoDB connection string
2. **JWT_SECRET**: Generate a strong secret (you can use `openssl rand -base64 32`)
3. **BACKEND_URL**: Your Render service URL (e.g., `https://campus-connect-backend.onrender.com`)
4. **FRONTEND_URL**: Your frontend URL (e.g., `https://campus-connect-frontend.netlify.app`)
5. **CORS_ORIGINS** (optional): Add your frontend URL and any other allowed origins
6. **EMAIL_USER** (optional): Your Gmail address
7. **EMAIL_PASS** (optional): Gmail app-specific password
8. **GEMINI_API_KEY** (optional): Your Gemini API key

## Step 5: Verify Deployment

1. Once deployed, your backend will be available at: `https://your-service-name.onrender.com`
2. Test the health endpoint: `https://your-service-name.onrender.com/api/health` (if you add one)
3. Check the logs in Render dashboard for any errors

## Important Notes

### File Uploads
- **Important**: Render's free tier has an ephemeral filesystem, meaning uploaded files will be lost when the service restarts.
- For production, consider using:
  - **AWS S3** or **Cloudinary** for file storage
  - **Render Disk** (paid feature) for persistent storage

### Auto-Deploy
- Render automatically deploys when you push to your main branch
- You can disable this in the service settings

### Environment Variables
- Never commit `.env` files to Git
- Use Render's environment variable management for production secrets

### CORS Configuration
- Make sure `FRONTEND_URL` matches your actual frontend deployment URL
- Add multiple origins in `CORS_ORIGINS` if needed (comma-separated)

## Troubleshooting

### Service Won't Start
- Check logs in Render dashboard
- Verify all required environment variables are set
- Ensure `MONGODB_URI` is correct and accessible

### CORS Errors
- Verify `FRONTEND_URL` and `CORS_ORIGINS` are set correctly
- Check that your frontend URL matches exactly (including https/http)

### Database Connection Issues
- Verify MongoDB Atlas IP whitelist includes `0.0.0.0/0` (all IPs)
- Check MongoDB connection string is correct
- Ensure database user has proper permissions

### File Upload Issues
- Remember that files are ephemeral on Render free tier
- Consider implementing cloud storage for production

## Next Steps

After deploying the backend:
1. Update your frontend to use the new backend URL
2. Deploy frontend to Netlify (see frontend deployment guide)
3. Test all functionality end-to-end

## Support

For issues specific to:
- **Render**: Check [Render Documentation](https://render.com/docs)
- **Application**: Check application logs in Render dashboard

