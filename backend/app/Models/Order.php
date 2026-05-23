<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Order extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'business_card_id',
        'customer_name',
        'customer_email',
        'customer_phone',
        'total_amount',
        'status',
        'cart_items',
        'order_data',
    ];

    protected $casts = [
        'cart_items' => 'array',
        'order_data' => 'array',
        'total_amount' => 'decimal:2',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function businessCard()
    {
        return $this->belongsTo(BusinessCard::class);
    }
}
