# Deployment Guide

## 📦 Quick Deployment Steps

### 1. Backend Deployment (Render)

#### Prerequisites
- Render account (https://render.com)
- GitHub repository with backend code

#### Steps:

1. **Push code to GitHub**
   ```bash
   git add .
   git commit -m "Initial backend commit"
   git push origin main
   ```

2. **Create Render Web Service**
   - Go to render.com and sign in
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Choose the backend repository

3. **Configure Environment**
   - **Name**: campus-taskboard-backend
   - **Region**: Choose closest to your location
   - **Branch**: main
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: Free (or paid if needed)

4. **Add Environment Variables**
   In Render dashboard, go to Environment:
   ```
   NODE_ENV=production
   PORT=3001
   DATABASE_URL=postgresql://[user]:[password]@[host]:[port]/[database]
   JWT_SECRET=[generate-a-strong-secret-key]
   FRONTEND_URL=https://yourusername.github.io/campus-taskboard-frontend
   ```

5. **Create PostgreSQL Database**
   - In Render, click "New +" → "PostgreSQL"
   - Name: campus-taskboard-db
   - Region: Same as web service
   - Copy the connection string to DATABASE_URL

6. **Deploy**
   - Render will automatically deploy when you push to GitHub
   - Wait for deployment to complete
   - Note your backend URL: `https://campus-taskboard-backend.onrender.com`

### 2. Frontend Deployment (GitHub Pages)

#### Prerequisites
- GitHub account
- GitHub repository named `campus-taskboard-frontend`

#### Steps:

1. **Update API URL**
   In `frontend/script.js`, update:
   ```javascript
   const API_URL = 'https://campus-taskboard-backend.onrender.com/api';
   ```

2. **Push to GitHub**
   ```bash
   cd frontend
   git add .
   git commit -m "Add frontend"
   git push origin main
   ```

3. **Enable GitHub Pages**
   - Go to GitHub repository settings
   - Scroll to "GitHub Pages"
   - Source: Deploy from branch
   - Branch: main
   - Folder: / (root)
   - Click Save

4. **Access Your App**
   Your frontend will be available at:
   ```
   https://yourusername.github.io/campus-taskboard-frontend
   ```

## 🔧 Configuration Checklist

### Backend Configuration
- [ ] Database created and running
- [ ] JWT_SECRET generated
- [ ] FRONTEND_URL matches your GitHub Pages URL
- [ ] CORS configuration updated
- [ ] Environment variables set
- [ ] Database migrations run

### Frontend Configuration
- [ ] API_URL updated to backend URL
- [ ] index.html loads correctly
- [ ] Styles load properly
- [ ] JavaScript functions work
- [ ] Local storage working

## 📋 Environment Variables

### Backend (.env file)
```
NODE_ENV=production
PORT=3001
DATABASE_URL=postgresql://user:password@host:5432/database
JWT_SECRET=your-secret-key-min-32-characters
FRONTEND_URL=https://yourusername.github.io/campus-taskboard-frontend
```

### Frontend (In script.js)
```javascript
const API_URL = 'https://campus-taskboard-backend.onrender.com/api';
```

## 🚀 Deployment Verification

### Test Backend
```bash
curl https://campus-taskboard-backend.onrender.com/health
```

Expected response:
```json
{
  "success": true,
  "message": "Campus Taskboard API is running!"
}
```

### Test Frontend
1. Open frontend URL in browser
2. Try to register a new account
3. Login with credentials
4. Create a team
5. Create a task

## 🐛 Troubleshooting Deployment

### Backend won't start on Render
- Check build logs for errors
- Verify DATABASE_URL is correct
- Ensure all environment variables are set
- Check Node version compatibility

### Frontend can't connect to API
- Verify backend URL is correct
- Check CORS configuration
- Ensure backend is running
- Check browser console for errors

### Database connection fails
- Verify DATABASE_URL format
- Check PostgreSQL is accessible
- Ensure firewall allows connections
- Verify database exists

## 📊 Monitoring

### Backend Health
- Render provides deployment logs
- Check application error logs
- Monitor database performance

### Frontend Performance
- Check GitHub Pages deployment status
- Monitor browser console for errors
- Test on different devices/browsers

## 🔄 Updates and Maintenance

### Update Backend
```bash
cd backend
git add .
git commit -m "Update changes"
git push origin main
# Render will auto-deploy
```

### Update Frontend
```bash
cd frontend
git add .
git commit -m "Update changes"
git push origin main
# GitHub Pages will auto-update
```

## 📞 Support Resources

- **Render Documentation**: https://render.com/docs
- **GitHub Pages Help**: https://docs.github.com/en/pages
- **Node.js Documentation**: https://nodejs.org/docs
- **PostgreSQL Documentation**: https://www.postgresql.org/docs

---

**Last Updated**: December 2025
