<?php

namespace App\Models;

use Illuminate\Contracts\Auth\MustVerifyEmail;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Facades\Hash;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable implements MustVerifyEmail
{
    /** @use HasFactory<UserFactory> */
    use HasApiTokens, HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'role',
        'phone',
        'email_verified_at',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
        'otp_code',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'otp_expires_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    public function sendOtp(): void
    {
        $this->sendLoginOtpNotification($this->generateLoginOtp());
    }

    public function verifyLoginOtp(?string $code): bool
    {
        if (!$this->otp_code || !$this->otp_expires_at || now()->greaterThan($this->otp_expires_at)) {
            return false;
        }

        if (!$code || !Hash::check($code, $this->otp_code)) {
            return false;
        }

        $this->forceFill(['otp_code' => null, 'otp_expires_at' => null])->save();

        return true;
    }

    public function generateLoginOtp(): string
    {
        $code = (string) random_int(100000, 999999);

        $this->forceFill([
            'otp_code' => Hash::make($code),
            'otp_expires_at' => now()->addMinutes(15),
        ])->save();

        return $code;
    }

    protected function sendLoginOtpNotification(string $code): void
    {
        $this->notify(new \App\Notifications\OtpNotification($code, 'login'));
    }
}
