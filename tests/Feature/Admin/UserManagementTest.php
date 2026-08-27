<?php

namespace Tests\Feature\Admin;

use App\Models\User;
use Database\Seeders\RoleAndPermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class UserManagementTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(RoleAndPermissionSeeder::class);
    }

    public function test_guests_cannot_access_admin_users(): void
    {
        $response = $this->get('/admin/users');
        $response->assertRedirect(route('login'));
    }

    public function test_regular_users_cannot_access_admin_users(): void
    {
        $user = User::factory()->create();
        $user->assignRole('User');

        $response = $this->actingAs($user)->get('/admin/users');
        $response->assertForbidden();
    }

    public function test_admin_can_view_users_index(): void
    {
        $admin = User::factory()->create();
        $admin->assignRole('Admin');

        $response = $this->actingAs($admin)->get('/admin/users');
        $response->assertOk();
    }

    public function test_admin_can_create_a_new_user(): void
    {
        $admin = User::factory()->create();
        $admin->assignRole('Admin');

        $response = $this->actingAs($admin)->post('/admin/users', [
            'name' => 'Jane Doe',
            'email' => 'jane@example.com',
            'password' => 'password123',
            'roles' => ['User'],
        ]);

        $response->assertSessionHas('success');
        $this->assertDatabaseHas('users', ['email' => 'jane@example.com']);

        $createdUser = User::where('email', 'jane@example.com')->first();
        $this->assertTrue($createdUser->hasRole('User'));
    }

    public function test_admin_can_update_a_user(): void
    {
        $admin = User::factory()->create();
        $admin->assignRole('Admin');

        $targetUser = User::factory()->create([
            'name' => 'Old Name',
            'email' => 'old@example.com',
        ]);
        $targetUser->assignRole('User');

        $response = $this->actingAs($admin)->put("/admin/users/{$targetUser->id}", [
            'name' => 'New Name',
            'email' => 'new@example.com',
            'roles' => ['Admin'],
        ]);

        $response->assertSessionHas('success');
        $this->assertDatabaseHas('users', [
            'id' => $targetUser->id,
            'name' => 'New Name',
            'email' => 'new@example.com',
        ]);

        $targetUser->refresh();
        $this->assertTrue($targetUser->hasRole('Admin'));
    }

    public function test_user_cannot_delete_themselves(): void
    {
        $admin = User::factory()->create();
        $admin->assignRole('Admin');

        $response = $this->actingAs($admin)->delete("/admin/users/{$admin->id}");
        $response->assertSessionHas('error');
        $this->assertDatabaseHas('users', ['id' => $admin->id]);
    }

    public function test_admin_can_delete_another_user(): void
    {
        $admin = User::factory()->create();
        $admin->assignRole('Admin');

        $userToDelete = User::factory()->create();
        $userToDelete->assignRole('User');

        $response = $this->actingAs($admin)->delete("/admin/users/{$userToDelete->id}");
        $response->assertSessionHas('success');
        $this->assertDatabaseMissing('users', ['id' => $userToDelete->id]);
    }
}
