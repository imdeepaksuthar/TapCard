@extends('emails._layout')
@php $title = 'New User Registration — Card Setu Admin'; @endphp

@section('content')
<div class="email-card">

  {{-- ── Header ── --}}
  <div class="email-header">
    <div class="email-logo">
      <img src="{{ env('FRONTEND_URL', 'http://127.0.0.1:3000') }}/logo-dark.png" alt="Card Setu" />
    </div>
    <div class="email-badge">Admin Alert</div>
    <h1>New User Registered</h1>
    <p class="subtitle">A new account has been verified on Card Setu.</p>
  </div>

  {{-- ── Body ── --}}
  <div class="email-body">

    <p>Hello <strong>Super Admin</strong>,</p>
    <p>A new user has just registered and verified their email address. Here are their details:</p>

    <h3>User Details</h3>
    <div class="info-card">
      <div class="info-card-body">
        <div class="info-row">
          <span class="info-label">Name</span>
          <span class="info-value">{{ $user->name }}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Email</span>
          <span class="info-value"><a href="mailto:{{ $user->email }}">{{ $user->email }}</a></span>
        </div>
        @if($user->phone)
        <div class="info-row">
          <span class="info-label">Phone</span>
          <span class="info-value"><a href="tel:{{ $user->phone }}">{{ $user->phone }}</a></span>
        </div>
        @endif
        <div class="info-row">
          <span class="info-label">Joined</span>
          <span class="info-value">{{ $user->created_at->format('M d, Y · h:i A') }}</span>
        </div>
      </div>
    </div>

    <div class="btn-wrapper">
      <a href="{{ url('/admin/users') }}" class="btn">View User in Admin Panel →</a>
    </div>

  </div>

  {{-- ── Footer ── --}}
  <div class="email-footer">
    <p>&copy; {{ date('Y') }} Card Setu System Alert. This is an automated message.</p>
  </div>

</div>
@endsection
