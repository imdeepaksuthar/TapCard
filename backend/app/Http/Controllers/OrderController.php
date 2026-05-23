<?php

namespace App\Http\Controllers;

use App\Mail\OrderAdminNotification;
use App\Mail\OrderCustomerConfirmation;
use App\Models\BusinessCard;
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

        // Send Email to Admin
        Mail::to($adminEmail)->send(new OrderAdminNotification($orderData, $cartItems));

        // Send Email to Customer
        Mail::to($orderData['email'])->send(new OrderCustomerConfirmation($orderData, $cartItems, $contactInfo));

        return response()->json(['message' => 'Order placed successfully']);
    }
}
