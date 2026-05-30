<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome to Card Setu</title>
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
        .divider { border-top: 1px solid #1f2937; margin: 32px 0; }
        .footer-text { color: #6b7280; font-size: 12px; line-height: 1.5; text-align: center; }
        .footer-text a { color: #3b82f6; text-decoration: none; }
        a { color: #3b82f6; text-decoration: none; }
    </style>
</head>
<body>
    <div class="container">
        <div class="card">
            <div class="logo">
                <img src="{{ env('FRONTEND_URL', 'http://127.0.0.1:3000') }}/logo-dark.png" alt="Card Setu Logo" style="height: 48px; width: auto;" />
            </div>
            
            <h1>Welcome to Card Setu!</h1>
            <p>Hi {{ $user->name }},</p>
            <p>Thank you for registering and verifying your email address. We are thrilled to have you on board!</p>
            <p>Card Setu is your ultimate platform for creating, managing, and sharing beautiful digital business cards. It's time to build your professional identity.</p>
            
            <div class="btn-wrapper">
                <a href="{{ env('FRONTEND_URL', 'http://127.0.0.1:3000') }}/dashboard" class="btn">Go to Dashboard</a>
            </div>
            
            <p>If you have any questions, feel free to reply to this email. We're here to help.</p>

            <div class="divider"></div>
            <p class="footer-text">&copy; {{ date('Y') }} Card Setu. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
