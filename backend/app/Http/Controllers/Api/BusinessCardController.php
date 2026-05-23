<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\BusinessCard;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class BusinessCardController extends Controller
{
    /**
     * Display a listing of the user's business cards.
     */
    public function index(): JsonResponse
    {
        $cards = BusinessCard::where('user_id', auth()->id())
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'cards' => $cards
        ]);
    }

    /**
     * Store a newly created business card in storage.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'slug' => 'required|string|unique:business_cards,slug',
            'template_id' => 'nullable|string',
            'personal_info' => 'nullable|array',
            'contact_buttons' => 'nullable|array',
            'social_links' => 'nullable|array',
            'custom_links' => 'nullable|array',
            'company_details' => 'nullable|array',
            'payment_info' => 'nullable|array',
            'gallery' => 'nullable|array',
            'documents' => 'nullable|array',
            'location_info' => 'nullable|array',
            'custom_branding' => 'nullable|array',
            'seo_metadata' => 'nullable|array',
        ]);

        $card = BusinessCard::create([
            'user_id' => auth()->id(),
            'slug' => $validated['slug'],
            'template_id' => $validated['template_id'] ?? null,
            'status' => 'active',
            'personal_info' => $validated['personal_info'] ?? [],
            'contact_buttons' => $validated['contact_buttons'] ?? [],
            'social_links' => $validated['social_links'] ?? [],
            'custom_links' => $validated['custom_links'] ?? [],
            'company_details' => $validated['company_details'] ?? [],
            'payment_info' => $validated['payment_info'] ?? [],
            'gallery' => $validated['gallery'] ?? [],
            'documents' => $validated['documents'] ?? [],
            'location_info' => $validated['location_info'] ?? [],
            'custom_branding' => $validated['custom_branding'] ?? [],
            'seo_metadata' => $validated['seo_metadata'] ?? [],
            'views_count' => 0,
        ]);

        return response()->json([
            'message' => 'Business card created successfully',
            'card' => $card
        ], 201);
    }

    /**
     * Display the specified business card.
     */
    public function show(string $id): JsonResponse
    {
        $card = BusinessCard::where('user_id', auth()->id())
            ->where('id', $id)
            ->firstOrFail();

        return response()->json([
            'card' => $card
        ]);
    }

    /**
     * Update the specified business card in storage.
     */
    public function update(Request $request, string $id): JsonResponse
    {
        $card = BusinessCard::where('user_id', auth()->id())
            ->where('id', $id)
            ->firstOrFail();

        $validated = $request->validate([
            'slug' => 'nullable|string|unique:business_cards,slug,' . $id,
            'template_id' => 'nullable|string',
            'status' => 'nullable|string|in:active,inactive',
            'personal_info' => 'nullable|array',
            'contact_buttons' => 'nullable|array',
            'social_links' => 'nullable|array',
            'custom_links' => 'nullable|array',
            'company_details' => 'nullable|array',
            'payment_info' => 'nullable|array',
            'gallery' => 'nullable|array',
            'documents' => 'nullable|array',
            'location_info' => 'nullable|array',
            'custom_branding' => 'nullable|array',
            'seo_metadata' => 'nullable|array',
        ]);

        $card->update(array_filter($validated));

        return response()->json([
            'message' => 'Business card updated successfully',
            'card' => $card
        ]);
    }

    /**
     * Remove the specified business card from storage.
     */
    public function destroy(string $id): JsonResponse
    {
        $card = BusinessCard::where('user_id', auth()->id())
            ->where('id', $id)
            ->firstOrFail();

        $card->delete();

        return response()->json([
            'message' => 'Business card deleted successfully'
        ]);
    }

    /**
     * Display the specified business card publicly by slug.
     */
    public function showPublic(string $slug): JsonResponse
    {
        $card = BusinessCard::where('slug', $slug)
            ->where('status', 'active')
            ->firstOrFail();

        // Increment views count
        $card->increment('views_count');

        // Load theme if available
        $theme = null;
        if (isset($card->custom_branding['theme_color'])) {
            $theme = \App\Models\Theme::where('name', $card->custom_branding['theme_color'])
                ->where('is_active', true)
                ->first();
        }

        return response()->json([
            'card' => $card,
            'theme' => $theme
        ]);
    }

    /**
     * Download vCard for the specified business card.
     */
    public function downloadVCard(string $slug)
    {
        $card = BusinessCard::where('slug', $slug)
            ->where('status', 'active')
            ->firstOrFail();

        $personalInfo = $card->personal_info;
        $name = $personalInfo['name'] ?? 'Contact';
        $phone = $personalInfo['phone'] ?? '';
        $email = $personalInfo['email'] ?? '';
        $title = $personalInfo['designation'] ?? '';
        $company = $personalInfo['company_name'] ?? '';

        $vcard = "BEGIN:VCARD\n";
        $vcard .= "VERSION:3.0\n";
        $vcard .= "FN:{$name}\n";
        if ($title) $vcard .= "TITLE:{$title}\n";
        if ($company) $vcard .= "ORG:{$company}\n";
        if ($phone) $vcard .= "TEL;TYPE=CELL:{$phone}\n";
        if ($email) $vcard .= "EMAIL:{$email}\n";
        $vcard .= "END:VCARD";

        return response($vcard)
            ->header('Content-Type', 'text/vcard')
            ->header('Content-Disposition', 'attachment; filename="' . Str::slug($name) . '.vcf"');
    }

    /**
     * Optimize content using AI (Mockup for now as requested in original prompt).
     */
    public function optimizeContent(Request $request): JsonResponse
    {
        $request->validate([
            'content' => 'required|string',
        ]);

        // Mock AI response
        return response()->json([
            'optimized_content' => 'This is a mock optimized content by AI. Real integration would call Gemini API.',
            'suggestions' => ['Use professional tone', 'Add clear call to action']
        ]);
    }
}
