<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Mail\OTPMail;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class OTPAuthController extends Controller
{
    /**
     * Generate and send an OTP to the user's email.
     */
    public function sendOTP(Request $request): JsonResponse
    {
        $request->validate([
            'email' => 'required|email',
        ]);

        $email = $request->email;

        // Always return the same message so we don't reveal whether an account
        // exists for this email (prevents user enumeration).
        $generic = response()->json([
            'message' => 'If an account exists for this email, a verification code has been sent.',
        ]);

        $user = User::where('email', $email)->first();
        if (!$user) {
            return $generic;
        }

        // Resend cooldown: ignore repeat requests within 45s (also keeps a single
        // valid code live at a time).
        $cooldownKey = 'otp_cooldown_' . $email;
        if (Cache::has($cooldownKey)) {
            return $generic;
        }

        $otpCode = strval(random_int(100000, 999999));
        Cache::put('otp_' . $email, $otpCode, now()->addMinutes(10));
        Cache::put($cooldownKey, true, now()->addSeconds(45));
        Cache::forget('otp_attempts_' . $email); // fresh code → reset failed-attempt counter

        try {
            Mail::to($email)->send(new OTPMail($otpCode, $user->name));
        } catch (\Exception $e) {
            Log::error('OTP Mail Error: ' . $e->getMessage());
            return response()->json([
                'message' => 'Failed to send verification code. Please try again shortly.',
            ], 500);
        }

        return $generic;
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

        $email = $request->email;
        $attemptsKey = 'otp_attempts_' . $email;
        $attempts = (int) Cache::get($attemptsKey, 0);

        // Lock out after 5 wrong guesses and invalidate the code so a fresh one
        // must be requested (defeats brute-forcing a 6-digit code within its TTL).
        if ($attempts >= 5) {
            Cache::forget('otp_' . $email);
            return response()->json([
                'message' => 'Too many incorrect attempts. Please request a new code.',
            ], 429);
        }

        $cachedCode = Cache::get('otp_' . $email);

        if (!$cachedCode || !hash_equals((string) $cachedCode, (string) $request->code)) {
            Cache::put($attemptsKey, $attempts + 1, now()->addMinutes(10));
            return response()->json([
                'message' => 'Invalid or expired verification code.',
            ], 422);
        }

        // Success — clear the code and the attempt counter.
        Cache::forget('otp_' . $email);
        Cache::forget($attemptsKey);

        $user = User::where('email', $email)->first();
        if (!$user) {
            return response()->json([
                'message' => 'User account not found.',
            ], 404);
        }

        // Receiving the OTP proves control of the inbox, so treat a first OTP
        // login as email verification (keeps parity with the password flow's
        // verified-email requirement instead of silently bypassing it).
        if (!$user->hasVerifiedEmail()) {
            $user->markEmailAsVerified();
        }

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
