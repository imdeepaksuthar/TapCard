<x-mail::message>
# You have a new inquiry!

You received a new inquiry from your TapCard business card.

**Contact Details:**
- **Name:** {{ $lead->name }}
@if($lead->email)
- **Email:** [{{ $lead->email }}](mailto:{{ $lead->email }})
@endif
@if($lead->phone)
- **Phone:** [{{ $lead->phone }}](tel:{{ $lead->phone }})
@endif

@if($lead->message)
**Message:**
<x-mail::panel>
{{ $lead->message }}
</x-mail::panel>
@endif

<x-mail::button :url="config('app.frontend_url') . '/dashboard/leads'">
View All Leads
</x-mail::button>

Thanks,<br>
{{ config('app.name') }}
</x-mail::message>
