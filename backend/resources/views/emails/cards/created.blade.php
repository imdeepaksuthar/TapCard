@extends('emails._layout')
@php $title = 'Your Card is Ready! — Card Setu'; @endphp

@section('content')
<div class="email-card">

  {{-- ── Header ── --}}
  <div class="email-header">
    <div class="email-logo">
      <img src="{{ env('FRONTEND_URL', 'http://127.0.0.1:3000') }}/logo-dark.png" alt="Card Setu" />
    </div>
    <div class="email-badge">Success</div>
    <h1>Your TapCard is Ready! 🎉</h1>
    <p class="subtitle">Your new digital business card has been successfully created.</p>
  </div>

  {{-- ── Body ── --}}
  <div class="email-body">

    <p>Hi <strong>{{ $user->name }}</strong>,</p>
    <p>Congratulations! Your new TapCard has been generated and is now live. You can instantly share it with your network.</p>

    <h3>Card Details</h3>
    <div class="info-card">
      <div class="info-card-body">
        <div class="info-row">
          <span class="info-label">Card Name</span>
          <span class="info-value">{{ $card->personal_info['name'] ?? 'Your Card' }}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Public Link</span>
          <span class="info-value"><a href="{{ env('FRONTEND_URL', 'http://127.0.0.1:3000') }}/{{ $card->slug }}">{{ env('FRONTEND_URL', 'http://127.0.0.1:3000') }}/{{ $card->slug }}</a></span>
        </div>
      </div>
    </div>

    <h3>Next Steps</h3>
    <div class="info-card">
      <div class="info-card-body">
        <div class="info-row">
          <span class="info-label">Share</span>
          <span class="info-value">Send your public link to clients, or show your QR code from your dashboard.</span>
        </div>
        <div class="info-row">
          <span class="info-label">Update</span>
          <span class="info-value">Need to make changes? You can update your details anytime in your dashboard.</span>
        </div>
      </div>
    </div>

    <div class="btn-wrapper">
      <a href="{{ env('FRONTEND_URL', 'http://127.0.0.1:3000') }}/{{ $card->slug }}" class="btn">
        View Your Live Card →
      </a>
    </div>
    <div style="text-align:center;">
        <a href="{{ env('FRONTEND_URL', 'http://127.0.0.1:3000') }}/dashboard" style="font-size:13px; color:#8b93a7; text-decoration:underline;">Or go to your Dashboard</a>
    </div>

  </div>

  {{-- ── Footer ── --}}
  <div class="email-footer">
    <p>&copy; {{ date('Y') }} Card Setu. All rights reserved.</p>
  </div>

</div>
@endsection
