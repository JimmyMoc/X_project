<?php

use App\Http\Controllers\Admin\RoleController;
use App\Http\Controllers\Admin\UserController;
use App\Http\Controllers\Auth\OAuthController;
use App\Http\Controllers\SecurityController;
use Illuminate\Support\Facades\Route;
use Laravel\Fortify\Features;

Route::inertia('/', 'welcome', [
    'canRegister' => Features::enabled(Features::registration()),
])->name('home');

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
