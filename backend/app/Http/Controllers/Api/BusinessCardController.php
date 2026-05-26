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
        $cards = BusinessCard::with(['category', 'subcategory'])
            ->where('user_id', auth()->id())
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
            'category_id' => 'required|exists:categories,id',
            'subcategory_id' => 'required|exists:categories,id',
            'profile_image' => 'nullable|string',
            'company_logo' => 'nullable|string',
            'personal_info' => 'required|array',
            'personal_info.name' => 'required|string',
            'personal_info.designation' => 'nullable|string',
            'personal_info.bio' => 'nullable|string',
            'personal_info.profile_image' => 'nullable|string',
            'contact_buttons' => 'nullable|array',
            'social_links' => 'nullable|array',
            'custom_links' => 'nullable|array',
            'company_details' => 'nullable|array',
            'payment_info' => 'nullable|array',
            'gallery' => 'nullable|array',
            'documents' => 'nullable|array',
            'location_info' => 'nullable|array',
            'proprietor_details' => 'nullable|array',
            'gallery_content' => 'nullable|array',
            'opening_hours' => 'nullable|array',
            'brochure_pdfs' => 'nullable|array',
            'custom_branding' => 'nullable|array',
            'seo_metadata' => 'nullable|array',
        ]);

        $card = BusinessCard::create([
            'user_id' => auth()->id(),
            'slug' => $validated['slug'],
            'template_id' => $validated['template_id'] ?? null,
            'category_id' => $validated['category_id'],
            'subcategory_id' => $validated['subcategory_id'],
            'profile_image' => $validated['profile_image'] ?? null,
            'company_logo' => $validated['company_logo'] ?? null,
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
            'proprietor_details' => $validated['proprietor_details'] ?? [],
            'gallery_content' => $validated['gallery_content'] ?? [],
            'opening_hours' => $validated['opening_hours'] ?? [],
            'brochure_pdfs' => $validated['brochure_pdfs'] ?? [],
            'custom_branding' => $validated['custom_branding'] ?? [],
            'seo_metadata' => $validated['seo_metadata'] ?? [],
            'views_count' => 0,
        ]);

        return response()->json([
            'message' => 'Business card created successfully',
            'card' => $card->load(['category', 'subcategory'])
        ], 201);
    }

    /**
     * Display the specified business card.
     */
    public function show(string $id): JsonResponse
    {
        $card = BusinessCard::with(['category', 'subcategory'])
            ->where('user_id', auth()->id())
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
            'category_id' => 'required|exists:categories,id',
            'subcategory_id' => 'required|exists:categories,id',
            'profile_image' => 'nullable|string',
            'company_logo' => 'nullable|string',
            'personal_info' => 'required|array',
            'personal_info.name' => 'required|string',
            'personal_info.designation' => 'nullable|string',
            'personal_info.bio' => 'nullable|string',
            'personal_info.profile_image' => 'nullable|string',
            'contact_buttons' => 'nullable|array',
            'social_links' => 'nullable|array',
            'custom_links' => 'nullable|array',
            'company_details' => 'nullable|array',
            'payment_info' => 'nullable|array',
            'gallery' => 'nullable|array',
            'documents' => 'nullable|array',
            'location_info' => 'nullable|array',
            'proprietor_details' => 'nullable|array',
            'gallery_content' => 'nullable|array',
            'opening_hours' => 'nullable|array',
            'brochure_pdfs' => 'nullable|array',
            'custom_branding' => 'nullable|array',
            'seo_metadata' => 'nullable|array',
        ]);

        \Illuminate\Support\Facades\Log::info('Card update - personal_info received', [
            'personal_info' => $request->input('personal_info'),
            'validated_personal_info' => $validated['personal_info'] ?? null,
        ]);

        $card->update($validated);

        return response()->json([
            'message' => 'Business card updated successfully',
            'card' => $card->load(['category', 'subcategory'])
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
        $card = BusinessCard::with(['category', 'subcategory'])
            ->where('slug', $slug)
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

    /**
     * Verify and fetch details for a given pincode using raw cURL.
     */
    public function verifyPincode(string $pincode): JsonResponse
    {
        if (!preg_match('/^\d{6}$/', $pincode)) {
            return response()->json(['error' => 'Invalid pincode. Must be 6 digits.'], 422);
        }

        try {
            $url = "https://api.postalpincode.in/pincode/{$pincode}";

            $ch = curl_init();
            curl_setopt($ch, CURLOPT_URL, $url);
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
            curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
            curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, false);
            curl_setopt($ch, CURLOPT_TIMEOUT, 10);
            curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
            curl_setopt($ch, CURLOPT_HTTPHEADER, ['Accept: application/json']);

            $responseBody = curl_exec($ch);
            $curlError    = curl_error($ch);
            $httpCode     = curl_getinfo($ch, CURLINFO_HTTP_CODE);
            curl_close($ch);

            if ($curlError) {
                \Illuminate\Support\Facades\Log::error('Pincode cURL error', ['error' => $curlError]);
                return response()->json(['error' => 'Could not reach pincode service.'], 503);
            }

            if ($httpCode !== 200) {
                return response()->json(['error' => 'Pincode service returned an error.'], 502);
            }

            $data   = json_decode($responseBody, true);
            $result = $data[0] ?? null;

            if (!$result || ($result['Status'] ?? '') !== 'Success' || empty($result['PostOffice'])) {
                return response()->json(['error' => 'No data found for this pincode.'], 404);
            }

            $postOffice = $result['PostOffice'][0];

            return response()->json([
                'status'       => 'Success',
                'pincode'      => $pincode,
                'city'         => $postOffice['District'] ?? '',
                'state'        => $postOffice['State']    ?? '',
                'district'     => $postOffice['District'] ?? '',
                'block'        => $postOffice['Block']    ?? '',
                'region'       => $postOffice['Region']   ?? '',
                'country'      => $postOffice['Country']  ?? 'India',
                'post_offices' => $result['PostOffice'],
            ]);

        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error('Pincode lookup exception', ['message' => $e->getMessage()]);
            return response()->json(['error' => 'Pincode API is currently unavailable.'], 503);
        }
    }
}
