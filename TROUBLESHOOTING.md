# Troubleshooting Guide

## Error: "Route [login] not defined"

This error occurs when Laravel's authentication system tries to redirect to a login route that doesn't exist. Here's how we've fixed it:

### ✅ **Solutions Applied:**

1. **Added Named Login Route** (`routes/web.php`)
   ```php
   Route::get('/login', function () {
       return redirect('http://localhost:5173/login');
   })->name('login');
   ```

2. **Updated Auth Configuration** (`config/auth.php`)
   ```php
   'guards' => [
       'web' => [
           'driver' => 'session',
           'provider' => 'users',
       ],
       'sanctum' => [
           'driver' => 'sanctum',
           'provider' => 'users',
       ],
   ],
   ```

3. **Added API Exception Handling** (`bootstrap/app.php`)
   ```php
   ->withExceptions(function (Exceptions $exceptions): void {
       $exceptions->render(function (\Illuminate\Auth\AuthenticationException $e, $request) {
           if ($request->is('api/*')) {
               return response()->json([
                   'success' => false,
                   'message' => 'Unauthenticated'
               ], 401);
           }
       });
   })
   ```

4. **Updated Sanctum Configuration** (`config/sanctum.php`)
   - Added React frontend domains to stateful domains
   - Includes: `localhost:5173`, `127.0.0.1:5173`

5. **Added CORS Configuration** (`config/cors.php`)
   - Allows requests from React frontend
   - Configured proper headers and methods

### 🚀 **Setup Steps:**

1. **Copy Environment File**
   ```bash
   cp .env.example .env
   ```

2. **Update Database Configuration in `.env`**
   ```env
   DB_CONNECTION=mysql
   DB_HOST=127.0.0.1
   DB_PORT=3306
   DB_DATABASE=your_database_name
   DB_USERNAME=your_username
   DB_PASSWORD=your_password
   ```

3. **Run Setup Commands**
   ```bash
   composer install
   php artisan key:generate
   php artisan migrate:fresh --seed
   php artisan serve
   ```

### 🔍 **Common Issues & Solutions:**

#### Issue 1: CORS Errors
**Symptoms:** Browser console shows CORS policy errors
**Solution:** 
- Ensure `config/cors.php` includes your React frontend URL
- Check that Sanctum middleware is properly configured

#### Issue 2: Token Not Being Sent
**Symptoms:** API returns 401 Unauthenticated even with valid login
**Solution:**
- Verify axios interceptors are working in React
- Check that token is stored in localStorage
- Ensure Authorization header format: `Bearer {token}`

#### Issue 3: Database Connection Error
**Symptoms:** "Connection refused" or database errors
**Solution:**
- Verify database credentials in `.env`
- Ensure MySQL server is running
- Create the database if it doesn't exist

#### Issue 4: Sanctum Not Working
**Symptoms:** Authentication always fails
**Solution:**
- Run `php artisan vendor:publish --provider="Laravel\Sanctum\SanctumServiceProvider"`
- Ensure personal access tokens table exists
- Check Sanctum configuration in `config/sanctum.php`

### 📝 **Testing the Setup:**

1. **Test API Endpoints:**
   ```bash
   # Test login
   curl -X POST http://127.0.0.1:8000/api/login \
     -H "Content-Type: application/json" \
     -d '{"email":"superadmin@example.com","password":"password123"}'
   
   # Test protected route (use token from login response)
   curl -X GET http://127.0.0.1:8000/api/users \
     -H "Authorization: Bearer YOUR_TOKEN_HERE"
   ```

2. **Test React Frontend:**
   - Start React dev server: `npm run dev`
   - Navigate to `http://localhost:5173`
   - Try logging in with default credentials
   - Check browser network tab for API calls

### 🛠 **Development Commands:**

```bash
# Clear all caches
php artisan cache:clear
php artisan config:clear
php artisan route:clear

# Reset database with fresh data
php artisan migrate:fresh --seed

# Check routes
php artisan route:list

# Check configuration
php artisan config:show auth
php artisan config:show sanctum
```

### 📋 **Checklist for New Setup:**

- [ ] Database created and configured
- [ ] `.env` file copied and updated
- [ ] Composer dependencies installed
- [ ] Application key generated
- [ ] Migrations run successfully
- [ ] Seeders executed (default users created)
- [ ] Laravel server started (`php artisan serve`)
- [ ] React server started (`npm run dev`)
- [ ] Can login with default credentials
- [ ] API endpoints respond correctly
- [ ] No CORS errors in browser console

### 🔐 **Default Test Credentials:**

| Role | Email | Password |
|------|-------|----------|
| Superuser | superadmin@example.com | password123 |
| HR Admin | hradmin@example.com | password123 |
| Supervisor | supervisor@example.com | password123 |
| Leader | leader@example.com | password123 |

If you're still experiencing issues after following this guide, please check:
1. Laravel logs: `storage/logs/laravel.log`
2. Browser console for JavaScript errors
3. Network tab for failed API requests
4. Database connection and table structure
