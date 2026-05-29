<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class ProductController extends Controller
{
    public function index(): JsonResponse
    {
        $user = auth('sanctum')->user();
        $query = Product::query();

        // If not admin or super_admin, only show active products
        if (!$user || !in_array($user->role, ['admin', 'super_admin'])) {
            $query->where('is_active', true);
            if ($user) {
                $query->where('user_id', $user->id);
            }
        }

        $products = $query->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($product) {
                return [
                    'id' => $product->id,
                    'name' => $product->name,
                    'slug' => $product->slug,
                    'description' => $product->description,
                    'price' => (float) $product->price,
                    'images' => $product->images ?? [],
                    'is_active' => (bool) $product->is_active,
                    'created_at' => $product->created_at,
                ];
            });

        return response()->json(['products' => $products]);
    }

    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'price' => 'required|numeric|min:0',
            'description' => 'nullable|string',
            'images' => 'nullable|array',
            'images.*' => 'string',
            'is_active' => 'boolean',
        ]);

        $slug = Str::slug($request->name) . '-' . Str::lower(Str::random(5));

        $product = Product::create([
            'user_id' => auth()->id(),
            'name' => $request->name,
            'slug' => $slug,
            'description' => $request->description,
            'price' => $request->price,
            'images' => $request->images ?? [],
            'is_active' => $request->input('is_active', true),
        ]);

        return response()->json([
            'message' => 'Product created successfully',
            'product' => [
                'id' => $product->id,
                'name' => $product->name,
                'slug' => $product->slug,
                'description' => $product->description,
                'price' => (float) $product->price,
                'images' => $product->images ?? [],
                'is_active' => (bool) $product->is_active,
                'created_at' => $product->created_at,
            ]
        ], 201);
    }

    public function update(Request $request, Product $product): JsonResponse
    {
        if ($product->user_id !== auth()->id() && !in_array(auth()->user()->role, ['admin', 'super_admin'])) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $request->validate([
            'name' => 'required|string|max:255',
            'price' => 'required|numeric|min:0',
            'description' => 'nullable|string',
            'images' => 'nullable|array',
            'images.*' => 'string',
            'is_active' => 'boolean',
        ]);

        $data = [
            'name' => $request->name,
            'description' => $request->description,
            'price' => $request->price,
            'is_active' => $request->input('is_active', $product->is_active),
        ];

        if ($request->has('images')) {
            $data['images'] = $request->images;
        }

        $product->update($data);

        return response()->json([
            'message' => 'Product updated successfully',
            'product' => [
                'id' => $product->id,
                'name' => $product->name,
                'slug' => $product->slug,
                'description' => $product->description,
                'price' => (float) $product->price,
                'images' => $product->images ?? [],
                'is_active' => (bool) $product->is_active,
                'created_at' => $product->created_at,
            ]
        ]);
    }

    public function destroy(Product $product): JsonResponse
    {
        if ($product->user_id !== auth()->id() && !in_array(auth()->user()->role, ['admin', 'super_admin'])) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $product->delete();

        return response()->json([
            'message' => 'Product deleted successfully'
        ]);
    }
}