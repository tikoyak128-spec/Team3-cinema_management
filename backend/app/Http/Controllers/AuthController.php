<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Password;
use Laravel\Socialite\Facades\Socialite;
use App\Mail\PasswordOtpMail;
use Illuminate\Support\Facades\Mail;
use Carbon\Carbon;

class AuthController extends Controller
{
    public function register(Request $request)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', 'unique:users,email'],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
            'phone' => ['nullable', 'string', 'max:20'],
        ]);

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'phone' => $validated['phone'] ?? null,
            'google_id' => null,
            'auth_provider' => 'email',
            'role' => 'customer',
        ]);

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'success' => true,
            'message' => 'Registration successful',
            'user' => $user,
            'token' => $token,
        ], 201);
    }

    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        $user = User::where('email', $request->email)->first();

        if (!$user) {
            return response()->json([
                'status' => false,
                'message' => 'Invalid email or password'
            ], 401);
        }

        if (!Hash::check($request->password, $user->password)) {
            return response()->json([
                'status' => false,
                'message' => 'Invalid email or password'
            ], 401);
        }

        $otp = random_int(100000, 999999);

        $user->otp = $otp;
        $user->otp_expires_at = Carbon::now()->addMinutes(5);
        $user->save();

        Mail::to($user->email)->send(new PasswordOtpMail($otp, $user->name));

        return response()->json([
            'status' => true,
            'message' => 'Login successful. OTP has been sent to your email.',
            'email' => $user->email
        ]);
    }

    public function user(Request $request)
    {
        return response()->json([
            'success' => true,
            'user' => $request->user(),
        ]);
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'success' => true,
            'message' => 'Logout successful',
        ]);
    }

    public function forgotPassword(Request $request)
    {
        $request->validate([
            'email' => ['required', 'email'],
        ]);

        $user = User::where('email', $request->email)->first();

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'No account found with this email.',
            ], 404);
        }

        if ($user->auth_provider === 'google') {
            return response()->json([
                'success' => false,
                'message' => 'This account uses Google login. Please login with Google.',
            ], 400);
        }

        Password::createUrlUsing(function ($notifiable, $token) {
            $frontendUrl = config('app.frontend_url') ?? 'http://localhost:5173';
            return $frontendUrl . '/reset-password?token=' . $token
                . '&email=' . urlencode($notifiable->getEmailForPasswordReset());
        });

        $status = Password::sendResetLink([
            'email' => $request->email,
        ]);

        return response()->json([
            'success' => $status === Password::RESET_LINK_SENT,
            'status' => $status,
            'message' => $status === Password::RESET_LINK_SENT
                ? 'Password reset link has been sent to your email.'
                : 'Unable to send password reset link.',
        ], $status === Password::RESET_LINK_SENT ? 200 : 400);
    }

    public function resetPassword(Request $request)
    {
        $request->validate([
            'token' => ['required', 'string'],
            'email' => ['required', 'email'],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
        ]);

        $user = User::where('email', $request->email)->first();

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'User not found.',
            ], 404);
        }

        if ($user->auth_provider === 'google') {
            return response()->json([
                'success' => false,
                'message' => 'Google accounts cannot reset password here.',
            ], 400);
        }

        $status = Password::reset(
            [
                'email' => $request->email,
                'password' => $request->password,
                'password_confirmation' => $request->password_confirmation,
                'token' => $request->token,
            ],
            function ($user, $password) {
                $user->password = Hash::make($password);
                $user->auth_provider = 'email';
                $user->save();
            }
        );

        if ($status === Password::PASSWORD_RESET) {
            return response()->json([
                'success' => true,
                'message' => 'Password has been reset successfully.',
            ]);
        }

        return response()->json([
            'success' => false,
            'message' => 'Invalid or expired reset token.',
        ], 400);
    }

    public function googleRedirect()
    {
        return Socialite::driver('google')
            ->redirect();
    }

    public function googleCallback()
    {
        try {
            $googleUser = Socialite::driver('google')
                ->user();

            $user = User::where('google_id', $googleUser->getId())->first();

            if (!$user) {
                $existingUser = User::where('email', $googleUser->getEmail())->first();

                if ($existingUser) {
                    $existingUser->update([
                        'google_id' => $googleUser->getId(),
                        'auth_provider' => 'google',
                    ]);
                    $user = $existingUser;
                } else {
                    $user = User::create([
                        'name' => $googleUser->getName(),
                        'email' => $googleUser->getEmail(),
                        'password' => null,
                        'google_id' => $googleUser->getId(),
                        'auth_provider' => 'google',
                        'role' => 'customer',
                        'phone' => null,
                    ]);
                }
            }

            $token = $user->createToken('auth_token')->plainTextToken;

            $frontendUrl = config('app.frontend_url') ?? 'http://localhost:5173';

            return redirect()->to(
                $frontendUrl . '/oauth/google/callback'
                . '?token=' . $token
                . '&user=' . urlencode($user->toJson())
            );
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Google login failed.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function resendOtp(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
        ]);

        $user = User::where('email', $request->email)->first();

        if (!$user) {
            return response()->json([
                'status' => false,
                'message' => 'User not found'
            ], 404);
        }

        $otp = random_int(100000, 999999);

        $user->otp = $otp;
        $user->otp_expires_at = Carbon::now()->addMinutes(5);
        $user->save();

        Mail::to($user->email)->send(new PasswordOtpMail($otp, $user->name));

        return response()->json([
            'status' => true,
            'message' => 'A new OTP has been sent to your email.',
            'email' => $user->email
        ]);
    }

    public function verifyOtp(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'otp' => 'required|digits:6',
        ]);

        $user = User::where('email', $request->email)->first();

        if (!$user) {
            return response()->json([
                'status' => false,
                'message' => 'User not found'
            ], 404);
        }

        if ($user->otp != $request->otp) {
            return response()->json([
                'status' => false,
                'message' => 'Invalid OTP'
            ], 401);
        }

        if (!$user->otp_expires_at || Carbon::now()->greaterThan($user->otp_expires_at)) {
            return response()->json([
                'status' => false,
                'message' => 'OTP has expired'
            ], 401);
        }

        $user->otp = null;
        $user->otp_expires_at = null;
        $user->save();

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'status' => true,
            'message' => 'OTP verified successfully',
            'user' => $user,
            'token' => $token
        ]);
    }
}
