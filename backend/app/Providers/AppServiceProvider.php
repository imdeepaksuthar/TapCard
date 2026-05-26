<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;

use Illuminate\Auth\Notifications\VerifyEmail;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        VerifyEmail::createUrlUsing(function ($notifiable) {
            $frontendUrl = env('FRONTEND_URL', 'http://127.0.0.1:3000');
            $id = $notifiable->getKey();
            $hash = sha1($notifiable->getEmailForVerification());
            
            return "{$frontendUrl}/verify-email/{$id}/{$hash}";
        });

        VerifyEmail::toMailUsing(function ($notifiable, $url) {
            return (new \Illuminate\Notifications\Messages\MailMessage)
                ->subject('Verify Email Address - Card Setu')
                ->view('emails.verify_email', [
                    'userName' => $notifiable->name,
                    'verifyUrl' => $url,
                ]);
        });
    }
}
