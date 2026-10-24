<?php

namespace Tests\Feature\Auth;

use App\Models\User;
use Database\Seeders\RoleAndPermissionSeeder;
use Exception;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Socialite\Facades\Socialite;
use Laravel\Socialite\Two\User as SocialiteUser;
use Mockery;
use Tests\TestCase;

class OAuthTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(RoleAndPermissionSeeder::class);
    }

    public function test_microsoft_redirect_generates_redirect_response(): void
    {
        $provider = Mockery::mock('Laravel\Socialite\Two\AbstractProvider');
        $provider->shouldReceive('redirect')->once()->andReturn(redirect('https://login.microsoftonline.com/oauth2/v2.0/authorize'));

        Socialite::shouldReceive('driver')->with('microsoft')->andReturn($provider);

        $response = $this->get('/auth/microsoft');
        $response->assertRedirect('https://login.microsoftonline.com/oauth2/v2.0/authorize');
    }

    public function test_microsoft_callback_creates_new_user_and_logs_in(): void
    {
        $socialiteUser = new SocialiteUser;
        $socialiteUser->id = 'ms-12345';
        $socialiteUser->name = 'Microsoft User';
        $socialiteUser->email = 'msuser@example.com';

        $provider = Mockery::mock('Laravel\Socialite\Two\AbstractProvider');
        $provider->shouldReceive('user')->once()->andReturn($socialiteUser);

        Socialite::shouldReceive('driver')->with('microsoft')->andReturn($provider);

        $response = $this->get('/auth/microsoft/callback');

        $response->assertRedirect(route('dashboard'));
        $this->assertAuthenticated();

        $this->assertDatabaseHas('users', [
            'email' => 'msuser@example.com',
            'microsoft_id' => 'ms-12345',
        ]);

        $user = User::where('email', 'msuser@example.com')->first();
        $this->assertTrue($user->hasRole('User'));
    }

    public function test_microsoft_callback_links_to_existing_user(): void
    {
        $existingUser = User::factory()->create([
            'email' => 'existing@example.com',
            'microsoft_id' => null,
        ]);

        $socialiteUser = new SocialiteUser;
        $socialiteUser->id = 'ms-existing-999';
        $socialiteUser->name = 'Existing User';
        $socialiteUser->email = 'existing@example.com';

        $provider = Mockery::mock('Laravel\Socialite\Two\AbstractProvider');
        $provider->shouldReceive('user')->once()->andReturn($socialiteUser);

        Socialite::shouldReceive('driver')->with('microsoft')->andReturn($provider);

        $response = $this->get('/auth/microsoft/callback');

        $response->assertRedirect(route('dashboard'));
        $this->assertAuthenticatedAs($existingUser);

        $existingUser->refresh();
        $this->assertEquals('ms-existing-999', $existingUser->microsoft_id);
    }

    public function test_microsoft_callback_handles_user_cancellation(): void
    {
        $response = $this->get('/auth/microsoft/callback?error=access_denied&error_description=User+cancelled');

        $response->assertRedirect(route('login'));
        $response->assertSessionHasErrors(['email']);
        $this->assertGuest();
    }

    public function test_microsoft_callback_handles_socialite_exceptions_gracefully(): void
    {
        $provider = Mockery::mock('Laravel\Socialite\Two\AbstractProvider');
        $provider->shouldReceive('user')->once()->andThrow(new Exception('OAuth network timeout'));

        Socialite::shouldReceive('driver')->with('microsoft')->andReturn($provider);

        $response = $this->get('/auth/microsoft/callback');

        $response->assertRedirect(route('login'));
        $response->assertSessionHasErrors(['email']);
        $this->assertGuest();
    }

    public function test_microsoft_callback_redirects_to_two_factor_challenge_when_user_has_two_factor_enabled(): void
    {
        $existingUser = User::factory()->sso()->withTwoFactor()->create([
            'email' => 'twofactor@example.com',
            'microsoft_id' => 'ms-2fa-user',
        ]);

        $socialiteUser = new SocialiteUser;
        $socialiteUser->id = 'ms-2fa-user';
        $socialiteUser->name = '2FA User';
        $socialiteUser->email = 'twofactor@example.com';

        $provider = Mockery::mock('Laravel\Socialite\Two\AbstractProvider');
        $provider->shouldReceive('user')->once()->andReturn($socialiteUser);

        Socialite::shouldReceive('driver')->with('microsoft')->andReturn($provider);

        $response = $this->get('/auth/microsoft/callback');

        $response->assertRedirect(route('two-factor.login'));
        $this->assertGuest();
        $this->assertEquals($existingUser->id, session('login.id'));
    }
}
