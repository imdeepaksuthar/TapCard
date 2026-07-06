@extends('emails._layout')
@php $title = 'New Appointment Request — Card Setu'; @endphp

@section('content')
<div class="email-card">

  {{-- ── Header ── --}}
  <div class="email-header">
    <div class="email-logo">
      <img src="{{ env('FRONTEND_URL', 'http://127.0.0.1:3000') }}/logo-dark.png" alt="Card Setu" />
    </div>
    <div class="email-badge" style="background: rgba(59, 130, 246, 0.15); color: #3b82f6; border-color: rgba(59, 130, 246, 0.3);">New Request</div>
    <h1>Appointment Booked 📅</h1>
    <p class="subtitle">You have received a new appointment booking request from your TapCard.</p>
  </div>

  {{-- ── Body ── --}}
  <div class="email-body">

    <p>Hi,</p>
    <p>A new appointment has been scheduled via your TapCard (<strong>{{ $appointment->businessCard->personal_info['name'] ?? 'Professional Card' }}</strong>). Please review the details below.</p>

    <h3>Appointment Details</h3>
    <div class="info-card">
      <div class="info-card-body">
        <div class="info-row">
          <span class="info-label">Date</span>
          <span class="info-value">{{ \Carbon\Carbon::parse($appointment->date)->format('M d, Y') }}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Time</span>
          <span class="info-value">{{ \Carbon\Carbon::parse($appointment->time)->format('h:i A') }}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Name</span>
          <span class="info-value">{{ $appointment->name }}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Email</span>
          <span class="info-value"><a href="mailto:{{ $appointment->email }}">{{ $appointment->email }}</a></span>
        </div>
        @if($appointment->phone)
        <div class="info-row">
          <span class="info-label">Phone</span>
          <span class="info-value"><a href="tel:{{ $appointment->phone }}">{{ $appointment->phone }}</a></span>
        </div>
        @endif
        @if($appointment->notes)
        <div class="info-row" style="align-items: flex-start;">
          <span class="info-label" style="margin-top: 2px;">Notes</span>
          <span class="info-value" style="white-space: pre-wrap;">{{ $appointment->notes }}</span>
        </div>
        @endif
      </div>
    </div>

    <div class="btn-wrapper">
      <a href="{{ env('FRONTEND_URL', 'http://127.0.0.1:3000') }}/dashboard/appointments" class="btn">
        View Appointments →
      </a>
    </div>

  </div>

  {{-- ── Footer ── --}}
  <div class="email-footer">
    <p>&copy; {{ date('Y') }} Card Setu. All rights reserved.</p>
  </div>

</div>
@endsection
