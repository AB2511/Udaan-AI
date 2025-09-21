# ⚡ Udaan AI - Quick Start Guide

> **Get your demo running in 5 minutes!**

## 🚀 One-Command Setup

```bash
# Clone and setup everything
git clone <repository-url>
cd udaan-ai
npm run demo:setup
```

## 🔧 Manual Setup (if needed)

### 1. Prerequisites Check
```bash
node --version  # Should be 18+
npm --version   # Should be 8+
```

### 2. Install Dependencies
```bash
npm install
cd frontend && npm install
cd ../backend && npm install
```

### 3. Environment Configuration

**Backend (.env):**
```bash
cd backend
cp .env.example .env
```

Edit `backend/.env`:
```env
MONGODB_URI=mongodb://localhost:27017/udaan-ai
JWT_SECRET=your-secret-key
GOOGLE_CLOUD_PROJECT_ID=your-project-id
GOOGLE_APPLICATION_CREDENTIALS=path/to/service-account.json
```

**Frontend (.env):**
```bash
cd frontend
cp .env.example .env
```

Edit `frontend/.env`:
```env
VITE_API_URL=http://localhost:3000/api
```

## 🎯 Start Demo

```bash
# Start both frontend and backend
npm run demo:start

# Or start manually:
# Terminal 1: cd backend && npm run dev
# Terminal 2: cd frontend && npm run dev
```

## 🌐 Access URLs

- **Frontend:** http://localhost:5173
- **Backend:** http://localhost:3000
- **Health Check:** http://localhost:3000/api/health

## 🎬 Demo Flow

1. **Register** → Quick signup with email/password
2. **Upload Resume** → Drag & drop PDF/DOC file
3. **AI Analysis** → Watch Vertex AI process the content
4. **View Results** → Skills, gaps, and job recommendations
5. **Optional Interview** → AI-powered mock interview

## 🔍 Verify Setup

```bash
# Check if everything is working
npm run demo:check

# Test health endpoint
curl http://localhost:3000/api/health
```

## 🚨 Quick Fixes

**Port already in use:**
```bash
# Kill processes on ports 3000 and 5173
npx kill-port 3000 5173
```

**MongoDB not running:**
```bash
# Start MongoDB locally
mongod

# Or use MongoDB Atlas connection string
```

**Google Cloud not configured:**
- Create Google Cloud project
- Enable Vertex AI API
- Create service account
- Download JSON key
- Update .env file

## 📱 Mobile Testing

The demo is fully responsive. Test on:
- Desktop browsers (Chrome, Firefox, Safari, Edge)
- Mobile devices (iOS Safari, Android Chrome)
- Tablet devices

## 🎯 Demo Tips

1. **Have resume files ready** (PDF, DOC, DOCX)
2. **Test the full flow** before presenting
3. **Check internet connection** for AI services
4. **Prepare backup plan** if AI fails
5. **Practice the demo script** (3-4 minutes)

## 📞 Need Help?

1. Check `DEMO_CHECKLIST.md` for detailed troubleshooting
2. Review `DEPLOYMENT.md` for production setup
3. Test with fallback data if AI services fail
4. Use health check endpoint to verify services

---

**🎯 Ready to demo in 5 minutes!** 

```bash
npm run demo:setup && npm run demo:start
```

Then open http://localhost:5173 and start your presentation! 🚀