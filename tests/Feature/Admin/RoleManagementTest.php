<?php

namespace Tests\Feature\Admin;

use App\Models\User;
use Database\Seeders\RoleAndPermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class RoleManagementTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(RoleAndPermissionSeeder::class);
    }

    public function test_regular_user_cannot_access_roles(): void
    {
        $user = User::factory()->create();
        $user->assignRole('User');

        $response = $this->actingAs($user)->get('/admin/roles');
        $response->assertForbidden();
    }

    public function test_super_admin_can_view_roles(): void
    {
        $superAdmin = User::factory()->create();
        $superAdmin->assignRole('Super Admin');

        $response = $this->actingAs($superAdmin)->get('/admin/roles');
        $response->assertOk();
    }

    public function test_super_admin_can_create_new_role(): void
    {
        $superAdmin = User::factory()->create();
        $superAdmin->assignRole('Super Admin');

        $response = $this->actingAs($superAdmin)->post('/admin/roles', [
            'name' => 'Auditor',
            'permissions' => ['users.view', 'roles.view'],
        ]);

        $response->assertSessionHas('success');
        $this->assertDatabaseHas('roles', ['name' => 'Auditor']);

        $role = Role::findByName('Auditor');
        $this->assertTrue($role->hasPermissionTo('users.view'));
        $this->assertTrue($role->hasPermissionTo('roles.view'));
        $this->assertFalse($role->hasPermissionTo('users.delete'));
    }

    public function test_super_admin_can_update_role(): void
    {
        $superAdmin = User::factory()->create();
        $superAdmin->assignRole('Super Admin');

        $role = Role::create(['name' => 'Editor', 'guard_name' => 'web']);
        $role->syncPermissions(['users.view']);

        $response = $this->actingAs($superAdmin)->put("/admin/roles/{$role->id}", [
            'name' => 'Senior Editor',
            'permissions' => ['users.view', 'users.edit'],
        ]);

        $response->assertSessionHas('success');
        $this->assertDatabaseHas('roles', ['name' => 'Senior Editor']);

        $role->refresh();
        $this->assertTrue($role->hasPermissionTo('users.edit'));
    }

    public function test_system_roles_cannot_be_deleted(): void
    {
        $superAdmin = User::factory()->create();
        $superAdmin->assignRole('Super Admin');

        $role = Role::findByName('User');

        $response = $this->actingAs($superAdmin)->delete("/admin/roles/{$role->id}");
        $response->assertSessionHas('error');
        $this->assertDatabaseHas('roles', ['name' => 'User']);
    }

    public function test_custom_empty_role_can_be_deleted(): void
    {
        $superAdmin = User::factory()->create();
        $superAdmin->assignRole('Super Admin');

        $role = Role::create(['name' => 'TemporaryRole', 'guard_name' => 'web']);

        $response = $this->actingAs($superAdmin)->delete("/admin/roles/{$role->id}");
        $response->assertSessionHas('success');
        $this->assertDatabaseMissing('roles', ['name' => 'TemporaryRole']);
    }
}
