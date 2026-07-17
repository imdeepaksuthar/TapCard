<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    /**
     * Display the super admin dashboard.
     */
    public function index()
    {
        // Fallback checks if models aren't fully set up yet
        $totalUsers = 0;
        $activeUsers = 0;
        $totalEarnings = 0;
        try {
            $totalUsers = DB::table('users')->where('role', 'user')->count();
            $activeUsers = DB::table('users')->where('role', 'user')->where('status', 'active')->count();
            
            if (DB::getSchemaBuilder()->hasTable('subscriptions') && DB::getSchemaBuilder()->hasTable('plans')) {
                $totalEarnings = DB::table('subscriptions')
                    ->join('plans', 'subscriptions.plan_id', '=', 'plans.id')
                    ->where('subscriptions.status', 'active')
                    ->sum('plans.price');
            }
        } catch (\Exception $e) {
            // Ignored if tables are not fully migrated
        }

        $dashboardAds = \App\Models\Advertising::where('status', 'active')
            ->where('position', 'dashboard')
            ->where(function($q) {
                $q->whereNull('start_date')->orWhere('start_date', '<=', now());
            })
            ->where(function($q) {
                $q->whereNull('end_date')->orWhere('end_date', '>=', now());
            })
            ->inRandomOrder()
            ->limit(1)
            ->get();

        $sidebarAds = \App\Models\Advertising::where('status', 'active')
            ->where('position', 'sidebar')
            ->where(function($q) {
                $q->whereNull('start_date')->orWhere('start_date', '<=', now());
            })
            ->where(function($q) {
                $q->whereNull('end_date')->orWhere('end_date', '>=', now());
            })
            ->inRandomOrder()
            ->limit(1)
            ->get();

        foreach ($dashboardAds as $ad) {
            $ad->increment('views');
        }
        foreach ($sidebarAds as $ad) {
            $ad->increment('views');
        }

        return view('admin.dashboard', compact(
            'totalUsers',
            'activeUsers',
            'totalEarnings',
            'dashboardAds',
            'sidebarAds'
        ));
    }
}
