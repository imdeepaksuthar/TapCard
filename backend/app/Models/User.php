<?php

namespace App\Models;

use Illuminate\Contracts\Auth\MustVerifyEmail;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

#[Fillable(['name', 'email', 'phone', 'password', 'role', 'status', 'google_id', 'avatar'])]
#[Hidden(['password', 'remember_token'])]
class User extends Authenticatable implements MustVerifyEmail
{
    /** @use HasFactory<UserFactory> */
    use HasApiTokens, HasFactory, Notifiable;

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    /**
     * Check if the user is a super admin.
     */
    public function isSuperAdmin(): bool
    {
        return $this->role === 'super_admin';
    }

    /**
     * Check if the user is an admin.
     */
    public function isAdmin(): bool
    {
        return in_array($this->role, ['admin', 'super_admin']);
    }

    /**
     * Check if the user has a specific permission.
     * For now, we can base it on roles.
     */
    public function hasPermission(string $permission): bool
    {
        // Example simple permission mapping
        $permissions = [
            'manage_plans' => ['super_admin', 'admin'],
            'manage_nfc' => ['super_admin', 'admin'],
            'manage_users' => ['super_admin'],
            'manage_admins' => ['super_admin'],
        ];

        if (!isset($permissions[$permission])) {
            return false;
        }

        return in_array($this->role, $permissions[$permission]);
    }

    /**
     * Get the business cards created by the user.
     */
    public function businessCards()
    {
        return $this->hasMany(BusinessCard::class);
    }
}
