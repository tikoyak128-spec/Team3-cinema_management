<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class StaffMiddleware
{
    public function handle(
        Request $request,
        Closure $next
    ): Response {

        if (! $request->user()) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthenticated.',
            ], 401);
        }

        if (! in_array($request->user()->role, ['staff', 'admin'], true)) {
            return response()->json([
                'success' => false,
                'message' => 'Access denied. Staff only.',
            ], 403);
        }

        return $next($request);
    }
}
