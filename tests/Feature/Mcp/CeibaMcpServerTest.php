<?php

namespace Tests\Feature\Mcp;

use App\Mcp\Servers\CeibaServer;
use App\Mcp\Tools\CrearUsuario;
use App\Mcp\Tools\RestablecerContrasena;
use App\Models\User;
use Database\Seeders\RoleAndPermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class CeibaMcpServerTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(RoleAndPermissionSeeder::class);
    }

    public function test_crear_usuario_tool_creates_user_with_default_role(): void
    {
        CeibaServer::tool(CrearUsuario::class, [
            'name' => 'Carlos López',
            'email' => 'carlos@ceiba.test',
            'password' => 'secret123',
        ])
            ->assertOk()
            ->assertSee('creado exitosamente');

        $this->assertDatabaseHas('users', ['email' => 'carlos@ceiba.test']);
        $user = User::where('email', 'carlos@ceiba.test')->first();
        $this->assertTrue($user->hasRole('User'));
        $this->assertTrue(Hash::check('secret123', $user->password));
    }

    public function test_crear_usuario_tool_with_custom_role(): void
    {
        CeibaServer::tool(CrearUsuario::class, [
            'name' => 'Admin User',
            'email' => 'admin_mcp@ceiba.test',
            'password' => 'secret123',
            'role' => 'Admin',
        ])
            ->assertOk()
            ->assertSee('creado exitosamente');

        $this->assertDatabaseHas('users', ['email' => 'admin_mcp@ceiba.test']);
        $user = User::where('email', 'admin_mcp@ceiba.test')->first();
        $this->assertTrue($user->hasRole('Admin'));
    }

    public function test_crear_usuario_prevents_duplicate_email(): void
    {
        User::factory()->create(['email' => 'duplicado@ceiba.test']);

        CeibaServer::tool(CrearUsuario::class, [
            'name' => 'Carlos 2',
            'email' => 'duplicado@ceiba.test',
            'password' => 'secret123',
        ])
            ->assertHasErrors(['el correo \'duplicado@ceiba.test\' ya está registrado']);
    }

    public function test_restablecer_contrasena_updates_user_password(): void
    {
        $user = User::factory()->create([
            'email' => 'usuario@ceiba.test',
            'password' => Hash::make('antigua_clave'),
        ]);

        CeibaServer::tool(RestablecerContrasena::class, [
            'email' => 'usuario@ceiba.test',
            'new_password' => 'nueva_clave_super_segura',
        ])
            ->assertOk()
            ->assertSee('actualizada exitosamente');

        $user->refresh();
        $this->assertTrue(Hash::check('nueva_clave_super_segura', $user->password));
    }

    public function test_restablecer_contrasena_rejects_non_existent_email(): void
    {
        CeibaServer::tool(RestablecerContrasena::class, [
            'email' => 'noexiste@ceiba.test',
            'new_password' => 'nueva_clave',
        ])
            ->assertHasErrors(['no existe ningún usuario registrado']);
    }
}
