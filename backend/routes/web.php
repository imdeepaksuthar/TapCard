<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Admin\DashboardController;
use App\Http\Controllers\Admin\PlanController;
use App\Http\Controllers\Admin\NfcController;
use App\Http\Controllers\Admin\ThemeController;
use App\Http\Controllers\Admin\ProductController;

Route::view('/', 'welcome');

use App\Http\Controllers\Auth\LoginController;

Route::get('/login', [LoginController::class, 'showLoginForm'])->name('login');
Route::post('/login', [LoginController::class, 'login']);
Route::post('/logout', [LoginController::class, 'logout'])->name('logout');

// Protect with custom session-based admin middleware
// In Laravel 11+, middleware aliases can be used directly or registered in bootstrap/app.php
Route::middleware(['web', 'auth', \App\Http\Middleware\RoleMiddleware::class . ':super_admin,admin'])
    ->prefix('admin')
    ->name('admin.')
    ->group(function () {
        Route::get('/', [DashboardController::class, 'index'])->name('dashboard');
        
        Route::get('/plans', [PlanController::class, 'index'])->name('plans.index');
        Route::post('/plans', [PlanController::class, 'store'])->name('plans.store');
        Route::get('/nfc', [NfcController::class, 'index'])->name('nfc.index');
        Route::put('/nfc/{nfcCard}', [NfcController::class, 'update'])->name('nfc.update');
        
        Route::get('/themes', [ThemeController::class, 'index'])->name('themes.index');
        Route::post('/themes', [ThemeController::class, 'store'])->name('themes.store');
        Route::put('/themes/{theme}', [ThemeController::class, 'update'])->name('themes.update');
        Route::delete('/themes/{theme}', [ThemeController::class, 'destroy'])->name('themes.destroy');

        Route::get('/products', [ProductController::class, 'index'])->name('products.index');
        Route::post('/products', [ProductController::class, 'store'])->name('products.store');
        Route::put('/products/{product}', [ProductController::class, 'update'])->name('products.update');
        Route::delete('/products/{product}', [ProductController::class, 'destroy'])->name('products.destroy');
});
