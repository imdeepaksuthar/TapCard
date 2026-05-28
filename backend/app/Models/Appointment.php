<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Appointment extends Model
{
    use HasFactory;

    protected $fillable = [
        'business_card_id',
        'user_id',
        'name',
        'email',
        'phone',
        'date',
        'time',
        'notes',
        'status',
    ];

    public function businessCard()
    {
        return $this->belongsTo(BusinessCard::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
