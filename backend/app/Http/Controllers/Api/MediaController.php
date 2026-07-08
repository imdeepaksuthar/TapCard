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

        // Enforce the real (server-guessed) MIME per declared type. Defends
        // against an SVG/HTML/PHP payload disguised as an "image" — we never
        // trust the client-supplied filename/extension.
        $allowedExt = [
            'image' => ['jpg', 'jpeg', 'png', 'webp', 'gif'],
            'document' => ['pdf'],
            'video' => ['mp4', 'webm', 'mov'],
        ];
        $ext = strtolower($file->extension() ?: ''); // derived from MIME, not the client name
        if (!in_array($ext, $allowedExt[$type] ?? [], true)) {
            return response()->json([
                'message' => 'Unsupported file type for a ' . $type . ' upload.',
            ], 422);
        }

        $folder = 'media/' . $type . 's'; // media/images, media/documents

        $filename = Str::uuid() . '.' . $ext;
        
        // Store in public disk
        $path = $file->storeAs($folder, $filename, 'public');
        
        // Optimize all image uploads — resize based on context
        if ($type === 'image') {
            try {
                $fullPath = storage_path('app/public/' . $path);
                $manager = new ImageManager(new Driver());
                $image = $manager->decodePath($fullPath);

                $context = $request->input('context', '');

                if ($context === 'product' || $context === 'service') {
                    // Products/services: consistent 4:3 crop
                    $image->cover(800, 600);
                } else {
                    // All other images: scale down if larger than 1200px, preserve aspect ratio
                    $width = $image->width();
                    $height = $image->height();
                    if ($width > 1200 || $height > 1200) {
                        $image->scaleDown(1200, 1200);
                    }
                }

                // Re-encode as WebP if supported, otherwise keep original format
                if (in_array($ext, ['jpg', 'jpeg', 'png', 'bmp'])) {
                    $webpPath = preg_replace('/\.[^.]+$/', '.webp', $fullPath);
                    $webpStoragePath = preg_replace('/\.[^.]+$/', '.webp', $path);
                    $image->encode(new \Intervention\Image\Encoders\WebpEncoder(quality: 82))->save($webpPath);

                    // Delete original, update path to webp
                    if (file_exists($fullPath) && $fullPath !== $webpPath) {
                        unlink($fullPath);
                    }
                    $path = $webpStoragePath;
                } else {
                    $image->save($fullPath);
                }
            } catch (\Exception $e) {
                \Log::error('Image optimization failed: ' . $e->getMessage());
                // If optimization fails, continue with original file
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
