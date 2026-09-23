<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Notifications\OtpNotification;
use App\Services\CloudinaryService;
use Illuminate\Auth\Events\PasswordReset;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Laravel\Socialite\Facades\Socialite;
use Throwable;

class AuthController extends Controller
{
    public function __construct(
        private CloudinaryService $cloudinary
    ) {}

    public function register(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users,email'],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
            'phone' => ['nullable', 'string', 'max:20'],
            'role' => ['sometimes', 'string', Rule::in(['admin', 'staff', 'customer'])],
        ]);

        $otpCode = str_pad(random_int(0, 999999), 6, '0', STR_PAD_LEFT);
        $otpExpiresAt = now()->addMinutes(10);

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => $validated['password'],
            'phone' => $validated['phone'] ?? null,
            'role' => 'customer',
            'otp' => $otpCode,
            'otp_expires_at' => $otpExpiresAt,
        ]);

        $emailSent = true;
        $mailError = null;

        try {
            $user->notify(new OtpNotification($otpCode));
        } catch (Throwable $e) {
            $emailSent = false;
            $mailError = $e->getMessage();
            Log::warning('Failed to send OTP email: '.$e->getMessage());
        }

        return response()->json([
            'message' => 'Account created. Please verify your email with the OTP code sent.',
            'email' => $user->email,
            'email_sent' => $emailSent,
            'email_error' => $mailError,
        ], 201);
    }

    public function verifyOtp(Request $request): JsonResponse
    {
        $request->validate([
            'email' => ['required', 'string', 'email'],
            'otp' => ['required', 'string', 'digits:6'],
        ]);

        $user = User::where('email', $request->email)->first();

        if (! $user) {
            return response()->json(['message' => 'User not found.'], 404);
        }

        if ($user->email_verified_at) {
            return response()->json(['message' => 'Email already verified.'], 400);
        }

        if (! $user->otp || ! $user->otp_expires_at) {
            return response()->json(['message' => 'No OTP found. Please request a new one.'], 400);
        }

        if ($user->otp_expires_at->isPast()) {
            return response()->json(['message' => 'OTP has expired. Please request a new one.'], 400);
        }

        if (! hash_equals($user->otp, $request->otp)) {
            return response()->json(['message' => 'Invalid OTP code.'], 400);
        }

        $user->update([
            'otp' => null,
            'otp_expires_at' => null,
            'email_verified_at' => now(),
        ]);

        $token = $user->createToken('auth-token')->plainTextToken;

        return response()->json([
            'message' => 'Email verified successfully.',
            'user' => $user,
            'token' => $token,
        ]);
    }

    public function resendOtp(Request $request): JsonResponse
    {
        $request->validate([
            'email' => ['required', 'string', 'email'],
        ]);

        $user = User::where('email', $request->email)->first();

        if (! $user) {
            return response()->json(['message' => 'User not found.'], 404);
        }

        if ($user->email_verified_at) {
            return response()->json(['message' => 'Email already verified.'], 400);
        }

        $otpCode = str_pad(random_int(0, 999999), 6, '0', STR_PAD_LEFT);
        $otpExpiresAt = now()->addMinutes(10);

        $user->update([
            'otp' => $otpCode,
            'otp_expires_at' => $otpExpiresAt,
        ]);

        $emailSent = true;
        $mailError = null;

        try {
            $user->notify(new OtpNotification($otpCode));
        } catch (Throwable $e) {
            $emailSent = false;
            $mailError = $e->getMessage();
            Log::warning('Failed to send OTP email: '.$e->getMessage());
        }

        return response()->json([
            'message' => 'A new OTP code has been sent to your email.',
            'email_sent' => $emailSent,
            'email_error' => $mailError,
        ]);
    }

    public function forgotPassword(Request $request): JsonResponse
    {
        $request->validate([
            'email' => ['required', 'string', 'email'],
        ]);

        $status = Password::sendResetLink(
            $request->only('email')
        );

        if ($status === Password::RESET_LINK_SENT) {
            return response()->json([
                'message' => 'Password reset link sent to your email.',
            ]);
        }

        if ($status === Password::RESET_THROTTLED) {
            return response()->json([
                'message' => 'Too many requests. Please wait a minute before trying again.',
            ], 429);
        }

        return response()->json([
            'message' => 'If an account exists for that email, a password reset link will be sent.',
        ]);
    }

    public function resetPassword(Request $request): JsonResponse
    {
        $request->validate([
            'token' => ['required', 'string'],
            'email' => ['required', 'string', 'email'],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
        ]);

        $status = Password::reset(
            $request->only('email', 'password', 'password_confirmation', 'token'),
            function ($user, $password) {
                $user->forceFill([
                    'password' => Hash::make($password),
                ])->setRememberToken(Str::random(60));

                $user->save();

                event(new PasswordReset($user));
            }
        );

        if ($status === Password::PASSWORD_RESET) {
            return response()->json([
                'message' => 'Password has been reset successfully.',
            ]);
        }

        return response()->json([
            'message' => 'This password reset link is invalid or has expired. Please request a new one.',
        ], 400);
    }

    public function login(Request $request): JsonResponse
    {
        $request->validate([
            'email' => ['required', 'string', 'email'],
            'password' => ['required', 'string'],
        ]);

        $user = User::where('email', $request->email)->first();

        if (! $user || ! Hash::check($request->password, $user->password)) {
            return response()->json([
                'message' => 'Invalid credentials',
            ], 401);
        }

        if (! $user->email_verified_at) {
            return response()->json([
                'message' => 'Please verify your email before logging in.',
                'requires_verification' => true,
                'email' => $user->email,
            ], 403);
        }

        $token = $user->createToken('auth-token')->plainTextToken;

        return response()->json([
            'user' => $user,
            'token' => $token,
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

    public function updateProfile(Request $request): JsonResponse
    {
        $user = $request->user();

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', Rule::unique('users', 'email')->ignore($user->id)],
            'phone' => ['nullable', 'string', 'max:20'],
            'avatar' => ['nullable', 'string', 'max:40000'],
            'avatar_file' => [
                'nullable',
                'file',
                'max:5120',
                'mimes:jpg,jpeg,png,gif,webp',
            ],
            'current_password' => ['nullable', 'string', 'required_with:new_password'],
            'new_password' => ['nullable', 'string', 'min:8', 'confirmed'],
        ]);

        $user->name = $validated['name'];
        $user->email = $validated['email'];
        $user->phone = $validated['phone'] ?? null;

        if ($request->hasFile('avatar_file')) {
            $user->avatar = $this->cloudinary->uploadImage($request->file('avatar_file'), 'cinema/users/avatars');
        } elseif (array_key_exists('avatar', $validated)) {
            $user->avatar = $validated['avatar'];
        }

        if (! empty($validated['new_password'])) {
            if (! Hash::check($validated['current_password'], $user->password)) {
                return response()->json([
                    'message' => 'Current password is incorrect.',
                    'errors' => ['current_password' => ['The current password is incorrect.']],
                ], 422);
            }

            $user->password = Hash::make($validated['new_password']);
        }

        $user->save();

        return response()->json([
            'message' => 'Profile updated successfully.',
            'user' => $user,
        ]);
    }

    public function googleRedirect()
    {
        return Socialite::driver('google')
            ->stateless()
            ->redirect();
    }

    public function googleCallback(Request $request)
    {
        try {
            $googleUser = Socialite::driver('google')
                ->stateless()
                ->user();

            $user = User::where('email', $googleUser->getEmail())->first();

            if (! $user) {
                $user = User::create([
                    'name' => $googleUser->getName() ?? $googleUser->getEmail(),
                    'email' => $googleUser->getEmail(),
                    'password' => Str::random(40),
                    'role' => 'customer',
                    'phone' => null,
                    'google_id' => $googleUser->getId(),
                    'auth_provider' => 'google',
                    'avatar' => $googleUser->getAvatar(),
                    'email_verified_at' => now(),
                ]);
            } else {
                $user->update([
                    'google_id' => $googleUser->getId() ?? $user->google_id,
                    'auth_provider' => 'google',
                    'avatar' => $googleUser->getAvatar() ?? $user->avatar,
                    'email_verified_at' => $user->email_verified_at ?? now(),
                ]);
            }

            $token = $user->createToken('auth-token')->plainTextToken;

            $payload = [
                'token' => $token,
                'user' => $user->makeHidden([
                    'google_id',
                    'auth_provider',
                ])->toArray(),
            ];

            $frontendUrl = config('app.frontend_url') ?? 'http://localhost:5173';

            return redirect()->to(
                $frontendUrl.'/login?google='.urlencode(json_encode($payload))
            );
        } catch (Throwable $e) {
            Log::error('Google login failed: '.$e->getMessage());

            $frontendUrl = config('app.frontend_url') ?? 'http://localhost:5173';

            return redirect()->to($frontendUrl.'/login?google_error=1');
        }
    }
}
