<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class CardAIService
{
    /**
     * Generate optimized card data including bio, SEO title, and meta description.
     *
     * @param string $companyName
     * @param string $rawServices
     * @return array|null
     */
    public function generateOptimizedCardData(string $companyName, string $rawServices): ?array
    {
        $prompt = "You are an expert copywriter and SEO specialist. " .
                  "Based on the following company name and raw services, generate a structured JSON object. " .
                  "Do not include any markdown formatting, only valid JSON.\n\n" .
                  "Company Name: {$companyName}\n" .
                  "Raw Services: {$rawServices}\n\n" .
                  "The JSON must have the following keys:\n" .
                  "- 'bio': A clean, professional 2-3 sentence biography/summary.\n" .
                  "- 'seo_title': A highly targeted SEO meta title (max 60 characters).\n" .
                  "- 'seo_description': A highly targeted SEO meta description (max 155 characters).\n";

        try {
            // Using HTTP Facade to target OpenAI API
            $response = Http::withToken(config('services.openai.key'))
                ->timeout(30)
                ->post('https://api.openai.com/v1/chat/completions', [
                    'model' => 'gpt-4o',
                    'messages' => [
                        ['role' => 'system', 'content' => 'You are a helpful assistant that only outputs valid JSON.'],
                        ['role' => 'user', 'content' => $prompt]
                    ],
                    'response_format' => ['type' => 'json_object'],
                    'temperature' => 0.7,
                ]);

            if ($response->successful()) {
                $content = $response->json('choices.0.message.content');
                return json_decode($content, true);
            }

            Log::error('OpenAI API Error: ' . $response->body());
        } catch (\Exception $e) {
            Log::error('CardAIService Exception: ' . $e->getMessage());
        }

        return null;
    }
}
