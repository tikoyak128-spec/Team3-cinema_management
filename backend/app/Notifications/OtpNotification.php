<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class OtpNotification extends Notification implements ShouldQueue
{
    use Queueable;

    protected $otpCode;

    public function __construct(string $otpCode)
    {
        $this->otpCode = $otpCode;
    }

    public function via($notifiable): array
    {
        return ['mail'];
    }

    public function toMail($notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('Verify Your Email - Khmer Cinema')
            ->greeting('Hello ' . $notifiable->name . '!')
            ->line('Your verification code is:')
            ->line("**{$this->otpCode}**")
            ->line('This code will expire in 10 minutes.')
            ->line('If you did not create an account, please ignore this email.');
    }
}
