<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\BusinessCardController;
use App\Http\Controllers\Api\LeadController;
use App\Http\Controllers\Api\NotificationController;
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\ServiceController;
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

// Public routes (Rate limited to 60 req/min)
Route::middleware('throttle:60,1')->group(function () {
    // Public Profile Fetch by Slug
    Route::get('/cards/public/{slug}', [BusinessCardController::class, 'showPublic']);
    Route::post('/cards/public/{slug}/appointments', [BusinessCardController::class, 'bookAppointment']);
    Route::get('/cards/public/{slug}/vcard', [BusinessCardController::class, 'downloadVCard']);

    // Lead Injection Endpoint
    Route::post('/leads', [LeadController::class, 'store']);

    // Public Products Listing
    Route::get('/products', [ProductController::class, 'index']);

    // Public Services Listing
    Route::get('/services', [ServiceController::class, 'index']);

    // Public Categories Listing
    Route::get('/categories', [\App\Http\Controllers\Api\CategoryController::class, 'index']);

    // Homepage Stats
    Route::get('/homepage-stats', [\App\Http\Controllers\Api\PublicController::class, 'homepageStats']);

    // Public Search & Discovery
    Route::get('/cards/search', [\App\Http\Controllers\Api\PublicController::class, 'searchCards']);
    Route::get('/cards/recent', [\App\Http\Controllers\Api\PublicController::class, 'recentCards']);

    // Order Checkout Endpoint
    Route::post('/orders', [\App\Http\Controllers\OrderController::class, 'store']);

    // Pincode Verification Endpoint
    Route::get('/verify-pincode/{pincode}', [BusinessCardController::class, 'verifyPincode']);
});

// Auth routes (Rate limited to 5 req/min)
Route::middleware('throttle:5,1')->group(function () {
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login', [AuthController::class, 'login']);
    Route::get('/email/verify/{id}/{hash}', [AuthController::class, 'verify'])
        ->name('verification.verify');
    Route::post('/email/verification-notification', [AuthController::class, 'resendVerificationEmail']);

    // Forgot Password routes
    Route::post('/forgot-password', [PasswordResetController::class, 'sendResetLinkEmail']);
    Route::post('/reset-password', [PasswordResetController::class, 'resetPassword']);

    // Google OAuth routes
    Route::get('/auth/google/redirect', [SocialAuthController::class, 'redirectToGoogle']);
    Route::get('/auth/google/callback', [SocialAuthController::class, 'handleGoogleCallback']);

    // Email OTP routes
    Route::post('/auth/otp/send', [OTPAuthController::class, 'sendOTP']);
    Route::post('/auth/otp/login', [OTPAuthController::class, 'loginWithOTP']);
});

// Protected routes
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user', [AuthController::class, 'user']);
    Route::put('/user', [AuthController::class, 'updateProfile']);
    Route::put('/user/password', [AuthController::class, 'changePassword']);
    Route::post('/logout', [AuthController::class, 'logout']);

    // Media Upload
    Route::post('/upload', [\App\Http\Controllers\Api\MediaController::class, 'upload']);

    // Card CRUD Actions
    Route::apiResource('cards', BusinessCardController::class);
    Route::get('/appointments', [\App\Http\Controllers\Api\AppointmentController::class, 'index']);
    Route::put('/appointments/{id}/status', [\App\Http\Controllers\Api\AppointmentController::class, 'updateStatus']);
    
    // Lead Actions
    Route::get('/leads', [LeadController::class, 'index']);
    Route::put('/leads/{id}', [LeadController::class, 'update']);
    Route::delete('/leads/{id}', [LeadController::class, 'destroy']);
    
    // Order Actions
    Route::get('/orders', [\App\Http\Controllers\OrderController::class, 'index']);
    Route::put('/orders/{id}', [\App\Http\Controllers\OrderController::class, 'update']);
    Route::delete('/orders/{id}', [\App\Http\Controllers\OrderController::class, 'destroy']);
    
    // Notifications
    Route::get('/notifications', [NotificationController::class, 'index']);
    Route::post('/notifications/mark-all-read', [NotificationController::class, 'markAllAsRead']);
    Route::post('/notifications/{id}/read', [NotificationController::class, 'markAsRead']);
    
    // Analytics
    Route::get('/analytics/summary', [\App\Http\Controllers\Api\AnalyticsController::class, 'summary']);

    // AI Generation Endpoint
    Route::post('/cards/ai-optimize', [BusinessCardController::class, 'optimizeContent']);

    // Product Actions (All authenticated users can manage products)
    Route::post('/products/import', [ProductController::class, 'import']);
    Route::post('/products', [ProductController::class, 'store']);
    Route::put('/products/{product}', [ProductController::class, 'update']);
    Route::delete('/products/{product}', [ProductController::class, 'destroy']);

    // Service Actions (All authenticated users can manage services)
    Route::post('/services', [ServiceController::class, 'store']);
    Route::put('/services/{service}', [ServiceController::class, 'update']);
    Route::delete('/services/{service}', [ServiceController::class, 'destroy']);
});

