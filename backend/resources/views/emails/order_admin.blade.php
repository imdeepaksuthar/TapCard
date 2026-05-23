<!DOCTYPE html>
<html>
<head>
    <title>New Order</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
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
</body>
</html>
