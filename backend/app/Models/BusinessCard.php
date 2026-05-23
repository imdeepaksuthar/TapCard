<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class BusinessCard extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'slug',
        'template_id',
        'status',
        'category_id',
        'subcategory_id',
        'profile_image',
        'company_logo',
        'brochure_path',
        'personal_info',
        'contact_buttons',
        'social_links',
        'custom_links',
        'company_details',
        'payment_info',
        'gallery',
        'documents',
        'location_info',
        'proprietor_details',
        'gallery_content',
        'opening_hours',
        'brochure_pdfs',
        'custom_branding',
        'seo_metadata',
        'views_count',
    ];

    protected $casts = [
        'personal_info' => 'array',
        'contact_buttons' => 'array',
        'social_links' => 'array',
        'custom_links' => 'array',
        'company_details' => 'array',
        'payment_info' => 'array',
        'gallery' => 'array',
        'documents' => 'array',
        'location_info' => 'array',
        'proprietor_details' => 'array',
        'gallery_content' => 'array',
        'opening_hours' => 'array',
        'brochure_pdfs' => 'array',
        'custom_branding' => 'array',
        'seo_metadata' => 'array',
        'views_count' => 'integer',
        'category_id' => 'integer',
        'subcategory_id' => 'integer',
    ];

    /**
     * Get the category for the card.
     */
    public function category()
    {
        return $this->belongsTo(Category::class, 'category_id');
    }

    /**
     * Get the subcategory for the card.
     */
    public function subcategory()
    {
        return $this->belongsTo(Category::class, 'subcategory_id');
    }

    /**
     * Get the user that owns the business card.
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the NFC cards associated with this business card.
     */
    public function nfcCards()
    {
        return $this->hasMany(NfcCard::class, 'card_id');
    }
}
