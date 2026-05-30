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

    public function import(Request $request): JsonResponse
    {
        $request->validate([
            'file' => 'required|file|mimes:csv,txt|max:2048',
        ]);

        $file = $request->file('file');
        $filePath = $file->getRealPath();

        $importedCount = 0;
        $errors = [];

        if (($handle = fopen($filePath, 'r')) !== false) {
            $header = fgetcsv($handle, 1000, ',');
            if (!$header) {
                fclose($handle);
                return response()->json(['message' => 'Invalid or empty CSV file'], 422);
            }

            // Normalize header columns
            $header = array_map(function($h) {
                return strtolower(trim($h));
            }, $header);

            // Required headers validation
            if (!in_array('name', $header) || !in_array('price', $header)) {
                fclose($handle);
                return response()->json(['message' => 'CSV must contain name and price columns'], 422);
            }

            $rowNumber = 1;

            while (($data = fgetcsv($handle, 1000, ',')) !== false) {
                $rowNumber++;
                
                // Combine header with row data
                if (count($header) !== count($data)) {
                    $errors[] = "Row {$rowNumber}: Column count does not match header count";
                    continue;
                }
                
                $row = array_combine($header, $data);
                
                // Validate fields
                $name = trim($row['name'] ?? '');
                $price = trim($row['price'] ?? '');
                $description = trim($row['description'] ?? '');
                $isActiveStr = strtolower(trim($row['is_active'] ?? 'true'));
                $imagesStr = trim($row['images'] ?? '');

                if (empty($name)) {
                    $errors[] = "Row {$rowNumber}: Product name is required";
                    continue;
                }

                if (!is_numeric($price) || (float)$price < 0) {
                    $errors[] = "Row {$rowNumber}: Price must be a positive number";
                    continue;
                }

                $isActive = !in_array($isActiveStr, ['false', '0', 'no', 'inactive']);
                
                $images = [];
                if (!empty($imagesStr)) {
                    $images = array_map('trim', explode(',', $imagesStr));
                }

                $slug = Str::slug($name) . '-' . Str::lower(Str::random(5));

                Product::create([
                    'user_id' => auth()->id(),
                    'name' => $name,
                    'slug' => $slug,
                    'description' => $description ?: null,
                    'price' => (float)$price,
                    'images' => $images,
                    'is_active' => $isActive,
                ]);

                $importedCount++;
            }
            fclose($handle);
        }

        if (count($errors) > 0 && $importedCount === 0) {
            return response()->json([
                'message' => 'Failed to import products',
                'errors' => $errors
            ], 422);
        }

        return response()->json([
            'message' => "Successfully imported {$importedCount} products",
            'imported_count' => $importedCount,
            'errors' => $errors
        ]);
    }
}