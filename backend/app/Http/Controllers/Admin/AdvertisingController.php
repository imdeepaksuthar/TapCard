<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Advertising;
use Illuminate\Http\Request;

class AdvertisingController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = Advertising::query();

        // Handle Search
        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhere('position', 'like', "%{$search}%");
            });
        }

        // Handle Sorting
        $sortField = $request->input('sort', 'created_at');
        $sortDirection = $request->input('direction', 'desc');

        $allowedSorts = ['title', 'position', 'status', 'clicks', 'views', 'created_at'];
        if (in_array($sortField, $allowedSorts)) {
            $query->orderBy($sortField, $sortDirection === 'asc' ? 'asc' : 'desc');
        }

        $advertisings = $query->paginate(15)->withQueryString();

        return view('admin.advertisings.index', compact('advertisings', 'sortField', 'sortDirection'));
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return view('admin.advertisings.create');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'image' => 'required|image|mimes:jpeg,png,jpg,gif,webp|max:2048',
            'target_url' => 'nullable|url|max:255',
            'position' => 'required|string|max:50',
            'status' => 'required|in:active,inactive',
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date|after_or_equal:start_date',
        ]);

        if ($request->hasFile('image')) {
            $validated['image_path'] = $request->file('image')->store('advertisings', 'public');
        }

        Advertising::create($validated);

        return redirect()->route('admin.advertisings.index')
            ->with('success', 'Advertisement created successfully.');
    }

    /**
     * Display the specified resource.
     */
    public function show(Advertising $advertising)
    {
        // View handled mostly in index/edit.
        return redirect()->route('admin.advertisings.edit', $advertising);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Advertising $advertising)
    {
        return view('admin.advertisings.edit', compact('advertising'));
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Advertising $advertising)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:2048',
            'target_url' => 'nullable|url|max:255',
            'position' => 'required|string|max:50',
            'status' => 'required|in:active,inactive',
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date|after_or_equal:start_date',
        ]);

        if ($request->hasFile('image')) {
            // Delete old image
            if ($advertising->image_path) {
                \Illuminate\Support\Facades\Storage::disk('public')->delete($advertising->image_path);
            }
            $validated['image_path'] = $request->file('image')->store('advertisings', 'public');
        }

        $advertising->update($validated);

        return redirect()->route('admin.advertisings.index')
            ->with('success', 'Advertisement updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Advertising $advertising)
    {
        if ($advertising->image_path) {
            \Illuminate\Support\Facades\Storage::disk('public')->delete($advertising->image_path);
        }
        
        $advertising->delete();

        return redirect()->route('admin.advertisings.index')
            ->with('success', 'Advertisement deleted successfully.');
    }

    /**
     * Handle ad click tracking and redirect.
     */
    public function click(Advertising $advertising)
    {
        $advertising->increment('clicks');
        
        if ($advertising->target_url) {
            return redirect()->away($advertising->target_url);
        }

        return back();
    }
}
