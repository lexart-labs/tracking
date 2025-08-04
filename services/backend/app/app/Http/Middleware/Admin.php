<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Contracts\Auth\Factory as Auth;

class Admin
{
    protected $auth;
    
    public function __construct(Auth $auth)
    {
        $this->auth = $auth;
    }

    public function handle($request, Closure $next, $guard = null)
    {
        if ($this->auth->guard($guard)->guest()) {
            return response()->json([
                'message' => 'Unauthorized'
            ], 401);
        }
        
        $user = $this->auth->guard($guard)->user();

        if ($user->role !== 'admin') {
            return response()->json([
                'message' => 'Unauthorized'
            ], 401);
            
        }

        return $next($request);
    }
}
