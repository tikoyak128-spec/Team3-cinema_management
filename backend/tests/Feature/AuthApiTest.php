<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AuthApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_register_creates_user_and_returns_token(): void
    {
        $response = $this->postJson('/api/register', [
            'name' => 'New User',
            'email' => 'new@example.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
        ]);

        $response->assertStatus(201)
            ->assertJsonPath('user.email', 'new@example.com')
            ->assertJsonPath('user.role', 'customer')
            ->assertJsonStructure(['user', 'token']);

        $this->assertDatabaseHas('users', ['email' => 'new@example.com']);
    }

    public function test_login_returns_token(): void
    {
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
            ->assertJsonStructure(['user', 'token']);
    }

    public function test_login_rejects_invalid_credentials(): void
    {
        User::create([
            'name' => 'Bob',
            'email' => 'bob@example.com',
            'password' => 'password123',
            'role' => 'customer',
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
        ]);

        $token = $user->createToken('test')->plainTextToken;

        $this->withToken($token)->postJson('/api/logout')->assertOk();

        $this->assertDatabaseCount('personal_access_tokens', 0);

        $this->refreshApplication();
        $this->withToken($token)->getJson('/api/me')->assertStatus(401);
    }
}
