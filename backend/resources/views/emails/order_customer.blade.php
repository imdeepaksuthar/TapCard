<!DOCTYPE html>
<html>
<head>
    <title>Order Confirmation</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
    <h2>Thank you for your order, {{ $orderData['name'] }}!</h2>
    <p>We have successfully received your order and are processing it. Here are your order details:</p>
    
    <h3>Order Items</h3>
    <table border="1" cellpadding="10" cellspacing="0" style="border-collapse: collapse; width: 100%;">
        <thead>
            <tr style="background-color: #f8f9fa;">
                <th style="text-align: left;">Item</th>
                <th>Quantity</th>
                <th>Price</th>
                <th>Total</th>
            </tr>
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
                <td style="text-align: right;"><strong>₹{{ number_format(collect($cartItems)->sum(function($item) { return $item['price'] * $item['quantity']; }), 2) }}</strong></td>
            </tr>
        </tfoot>
    </table>

    <p style="margin-top: 20px;">
        If you have any questions, please contact us:<br>
        @if(!empty($contactInfo['name']))
            <strong>{{ $contactInfo['name'] }}</strong><br>
        @endif
        @if(!empty($contactInfo['email']))
            Email: <a href="mailto:{{ $contactInfo['email'] }}">{{ $contactInfo['email'] }}</a><br>
        @endif
        @if(!empty($contactInfo['phone']))
            Phone: <a href="tel:{{ $contactInfo['phone'] }}">{{ $contactInfo['phone'] }}</a><br>
        @endif
        @if(!empty($contactInfo['whatsapp']))
            WhatsApp: <a href="https://wa.me/{{ preg_replace('/[^0-9]/', '', $contactInfo['whatsapp']) }}">{{ $contactInfo['whatsapp'] }}</a><br>
        @endif
    </p>
</body>
</html>
