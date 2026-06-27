<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Intervention\Image\Drivers\Gd\Driver;
use Intervention\Image\Encoders\JpegEncoder;
use Intervention\Image\Encoders\PngEncoder;
use Intervention\Image\Encoders\WebpEncoder;
use Intervention\Image\ImageManager;

/**
 * Backfill optimizer for images that were uploaded BEFORE the MediaController
 * compression pipeline existed (large legacy .jpg/.png/.webp files that slow
 * down the public card front view).
 *
 * It re-encodes each oversized image IN PLACE — same filename and extension —
 * so every existing card/product/service reference keeps working untouched
 * (no DB migration needed). Files are only overwritten when the result is
 * actually smaller, so re-running it is safe and idempotent.
 */
class OptimizeImages extends Command
{
    protected $signature = 'images:optimize
        {--dry-run : Report what would change without writing any files}
        {--max=1600 : Maximum width/height in pixels (larger images are scaled down)}
        {--quality=80 : JPEG/WebP encode quality (1-100)}
        {--min-kb=150 : Skip files already smaller than this (unless oversized in pixels)}
        {--dir= : Override the directory to scan (defaults to media/images on the public disk)}';

    protected $description = 'Compress legacy oversized images in storage in place (preserves filename/extension so existing references keep working).';

    public function handle(): int
    {
        $dir = $this->option('dir') ?: storage_path('app/public/media/images');

        if (! is_dir($dir)) {
            $this->error("Directory not found: {$dir}");

            return self::FAILURE;
        }

        $dryRun  = (bool) $this->option('dry-run');
        $max     = max(64, (int) $this->option('max'));
        $quality = min(100, max(40, (int) $this->option('quality')));
        $minBytes = max(0, (int) $this->option('min-kb')) * 1024;

        $manager = new ImageManager(new Driver());

        $files = glob(rtrim($dir, '/\\') . DIRECTORY_SEPARATOR . '*') ?: [];

        $optimized = 0;
        $skipped   = 0;
        $failed    = 0;
        $totalBefore = 0;
        $totalAfter  = 0;

        $this->info(($dryRun ? '[DRY RUN] ' : '') . "Scanning {$dir} (" . count($files) . ' entries)…');
        $this->newLine();

        foreach ($files as $file) {
            if (! is_file($file)) {
                continue;
            }

            // Only handle raster formats whose encoder matches the extension, so
            // the file's bytes always agree with its name/Content-Type.
            $ext = strtolower(pathinfo($file, PATHINFO_EXTENSION));
            if (! in_array($ext, ['jpg', 'jpeg', 'png', 'webp'], true)) {
                $skipped++;

                continue;
            }

            $sizeBefore = (int) filesize($file);

            try {
                $image = $manager->decodePath($file);
            } catch (\Throwable $e) {
                $this->warn('  ✗ unreadable: ' . basename($file) . ' — ' . $e->getMessage());
                $failed++;

                continue;
            }

            $oversized = $image->width() > $max || $image->height() > $max;

            // Already small and within bounds → nothing to gain.
            if ($sizeBefore <= $minBytes && ! $oversized) {
                $skipped++;

                continue;
            }

            if ($oversized) {
                $image->scaleDown($max, $max);
            }

            // Encoder MUST match the existing extension to preserve the stored path.
            $encoder = match ($ext) {
                'png'  => new PngEncoder(),
                'webp' => new WebpEncoder(quality: min(100, $quality + 2)),
                default => new JpegEncoder(quality: $quality), // jpg / jpeg
            };

            try {
                $encoded = $image->encode($encoder);
            } catch (\Throwable $e) {
                $this->warn('  ✗ encode failed: ' . basename($file) . ' — ' . $e->getMessage());
                $failed++;

                continue;
            }

            $sizeAfter = strlen((string) $encoded);

            // Don't replace a file with a bigger one (common for already-optimized PNGs).
            if ($sizeAfter >= $sizeBefore) {
                $skipped++;

                continue;
            }

            $optimized++;
            $totalBefore += $sizeBefore;
            $totalAfter  += $sizeAfter;

            $this->line(sprintf(
                '  %s %-40s %9s → %9s  (-%d%%)',
                $dryRun ? '[dry]' : '✓',
                basename($file),
                $this->human($sizeBefore),
                $this->human($sizeAfter),
                (int) round((1 - $sizeAfter / $sizeBefore) * 100)
            ));

            if (! $dryRun) {
                $encoded->save($file); // same absolute path & extension
            }
        }

        $this->newLine();
        $this->info(sprintf(
            '%s %d image(s); saved %s overall (%s → %s). Skipped %d, failed %d.',
            $dryRun ? 'Would optimize' : 'Optimized',
            $optimized,
            $this->human(max(0, $totalBefore - $totalAfter)),
            $this->human($totalBefore),
            $this->human($totalAfter),
            $skipped,
            $failed
        ));

        if ($dryRun) {
            $this->comment('Dry run — no files were modified. Re-run without --dry-run to apply.');
        }

        return self::SUCCESS;
    }

    private function human(int $bytes): string
    {
        if ($bytes >= 1048576) {
            return round($bytes / 1048576, 1) . ' MB';
        }
        if ($bytes >= 1024) {
            return round($bytes / 1024) . ' KB';
        }

        return $bytes . ' B';
    }
}
