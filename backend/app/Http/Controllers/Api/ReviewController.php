<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Review;
use App\Models\BusinessCard;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ReviewController extends Controller
{
    /**
     * List reviews for a specific card (Public endpoint).
     * Optionally accepts device_id to check if the device already reviewed.
     */
    public function index(Request $request): JsonResponse
    {
        $request->validate([
            'card_id' => 'required|exists:business_cards,id',
            'device_id' => 'nullable|string|max:64',
        ]);

        $reviews = Review::where('card_id', $request->card_id)
            ->orderBy('created_at', 'desc')
            ->get();

        $avgRating = $reviews->avg('rating') ?? 0;
        $totalReviews = $reviews->count();

        // Check if this device already submitted a review
        $hasReviewed = false;
        if ($request->device_id) {
            $hasReviewed = Review::where('card_id', $request->card_id)
                ->where('device_id', $request->device_id)
                ->exists();
        }

        return response()->json([
            'reviews' => $reviews,
            'avg_rating' => round($avgRating, 1),
            'total_reviews' => $totalReviews,
            'has_reviewed' => $hasReviewed,
        ]);
    }

    /**
     * Store a new review (Public endpoint).
     * Enforces one review per device_id per card.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'card_id' => 'required|exists:business_cards,id',
            'device_id' => 'required|string|max:64',
            'reviewer_name' => 'required|string|max:255',
            'reviewer_email' => 'nullable|email|max:255',
            'rating' => 'required|integer|min:1|max:5',
            'comment' => 'nullable|string|max:1000',
        ]);

        // Check if this device already reviewed this card
        $existing = Review::where('card_id', $validated['card_id'])
            ->where('device_id', $validated['device_id'])
            ->first();

        if ($existing) {
            return response()->json([
                'message' => 'You have already submitted a review for this card.',
                'already_reviewed' => true,
            ], 409);
        }

        $review = Review::create($validated);

        // Recalculate averages
        $reviews = Review::where('card_id', $validated['card_id']);
        $avgRating = $reviews->avg('rating') ?? 0;
        $totalReviews = $reviews->count();

        return response()->json([
            'message' => 'Review submitted successfully',
            'review' => $review,
            'avg_rating' => round($avgRating, 1),
            'total_reviews' => $totalReviews,
        ], 201);
    }

    /**
     * Delete a review (Authenticated - card owner only).
     */
    public function destroy(string $id): JsonResponse
    {
        $review = Review::whereHas('businessCard', function ($query) {
            $query->where('user_id', auth()->id());
        })
        ->where('id', $id)
        ->firstOrFail();

        $review->delete();

        return response()->json([
            'message' => 'Review deleted successfully'
        ]);
    }
}
