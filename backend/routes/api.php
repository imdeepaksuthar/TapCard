<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\BusinessCardController;
use App\Http\Controllers\Api\LeadController;
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\PasswordResetController;
use App\Http\Controllers\Api\SocialAuthController;
use App\Http\Controllers\Api\OTPAuthController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| is assigned the "api" middleware group. Enjoy building your API!
|
|
*/

// Public routes
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::get('/email/verify/{id}/{hash}', [AuthController::class, 'verify'])
    ->name('verification.verify');

// Forgot Password routes
Route::post('/forgot-password', [PasswordResetController::class, 'sendResetLinkEmail']);
Route::post('/reset-password', [PasswordResetController::class, 'resetPassword']);

// Google OAuth routes
Route::get('/auth/google/redirect', [SocialAuthController::class, 'redirectToGoogle']);
Route::get('/auth/google/callback', [SocialAuthController::class, 'handleGoogleCallback']);

// Email OTP routes
Route::post('/auth/otp/send', [OTPAuthController::class, 'sendOTP']);
Route::post('/auth/otp/login', [OTPAuthController::class, 'loginWithOTP']);

// Public Profile Fetch by Slug
Route::get('/cards/public/{slug}', [BusinessCardController::class, 'showPublic']);
Route::get('/cards/public/{slug}/vcard', [BusinessCardController::class, 'downloadVCard']);

// Lead Injection Endpoint
Route::post('/leads', [LeadController::class, 'store']);

// Public Products Listing
Route::get('/products', [ProductController::class, 'index']);

// Public Categories Listing
Route::get('/categories', [\App\Http\Controllers\Api\CategoryController::class, 'index']);

// Homepage Stats
Route::get('/homepage-stats', [\App\Http\Controllers\Api\PublicController::class, 'homepageStats']);

// Order Checkout Endpoint
Route::post('/orders', [\App\Http\Controllers\OrderController::class, 'store']);

// Pincode Verification Endpoint
Route::get('/verify-pincode/{pincode}', [BusinessCardController::class, 'verifyPincode']);

// Protected routes
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user', [AuthController::class, 'user']);
    Route::put('/user', [AuthController::class, 'updateProfile']);
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::post('/email/verification-notification', [AuthController::class, 'resendVerificationEmail']);

    // Media Upload
    Route::post('/upload', [\App\Http\Controllers\Api\MediaController::class, 'upload']);

    // Card CRUD Actions
    Route::apiResource('cards', BusinessCardController::class);
    
    // Lead Actions
    Route::get('/leads', [LeadController::class, 'index']);
    Route::put('/leads/{id}', [LeadController::class, 'update']);
    Route::delete('/leads/{id}', [LeadController::class, 'destroy']);
    
    // AI Generation Endpoint
    Route::post('/cards/ai-optimize', [BusinessCardController::class, 'optimizeContent']);

    // Product Admin Actions (Admin & Super Admin only)
    Route::middleware(\App\Http\Middleware\RoleMiddleware::class . ':super_admin,admin')->group(function () {
        Route::post('/products', [ProductController::class, 'store']);
        Route::put('/products/{product}', [ProductController::class, 'update']);
        Route::delete('/products/{product}', [ProductController::class, 'destroy']);
    });
});
