<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\RegisterRequest;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;

class AuthController extends Controller
{
    /**
     * Register a new user.
     */
    public function register(RegisterRequest $request): JsonResponse
    {
        $validated = $request->validated();

        // Strip non-digits from phone if present
        if (!empty($validated['phone'])) {
            $validated['phone'] = preg_replace('/\D/', '', $validated['phone']);
        } else {
            $validated['phone'] = null;
        }

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'phone' => $validated['phone'],
            'password' => Hash::make($validated['password']),
            'role' => 'user', // default role
            'status' => 'active', // default status
        ]);

        $user->sendEmailVerificationNotification();
        \App\Jobs\SendWelcomeEmailsJob::dispatch($user);

        return response()->json([
            'message' => 'Registration successful. Please check your email to verify your account.',
            'needs_verification' => true,
        ], 201);
    }

    /**
     * Login user and create token.
     */
    public function login(Request $request): JsonResponse
    {
        $credentials = $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        if (!auth()->attempt($credentials)) {
            return response()->json([
                'message' => 'The provided credentials do not match our records.'
            ], 401);
        }

        /** @var User $user */
        $user = auth()->user();

        if (!$user->hasVerifiedEmail()) {
            auth()->logout();
            return response()->json([
                'message' => 'Please verify your email address to log in.',
                'needs_verification' => true
            ], 403);
        }

        $token = $user->createToken('card-setu-token')->plainTextToken;

        $isSecure = app()->environment('production') || request()->secure();
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
                'avatar' => $user->avatar,
            ],
        ])->cookie('auth_token', $token, 60 * 24 * 30, '/', null, $isSecure, true, false, 'Lax');
    }

    /**
     * Logout user (revoke token).
     */
    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'message' => 'Successfully logged out'
        ])->withoutCookie('auth_token');
    }

    /**
     * Get the authenticated user.
     */
    public function user(Request $request): JsonResponse
    {
        $user = $request->user();
        
        return response()->json([
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'phone' => $user->phone,
                'role' => $user->role,
                'status' => $user->status,
                'email_verified_at' => $user->email_verified_at,
                'avatar' => $user->avatar,
            ]
        ]);
    }

    /**
     * Update the authenticated user's profile.
     */
    public function updateProfile(Request $request): JsonResponse
    {
        $user = $request->user();
        
        $validated = $request->validate([
            'name' => 'nullable|string|max:255',
            'phone' => 'nullable|string|max:20',
        ]);
        
        $user->update(array_filter($validated));
        
        return response()->json([
            'message' => 'Profile updated successfully',
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'phone' => $user->phone,
                'role' => $user->role,
                'status' => $user->status,
                'email_verified_at' => $user->email_verified_at,
                'avatar' => $user->avatar,
            ]
        ]);
    }

    /**
     * Change the authenticated user's password.
     */
    public function changePassword(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'current_password' => 'required|string',
            'new_password' => 'required|string|min:8',
        ]);

        $user = $request->user();

        // If the user registered via Google, they might not know their password.
        // We handle that by verifying they at least provided a password, but if they never set one, this could be tricky.
        // Assuming we always set a random password on Google auth, we should ideally check if it matches, 
        // but for now standard check applies.
        if (!Hash::check($validated['current_password'], $user->password)) {
            return response()->json([
                'message' => 'Current password does not match.'
            ], 400);
        }

        $user->update([
            'password' => Hash::make($validated['new_password'])
        ]);

        return response()->json([
            'message' => 'Password changed successfully.'
        ]);
    }

    /**
     * Mark the user's email address as verified.
     */
    public function verify(Request $request): JsonResponse
    {
        $user = User::findOrFail($request->route('id'));

        if (!hash_equals((string) $request->route('hash'), sha1($user->getEmailForVerification()))) {
            return response()->json(['message' => 'Invalid verification link.'], 403);
        }

        if ($user->hasVerifiedEmail()) {
            return response()->json(['message' => 'Email already verified.']);
        }

        if ($user->markEmailAsVerified()) {
            // Welcome email is now sent at registration.
        }

        return response()->json(['message' => 'Email verified successfully.']);
    }

    /**
     * Resend the email verification notification.
     */
    public function resendVerificationEmail(Request $request): JsonResponse
    {
        $request->validate(['email' => 'required|email']);
        $user = User::where('email', $request->email)->first();

        if (!$user) {
            return response()->json(['message' => 'User not found.'], 404);
        }

        if ($user->hasVerifiedEmail()) {
            return response()->json(['message' => 'Email already verified.'], 400);
        }

        $user->sendEmailVerificationNotification();

        return response()->json(['message' => 'Verification link sent.']);
    }

    /**
     * Permanently delete the authenticated user's account and their data.
     */
    public function deleteAccount(Request $request): JsonResponse
    {
        $user = $request->user();

        // Require the current password for password-based accounts. Google users
        // have a random password they never set, so the valid Sanctum token
        // (already enforced by the route) is sufficient proof of ownership.
        if (empty($user->google_id)) {
            $request->validate(['password' => 'required|string']);

            if (!Hash::check($request->input('password'), $user->password)) {
                return response()->json(['message' => 'The password you entered is incorrect.'], 422);
            }
        }

        DB::transaction(function () use ($user) {
            // Revoke all API tokens, then delete the account. Owned cards,
            // products, services and subscriptions cascade at the DB level;
            // past orders are retained with a null user_id for record-keeping.
            $user->tokens()->delete();
            $user->delete();
        });

        return response()->json(['message' => 'Your account has been permanently deleted.']);
    }
}
