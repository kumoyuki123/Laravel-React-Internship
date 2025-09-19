# Laravel React Authentication & Management System

## Project Overview
This is a comprehensive internship management system with role-based authentication, featuring:
- **Backend**: Laravel API with Sanctum authentication
- **Frontend**: React with Material-UI
- **Database**: MySQL with proper relationships
- **Features**: Schools, Students, Employees, Attendance management with role-based access control

## Roles & Permissions

### User Roles
1. **Superuser** - Full system access, can create other users
2. **HR Admin** - Can manage schools, students, employees
3. **Supervisor** - Can manage schools, students, employees  
4. **Leader** - Can manage students and attendance

### Permission Matrix
| Feature | Superuser | HR Admin | Supervisor | Leader |
|---------|-----------|----------|------------|--------|
| User Management | ✅ | ❌ | ❌ | ❌ |
| School Management | ✅ | ✅ | ✅ | View Only |
| Student Management | ✅ | ✅ | ✅ | ✅ |
| Employee Management | ✅ | ✅ | ✅ | View Only |
| Attendance Management | ✅ | ✅ | ✅ | ✅ |

## Setup Instructions

### Backend Setup (Laravel)

1. **Navigate to Laravel directory**
   ```bash
   cd laravel-api-auth
   ```

2. **Install dependencies**
   ```bash
   composer install
   ```

3. **Environment setup**
   ```bash
   cp .env.example .env
   php artisan key:generate
   ```

4. **Database configuration**
   Update `.env` file with your database credentials:
   ```env
   DB_CONNECTION=mysql
   DB_HOST=127.0.0.1
   DB_PORT=3306
   DB_DATABASE=your_database_name
   DB_USERNAME=your_username
   DB_PASSWORD=your_password
   ```

5. **Run migrations and seeders**
   ```bash
   php artisan migrate:fresh --seed
   ```

6. **Start Laravel server**
   ```bash
   php artisan serve
   ```

### Frontend Setup (React)

1. **Navigate to React directory**
   ```bash
   cd rect-auth
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

## Default Users (Created by Seeders)

| Email | Password | Role |
|-------|----------|------|
| superadmin@example.com | password123 | Superuser |
| hradmin@example.com | password123 | HR Admin |
| supervisor@example.com | password123 | Supervisor |
| leader@example.com | password123 | Leader |

## Key Features Implemented

### Backend Features
- ✅ Role-based authentication with middleware
- ✅ Separate controllers for each entity (School, Student, Employee, Attendance)
- ✅ Automatic employee creation when student IQ ≥ 60
- ✅ Proper model relationships and validation
- ✅ API endpoints with role-based access control
- ✅ Database seeders with test data

### Frontend Features
- ✅ Role-based route protection
- ✅ User management interface (Superuser only)
- ✅ Logout URL manipulation prevention
- ✅ Authentication context with role helpers
- ✅ Material-UI components with proper styling
- ✅ API service layer for all endpoints

### Security Features
- ✅ JWT token authentication
- ✅ Route-level role checking
- ✅ Middleware protection on API endpoints
- ✅ Automatic token refresh handling
- ✅ Logout prevention via direct URL access

## API Endpoints

### Authentication
- `POST /api/register` - Register new user
- `POST /api/login` - User login
- `POST /api/logout` - User logout

### User Management (Superuser only)
- `GET /api/users` - List all users
- `POST /api/users` - Create new user
- `PUT /api/users/{id}` - Update user
- `DELETE /api/users/{id}` - Delete user

### Schools
- `GET /api/schools` - List schools (All roles)
- `POST /api/schools` - Create school (Superuser, HR Admin, Supervisor)
- `PUT /api/schools/{id}` - Update school (Superuser, HR Admin, Supervisor)
- `DELETE /api/schools/{id}` - Delete school (Superuser, HR Admin, Supervisor)

### Students
- `GET /api/students` - List students (All roles)
- `POST /api/students` - Create student (All roles)
- `PUT /api/students/{id}` - Update student (All roles)
- `DELETE /api/students/{id}` - Delete student (All roles)

### Employees
- `GET /api/employees` - List employees (All roles)
- `PUT /api/employees/{id}` - Update employee (Superuser, HR Admin, Supervisor)
- `DELETE /api/employees/{id}` - Delete employee (Superuser, HR Admin, Supervisor)

### Attendance
- `GET /api/attendances` - List attendance (All roles)
- `POST /api/attendances` - Create attendance (All roles)
- `PUT /api/attendances/{id}` - Update attendance (All roles)
- `DELETE /api/attendances/{id}` - Delete attendance (All roles)

## Business Logic

### Student to Employee Conversion
- When a student is created or updated with IQ score ≥ 60, they are automatically added to the employees table
- If IQ score drops below 60, the employee record is removed
- Employee record includes student_id, school_id, iq_score, jp_level (nullable), skill_language (nullable)

### Example Data Flow
1. **Create School**: MIIT with teacher Daw YiYi (yiyi@gmail.com)
2. **Create Student**: Phyu Phyu with IQ score 69 → Automatically becomes employee
3. **Attendance Tracking**: Daily attendance records with status (present/absent/late) and check-in times

## Troubleshooting

### Common Issues
1. **CORS Error**: Ensure Laravel CORS is configured properly
2. **Token Expiration**: Check if Sanctum is configured correctly
3. **Database Connection**: Verify database credentials in `.env`
4. **Permission Denied**: Check user roles and route permissions

### Development Tips
- Use browser dev tools to monitor API calls
- Check Laravel logs for backend errors: `storage/logs/laravel.log`
- Verify token in localStorage for authentication issues
- Test role-based access by switching between different user accounts

## Next Steps
- Add DataTables for better list management
- Implement file upload for student/employee photos
- Add email notifications for attendance
- Create dashboard analytics and reports
- Add export functionality for data
