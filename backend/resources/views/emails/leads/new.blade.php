@extends('emails._layout')
@php $title = 'New Inquiry — Card Setu'; @endphp

@section('content')
<div class="email-card">

  {{-- ── Header ── --}}
  <div class="email-header">
    <div class="email-logo">
      <img src="{{ env('FRONTEND_URL', 'http://127.0.0.1:3000') }}/logo-dark.png" alt="Card Setu" />
    </div>
    <div class="email-badge">Inquiry Alert</div>
    <h1>You have a new inquiry!</h1>
    <p class="subtitle">Someone reached out through your TapCard business card.</p>
  </div>

  {{-- ── Body ── --}}
  <div class="email-body">

    {{-- Contact info --}}
    <h3>Contact Details</h3>
    <div class="info-card">
      <div class="info-card-body">
        <div class="info-row">
          <span class="info-label">Name</span>
          <span class="info-value">{{ $lead->name }}</span>
        </div>
        @if($lead->email)
        <div class="info-row">
          <span class="info-label">Email</span>
          <span class="info-value"><a href="mailto:{{ $lead->email }}">{{ $lead->email }}</a></span>
        </div>
        @endif
        @if($lead->phone)
        <div class="info-row">
          <span class="info-label">Phone</span>
          <span class="info-value"><a href="tel:{{ $lead->phone }}">{{ $lead->phone }}</a></span>
        </div>
        @endif
      </div>
    </div>

    {{-- Message --}}
    @if($lead->message)
    <h3>Message</h3>
    <div class="message-panel">{{ $lead->message }}</div>
    @endif

    {{-- CTA --}}
    <div class="btn-wrapper">
      <a href="{{ env('FRONTEND_URL', 'http://127.0.0.1:3000') }}/dashboard/leads" class="btn">
        View All Leads →
      </a>
    </div>

  </div>

  {{-- ── Footer ── --}}
  <div class="email-footer">
    <p>&copy; {{ date('Y') }} Card Setu. All rights reserved.</p>
  </div>

</div>
@endsection
