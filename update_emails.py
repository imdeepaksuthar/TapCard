import os

template = """<!DOCTYPE html>
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
            
            {CONTENT}
            
            <div class="divider"></div>
            <p class="footer-text">&copy; {{ date('Y') }} Card Setu. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
"""

contents = {
    r'c:\laragon\www\TapCard\backend\resources\views\emails\otp.blade.php': """
            <h1>Verification Code</h1>
            <p>Hi {{ $userName }},</p>
            <p>Use the verification code below to complete your login. This code is valid for 10 minutes and can only be used once.</p>
            <div class="code-wrapper">
                <div class="code-box">{{ $otpCode }}</div>
            </div>
            <p>If you did not request this verification code, please ignore this email. Someone may have entered your email address by mistake.</p>
""",
    r'c:\laragon\www\TapCard\backend\resources\views\emails\reset_password.blade.php': """
            <h1>Password Reset Request</h1>
            <p>Hi {{ $userName }},</p>
            <p>We received a request to reset the password for your Card Setu account. Click the button below to choose a new password.</p>
            <div class="btn-wrapper">
                <a href="{{ $resetUrl }}" class="btn" target="_blank">Reset Password</a>
            </div>
            <p>If you did not request a password reset, you can safely ignore this email. This link will expire in 60 minutes.</p>
            <p class="footer-text" style="text-align:left;">If you're having trouble clicking the button, copy and paste this URL into your browser:<br><a href="{{ $resetUrl }}">{{ $resetUrl }}</a></p>
""",
    r'c:\laragon\www\TapCard\backend\resources\views\emails\order_customer.blade.php': """
            <h2>Thank you for your order, {{ $orderData['name'] }}!</h2>
            <p>We have successfully received your order and are processing it. Here are your order details:</p>
            
            <h3>Order Items</h3>
            <table>
                <thead>
                    <tr><th style="text-align: left;">Item</th><th style="text-align: center;">Quantity</th><th style="text-align: right;">Price</th><th style="text-align: right;">Total</th></tr>
                </thead>
                <tbody>
                    @foreach($cartItems as $item)
                    <tr>
                        <td>{{ $item['name'] }}</td>
                        <td style="text-align: center;">{{ $item['quantity'] }}</td>
                        <td style="text-align: right;">₹{{ number_format($item['price'], 2) }}</td>
                        <td style="text-align: right;">₹{{ number_format($item['price'] * $item['quantity'], 2) }}</td>
                    </tr>
                    @endforeach
                </tbody>
                <tfoot>
                    <tr>
                        <td colspan="3" style="text-align: right;"><strong>Grand Total:</strong></td>
                        <td style="text-align: right; color:#fff;"><strong>₹{{ number_format(collect($cartItems)->sum(function($item) { return $item['price'] * $item['quantity']; }), 2) }}</strong></td>
                    </tr>
                </tfoot>
            </table>
            
            <p style="margin-top: 32px;">
                If you have any questions, please contact us:<br><br>
                @if(!empty($contactInfo['name']))<strong>{{ $contactInfo['name'] }}</strong><br>@endif
                @if(!empty($contactInfo['email']))Email: <a href="mailto:{{ $contactInfo['email'] }}">{{ $contactInfo['email'] }}</a><br>@endif
                @if(!empty($contactInfo['phone']))Phone: <a href="tel:{{ $contactInfo['phone'] }}">{{ $contactInfo['phone'] }}</a><br>@endif
                @if(!empty($contactInfo['whatsapp']))WhatsApp: <a href="https://wa.me/{{ preg_replace('/[^0-9]/', '', $contactInfo['whatsapp']) }}">{{ $contactInfo['whatsapp'] }}</a><br>@endif
            </p>
""",
    r'c:\laragon\www\TapCard\backend\resources\views\emails\order_admin.blade.php': """
            <h2>New Order Received!</h2>
            <p>You have received a new order from <strong>{{ $orderData['name'] }}</strong>.</p>
            
            <h3>Customer Details</h3>
            <ul>
                <li><strong>Name:</strong> {{ $orderData['name'] }}</li>
                <li><strong>Phone:</strong> {{ $orderData['phone'] }}</li>
                <li><strong>Email:</strong> {{ $orderData['email'] }}</li>
                <li><strong>Pincode:</strong> {{ $orderData['pincode'] }}</li>
                <li><strong>Area/Village:</strong> {{ $orderData['village'] }}</li>
            </ul>

            <h3>Order Items</h3>
            <table>
                <thead>
                    <tr><th style="text-align: left;">Item</th><th style="text-align: center;">Quantity</th><th style="text-align: right;">Price</th><th style="text-align: right;">Total</th></tr>
                </thead>
                <tbody>
                    @foreach($cartItems as $item)
                    <tr>
                        <td>{{ $item['name'] }}</td>
                        <td style="text-align: center;">{{ $item['quantity'] }}</td>
                        <td style="text-align: right;">₹{{ number_format($item['price'], 2) }}</td>
                        <td style="text-align: right;">₹{{ number_format($item['price'] * $item['quantity'], 2) }}</td>
                    </tr>
                    @endforeach
                </tbody>
                <tfoot>
                    <tr>
                        <td colspan="3" style="text-align: right;"><strong>Grand Total:</strong></td>
                        <td style="text-align: right; color:#fff;"><strong>₹{{ number_format(collect($cartItems)->sum(function($item) { return $item['price'] * $item['quantity']; }), 2) }}</strong></td>
                    </tr>
                </tfoot>
            </table>
""",
    r'c:\laragon\www\TapCard\backend\resources\views\emails\leads\new.blade.php': """
            <h2>You have a new inquiry!</h2>
            <p>You received a new inquiry from your TapCard business card.</p>
            
            <h3>Contact Details:</h3>
            <ul>
                <li><strong>Name:</strong> {{ $lead->name }}</li>
                @if($lead->email)
                <li><strong>Email:</strong> <a href="mailto:{{ $lead->email }}">{{ $lead->email }}</a></li>
                @endif
                @if($lead->phone)
                <li><strong>Phone:</strong> <a href="tel:{{ $lead->phone }}">{{ $lead->phone }}</a></li>
                @endif
            </ul>

            @if($lead->message)
            <h3>Message:</h3>
            <div class="panel">
                {{ $lead->message }}
            </div>
            @endif

            <div class="btn-wrapper">
                <a href="{{ env('FRONTEND_URL', 'http://127.0.0.1:3000') }}/dashboard/leads" class="btn">View All Leads</a>
            </div>
""",
    r'c:\laragon\www\TapCard\backend\resources\views\emails\verify_email.blade.php': """
            <h1>Verify your email</h1>
            <p>Hi {{ $userName }},</p>
            <p>Thank you for creating an account with Card Setu. Please click the button below to verify your email address and activate your account.</p>
            <div class="btn-wrapper">
                <a href="{{ $verifyUrl }}" class="btn" target="_blank">Verify Email Address</a>
            </div>
            <p>If you did not create an account, no further action is required.</p>
            <p class="footer-text" style="text-align:left;">If you're having trouble clicking the button, copy and paste this URL into your browser:<br><a href="{{ $verifyUrl }}">{{ $verifyUrl }}</a></p>
"""
}

for path, content in contents.items():
    if os.path.exists(path):
        final_html = template.replace("{CONTENT}", content)
        with open(path, 'w', encoding='utf-8') as f:
            f.write(final_html)

print("Email templates updated successfully!")
