{{--
  ╔══════════════════════════════════════════════════════════════╗
  ║  Card Setu · Email Layout Partial                           ║
  ║  Usage: @include('emails._layout', ['title' => '...'])      ║
  ║  Sections: @section('content') ... @endsection              ║
  ╚══════════════════════════════════════════════════════════════╝

  Design tokens:
  - Background : #07080f  (page)   |  #0f1117 (card)
  - Surface     : #161b27           |  #1e2535 (elevated)
  - Border      : #252d3d
  - Text main   : #f0f2f7
  - Text muted  : #8b93a7
  - Accent blue : #3b82f6 → #2563eb (gradient)
  - Accent label: #60a5fa
--}}
<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="x-apple-disable-message-reformatting">
  <title>{{ $title ?? 'Card Setu' }}</title>
  <!--[if mso]>
  <noscript><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml></noscript>
  <![endif]-->
  <style>
    /* ─── Reset ─────────────────────────────────────── */
    *, *::before, *::after { box-sizing: border-box; }
    body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
    table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
    img { -ms-interpolation-mode: bicubic; border: 0; display: block; }
    body { margin: 0; padding: 0; width: 100% !important; background-color: #07080f; }

    /* ─── Design tokens ──────────────────────────────── */
    :root {
      --clr-page:    #07080f;
      --clr-card:    #0f1117;
      --clr-surface: #161b27;
      --clr-elevated:#1e2535;
      --clr-border:  #252d3d;
      --clr-text:    #f0f2f7;
      --clr-muted:   #8b93a7;
      --clr-accent:  #3b82f6;
      --clr-label:   #60a5fa;
    }

    /* ─── Wrapper ────────────────────────────────────── */
    .email-page {
      background-color: #07080f;
      width: 100%;
      padding: clamp(16px, 4vw, 40px) clamp(12px, 3vw, 24px);
    }
    .email-card {
      background: linear-gradient(160deg, #0f1117 0%, #0b0e16 100%);
      border: 1px solid #252d3d;
      border-radius: clamp(14px, 3vw, 20px);
      box-shadow: 0 20px 60px rgba(0,0,0,.55), 0 0 0 1px rgba(255,255,255,.03);
      margin: 0 auto;
      max-width: 600px;
      overflow: hidden;
      width: 100%;
    }

    /* ─── Header strip ───────────────────────────────── */
    .email-header {
      background: linear-gradient(135deg, #0a1628 0%, #0d1a35 50%, #101f40 100%);
      border-bottom: 1px solid #252d3d;
      padding: clamp(24px, 5vw, 40px) clamp(20px, 5vw, 40px) clamp(20px, 4vw, 32px);
      text-align: center;
      position: relative;
      overflow: hidden;
    }
    .email-header::before {
      content: '';
      position: absolute;
      top: -40px; left: 50%; transform: translateX(-50%);
      width: 240px; height: 240px;
      background: radial-gradient(circle, rgba(59,130,246,.18) 0%, transparent 70%);
      pointer-events: none;
    }
    .email-logo {
      display: block;
      width: 100%;
      text-align: center;
      margin: 0 auto clamp(12px, 3vw, 20px) auto;
    }
    .email-logo img {
      display: inline-block;
      height: clamp(32px, 6vw, 44px);
      width: auto;
      margin: 0 auto;
    }
    .email-badge {
      display: table;
      margin: 0 auto clamp(8px, 2vw, 12px) auto;
      background: rgba(59,130,246,.15);
      border: 1px solid rgba(59,130,246,.35);
      border-radius: 100px;
      color: #60a5fa;
      font-size: clamp(10px, 2vw, 12px);
      font-weight: 600;
      letter-spacing: .06em;
      padding: 4px 14px;
      text-transform: uppercase;
    }
    .email-header h1 {
      color: #f0f2f7;
      font-size: clamp(18px, 4.5vw, 26px);
      font-weight: 700;
      letter-spacing: -.02em;
      line-height: 1.25;
      margin: 0;
    }
    .email-header p.subtitle {
      color: #8b93a7;
      font-size: clamp(13px, 2.8vw, 15px);
      line-height: 1.6;
      margin: 10px 0 0;
    }

    /* ─── Body ───────────────────────────────────────── */
    .email-body {
      padding: clamp(24px, 5vw, 40px) clamp(20px, 5vw, 40px);
    }

    /* ─── Typography ─────────────────────────────────── */
    p {
      color: #8b93a7;
      font-size: clamp(13px, 2.8vw, 15px);
      line-height: 1.7;
      margin: 0 0 18px;
    }
    p strong { color: #d1d8e8; }
    h2 {
      color: #f0f2f7;
      font-size: clamp(15px, 3.5vw, 18px);
      font-weight: 700;
      letter-spacing: -.01em;
      margin: 0 0 14px;
    }
    h3 {
      color: #60a5fa;
      font-size: clamp(10px, 2.2vw, 12px);
      font-weight: 600;
      letter-spacing: .1em;
      margin: 0 0 10px;
      text-transform: uppercase;
    }
    a { color: #60a5fa; text-decoration: none; }
    a:hover { text-decoration: underline; }

    /* ─── Info card / Panel ──────────────────────────── */
    .info-card {
      background: #161b27;
      border: 1px solid #252d3d;
      border-radius: clamp(10px, 2.5vw, 14px);
      margin-bottom: 20px;
      overflow: hidden;
    }
    .info-card-header {
      background: #1e2535;
      border-bottom: 1px solid #252d3d;
      padding: 10px clamp(14px, 3vw, 20px);
    }
    .info-card-body {
      padding: clamp(14px, 3vw, 20px);
    }
    .info-row {
      display: flex;
      gap: 10px;
      margin-bottom: 10px;
      align-items: baseline;
    }
    .info-row:last-child { margin-bottom: 0; }
    .info-label {
      color: #60a5fa;
      flex-shrink: 0;
      font-size: clamp(11px, 2.2vw, 12px);
      font-weight: 600;
      letter-spacing: .06em;
      min-width: 90px;
      text-transform: uppercase;
    }
    .info-value {
      color: #d1d8e8;
      font-size: clamp(13px, 2.8vw, 15px);
      line-height: 1.5;
      word-break: break-word;
    }

    /* ─── Message panel ──────────────────────────────── */
    .message-panel {
      background: #161b27;
      border: 1px solid #252d3d;
      border-left: 3px solid #3b82f6;
      border-radius: 10px;
      color: #d1d8e8;
      font-size: clamp(13px, 2.8vw, 15px);
      line-height: 1.7;
      margin-bottom: 20px;
      padding: clamp(14px, 3vw, 20px);
    }

    /* ─── OTP / Code box ─────────────────────────────── */
    .code-wrapper { text-align: center; margin: 28px 0; }
    .code-box {
      background: #161b27;
      border: 1px dashed #3b82f6;
      border-radius: 14px;
      color: #3b82f6;
      display: inline-block;
      font-family: Menlo, Monaco, "Courier New", monospace;
      font-size: clamp(26px, 6vw, 36px);
      font-weight: 800;
      letter-spacing: .18em;
      padding: clamp(14px, 3vw, 20px) clamp(24px, 6vw, 40px);
    }
    .code-expiry {
      color: #8b93a7;
      font-size: clamp(11px, 2.2vw, 13px);
      margin-top: 10px;
    }

    /* ─── Table (orders) ─────────────────────────────── */
    .data-table {
      border-collapse: collapse;
      border-radius: 12px;
      margin-bottom: 20px;
      overflow: hidden;
      width: 100%;
    }
    .data-table thead th {
      background: #1e2535;
      border-bottom: 1px solid #252d3d;
      color: #60a5fa;
      font-size: clamp(10px, 2vw, 12px);
      font-weight: 600;
      letter-spacing: .08em;
      padding: clamp(10px, 2.5vw, 14px) clamp(10px, 2.5vw, 14px);
      text-align: left;
      text-transform: uppercase;
    }
    .data-table tbody td {
      border-bottom: 1px solid #252d3d;
      color: #8b93a7;
      font-size: clamp(12px, 2.5vw, 14px);
      padding: clamp(10px, 2.5vw, 14px);
    }
    .data-table tbody tr:last-child td { border-bottom: none; }
    .data-table tfoot td {
      background: #1e2535;
      border-top: 1px solid #252d3d;
      color: #f0f2f7;
      font-size: clamp(13px, 2.8vw, 15px);
      font-weight: 700;
      padding: clamp(10px, 2.5vw, 14px);
    }

    /* ─── CTA Button ─────────────────────────────────── */
    .btn-wrapper { margin: 28px 0; text-align: center; }
    .btn {
      background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
      border: none;
      border-radius: 12px;
      box-shadow: 0 4px 16px rgba(59,130,246,.35);
      color: #ffffff !important;
      display: inline-block;
      font-size: clamp(13px, 2.8vw, 15px);
      font-weight: 600;
      letter-spacing: .01em;
      padding: clamp(12px, 2.5vw, 16px) clamp(24px, 5vw, 36px);
      text-decoration: none !important;
    }

    /* ─── Divider ────────────────────────────────────── */
    .divider {
      border: none;
      border-top: 1px solid #1e2535;
      margin: clamp(20px, 4vw, 32px) 0;
    }

    /* ─── Footer ─────────────────────────────────────── */
    .email-footer {
      border-top: 1px solid #1e2535;
      padding: clamp(16px, 3.5vw, 24px) clamp(20px, 5vw, 40px);
      text-align: center;
    }
    .email-footer p {
      color: #4b5568;
      font-size: clamp(10px, 2vw, 12px);
      line-height: 1.6;
      margin: 0;
    }
    .email-footer a { color: #4b6fa0; }

    /* ─── Warning/Note box ───────────────────────────── */
    .note-box {
      background: rgba(234,179,8,.07);
      border: 1px solid rgba(234,179,8,.2);
      border-radius: 10px;
      color: #c9a227;
      font-size: clamp(12px, 2.4vw, 13px);
      line-height: 1.6;
      margin-bottom: 20px;
      padding: clamp(12px, 2.5vw, 16px);
    }
    .note-box strong { color: #eab308; }

    /* ─── Success indicator ──────────────────────────── */
    .success-icon {
      background: rgba(34,197,94,.12);
      border: 1px solid rgba(34,197,94,.25);
      border-radius: 50%;
      color: #22c55e;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      font-size: 28px;
      height: 60px;
      margin: 0 auto 16px;
      width: 60px;
    }

    /* ─── Mobile ─────────────────────────────────────── */
    @media only screen and (max-width: 480px) {
      .email-card { border-radius: 14px !important; }
      .data-table thead th:nth-child(3),
      .data-table tbody td:nth-child(3) { display: none; }
      .info-row { flex-direction: column; gap: 3px; }
      .info-label { min-width: unset; }
    }
  </style>
</head>
<body>
  <div class="email-page">
    @yield('content')
  </div>
</body>
</html>
