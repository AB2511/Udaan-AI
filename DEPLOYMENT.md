# 🚀 Udaan AI - Deployment Guide

This guide covers deployment options for the Udaan AI hackathon prototype, optimized for demo presentations and quick deployment.

## 📋 Pre-Deployment Checklist

### ✅ Environment Setup
- [ ] Google Cloud project created with Vertex AI enabled
- [ ] Service account created with proper permissions
- [ ] MongoDB database ready (Atlas recommended for production)
- [ ] Environment variables configured
- [ ] Application tested locally

### ✅ Build Verification
```bash
# Test frontend build
cd frontend && npm run build

# Test backend startup
cd backend && npm start

# Run health checks
curl http://localhost:3000/api/health
```

## 🌐 Quick Deploy Options

### Option 1: Vercel + Railway (Recommended)

**Frontend on Vercel:**
```bash
# 1. Build the frontend
cd frontend
npm run build

# 2. Install Vercel CLI
npm i -g vercel

# 3. Deploy
vercel --prod

# 4. Set environment variables in Vercel dashboard
VITE_API_URL=https://your-backend-url.railway.app/api
```

**Backend on Railway:**
```bash
# 1. Install Railway CLI
npm install -g @railway/cli

# 2. Login and create project
railway login
railway new

# 3. Deploy backend
cd backend
railway up

# 4. Set environment variables
railway variables set MONGODB_URI=your-mongodb-uri
railway variables set JWT_SECRET=your-jwt-secret
railway variables set GOOGLE_CLOUD_PROJECT_ID=your-project-id
# ... other variables
```

### Option 2: Netlify + Render

**Frontend on Netlify:**
```bash
# 1. Build the frontend
cd frontend
npm run build

# 2. Deploy to Netlify
# Upload dist/ folder to Netlify or connect GitHub repo

# 3. Set environment variables in Netlify
VITE_API_URL=https://your-backend.onrender.com/api
```

**Backend on Render:**
```bash
# 1. Connect GitHub repo to Render
# 2. Set build command: cd backend && npm install
# 3. Set start command: cd backend && npm start
# 4. Set environment variables in Render dashboard
```

### Option 3: Docker Deployment

**Create Docker files:**

`backend/Dockerfile`:
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 3000

CMD ["npm", "start"]
```

`frontend/Dockerfile`:
```dockerfile
FROM node:18-alpine as build

WORKDIR /app
COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

`docker-compose.yml`:
```yaml
version: '3.8'

services:
  backend:
    build: ./backend
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - MONGODB_URI=${MONGODB_URI}
      - JWT_SECRET=${JWT_SECRET}
      - GOOGLE_CLOUD_PROJECT_ID=${GOOGLE_CLOUD_PROJECT_ID}
    volumes:
      - ./backend/uploads:/app/uploads

  frontend:
    build: ./frontend
    ports:
      - "80:80"
    depends_on:
      - backend
```

## 🔧 Environment Variables

### Backend (.env)
```env
# Production Backend Configuration
NODE_ENV=production
PORT=3000

# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/udaan-ai

# JWT Secret (generate a strong secret)
JWT_SECRET=your-super-secure-jwt-secret-here

# Google Vertex AI
GOOGLE_CLOUD_PROJECT_ID=your-project-id
GOOGLE_CLOUD_LOCATION=us-central1
GOOGLE_APPLICATION_CREDENTIALS=/app/service-account.json

# CORS (set to your frontend URL)
CORS_ORIGIN=https://your-frontend-domain.com

# File Upload
MAX_FILE_SIZE=10485760
UPLOAD_PATH=/app/uploads
```

### Frontend (.env)
```env
# Production Frontend Configuration
VITE_API_URL=https://your-backend-domain.com/api
VITE_APP_NAME=Udaan AI
VITE_APP_VERSION=1.0.0
VITE_ENVIRONMENT=production
```

## 🔐 Security Configuration

### Google Cloud Service Account

1. **Create Service Account:**
```bash
gcloud iam service-accounts create udaan-ai-demo \
    --description="Service account for Udaan AI demo" \
    --display-name="Udaan AI Demo"
```

2. **Grant Permissions:**
```bash
gcloud projects add-iam-policy-binding YOUR_PROJECT_ID \
    --member="serviceAccount:udaan-ai-demo@YOUR_PROJECT_ID.iam.gserviceaccount.com" \
    --role="roles/aiplatform.user"
```

3. **Create Key:**
```bash
gcloud iam service-accounts keys create service-account.json \
    --iam-account=udaan-ai-demo@YOUR_PROJECT_ID.iam.gserviceaccount.com
```

### MongoDB Atlas Setup

1. Create cluster on MongoDB Atlas
2. Create database user
3. Whitelist IP addresses (0.0.0.0/0 for demo, specific IPs for production)
4. Get connection string

## 📊 Performance Optimization

### Frontend Optimizations
```bash
# Build with optimizations
cd frontend
npm run build

# Analyze bundle size
npm run analyze

# Enable gzip compression in nginx
gzip on;
gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
```

### Backend Optimizations
```javascript
// Enable compression middleware
app.use(compression());

// Set proper cache headers
app.use(express.static('uploads', {
  maxAge: '1d',
  etag: true
}));

// Rate limiting
const rateLimit = require('express-rate-limit');
app.use('/api', rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
}));
```

## 🔍 Health Checks & Monitoring

### Health Check Endpoint
```javascript
// backend/routes/health.js
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version,
    environment: process.env.NODE_ENV,
    services: {
      database: 'connected', // Check MongoDB connection
      ai: 'available' // Check Vertex AI availability
    }
  });
});
```

### Monitoring Setup
```bash
# Add monitoring endpoints
GET /api/health - Basic health check
GET /api/metrics - Application metrics
GET /api/status - Detailed system status
```

## 🚨 Troubleshooting

### Common Deployment Issues

**1. CORS Errors:**
```javascript
// Ensure CORS is properly configured
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true
}));
```

**2. File Upload Issues:**
```javascript
// Ensure upload directory exists
const uploadDir = process.env.UPLOAD_PATH || './uploads';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}
```

**3. Environment Variables:**
```bash
# Verify all required variables are set
node -e "console.log(process.env)" | grep -E "(MONGODB_URI|JWT_SECRET|GOOGLE_CLOUD)"
```

**4. Google Cloud Authentication:**
```bash
# Test authentication
gcloud auth application-default print-access-token
```

### Debug Commands
```bash
# Check application logs
docker logs container-name

# Test API endpoints
curl -X GET https://your-backend.com/api/health

# Test file upload
curl -X POST -F "resume=@test.pdf" https://your-backend.com/api/resume/upload
```

## 📱 Demo-Specific Considerations

### Pre-Demo Setup
1. **Test the complete flow** with a real resume
2. **Prepare backup data** in case AI services fail
3. **Check internet connectivity** at demo venue
4. **Have multiple resume files** ready for testing
5. **Test on different devices** (laptop, tablet, phone)

### Demo Day Checklist
- [ ] Services are running and accessible
- [ ] Health checks pass
- [ ] Test resume upload works
- [ ] AI analysis completes successfully
- [ ] Results display properly
- [ ] Mobile responsiveness verified
- [ ] Backup plan ready if services fail

### Fallback Strategy
```javascript
// Implement graceful fallbacks
const analyzeResume = async (file) => {
  try {
    return await aiService.analyze(file);
  } catch (error) {
    console.warn('AI service unavailable, using fallback');
    return getFallbackData('resume-analysis');
  }
};
```

## 🎯 Production Considerations

For production deployment beyond demo:

1. **Security Hardening:**
   - Implement proper authentication
   - Add input validation and sanitization
   - Set up SSL/TLS certificates
   - Configure security headers

2. **Scalability:**
   - Implement caching (Redis)
   - Add load balancing
   - Database optimization
   - CDN for static assets

3. **Monitoring:**
   - Application performance monitoring
   - Error tracking (Sentry)
   - Log aggregation
   - Uptime monitoring

4. **Backup & Recovery:**
   - Database backups
   - File storage backups
   - Disaster recovery plan

## 📞 Support

For deployment issues during demo preparation:

1. Check the troubleshooting section above
2. Verify all environment variables are set correctly
3. Test each service independently
4. Ensure Google Cloud credentials are properly configured
5. Check network connectivity and firewall settings

---

**🎯 Ready for Demo!** Follow this guide to deploy Udaan AI and showcase AI-powered career intelligence.