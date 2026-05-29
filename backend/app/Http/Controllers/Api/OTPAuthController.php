<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Mail\OTPMail;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Mail;

class OTPAuthController extends Controller
{
    /**
     * Generate and send OTP to the user's email.
     */
    public function sendOTP(Request $request): JsonResponse
    {
        $request->validate([
            'email' => 'required|email',
        ]);

        $user = User::where('email', $request->email)->first();

        if (!$user) {
            return response()->json([
                'message' => 'No account found with this email address. Please register first.'
            ], 404);
        }

        // Generate a 6-digit random code
        $otpCode = strval(rand(100000, 999999));

        // Cache the OTP code for 10 minutes
        Cache::put('otp_' . $request->email, $otpCode, now()->addMinutes(10));

        try {
            Mail::to($request->email)->send(new OTPMail($otpCode, $user->name));
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error('OTP Mail Error: ' . $e->getMessage());
            return response()->json([
                'message' => 'Failed to send verification code. Error: ' . $e->getMessage()
            ], 500);
        }

        return response()->json([
            'message' => 'Verification code sent successfully to your email.'
        ]);
    }

    /**
     * Verify the OTP and log the user in.
     */
    public function loginWithOTP(Request $request): JsonResponse
    {
        $request->validate([
            'email' => 'required|email',
            'code' => 'required|string|size:6',
        ]);

        $cachedCode = Cache::get('otp_' . $request->email);

        if (!$cachedCode || $cachedCode !== $request->code) {
            return response()->json([
                'message' => 'Invalid or expired verification code.'
            ], 422);
        }

        // Clear the OTP from cache
        Cache::forget('otp_' . $request->email);

        $user = User::where('email', $request->email)->first();

        if (!$user) {
            return response()->json([
                'message' => 'User account not found.'
            ], 404);
        }

        // Generate token
        $token = $user->createToken('card-setu-token')->plainTextToken;

        $isSecure = app()->environment('production');

        return response()->json([
            'token' => $token,
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'phone' => $user->phone,
                'role' => $user->role,
                'status' => $user->status,
                'email_verified_at' => $user->email_verified_at,
            ],
        ])->cookie('auth_token', $token, 60 * 24 * 30, '/', null, $isSecure, true, false, 'Lax');
    }
}
