<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

use App\Models\Appointment;
use Illuminate\Http\JsonResponse;

class AppointmentController extends Controller
{
    public function index(): JsonResponse
    {
        $appointments = Appointment::with(['businessCard'])
            ->whereHas('businessCard', function ($query) {
                $query->where('user_id', auth()->id());
            })
            ->orderBy('date', 'desc')
            ->orderBy('time', 'desc')
            ->get();

        return response()->json([
            'appointments' => $appointments
        ]);
    }

    public function updateStatus(Request $request, string $id): JsonResponse
    {
        $validated = $request->validate([
            'status' => 'required|in:pending,confirmed,cancelled,completed'
        ]);

        $appointment = Appointment::whereHas('businessCard', function ($query) {
                $query->where('user_id', auth()->id());
            })
            ->where('id', $id)
            ->firstOrFail();

        $appointment->update([
            'status' => $validated['status']
        ]);

        return response()->json([
            'message' => 'Status updated successfully',
            'appointment' => $appointment
        ]);
    }
}
