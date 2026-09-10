<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class ResetPasswordNotification extends Notification
{
    use Queueable;

    protected $token;

    public function __construct($token)
    {
        $this->token = $token;
    }

    public function via($notifiable)
    {
        return ['mail'];
    }

    public function toMail($notifiable)
    {
        $url = config('app.frontend_url')
            . '/reset-password?token='
            . $this->token
            . '&email='
            . urlencode($notifiable->email);

        return (new MailMessage)
            ->subject('Reset Your Password')
            ->greeting('Hello ' . $notifiable->name . '!')
            ->line('You requested to reset your password.')
            ->action('Reset Password', $url)
            ->line('This password reset link will expire soon.')
            ->line('If you did not request this, you can ignore this email.');
    }
}