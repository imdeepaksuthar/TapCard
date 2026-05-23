<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Lead;
use App\Models\BusinessCard;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class LeadController extends Controller
{
    /**
     * Display a listing of the leads for the user's cards.
     */
    public function index(): JsonResponse
    {
        $leads = Lead::whereHas('businessCard', function ($query) {
            $query->where('user_id', auth()->id());
        })
        ->with('businessCard:id,slug')
        ->orderBy('created_at', 'desc')
        ->get();

        return response()->json([
            'leads' => $leads
        ]);
    }

    /**
     * Store a newly created lead in storage (Public endpoint).
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'card_id' => 'required|exists:business_cards,id',
            'name' => 'required|string|max:255',
            'email' => 'nullable|email|max:255',
            'phone' => 'nullable|string|max:20',
            'message' => 'nullable|string',
        ]);

        $lead = Lead::create([
            'card_id' => $validated['card_id'],
            'name' => $validated['name'],
            'email' => $validated['email'],
            'phone' => $validated['phone'],
            'message' => $validated['message'],
            'status' => 'new',
        ]);

        // Load the associated card and its owner
        $card = BusinessCard::with('user')->find($validated['card_id']);

        if ($card && $card->user) {
            // 1. In-App Notification to Card Owner
            $card->user->notify(new \App\Notifications\NewLeadReceived($lead));

            // 2. Email Notification
            if ($card->user->email) {
                $adminEmails = \App\Models\User::where('role', 'super_admin')->pluck('email')->toArray();
                
                \Illuminate\Support\Facades\Mail::to($card->user->email)
                    ->bcc($adminEmails)
                    ->send(new \App\Mail\NewLeadNotification($lead));
            }
        }
        
        // 3. In-App Notification to Admins
        $admins = \App\Models\User::where('role', 'super_admin')->get();
        if ($admins->isNotEmpty()) {
            \Illuminate\Support\Facades\Notification::send($admins, new \App\Notifications\NewLeadReceived($lead));
        }

        return response()->json([
            'message' => 'Lead captured successfully',
            'lead' => $lead
        ], 201);
    }

    /**
     * Update the specified lead in storage.
     */
    public function update(Request $request, string $id): JsonResponse
    {
        $lead = Lead::whereHas('businessCard', function ($query) {
            $query->where('user_id', auth()->id());
        })
        ->where('id', $id)
        ->firstOrFail();

        $validated = $request->validate([
            'status' => 'required|string|in:new,read,archived',
        ]);

        $lead->update([
            'status' => $validated['status']
        ]);

        return response()->json([
            'message' => 'Lead status updated successfully',
            'lead' => $lead
        ]);
    }

    /**
     * Remove the specified lead from storage.
     */
    public function destroy(string $id): JsonResponse
    {
        $lead = Lead::whereHas('businessCard', function ($query) {
            $query->where('user_id', auth()->id());
        })
        ->where('id', $id)
        ->firstOrFail();

        $lead->delete();

        return response()->json([
            'message' => 'Lead deleted successfully'
        ]);
    }
}
