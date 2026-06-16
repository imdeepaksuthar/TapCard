@extends('emails._layout')
@php
  $title = 'New Order Received — Card Setu';
  $grandTotal = collect($cartItems)->sum(fn($item) => $item['price'] * $item['quantity']);
@endphp

@section('content')
<div class="email-card">

  {{-- ── Header ── --}}
  <div class="email-header">
    <div class="email-logo">
      <img src="{{ env('FRONTEND_URL', 'http://127.0.0.1:3000') }}/logo-dark.png" alt="Card Setu" />
    </div>
    <div class="email-badge">New Order</div>
    <h1>New Order Received!</h1>
    <p class="subtitle">A customer just placed an order on your TapCard store.</p>
  </div>

  {{-- ── Body ── --}}
  <div class="email-body">

    <p>You have received a new order from <strong>{{ $orderData['name'] }}</strong>.</p>

    {{-- Customer details --}}
    <h3>Customer Details</h3>
    <div class="info-card">
      <div class="info-card-body">
        <div class="info-row">
          <span class="info-label">Name</span>
          <span class="info-value">{{ $orderData['name'] }}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Phone</span>
          <span class="info-value"><a href="tel:{{ $orderData['phone'] }}">{{ $orderData['phone'] }}</a></span>
        </div>
        <div class="info-row">
          <span class="info-label">Email</span>
          <span class="info-value"><a href="mailto:{{ $orderData['email'] }}">{{ $orderData['email'] }}</a></span>
        </div>
        <div class="info-row">
          <span class="info-label">Pincode</span>
          <span class="info-value">{{ $orderData['pincode'] }}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Area</span>
          <span class="info-value">{{ $orderData['village'] }}</span>
        </div>
      </div>
    </div>

    {{-- Order items --}}
    <h3>Order Summary</h3>
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

  </div>

  {{-- ── Footer ── --}}
  <div class="email-footer">
    <p>&copy; {{ date('Y') }} Card Setu. All rights reserved.</p>
  </div>

</div>
@endsection
