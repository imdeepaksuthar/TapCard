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
            'appointment_details' => 'nullable|array',
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
            'appointment_details' => $validated['appointment_details'] ?? [],
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
            'appointment_details' => 'nullable|array',
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

        // Fetch upcoming booked slots to prevent double booking
        $bookedSlots = \App\Models\Appointment::where('business_card_id', $card->id)
            ->whereIn('status', ['pending', 'confirmed'])
            ->where('date', '>=', now()->toDateString())
            ->get(['date', 'time']);

        $products = \App\Models\Product::where('user_id', $card->user_id)
            ->where('is_active', true)
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($item) {
                $item->type = 'product';
                return $item;
            });

        $services = \App\Models\Service::where('user_id', $card->user_id)
            ->where('is_active', true)
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($item) {
                $item->type = 'service';
                return $item;
            });

        return response()->json([
            'card' => $card,
            'theme' => $theme,
            'booked_slots' => $bookedSlots,
            'products' => $products,
            'services' => $services
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

        $personalInfo = is_array($card->personal_info) ? $card->personal_info : [];
        $contactButtons = is_array($card->contact_buttons) ? $card->contact_buttons : [];
        $socialLinks = is_array($card->social_links) ? $card->social_links : [];
        $companyDetails = is_array($card->company_details) ? $card->company_details : [];

        $name = $personalInfo['name'] ?? 'Contact';
        $title = $personalInfo['designation'] ?? '';
        $company = $companyDetails['company_name'] ?? $personalInfo['company_name'] ?? $personalInfo['company'] ?? '';
        $website = $companyDetails['website'] ?? '';
        $address = $companyDetails['address'] ?? '';

        // Resolve phone, email, whatsapp from contact_buttons first, then social_links, then personal_info
        $phone = $contactButtons['call'] ?? $socialLinks['phone'] ?? $socialLinks['call'] ?? $personalInfo['phone'] ?? '';
        $whatsapp = $contactButtons['whatsapp'] ?? $socialLinks['whatsapp'] ?? '';
        $email = $contactButtons['email'] ?? $socialLinks['email'] ?? $personalInfo['email'] ?? '';

        // Profile image URL
        $photoUrl = $card->profile_image ?? $personalInfo['profile_image'] ?? '';

        // Build vCard with proper CRLF line endings (RFC 6350)
        $lines = [];
        $lines[] = 'BEGIN:VCARD';
        $lines[] = 'VERSION:3.0';
        $lines[] = 'FN:' . $name;

        // N: field (required in vCard 3.0) — split on first space
        $nameParts = explode(' ', $name, 2);
        $lastName = $nameParts[1] ?? '';
        $firstName = $nameParts[0] ?? $name;
        $lines[] = 'N:' . $lastName . ';' . $firstName . ';;;';

        if ($title) $lines[] = 'TITLE:' . $title;
        if ($company) $lines[] = 'ORG:' . $company;
        if ($phone) $lines[] = 'TEL;TYPE=CELL:' . $phone;
        if ($whatsapp && $whatsapp !== $phone) $lines[] = 'TEL;TYPE=WORK:' . $whatsapp;
        if ($email) $lines[] = 'EMAIL;TYPE=INTERNET:' . $email;
        if ($website) $lines[] = 'URL:' . $website;
        if ($address) $lines[] = 'ADR;TYPE=WORK:;;' . str_replace(["\r\n", "\n", "\r"], ', ', $address) . ';;;;';

        // Profile photo as a URL reference (works on iOS/Android without bloating file)
        if ($photoUrl && filter_var($photoUrl, FILTER_VALIDATE_URL)) {
            $lines[] = 'PHOTO;VALUE=URI:' . $photoUrl;
        }

        // Social profiles
        $socialMap = [
            'facebook' => 'Facebook',
            'instagram' => 'Instagram',
            'twitter' => 'Twitter',
            'linkedin' => 'LinkedIn',
            'youtube' => 'YouTube',
        ];
        foreach ($socialMap as $key => $label) {
            $url = $socialLinks[$key] ?? '';
            if ($url) {
                $lines[] = 'X-SOCIALPROFILE;TYPE=' . strtolower($label) . ':' . $url;
            }
        }

        // Card URL as a note
        $cardUrl = url('/' . $card->slug);
        $lines[] = 'NOTE:Digital Card: ' . $cardUrl;

        $lines[] = 'END:VCARD';

        $vcard = implode("\r\n", $lines);
        $filename = Str::slug($name) . '.vcf';

        return response($vcard)
            ->header('Content-Type', 'text/vcard; charset=utf-8')
            ->header('Content-Disposition', 'attachment; filename="' . $filename . '"')
            ->header('Cache-Control', 'no-cache, no-store, must-revalidate');
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

    /**
     * Book an appointment for a specific business card.
     */
    public function bookAppointment(Request $request, string $slug): JsonResponse
    {
        $card = BusinessCard::where('slug', $slug)
            ->where('status', 'active')
            ->firstOrFail();

        $validated = $request->validate([
            'name' => 'required|string',
            'email' => 'required|email',
            'phone' => 'nullable|string',
            'date' => 'required|date',
            'time' => 'required|string',
            'notes' => 'nullable|string'
        ]);

        $appointment = \App\Models\Appointment::create([
            'business_card_id' => $card->id,
            'user_id' => auth()->id() ?? null, // Optional if logged in
            'name' => $validated['name'],
            'email' => $validated['email'],
            'phone' => $validated['phone'] ?? null,
            'date' => $validated['date'],
            'time' => \Carbon\Carbon::parse($validated['time'])->format('H:i:s'),
            'notes' => $validated['notes'] ?? null,
            'status' => 'pending'
        ]);

        try {
            if ($card->user && $card->user->email) {
                \Illuminate\Support\Facades\Mail::to($card->user->email)
                    ->queue(new \App\Mail\AppointmentBooked($appointment));
            }
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error('Failed to queue appointment email', ['error' => $e->getMessage()]);
        }

        return response()->json([
            'message' => 'Appointment booked successfully',
            'appointment' => $appointment
        ], 201);
    }
}
