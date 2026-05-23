<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Plan;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class PlanController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $plans = Plan::all();
        return view('admin.plans.index', compact('plans'));
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'price' => 'required|numeric|min:0',
            'billing_period' => 'required|string',
            'features' => 'nullable|string', // We will split this by lines
        ]);

        $featuresArray = [];
        if ($request->features) {
            $featuresArray = array_filter(array_map('trim', explode("\n", $request->features)));
        }

        Plan::create([
            'name' => $request->name,
            'slug' => Str::slug($request->name),
            'price' => $request->price,
            'billing_period' => $request->billing_period,
            'features' => $featuresArray,
        ]);

        return redirect()->route('admin.plans.index')->with('success', 'Plan created successfully.');
    }
}
