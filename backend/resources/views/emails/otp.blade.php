@extends('emails._layout')
@php $title = 'Verification Code — Card Setu'; @endphp

@section('content')
<div class="email-card">

  {{-- ── Header ── --}}
  <div class="email-header">
    <div class="email-logo">
      <img src="{{ env('FRONTEND_URL', 'http://127.0.0.1:3000') }}/logo-dark.png" alt="Card Setu" />
    </div>
    <div class="email-badge">Authentication</div>
    <h1>Verification Code</h1>
    <p class="subtitle">Complete your sign-in to Card Setu.</p>
  </div>

  {{-- ── Body ── --}}
  <div class="email-body">

    <p>Hi <strong>{{ $userName }}</strong>,</p>
    <p>Use the one-time code below to complete your login. This code is valid for <strong>10 minutes</strong> and can only be used once.</p>

    {{-- OTP Code --}}
    <div class="code-wrapper">
      <div class="code-box">{{ $otpCode }}</div>
      <p class="code-expiry">Expires in 10 minutes &nbsp;·&nbsp; Do not share this code</p>
    </div>

    <div class="note-box">
      <strong>Didn't request this?</strong> If you did not try to sign in, you can safely ignore this email. Your account remains secure.
    </div>

  </div>

  {{-- ── Footer ── --}}
  <div class="email-footer">
    <p>&copy; {{ date('Y') }} Card Setu. All rights reserved.</p>
  </div>

</div>
@endsection
