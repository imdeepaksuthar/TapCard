<?php

namespace App\Http\Controllers;

use App\Mail\OrderAdminNotification;
use App\Mail\OrderCustomerConfirmation;
use App\Models\BusinessCard;
use App\Models\Order;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Validator;

class OrderController extends Controller
{
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'card_slug' => 'required|string',
            'order_data' => 'required|array',
            'order_data.name' => 'required|string',
            'order_data.phone' => 'required|string',
            'order_data.email' => 'required|email',
            'cart_items' => 'required|array',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $card = BusinessCard::where('slug', $request->card_slug)->first();

        if (!$card) {
            return response()->json(['message' => 'Card not found'], 404);
        }

        // Get the card owner's email
        // We look at social_links for email, or user relationship
        $socialLinks = is_string($card->social_links) ? json_decode($card->social_links, true) : $card->social_links;
        $adminEmail = $socialLinks['email'] ?? null;
        
        if (!$adminEmail && $card->user) {
            $adminEmail = $card->user->email;
        }

        if (!$adminEmail) {
            return response()->json(['message' => 'Admin email not configured for this card'], 400);
        }

        $orderData = $request->order_data;
        $cartItems = $request->cart_items;

        $personalInfo = is_string($card->personal_info) ? json_decode($card->personal_info, true) : $card->personal_info;
        $contactButtons = is_string($card->contact_buttons) ? json_decode($card->contact_buttons, true) : $card->contact_buttons;
        
        $contactInfo = [
            'name' => $personalInfo['name'] ?? null,
            'email' => $adminEmail,
            'phone' => $contactButtons['call'] ?? $socialLinks['phone'] ?? $socialLinks['call'] ?? null,
            'whatsapp' => $contactButtons['whatsapp'] ?? $socialLinks['whatsapp'] ?? null,
        ];

        // Calculate total
        $totalAmount = 0;
        foreach ($cartItems as $item) {
            $totalAmount += ($item['price'] ?? 0) * ($item['quantity'] ?? 1);
        }

        // Save Order to Database
        $order = Order::create([
            'user_id' => $card->user_id,
            'business_card_id' => $card->id,
            'customer_name' => $orderData['name'],
            'customer_email' => $orderData['email'],
            'customer_phone' => $orderData['phone'],
            'total_amount' => $totalAmount,
            'status' => 'pending',
            'cart_items' => $cartItems,
            'order_data' => $orderData,
        ]);

        // Send Email to Admin
        Mail::to($adminEmail)->send(new OrderAdminNotification($orderData, $cartItems));

        // Send Email to Customer
        Mail::to($orderData['email'])->send(new OrderCustomerConfirmation($orderData, $cartItems, $contactInfo));

        // In-App Notification to Card Owner
        if ($card->user) {
            $card->user->notify(new \App\Notifications\NewOrderReceived($orderData, $card->card_name ?? 'your card'));
        }

        // In-App Notification to Admins
        $admins = \App\Models\User::where('role', 'super_admin')->get();
        if ($admins->isNotEmpty()) {
            \Illuminate\Support\Facades\Notification::send($admins, new \App\Notifications\NewOrderReceived($orderData, $card->card_name ?? 'a card'));
        }

        return response()->json(['message' => 'Order placed successfully']);
    }
    public function index(Request $request)
    {
        $user = $request->user();
        $query = Order::with('businessCard');

        if ($user->role !== 'super_admin') {
            $query->where('user_id', $user->id);
        }

        $orders = $query->orderBy('created_at', 'desc')->get();

        return response()->json(['orders' => $orders]);
    }

    public function update(Request $request, $id)
    {
        $user = $request->user();
        $order = Order::findOrFail($id);

        if ($user->role !== 'super_admin' && $order->user_id !== $user->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validator = Validator::make($request->all(), [
            'status' => 'required|in:pending,completed,cancelled',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $order->status = $request->status;
        $order->save();

        return response()->json(['message' => 'Order updated successfully', 'order' => $order]);
    }

    public function destroy(Request $request, $id)
    {
        $user = $request->user();
        $order = Order::findOrFail($id);

        if ($user->role !== 'super_admin' && $order->user_id !== $user->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $order->delete();

        return response()->json(['message' => 'Order deleted successfully']);
    }
}
