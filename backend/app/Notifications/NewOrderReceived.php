<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Notification;

class NewOrderReceived extends Notification implements ShouldQueue
{
    use Queueable;

    public $orderData;
    public $cardName;

    /**
     * Create a new notification instance.
     */
    public function __construct(array $orderData, string $cardName)
    {
        $this->orderData = $orderData;
        $this->cardName = $cardName;
    }

    /**
     * Get the notification's delivery channels.
     *
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['database'];
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toDatabase(object $notifiable): array
    {
        return [
            'type' => 'order',
            'name' => $this->orderData['name'] ?? 'A customer',
            'card_name' => $this->cardName,
            'email' => $this->orderData['email'] ?? null,
            'phone' => $this->orderData['phone'] ?? null,
            'message' => 'New order received from ' . ($this->orderData['name'] ?? 'A customer'),
            'amount' => $this->orderData['total'] ?? null,
        ];
    }
}
