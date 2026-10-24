<?php

namespace Tests\Feature\Settings;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Laravel\Fortify\Features;
use Tests\TestCase;

class TwoFactorAuthenticationTest extends TestCase
{
    use RefreshDatabase;

    public function test_two_factor_settings_page_can_be_rendered()
    {
        $this->skipUnlessFortifyFeature(Features::twoFactorAuthentication());

        Features::twoFactorAuthentication([
            'confirm' => true,
            'confirmPassword' => true,
        ]);

        $user = User::factory()->create();

        $this->actingAs($user)
            ->withSession(['auth.password_confirmed_at' => time()])
            ->get(route('two-factor.show'))
            ->assertInertia(fn (Assert $page) => $page
                ->component('settings/two-factor')
                ->where('twoFactorEnabled', false),
            );
    }

    public function test_two_factor_settings_page_requires_password_confirmation_when_enabled()
    {
        $this->skipUnlessFortifyFeature(Features::twoFactorAuthentication());

        $user = User::factory()->create();

        Features::twoFactorAuthentication([
            'confirm' => true,
            'confirmPassword' => true,
        ]);

        $response = $this->actingAs($user)
            ->get(route('two-factor.show'));

        $response->assertRedirect(route('password.confirm'));
    }

    public function test_two_factor_settings_page_does_not_requires_password_confirmation_when_disabled()
    {
        $this->skipUnlessFortifyFeature(Features::twoFactorAuthentication());

        $user = User::factory()->create();

        Features::twoFactorAuthentication([
            'confirm' => true,
            'confirmPassword' => false,
        ]);

        $this->actingAs($user)
            ->get(route('two-factor.show'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('settings/two-factor'),
            );
    }

    public function test_two_factor_settings_page_returns_forbidden_response_when_two_factor_is_disabled()
    {
        $this->skipUnlessFortifyFeature(Features::twoFactorAuthentication());

        config(['fortify.features' => []]);

        $user = User::factory()->create();

        $this->actingAs($user)
            ->withSession(['auth.password_confirmed_at' => time()])
            ->get(route('two-factor.show'))
            ->assertForbidden();
    }

    public function test_sso_users_can_access_two_factor_settings_without_password_confirmation()
    {
        $this->skipUnlessFortifyFeature(Features::twoFactorAuthentication());

        Features::twoFactorAuthentication([
            'confirm' => true,
            'confirmPassword' => true,
        ]);

        $user = User::factory()->sso()->create();

        $this->actingAs($user)
            ->get(route('two-factor.show'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('settings/two-factor')
                ->where('twoFactorEnabled', false),
            );
    }

    public function test_sso_users_can_enable_two_factor_authentication_without_password_confirmation()
    {
        $this->skipUnlessFortifyFeature(Features::twoFactorAuthentication());

        Features::twoFactorAuthentication([
            'confirm' => true,
            'confirmPassword' => true,
        ]);

        $user = User::factory()->sso()->create();

        $this->actingAs($user)
            ->post(route('two-factor.enable'))
            ->assertRedirect();

        $this->assertNotNull($user->fresh()->two_factor_secret);
    }

    public function test_sso_users_can_fetch_qr_code_without_password_confirmation()
    {
        $this->skipUnlessFortifyFeature(Features::twoFactorAuthentication());

        Features::twoFactorAuthentication([
            'confirm' => true,
            'confirmPassword' => true,
        ]);

        $user = User::factory()->sso()->withTwoFactor()->create();

        $this->actingAs($user)
            ->getJson(route('two-factor.qr-code'))
            ->assertOk()
            ->assertJsonStructure(['svg']);
    }
}
