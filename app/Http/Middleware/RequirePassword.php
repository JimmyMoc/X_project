<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Auth\Middleware\RequirePassword as BaseRequirePassword;

class RequirePassword extends BaseRequirePassword
{
    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure  $next
     * @param  string|null  $redirectToRoute
     * @param  int|null  $passwordTimeoutSeconds
     * @return mixed
     */
    public function handle($request, Closure $next, $redirectToRoute = null, $passwordTimeoutSeconds = null)
    {
        $user = $request->user();

        // Si el usuario es de cuenta SSO o inició sesión mediante SSO, la confirmación de contraseña se omite
        if ($user && (! empty($user->microsoft_id) || $request->session()->get('auth_via_sso', false))) {
            return $next($request);
        }

        return parent::handle($request, $next, $redirectToRoute, $passwordTimeoutSeconds);
    }
}
