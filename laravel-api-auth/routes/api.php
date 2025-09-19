<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\SchoolController;
use App\Http\Controllers\StudentController;
use App\Http\Controllers\EmployeeController;
use App\Http\Controllers\AttendenceController;

// Public routes
Route::post('register', [AuthController::class, 'register']);
Route::post('login', [AuthController::class, 'login']);

// Protected routes (require authentication)
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user', function (Request $request) {
        return $request->user();
    });
    
    // Profile routes
    Route::get('profile', [AuthController::class, 'show']);
    Route::put('profile', [AuthController::class, 'update']);
    Route::put('profile/change-password', [AuthController::class, 'changePassword']);

    // User management routes (only for superuser)
    Route::middleware('role:superuser')->group(function () {
        Route::get('users', [UserController::class, 'index']);
        Route::post('users', [UserController::class, 'store']);
        Route::put('users/{id}', [UserController::class, 'update']);
        Route::delete('users/{id}', [UserController::class, 'destroy']);
    });

    // School routes (accessible by all authenticated users)
    Route::get('schools', [SchoolController::class, 'index']);
    Route::get('schools/{id}', [SchoolController::class, 'show']);
    Route::middleware('role:superuser,hr_admin,supervisor')->group(function () {
        Route::post('schools', [SchoolController::class, 'store']);
        Route::put('schools/{id}', [SchoolController::class, 'update']);
        Route::delete('schools/{id}', [SchoolController::class, 'destroy']);
    });

    // Student routes
    Route::get('students', [StudentController::class, 'index']);
    Route::get('students/{id}', [StudentController::class, 'show']);
    Route::middleware('role:superuser,hr_admin,supervisor,leader')->group(function () {
        Route::post('students', [StudentController::class, 'store']);
        Route::put('students/{id}', [StudentController::class, 'update']);
        Route::delete('students/{id}', [StudentController::class, 'destroy']);
    });

    // Employee routes
    Route::get('employees', [EmployeeController::class, 'index']);
    Route::get('employees/{id}', [EmployeeController::class, 'show']);
    Route::middleware('role:superuser,hr_admin,supervisor')->group(function () {
        Route::put('employees/{id}', [EmployeeController::class, 'update']);
        Route::delete('employees/{id}', [EmployeeController::class, 'destroy']);
    });

    // Attendance routes
    Route::get('attendances', [AttendenceController::class, 'index']);
    Route::get('attendances/{id}', [AttendenceController::class, 'show']);
    Route::get('attendances/student/{studentId}', [AttendenceController::class, 'getByStudent']);
    Route::post('attendances/date-range', [AttendenceController::class, 'getByDateRange']);
    Route::middleware('role:superuser,hr_admin,supervisor,leader')->group(function () {
        Route::post('attendances', [AttendenceController::class, 'store']);
        Route::put('attendances/{id}', [AttendenceController::class, 'update']);
        Route::delete('attendances/{id}', [AttendenceController::class, 'destroy']);
    });
    
    // Logout
    Route::post('logout', [AuthController::class, 'logout']);
});