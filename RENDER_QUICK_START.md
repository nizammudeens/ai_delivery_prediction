# Render Deployment Quick Start

## ✅ Files Ready for Deployment

Your project is now configured for Render with these key files:

- ✅ **wsgi.py** - WSGI entry point (exports app for gunicorn)
- ✅ **Procfile** - Process file with startup command  
- ✅ **render.yaml** - YAML configuration
- ✅ **render.json** - JSON configuration (alternative)
- ✅ **.python-runtime** - Python version specification
- ✅ **build.sh** - Build script
- ✅ **requirements.txt** - All dependencies including gunicorn

## 🚀 Deployment Steps

### Step 1: Push to GitHub
```bash
git add .
git commit -m "Ready for Render deployment"
git push origin main
```

### Step 2: Create Backend on Render

1. Go to [https://dashboard.render.com](https://dashboard.render.com)
2. Click **New +** → **Web Service**
3. Select **Build and deploy from a Git repository**
4. Connect your GitHub account & select your repo
5. Fill in these settings:

- **Name:** `ai-delivery-backend`
- **Runtime:** `Python 3`
- **Build Command:** `pip install -r requirements.txt`
- **Start Command:** `gunicorn --worker-class sync --workers 2 --timeout 60 --bind 0.0.0.0:$PORT wsgi:app`
- **Environment Variables:**
  - `FLASK_ENV` = `production`
  - `PYTHONUNBUFFERED` = `1`

6. Click **Create Web Service**
7. ⏳ Wait 2-5 minutes for deployment
8. ✅ Note the service URL (e.g., https://ai-delivery-backend.onrender.com)

### Step 3: Create Frontend on Render

1. Click **New +** → **Static Site**
2. Select your GitHub repo again
3. Fill in:

- **Name:** `ai-delivery-frontend`
- **Build Command:** (leave empty)
- **Publish Directory:** `frontend`

4. Click **Create Static Site**
5. ⏳ Wait for deployment
6. ✅ Note the frontend URL (e.g., https://ai-delivery-frontend.onrender.com)

## 🔧 If Port Binding Fails

If you see: `"Port scan timeout reached, no open ports detected"`

**Try this:**
1. Check backend logs: Click service → Logs tab
2. Look for errors related to PORT or gunicorn
3. Ensure this line is in Procfile:
   ```
   web: gunicorn --bind 0.0.0.0:$PORT wsgi:app
   ```

4. Ensure wsgi.py exports `app`:
   ```python
   from app import app
   ```

5. Redeploy: Click service → Manual Deploy → Deploy Latest

## 📋 Key Requirements Met

✅ App binds to 0.0.0.0  
✅ Port from $PORT environment variable  
✅ Gunicorn as WSGI server  
✅ Python dependencies listed  
✅ Debug mode disabled in production  
✅ CORS configured  

## 🌐 Connecting Frontend to Backend

### Option 1: Same Domain (Recommended for Free Tier)
The frontend is auto-configured to detect the backend:

- **Local dev:** Frontend talks to `http://localhost:5000`
- **Production:** Frontend talks to relative path `/api`

This works when both are served from Render's unified URL.

### Option 2: Different Domains
If frontend and backend are on different domains:

In **frontend/config.js**, update:
```javascript
getBaseURL: function() {
    return 'https://ai-delivery-backend.onrender.com/api';
}
```

In **backend/app.py**, update CORS:
```python
CORS(app, resources={
    r"/api/*": {
        "origins": ["https://ai-delivery-frontend.onrender.com"]
    }
})
```

## 📊 Expected Behavior

✅ Backend responds on `<backend-url>/api/health`  
✅ Frontend loads at `<frontend-url>`  
✅ Frontend can make API calls to backend  
✅ Models load and predictions work  

## 🆘 Troubleshooting

| Issue | Solution |
|-------|----------|
| Port binding error | Check wsgi.py exports app, check Procfile syntax |
| 502 Bad Gateway | Check logs for Python errors, ensure gunicorn starts |
| CORS errors | Verify origins in backend CORS config |
| API not found | Ensure frontend API URL matches backend domain |
| Models not loading | Check models exist in backend/models/ |

## 💾 Persisting Files

Models and data files (currently stored locally) will be lost on redeploy.

**For production, consider:**
- Render Disks (paid feature)
- Environment variables with encoded models
- External storage (AWS S3, etc.)

---

**Questions?** Check [Render Docs](https://render.com/docs)
