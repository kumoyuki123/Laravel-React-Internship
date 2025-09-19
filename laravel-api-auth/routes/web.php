<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return view('welcome');
});

// Add a named login route to prevent "Route [login] not defined" error
// This redirects to the React frontend login page
Route::get('/login', function () {
    return redirect('http://localhost:5173/login');
})->name('login');
