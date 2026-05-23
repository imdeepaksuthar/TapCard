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
        $pendingNfcCount = 0;

        try {
            $totalUsers = DB::table('users')->where('role', 'user')->count();
            $activeUsers = DB::table('users')->where('role', 'user')->where('status', 'active')->count();
            
            if (DB::getSchemaBuilder()->hasTable('subscriptions') && DB::getSchemaBuilder()->hasTable('plans')) {
                $totalEarnings = DB::table('subscriptions')
                    ->join('plans', 'subscriptions.plan_id', '=', 'plans.id')
                    ->where('subscriptions.status', 'active')
                    ->sum('plans.price');
            }

            if (DB::getSchemaBuilder()->hasTable('nfc_cards')) {
                $pendingNfcCount = DB::table('nfc_cards')->where('order_status', 'pending')->count();
            }
        } catch (\Exception $e) {
            // Ignored if tables are not fully migrated
        }

        return view('admin.dashboard', compact(
            'totalUsers',
            'activeUsers',
            'totalEarnings',
            'pendingNfcCount'
        ));
    }
}
