<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Your Verification Code</title>
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
        .code-box {
            background-color: #1f2937;
            border: 1px dashed #3b82f6;
            border-radius: 12px;
            color: #3b82f6;
            display: inline-block;
            font-family: Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
            font-size: 32px;
            font-weight: 800;
            letter-spacing: 6px;
            padding: 16px 32px;
            margin: 24px 0;
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
    </style>
</head>
<body>
    <div class="container">
        <div class="card">
            <div class="logo">
                <span class="logo-text-main">Card</span> <span class="logo-text-accent">Setu</span>
            </div>
            
            <h1>Verification Code</h1>
            
            <p>Hi {{ $userName }},</p>
            
            <p>Use the verification code below to complete your login. This code is valid for 10 minutes and can only be used once.</p>
            
            <div class="code-box">
                {{ $otpCode }}
            </div>
            
            <p>If you did not request this verification code, please ignore this email. Someone may have entered your email address by mistake.</p>
            
            <div class="divider"></div>
            
            <p class="footer-text">
                &copy; {{ date('Y') }} Card Setu. All rights reserved.
            </p>
        </div>
    </div>
</body>
</html>
