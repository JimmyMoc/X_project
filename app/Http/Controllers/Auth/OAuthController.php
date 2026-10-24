<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Laravel\Fortify\Events\TwoFactorAuthenticationChallenged;
use Laravel\Socialite\Facades\Socialite;
use Spatie\Permission\Models\Role;
use Symfony\Component\HttpFoundation\RedirectResponse as SymfonyRedirectResponse;
use Throwable;

class OAuthController extends Controller
{
    /**
     * Redirige al usuario al portal de autenticación de Microsoft.
     */
    public function redirectToMicrosoft(): SymfonyRedirectResponse|RedirectResponse
    {
        try {
            return Socialite::driver('microsoft')->redirect();
        } catch (Throwable $e) {
            Log::error('Error al redirigir a Microsoft OAuth: '.$e->getMessage(), [
                'exception' => $e,
            ]);

            return redirect()->route('login')->withErrors([
                'email' => 'No fue posible conectar con el servicio de autenticación de Microsoft.',
            ]);
        }
    }

    /**
     * Procesa la respuesta (callback) de Microsoft OAuth de manera segura con manejo de excepciones.
     */
    public function handleMicrosoftCallback(Request $request): RedirectResponse
    {
        // Validar si el usuario canceló la autenticación o Microsoft devolvió un error
        if ($request->has('error') || $request->has('error_description')) {
            Log::warning('Cancelación o error en Microsoft OAuth Callback', [
                'error' => $request->get('error'),
                'description' => $request->get('error_description'),
            ]);

            return redirect()->route('login')->withErrors([
                'email' => 'El inicio de sesión con Microsoft fue cancelado o denegado.',
            ]);
        }

        try {
            /** @var \Laravel\Socialite\Two\User $microsoftUser */
            $microsoftUser = Socialite::driver('microsoft')->user();

            $email = $microsoftUser->getEmail();
            $microsoftId = (string) $microsoftUser->getId();
            $name = $microsoftUser->getName() ?: (explode('@', (string) $email)[0] ?? 'Usuario Microsoft');

            if (! $email) {
                return redirect()->route('login')->withErrors([
                    'email' => 'No se pudo obtener una dirección de correo válida desde tu cuenta de Microsoft.',
                ]);
            }

            // Buscar usuario existente por correo o por microsoft_id
            $user = User::where('email', $email)
                ->orWhere('microsoft_id', $microsoftId)
                ->first();

            if ($user) {
                // Actualizar identificador de Microsoft si aún no estaba vinculado
                $user->update([
                    'microsoft_id' => $microsoftId,
                    'name' => $user->name ?: $name,
                    'email_verified_at' => $user->email_verified_at ?? now(),
                ]);
            } else {
                // Crear nueva cuenta vinculada
                $user = User::create([
                    'name' => $name,
                    'email' => $email,
                    'microsoft_id' => $microsoftId,
                    'password' => Hash::make(Str::random(32)),
                    'email_verified_at' => now(),
                ]);

                // Asignar rol por defecto 'User' si el sistema RBAC está presente
                if (class_exists(Role::class)) {
                    $defaultRole = Role::where('name', 'User')->first();
                    if ($defaultRole) {
                        $user->assignRole($defaultRole);
                    }
                }
            }

            // Si el usuario tiene MFA activado en el sistema, iniciar el flujo de desafío 2FA
            if ($user->hasEnabledTwoFactorAuthentication()) {
                $request->session()->put([
                    'login.id' => $user->getKey(),
                    'login.remember' => true,
                    'auth_via_sso' => true,
                ]);

                TwoFactorAuthenticationChallenged::dispatch($user);

                return redirect()->route('two-factor.login');
            }

            Auth::login($user, remember: true);
            $request->session()->regenerate();
            $request->session()->put('auth_via_sso', true);
            $request->session()->put('auth.password_confirmed_at', time());

            return redirect()->intended(route('dashboard'))
                ->with('message', 'Has iniciado sesión con Microsoft exitosamente.');
        } catch (Throwable $e) {
            Log::error('Error al procesar callback de Microsoft OAuth: '.$e->getMessage(), [
                'trace' => $e->getTraceAsString(),
            ]);

            return redirect()->route('login')->withErrors([
                'email' => 'Ocurrió un error al procesar el inicio de sesión con Microsoft. Inténtalo de nuevo.',
            ]);
        }
    }
}
