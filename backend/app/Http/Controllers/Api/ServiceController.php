<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Service;
use App\Models\BusinessCard;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class ServiceController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $user = auth('sanctum')->user();
        $query = Service::query();

        // If not admin or super_admin, only show active services
        if (!$user || !in_array($user->role, ['admin', 'super_admin'])) {
            $query->where('is_active', true);
            if ($user) {
                $query->where('user_id', $user->id);
            } else {
                // Public callers must scope to a single owner via ?user_id= or
                // ?card_slug=; otherwise we return nothing rather than leaking
                // every tenant's catalog.
                $ownerId = $request->query('user_id');
                if (!$ownerId && $request->query('card_slug')) {
                    $ownerId = optional(BusinessCard::where('slug', $request->query('card_slug'))->first())->user_id;
                }
                $query->where('user_id', $ownerId ?: 0);
            }
        }

        $services = $query->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($service) {
                return [
                    'id' => $service->id,
                    'name' => $service->name,
                    'slug' => $service->slug,
                    'description' => $service->description,
                    'price' => (float) $service->price,
                    'images' => $service->images ?? [],
                    'is_active' => (bool) $service->is_active,
                    'created_at' => $service->created_at,
                ];
            });

        return response()->json(['services' => $services]);
    }

    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'price' => 'nullable|numeric|min:0',
            'description' => 'nullable|string',
            'images' => 'nullable|array',
            'images.*' => 'string',
            'is_active' => 'boolean',
        ]);

        $slug = Str::slug($request->name) . '-' . Str::lower(Str::random(5));

        $service = Service::create([
            'user_id' => auth()->id(),
            'name' => $request->name,
            'slug' => $slug,
            'description' => $request->description,
            'price' => $request->price ?? null,
            'images' => $request->images ?? [],
            'is_active' => $request->input('is_active', true),
        ]);

        return response()->json([
            'message' => 'Service created successfully',
            'service' => [
                'id' => $service->id,
                'name' => $service->name,
                'slug' => $service->slug,
                'description' => $service->description,
                'price' => (float) $service->price,
                'images' => $service->images ?? [],
                'is_active' => (bool) $service->is_active,
                'created_at' => $service->created_at,
            ]
        ], 201);
    }

    public function update(Request $request, Service $service): JsonResponse
    {
        if ($service->user_id !== auth()->id() && !in_array(auth()->user()->role, ['admin', 'super_admin'])) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $request->validate([
            'name' => 'required|string|max:255',
            'price' => 'nullable|numeric|min:0',
            'description' => 'nullable|string',
            'images' => 'nullable|array',
            'images.*' => 'string',
            'is_active' => 'boolean',
        ]);

        $data = [
            'name' => $request->name,
            'description' => $request->description,
            'price' => $request->has('price') ? $request->price : $service->price,
            'is_active' => $request->input('is_active', $service->is_active),
        ];

        if ($request->has('images')) {
            $data['images'] = $request->images;
        }

        $service->update($data);

        return response()->json([
            'message' => 'Service updated successfully',
            'service' => [
                'id' => $service->id,
                'name' => $service->name,
                'slug' => $service->slug,
                'description' => $service->description,
                'price' => (float) $service->price,
                'images' => $service->images ?? [],
                'is_active' => (bool) $service->is_active,
                'created_at' => $service->created_at,
            ]
        ]);
    }

    public function destroy(Service $service): JsonResponse
    {
        if ($service->user_id !== auth()->id() && !in_array(auth()->user()->role, ['admin', 'super_admin'])) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $service->delete();

        return response()->json([
            'message' => 'Service deleted successfully'
        ]);
    }
}
