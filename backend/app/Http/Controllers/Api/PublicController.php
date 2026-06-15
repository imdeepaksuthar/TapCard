<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\BusinessCard;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

class PublicController extends Controller
{
    /**
     * Get dynamic stats for the homepage.
     */
    public function homepageStats(): JsonResponse
    {
        $stats = Cache::remember('homepage_stats', 3600, function () {
            return [
                'users' => 12000 + User::count(),
                'cards' => 45000 + BusinessCard::count(),
            ];
        });

        return response()->json($stats);
    }

    /**
     * Search active business cards by name, designation, or company.
     */
    public function searchCards(Request $request): JsonResponse
    {
        $q = trim($request->query('q', ''));

        if (strlen($q) < 2) {
            return response()->json([]);
        }

        $cards = BusinessCard::where('status', 'active')
            ->where(function ($query) use ($q) {
                $query->where('personal_info->name', 'like', "%{$q}%")
                      ->orWhere('personal_info->designation', 'like', "%{$q}%")
                      ->orWhere('personal_info->company_name', 'like', "%{$q}%")
                      ->orWhere('company_details->company_name', 'like', "%{$q}%")
                      ->orWhere('slug', 'like', "%{$q}%");
            })
            ->orderBy('views_count', 'desc')
            ->limit(8)
            ->get(['id', 'slug', 'personal_info', 'company_details', 'profile_image', 'views_count', 'template_id']);

        $results = $cards->map(function ($card) {
            $info = is_array($card->personal_info) ? $card->personal_info : [];
            $company = is_array($card->company_details) ? $card->company_details : [];

            return [
                'slug' => $card->slug,
                'name' => $info['name'] ?? 'Untitled',
                'designation' => $info['designation'] ?? null,
                'company' => $company['company_name'] ?? $info['company_name'] ?? null,
                'image' => $card->profile_image ?? $info['profile_image'] ?? null,
                'views' => $card->views_count,
                'type' => $card->template_id ?? 'personal',
            ];
        });

        return response()->json($results);
    }

    /**
     * Get recently added active business cards.
     */
    public function recentCards(): JsonResponse
    {
        $cards = Cache::remember('recent_cards', 300, function () {
            return BusinessCard::where('status', 'active')
                ->orderBy('created_at', 'desc')
                ->limit(6)
                ->get(['id', 'slug', 'personal_info', 'company_details', 'profile_image', 'views_count', 'template_id', 'created_at'])
                ->map(function ($card) {
                    $info = is_array($card->personal_info) ? $card->personal_info : [];
                    $company = is_array($card->company_details) ? $card->company_details : [];

                    return [
                        'slug' => $card->slug,
                        'name' => $info['name'] ?? 'Untitled',
                        'designation' => $info['designation'] ?? null,
                        'company' => $company['company_name'] ?? $info['company_name'] ?? null,
                        'image' => $card->profile_image ?? $info['profile_image'] ?? null,
                        'views' => $card->views_count,
                        'type' => $card->template_id ?? 'personal',
                    ];
                });
        });

        return response()->json($cards);
    }

    /**
     * Get all active SaaS plans.
     */
    public function plans(): JsonResponse
    {
        $plans = Cache::remember('public_plans', 3600, function () {
            return \App\Models\Plan::orderBy('price', 'asc')->get()->toArray();
        });

        return response()->json($plans);
    }

    /**
     * Get all active designations.
     */
    public function designations(): JsonResponse
    {
        $designations = Cache::remember('public_designations', 3600, function () {
            return \App\Models\Designation::where('status', 'active')->orderBy('name')->get(['id', 'name'])->toArray();
        });

        return response()->json(['designations' => $designations]);
    }
}
