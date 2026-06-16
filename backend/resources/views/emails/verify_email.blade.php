@extends('emails._layout')
@php $title = 'Verify Your Email — Card Setu'; @endphp

@section('content')
<div class="email-card">

  {{-- ── Header ── --}}
  <div class="email-header">
    <div class="email-logo">
      <img src="{{ env('FRONTEND_URL', 'http://127.0.0.1:3000') }}/logo-dark.png" alt="Card Setu" />
    </div>
    <div class="email-badge">Email Verification</div>
    <h1>Verify your email address</h1>
    <p class="subtitle">One quick step to activate your account.</p>
  </div>

  {{-- ── Body ── --}}
  <div class="email-body">

    <p>Hi <strong>{{ $userName }}</strong>,</p>
    <p>Thank you for creating an account with Card Setu! Please click the button below to verify your email address and activate your account.</p>

    <div class="btn-wrapper">
      <a href="{{ $verifyUrl }}" class="btn" target="_blank">Verify Email Address →</a>
    </div>

    <p>If you did not create an account, no further action is required.</p>

    <div class="note-box">
      <strong>Button not working?</strong> Copy and paste this link into your browser:<br>
      <a href="{{ $verifyUrl }}" style="word-break:break-all;font-size:12px;">{{ $verifyUrl }}</a>
    </div>

  </div>

  {{-- ── Footer ── --}}
  <div class="email-footer">
    <p>&copy; {{ date('Y') }} Card Setu. All rights reserved.</p>
  </div>

</div>
@endsection
