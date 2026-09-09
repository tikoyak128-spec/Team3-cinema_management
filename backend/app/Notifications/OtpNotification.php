<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class OtpNotification extends Notification
{
    use Queueable;

    public function __construct(
        public string $code,
        public string $purpose = 'registration',
    ) {}

    /**
     * Get the notification's delivery channels.
     *
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $intro = $this->purpose === 'login'
            ? 'A sign-in was requested for your Khmer Cinema account.'
            : 'Almost there! Confirm your email to complete your Khmer Cinema registration.';

        return (new MailMessage)
            ->subject('Your Khmer Cinema OTP Code')
            ->greeting('Hello!')
            ->line($intro)
            ->line('Your one-time password (OTP) is:')
            ->line('**'.$this->code.'**')
            ->line('This code is valid for 15 minutes. If you did not request this code, you can ignore this email.');
    }
}