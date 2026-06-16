@extends('emails._layout')
@php
  $title = 'Order Confirmation — Card Setu';
  $grandTotal = collect($cartItems)->sum(fn($item) => $item['price'] * $item['quantity']);
@endphp

@section('content')
<div class="email-card">

  {{-- ── Header ── --}}
  <div class="email-header">
    <div class="email-logo">
      <img src="{{ env('FRONTEND_URL', 'http://127.0.0.1:3000') }}/logo-dark.png" alt="Card Setu" />
    </div>
    <div class="email-badge">Order Confirmation</div>
    <h1>Thank you for your order!</h1>
    <p class="subtitle">We have received your order and it is being processed.</p>
  </div>

  {{-- ── Body ── --}}
  <div class="email-body">

    <p>Hi <strong>{{ $orderData['name'] }}</strong>,</p>
    <p>Here are your order details:</p>

    {{-- Order items --}}
    <h3>Order Items</h3>
    <table class="data-table">
      <thead>
        <tr>
          <th>Item</th>
          <th style="text-align:center;">Qty</th>
          <th style="text-align:right;">Price</th>
          <th style="text-align:right;">Total</th>
        </tr>
      </thead>
      <tbody>
        @foreach($cartItems as $item)
        <tr>
          <td>{{ $item['name'] }}</td>
          <td style="text-align:center;">{{ $item['quantity'] }}</td>
          <td style="text-align:right;">₹{{ number_format($item['price'], 2) }}</td>
          <td style="text-align:right;">₹{{ number_format($item['price'] * $item['quantity'], 2) }}</td>
        </tr>
        @endforeach
      </tbody>
      <tfoot>
        <tr>
          <td style="text-align:right;">Grand Total</td>
          <td style="text-align:right;">&nbsp;</td>
          <td style="text-align:right;">&nbsp;</td>
          <td style="text-align:right;">&#8377;{{ number_format($grandTotal, 2) }}</td>
        </tr>
      </tfoot>
    </table>

    {{-- Contact info --}}
    @if(!empty($contactInfo))
    <h3>Need Help?</h3>
    <div class="info-card">
      <div class="info-card-body">
        @if(!empty($contactInfo['name']))
        <div class="info-row">
          <span class="info-label">Contact</span>
          <span class="info-value">{{ $contactInfo['name'] }}</span>
        </div>
        @endif
        @if(!empty($contactInfo['email']))
        <div class="info-row">
          <span class="info-label">Email</span>
          <span class="info-value"><a href="mailto:{{ $contactInfo['email'] }}">{{ $contactInfo['email'] }}</a></span>
        </div>
        @endif
        @if(!empty($contactInfo['phone']))
        <div class="info-row">
          <span class="info-label">Phone</span>
          <span class="info-value"><a href="tel:{{ $contactInfo['phone'] }}">{{ $contactInfo['phone'] }}</a></span>
        </div>
        @endif
        @if(!empty($contactInfo['whatsapp']))
        <div class="info-row">
          <span class="info-label">WhatsApp</span>
          <span class="info-value"><a href="https://wa.me/{{ preg_replace('/[^0-9]/', '', $contactInfo['whatsapp']) }}">{{ $contactInfo['whatsapp'] }}</a></span>
        </div>
        @endif
      </div>
    </div>
    @endif

  </div>

  {{-- ── Footer ── --}}
  <div class="email-footer">
    <p>&copy; {{ date('Y') }} Card Setu. All rights reserved.</p>
  </div>

</div>
@endsection
