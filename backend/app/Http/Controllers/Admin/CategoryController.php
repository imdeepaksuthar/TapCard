<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class CategoryController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = Category::with('parent', 'children');

        // Handle Search
        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where(function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('slug', 'like', "%{$search}%")
                  ->orWhere('type', 'like', "%{$search}%");
            });
        }

        // Handle Sorting
        $sortField = $request->input('sort', 'created_at');
        $sortDirection = $request->input('direction', 'desc');
        
        $allowedSorts = ['name', 'slug', 'type', 'created_at'];
        if (in_array($sortField, $allowedSorts)) {
            $query->orderBy($sortField, $sortDirection === 'asc' ? 'asc' : 'desc');
        }

        $categories = $query->paginate(15)->withQueryString();

        return view('admin.categories.index', compact('categories', 'sortField', 'sortDirection'));
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        // Fetch only parent categories for the dropdown
        $parentCategories = Category::whereNull('parent_id')->orderBy('name', 'asc')->get();
        return view('admin.categories.create', compact('parentCategories'));
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'type' => 'nullable|string|max:100',
            'parent_id' => 'nullable|exists:categories,id',
        ]);

        $validated['slug'] = Str::slug($validated['name']);

        // Ensure slug is unique
        if (Category::where('slug', $validated['slug'])->exists()) {
            $validated['slug'] = $validated['slug'] . '-' . uniqid();
        }

        Category::create($validated);

        return redirect()->route('admin.categories.index')->with('success', 'Category created successfully.');
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Category $category)
    {
        // Fetch parent categories (excluding itself to prevent infinite loop)
        $parentCategories = Category::whereNull('parent_id')
                                    ->where('id', '!=', $category->id)
                                    ->orderBy('name', 'asc')
                                    ->get();

        return view('admin.categories.edit', compact('category', 'parentCategories'));
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Category $category)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'type' => 'nullable|string|max:100',
            'parent_id' => 'nullable|exists:categories,id',
        ]);

        if ($request->name !== $category->name) {
            $validated['slug'] = Str::slug($validated['name']);
            if (Category::where('slug', $validated['slug'])->where('id', '!=', $category->id)->exists()) {
                $validated['slug'] = $validated['slug'] . '-' . uniqid();
            }
        }

        // Prevent assigning a subcategory as its own parent
        if ($validated['parent_id'] == $category->id) {
            return back()->withErrors(['parent_id' => 'A category cannot be its own parent.'])->withInput();
        }

        $category->update($validated);

        return redirect()->route('admin.categories.index')->with('success', 'Category updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Category $category)
    {
        // Prevent deletion if it has subcategories
        if ($category->children()->count() > 0) {
            return redirect()->route('admin.categories.index')->with('error', 'Cannot delete this category because it has subcategories attached. Please delete or reassign the subcategories first.');
        }
        
        // Prevent deletion if it is used by business cards
        if ($category->businessCards()->count() > 0 || $category->subcategoryBusinessCards()->count() > 0) {
            return redirect()->route('admin.categories.index')->with('error', 'Cannot delete this category because it is in use by one or more business cards.');
        }

        $category->delete();

        return redirect()->route('admin.categories.index')->with('success', 'Category deleted successfully.');
    }
}
