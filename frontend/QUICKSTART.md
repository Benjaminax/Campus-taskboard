# Quick Start Guide

## 🎯 Get Started in 5 Minutes

### Step 1: Start Backend
```bash
cd backend
npm install
npm start
```
Backend runs at: `http://localhost:3001`

### Step 2: Start Frontend
```bash
cd frontend
# Option A: Using Python
python -m http.server 8000

# Option B: Using Node
npx http-server
```
Frontend runs at: `http://localhost:8000`

### Step 3: Open Browser
Navigate to: `http://localhost:8000`

### Step 4: Create Account
- Click "Don't have an account? Register here"
- Fill in name, email, password
- Click "Create Account"

### Step 5: Login
- Use your credentials to login
- You'll see the dashboard

### Step 6: Try Features

#### Create a Team
1. Click "Teams" menu
2. Click "+ Create Team"
3. Enter team name and description
4. Click "Create Team"

#### Create a Task
1. Click "Tasks" menu
2. Click "+ Create Task"
3. Select team
4. Fill task details
5. Click "Create Task"

#### View Dashboard
- Click "Dashboard"
- See your stats and recent tasks

#### Browse Teams
1. Click "Teams" menu
2. Click "Browse Teams" tab
3. Join any available team

## 🔧 Configuration

### Backend API URL
If your backend is on a different URL, update `script.js`:
```javascript
const API_URL = 'your-backend-url/api';
```

### Test Credentials
After registration, use your credentials to login:
- Email: your@email.com
- Password: your-password

## 📱 Features

### Authentication ✅
- Register new accounts
- Secure login
- Profile management

### Teams ✅
- Create teams
- Join teams
- View team members
- Browse all teams

### Tasks ✅
- Create tasks
- Assign to members
- Update status (Pending, In Progress, Completed)
- Set due dates
- Delete tasks

### Dashboard ✅
- View task statistics
- See your teams
- Track assignments
- Monitor progress

## 🎨 Dark Theme

The application features a beautiful dark theme:
- Easy on the eyes
- Professional appearance
- Smooth animations
- Responsive design

## 🐛 Common Issues

### Backend won't start
```
Error: connect ECONNREFUSED
```
**Solution**: Make sure PostgreSQL is running

### Frontend can't connect to API
```
Error: Failed to fetch
```
**Solution**: Check API_URL in script.js and ensure backend is running

### Tasks not showing
**Solution**: Make sure you've joined a team first

## 📚 Documentation

- `README.md` - Full project documentation
- `DEPLOYMENT.md` - Deployment instructions
- `API_INTEGRATION.md` - API endpoint reference

## 🚀 Deploy to Production

1. **Backend**: Deploy to Render (see DEPLOYMENT.md)
2. **Frontend**: Deploy to GitHub Pages (see DEPLOYMENT.md)
3. **Update API URL**: Point frontend to production backend

## 🆘 Need Help?

1. Check browser console for errors (F12)
2. Review DEPLOYMENT.md for setup issues
3. Check API_INTEGRATION.md for endpoint details
4. Verify backend is running: `curl http://localhost:3001/health`

## ✨ Tips

- Use unique team names
- Assign tasks for better tracking
- Set realistic due dates
- Update task status as you work
- Join multiple teams to collaborate

## 🎓 Academic Submission

Remember to include:
- ✅ GitHub links to both repos
- ✅ Deployment links (Render + GitHub Pages)
- ✅ Login credentials for testing
- ✅ Feature checklist
- ✅ README with all details

---

**Ready to start?** Open two terminals and run:
```bash
# Terminal 1
cd backend && npm start

# Terminal 2
cd frontend && python -m http.server 8000
```

Then open `http://localhost:8000` in your browser!
