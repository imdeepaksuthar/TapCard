<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class NfcCard extends Model
{
    use HasFactory;

    protected $fillable = [
        'card_id',
        'nfc_tag_uid',
        'order_status',
        'tracking_number',
    ];

    /**
     * Get the business card associated with this NFC card.
     */
    public function businessCard()
    {
        return $this->belongsTo(BusinessCard::class, 'card_id');
    }
}
