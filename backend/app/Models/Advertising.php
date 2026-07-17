<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Advertising extends Model
{
    protected $fillable = [
        'title',
        'image_path',
        'target_url',
        'position',
        'status',
        'start_date',
        'end_date',
        'views',
        'clicks',
    ];

    protected $casts = [
        'start_date' => 'date',
        'end_date' => 'date',
        'views' => 'integer',
        'clicks' => 'integer',
    ];
}
