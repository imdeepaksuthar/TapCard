<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Intervention\Image\ImageManager;
use Intervention\Image\Drivers\Gd\Driver;

class MediaController extends Controller
{
    /**
     * Handle file upload.
     */
    public function upload(Request $request): JsonResponse
    {
        $request->validate([
            'file' => 'required|file|max:10240', // 10MB max
            'type' => 'required|string|in:image,document,video'
        ]);

        $file = $request->file('file');
        $type = $request->input('type');
        
        $folder = 'media/' . $type . 's'; // media/images, media/documents
        
        $filename = Str::uuid() . '.' . $file->getClientOriginalExtension();
        
        // Store in public disk
        $path = $file->storeAs($folder, $filename, 'public');
        
        $context = $request->input('context');
        if ($context === 'product' && $type === 'image') {
            try {
                $fullPath = storage_path('app/public/' . $path);
                $manager = new ImageManager(new Driver());
                $image = $manager->decodePath($fullPath);
                // Crop and resize to exactly 800x600 (4:3 ratio) for premium consistent feel
                $image->cover(800, 600);
                $image->save($fullPath);
            } catch (\Exception $e) {
                \Log::error('Image resize failed: ' . $e->getMessage());
                // If resize fails, continue with original file
            }
        }
        
        // Generate full URL
        $url = asset('storage/' . $path);

        return response()->json([
            'message' => 'File uploaded successfully',
            'url' => $url,
            'path' => $path
        ], 201);
    }
}
