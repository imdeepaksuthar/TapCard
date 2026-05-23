<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\NfcCard;
use Illuminate\Http\Request;

class NfcController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        // Get all NFC cards with their associated business cards and users
        $nfcCards = NfcCard::with('businessCard.user')->latest()->get();
        
        return view('admin.nfc.index', compact('nfcCards'));
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, NfcCard $nfcCard)
    {
        $request->validate([
            'order_status' => 'required|in:pending,printed,shipped,active',
            'tracking_number' => 'nullable|string|max:255',
        ]);

        $nfcCard->update([
            'order_status' => $request->order_status,
            'tracking_number' => $request->tracking_number,
        ]);

        return redirect()->route('admin.nfc.index')->with('success', 'NFC Card status updated successfully.');
    }
}
