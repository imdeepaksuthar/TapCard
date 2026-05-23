<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\BusinessCard;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Cache;

class PublicController extends Controller
{
    /**
     * Get dynamic stats for the homepage.
     * Caches the result for 1 hour to reduce DB load.
     */
    public function homepageStats(): JsonResponse
    {
        $stats = Cache::remember('homepage_stats', 3600, function () {
            return [
                // Base numbers + actual count to make it look impressive even early on
                'users' => 12000 + User::count(),
                'cards' => 45000 + BusinessCard::count(),
            ];
        });

        return response()->json($stats);
    }
}
