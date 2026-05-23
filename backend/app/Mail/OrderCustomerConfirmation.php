<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class OrderCustomerConfirmation extends Mailable
{
    use Queueable, SerializesModels;

    public $orderData;
    public $cartItems;
    public $contactInfo;

    /**
     * Create a new message instance.
     */
    public function __construct($orderData, $cartItems, $contactInfo)
    {
        $this->orderData = $orderData;
        $this->cartItems = $cartItems;
        $this->contactInfo = $contactInfo;
    }

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Order Confirmation',
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        return new Content(
            view: 'emails.order_customer',
        );
    }

    /**
     * Get the attachments for the message.
     *
     * @return array<int, \Illuminate\Mail\Mailables\Attachment>
     */
    public function attachments(): array
    {
        return [];
    }
}
