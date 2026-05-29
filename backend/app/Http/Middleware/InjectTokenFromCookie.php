<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class InjectTokenFromCookie
{
    /**
     * Handle an incoming request.
     *
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        if ($request->hasCookie('auth_token') && !$request->bearerToken()) {
            $request->headers->set('Authorization', 'Bearer ' . $request->cookie('auth_token'));
        }
        return $next($request);
    }
}
