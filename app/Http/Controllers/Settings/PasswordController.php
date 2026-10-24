<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use App\Http\Requests\Settings\PasswordUpdateRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PasswordController extends Controller
{
    /**
     * Show the user's password settings page.
     */
    public function edit(Request $request): Response|RedirectResponse
    {
        if (! empty($request->user()?->microsoft_id) || $request->session()->get('auth_via_sso', false)) {
            return redirect()->route('profile.edit');
        }

        return Inertia::render('settings/password');
    }

    /**
     * Update the user's password.
     */
    public function update(PasswordUpdateRequest $request): RedirectResponse
    {
        if (! empty($request->user()?->microsoft_id) || $request->session()->get('auth_via_sso', false)) {
            abort(403, 'Las cuentas autenticadas mediante SSO no pueden actualizar su contraseña local.');
        }

        $request->user()->update([
            'password' => $request->password,
        ]);

        return back();
    }
}
