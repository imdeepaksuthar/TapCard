<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Reset Your Password</title>
    <style>
        body {
            background-color: #0b0f19;
            color: #f3f4f6;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            margin: 0;
            padding: 0;
            width: 100% !important;
            -webkit-text-size-adjust: none;
        }
        .container {
            margin: 0 auto;
            max-width: 600px;
            padding: 40px 20px;
        }
        .card {
            background-color: #111827;
            border: 1px solid #1f2937;
            border-radius: 16px;
            box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.5);
            padding: 40px;
            text-align: center;
        }
        .logo {
            font-size: 28px;
            font-weight: 800;
            letter-spacing: -0.05em;
            margin-bottom: 24px;
        }
        .logo-text-accent {
            color: #3b82f6;
        }
        .logo-text-main {
            color: #f3f4f6;
        }
        h1 {
            color: #ffffff;
            font-size: 24px;
            font-weight: 700;
            margin-top: 0;
            margin-bottom: 16px;
        }
        p {
            color: #9ca3af;
            font-size: 16px;
            line-height: 1.6;
            margin-top: 0;
            margin-bottom: 24px;
        }
        .btn {
            background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
            border: none;
            border-radius: 12px;
            color: #ffffff !important;
            display: inline-block;
            font-size: 16px;
            font-weight: 600;
            padding: 14px 30px;
            text-decoration: none;
            text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
            transition: all 0.2s ease-in-out;
            box-shadow: 0 4px 6px -1px rgba(59, 130, 246, 0.4);
        }
        .divider {
            border-top: 1px solid #1f2937;
            margin: 32px 0;
        }
        .footer-text {
            color: #6b7280;
            font-size: 12px;
            line-height: 1.5;
        }
        .footer-text a {
            color: #3b82f6;
            text-decoration: none;
        }
        .footer-text a:hover {
            text-decoration: underline;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="card">
            <div class="logo">
                <span class="logo-text-main">Card</span> <span class="logo-text-accent">Setu</span>
            </div>
            
            <h1>Password Reset Request</h1>
            
            <p>Hi {{ $userName }},</p>
            
            <p>We received a request to reset the password for your Card Setu account. Click the button below to choose a new password.</p>
            
            <div style="margin: 32px 0;">
                <a href="{{ $resetUrl }}" class="btn" target="_blank">Reset Password</a>
            </div>
            
            <p>If you did not request a password reset, you can safely ignore this email. This link will expire in 60 minutes.</p>
            
            <div class="divider"></div>
            
            <p class="footer-text">
                If you're having trouble clicking the button, copy and paste this URL into your browser:<br>
                <a href="{{ $resetUrl }}">{{ $resetUrl }}</a>
            </p>
            
            <p class="footer-text">
                &copy; {{ date('Y') }} Card Setu. All rights reserved.
            </p>
        </div>
    </div>
</body>
</html>
