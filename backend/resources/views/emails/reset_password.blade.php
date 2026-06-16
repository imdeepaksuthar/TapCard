@extends('emails._layout')
@php $title = 'Reset Your Password — Card Setu'; @endphp

@section('content')
<div class="email-card">

  {{-- ── Header ── --}}
  <div class="email-header">
    <div class="email-logo">
      <img src="{{ env('FRONTEND_URL', 'http://127.0.0.1:3000') }}/logo-dark.png" alt="Card Setu" />
    </div>
    <div class="email-badge">Password Reset</div>
    <h1>Password Reset Request</h1>
    <p class="subtitle">We received a request to reset your password.</p>
  </div>

  {{-- ── Body ── --}}
  <div class="email-body">

    <p>Hi <strong>{{ $userName }}</strong>,</p>
    <p>We received a request to reset the password for your Card Setu account. Click the button below to choose a new password. This link will expire in <strong>60 minutes</strong>.</p>

    <div class="btn-wrapper">
      <a href="{{ $resetUrl }}" class="btn" target="_blank">Reset Password →</a>
    </div>

    <div class="note-box">
      <strong>Didn't request this?</strong> If you did not request a password reset, you can safely ignore this email. Your account password will remain unchanged.
    </div>

    <p style="margin-top:20px;">If you're having trouble clicking the button, copy and paste this link into your browser:</p>
    <p style="word-break:break-all;font-size:12px;"><a href="{{ $resetUrl }}">{{ $resetUrl }}</a></p>

  </div>

  {{-- ── Footer ── --}}
  <div class="email-footer">
    <p>&copy; {{ date('Y') }} Card Setu. All rights reserved.</p>
  </div>

</div>
@endsection
