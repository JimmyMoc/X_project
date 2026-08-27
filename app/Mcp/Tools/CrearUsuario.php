<?php

namespace App\Mcp\Tools;

use App\Models\User;
use Illuminate\Contracts\JsonSchema\JsonSchema;
use Illuminate\JsonSchema\Types\Type;
use Illuminate\Support\Facades\Hash;
use Laravel\Mcp\Request;
use Laravel\Mcp\Response;
use Laravel\Mcp\Server\Attributes\Description;
use Laravel\Mcp\Server\Attributes\Name;
use Laravel\Mcp\Server\Tool;
use Laravel\Mcp\Server\Tools\Annotations\IsDestructive;
use Laravel\Mcp\Server\Tools\Annotations\IsOpenWorld;
use Spatie\Permission\Models\Role;
use Throwable;

#[Name('crear_usuario')]
#[Description('Crea un nuevo usuario en el sistema con nombre, correo, contraseña y rol opcional.')]
#[IsOpenWorld]
#[IsDestructive]
class CrearUsuario extends Tool
{
    /**
     * Handle the tool request.
     */
    public function handle(Request $request): Response
    {
        try {
            $name = $request->get('name');
            $email = $request->get('email');
            $password = $request->get('password');
            $roleName = $request->get('role', 'User');

            if (! $name || ! $email || ! $password) {
                return Response::error('Error: faltan parámetros obligatorios (name, email o password).');
            }

            if (User::where('email', $email)->exists()) {
                return Response::error("Error: el correo '{$email}' ya está registrado en el sistema.");
            }

            $user = User::create([
                'name' => $name,
                'email' => $email,
                'password' => Hash::make($password),
                'email_verified_at' => now(),
            ]);

            $assignedRoleName = 'Sin Rol';

            if (class_exists(Role::class)) {
                // Búsqueda case-insensitive (acepta 'user', 'admin', 'User', 'Admin', etc.)
                $normalizedRole = strtolower(trim((string) $roleName));
                $role = Role::whereRaw('LOWER(name) = ?', [$normalizedRole])->first();

                if (! $role) {
                    $role = Role::where('name', 'User')->first();
                }

                if ($role) {
                    $user->assignRole($role);
                    $assignedRoleName = $role->name;
                }
            }

            return Response::text("Usuario '{$user->name}' (ID: {$user->id}, Email: {$user->email}) creado exitosamente con rol '{$assignedRoleName}'.");
        } catch (Throwable $e) {
            return Response::error("Error de base de datos o ejecución al crear usuario: {$e->getMessage()}");
        }
    }

    /**
     * Get the tool's input schema.
     *
     * @return array<string, Type>
     */
    public function schema(JsonSchema $schema): array
    {
        return [
            'name' => $schema->string()->description('Nombre completo del usuario')->required(),
            'email' => $schema->string()->description('Correo electrónico único del usuario')->required(),
            'password' => $schema->string()->description('Contraseña para la cuenta del usuario')->required(),
            'role' => $schema->string()->description('Rol a asignar (ej. Super Admin, Admin, User). Por defecto: User'),
        ];
    }
}
