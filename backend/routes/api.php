<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\BusinessCardController;
use App\Http\Controllers\Api\LeadController;
use App\Http\Controllers\Api\ProductController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| is assigned the "api" middleware group. Enjoy building your API!
|
*/

// Public routes
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::get('/email/verify/{id}/{hash}', [AuthController::class, 'verify'])
    ->name('verification.verify');

// Public Profile Fetch by Slug
Route::get('/cards/public/{slug}', [BusinessCardController::class, 'showPublic']);
Route::get('/cards/public/{slug}/vcard', [BusinessCardController::class, 'downloadVCard']);

// Lead Injection Endpoint
Route::post('/leads', [LeadController::class, 'store']);

// Public Products Listing
Route::get('/products', [ProductController::class, 'index']);

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
});
