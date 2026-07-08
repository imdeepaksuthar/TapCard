<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Admin\DashboardController;
use App\Http\Controllers\Admin\PlanController;
use App\Http\Controllers\Admin\NfcController;
use App\Http\Controllers\Admin\UserController;
use App\Http\Controllers\Admin\DesignationController;

use App\Http\Controllers\Auth\LoginController;

Route::get('/', [LoginController::class, 'showLoginForm'])->name('login');
Route::get('/login', function () {
    return redirect('/');
});
// Throttle admin login: max 6 attempts/min per IP to blunt brute-force.
Route::post('/', [LoginController::class, 'login'])->middleware('throttle:6,1');
Route::post('/login', [LoginController::class, 'login'])->middleware('throttle:6,1');
Route::post('/logout', [LoginController::class, 'logout'])->name('logout');
Route::get('/logout', [LoginController::class, 'logout'])->name('logout.get');

// Protect with custom session-based admin middleware
// In Laravel 11+, middleware aliases can be used directly or registered in bootstrap/app.php
Route::middleware(['web', 'auth', \App\Http\Middleware\RoleMiddleware::class . ':super_admin,admin'])
    ->prefix('admin')
    ->name('admin.')
    ->group(function () {
        Route::get('/', [DashboardController::class, 'index'])->name('dashboard');
        
        Route::get('/users', [UserController::class, 'index'])->name('users.index');
        Route::get('/users/create', [UserController::class, 'create'])->name('users.create');
        Route::post('/users', [UserController::class, 'store'])->name('users.store');
        Route::patch('/users/{user}/toggle-status', [UserController::class, 'toggleStatus'])->name('users.toggle-status');
        Route::post('/users/{user}/impersonate', [UserController::class, 'impersonate'])->name('users.impersonate');
        Route::post('/users/{user}/send-verification', [UserController::class, 'sendVerification'])->name('users.send-verification');
        Route::resource('plans', PlanController::class);
        Route::get('/nfc', [NfcController::class, 'index'])->name('nfc.index');
        Route::put('/nfc/{nfcCard}', [NfcController::class, 'update'])->name('nfc.update');
        
        Route::resource('categories', \App\Http\Controllers\Admin\CategoryController::class);
        Route::resource('designations', DesignationController::class);
});
