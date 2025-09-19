# CSRF Token Mismatch Fix Guide

## Problem
Getting "CSRF token mismatch" error when making API calls from React frontend, even though Postman works fine.

## Root Cause
Laravel Sanctum requires CSRF cookies for SPA (Single Page Application) authentication when using `withCredentials: true`.

## ✅ **Fixes Applied:**

### 1. **Updated AuthService.jsx**
- Added `withCredentials: true` to axios config
- Added `getCsrfCookie()` function to fetch CSRF cookie before auth requests
- Updated login, register, and logout functions to get CSRF cookie first

### 2. **Updated ApiService.jsx**
- Added `withCredentials: true` to axios config for all API calls

### 3. **Updated CORS Configuration**
- Set `supports_credentials` to `true` in `config/cors.php`

### 4. **Sanctum Configuration**
- Verified stateful domains include React frontend URLs

## 🔧 **Additional Steps Required:**

### Step 1: Update .env File
Add these lines to your Laravel `.env` file:
```env
SESSION_DRIVER=cookie
SESSION_DOMAIN=localhost
SANCTUM_STATEFUL_DOMAINS=localhost:3000,localhost:5173,127.0.0.1:3000,127.0.0.1:5173
```

### Step 2: Clear Laravel Cache
Run these commands in your Laravel directory:
```bash
php artisan config:clear
php artisan cache:clear
php artisan route:clear
```

### Step 3: Restart Laravel Server
```bash
php artisan serve
```

### Step 4: Test the Fix
1. Start React dev server: `npm run dev`
2. Try logging in from the React frontend
3. Check browser Network tab to see if `/sanctum/csrf-cookie` is called before login

## 🐛 **If Still Getting CSRF Errors:**

### Option 1: Disable CSRF for API Routes (Quick Fix)
Add this to `app/Http/Middleware/VerifyCsrfToken.php`:
```php
protected $except = [
    'api/*'
];
```

### Option 2: Use Token-Based Authentication Only
Update your AuthService to remove CSRF cookie calls and use only Bearer tokens:
```javascript
// Remove getCsrfCookie() calls and withCredentials
const api = axios.create({
  baseURL: APP_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});
```

### Option 3: Check Browser Console
Look for these common issues:
- CORS errors
- Network errors when fetching `/sanctum/csrf-cookie`
- Cookie domain mismatches

## 🔍 **Debugging Steps:**

### 1. Check Network Tab
- Verify `/sanctum/csrf-cookie` request is made
- Check if cookies are being set
- Look for CORS errors

### 2. Verify Laravel Routes
```bash
php artisan route:list | grep sanctum
```
Should show the CSRF cookie route.

### 3. Test API Directly
```bash
# Get CSRF cookie first
curl -X GET http://127.0.0.1:8000/sanctum/csrf-cookie -c cookies.txt

# Then make login request with cookies
curl -X POST http://127.0.0.1:8000/api/login \
  -b cookies.txt \
  -H "Content-Type: application/json" \
  -d '{"email":"superadmin@example.com","password":"password123"}'
```

## 📋 **Checklist:**

- [ ] Updated AuthService.jsx with CSRF cookie handling
- [ ] Updated ApiService.jsx with `withCredentials: true`
- [ ] Set `supports_credentials: true` in CORS config
- [ ] Added SESSION_DOMAIN to .env
- [ ] Cleared Laravel cache
- [ ] Restarted Laravel server
- [ ] Tested login from React frontend

## 🎯 **Expected Behavior:**

1. React app calls `/sanctum/csrf-cookie` before login
2. Laravel sets CSRF cookie in browser
3. React app makes login request with cookie
4. Laravel validates CSRF token and authenticates user
5. Login succeeds and returns user data + token

## 💡 **Why Postman Works:**

Postman doesn't enforce CSRF protection by default and can bypass cookie requirements. The React frontend needs proper CSRF handling because it's a browser-based SPA.
