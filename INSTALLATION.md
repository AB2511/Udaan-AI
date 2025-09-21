# 🚀 Udaan AI Platform - Complete Installation Guide

## Current Project Status

✅ **Project Structure**: Complete
✅ **Frontend Dependencies**: Configured in package.json
✅ **Backend Dependencies**: Configured in package.json  
✅ **UI Components**: Implemented (Navbar, ProtectedRoute, LoadingSpinner)
✅ **TailwindCSS**: Configured
✅ **Build Configuration**: Ready

## Required Dependencies Status

### Frontend Dependencies ✅
- ✅ react (^18.2.0)
- ✅ react-dom (^18.2.0) 
- ✅ react-router-dom (^6.8.1)
- ✅ axios (^1.3.4)
- ✅ tailwindcss (^3.2.7)
- ✅ postcss (^8.4.21)
- ✅ autoprefixer (^10.4.14)
- ✅ vite (^4.3.2) - dev dependency

### Backend Dependencies ✅
- ✅ express (^4.18.2)
- ✅ mongoose (^7.0.3)
- ✅ cors (^2.8.5)
- ✅ dotenv (^16.0.3)
- ✅ bcryptjs (^2.4.3)
- ✅ jsonwebtoken (^9.0.0)
- ✅ nodemon (^2.0.22) - dev dependency

## Installation Steps

### Step 1: Install Node.js LTS (>=18)

**Option A: Download from Official Website (Recommended)**
1. Go to https://nodejs.org/
2. Download the LTS version (18.x or higher)
3. Run the installer
4. Restart your terminal

**Option B: Using winget (Windows 10/11)**
```cmd
winget install OpenJS.NodeJS.LTS
```

**Option C: Using Chocolatey**
```powershell
choco install nodejs-lts
```

**Option D: Run our automated installer**
```cmd
# Run the batch file we created
setup-environment.bat
```

### Step 2: Verify Installation
```cmd
node --version
npm --version
```
Should show Node.js >=18.0.0 and npm >=8.0.0

### Step 3: Install Project Dependencies

**Quick Install (All at once):**
```cmd
npm run install:all
```

**Manual Install:**
```cmd
# Root dependencies
npm install

# Frontend dependencies  
cd frontend
npm install
cd ..

# Backend dependencies
cd backend
npm install
cd ..
```

### Step 4: Environment Configuration

1. Copy the backend environment template:
```cmd
cd backend
copy .env.example .env
```

2. Edit `backend/.env` with your settings:
```env
# Database
MONGODB_URI=mongodb://localhost:27017/udaan-ai
# Or use MongoDB Atlas: mongodb+srv://username:password@cluster.mongodb.net/udaan-ai

# Authentication
JWT_SECRET=your-super-secret-jwt-key-here

# Server
PORT=3000
NODE_ENV=development
```

### Step 5: Start Development

**Start both frontend and backend:**
```cmd
npm run dev
```

**Or start individually:**
```cmd
# Frontend only (http://localhost:5173)
npm run dev:frontend

# Backend only (http://localhost:3000)  
npm run dev:backend
```

## Project Scripts

### Root Level Commands
```json
{
  "install:all": "Install all dependencies",
  "dev": "Start both frontend and backend",
  "dev:frontend": "Start frontend only", 
  "dev:backend": "Start backend only",
  "build": "Build frontend for production",
  "start": "Start backend in production mode",
  "test": "Run all tests"
}
```

### Frontend Commands (in frontend/ directory)
```json
{
  "dev": "Start Vite dev server",
  "build": "Build for production", 
  "preview": "Preview production build",
  "lint": "Run ESLint"
}
```

### Backend Commands (in backend/ directory)
```json
{
  "dev": "Start with nodemon (auto-restart)",
  "start": "Start in production mode",
  "test": "Run Jest tests"
}
```

## Troubleshooting

### Node.js Installation Issues
- **"node is not recognized"**: Node.js not in PATH, restart terminal
- **Permission errors**: Run terminal as Administrator
- **Old version**: Uninstall old Node.js first, then install LTS

### Dependency Installation Issues
- **npm ERR! EACCES**: Run `npm config set prefix ~/.npm-global`
- **Network issues**: Try `npm install --registry https://registry.npmjs.org/`
- **Cache issues**: Run `npm cache clean --force`

### Development Server Issues
- **Port 5173 in use**: Change port in `frontend/vite.config.js`
- **Port 3000 in use**: Change PORT in `backend/.env`
- **CORS errors**: Check backend CORS configuration

### Database Issues
- **MongoDB connection**: Verify MONGODB_URI in `.env`
- **Local MongoDB**: Install MongoDB Community Edition
- **Atlas connection**: Check network access and credentials

## Environment Check

Run our environment checker:
```cmd
node check-environment.js
```

This will verify:
- ✅ Node.js version
- ✅ npm version  
- ✅ Project structure
- ✅ Package configurations
- ✅ Dependencies installation
- ✅ Configuration files

## What's Already Implemented

### ✅ Core UI Components
- **Navbar**: Responsive navigation with auth state
- **ProtectedRoute**: Route guard for authenticated pages
- **LoadingSpinner**: Reusable loading component with variants

### ✅ Project Structure
- Frontend: React + Vite + TailwindCSS
- Backend: Express + MongoDB + JWT auth
- Proper separation of concerns
- Modern ES6+ modules

### ✅ Authentication System
- JWT-based authentication
- Password hashing with bcryptjs
- Protected routes
- Auth context for state management

### ✅ Development Setup
- Hot reload for both frontend and backend
- ESLint configuration
- TailwindCSS with custom theme
- Environment-based configuration

## Next Steps After Installation

1. **Start the development servers**: `npm run dev`
2. **Open browser**: Frontend at http://localhost:5173
3. **Test API**: Backend at http://localhost:3000
4. **Configure database**: Set up MongoDB connection
5. **Continue development**: Implement remaining features

## Need Help?

- 📖 Read the detailed setup guide: `setup.md`
- 🔍 Run environment check: `node check-environment.js`
- 🛠️ Use automated installer: `setup-environment.bat`
- 📝 Check project documentation in `.kiro/specs/`

---

**Ready to code!** 🎉 Once Node.js is installed and dependencies are ready, you'll have a fully functional development environment for the Udaan AI platform.