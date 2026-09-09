<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class VerificationController extends Controller
{
    public function verify(Request $request): JsonResponse
    {
        $user = User::findOrFail($request->route('id'));

        if (!$user->hasVerifiedEmail()) {
            if (!hash_equals((string) $request->route('hash'), sha1($user->getEmailForVerification()))) {
                return response()->json([
                    'message' => 'Invalid verification link.',
                ], 400);
            }

            $user->markEmailAsVerified();
        }

        return response()->json([
            'message' => 'Email verified successfully.',
        ]);
    }

    public function resend(Request $request): JsonResponse
    {
        $user = $request->user();

        if ($user->hasVerifiedEmail()) {
            return response()->json([
                'message' => 'Email is already verified.',
            ], 200);
        }

        $user->sendEmailVerificationNotification();

        return response()->json([
            'message' => 'Verification link sent.',
        ]);
    }
}