@extends('emails._layout')
@php $title = 'Welcome to Card Setu!'; @endphp

@section('content')
<div class="email-card">

  {{-- ── Header ── --}}
  <div class="email-header">
    <div class="email-logo">
      <img src="{{ env('FRONTEND_URL', 'http://127.0.0.1:3000') }}/logo-dark.png" alt="Card Setu" />
    </div>
    <div class="email-badge">Welcome</div>
    <h1>Welcome to Card Setu! 🎉</h1>
    <p class="subtitle">Your digital business card journey starts now.</p>
  </div>

  {{-- ── Body ── --}}
  <div class="email-body">

    <p>Hi <strong>{{ $user->name }}</strong>,</p>
    <p>Thank you for registering and verifying your email address. We're thrilled to have you on board!</p>
    <p>Card Setu is your ultimate platform for creating, managing, and sharing beautiful digital business cards. Build your professional identity in minutes and share it with the world.</p>

    <h3>What you can do</h3>
    <div class="info-card">
      <div class="info-card-body">
        <div class="info-row">
          <span class="info-label">Create</span>
          <span class="info-value">Design stunning digital business cards with your brand colors and photo.</span>
        </div>
        <div class="info-row">
          <span class="info-label">Share</span>
          <span class="info-value">Share your card via QR code, NFC tap, or a unique link — instantly.</span>
        </div>
        <div class="info-row">
          <span class="info-label">Connect</span>
          <span class="info-value">Receive leads and inquiries directly from anyone who views your card.</span>
        </div>
      </div>
    </div>

    <div class="btn-wrapper">
      <a href="{{ env('FRONTEND_URL', 'http://127.0.0.1:3000') }}/dashboard" class="btn">
        Go to Dashboard →
      </a>
    </div>

    <p>If you have any questions, feel free to reply to this email. We're always here to help.</p>

  </div>

  {{-- ── Footer ── --}}
  <div class="email-footer">
    <p>&copy; {{ date('Y') }} Card Setu. All rights reserved.</p>
  </div>

</div>
@endsection
