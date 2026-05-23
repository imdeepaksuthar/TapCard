<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Mail\ResetPasswordMail;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Str;

class PasswordResetController extends Controller
{
    /**
     * Send a reset link to the given user.
     */
    public function sendResetLinkEmail(Request $request): JsonResponse
    {
        $request->validate([
            'email' => 'required|email',
        ]);

        $user = User::where('email', $request->email)->first();

        // Even if the user doesn't exist, we return a successful response to prevent user enumeration.
        if (!$user) {
            return response()->json([
                'message' => 'If your email is registered, we have sent you a password reset link.'
            ]);
        }

        // Generate reset token using Laravel's password broker repository
        $token = Password::getRepository()->create($user);

        // Generate the reset URL pointing to the frontend
        $frontendUrl = env('FRONTEND_URL', 'http://127.0.0.1:3000');
        $resetUrl = $frontendUrl . '/reset-password?token=' . $token . '&email=' . urlencode($user->email);

        try {
            Mail::to($user->email)->send(new ResetPasswordMail($resetUrl, $user->name));
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to send reset email. Please try again later.'
            ], 500);
        }

        return response()->json([
            'message' => 'If your email is registered, we have sent you a password reset link.'
        ]);
    }

    /**
     * Reset the given user's password.
     */
    public function resetPassword(Request $request): JsonResponse
    {
        $request->validate([
            'token' => 'required|string',
            'email' => 'required|email',
            'password' => 'required|string|min:8|confirmed',
        ]);

        // Attempt password reset using Laravel's built-in broker
        $status = Password::broker()->reset(
            $request->only('email', 'password', 'password_confirmation', 'token'),
            function ($user, $password) {
                $user->forceFill([
                    'password' => Hash::make($password)
                ])->setRememberToken(Str::random(60));

                $user->save();
            }
        );

        if ($status === Password::PASSWORD_RESET) {
            return response()->json([
                'message' => 'Your password has been successfully reset!'
            ]);
        }

        // Handle specific errors
        $errorMessage = 'Invalid token or email address.';
        if ($status === Password::INVALID_USER) {
            $errorMessage = 'We cannot find a user with that email address.';
        } elseif ($status === Password::RESET_THROTTLED) {
            $errorMessage = 'Please wait before retrying.';
        }

        return response()->json([
            'message' => $errorMessage
        ], 400);
    }
}
