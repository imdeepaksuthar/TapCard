<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Category extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'slug',
        'type',
        'parent_id',
    ];

    /**
     * Get the parent category.
     */
    public function parent()
    {
        return $this->belongsTo(Category::class, 'parent_id');
    }

    /**
     * Get the subcategories.
     */
    public function children()
    {
        return $this->hasMany(Category::class, 'parent_id');
    }

    /**
     * Get the business cards associated with this category.
     */
    public function businessCards()
    {
        return $this->hasMany(BusinessCard::class, 'category_id');
    }

    /**
     * Get the business cards associated with this subcategory.
     */
    public function subcategoryBusinessCards()
    {
        return $this->hasMany(BusinessCard::class, 'subcategory_id');
    }
}
