<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class DesignationController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $designations = \App\Models\Designation::orderBy('name')->get();
        return view('admin.designations.index', compact('designations'));
    }

    public function create()
    {
        return view('admin.designations.create');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:designations',
            'status' => 'required|in:active,inactive',
        ]);

        \App\Models\Designation::create($validated);

        return redirect()->route('admin.designations.index')->with('success', 'Designation created successfully.');
    }

    public function edit(string $id)
    {
        $designation = \App\Models\Designation::findOrFail($id);
        return view('admin.designations.edit', compact('designation'));
    }

    public function update(Request $request, string $id)
    {
        $designation = \App\Models\Designation::findOrFail($id);

        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:designations,name,' . $designation->id,
            'status' => 'required|in:active,inactive',
        ]);

        $designation->update($validated);

        return redirect()->route('admin.designations.index')->with('success', 'Designation updated successfully.');
    }

    public function destroy(string $id)
    {
        $designation = \App\Models\Designation::findOrFail($id);
        $designation->delete();

        return redirect()->route('admin.designations.index')->with('success', 'Designation deleted successfully.');
    }
}
