<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #3b82f6; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f9f9f9; padding: 20px; border-radius: 0 0 8px 8px; border: 1px solid #ddd; }
        .detail-row { margin-bottom: 10px; }
        .label { font-weight: bold; width: 100px; display: inline-block; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h2>New Appointment Request</h2>
        </div>
        <div class="content">
            <p>You have received a new appointment booking request from your TapCard ({{ $appointment->businessCard->personal_info['name'] ?? 'Professional Card' }}).</p>
            
            <div class="detail-row">
                <span class="label">Date:</span> {{ \Carbon\Carbon::parse($appointment->date)->format('M d, Y') }}
            </div>
            <div class="detail-row">
                <span class="label">Time:</span> {{ $appointment->time }}
            </div>
            <div class="detail-row">
                <span class="label">Name:</span> {{ $appointment->name }}
            </div>
            <div class="detail-row">
                <span class="label">Email:</span> <a href="mailto:{{ $appointment->email }}">{{ $appointment->email }}</a>
            </div>
            @if($appointment->phone)
            <div class="detail-row">
                <span class="label">Phone:</span> <a href="tel:{{ $appointment->phone }}">{{ $appointment->phone }}</a>
            </div>
            @endif
            @if($appointment->notes)
            <div class="detail-row">
                <span class="label">Notes:</span> {{ $appointment->notes }}
            </div>
            @endif

            <br>
            <p>Please log in to your TapCard dashboard to confirm or manage this appointment.</p>
        </div>
    </div>
</body>
</html>
