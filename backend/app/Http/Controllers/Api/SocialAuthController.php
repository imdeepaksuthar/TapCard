<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Laravel\Socialite\Facades\Socialite;

class SocialAuthController extends Controller
{
    /**
     * Redirect the user to the Google authentication page.
     */
    public function redirectToGoogle(): RedirectResponse
    {
        return Socialite::driver('google')
            ->stateless()
            ->redirect();
    }

    /**
     * Obtain the user information from Google and authenticate.
     */
    public function handleGoogleCallback(): RedirectResponse
    {
        try {
            $googleUser = Socialite::driver('google')->stateless()->user();
        } catch (\Exception $e) {
            // Redirect back to login with error
            $frontendUrl = env('FRONTEND_URL', 'http://127.0.0.1:3000');
            return redirect()->away($frontendUrl . '/login?error=Google authentication failed.');
        }

        $email = $googleUser->getEmail();
        $googleId = $googleUser->getId();
        $avatar = $googleUser->getAvatar();
        $name = $googleUser->getName();

        // 1. Check if user already has google_id
        $user = User::where('google_id', $googleId)->first();

        if (!$user) {
            // 2. Check if user with same email exists
            $user = User::where('email', $email)->first();

            if ($user) {
                // Link Google account to existing user
                $user->update([
                    'google_id' => $googleId,
                    'avatar' => $avatar,
                ]);
            } else {
                // 3. Create new user
                $user = User::create([
                    'name' => $name,
                    'email' => $email,
                    'google_id' => $googleId,
                    'avatar' => $avatar,
                    'password' => Hash::make(Str::random(24)), // Random secure password
                    'role' => 'user',
                    'status' => 'active',
                ]);
                $user->markEmailAsVerified();
                \App\Jobs\SendWelcomeEmailsJob::dispatch($user);
            }
        } else {
            // Update avatar if changed
            if ($user->avatar !== $avatar) {
                $user->update(['avatar' => $avatar]);
            }
        }

        // Generate Sanctum token
        $token = $user->createToken('card-setu-token')->plainTextToken;

        // Redirect to the frontend callback page to save the token
        $frontendUrl = env('FRONTEND_URL', 'http://127.0.0.1:3000');
        
        $isSecure = app()->environment('production');

        return redirect()->away($frontendUrl . '/auth/callback?token=' . $token)
            ->cookie('auth_token', $token, 60 * 24 * 30, '/', null, $isSecure, true, false, 'Lax');
    }
}
