# Swagger/OpenAPI Documentation - Quick Guide

## 🚀 Current Status

✅ Swagger is fully configured and ready to use!

## 📍 Access Points

- **Swagger UI (Interactive)**: http://localhost:8000/api/docs/
- **ReDoc (Documentation)**: http://localhost:8000/api/redoc/
- **OpenAPI Schema**: http://localhost:8000/api/schema/

---

## 🔐 Authentication Setup

You currently have **TWO OPTIONS** for authentication:

### Option A: WITH JWT Authentication (Production Mode) ✅ Recommended

**Step 1: Enable Authentication**
```bash
# Edit backend/.env file
DISABLE_AUTH=False   # Change True to False
```

**Step 2: Restart your Django server**

**Step 3: Get JWT Token in Swagger**
1. Go to http://localhost:8000/api/docs/
2. Scroll to `POST /api/auth/login/`
3. Click **"Try it out"**
4. Enter your credentials:
   ```json
   {
     "employee_id": "your_employee_id",
     "password": "your_password"
   }
   ```
5. Click **"Execute"**
6. Copy the `access` token from the response (just the token value)

**Step 4: Authorize in Swagger**
1. Click the green **"Authorize"** button (top right)
2. Paste **ONLY the token** (example: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`)
3. Click **"Authorize"**
4. Click **"Close"**

**Step 5: Test Endpoints**
- All endpoints now have authentication
- The JWT token is automatically included in all requests
- Lock icons indicate protected endpoints

---

### Option B: WITHOUT Authentication (Development Mode) ⚠️ Current Setting

**Current Status**: `DISABLE_AUTH=True` in your `.env` file

This means:
- ✅ No need to login
- ✅ All endpoints are accessible immediately
- ✅ Easy testing in Swagger
- ⚠️ **NOT secure** - all data is publicly accessible
- ⚠️ **NEVER use in production**

**No setup needed** - just access http://localhost:8000/api/docs/ and test any endpoint!

---

## 🎯 Which Option Should I Use?

| Scenario | Recommended Option |
|----------|-------------------|
| Quick API testing | Option B (DISABLE_AUTH=True) |
| Testing authentication flows | Option A (DISABLE_AUTH=False) |
| Production deployment | Option A (DISABLE_AUTH=False) ⚠️ REQUIRED |
| Sharing API with frontend team | Option A with test credentials |

---

## 🛠️ Common Issues & Solutions

### Issue: "Authorization header required"
**Solution**: You have `DISABLE_AUTH=False` but haven't authorized in Swagger
- Click "Authorize" button
- Paste your JWT token
- Make sure to copy ONLY the token, not "Bearer" or quotes

### Issue: Token expired
**Solution**: Get a new token
- Go to `/api/auth/login/`
- Login again to get a fresh token
- JWT tokens expire after 60 minutes (configured in settings)

### Issue: Endpoints not showing in Swagger
**Solution**:
- Check for errors in terminal
- Run: `python manage.py spectacular --validate`
- ViewSets without serializers may be excluded

### Issue: Can't test endpoints even with DISABLE_AUTH=True
**Solution**:
- Make sure you restarted the Django server after changing .env
- Check terminal for "WARNING: Authentication is DISABLED!" message
- If not shown, the setting didn't take effect

---

## 📝 Quick Reference

### Login Endpoint
```
POST /api/auth/login/
Body: {
  "employee_id": "your_id",
  "password": "your_password"
}
Response: {
  "access": "eyJhbGc...",  ← Use this token
  "refresh": "eyJhbGc...",
  "user": {...}
}
```

### Using Token in Swagger
1. Copy `access` token
2. Click "Authorize"
3. Paste token (without "Bearer")
4. Save

### Using Token in Code/Postman
```
Authorization: Bearer eyJhbGc...your_token_here
```

---

## 🔄 Switching Between Modes

**Enable Auth (Production-like)**:
```bash
# In backend/.env
DISABLE_AUTH=False
# Restart server
```

**Disable Auth (Quick Testing)**:
```bash
# In backend/.env
DISABLE_AUTH=True
# Restart server
```

---

## 📚 Additional Resources

- Swagger UI: http://localhost:8000/api/docs/
- Full Documentation: See `SWAGGER_SETUP.md`
- drf-spectacular docs: https://drf-spectacular.readthedocs.io/
