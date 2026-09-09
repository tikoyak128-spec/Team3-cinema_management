<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class AuthController extends Controller
{
    private const REGISTRATION_CACHE_KEY = 'pending_registration:';
    private const OTP_TTL_MINUTES = 15;

    public function register(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users,email'],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
            'phone' => ['nullable', 'string', 'max:20'],
            'role' => ['sometimes', 'string', Rule::in(['admin', 'staff', 'customer'])],
        ]);

        $email = Str::lower($validated['email']);
        $otp = $this->generateOtp();

        // Pending registration is held outside the users table.
        // The user is only written to the database after the OTP is verified.
        Cache::put($this->cacheKey($email), [
            'name' => $validated['name'],
            'email' => $email,
            'phone' => $validated['phone'] ?? null,
            'password' => $validated['password'],
            'role' => $validated['role'] ?? 'customer',
            'otp' => Hash::make($otp),
            'expires_at' => now()->addMinutes(self::OTP_TTL_MINUTES),
        ], now()->addMinutes(self::OTP_TTL_MINUTES));

        Notification::route('mail', $email)
            ->notify(new \App\Notifications\OtpNotification($otp, 'registration'));

        return response()->json([
            'message' => 'A verification code has been sent to your email. Verify within 15 minutes to complete your registration.',
            'email' => $email,
            'requires_verification' => true,
        ]);
    }

    public function verifyOtp(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'email' => ['required', 'string', 'email'],
            'otp' => ['required', 'string', 'digits:6'],
        ]);

        $email = Str::lower($validated['email']);
        $pending = Cache::get($this->cacheKey($email));

        // Case 1: pending registration that has not touched the database yet.
        if (is_array($pending) && !empty($pending['otp'])) {
            if (now()->greaterThan($pending['expires_at'])) {
                Cache::forget($this->cacheKey($email));

                return response()->json([
                    'message' => 'This verification code has expired. Please register again.',
                ], 422);
            }

            if (!Hash::check($validated['otp'], $pending['otp'])) {
                return response()->json([
                    'message' => 'Invalid verification code.',
                ], 422);
            }

            if (User::where('email', $email)->exists()) {
                Cache::forget($this->cacheKey($email));

                return response()->json([
                    'message' => 'This email is already registered. Please sign in.',
                ], 409);
            }

            $user = User::create([
                'name' => $pending['name'],
                'email' => $email,
                'password' => $pending['password'],
                'phone' => $pending['phone'],
                'role' => $pending['role'],
                'email_verified_at' => now(),
            ]);

            Cache::forget($this->cacheKey($email));

            $token = $user->createToken('auth-token')->plainTextToken;

            return response()->json([
                'user' => $user,
                'token' => $token,
                'verified' => true,
                'message' => 'Email verified successfully. Your account has been created.',
            ], 201);
        }

        // Case 2: an existing account that is not yet verified (login OTP flow).
        $user = User::where('email', $email)->first();

        if (!$user) {
            return response()->json([
                'message' => 'No pending registration found for this email. Please register first.',
            ], 404);
        }

        if (!$user->verifyLoginOtp($validated['otp'])) {
            return response()->json([
                'message' => 'Invalid or expired verification code.',
            ], 422);
        }

        if (!$user->hasVerifiedEmail()) {
            $user->markEmailAsVerified();
        }

        $token = $user->createToken('auth-token')->plainTextToken;

        return response()->json([
            'user' => $user,
            'token' => $token,
            'verified' => true,
            'message' => 'Email verified successfully.',
        ]);
    }

    public function resendOtp(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'email' => ['required', 'string', 'email'],
        ]);

        $email = Str::lower($validated['email']);
        $key = $this->cacheKey($email);
        $pending = Cache::get($key);

        if (is_array($pending) && !empty($pending['otp'])) {
            $otp = $this->generateOtp();
            $pending['otp'] = Hash::make($otp);
            $pending['expires_at'] = now()->addMinutes(self::OTP_TTL_MINUTES);

            Cache::put($key, $pending, now()->addMinutes(self::OTP_TTL_MINUTES));

            Notification::route('mail', $email)
                ->notify(new \App\Notifications\OtpNotification($otp, 'registration'));

            return response()->json([
                'message' => 'A new verification code has been sent to your email.',
            ]);
        }

        $user = User::where('email', $email)->first();

        if ($user && !$user->hasVerifiedEmail()) {
            $user->sendOtp();

            return response()->json([
                'message' => 'A new verification code has been sent to your email.',
            ]);
        }

        return response()->json([
            'message' => 'No pending verification found for this email.',
        ], 404);
    }

    public function login(Request $request): JsonResponse
    {
        $request->validate([
            'email' => ['required', 'string', 'email'],
            'password' => ['required', 'string'],
        ]);

        $user = User::where('email', Str::lower($request->email))->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            return response()->json([
                'message' => 'Invalid credentials',
            ], 401);
        }

        if (!$user->hasVerifiedEmail()) {
            $user->sendOtp();

            return response()->json([
                'message' => 'Please verify your email before logging in. A verification code has been sent to your email.',
                'requires_verification' => true,
                'email' => $user->email,
            ], 200);
        }

        $token = $user->createToken('auth-token')->plainTextToken;

        return response()->json([
            'user' => $user,
            'token' => $token,
            'verified' => true,
        ]);
    }

    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'message' => 'Logged out successfully',
        ]);
    }

    public function me(Request $request): JsonResponse
    {
        return response()->json($request->user());
    }

    private function generateOtp(): string
    {
        return (string) random_int(100000, 999999);
    }

    private function cacheKey(string $email): string
    {
        return self::REGISTRATION_CACHE_KEY.$email;
    }
}