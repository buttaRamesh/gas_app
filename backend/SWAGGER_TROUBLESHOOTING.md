# Swagger Troubleshooting Guide

## ✅ Verification - Everything is Working!

I've tested your Swagger setup and confirmed:
- ✅ Server is running on http://localhost:8000
- ✅ Swagger UI is accessible at http://localhost:8000/api/docs/
- ✅ OpenAPI schema is generating at http://localhost:8000/api/schema/
- ✅ JWT authentication is configured (jwtAuth)
- ✅ Login endpoint is responding at /api/auth/login/
- ✅ DISABLE_AUTH=True is active (authentication disabled for testing)

---

## 🔍 What Does "Not Working" Mean?

Please identify which issue you're experiencing:

### Issue 1: Can't Access Swagger UI at All

**Symptoms**:
- Page doesn't load
- 404 error
- Connection refused

**Solutions**:
1. **Ensure server is running**:
   ```bash
   cd backend
   python manage.py runserver
   ```

2. **Check the correct URL**:
   - ✅ Correct: `http://localhost:8000/api/docs/`
   - ❌ Wrong: `http://localhost:8000/docs/`
   - ❌ Wrong: `http://localhost:8000/swagger/`

3. **Check firewall/port**:
   - Make sure port 8000 is not blocked
   - Try: `http://127.0.0.1:8000/api/docs/`

---

### Issue 2: Swagger UI Loads But Shows No Endpoints

**Symptoms**:
- Swagger page opens
- But no API endpoints are listed
- Empty or "No operations defined" message

**Solutions**:

1. **Check schema generation**:
   ```bash
   cd backend
   python manage.py spectacular --validate
   ```

2. **Check for JavaScript errors**:
   - Open browser DevTools (F12)
   - Look at Console tab for errors
   - Check Network tab for failed requests

3. **Verify schema URL**:
   - Open: `http://localhost:8000/api/schema/`
   - Should show YAML with your API endpoints
   - If empty or error, check settings

4. **Clear browser cache**:
   - Hard refresh: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)

---

### Issue 3: Authentication Not Working in Swagger

**Symptoms**:
- Can see endpoints
- Can't test them (401 Unauthorized errors)
- "Authorize" button doesn't work

**Current Configuration**: You have `DISABLE_AUTH=True`

**If you want to test WITHOUT authentication** (current mode):
- All endpoints should work without authorization
- No need to click "Authorize" button
- Just click "Try it out" and "Execute"

**If you want to test WITH authentication**:

1. **Enable authentication**:
   ```bash
   # Edit backend/.env
   DISABLE_AUTH=False
   ```

2. **Restart server**:
   ```bash
   cd backend
   python manage.py runserver
   ```

3. **Get JWT token**:
   - Go to Swagger UI
   - Find `POST /api/auth/login/`
   - Click "Try it out"
   - Enter credentials:
     ```json
     {
       "employee_id": "your_employee_id",
       "password": "your_password"
     }
     ```
   - Click "Execute"
   - Copy the `access` token from response

4. **Authorize in Swagger**:
   - Click green "Authorize" button (top right)
   - Paste ONLY the token value (not the word "Bearer")
   - Example: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
   - Click "Authorize"
   - Click "Close"

5. **Test endpoints**:
   - Try any endpoint
   - Should work now

---

### Issue 4: "Bearer" Token Format Not Working

**Symptoms**:
- You paste token with "Bearer" prefix
- Still getting 401 errors

**Solution**:
- ✅ Correct: Paste ONLY the token: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
- ❌ Wrong: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

Swagger automatically adds "Bearer" prefix, so you should paste only the token value.

---

### Issue 5: Token Expired

**Symptoms**:
- Was working before
- Now getting 401 errors
- "Token is invalid or expired"

**Solution**:
1. JWT tokens expire after 60 minutes
2. Get a new token by logging in again
3. Update authorization in Swagger with new token

---

### Issue 6: Can't Login / No Valid Credentials

**Symptoms**:
- Login endpoint returns error
- "No active account found"

**Solutions**:

1. **Check if you have users in database**:
   ```bash
   cd backend
   python manage.py shell
   ```
   ```python
   from authentication.models import User
   User.objects.all()
   # Should show list of users
   ```

2. **Create a test user**:
   ```bash
   python manage.py createsuperuser
   ```

3. **Check login format**:
   - Field name is `employee_id` (not `username`)
   - Example:
     ```json
     {
       "employee_id": "EMP001",
       "password": "yourpassword"
     }
     ```

---

### Issue 7: Some Endpoints Missing from Swagger

**Symptoms**:
- Most endpoints show
- But some are missing

**Possible Reasons**:

1. **ViewSet has no serializer**:
   - Check console warnings when running `python manage.py spectacular`
   - Look for "unable to guess serializer" errors
   - These endpoints are automatically excluded

2. **Custom ViewSet without schema**:
   - Some ViewSets need manual `@extend_schema` decorators
   - Example:
     ```python
     from drf_spectacular.utils import extend_schema

     @extend_schema(
         request=YourSerializer,
         responses={200: YourResponseSerializer}
     )
     def your_view(self, request):
         pass
     ```

---

## 🧪 Quick Test

To verify everything is working:

1. **Open Swagger UI**: http://localhost:8000/api/docs/
2. **Find any GET endpoint** (e.g., `/api/lookups/...`)
3. **Click "Try it out"**
4. **Click "Execute"**
5. **Should see response** (data or empty list)

If this works, Swagger is functioning correctly!

---

## 📊 Current Configuration Status

Run this to check your setup:

```bash
cd backend
python manage.py check
python manage.py spectacular --validate
```

Check your `.env` file:
```bash
grep DISABLE_AUTH backend/.env
```

Current status:
- `DISABLE_AUTH=True` → No authentication required
- `DISABLE_AUTH=False` → JWT authentication required

---

## 🆘 Still Not Working?

Please provide:

1. **What URL are you accessing?**
   - Share the exact URL

2. **What do you see?**
   - Screenshot if possible
   - Error message
   - Browser console errors (F12 → Console tab)

3. **What did you expect to happen?**
   - Describe expected behavior

4. **Server output**:
   - Any errors in terminal where server is running?

5. **Test these URLs and report results**:
   - http://localhost:8000/api/health/
   - http://localhost:8000/api/schema/
   - http://localhost:8000/api/docs/

---

## ✅ Expected Behavior

When working correctly:

1. **With DISABLE_AUTH=True** (current):
   - Open http://localhost:8000/api/docs/
   - See list of endpoints organized by tags
   - Click any endpoint → "Try it out" → "Execute"
   - Get response (data or error)
   - No authorization needed

2. **With DISABLE_AUTH=False**:
   - Open http://localhost:8000/api/docs/
   - See list of endpoints with lock icons
   - Login via `/api/auth/login/` to get token
   - Click "Authorize" → paste token → save
   - Test endpoints successfully
