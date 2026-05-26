<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Card Setu</title>
    <style>
        body { background-color: #0b0f19; color: #f3f4f6; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; margin: 0; padding: 0; width: 100% !important; -webkit-text-size-adjust: none; }
        .container { margin: 0 auto; max-width: 600px; padding: 40px 20px; }
        .card { background-color: #111827; border: 1px solid #1f2937; border-radius: 16px; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.5); padding: 40px; text-align: left; }
        .logo { text-align: center; margin-bottom: 32px; }
        h1, h2, h3 { color: #ffffff; font-weight: 700; margin-top: 0; margin-bottom: 16px; }
        h1 { font-size: 24px; text-align: center; }
        h2 { font-size: 20px; }
        p { color: #9ca3af; font-size: 16px; line-height: 1.6; margin-top: 0; margin-bottom: 24px; }
        ul { color: #9ca3af; font-size: 16px; line-height: 1.6; margin-bottom: 24px; }
        li { margin-bottom: 8px; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 24px; text-align: left; }
        th, td { padding: 12px; border-bottom: 1px solid #1f2937; }
        th { background-color: #1f2937; color: #f3f4f6; }
        td { color: #9ca3af; }
        .btn { background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); border: none; border-radius: 12px; color: #ffffff !important; display: inline-block; font-size: 16px; font-weight: 600; padding: 14px 30px; text-decoration: none; box-shadow: 0 4px 6px -1px rgba(59, 130, 246, 0.4); text-align: center;}
        .btn-wrapper { text-align: center; margin: 32px 0; }
        .code-box { background-color: #1f2937; border: 1px dashed #3b82f6; border-radius: 12px; color: #3b82f6; display: inline-block; font-family: Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace; font-size: 32px; font-weight: 800; letter-spacing: 6px; padding: 16px 32px; margin: 24px 0; text-align: center; }
        .code-wrapper { text-align: center; }
        .divider { border-top: 1px solid #1f2937; margin: 32px 0; }
        .footer-text { color: #6b7280; font-size: 12px; line-height: 1.5; text-align: center; }
        .footer-text a { color: #3b82f6; text-decoration: none; }
        a { color: #3b82f6; text-decoration: none; }
        .panel { background-color: #1f2937; padding: 16px; border-radius: 8px; margin-bottom: 24px; color: #f3f4f6; }
    </style>
</head>
<body>
    <div class="container">
        <div class="card">
            <div class="logo">
                <img src="{{ env('FRONTEND_URL', 'http://127.0.0.1:3000') }}/logo-dark.png" alt="Card Setu Logo" style="height: 48px; width: auto;" />
            </div>
            
            
            <h1>Password Reset Request</h1>
            <p>Hi {{ $userName }},</p>
            <p>We received a request to reset the password for your Card Setu account. Click the button below to choose a new password.</p>
            <div class="btn-wrapper">
                <a href="{{ $resetUrl }}" class="btn" target="_blank">Reset Password</a>
            </div>
            <p>If you did not request a password reset, you can safely ignore this email. This link will expire in 60 minutes.</p>
            <p class="footer-text" style="text-align:left;">If you're having trouble clicking the button, copy and paste this URL into your browser:<br><a href="{{ $resetUrl }}">{{ $resetUrl }}</a></p>

            
            <div class="divider"></div>
            <p class="footer-text">&copy; {{ date('Y') }} Card Setu. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
