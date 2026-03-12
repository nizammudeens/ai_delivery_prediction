# Deployment Guide for Render

## Overview
This guide explains how to deploy the AI Delivery Delay Prediction System to Render.

## Prerequisites
- A Render account (https://render.com)
- GitHub repository with your code pushed
- Git installed locally

## Deployment Steps

### 1. Push Code to GitHub
```bash
git init
git add .
git commit -m "Prepare for Render deployment"
git branch -M main
git remote add origin https://github.com/yourusername/your-repo.git
git push -u origin main
```

### 2. Connect Render to GitHub
1. Log in to [Render Dashboard](https://dashboard.render.com)
2. Click "New +" → "Web Service"
3. Select "Deploy an existing repository"
4. Connect your GitHub account and select your repository

### 3. Configure Backend Service

**Name:** `ai-delivery-backend`

**Environment:**
- Runtime: `Python`
- Build Command: `pip install -r requirements.txt`
- Start Command: `gunicorn --worker-class sync --workers 2 --timeout 60 --bind 0.0.0.0:$PORT wsgi:app`

**Environment Variables:**
```
FLASK_ENV=production
PYTHONUNBUFFERED=1
```

**Root Directory:** (leave empty or set to repo root)

**Regions:** Select closest to your users

**Plan:** Free or Paid

Click "Create Web Service" and wait for deployment.

### 4. Deploy Static Frontend

After backend is deployed:

1. Click "New +" → "Static Site"
2. Select your repository again
3. Configure:
   - **Name:** `ai-delivery-frontend`
   - **Build Command:** (leave empty for static files)
   - **Publish Directory:** `frontend`

Click "Create Static Site"

### 5. Update Frontend API URL (Optional)

Once deployed, Render will give you URLs like:
- Backend: `https://ai-delivery-backend.onrender.com`
- Frontend: `https://ai-delivery-frontend.onrender.com`

The frontend is pre-configured to use dynamic API endpoints, so:
- On local development: uses `http://localhost:5000/api`
- On production: uses relative path `/api` (which points to backend on same origin)

**Note:** For frontend on one domain and backend on another, you'll need to:
1. Update CORS in `backend/app.py` to allow your frontend domain
2. Update `frontend/config.js` API URL to use the backend service URL

### 6. Connect Backend to Frontend (if on different domains)

If backend and frontend are on different domains, update CORS:

**In `backend/app.py`:**
```python
CORS(app, resources={
    r"/api/*": {
        "origins": [
            "https://ai-delivery-frontend.onrender.com",
            "http://localhost:8000"
        ]
    }
})
```

**In `frontend/config.js`:**
```javascript
getBaseURL: function() {
    if (window.location.hostname === 'localhost') {
        return 'http://localhost:5000/api';
    }
    return 'https://ai-delivery-backend.onrender.com/api';
}
```

### 7. Monitor Deployment

1. Go to your Render dashboard
2. Click on each service to view logs
3. Check for any errors during startup

## Production Considerations

### Security
- ✅ Debug mode disabled (`FLASK_ENV=production`)
- ✅ Using production WSGI server (gunicorn)
- ✅ Environment variables for configuration
- ⚠️ Add authentication for model training endpoint
- ⚠️ Add rate limiting
- ⚠️ Validate all user inputs

### Performance
- Multiple workers configured (2)
- Timeout set to 60 seconds
- Static file caching enabled on frontend
- Consider using Render's database for persistence

### Model Storage
Currently, models are stored locally. For persistent storage:
1. Use Render's Disks (paid feature)
2. Use external storage (S3, etc.)
3. Set up database for model metadata

## Troubleshooting

### Build Fails
- Check logs for missing dependencies
- Ensure `requirements.txt` is in root directory
- Verify Python version compatibility

### 500 Error
- Check backend logs on Render dashboard
- Ensure model file is present
- Check environment variables

### API Not Responding
- Verify backend service is running
- Check CORS configuration
- Confirm API endpoints in code

### Static Files Not Loading
- Check publish directory setting
- Verify file paths in HTML

## Cost Estimation

**Free Tier:**
- 1 free web service (spins down after 15 min inactivity)
- 1 free static site
- Limited memory (512 MB)

**Paid Tier (Starter):**
~$7/month per service for 24/7 availability

## Support

For more info:
- [Render Documentation](https://render.com/docs)
- [Render Support](https://support.render.com)

## Rollback

To rollback to a previous version:
1. Go to your service settings
2. Find the deployment history
3. Click on a previous deployment
4. Click "Redeploy"

---

**Last Updated:** March 2026
**Version:** 1.0.0
