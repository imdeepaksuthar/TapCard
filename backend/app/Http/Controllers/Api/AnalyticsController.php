<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\BusinessCard;
use App\Models\Lead;
use App\Models\Order;
use App\Models\Appointment;
use App\Models\Product;
use App\Models\Service;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class AnalyticsController extends Controller
{
    /**
     * Full analytics summary for the authenticated user.
     */
    public function summary(Request $request): JsonResponse
    {
        $userId = auth()->id();
        $days = (int) $request->query('days', 30);
        $startDate = Carbon::now()->subDays($days)->startOfDay();

        // Get user's card IDs
        $cardIds = BusinessCard::where('user_id', $userId)->pluck('id');
        $cards = BusinessCard::where('user_id', $userId)->get();

        // ─── Overview metrics ───
        $totalViews = $cards->sum('views_count');
        $totalCards = $cards->count();
        $activeCards = $cards->where('status', 'active')->count();

        $totalLeads = Lead::whereIn('card_id', $cardIds)->count();
        $newLeads = Lead::whereIn('card_id', $cardIds)->where('status', 'new')->count();
        $leadsThisPeriod = Lead::whereIn('card_id', $cardIds)
            ->where('created_at', '>=', $startDate)->count();

        $totalOrders = Order::where('user_id', $userId)->count();
        $ordersThisPeriod = Order::where('user_id', $userId)
            ->where('created_at', '>=', $startDate)->count();
        $totalRevenue = Order::where('user_id', $userId)
            ->whereIn('status', ['pending', 'completed'])->sum('total_amount');
        $revenueThisPeriod = Order::where('user_id', $userId)
            ->whereIn('status', ['pending', 'completed'])
            ->where('created_at', '>=', $startDate)->sum('total_amount');
        $avgOrderValue = Order::where('user_id', $userId)
            ->whereIn('status', ['pending', 'completed'])->avg('total_amount') ?? 0;

        $totalAppointments = Appointment::whereIn('business_card_id', $cardIds)->count();
        $appointmentsThisPeriod = Appointment::whereIn('business_card_id', $cardIds)
            ->where('created_at', '>=', $startDate)->count();
        $pendingAppointments = Appointment::whereIn('business_card_id', $cardIds)
            ->where('status', 'pending')->count();

        $totalProducts = Product::where('user_id', $userId)->count();
        $totalServices = Service::where('user_id', $userId)->count();

        // ─── Conversion funnel ───
        $conversionRate = $totalViews > 0 ? round(($totalLeads / $totalViews) * 100, 1) : 0;
        $orderConversion = $totalLeads > 0 ? round(($totalOrders / $totalLeads) * 100, 1) : 0;

        // ─── Leads by day (for chart) ───
        $leadsByDay = Lead::whereIn('card_id', $cardIds)
            ->where('created_at', '>=', $startDate)
            ->select(DB::raw('DATE(created_at) as date'), DB::raw('COUNT(*) as count'))
            ->groupBy('date')
            ->orderBy('date')
            ->get()
            ->pluck('count', 'date')
            ->toArray();

        // ─── Orders by day (for chart) ───
        $ordersByDay = Order::where('user_id', $userId)
            ->where('created_at', '>=', $startDate)
            ->select(DB::raw('DATE(created_at) as date'), DB::raw('COUNT(*) as count'))
            ->groupBy('date')
            ->orderBy('date')
            ->get()
            ->pluck('count', 'date')
            ->toArray();

        // ─── Revenue by day (for chart) ───
        $revenueByDay = Order::where('user_id', $userId)
            ->whereIn('status', ['pending', 'completed'])
            ->where('created_at', '>=', $startDate)
            ->select(DB::raw('DATE(created_at) as date'), DB::raw('SUM(total_amount) as total'))
            ->groupBy('date')
            ->orderBy('date')
            ->get()
            ->pluck('total', 'date')
            ->toArray();

        // Fill in missing days with zero
        $period = [];
        $leadsSeries = [];
        $ordersSeries = [];
        $revenueSeries = [];
        for ($d = 0; $d < $days; $d++) {
            $date = Carbon::now()->subDays($days - 1 - $d)->format('Y-m-d');
            $period[] = $date;
            $leadsSeries[] = (int) ($leadsByDay[$date] ?? 0);
            $ordersSeries[] = (int) ($ordersByDay[$date] ?? 0);
            $revenueSeries[] = (float) ($revenueByDay[$date] ?? 0);
        }

        // ─── Card performance (per card) ───
        $cardPerformance = $cards->map(function ($card) use ($cardIds) {
            $cardLeads = Lead::where('card_id', $card->id)->count();
            $cardOrders = Order::where('business_card_id', $card->id)->count();
            $cardAppointments = Appointment::where('business_card_id', $card->id)->count();
            $personalInfo = is_array($card->personal_info) ? $card->personal_info : [];

            return [
                'id' => $card->id,
                'name' => $personalInfo['name'] ?? 'Untitled Card',
                'slug' => $card->slug,
                'views' => $card->views_count,
                'leads' => $cardLeads,
                'orders' => $cardOrders,
                'appointments' => $cardAppointments,
                'status' => $card->status,
                'conversion' => $card->views_count > 0
                    ? round(($cardLeads / $card->views_count) * 100, 1)
                    : 0,
            ];
        })->sortByDesc('views')->values();

        // ─── Recent leads ───
        $recentLeads = Lead::whereIn('card_id', $cardIds)
            ->with('businessCard:id,slug,personal_info')
            ->orderBy('created_at', 'desc')
            ->limit(10)
            ->get()
            ->map(fn($lead) => [
                'id' => $lead->id,
                'name' => $lead->name,
                'email' => $lead->email,
                'phone' => $lead->phone,
                'status' => $lead->status,
                'card_name' => $lead->businessCard?->personal_info['name'] ?? 'Unknown',
                'created_at' => $lead->created_at->toISOString(),
            ]);

        // ─── Recent orders ───
        $recentOrders = Order::where('user_id', $userId)
            ->orderBy('created_at', 'desc')
            ->limit(10)
            ->get()
            ->map(fn($order) => [
                'id' => $order->id,
                'customer' => $order->customer_name,
                'email' => $order->customer_email,
                'total' => (float) $order->total_amount,
                'status' => $order->status,
                'items_count' => is_array($order->cart_items) ? count($order->cart_items) : 0,
                'created_at' => $order->created_at->toISOString(),
            ]);

        // ─── Appointment status breakdown ───
        $appointmentsByStatus = Appointment::whereIn('business_card_id', $cardIds)
            ->select('status', DB::raw('COUNT(*) as count'))
            ->groupBy('status')
            ->pluck('count', 'status')
            ->toArray();

        // ─── Lead status breakdown ───
        $leadsByStatus = Lead::whereIn('card_id', $cardIds)
            ->select('status', DB::raw('COUNT(*) as count'))
            ->groupBy('status')
            ->pluck('count', 'status')
            ->toArray();

        // ─── Order status breakdown ───
        $ordersByStatus = Order::where('user_id', $userId)
            ->select('status', DB::raw('COUNT(*) as count'))
            ->groupBy('status')
            ->pluck('count', 'status')
            ->toArray();

        // ─── Top products by order frequency ───
        $topProducts = [];
        $completedOrders = Order::where('user_id', $userId)
            ->whereIn('status', ['pending', 'completed'])
            ->whereNotNull('cart_items')
            ->get();
        $productCounts = [];
        foreach ($completedOrders as $order) {
            $items = is_array($order->cart_items) ? $order->cart_items : [];
            foreach ($items as $item) {
                $name = $item['name'] ?? 'Unknown';
                if (!isset($productCounts[$name])) {
                    $productCounts[$name] = ['name' => $name, 'count' => 0, 'revenue' => 0];
                }
                $qty = (int) ($item['quantity'] ?? 1);
                $price = (float) ($item['price'] ?? 0);
                $productCounts[$name]['count'] += $qty;
                $productCounts[$name]['revenue'] += $qty * $price;
            }
        }
        usort($productCounts, fn($a, $b) => $b['revenue'] <=> $a['revenue']);
        $topProducts = array_slice($productCounts, 0, 5);

        return response()->json([
            'overview' => [
                'total_views' => $totalViews,
                'total_cards' => $totalCards,
                'active_cards' => $activeCards,
                'total_leads' => $totalLeads,
                'new_leads' => $newLeads,
                'leads_period' => $leadsThisPeriod,
                'total_orders' => $totalOrders,
                'orders_period' => $ordersThisPeriod,
                'total_revenue' => round($totalRevenue, 2),
                'revenue_period' => round($revenueThisPeriod, 2),
                'avg_order_value' => round($avgOrderValue, 2),
                'total_appointments' => $totalAppointments,
                'appointments_period' => $appointmentsThisPeriod,
                'pending_appointments' => $pendingAppointments,
                'total_products' => $totalProducts,
                'total_services' => $totalServices,
                'conversion_rate' => $conversionRate,
                'order_conversion' => $orderConversion,
            ],
            'charts' => [
                'period' => $period,
                'leads' => $leadsSeries,
                'orders' => $ordersSeries,
                'revenue' => $revenueSeries,
            ],
            'breakdowns' => [
                'leads_by_status' => $leadsByStatus,
                'orders_by_status' => $ordersByStatus,
                'appointments_by_status' => $appointmentsByStatus,
            ],
            'card_performance' => $cardPerformance,
            'top_products' => $topProducts,
            'recent_leads' => $recentLeads,
            'recent_orders' => $recentOrders,
            'days' => $days,
        ]);
    }
}
