<?php

use App\Http\Controllers\Admin\RoleController;
use App\Http\Controllers\Admin\UserController;
use App\Http\Controllers\Auth\OAuthController;
use App\Http\Controllers\SecurityController;
use Illuminate\Support\Facades\Route;
use Laravel\Fortify\Features;

use App\Models\User;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Auth\Events\Verified;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

Route::get('/', function () {
    if (Auth::check()) {
        return redirect()->route('dashboard');
    }

    return Inertia::render('welcome', [
        'canRegister' => Features::enabled(Features::registration()),
    ]);
})->name('home');

Route::get('/email/verify/{id}/{hash}', function (Request $request, string $id, string $hash) {
    /** @var User $user */
    $user = User::findOrFail($id);

    if (Auth::check() && ! hash_equals((string) Auth::id(), (string) $id)) {
        throw new AuthorizationException('Esta cuenta no coincide con el usuario autenticado.');
    }

    if (! hash_equals((string) $hash, sha1($user->getEmailForVerification()))) {
        throw new AuthorizationException('Enlace de verificación inválido.');
    }

    if (! $user->hasVerifiedEmail()) {
        $user->markEmailAsVerified();
        event(new Verified($user));
    }

    if (! Auth::check()) {
        Auth::login($user);
    }

    return redirect()->route('dashboard', ['verified' => 1]);
})->middleware(['signed', 'throttle:6,1'])->name('verification.verify');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::inertia('dashboard', 'dashboard')->name('dashboard');
});

Route::middleware(['auth'])->group(function () {
    Route::post('/logout-other-devices', [SecurityController::class, 'logoutOtherDevices'])
        ->name('logout-other-devices');
});

// Rutas de autenticación OAuth Microsoft
Route::controller(OAuthController::class)->group(function () {
    Route::get('/auth/microsoft', 'redirectToMicrosoft')->name('microsoft.login');
    Route::get('/auth/microsoft/callback', 'handleMicrosoftCallback')->name('microsoft.callback');

    // Alias compatibles para enlaces existentes
    Route::get('/auth/microsoft2', 'redirectToMicrosoft')->name('microsoft2.login');
    Route::get('/auth/microsoft2/callback', 'handleMicrosoftCallback')->name('microsoft2.callback');
});

// Panel de Administración (Roles y Usuarios)
Route::middleware(['auth', 'verified', 'role:Super Admin|Admin'])->prefix('admin')->name('admin.')->group(function () {
    Route::resource('users', UserController::class)->except(['create', 'show', 'edit']);
    Route::resource('roles', RoleController::class)->except(['create', 'show', 'edit']);
});

require __DIR__.'/settings.php';
