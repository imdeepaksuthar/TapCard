<?php

namespace App\Jobs;

use App\Models\User;
use App\Mail\WelcomeUserMail;
use App\Mail\NewUserAdminMail;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Mail;

class SendWelcomeEmailsJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public $user;

    /**
     * Create a new job instance.
     */
    public function __construct(User $user)
    {
        $this->user = $user;
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        // 1. Send Welcome Email to the User
        Mail::to($this->user->email)->send(new WelcomeUserMail($this->user));

        // 2. Send Alert Email to Super Admins
        $admins = User::where('role', 'super_admin')->get();
        foreach ($admins as $admin) {
            Mail::to($admin->email)->send(new NewUserAdminMail($this->user));
        }
    }
}
