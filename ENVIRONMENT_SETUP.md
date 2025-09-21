# Environment Variables Setup Guide

## 📁 Current Structure (Best Practice)

```
project/
├── frontend/
│   ├── .env.local          # Your local development values (not in git)
│   └── .env.example        # Template with dummy values (in git)
├── backend/
│   ├── .env               # Your local development values (not in git)
│   └── .env.example       # Template with dummy values (in git)
└── .gitignore             # Excludes all .env files except .example
```

## 🔧 Setup for New Developers

1. **Clone the repository**
2. **Copy environment templates**:
   ```bash
   # Frontend
   cp frontend/.env.example frontend/.env.local
   
   # Backend  
   cp backend/.env.example backend/.env
   ```
3. **Fill in actual values** in the copied files

## 🚀 Deployment Strategy

### Development
- Use `.env.local` (frontend) and `.env` (backend)
- These files are git-ignored for security

### Staging/Production
- **DO NOT** use `.env` files in production
- Set environment variables directly in your deployment platform:
  - **Railway**: Environment variables section
  - **Vercel**: Environment variables in dashboard
  - **Heroku**: Config vars
  - **Docker**: Environment variables or secrets

## 🔒 Security Benefits

✅ **No secrets in git repository**
✅ **Different values per environment** 
✅ **Easy to rotate credentials**
✅ **Platform-managed encryption**
✅ **No accidental exposure**

## 🎯 Key Principles

1. **Never commit actual secrets to git**
2. **Use platform environment variables for production**
3. **Keep .env.example files updated as templates**
4. **Document required environment variables**

## 📝 Required Environment Variables

### Frontend (.env.local)
```bash
REACT_APP_FIREBASE_API_KEY=your_key_here
REACT_APP_FIREBASE_AUTH_DOMAIN=project.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your_project_id
REACT_APP_FIREBASE_APP_ID=your_app_id
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
REACT_APP_API_URL=http://localhost:4000
```

### Backend (.env)
```bash
JWT_SECRET=your_jwt_secret
DB_HOST=localhost
DB_PORT=5432
DB_NAME=your_db_name
DB_USER=your_db_user
DB_PASSWORD=your_db_password
FIREBASE_SERVICE_ACCOUNT_BASE64=your_service_account_base64
```

This approach follows industry standards and keeps your application secure! 🛡️