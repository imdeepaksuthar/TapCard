<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class UserController extends Controller
{
    /**
     * Display a listing of the registered users.
     */
    public function index(Request $request)
    {
        $query = User::with('businessCards');

        // Handle Search
        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where(function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%")
                  ->orWhere('phone', 'like', "%{$search}%");
            });
        }

        // Handle Sorting
        $sortField = $request->input('sort', 'created_at');
        $sortDirection = $request->input('direction', 'desc');
        
        $allowedSorts = ['name', 'email', 'role', 'status', 'created_at'];
        if (in_array($sortField, $allowedSorts)) {
            $query->orderBy($sortField, $sortDirection === 'asc' ? 'asc' : 'desc');
        }

        $users = $query->paginate(15)->withQueryString();

        return view('admin.users.index', compact('users', 'sortField', 'sortDirection'));
    }

    /**
     * Show the form for creating a new user.
     */
    public function create()
    {
        return view('admin.users.create');
    }

    /**
     * Store a newly created user in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'phone' => 'nullable|string|max:20|unique:users,phone',
            'role' => 'required|in:user,admin,super_admin',
            'password' => 'required|string|min:8|confirmed',
        ]);

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'phone' => $validated['phone'],
            'role' => $validated['role'],
            'status' => 'active',
            'password' => Hash::make($validated['password']),
        ]);

        $user->markEmailAsVerified(); // Auto-verify email for admin-created users

        return redirect()->route('admin.users.index')->with('success', 'User created successfully.');
    }

    /**
     * Toggle the status of the specified user.
     */
    public function toggleStatus(User $user)
    {
        // Prevent super admins from deactivating themselves or other super admins accidentally if needed.
        if ($user->isSuperAdmin() && auth()->id() === $user->id) {
            return back()->with('error', 'You cannot deactivate your own account.');
        }

        $user->status = $user->status === 'active' ? 'inactive' : 'active';
        $user->save();

        return back()->with('success', 'User status updated successfully.');
    }

    /**
     * Generate a token and impersonate the user by redirecting to the frontend.
     */
    public function impersonate(User $user)
    {
        // For admin dashboard, impersonating usually means generating a token and redirecting to Next.js
        $token = $user->createToken('admin-impersonation-token')->plainTextToken;
        
        $frontendUrl = env('FRONTEND_URL', 'http://127.0.0.1:3000');
        
        // Use secure=false and httpOnly=false so it works reliably on local HTTP without dropping cookies.
        // Also pass token in URL parameters just in case the frontend uses a URL token capture strategy.
        return redirect()->away($frontendUrl . '/dashboard?token=' . $token)
            ->cookie('auth_token', $token, 60 * 24, '/', null, false, false, false, 'Lax');
    }
}
