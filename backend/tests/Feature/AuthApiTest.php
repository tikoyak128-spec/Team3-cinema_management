<?php

namespace Tests\Feature;

use App\Models\User;
use App\Notifications\OtpNotification;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Notification;
use Tests\TestCase;

class AuthApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_register_does_not_create_user_until_otp_verified(): void
    {
        Notification::fake();

        $response = $this->postJson('/api/register', [
            'name' => 'New User',
            'email' => 'new@example.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
        ]);

        $response->assertOk()
            ->assertJsonPath('requires_verification', true)
            ->assertJsonPath('email', 'new@example.com');

        $this->assertDatabaseMissing('users', ['email' => 'new@example.com']);

        Notification::assertSentOnDemand(
            OtpNotification::class,
            fn (OtpNotification $notification) => $notification->purpose === 'registration'
        );
    }

    public function test_verify_otp_creates_user_after_valid_code(): void
    {
        Notification::fake();

        $code = null;

        $this->postJson('/api/register', [
            'name' => 'New User',
            'email' => 'new@example.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
        ])->assertOk();

        Notification::assertSentOnDemand(
            OtpNotification::class,
            function (OtpNotification $notification) use (&$code) {
                $code = $notification->code;

                return true;
            }
        );

        $this->assertNotNull($code);

        $response = $this->postJson('/api/verify-otp', [
            'email' => 'new@example.com',
            'otp' => $code,
        ]);

        $response->assertStatus(201)
            ->assertJsonPath('user.email', 'new@example.com')
            ->assertJsonPath('user.role', 'customer')
            ->assertJsonPath('verified', true)
            ->assertJsonStructure(['user', 'token']);

        $this->assertDatabaseHas('users', ['email' => 'new@example.com']);

        $user = User::where('email', 'new@example.com')->first();
        $this->assertNotNull($user->email_verified_at);
    }

    public function test_verify_otp_rejects_invalid_code(): void
    {
        Notification::fake();

        $this->postJson('/api/register', [
            'name' => 'New User',
            'email' => 'new@example.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
        ])->assertOk();

        $this->postJson('/api/verify-otp', [
            'email' => 'new@example.com',
            'otp' => '000000',
        ])->assertStatus(422);

        $this->assertDatabaseMissing('users', ['email' => 'new@example.com']);
    }

    public function test_register_rejects_duplicate_email(): void
    {
        User::create([
            'name' => 'Existing',
            'email' => 'existing@example.com',
            'password' => 'password123',
            'role' => 'customer',
            'email_verified_at' => now(),
        ]);

        $this->postJson('/api/register', [
            'name' => 'New User',
            'email' => 'existing@example.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
        ])->assertStatus(422);
    }

    public function test_login_returns_token_for_verified_user(): void
    {
        User::create([
            'name' => 'Bob',
            'email' => 'bob@example.com',
            'password' => 'password123',
            'role' => 'customer',
            'email_verified_at' => now(),
        ]);

        $response = $this->postJson('/api/login', [
            'email' => 'bob@example.com',
            'password' => 'password123',
        ]);

        $response->assertOk()
            ->assertJsonStructure(['user', 'token']);
    }

    public function test_login_of_unverified_user_requires_otp(): void
    {
        Notification::fake();

        User::create([
            'name' => 'Bob',
            'email' => 'bob@example.com',
            'password' => 'password123',
            'role' => 'customer',
        ]);

        $response = $this->postJson('/api/login', [
            'email' => 'bob@example.com',
            'password' => 'password123',
        ]);

        $response->assertOk()
            ->assertJsonPath('requires_verification', true)
            ->assertJsonPath('email', 'bob@example.com')
            ->assertJsonMissingPath('token');

        Notification::assertSentTo(
            User::where('email', 'bob@example.com')->first(),
            OtpNotification::class,
            fn (OtpNotification $notification) => $notification->purpose === 'login'
        );
    }

    public function test_login_rejects_invalid_credentials(): void
    {
        User::create([
            'name' => 'Bob',
            'email' => 'bob@example.com',
            'password' => 'password123',
            'role' => 'customer',
            'email_verified_at' => now(),
        ]);

        $this->postJson('/api/login', [
            'email' => 'bob@example.com',
            'password' => 'wrong-password',
        ])->assertStatus(401);
    }

    public function test_me_requires_authentication(): void
    {
        $this->getJson('/api/me')->assertStatus(401);
    }

    public function test_me_returns_authenticated_user(): void
    {
        $user = User::create([
            'name' => 'Carol',
            'email' => 'carol@example.com',
            'password' => 'password123',
            'role' => 'admin',
            'email_verified_at' => now(),
        ]);

        $token = $user->createToken('test')->plainTextToken;

        $this->withToken($token)
            ->getJson('/api/me')
            ->assertOk()
            ->assertJsonPath('email', 'carol@example.com');
    }

    public function test_logout_invalidates_token(): void
    {
        $user = User::create([
            'name' => 'Dave',
            'email' => 'dave@example.com',
            'password' => 'password123',
            'role' => 'customer',
            'email_verified_at' => now(),
        ]);

        $token = $user->createToken('test')->plainTextToken;

        $this->withToken($token)->postJson('/api/logout')->assertOk();

        $this->assertDatabaseCount('personal_access_tokens', 0);

        $this->refreshApplication();
        $this->withToken($token)->getJson('/api/me')->assertStatus(401);
    }
}